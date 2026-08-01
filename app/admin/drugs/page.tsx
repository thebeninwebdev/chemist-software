import Link from "next/link";
import { Boxes, ChevronRight, ClipboardPlus, LayoutDashboard, Pill, Settings } from "lucide-react";
import { DrugForm } from "./drug-form";

const navigation = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Drugs", href: "/admin/drugs", icon: Pill, active: true },
  { label: "Inventory", href: "/admin/inventory", icon: Boxes },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AddDrugPage() {
  return <div className="min-h-screen bg-slate-50 text-slate-950">
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3"><span className="flex size-9 items-center justify-center rounded-lg bg-emerald-700 text-white"><Pill className="size-5" /></span><span><span className="block text-sm font-bold leading-4">Success Chemist</span><span className="text-xs text-slate-500">Administration</span></span></Link>
        <div className="flex size-9 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white" aria-label="Administrator account">AD</div>
      </div>
    </header>
    <div className="mx-auto flex max-w-[1440px]">
      <aside className="hidden w-60 shrink-0 border-r border-slate-200 bg-white px-3 py-6 lg:block">
        <nav aria-label="Admin navigation" className="space-y-1">{navigation.map(({ label, href, icon: Icon, active }) => <Link key={label} href={href} aria-current={active ? "page" : undefined} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${active ? "bg-emerald-50 text-emerald-800" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`}><Icon className="size-4" />{label}</Link>)}</nav>
      </aside>
      <main className="min-w-0 flex-1 px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <div className="mb-7">
            <nav aria-label="Breadcrumb" className="mb-3 flex items-center gap-1 text-sm text-slate-500"><Link href="/admin/drugs" className="hover:text-slate-900">Drugs</Link><ChevronRight className="size-4" /><span className="text-slate-700">Add new</span></nav>
            <div className="flex items-start gap-3"><span className="mt-1 hidden size-11 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-700 sm:flex"><ClipboardPlus className="size-5" /></span><div><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Add a new drug</h1><p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500">Create a complete catalogue record with product details, pricing, and opening stock.</p></div></div>
          </div>
          <DrugForm />
        </div>
      </main>
    </div>
  </div>;
}
