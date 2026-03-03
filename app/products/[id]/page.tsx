import Image from 'next/image';
import Link from 'next/link';
import { getProducts } from '@/lib/products';
import { notFound } from 'next/navigation';
import AddToCart from '@/components/AddToCart';
import ProductPrice from '@/components/ProductPrice';

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const products = await getProducts();
  const { id } = await params;
  const product = products.find(p => p.id === id);

  if (!product) {
    notFound();
  }

  // Extract packaging options from specifications
  const packagingOptions = product.specifications?.Packaging as string | undefined;

  return (
    <div className="container mx-auto px-4 py-12">
      <Link href="/products" className="text-primary hover:text-secondary mb-6 inline-block">
        ← Back to Products
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="relative h-96 bg-gray-200 rounded-lg overflow-hidden">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-8xl">
              {product.category === 'Rice' && '🌾'}
              {product.category === 'Pulses' && '🫘'}
              {product.category === 'Tea' && '🍵'}
              {product.category === 'Fish Products' && '🐟'}
              {product.category === 'Flowers' && '🌹'}
            </div>
          )}
        </div>

        <div>
          <span className="text-sm bg-secondary/20 text-primary px-3 py-1 rounded">
            {product.category}
          </span>
          <h1 className="text-4xl font-bold mt-4">{product.name}</h1>
          
          <div className="mt-4">
            <ProductPrice
              price={product.price}
              priceUSD={product.priceUSD}
              priceAmount={product.priceAmount}
              priceCurrency={product.priceCurrency}
            />
          </div>
          
          <p className="text-gray-700 mt-4 text-lg">{product.description}</p>

          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-semibold mb-4">Specifications</h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <ul className="space-y-3">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <li key={key} className="flex border-b border-gray-200 pb-2">
                      <span className="font-semibold text-gray-700 min-w-[150px]">{key}:</span>
                      <span className="text-gray-900">{value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="mt-8">
            <AddToCart
              productId={product.id}
              productName={product.name}
              category={product.category}
              price={product.price || 'Contact for price'}
              priceAmount={product.priceAmount}
              priceCurrency={product.priceCurrency}
              image={product.image || ''}
              packagingOptions={packagingOptions}
            />
          </div>

          <div className="mt-4">
            <Link
              href="/contact"
              className="text-primary hover:text-primary/80 font-semibold inline-block"
            >
              Need a custom quote? Contact us →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
