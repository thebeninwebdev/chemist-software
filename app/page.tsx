"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowUpRight, LoaderCircle, PackageOpen, Pill, Search, ShieldCheck, X } from "lucide-react";

type Price = { unit: string; customUnit?: string; sellingPrice: number; isPrimary: boolean };
type Drug = { _id: string; name: string; commonName?: string; description?: string; category: string; dosageForm: string; strength?: string; manufacturer?: string; prices: Price[]; matchType?: "exact" | "keyword" | "semantic" };
type SearchResponse = { success: boolean; message?: string; data?: Drug[]; pagination?: { total: number } };
const money = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 2 });

export default function Home() {
  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [results, setResults] = useState<Drug[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const requestId = useRef(0);
  const searched = activeQuery.length >= 2;

  useEffect(() => {
    if (!activeQuery) return;
    const controller = new AbortController();
    const currentRequest = ++requestId.current;
    async function search() {
      setLoading(true); setError("");
      try {
        const response = await fetch(`/api/drugs?search=${encodeURIComponent(activeQuery)}&limit=10`, { signal: controller.signal, cache: "no-store" });
        const payload = (await response.json()) as SearchResponse;
        if (!response.ok || !payload.data) throw new Error(payload.message || "Search is unavailable.");
        if (currentRequest === requestId.current) { setResults(payload.data); setTotal(payload.pagination?.total ?? payload.data.length); }
      } catch (cause) {
        if (cause instanceof DOMException && cause.name === "AbortError") return;
        if (currentRequest === requestId.current) { setResults([]); setTotal(0); setError(cause instanceof Error ? cause.message : "Search is unavailable."); }
      } finally { if (currentRequest === requestId.current) setLoading(false); }
    }
    void search();
    return () => controller.abort();
  }, [activeQuery]);

  function clearSearch() { setQuery(""); setActiveQuery(""); setResults([]); setTotal(0); setError(""); setLoading(false); }
  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const term = query.trim();
    if (term.length < 2) return;
    if (term === activeQuery) { setActiveQuery(""); window.setTimeout(() => setActiveQuery(term), 0); }
    else setActiveQuery(term);
  }

  return <main className="relative min-h-screen overflow-hidden bg-[#f7faf7] text-[#17221a]">
    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[540px] bg-[radial-gradient(circle_at_50%_0%,rgba(187,230,196,.6),transparent_68%)]" />
    <header className="relative z-10 mx-auto flex h-20 max-w-6xl items-center justify-between px-5 sm:px-8">
      <Link href="/" onClick={clearSearch} className="flex items-center gap-2.5"><span className="grid size-10 place-items-center rounded-xl bg-[#176b3a] text-white shadow-[0_8px_22px_rgba(23,107,58,.2)]"><Pill className="size-5 rotate-[-35deg]" /></span><span className="text-sm font-bold sm:text-base">Success Chemist</span></Link>
      <Link href="/admin/drugs" className="rounded-full border border-[#dce7de] bg-white/80 px-4 py-2 text-sm font-medium text-[#36533e] shadow-sm backdrop-blur hover:bg-white">Admin</Link>
    </header>

    <section className={searched ? "relative z-10 mx-auto max-w-5xl px-5 pb-16 pt-5 sm:px-8" : "relative z-10 mx-auto flex min-h-[calc(100vh-10rem)] max-w-4xl flex-col items-center justify-center px-5 pb-28"}>
      <div className={searched ? "rounded-3xl border border-[#dfe9e1] bg-white/85 p-5 shadow-[0_18px_50px_rgba(31,71,42,.08)] backdrop-blur sm:p-7" : "w-full text-center"}>
        {!searched && <><h1 className="mx-auto mt-6 max-w-2xl text-4xl font-semibold leading-[1.08] tracking-[-0.045em] text-[#173b24] sm:text-6xl">Find medicines quickly and clearly.</h1><p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-[#5d7163] sm:text-base">Search by brand, generic name, category, or what the product is commonly used for.</p></>}
        {searched && <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-[#2f6c43]"><Search className="size-4" /> Catalogue search</div>}
        <form onSubmit={submitSearch} className={searched ? "relative max-w-3xl" : "relative mx-auto mt-9 max-w-2xl"}>
          <Search className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-[#6d8172]" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} autoFocus aria-label="Search medicines" placeholder="Search by medicine name or description" className="h-14 w-full rounded-2xl border border-[#d7e3d9] bg-white pl-13 pr-29 text-base shadow-[0_10px_30px_rgba(37,82,49,.08)] outline-none transition focus:border-[#79a987] focus:ring-4 focus:ring-[#d9ebdd]" />
          <span className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">{loading ? <LoaderCircle className="mr-1 size-5 animate-spin text-[#176b3a]" /> : query ? <button type="button" onClick={clearSearch} aria-label="Clear search" className="rounded-full p-1.5 text-[#65756a] hover:bg-[#edf3ee]"><X className="size-4" /></button> : null}<button type="submit" disabled={query.trim().length < 2 || loading} aria-label="Search" className="grid size-10 place-items-center rounded-xl bg-[#176b3a] text-white shadow-sm hover:bg-[#12572f] disabled:cursor-not-allowed disabled:opacity-40"><Search className="size-4.5" /></button></span>
        </form>
        {!searched && <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-[#637568]"><span className="inline-flex items-center gap-1.5"><ShieldCheck className="size-4 text-[#3c8154]" /> Inventory lookup only</span><span>Press Enter or tap search</span></div>}
      </div>

      {searched && <div className="mx-auto max-w-3xl pt-8">
        {!loading && !error && <><p className="mb-5 text-sm text-[#66766a]">{total} {total === 1 ? "result" : "results"} for <span className="font-semibold text-[#263d2d]">“{activeQuery}”</span></p>{results.length > 0 && <div className="mb-5 grid gap-2 sm:grid-cols-2">{results.map((drug) => { const price = drug.prices?.find((item) => item.isPrimary) ?? drug.prices?.[0]; return <div key={`price-${drug._id}`} className="flex items-center justify-between rounded-xl border border-[#dce8de] bg-[#f3f8f4] px-4 py-3"><span className="truncate pr-3 text-sm font-medium text-[#27432f]">{drug.name}</span><span className="shrink-0 text-right"><span className="block font-bold text-[#176b3a]">{price ? money.format(price.sellingPrice) : "Price unavailable"}</span>{price && <span className="block text-[10px] text-[#6b7b70]">per {price.customUnit || price.unit}</span>}</span></div>; })}</div>}</>}
        {error ? <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-700" role="alert">{error}</div>
        : !loading && results.length === 0 ? <div className="rounded-3xl border border-[#e0e9e2] bg-white py-14 text-center text-[#5f7064]"><PackageOpen className="mx-auto size-9 text-[#91a598]" /><p className="mt-4 font-medium">No medicines matched your search.</p><p className="mt-1 text-sm">Check the spelling or try a generic name.</p></div>
        : <div className="space-y-3">{results.map((drug) => <Link href={`/drugs/${drug._id}`} key={drug._id} className="group block rounded-2xl border border-[#e0e9e2] bg-white p-5 shadow-[0_5px_18px_rgba(38,70,46,.04)] transition hover:-translate-y-0.5 hover:border-[#bed5c3] hover:shadow-[0_12px_28px_rgba(38,70,46,.09)] sm:p-6"><article className="flex gap-4"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#eaf5ed] text-[#267247]"><Pill className="size-5 rotate-[-35deg]" /></span><span className="min-w-0 flex-1"><span className="flex items-start justify-between gap-3"><span className="text-lg font-semibold tracking-[-0.015em] text-[#183d25] group-hover:text-[#176b3a] sm:text-xl">{drug.name}</span><ArrowUpRight className="size-4 shrink-0 text-[#8ba493] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#287448]" /></span><span className="mt-1 block text-sm text-[#5e7063]">{[drug.commonName, drug.manufacturer].filter(Boolean).join(" · ")}</span>{drug.description && <span className="mt-2 block line-clamp-2 text-sm leading-6 text-[#526158]">{drug.description}</span>}<span className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[#607066]"><span className="rounded-full bg-[#f0f5f1] px-2.5 py-1">{drug.category}</span><span className="rounded-full bg-[#f0f5f1] px-2.5 py-1">{drug.dosageForm}</span>{drug.strength && <span>{drug.strength}</span>}{drug.matchType === "semantic" && <span className="font-semibold text-[#287448]">Related result</span>}</span></span></article></Link>)}</div>}
        <p className="mt-10 border-t border-[#dfe8e1] pt-5 text-xs leading-5 text-[#6b7b70]">Search results are for inventory lookup only. Confirm medication suitability and dosage with a qualified healthcare professional.</p>
      </div>}
    </section>
  </main>;
}
