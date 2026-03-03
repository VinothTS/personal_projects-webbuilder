import { NextRequest, NextResponse } from 'next/server';
import { getPendingProducts, addPendingProduct } from '@/lib/pending-products';

export async function GET() {
  try {
    const products = await getPendingProducts();
    return NextResponse.json({ success: true, products });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch pending products' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, category, price, priceAmount, priceCurrency, image, specifications } = body;

    if (!name || !description || !category) {
      return NextResponse.json({ error: 'name, description and category are required' }, { status: 400 });
    }

    const product = await addPendingProduct({
      name,
      description,
      category,
      price,
      priceAmount: priceAmount ? Number(priceAmount) : undefined,
      priceCurrency,
      image,
      specifications,
    });

    return NextResponse.json({ success: true, product });
  } catch {
    return NextResponse.json({ error: 'Failed to add product' }, { status: 500 });
  }
}
