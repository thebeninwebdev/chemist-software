import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User { role: "admin" }
  interface Session { user: { id: string; role: "admin" } & DefaultSession["user"] }
}

declare module "next-auth/jwt" {
  interface JWT { id?: string; role?: "admin" }
}
