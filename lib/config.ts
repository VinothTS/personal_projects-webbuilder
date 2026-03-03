import { promises as fs } from 'fs';
import path from 'path';
import { BusinessConfig, BusinessConfigSchema } from '@/types/config';

const CONFIG_FILE = path.join(process.cwd(), 'config', 'business-config.json');

export async function getBusinessConfig(): Promise<BusinessConfig> {
  try {
    const data = await fs.readFile(CONFIG_FILE, 'utf-8');
    const config = JSON.parse(data);
    return BusinessConfigSchema.parse(config);
  } catch (error) {
    // Return default config if file doesn't exist
    return BusinessConfigSchema.parse({
      business: {
        name: "Global Agro Exports",
        tagline: "Premium Agricultural Products",
        description: "Leading exporter worldwide",
        logo: ""
      },
      contact: {
        email: "info@example.com",
        phone: "+1 234 567 8900",
        address: {
          street: "",
          city: "",
          state: "",
          zip: "",
          country: ""
        }
      },
      theme: {
        style: "modern",
        primaryColor: "#2d5016",
        secondaryColor: "#8fbc5a",
        accentColor: "#f4a460",
        layout: "grid"
      },
      features: {
        showPrices: true,
        showSpecifications: true,
        enableInquiry: true,
        showCategories: true,
        enableSearch: true
      },
      categories: ["Rice", "Pulses", "Tea", "Fish Products", "Flowers"],
      deployment: {
        platform: "vercel",
        domain: "",
        autoDeployOnUpdate: false
      }
    });
  }
}

export async function updateBusinessConfig(updates: Partial<BusinessConfig>): Promise<BusinessConfig> {
  const currentConfig = await getBusinessConfig();
  const newConfig = { ...currentConfig, ...updates };
  const validated = BusinessConfigSchema.parse(newConfig);
  
  await fs.writeFile(CONFIG_FILE, JSON.stringify(validated, null, 2));
  return validated;
}
