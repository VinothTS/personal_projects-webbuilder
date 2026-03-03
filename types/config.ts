import { z } from 'zod';

export const BusinessConfigSchema = z.object({
  business: z.object({
    name: z.string(),
    tagline: z.string(),
    description: z.string(),
    logo: z.string().optional(),
    about: z.object({
      title: z.string(),
      mission: z.string(),
      vision: z.string(),
      story: z.string(),
      values: z.array(z.object({
        title: z.string(),
        description: z.string(),
      })),
      stats: z.array(z.object({
        label: z.string(),
        value: z.string(),
      })),
    }).optional(),
  }),
  contact: z.object({
    email: z.string().email(),
    phone: z.string(),
    whatsapp: z.string().optional(),
    address: z.object({
      street: z.string(),
      city: z.string(),
      state: z.string(),
      zip: z.string(),
      country: z.string(),
    }),
    social: z.object({
      facebook: z.string().optional(),
      instagram: z.string().optional(),
      linkedin: z.string().optional(),
      twitter: z.string().optional(),
    }).optional(),
    hours: z.object({
      monday: z.string(),
      tuesday: z.string(),
      wednesday: z.string(),
      thursday: z.string(),
      friday: z.string(),
      saturday: z.string(),
      sunday: z.string(),
    }).optional(),
  }),
  theme: z.object({
    style: z.enum(['modern', 'elegant', 'vibrant', 'minimal', 'classic']),
    primaryColor: z.string(),
    secondaryColor: z.string(),
    accentColor: z.string(),
    layout: z.enum(['grid', 'list', 'masonry']),
  }),
  features: z.object({
    showPrices: z.boolean(),
    showSpecifications: z.boolean(),
    enableInquiry: z.boolean(),
    showCategories: z.boolean(),
    enableSearch: z.boolean(),
  }),
  categories: z.array(z.string()),
  deployment: z.object({
    platform: z.enum(['vercel', 'netlify', 'manual']),
    domain: z.string().optional(),
    autoDeployOnUpdate: z.boolean(),
  }),
});

export type BusinessConfig = z.infer<typeof BusinessConfigSchema>;
