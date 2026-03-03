import { z } from 'zod';

export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.string(),
  price: z.string().optional(),
  priceUSD: z.number().optional(), // Legacy: numeric price in USD
  priceAmount: z.number().optional(), // Numeric price in priceCurrency
  priceCurrency: z.string().optional(), // e.g. 'INR', 'USD', 'EUR', 'CAD'
  image: z.string().optional(),
  specifications: z.record(z.string()).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Product = z.infer<typeof ProductSchema>;

export const ProductsSchema = z.array(ProductSchema);
