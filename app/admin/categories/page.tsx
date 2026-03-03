'use client';

import { useEffect, useState } from 'react';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<string[]>([]);
  const [products, setProducts] = useState<{ category: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);
  const [deletingName, setDeletingName] = useState<string | null>(null);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/admin/categories').then(r => r.json()),
      fetch('/api/admin/products').then(r => r.json()),
    ]).then(([catsData, prodsData]) => {
      setCategories(catsData.categories || []);
      setProducts(prodsData.products || []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const productCountFor = (cat: string) =>
    products.filter(p => p.category === cat).length;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setError('');
    setAdding(true);
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories);
        setNewName('');
      } else {
        setError(data.error || 'Failed to add category');
      }
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (name: string) => {
    const count = productCountFor(name);
    const msg = count > 0
      ? `"${name}" has ${count} live product(s). Deleting the category won't remove those products, but they'll have an unlisted category. Continue?`
      : `Delete category "${name}"?`;
    if (!confirm(msg)) return;

    setDeletingName(name);
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (data.success) setCategories(data.categories);
    } finally {
      setDeletingName(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Categories</h1>
        <p className="text-slate-500 text-sm mt-1">
          Manage product categories — used in Add Product, Bulk Upload, and the storefront filter
        </p>
      </div>

      {/* Add new */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
        <h2 className="font-semibold text-slate-700 mb-4">Add New Category</h2>
        <form onSubmit={handleAdd} className="flex gap-3">
          <input
            value={newName}
            onChange={e => { setNewName(e.target.value); setError(''); }}
            placeholder="e.g. Spices, Grains, Dry Fruits..."
            className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            maxLength={40}
          />
          <button
            type="submit"
            disabled={adding || !newName.trim()}
            className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-lg text-sm font-semibold transition disabled:opacity-50"
          >
            {adding ? 'Adding...' : 'Add'}
          </button>
        </form>
        {error && (
          <p className="text-red-500 text-xs mt-2">{error}</p>
        )}
      </div>

      {/* List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <p className="font-semibold text-slate-700">{categories.length} Categories</p>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Loading...</div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">No categories yet.</div>
        ) : (
          <ul className="divide-y divide-slate-50">
            {categories.map(cat => {
              const count = productCountFor(cat);
              return (
                <li key={cat} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                    <span className="font-medium text-slate-800">{cat}</span>
                    <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                      {count} product{count !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(cat)}
                    disabled={deletingName === cat}
                    className="text-xs text-red-400 hover:text-red-600 font-medium transition disabled:opacity-50"
                  >
                    {deletingName === cat ? 'Deleting...' : 'Delete'}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-xs text-amber-700">
        <strong>Note:</strong> Deleting a category only removes it from the dropdown list. Existing products with that category are not deleted — they will just show their old category name until edited.
      </div>
    </div>
  );
}
