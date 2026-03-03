import fs from 'fs';
import { promises as fsAsync } from 'fs';
import path from 'path';

const CATEGORIES_FILE = path.join(process.cwd(), 'data', 'categories.json');

export function getCategories(): string[] {
  try {
    const data = fs.readFileSync(CATEGORIES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return ['Rice', 'Pulses', 'Tea', 'Fish Products', 'Flowers'];
  }
}

export async function getCategoriesAsync(): Promise<string[]> {
  try {
    const data = await fsAsync.readFile(CATEGORIES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return ['Rice', 'Pulses', 'Tea', 'Fish Products', 'Flowers'];
  }
}

export async function saveCategories(categories: string[]): Promise<void> {
  await fsAsync.writeFile(CATEGORIES_FILE, JSON.stringify(categories, null, 2));
}

export async function addCategory(name: string): Promise<{ categories: string[]; error?: string }> {
  const trimmed = name.trim();
  if (!trimmed) return { categories: await getCategoriesAsync(), error: 'Category name cannot be empty' };
  const categories = await getCategoriesAsync();
  if (categories.map(c => c.toLowerCase()).includes(trimmed.toLowerCase())) {
    return { categories, error: 'Category already exists' };
  }
  categories.push(trimmed);
  await saveCategories(categories);
  return { categories };
}

export async function deleteCategory(name: string): Promise<string[]> {
  const categories = await getCategoriesAsync();
  const updated = categories.filter(c => c !== name);
  await saveCategories(updated);
  return updated;
}
