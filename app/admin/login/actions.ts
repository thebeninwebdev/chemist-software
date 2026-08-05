"use server";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn, signOut } from "@/auth";

export type LoginState = { error?: string };
export async function login(_: LoginState, formData: FormData): Promise<LoginState> {
  try {
    await signIn("credentials", { email: formData.get("email"), password: formData.get("password"), redirectTo: "/admin/drugs/manage" });
  } catch (error) {
    if (error instanceof AuthError) return { error: error.type === "CredentialsSignin" ? "The email or password is incorrect." : "Unable to sign in." };
    throw error;
  }
  redirect("/admin/drugs/manage");
}
export async function logout() { await signOut({ redirectTo: "/admin/login" }); }
