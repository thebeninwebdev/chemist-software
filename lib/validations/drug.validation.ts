// src/lib/validations/drug.validation.ts

import { z } from "zod";

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

const drugPriceSchema = z
  .object({
    unit: z.enum(priceUnits),

    customUnit: z
      .string()
      .trim()
      .min(1, "Enter the custom unit name.")
      .optional(),

    quantityPerUnit: z
      .number()
      .int()
      .min(1, "Quantity per unit must be at least 1.")
      .default(1),

    sellingPrice: z
      .number()
      .min(0, "Selling price cannot be negative."),

    isPrimary: z.boolean().default(false),
  })
  .superRefine((price, context) => {
    if (
      price.unit === "custom" &&
      !price.customUnit
    ) {
      context.addIssue({
        code: "custom",
        path: ["customUnit"],
        message:
          "Custom unit is required when unit is custom.",
      });
    }
  });

export const createDrugSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Drug name must have at least 2 characters.")
    .max(150),

  commonName: z
    .string()
    .trim()
    .max(150)
    .optional(),

  description: z
    .string()
    .trim()
    .max(2_000)
    .optional(),

  category: z
    .string()
    .trim()
    .min(2, "Category is required.")
    .max(100),

  dosageForm: z.enum(dosageForms),

  strength: z
    .string()
    .trim()
    .max(100)
    .optional(),

  manufacturer: z
    .string()
    .trim()
    .max(150)
    .optional(),

  location: z
    .string()
    .trim()
    .min(2, "Drug location is required.")
    .max(150),

  prices: z
    .array(drugPriceSchema)
    .min(1, "A drug must have at least one price."),

  quantity: z
    .number()
    .int()
    .min(0, "Quantity cannot be negative.")
    .default(0),
});

/**
 * All fields from createDrugSchema become optional.
 */
export const updateDrugSchema =
  createDrugSchema.partial();

const queryBooleanSchema = z.preprocess(
  (value) => {
    if (value === "true") return true;
    if (value === "false") return false;
    if (value === undefined) return undefined;

    return value;
  },
  z.boolean().optional(),
);

export const drugQuerySchema = z.object({
  search: z
    .string()
    .trim()
    .max(150)
    .optional(),

  category: z
    .string()
    .trim()
    .max(100)
    .optional(),

  dosageForm: z
    .enum(dosageForms)
    .optional(),

  isAvailable: queryBooleanSchema,

  page: z.coerce
    .number()
    .int()
    .min(1)
    .default(1),

  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .default(20),
});