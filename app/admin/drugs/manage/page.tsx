import Link from "next/link";
import { Pill, Plus, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DrugManager } from "./drug-manager";

const navigation = [
  { label: "Add new drug", href: "/admin/drugs", icon: PlusCircle },
  { label: "Manage", href: "/admin/drugs/manage", icon: Pill, active: true },
];

export default function ManageDrugsPage() {
  return <div className="min-h-screen bg-slate-50 text-slate-950">
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur"><div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8"><Link href="/" className="flex items-center gap-3"><span className="flex size-9 items-center justify-center rounded-lg bg-emerald-700 text-white"><Pill className="size-5" /></span><span><span className="block text-sm font-bold leading-4">Success Chemist</span><span className="text-xs text-slate-500">Administration</span></span></Link><div className="flex size-9 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white" aria-label="Administrator account">AD</div></div></header>
    <div className="mx-auto flex max-w-[1440px]">
      <aside className="hidden w-60 shrink-0 border-r border-slate-200 bg-white px-3 py-6 lg:block"><nav aria-label="Admin navigation" className="space-y-1">{navigation.map(({ label, href, icon: Icon, active }) => <Link key={label} href={href} aria-current={active ? "page" : undefined} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${active ? "bg-emerald-50 text-emerald-800" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`}><Icon className="size-4" />{label}</Link>)}</nav></aside>
      <main className="min-w-0 flex-1 px-4 py-8 sm:px-6 lg:px-10"><div className="mx-auto max-w-6xl">
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="mb-2 text-sm font-medium text-emerald-700">Drug administration</p><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Manage drugs</h1><p className="mt-1.5 text-sm leading-6 text-slate-500">Search the catalogue and keep product, pricing, and stock information current.</p></div><Button asChild><Link href="/admin/drugs"><Plus /> Add new drug</Link></Button></div>
        <DrugManager />
      </div></main>
    </div>
  </div>;
}
