import { NextRequest, NextResponse } from 'next/server';
import { addPendingProduct, ProductCategory } from '@/lib/pending-products';

const VALID_CATEGORIES: ProductCategory[] = ['Rice', 'Pulses', 'Tea', 'Fish Products', 'Flowers'];

export async function POST(request: NextRequest) {
  try {
    const { products } = await request.json();

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: 'No products provided' }, { status: 400 });
    }

    const results: { success: boolean; name: string; error?: string }[] = [];

    for (const row of products) {
      try {
        const { name, description, category, price, priceAmount, priceCurrency, image, specifications } = row;

        if (!name || !description || !category) {
          results.push({ success: false, name: name || '(unnamed)', error: 'Missing required fields' });
          continue;
        }

        if (!VALID_CATEGORIES.includes(category as ProductCategory)) {
          results.push({ success: false, name, error: `Invalid category: ${category}` });
          continue;
        }

        await addPendingProduct({
          name: String(name),
          description: String(description),
          category: category as ProductCategory,
          price: price ? String(price) : undefined,
          priceAmount: priceAmount ? Number(priceAmount) : undefined,
          priceCurrency: priceCurrency ? String(priceCurrency) : undefined,
          image: image ? String(image) : undefined,
          specifications: specifications && typeof specifications === 'object' ? specifications : undefined,
        });

        results.push({ success: true, name });
      } catch (e) {
        results.push({ success: false, name: row.name || '(unnamed)', error: String(e) });
      }
    }

    const successCount = results.filter(r => r.success).length;
    return NextResponse.json({ success: true, results, successCount, total: products.length });
  } catch {
    return NextResponse.json({ error: 'Bulk upload failed' }, { status: 500 });
  }
}
