import { NextRequest, NextResponse } from 'next/server';
import { getCategoriesAsync, addCategory, deleteCategory } from '@/lib/categories';

export async function GET() {
  try {
    const categories = await getCategoriesAsync();
    return NextResponse.json({ success: true, categories });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();
    const result = await addCategory(name);
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true, categories: result.categories });
  } catch {
    return NextResponse.json({ error: 'Failed to add category' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { name } = await request.json();
    if (!name) return NextResponse.json({ error: 'Category name required' }, { status: 400 });
    const categories = await deleteCategory(name);
    return NextResponse.json({ success: true, categories });
  } catch {
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
