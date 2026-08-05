"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Archive, LoaderCircle, PackageOpen, Pencil, Plus, Search, Sparkles, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { dosageForms, priceUnits } from "@/lib/validations/drug.validation";
import { drugCategories, storeLocations } from "../drug-form";

type Price = { _id?: string; unit: (typeof priceUnits)[number]; customUnit?: string; quantityPerUnit: number; sellingPrice: number; isPrimary: boolean };
type Drug = { _id: string; name: string; commonName?: string; description?: string; category: string; dosageForm: (typeof dosageForms)[number]; strength?: string; manufacturer?: string; location: string; quantity: number; isAvailable: boolean; prices: Price[] };
type ApiResponse = { success: boolean; message?: string; data?: Drug[]; pagination?: { total: number } };
const money = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 2 });
const label = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

export function DrugManager() {
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Drug | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ drug: Drug; permanent: boolean } | null>(null);

  const loadDrugs = useCallback(async (term = "") => {
    setLoading(true); setError("");
    try {
      const response = await fetch(`/api/drugs?limit=100${term ? `&search=${encodeURIComponent(term)}` : ""}`);
      const result = (await response.json()) as ApiResponse;
      if (!response.ok || !result.data) throw new Error(result.message || "Unable to load drugs.");
      setDrugs(result.data);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to load drugs."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void loadDrugs(), 0);
    return () => window.clearTimeout(initialLoad);
  }, [loadDrugs]);

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    const term = search.trim();
    setActiveSearch(term);
    void loadDrugs(term);
  }

  return <>
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <form onSubmit={submitSearch} className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><Input value={search} onChange={(event) => setSearch(event.target.value)} className="pl-9" placeholder="Search by brand or common name…" aria-label="Search drugs" /></div>
        <Button type="submit">Search drugs</Button>
        {activeSearch && <Button type="button" variant="ghost" onClick={() => { setSearch(""); setActiveSearch(""); void loadDrugs(); }}>Clear</Button>}
      </form>
    </div>

    <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4"><div><h2 className="font-semibold text-slate-950">Drug catalogue</h2><p className="mt-0.5 text-sm text-slate-500">{loading ? "Loading records…" : `${drugs.length} ${drugs.length === 1 ? "drug" : "drugs"}${activeSearch ? " found" : ""}`}</p></div></div>
      {loading ? <div className="flex min-h-64 items-center justify-center gap-2 text-sm text-slate-500"><LoaderCircle className="size-5 animate-spin" /> Loading drugs…</div>
      : error ? <div className="p-10 text-center"><p className="text-sm text-red-600">{error}</p><Button className="mt-4" variant="outline" onClick={() => void loadDrugs(activeSearch)}>Try again</Button></div>
      : drugs.length === 0 ? <div className="flex min-h-64 flex-col items-center justify-center p-8 text-center"><PackageOpen className="mb-3 size-9 text-slate-300" /><p className="font-medium text-slate-800">No drugs found</p><p className="mt-1 text-sm text-slate-500">Try another name or add a new drug.</p></div>
      : <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3 font-semibold">Drug</th><th className="px-5 py-3 font-semibold">Category</th><th className="px-5 py-3 font-semibold">Primary price</th><th className="px-5 py-3 font-semibold">Stock</th><th className="px-5 py-3 font-semibold">Location</th><th className="px-5 py-3 text-right font-semibold">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{drugs.map((drug) => {
        const primary = drug.prices.find((price) => price.isPrimary) ?? drug.prices[0];
        return <tr key={drug._id} className="hover:bg-slate-50/70"><td className="px-5 py-4"><p className="font-semibold text-slate-900">{drug.name}</p><p className="mt-0.5 text-xs text-slate-500">{[drug.commonName, drug.strength, label(drug.dosageForm)].filter(Boolean).join(" · ")}</p></td><td className="px-5 py-4 text-slate-600">{drug.category}</td><td className="px-5 py-4"><p className="font-semibold text-slate-900">{primary ? money.format(primary.sellingPrice) : "—"}</p>{primary && <p className="text-xs text-slate-500">per {primary.customUnit || primary.unit}</p>}</td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${drug.isAvailable ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{drug.quantity} in stock</span></td><td className="px-5 py-4 text-slate-600">{drug.location}</td><td className="px-5 py-4"><div className="flex items-center justify-end gap-1"><Button variant="outline" size="sm" onClick={() => setEditing(structuredClone(drug))}><Pencil /> Edit</Button><Button variant="ghost" size="icon" title="Archive drug" aria-label={`Archive ${drug.name}`} onClick={() => setDeleteTarget({ drug, permanent: false })}><Archive /></Button><Button variant="destructive" size="icon" title="Permanently delete drug" aria-label={`Permanently delete ${drug.name}`} onClick={() => setDeleteTarget({ drug, permanent: true })}><Trash2 /></Button></div></td></tr>;
      })}</tbody></table></div>}
    </div>
    {editing && <EditDrug drug={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); void loadDrugs(activeSearch); }} />}
    {deleteTarget && <DeleteConfirmation target={deleteTarget} onClose={() => setDeleteTarget(null)} onDeleted={() => { setDeleteTarget(null); void loadDrugs(activeSearch); }} />}
  </>;
}

