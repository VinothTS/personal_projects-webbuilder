import { NextRequest, NextResponse } from 'next/server';
import { updateProduct } from '@/lib/products';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { name, description, category, price, priceAmount, priceCurrency, image, specifications } = body;

    if (!name || !description || !category) {
      return NextResponse.json({ error: 'name, description and category are required' }, { status: 400 });
    }

    const updated = await updateProduct(id, {
      name,
      description,
      category,
      price,
      priceAmount: priceAmount ? Number(priceAmount) : undefined,
      priceCurrency: priceCurrency || undefined,
      image: image || undefined,
      specifications: specifications && Object.keys(specifications).length > 0 ? specifications : undefined,
    });

    if (!updated) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, product: updated });
  } catch {
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}
