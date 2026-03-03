import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'images', 'products');

function sanitizeFilename(name: string): string {
  // Keep extension, replace unsafe chars
  const ext = name.split('.').pop()?.toLowerCase() || 'jpg';
  const base = name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
  return `${Date.now()}-${base}.${ext}`;
}

export async function POST(request: NextRequest) {
  try {
    await mkdir(UPLOAD_DIR, { recursive: true });

    const formData = await request.formData();
    const files = formData.getAll('images');

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const uploaded: { originalName: string; url: string }[] = [];

    for (const entry of files) {
      if (!(entry instanceof File)) continue;

      // Validate it's an image
      if (!entry.type.startsWith('image/')) {
        continue;
      }

      const bytes = await entry.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const safeName = sanitizeFilename(entry.name);
      const filePath = path.join(UPLOAD_DIR, safeName);

      await writeFile(filePath, buffer);

      uploaded.push({
        originalName: entry.name,           // e.g. "rice.jpg"  — used for matching in bulk
        url: `/images/products/${safeName}`, // e.g. "/images/products/1700000000-rice.jpg"
      });
    }

    return NextResponse.json({ success: true, uploaded });
  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
