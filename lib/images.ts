import { promises as fs } from 'fs';
import path from 'path';
import sharp from 'sharp';

const IMAGES_DIR = path.join(process.cwd(), 'public', 'images', 'products');

// Ensure images directory exists
async function ensureImagesDir() {
  try {
    await fs.access(IMAGES_DIR);
  } catch {
    await fs.mkdir(IMAGES_DIR, { recursive: true });
  }
}

// Save and optimize image
export async function saveProductImage(
  imageBuffer: Buffer,
  productId: string,
  originalName: string
): Promise<string> {
  await ensureImagesDir();

  const ext = path.extname(originalName);
  const filename = `${productId}${ext}`;
  const filepath = path.join(IMAGES_DIR, filename);

  // Optimize image with sharp
  await sharp(imageBuffer)
    .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toFile(filepath);

  return `/images/products/${filename}`;
}

// Delete product image
export async function deleteProductImage(imagePath: string): Promise<void> {
  if (!imagePath) return;
  
  const filename = path.basename(imagePath);
  const filepath = path.join(IMAGES_DIR, filename);

  try {
    await fs.unlink(filepath);
  } catch (error) {
    // Ignore if file doesn't exist
  }
}

// Save image from URL
export async function saveImageFromUrl(url: string, productId: string): Promise<string> {
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const ext = path.extname(new URL(url).pathname) || '.jpg';
  
  return saveProductImage(buffer, productId, `image${ext}`);
}
