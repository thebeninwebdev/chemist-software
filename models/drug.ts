// src/models/drug.model.ts

import mongoose, {
  Schema,
  type InferSchemaType,
  type Model,
} from "mongoose";

export const dosageForms = [
  "tablet",
  "capsule",
  "syrup",
  "suspension",
  "cream",
  "ointment",
  "gel",
  "drops",
  "injection",
  "powder",
  "inhaler",
  "spray",
  "suppository",
  "other",
] as const;

export const priceUnits = [
  "tablet",
  "capsule",
  "sachet",
  "strip",
  "bottle",
  "pack",
  "box",
  "tube",
  "vial",
  "ampoule",
  "piece",
  "custom",
] as const;

const drugPriceSchema = new Schema(
  {
    unit: {
      type: String,
      enum: priceUnits,
      required: true,
    },

    customUnit: {
      type: String,
      trim: true,
    },

    /**
     * Number of smaller items contained in this unit.
     *
     * Examples:
     * tablet = 1
     * strip of 10 tablets = 10
     * pack of 100 tablets = 100
     */
    quantityPerUnit: {
      type: Number,
      min: 1,
      default: 1,
    },

    sellingPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    /**
     * The main price displayed in search results.
     */
    isPrimary: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: true,
    timestamps: true,
  },
);

const drugSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    commonName: {
      type: String,
      trim: true,
      index: true,
    },

    description: {
      type: String,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    dosageForm: {
      type: String,
      enum: dosageForms,
      required: true,
    },

    strength: {
      type: String,
      trim: true,
    },

    manufacturer: {
      type: String,
      trim: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    prices: {
      type: [drugPriceSchema],
      required: true,
      validate: {
        validator(prices: unknown[]) {
          return prices.length > 0;
        },
        message: "A drug must have at least one price.",
      },
    },

    isAvailable: {
      type: Boolean,
      default: true,
      index: true,
    },

    quantity: {
      type: Number,
      min: 0,
      default: 0,
    },

    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },

    searchText: { type: String, select: false },
    embedding: { type: [Number], select: false },
    embeddingModel: { type: String, select: false },
    embeddingDimensions: { type: Number, select: false },
    embeddingUpdatedAt: { type: Date, select: false },
  },
  {
    timestamps: true,
    optimisticConcurrency: true,
  },
);

/**
 * Ensure each drug has only one primary price.
 *
 * If no primary price is selected, the first price
 * automatically becomes the primary price.
 */
drugSchema.pre("validate", function () {
  if (!this.prices?.length) {
    return;
  }

  const primaryPrices = this.prices.filter(
    (price) => price.isPrimary,
  );

  if (primaryPrices.length === 0) {
    this.prices[0].isPrimary = true;
  }

  if (primaryPrices.length > 1) {
    this.invalidate(
      "prices",
      "Only one price can be marked as primary.",
    );
  }

  this.isAvailable = this.quantity > 0;
});

drugSchema.index(
  { barcode: 1 },
  {
    unique: true,
    sparse: true,
  },
);

drugSchema.index({
  name: 1,
  commonName: 1,
  isArchived: 1,
});

export type Drug = InferSchemaType<typeof drugSchema>;

const DrugModel =
  (mongoose.models.Drug as Model<Drug>) ||
  mongoose.model<Drug>("Drug", drugSchema);

export default DrugModel;
