import "server-only";

import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { connectToDatabase } from "@/lib/mongodb";
import UserModel from "@/models/user";

const scrypt = promisify(scryptCallback);
const normalizeEmail = (email: string) => email.trim().toLowerCase();

function same(left: string, right: string) {
  const a = Buffer.from(left); const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${derived.toString("hex")}`;
}

async function verifyPassword(password: string, storedHash: string) {
  const [salt, hash] = storedHash.split(":");
  if (!salt || !hash) return false;
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return same(derived.toString("hex"), hash);
}

export async function authenticateAdmin(email: string, password: string) {
  await connectToDatabase();
  const user = await UserModel.findOne({ email: normalizeEmail(email), role: "admin", isActive: true }).select("+passwordHash");
  if (!user || !(await verifyPassword(password, user.passwordHash))) return null;
  user.lastLoginAt = new Date();
  await user.save();
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

export async function adminExists() {
  await connectToDatabase();
  return Boolean(await UserModel.exists({ role: "admin" }));
}

export async function createAdmin(input: { name: string; email: string; password: string }) {
  await connectToDatabase();
  return UserModel.create({ name: input.name.trim(), email: normalizeEmail(input.email), passwordHash: await hashPassword(input.password), role: "admin" });
}
