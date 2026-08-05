import Link from "next/link";
import { redirect } from "next/navigation";
import { Pill, ShieldCheck } from "lucide-react";
import { auth } from "@/auth";
import { adminExists } from "@/lib/server/admin-auth";
import { RegistrationForm } from "./registration-form";

export default async function AdminRegistrationPage() {
  const [session, hasAdmin] = await Promise.all([auth(), adminExists()]);
  if (hasAdmin && session?.user.role !== "admin") redirect("/admin/login");
  return <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top,#dff3e5,transparent_48%),#f8faf9] px-5 py-12"><section className="w-full max-w-md rounded-3xl border border-emerald-100 bg-white p-7 shadow-[0_24px_70px_rgba(25,70,40,.12)] sm:p-9"><span className="grid size-12 place-items-center rounded-2xl bg-emerald-700 text-white"><Pill className="size-6 -rotate-[35deg]" /></span><p className="mt-7 text-sm font-semibold text-emerald-700">Success Chemist</p><h1 className="mt-1 text-3xl font-bold tracking-tight">Register admin</h1><p className="mt-3 text-sm leading-6 text-slate-500">Create an administrator account for catalogue management.</p><RegistrationForm /><p className="mt-6 text-center text-sm"><Link href="/admin/login" className="font-semibold text-emerald-700">Return to sign in</Link></p><p className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500"><ShieldCheck className="size-4 text-emerald-700" /> Additional accounts require an active admin session</p></section></main>;
}
