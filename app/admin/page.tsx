import Link from "next/link";
import { redirect } from "next/navigation";
import { PackageCheck, Pill, PlusCircle, TriangleAlert } from "lucide-react";
import { connectToDatabase } from "@/lib/mongodb";
import { auth } from "@/auth";
import DrugModel from "@/models/drug";
import { logout } from "./login/actions";

export default async function AdminOverviewPage() {
  if (!(await auth())) redirect("/admin/login");
  await connectToDatabase();
  const filter = { isArchived: false };
  const [products, available, lowStock] = await Promise.all([DrugModel.countDocuments(filter), DrugModel.countDocuments({ ...filter, isAvailable: true }), DrugModel.countDocuments({ ...filter, quantity: { $lte: 5 } })]);
  const cards = [{ label: "Total medicines", value: products, icon: Pill }, { label: "Available", value: available, icon: PackageCheck }, { label: "Low stock", value: lowStock, icon: TriangleAlert }];
  return <div className="min-h-screen bg-slate-50 text-slate-950">
    <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8"><Link href="/" className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-lg bg-emerald-700 text-white"><Pill className="size-5" /></span><span className="text-sm font-bold">Success Chemist <small className="block font-normal text-slate-500">Administration</small></span></Link><form action={logout}><button className="text-sm font-medium text-slate-600 hover:text-slate-950">Sign out</button></form></div></header>
    <div className="mx-auto flex max-w-[1440px]"><aside className="hidden min-h-[calc(100vh-4rem)] w-60 border-r border-slate-200 bg-white px-3 py-6 lg:block"><nav aria-label="Admin navigation" className="space-y-1"><Link href="/admin/drugs" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"><PlusCircle className="size-4" />Add new drug</Link><Link href="/admin/drugs/manage" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"><Pill className="size-4" />Manage</Link></nav></aside>
      <main className="flex-1 px-4 py-9 sm:px-6 lg:px-10"><p className="text-sm font-medium text-emerald-700">Administration</p><h1 className="mt-1 text-3xl font-bold tracking-tight">Overview</h1><p className="mt-2 text-sm text-slate-500">A quick view of your current medicine catalogue.</p><div className="mt-8 grid gap-4 sm:grid-cols-3">{cards.map(({ label, value, icon: Icon }) => <article key={label} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><Icon className="size-5 text-emerald-700" /><p className="mt-6 text-3xl font-bold">{value}</p><p className="mt-1 text-sm text-slate-500">{label}</p></article>)}</div></main>
    </div>
  </div>;
}
