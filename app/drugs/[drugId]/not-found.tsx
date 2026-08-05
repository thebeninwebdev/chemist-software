import Link from "next/link";
import { ArrowLeft, PackageOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function DrugNotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f4f0e6] p-4 text-[#27271f]">
      <Card className="w-full max-w-md border-[#d8d1bf] bg-[#fbf8ef] p-8 text-center shadow-[0_16px_45px_rgba(53,54,40,.12)]">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#eee5cf] text-[#806327]"><PackageOpen /></div>
        <h1 className="mt-5 font-serif text-2xl font-semibold">Medicine not found</h1>
        <p className="mt-2 text-sm leading-6 text-[#777465]">This medicine may have been removed or the link is no longer valid.</p>
        <Button asChild className="mt-6 bg-[#34392a] text-white hover:bg-[#484e3a]"><Link href="/"><ArrowLeft /> Back to search</Link></Button>
      </Card>
    </main>
  );
}
