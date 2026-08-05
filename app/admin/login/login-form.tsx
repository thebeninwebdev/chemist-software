"use client";
import { useActionState } from "react";
import { LoaderCircle, LogIn } from "lucide-react";
import { login, type LoginState } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, {} as LoginState);
  return <form action={action} className="mt-8 space-y-5">
    {state.error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>}
    <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Email address</span><input name="email" type="email" autoComplete="username" required className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" placeholder="admin@successchemist.com" /></label>
    <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Password</span><input name="password" type="password" autoComplete="current-password" required className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" placeholder="Enter your password" /></label>
    <button disabled={pending} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 font-semibold text-white hover:bg-emerald-800 disabled:opacity-60">{pending ? <LoaderCircle className="size-5 animate-spin" /> : <LogIn className="size-5" />}{pending ? "Signing in…" : "Sign in"}</button>
  </form>;
}
