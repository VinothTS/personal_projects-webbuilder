import { NextRequest, NextResponse } from 'next/server';
import { getProducts, addProduct, deleteProduct } from '@/lib/products';

export async function GET() {
  try {
    const products = await getProducts();
    return NextResponse.json({ success: true, products });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, category, price, priceAmount, priceCurrency, image, specifications } = body;

    if (!name || !description || !category) {
      return NextResponse.json({ error: 'Name, description and category are required' }, { status: 400 });
    }

    const product = await addProduct({ name, description, category, price, priceAmount, priceCurrency, image, specifications });
    return NextResponse.json({ success: true, product });
  } catch {
    return NextResponse.json({ error: 'Failed to add product' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    const deleted = await deleteProduct(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
