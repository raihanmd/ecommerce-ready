import { z } from "zod";

// ============ QUERY VALIDATION ============
export const ProductQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  category_id: z.string().optional(),
  search: z.string().optional(),
});

export type ProductQuery = z.infer<typeof ProductQuerySchema>;

// ============ CREATE PRODUCT VALIDATION ============
export const CreateProductSchema = z.object({
  name: z
    .string()
    .min(3, "Product name must be at least 3 characters")
    .max(255, "Product name must not exceed 255 characters")
    .trim(),

  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .max(255, "Slug must not exceed 255 characters")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase and contain only letters, numbers, and hyphens",
    )
    .optional(), // Optional because it can be auto-generated from name

  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(5000, "Description must not exceed 5000 characters")
    .trim(),

  price: z
    .number()
    .positive("Price must be a positive number")
    .multipleOf(0.01, "Price must have at most 2 decimal places")
    .max(99999999.99, "Price is too high"),

  stock: z
    .number()
    .int("Stock must be an integer")
    .nonnegative("Stock cannot be negative")
    .max(999999, "Stock quantity is too high"),

  image_url: z
    .string()
    .url("Image URL must be a valid URL")
    .min(1, "Image URL is required")
    .max(2048, "Image URL is too long"),

  category_id: z.string().min(1, "Category is required"),
});

export type CreateProductDto = z.infer<typeof CreateProductSchema>;

// ============ UPDATE PRODUCT VALIDATION ============
export const UpdateProductSchema = z
  .object({
    name: z
      .string()
      .min(3, "Product name must be at least 3 characters")
      .max(255, "Product name must not exceed 255 characters")
      .trim()
      .optional(),

    slug: z
      .string()
      .min(3, "Slug must be at least 3 characters")
      .max(255, "Slug must not exceed 255 characters")
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug must be lowercase and contain only letters, numbers, and hyphens",
      )
      .optional(),

    description: z
      .string()
      .min(10, "Description must be at least 10 characters")
      .max(5000, "Description must not exceed 5000 characters")
      .trim()
      .optional(),

    price: z
      .number()
      .positive("Price must be a positive number")
      .multipleOf(0.01, "Price must have at most 2 decimal places")
      .max(99999999.99, "Price is too high")
      .optional(),

    stock: z
      .number()
      .int("Stock must be an integer")
      .nonnegative("Stock cannot be negative")
      .max(999999, "Stock quantity is too high")
      .optional(),

    image_url: z
      .string()
      .url("Image URL must be a valid URL")
      .max(2048, "Image URL is too long")
      .optional(),

    category_id: z.string().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export type UpdateProductDto = z.infer<typeof UpdateProductSchema>;

// ============ PRODUCT PARAM VALIDATION ============
export const ProductParamSchema = z.object({
  id: z.string().cuid("Invalid product ID"),
});

export const ProductSlugParamSchema = z.object({
  slug: z.string().min(1, "Slug is required"),
});

// ============ EXPORT AS VALIDATION OBJECT ============
export const ProductsValidation = {
  QUERY: ProductQuerySchema,
  CREATE: CreateProductSchema,
  UPDATE: UpdateProductSchema,
  PARAM: ProductParamSchema,
  SLUG_PARAM: ProductSlugParamSchema,
};
