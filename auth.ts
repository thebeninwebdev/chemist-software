import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { authenticateAdmin } from "@/lib/server/admin-auth";

const credentialsSchema = z.object({ email: z.email(), password: z.string().min(1) });

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  pages: { signIn: "/admin/login" },
  providers: [Credentials({
    credentials: { email: { label: "Email", type: "email" }, password: { label: "Password", type: "password" } },
    async authorize(credentials) {
      const parsed = credentialsSchema.safeParse(credentials);
      if (!parsed.success) return null;
      return authenticateAdmin(parsed.data.email, parsed.data.password);
    },
  })],
  callbacks: {
    jwt({ token, user }) { if (user) { token.id = user.id; token.role = user.role; } return token; },
    session({ session, token }) { session.user.id = String(token.id); session.user.role = token.role as "admin"; return session; },
  },
});
