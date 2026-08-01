import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { connectToDatabase } from "@/lib/mongodb";
import DrugModel from "@/models/drug";
import { updateDrugSchema } from "@/lib/validations/drug.validation";

type DrugRouteContext = {
  params: Promise<{
    drugId: string;
  }>;
};

/**
 * GET /api/drugs/:drugId
 */
export async function GET(
  _request: Request,
  context: DrugRouteContext,
) {
  try {
    await connectToDatabase();

    const { drugId } = await context.params;

    if (!mongoose.isValidObjectId(drugId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid drug ID.",
        },
        {
          status: 400,
        },
      );
    }

    const drug = await DrugModel.findOne({
      _id: drugId,
      isArchived: false,
    }).lean();

    if (!drug) {
      return NextResponse.json(
        {
          success: false,
          message: "Drug not found.",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json({
      success: true,
      data: drug,
    });
  } catch (error) {
    console.error("GET /api/drugs/[drugId] failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to retrieve drug.",
      },
      {
        status: 500,
      },
    );
  }
}

/**
 * PATCH /api/drugs/:drugId
 */
export async function PATCH(
  request: Request,
  context: DrugRouteContext,
) {
  try {
    await connectToDatabase();

    const { drugId } = await context.params;

    if (!mongoose.isValidObjectId(drugId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid drug ID.",
        },
        {
          status: 400,
        },
      );
    }

    const body: unknown = await request.json();

    const validatedData = updateDrugSchema.parse(body);

    if (Object.keys(validatedData).length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Provide at least one field to update.",
        },
        {
          status: 400,
        },
      );
    }

    const drug = await DrugModel.findOneAndUpdate(
      {
        _id: drugId,
        isArchived: false,
      },
      {
        $set: validatedData,
      },
      {
        new: true,
        runValidators: true,
      },
    ).lean();

    if (!drug) {
      return NextResponse.json(
        {
          success: false,
          message: "Drug not found.",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Drug updated successfully.",
      data: drug,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid drug information.",
          errors: error.flatten(),
        },
        {
          status: 400,
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

    console.error(
      "PATCH /api/drugs/[drugId] failed:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to update drug.",
      },
      {
        status: 500,
      },
    );
  }
}

/**
 * DELETE /api/drugs/:drugId
 *
 * This archives the drug rather than permanently
 * deleting it.
 */
export async function DELETE(
  _request: Request,
  context: DrugRouteContext,
) {
  try {
    await connectToDatabase();

    const { drugId } = await context.params;

    if (!mongoose.isValidObjectId(drugId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid drug ID.",
        },
        {
          status: 400,
        },
      );
    }

    const drug = await DrugModel.findOneAndUpdate(
      {
        _id: drugId,
        isArchived: false,
      },
      {
        $set: {
          isArchived: true,
        },
      },
      {
        new: true,
      },
    ).lean();

    if (!drug) {
      return NextResponse.json(
        {
          success: false,
          message: "Drug not found.",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Drug archived successfully.",
    });
  } catch (error) {
    console.error(
      "DELETE /api/drugs/[drugId] failed:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to archive drug.",
      },
      {
        status: 500,
      },
    );
  }
}