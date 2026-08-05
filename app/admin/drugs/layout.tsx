import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function AdminDrugsLayout({ children }: { children: React.ReactNode }) {
  if (!(await auth())) redirect("/admin/login");
  return children;
}
