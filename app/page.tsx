import Image from 'next/image';
import Link from 'next/link';
import { getProducts } from '@/lib/products';
import { getCategories } from '@/lib/categories';
import { getBusinessConfig } from '@/lib/config';

export default async function Home() {
  const products = await getProducts();
  const categories = getCategories();
  const config = await getBusinessConfig();
  const { business } = config;

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary to-secondary text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold mb-6">
              {business.name}
            </h1>
            <p className="text-xl mb-8">
              {business.description}
            </p>
            <Link 
              href="/products" 
              className="inline-block bg-accent hover:bg-accent/90 text-white px-8 py-3 rounded-lg font-semibold transition"
            >
              Explore Our Products
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Product Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {categories.map((category) => (
              <Link
                key={category}
                href={`/products?category=${category.toLowerCase()}`}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition text-center"
              >
                <div className="text-4xl mb-3">
                  {category === 'Rice' && '🌾'}
                  {category === 'Pulses' && '🫘'}
                  {category === 'Tea' && '🍵'}
                  {category === 'Fish Products' && '🐟'}
                  {category === 'Flowers' && '🌺'}
                </div>
                <h3 className="font-semibold text-lg">{category}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Featured Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.slice(0, 4).map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition">
                <Link href={`/products/${product.id}`}>
                  <div className="relative h-48 bg-gray-200 cursor-pointer">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        priority
                        unoptimized
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400 text-4xl">
                        {product.category === 'Rice' && '🌾'}
                        {product.category === 'Pulses' && '🫘'}
                        {product.category === 'Tea' && '🍵'}
                        {product.category === 'Fish Products' && '🐟'}
                        {product.category === 'Flowers' && '🌺'}
                      </div>
                    )}
                  </div>
                </Link>
                <div className="p-4">
                  <span className="text-xs bg-secondary/20 text-primary px-2 py-1 rounded">
                    {product.category}
                  </span>
                  <h3 className="font-bold text-lg mt-2">{product.name}</h3>
                  <p className="text-gray-600 text-sm mt-1 line-clamp-2">{product.description}</p>
                  <div className="flex justify-between items-center mt-4">
                    {product.price ? (
                      <p className="text-primary font-bold text-lg">{product.price}</p>
                    ) : (
                      <div></div>
                    )}
                    <Link 
                      href={`/products/${product.id}`}
                      className="text-primary hover:text-secondary font-semibold text-sm"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose {business.name}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl mb-4">✓</div>
              <h3 className="text-xl font-bold mb-2">Premium Quality</h3>
              <p>Handpicked products meeting international standards</p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">🌍</div>
              <h3 className="text-xl font-bold mb-2">Global Reach</h3>
              <p>Exporting to over 50 countries worldwide</p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">🚚</div>
              <h3 className="text-xl font-bold mb-2">Reliable Delivery</h3>
              <p>On-time shipping with proper packaging</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
