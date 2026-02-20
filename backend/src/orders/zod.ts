import { z } from "zod";

export const CreateOrderSchema = z.object({
  customer_name: z.string().min(3).max(100),
  customer_phone: z.string().regex(/^[0-9+\-\s()]+$/, "Invalid phone format"),
  customer_address: z.string().min(10).max(500),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  delivery_schedule: z.enum(["pagi", "siang", "sore"]),
  payment_method: z.enum(["cod", "transfer", "ewallet", "midtrans"]),
  items: z
    .array(
      z.object({
        product_id: z.string(),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1),
});

export type CreateOrderPayload = z.infer<typeof CreateOrderSchema>;
