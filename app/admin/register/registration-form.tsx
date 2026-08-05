"use client";
import { useState, type FormEvent } from "react";
import { LoaderCircle, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";

export function RegistrationForm() {
  const router = useRouter(); const [error, setError] = useState(""); const [pending, setPending] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setError(""); const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/admin/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: form.get("name"), email: form.get("email"), password: form.get("password") }) });
      const result = (await response.json()) as { message?: string; errors?: Record<string, string[]> };
      if (!response.ok) {
        const details = result.errors ? Object.values(result.errors).flat().join(" ") : "";
        throw new Error(details || result.message || "Unable to register administrator.");
      }
      router.push("/admin/login"); router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to register administrator."); }
    finally { setPending(false); }
  }
  return <form onSubmit={submit} className="mt-8 space-y-5">{error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm red-700">{error}</p>}<Field label="Full name"><input name="name" autoComplete="name" minLength={2} maxLength={80} required className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" /></Field><Field label="Email address"><input name="email" type="email" autoComplete="username" required className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" /></Field><Field label="Password"><input name="password" type="password" autoComplete="new-password" minLength={8} maxLength={128} pattern="(?=.*[A-Za-z])(?=.*[0-9]).{8,128}" title="Use 8 or more characters with at least one letter and one number." required className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" /><span className="mt-1.5 block text-xs text-slate-500">At least 8 characters, including a letter and number.</span></Field><button disabled={pending} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 font-semibold text-white hover:bg-emerald-800 disabled:opacity-60">{pending ? <LoaderCircle className="size-5 animate-spin" /> : <UserPlus className="size-5" />}{pending ? "Creating account…" : "Create admin account"}</button></form>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>{children}</label>; }
