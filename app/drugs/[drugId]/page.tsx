import Link from "next/link";
import { notFound } from "next/navigation";
import mongoose from "mongoose";
import {
  ArrowLeft,
  Boxes,
  Building2,
  CheckCircle2,
  MapPin,
  Package,
  Pill,
  Tag,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { connectToDatabase } from "@/lib/mongodb";
import DrugModel from "@/models/drug";

const money = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 2,
});

function titleCase(value: string) {
  return value
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export default async function DrugDetailsPage({
  params,
}: {
  params: Promise<{ drugId: string }>;
}) {
  const { drugId } = await params;

  if (!mongoose.isValidObjectId(drugId)) notFound();

  await connectToDatabase();
  const drug = await DrugModel.findOne({ _id: drugId, isArchived: false }).lean();

  if (!drug) notFound();

  const primaryPrice = drug.prices.find((price) => price.isPrimary) ?? drug.prices[0];
  const stockTone = drug.quantity === 0
    ? "bg-[#f6dfd4] text-[#a84422]"
    : drug.quantity <= 5
      ? "bg-[#eee5cf] text-[#806327]"
      : "bg-[#e4ecd9] text-[#587140]";

  return (
    <main className="min-h-screen bg-[#f4f0e6] px-4 py-5 text-[#27271f] sm:px-7 sm:py-8 lg:px-10">
      <div className="mx-auto max-w-[1120px]">
        <header className="flex items-center justify-between">
          <Button asChild variant="ghost" className="-ml-3 text-[#596040] hover:bg-[#e6e2d5] hover:text-[#34392a]">
            <Link href="/"><ArrowLeft /> Back to search</Link>
          </Button>
          <p className="font-serif text-lg font-semibold text-[#34392a]">Success Chemist</p>
        </header>

        <section className="mt-7 grid gap-5 lg:grid-cols-[.78fr_1.22fr]">
          <Card className="flex min-h-[310px] flex-col items-center justify-center border-[#d8d1bf] bg-[#34392a] p-8 text-center text-white shadow-[0_16px_45px_rgba(53,54,40,.16)]">
            <div className="grid size-28 place-items-center rounded-[32px] bg-[#f0dfaf] text-[#74602f] shadow-[0_15px_35px_rgba(0,0,0,.18)]">
              <Pill className="size-14 rotate-[-35deg]" />
            </div>
            <p className="mt-7 text-xs font-semibold uppercase tracking-[.2em] text-[#e8c77d]">{drug.category}</p>
            <p className="mt-2 text-sm text-white/55">{titleCase(drug.dosageForm)}</p>
          </Card>

          <div className="flex flex-col justify-center py-2 lg:px-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${stockTone}`}>
                {drug.isAvailable ? <CheckCircle2 className="size-3.5" /> : <XCircle className="size-3.5" />}
                {drug.isAvailable ? "Available" : "Out of stock"}
              </span>
              <span className="rounded-full bg-[#e8e2d3] px-3 py-1 text-xs font-semibold text-[#676354]">{titleCase(drug.dosageForm)}</span>
            </div>

            <h1 className="mt-5 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">{drug.name}</h1>
            {drug.commonName && <p className="mt-2 text-base text-[#777465]">Common name: {drug.commonName}</p>}
            <p className="mt-5 max-w-2xl text-sm leading-7 text-[#6f6c60]">
              {drug.description || "No description has been added for this medicine yet."}
            </p>

            <div className="mt-7 border-t border-[#d8d1bf] pt-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[.12em] text-[#8a8678]">Primary price</p>
                <p className="mt-1 font-serif text-3xl font-semibold text-[#806327]">{primaryPrice ? money.format(primaryPrice.sellingPrice) : "—"}</p>
                {primaryPrice && <p className="mt-1 text-xs text-[#8a8678]">per {primaryPrice.customUnit || primaryPrice.unit}</p>}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-7 grid gap-5 md:grid-cols-[1.15fr_.85fr]">
          <Card className="border-[#d8d1bf] bg-[#fbf8ef] p-5 shadow-[0_8px_26px_rgba(72,66,48,.05)] sm:p-7">
            <h2 className="font-serif text-xl font-semibold">Medicine information</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                { icon: Pill, label: "Strength", value: drug.strength || "Not specified" },
                { icon: Package, label: "Dosage form", value: titleCase(drug.dosageForm) },
                { icon: Tag, label: "Category", value: drug.category },
                { icon: Building2, label: "Manufacturer", value: drug.manufacturer || "Not specified" },
                { icon: MapPin, label: "Store location", value: drug.location },
                { icon: Boxes, label: "Current stock", value: `${drug.quantity.toLocaleString()} units` },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex gap-3 rounded-2xl border border-[#e2dccd] bg-[#f5f0e4] p-4">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#e8dfc9] text-[#836a34]"><Icon className="size-[18px]" /></span>
                  <span className="min-w-0">
                    <span className="block text-xs text-[#878274]">{label}</span>
                    <span className="mt-1 block break-words text-sm font-semibold">{value}</span>
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="overflow-hidden border-[#d8d1bf] bg-[#fbf8ef] shadow-[0_8px_26px_rgba(72,66,48,.05)]">
            <div className="border-b border-[#e2dccd] p-5 sm:px-6">
              <h2 className="font-serif text-xl font-semibold">Prices</h2>
              <p className="mt-1 text-sm text-[#817d70]">Available selling units</p>
            </div>
            <div className="divide-y divide-[#e2dccd]">
              {drug.prices.map((price) => (
                <div key={price._id.toString()} className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6">
                  <div>
                    <p className="text-sm font-semibold">Per {price.customUnit || titleCase(price.unit)}</p>
                    <p className="mt-1 text-xs text-[#817d70]">Contains {price.quantityPerUnit} {price.quantityPerUnit === 1 ? "item" : "items"}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-serif text-lg font-semibold text-[#806327]">{money.format(price.sellingPrice)}</p>
                    {price.isPrimary && <span className="text-[10px] font-bold uppercase tracking-wider text-[#65764d]">Primary</span>}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </section>
      </div>
    </main>
  );
}