function DeleteConfirmation({ target, onClose, onDeleted }: { target: { drug: Drug; permanent: boolean }; onClose: () => void; onDeleted: () => void }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function confirmDelete() {
    setDeleting(true); setError("");
    try {
      const response = await fetch(`/api/drugs/${target.drug._id}${target.permanent ? "?permanent=true" : ""}`, { method: "DELETE" });
      const result = (await response.json()) as { message?: string };
      if (!response.ok) throw new Error(result.message || "Unable to remove drug.");
      onDeleted();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to remove drug."); }
    finally { setDeleting(false); }
  }

  return <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4" role="alertdialog" aria-modal="true" aria-labelledby="delete-title" aria-describedby="delete-description" onMouseDown={(event) => { if (event.target === event.currentTarget && !deleting) onClose(); }}>
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
      <div className={`mb-4 flex size-11 items-center justify-center rounded-full ${target.permanent ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>{target.permanent ? <Trash2 className="size-5" /> : <Archive className="size-5" />}</div>
      <h2 id="delete-title" className="text-lg font-semibold text-slate-950">{target.permanent ? "Permanently delete drug?" : "Archive this drug?"}</h2>
      <p id="delete-description" className="mt-2 text-sm leading-6 text-slate-600">{target.permanent ? <><strong className="font-semibold text-slate-800">{target.drug.name}</strong> will be removed from the database. This action cannot be undone.</> : <><strong className="font-semibold text-slate-800">{target.drug.name}</strong> will be hidden from the active catalogue, but its record will remain in the database.</>}</p>
      {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <div className="mt-6 flex justify-end gap-3"><Button variant="outline" onClick={onClose} disabled={deleting}>Cancel</Button><Button className={target.permanent ? "bg-red-700 hover:bg-red-800" : "bg-amber-600 hover:bg-amber-700"} onClick={() => void confirmDelete()} disabled={deleting}>{deleting && <LoaderCircle className="animate-spin" />}{deleting ? "Please wait…" : target.permanent ? "Delete permanently" : "Archive drug"}</Button></div>
    </div>
  </div>;
}

function EditDrug({ drug, onClose, onSaved }: { drug: Drug; onClose: () => void; onSaved: () => void }) {
  const [draft, setDraft] = useState(drug);
  const [saving, setSaving] = useState(false);
  const [generatingDescription, setGeneratingDescription] = useState(false);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<"archive" | "permanent" | null>(null);
  const set = <K extends keyof Drug>(key: K, value: Drug[K]) => setDraft((current) => ({ ...current, [key]: value }));
  const setPrice = (index: number, patch: Partial<Price>) => setDraft((current) => ({ ...current, prices: current.prices.map((price, position) => position === index ? { ...price, ...patch } : price) }));
  const makePrimary = (index: number) => setDraft((current) => ({ ...current, prices: current.prices.map((price, position) => ({ ...price, isPrimary: position === index })) }));

  async function generateDescription() {
    setGeneratingDescription(true); setError("");
    try {
      const response = await fetch("/api/drugs/generate-description", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: draft.name, commonName: draft.commonName || undefined, category: draft.category, dosageForm: draft.dosageForm, strength: draft.strength || undefined, manufacturer: draft.manufacturer || undefined }) });
      const result = (await response.json()) as { data?: { description?: string }; message?: string };
      if (!response.ok || !result.data?.description) throw new Error(result.message || "Unable to generate a description.");
      set("description", result.data.description);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to generate a description."); }
    finally { setGeneratingDescription(false); }
  }

  async function save(event: FormEvent) {
    event.preventDefault(); setSaving(true); setError("");
    const payload = { name: draft.name.trim(), commonName: draft.commonName?.trim() || undefined, description: draft.description?.trim() || undefined, category: draft.category, dosageForm: draft.dosageForm, strength: draft.strength?.trim() || undefined, manufacturer: draft.manufacturer?.trim() || undefined, location: draft.location.trim(), quantity: Number(draft.quantity), prices: draft.prices.map(({ unit, customUnit, quantityPerUnit, sellingPrice, isPrimary }) => ({ unit, ...(unit === "custom" ? { customUnit } : {}), quantityPerUnit: Number(quantityPerUnit), sellingPrice: Number(sellingPrice), isPrimary })) };
    try {
      const response = await fetch(`/api/drugs/${drug._id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = (await response.json()) as { message?: string };
      if (!response.ok) throw new Error(result.message || "Unable to save changes.");
      onSaved();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to save changes."); }
    finally { setSaving(false); }
  }

  async function deleteDrug(permanent: boolean) {
    const confirmed = window.confirm(
      permanent
        ? `Permanently delete ${drug.name}? This cannot be undone.`
        : `Archive ${drug.name}? It will be hidden from the active catalogue.`,
    );
    if (!confirmed) return;

    setDeleting(permanent ? "permanent" : "archive");
    setError("");
    try {
      const response = await fetch(
        `/api/drugs/${drug._id}${permanent ? "?permanent=true" : ""}`,
        { method: "DELETE" },
      );
      const result = (await response.json()) as { message?: string };
      if (!response.ok) throw new Error(result.message || "Unable to delete drug.");
      onSaved();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to delete drug.");
    } finally {
      setDeleting(null);
    }
  }

  return <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40" role="dialog" aria-modal="true" aria-labelledby="edit-title" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="h-full w-full max-w-2xl overflow-y-auto bg-slate-50 shadow-2xl">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4"><div><h2 id="edit-title" className="font-semibold text-slate-950">Edit drug</h2><p className="text-sm text-slate-500">Update product, price, and stock details.</p></div><Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Close editor"><X /></Button></div>
      <form onSubmit={save} className="space-y-6 p-5">
        {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        <section className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-2">
          <h3 className="sm:col-span-2 font-semibold">Product details</h3>
          <Field label="Brand name"><Input value={draft.name} onChange={(e) => set("name", e.target.value)} minLength={2} required /></Field>
          <Field label="Common name"><Input value={draft.commonName || ""} onChange={(e) => set("commonName", e.target.value)} /></Field>
          <Field label="Category"><Select value={draft.category} onChange={(e) => set("category", e.target.value)}>{!drugCategories.includes(draft.category as (typeof drugCategories)[number]) && <option value={draft.category}>{draft.category}</option>}{drugCategories.map((category) => <option key={category}>{category}</option>)}</Select></Field>
          <Field label="Dosage form"><Select value={draft.dosageForm} onChange={(e) => set("dosageForm", e.target.value as Drug["dosageForm"])}>{dosageForms.map((form) => <option key={form} value={form}>{label(form)}</option>)}</Select></Field>
          <Field label="Strength"><Input value={draft.strength || ""} onChange={(e) => set("strength", e.target.value)} /></Field>
          <Field label="Manufacturer"><Input value={draft.manufacturer || ""} onChange={(e) => set("manufacturer", e.target.value)} /></Field>
          <div className="sm:col-span-2"><Field label="Description"><Textarea value={draft.description || ""} onChange={(e) => set("description", e.target.value)} /><Button type="button" variant="outline" size="sm" onClick={() => void generateDescription()} disabled={generatingDescription}>{generatingDescription ? <LoaderCircle className="animate-spin" /> : <Sparkles />}{generatingDescription ? "Generating…" : "Generate description"}</Button></Field></div>
          <Field label="Storage location"><Select value={draft.location} onChange={(e) => set("location", e.target.value)} required>{!storeLocations.includes(draft.location as (typeof storeLocations)[number]) && <option value={draft.location}>{draft.location} (existing)</option>}{storeLocations.map((location) => <option key={location} value={location}>{location}</option>)}</Select></Field>
          <Field label="Quantity"><Input type="number" min="0" step="1" value={draft.quantity} onChange={(e) => set("quantity", Number(e.target.value))} required /></Field>
        </section>
        <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between"><h3 className="font-semibold">Selling prices</h3><Button type="button" size="sm" variant="outline" onClick={() => set("prices", [...draft.prices, { unit: "tablet", quantityPerUnit: 1, sellingPrice: 0, isPrimary: false }])}><Plus /> Add</Button></div>
          {draft.prices.map((price, index) => <div key={price._id || index} className="grid gap-3 rounded-lg bg-slate-50 p-3 sm:grid-cols-2">
            <Field label="Unit"><Select value={price.unit} onChange={(e) => setPrice(index, { unit: e.target.value as Price["unit"] })}>{priceUnits.map((unit) => <option key={unit}>{unit}</option>)}</Select></Field>
            {price.unit === "custom" && <Field label="Custom unit"><Input value={price.customUnit || ""} onChange={(e) => setPrice(index, { customUnit: e.target.value })} required /></Field>}
            <Field label="Items per unit"><Input type="number" min="1" step="1" value={price.quantityPerUnit} onChange={(e) => setPrice(index, { quantityPerUnit: Number(e.target.value) })} required /></Field>
            <Field label="Price (₦)"><Input type="number" min="0" step="0.01" value={price.sellingPrice} onChange={(e) => setPrice(index, { sellingPrice: Number(e.target.value) })} required /></Field>
            <div className="flex items-center justify-between sm:col-span-2"><label className="flex items-center gap-2 text-sm"><input type="radio" name="edit-primary" checked={price.isPrimary} onChange={() => makePrimary(index)} className="accent-emerald-700" /> Primary price</label>{draft.prices.length > 1 && <Button type="button" size="sm" variant="destructive" onClick={() => { const next = draft.prices.filter((_, position) => position !== index); if (!next.some((item) => item.isPrimary)) next[0] = { ...next[0], isPrimary: true }; set("prices", next); }}><Trash2 /> Remove</Button>}</div>
          </div>)}
        </section>
        <section className="rounded-xl border border-red-200 bg-red-50/60 p-5">
          <h3 className="font-semibold text-red-900">Remove drug</h3>
          <p className="mt-1 text-sm leading-6 text-red-700">Archive keeps the record in the database. Permanent deletion removes it completely and cannot be undone.</p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Button type="button" variant="outline" disabled={Boolean(deleting)} onClick={() => void deleteDrug(false)}>{deleting === "archive" && <LoaderCircle className="animate-spin" />}Archive drug</Button>
            <Button type="button" className="bg-red-700 text-white hover:bg-red-800" disabled={Boolean(deleting)} onClick={() => void deleteDrug(true)}>{deleting === "permanent" && <LoaderCircle className="animate-spin" />}Permanently delete</Button>
          </div>
        </section>
        <div className="flex justify-end gap-3"><Button type="button" variant="outline" onClick={onClose}>Cancel</Button><Button type="submit" disabled={saving}>{saving && <LoaderCircle className="animate-spin" />}{saving ? "Saving…" : "Save changes"}</Button></div>
      </form>
    </div>
  </div>;
}

function Field({ label: text, children }: { label: string; children: React.ReactNode }) { return <div className="space-y-2"><Label>{text}</Label>{children}</div>; }
