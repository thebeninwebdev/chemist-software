import { NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { generateDrugDescription } from "@/lib/server/drug-description";
import { dosageForms } from "@/lib/validations/drug.validation";

export const runtime = "nodejs";
const requestSchema = z.object({
  name: z.string().trim().min(2).max(150), commonName: z.string().trim().max(150).optional(),
  category: z.string().trim().max(100).optional(), dosageForm: z.enum(dosageForms).optional(),
  strength: z.string().trim().max(100).optional(), manufacturer: z.string().trim().max(150).optional(),
});

export async function POST(request: Request) {
  try {
    const description = await generateDrugDescription(requestSchema.parse(await request.json()));
    return NextResponse.json({ success: true, data: { description } });
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ success: false, message: "Enter at least the drug name before generating a description." }, { status: 400 });
    console.error("Drug description generation failed:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ success: false, message: "Unable to generate a description right now. You can still enter one manually." }, { status: 503 });
  }
}
