import { redirect } from "next/navigation";
import Link from "next/link";
import { Pill, ShieldCheck } from "lucide-react";
import { auth } from "@/auth";
import { LoginForm } from "./login-form";

export default async function AdminLoginPage() {
  if (await auth()) redirect("/admin/drugs/manage");
  return <><main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top,#dff3e5,transparent_48%),#f8faf9] px-5 py-12"><section className="w-full max-w-md rounded-3xl border border-emerald-100 bg-white p-7 shadow-[0_24px_70px_rgba(25,70,40,.12)] sm:p-9">
    <span className="grid size-12 place-items-center rounded-2xl bg-emerald-700 text-white"><Pill className="size-6 -rotate-[35deg]" /></span><p className="mt-7 text-sm font-semibold text-emerald-700">Success Chemist</p><h1 className="mt-1 text-3xl font-bold tracking-tight">Admin sign in</h1><p className="mt-3 text-sm leading-6 text-slate-500">Sign in to manage medicine prices and inventory.</p><LoginForm /><p className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500"><ShieldCheck className="size-4 text-emerald-700" /> Protected administration area</p>
  </section></main><Link href="/admin/register" className="fixed bottom-6 left-1/2 -translate-x-1/2 text-sm font-semibold text-emerald-700 hover:text-emerald-800">Register an admin account</Link></>;
}
