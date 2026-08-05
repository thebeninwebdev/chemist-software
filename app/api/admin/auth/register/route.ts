import { MongoServerError } from "mongodb";
import { NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { auth } from "@/auth";
import { adminExists, createAdmin } from "@/lib/server/admin-auth";

export const runtime = "nodejs";
const schema = z.object({
  name: z.string().trim().min(2, "Name must contain at least 2 characters.").max(80, "Name must not exceed 80 characters."),
  email: z.email("Enter a valid email address.").trim().toLowerCase(),
  password: z.string().min(8, "Password must contain at least 8 characters.").max(128, "Password must not exceed 128 characters.").regex(/[A-Za-z]/, "Password must contain at least one letter.").regex(/[0-9]/, "Password must contain at least one number."),
});

export async function POST(request: Request) {
  try {
    const hasAdmin = await adminExists();
    const session = await auth();
    if (hasAdmin && session?.user.role !== "admin") return NextResponse.json({ success: false, message: "Admin authentication is required." }, { status: 401 });
    const input = schema.parse(await request.json());
    const user = await createAdmin(input);
    return NextResponse.json({ success: true, message: "Administrator registered successfully.", data: { user: { id: user.id, name: user.name, email: user.email, role: user.role } } }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ success: false, message: "Invalid registration information.", errors: error.flatten().fieldErrors }, { status: 400 });
    if (error instanceof MongoServerError && error.code === 11000) return NextResponse.json({ success: false, message: "An account with this email already exists." }, { status: 409 });
    if (error instanceof SyntaxError) return NextResponse.json({ success: false, message: "The request body contains invalid JSON." }, { status: 400 });
    console.error("POST /api/admin/auth/register failed:", error);
    return NextResponse.json({ success: false, message: "Unable to register administrator." }, { status: 500 });
  }
}
