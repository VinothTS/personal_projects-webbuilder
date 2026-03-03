import { NextRequest, NextResponse } from 'next/server';
import { getPendingProducts, updatePendingStatus, deletePendingProduct } from '@/lib/pending-products';
import { addProduct } from '@/lib/products';

// POST /api/admin/products/[id]/approve  → approve pending product
// DELETE /api/admin/products/[id]/approve → reject pending product

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const products = await getPendingProducts();
    const pending = products.find(p => p.id === id);

    if (!pending) {
      return NextResponse.json({ error: 'Pending product not found' }, { status: 404 });
    }

    // Add to live products
    const liveProduct = await addProduct({
      name: pending.name,
      description: pending.description,
      category: pending.category,
      price: pending.price,
      priceAmount: pending.priceAmount,
      priceCurrency: pending.priceCurrency,
      image: pending.image,
      specifications: pending.specifications,
    });

    // Mark as approved in pending list
    await updatePendingStatus(id, 'approved');

    return NextResponse.json({ success: true, product: liveProduct });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to approve product' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const reason = body.reason || '';

    const updated = await updatePendingStatus(id, 'rejected', reason);
    if (!updated) {
      return NextResponse.json({ error: 'Pending product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to reject product' }, { status: 500 });
  }
}
