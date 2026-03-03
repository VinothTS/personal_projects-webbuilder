import { promises as fs } from 'fs';
import path from 'path';
import { Product, ProductsSchema } from '@/types/product';

const DATA_DIR = path.join(process.cwd(), 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// Get all products
export async function getProducts(): Promise<Product[]> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(PRODUCTS_FILE, 'utf-8');
    const products = JSON.parse(data);
    return ProductsSchema.parse(products);
  } catch (error) {
    // Return empty array if file doesn't exist
    return [];
  }
}

// Save products
export async function saveProducts(products: Product[]): Promise<void> {
  await ensureDataDir();
  const validated = ProductsSchema.parse(products);
  await fs.writeFile(PRODUCTS_FILE, JSON.stringify(validated, null, 2));
}

// Add a product
export async function addProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
  const products = await getProducts();
  const now = new Date().toISOString();
  
  const newProduct: Product = {
    ...product,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  };

  products.push(newProduct);
  await saveProducts(products);
  return newProduct;
}

// Update a product
export async function updateProduct(id: string, updates: Partial<Omit<Product, 'id' | 'createdAt'>>): Promise<Product | null> {
  const products = await getProducts();
  const index = products.findIndex(p => p.id === id);
  
  if (index === -1) return null;

  products[index] = {
    ...products[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  await saveProducts(products);
  return products[index];
}

// Delete a product
export async function deleteProduct(id: string): Promise<boolean> {
  const products = await getProducts();
  const filtered = products.filter(p => p.id !== id);
  
  if (filtered.length === products.length) return false;
  
  await saveProducts(filtered);
  return true;
}

// Generate unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
