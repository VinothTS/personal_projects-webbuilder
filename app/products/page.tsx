import { getProducts } from '@/lib/products';
import ProductCard from '@/components/ProductCard';

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const allProducts = await getProducts();
  const { category } = await searchParams;
  
  const products = category
    ? allProducts.filter(p => p.category.toLowerCase() === category.toLowerCase())
    : allProducts;

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">
        {category ? `${category.charAt(0).toUpperCase() + category.slice(1)} Products` : 'All Products'}
      </h1>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">No products available yet.</p>
          <p className="text-gray-500 mt-2">Use the prompt scripts to add products!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
