import { MongoServerError } from "mongodb";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { connectToDatabase } from "@/lib/mongodb";
import DrugModel from "@/models/drug";
import {
  createDrugSchema,
  drugQuerySchema,
} from "@/lib/validations/drug.validation";

/**
 * Prevent user input from being interpreted as
 * special regular-expression characters.
 */
function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * GET /api/drugs
 *
 * Examples:
 * /api/drugs
 * /api/drugs?search=panadol
 * /api/drugs?category=pain-relief
 * /api/drugs?page=1&limit=20
 */
export async function GET(request: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);

    const query = drugQuerySchema.parse({
      search: searchParams.get("search") || undefined,
      category: searchParams.get("category") || undefined,
      dosageForm:
        searchParams.get("dosageForm") || undefined,
      isAvailable:
        searchParams.get("isAvailable") || undefined,
      page: searchParams.get("page") || undefined,
      limit: searchParams.get("limit") || undefined,
    });

    const filter: Record<string, unknown> = {
      isArchived: false,
    };

    if (query.search) {
      const escapedSearch = escapeRegex(query.search);

      filter.$or = [
        {
          name: {
            $regex: escapedSearch,
            $options: "i",
          },
        },
        {
          commonName: {
            $regex: escapedSearch,
            $options: "i",
          },
        },
      ];
    }

    if (query.category) {
      filter.category = query.category;
    }

    if (query.dosageForm) {
      filter.dosageForm = query.dosageForm;
    }

    if (typeof query.isAvailable === "boolean") {
      filter.isAvailable = query.isAvailable;
    }

    const skip = (query.page - 1) * query.limit;

    const [drugs, total] = await Promise.all([
      DrugModel.find(filter)
        .sort({ name: 1 })
        .skip(skip)
        .limit(query.limit)
        .lean(),

      DrugModel.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      data: drugs,
      pagination: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit),
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid search parameters.",
          errors: error.flatten(),
        },
        {
          status: 400,
        },
      );
    }

    console.error("GET /api/drugs failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to retrieve drugs.",
      },
      {
        status: 500,
      },
    );
  }
}

/**
 * POST /api/drugs
 */
export async function POST(request: Request) {
  try {
    await connectToDatabase();

    const body: unknown = await request.json();

    const validatedData = createDrugSchema.parse(body);

    /**
     * Optional duplicate check.
     *
     * This prevents drugs with exactly the same name,
     * strength, and dosage form from being created twice.
     */
    const existingDrug = await DrugModel.findOne({
      name: {
        $regex: `^${escapeRegex(validatedData.name)}$`,
        $options: "i",
      },
      strength: validatedData.strength,
      dosageForm: validatedData.dosageForm,
      isArchived: false,
    }).lean();

    if (existingDrug) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A drug with the same name, strength, and dosage form already exists.",
        },
        {
          status: 409,
        },
      );
    }

    const drug = await DrugModel.create(validatedData);

    return NextResponse.json(
      {
        success: true,
        message: "Drug created successfully.",
        data: drug,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid drug information.",
          errors: z.treeifyError(error),
        },
        {
          status: 400,
        },
      );
    }

    if (
      error instanceof MongoServerError &&
      error.code === 11000
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A drug with this unique information already exists.",
        },
        {
          status: 409,
        },
      );
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          success: false,
          message: "The request body contains invalid JSON.",
        },
        {
          status: 400,
        },
      );
    }

    console.error("POST /api/drugs failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to create drug.",
      },
      {
        status: 500,
      },
    );
  }
}