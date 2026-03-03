import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const PENDING_FILE = path.join(DATA_DIR, 'pending-products.json');

export type ProductCategory = 'Rice' | 'Pulses' | 'Tea' | 'Fish Products' | 'Flowers';
export type PendingStatus = 'pending' | 'approved' | 'rejected';

export interface PendingProduct {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  price?: string;
  priceAmount?: number;
  priceCurrency?: string;
  image?: string;
  specifications?: Record<string, string>;
  status: PendingStatus;
  rejectionReason?: string;
  submittedAt: string;
  updatedAt: string;
}

async function ensureDataDir() {
  try { await fs.access(DATA_DIR); }
  catch { await fs.mkdir(DATA_DIR, { recursive: true }); }
}

export async function getPendingProducts(): Promise<PendingProduct[]> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(PENDING_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export async function savePendingProducts(products: PendingProduct[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(PENDING_FILE, JSON.stringify(products, null, 2));
}

export async function addPendingProduct(
  product: Omit<PendingProduct, 'id' | 'status' | 'submittedAt' | 'updatedAt'>
): Promise<PendingProduct> {
  const products = await getPendingProducts();
  const now = new Date().toISOString();
  const newProduct: PendingProduct = {
    ...product,
    id: `pending-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    status: 'pending',
    submittedAt: now,
    updatedAt: now,
  };
  products.push(newProduct);
  await savePendingProducts(products);
  return newProduct;
}

export async function updatePendingStatus(
  id: string,
  status: 'approved' | 'rejected',
  reason?: string
): Promise<PendingProduct | null> {
  const products = await getPendingProducts();
  const idx = products.findIndex(p => p.id === id);
  if (idx === -1) return null;
  products[idx] = {
    ...products[idx],
    status,
    rejectionReason: reason,
    updatedAt: new Date().toISOString(),
  };
  await savePendingProducts(products);
  return products[idx];
}

export async function deletePendingProduct(id: string): Promise<boolean> {
  const products = await getPendingProducts();
  const filtered = products.filter(p => p.id !== id);
  if (filtered.length === products.length) return false;
  await savePendingProducts(filtered);
  return true;
}
