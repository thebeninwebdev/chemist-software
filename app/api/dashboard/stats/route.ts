import { NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/mongodb";
import DrugModel from "@/models/drug";

const LOW_STOCK_LIMIT = 5;

export async function GET() {
  try {
    await connectToDatabase();

    const activeFilter = { isArchived: false };
    const lowStockFilter = {
      ...activeFilter,
      quantity: { $lte: LOW_STOCK_LIMIT },
    };

    const [totalProducts, lowStockItems, lowStockProducts] = await Promise.all([
      DrugModel.countDocuments(activeFilter),
      DrugModel.countDocuments(lowStockFilter),
      DrugModel.find(lowStockFilter)
        .sort({ quantity: 1, name: 1 })
        .limit(5)
        .select("name manufacturer category quantity")
        .lean(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalProducts,
        lowStockItems,
        lowStockProducts,
      },
    });
  } catch (error) {
    console.error("GET /api/dashboard/stats failed:", error);

    return NextResponse.json(
      { success: false, message: "Unable to retrieve dashboard statistics." },
      { status: 500 },
    );
  }
}
