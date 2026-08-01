"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { CheckCircle2, LoaderCircle, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { dosageForms, priceUnits } from "@/lib/validations/drug.validation";

type PriceRow = { id: string; unit: (typeof priceUnits)[number]; customUnit: string; quantityPerUnit: string; sellingPrice: string; isPrimary: boolean };
const newPrice = (): PriceRow => ({ id: crypto.randomUUID(), unit: "tablet", customUnit: "", quantityPerUnit: "1", sellingPrice: "", isPrimary: true });
const title = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

export function DrugForm() {
  const [prices, setPrices] = useState<PriceRow[]>([newPrice()]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const updatePrice = (id: string, patch: Partial<PriceRow>) => setPrices((rows) => rows.map((row) => row.id === id ? { ...row, ...patch } : row));
  const makePrimary = (id: string) => setPrices((rows) => rows.map((row) => ({ ...row, isPrimary: row.id === id })));
  const removePrice = (id: string) => setPrices((rows) => {
    const next = rows.filter((row) => row.id !== id);
    if (!next.some((row) => row.isPrimary) && next[0]) next[0] = { ...next[0], isPrimary: true };
    return next;
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);
    const form = event.currentTarget;
    const data = new FormData(form);
    const optional = (name: string) => String(data.get(name) ?? "").trim() || undefined;
    const payload = {
      name: String(data.get("name") ?? "").trim(), commonName: optional("commonName"),
      description: optional("description"), category: String(data.get("category") ?? "").trim(),
      dosageForm: data.get("dosageForm"), strength: optional("strength"), manufacturer: optional("manufacturer"),
      location: String(data.get("location") ?? "").trim(), quantity: Number(data.get("quantity")),
      prices: prices.map((price) => ({ unit: price.unit, isPrimary: price.isPrimary, ...(price.unit === "custom" ? { customUnit: price.customUnit.trim() } : {}), quantityPerUnit: Number(price.quantityPerUnit), sellingPrice: Number(price.sellingPrice) })),
    };
    try {
      const response = await fetch("/api/drugs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = (await response.json()) as { message?: string };
      if (!response.ok) throw new Error(result.message || "Unable to add drug.");
      form.reset(); setPrices([newPrice()]);
      setMessage({ type: "success", text: result.message || "Drug added successfully." });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Unable to add drug." });
    } finally { setSubmitting(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {message && <div role="status" className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm ${message.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-700"}`}>{message.type === "success" && <CheckCircle2 className="size-4" />}{message.text}</div>}
      <Card>
        <CardHeader><CardTitle>Drug information</CardTitle><CardDescription>Enter the details staff will use to identify this medicine.</CardDescription></CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <Field label="Brand name" htmlFor="name" required><Input id="name" name="name" placeholder="e.g. Panadol Extra" minLength={2} maxLength={150} required autoFocus /></Field>
          <Field label="Common or generic name" htmlFor="commonName"><Input id="commonName" name="commonName" placeholder="e.g. Paracetamol" maxLength={150} /></Field>
          <Field label="Category" htmlFor="category" required><Input id="category" name="category" placeholder="e.g. Pain relief" minLength={2} maxLength={100} required /></Field>
          <Field label="Dosage form" htmlFor="dosageForm" required><Select id="dosageForm" name="dosageForm" defaultValue="tablet" required>{dosageForms.map((form) => <option key={form} value={form}>{title(form)}</option>)}</Select></Field>
          <Field label="Strength" htmlFor="strength" hint="Include the unit, such as mg or mg/5ml."><Input id="strength" name="strength" placeholder="e.g. 500 mg" maxLength={100} /></Field>
          <Field label="Manufacturer" htmlFor="manufacturer"><Input id="manufacturer" name="manufacturer" placeholder="e.g. GSK" maxLength={150} /></Field>
          <div className="md:col-span-2"><Field label="Description" htmlFor="description" hint="Optional notes that help staff distinguish the product."><Textarea id="description" name="description" placeholder="Brief product description..." maxLength={2000} /></Field></div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="sm:flex-row sm:items-center sm:justify-between"><div><CardTitle>Pricing</CardTitle><CardDescription>Add every unit this drug can be sold in.</CardDescription></div><Button type="button" variant="outline" size="sm" onClick={() => setPrices((rows) => [...rows, { ...newPrice(), isPrimary: false }])}><Plus /> Add price</Button></CardHeader>
        <CardContent className="space-y-4">
          {prices.map((price, index) => <div key={price.id} className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="mb-4 flex items-center justify-between"><div className="flex items-center gap-2"><span className="text-sm font-semibold text-slate-800">Price {index + 1}</span>{price.isPrimary && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">Primary</span>}</div>{prices.length > 1 && <Button type="button" variant="destructive" size="icon" aria-label={`Remove price ${index + 1}`} onClick={() => removePrice(price.id)}><Trash2 /></Button>}</div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Selling unit" htmlFor={`unit-${price.id}`} required><Select id={`unit-${price.id}`} value={price.unit} onChange={(e) => updatePrice(price.id, { unit: e.target.value as PriceRow["unit"] })}>{priceUnits.map((unit) => <option key={unit} value={unit}>{title(unit)}</option>)}</Select></Field>
              {price.unit === "custom" ? <Field label="Custom unit" htmlFor={`custom-${price.id}`} required><Input id={`custom-${price.id}`} value={price.customUnit} onChange={(e) => updatePrice(price.id, { customUnit: e.target.value })} placeholder="e.g. card" required /></Field> : <Field label="Items per unit" htmlFor={`quantity-${price.id}`} required><Input id={`quantity-${price.id}`} type="number" min="1" step="1" value={price.quantityPerUnit} onChange={(e) => updatePrice(price.id, { quantityPerUnit: e.target.value })} required /></Field>}
              <Field label="Selling price (₦)" htmlFor={`price-${price.id}`} required><Input id={`price-${price.id}`} type="number" min="0" step="0.01" value={price.sellingPrice} onChange={(e) => updatePrice(price.id, { sellingPrice: e.target.value })} placeholder="0.00" required /></Field>
              <div className="flex items-end"><label className="flex h-10 w-full cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm"><input type="radio" name="primaryPrice" checked={price.isPrimary} onChange={() => makePrimary(price.id)} className="size-4 accent-emerald-700" />Main display price</label></div>
            </div>
          </div>)}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Inventory</CardTitle><CardDescription>Set where the item is stored and its current stock level.</CardDescription></CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2"><Field label="Storage location" htmlFor="location" required hint="Use a shelf, aisle, cabinet, or fridge label."><Input id="location" name="location" placeholder="e.g. Shelf A3" minLength={2} maxLength={150} required /></Field><Field label="Quantity in stock" htmlFor="quantity" required hint="Availability is set automatically from this value."><Input id="quantity" name="quantity" type="number" min="0" step="1" defaultValue="0" required /></Field></CardContent>
      </Card>
      <div className="flex flex-col-reverse gap-3 pb-10 sm:flex-row sm:justify-end"><Button type="reset" variant="outline" onClick={() => { setPrices([newPrice()]); setMessage(null); }}>Clear form</Button><Button type="submit" className="min-w-36" disabled={submitting}>{submitting ? <><LoaderCircle className="animate-spin" /> Saving…</> : "Add drug"}</Button></div>
    </form>
  );
}

function Field({ label, htmlFor, hint, required, children }: { label: string; htmlFor: string; hint?: string; required?: boolean; children: ReactNode }) {
  return <div className="space-y-2"><Label htmlFor={htmlFor}>{label}{required && <span className="ml-1 text-emerald-700" aria-hidden="true">*</span>}</Label>{children}{hint && <p className="text-xs leading-5 text-slate-500">{hint}</p>}</div>;
}
