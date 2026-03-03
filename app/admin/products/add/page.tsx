'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ImageUpload from '@/components/admin/ImageUpload';

const CURRENCIES = ['INR', 'USD', 'EUR', 'CAD'];

interface SpecRow { key: string; value: string; }

export default function AddProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/admin/categories')
      .then(r => r.json())
      .then(data => setCategories(data.categories || []));
  }, []);

  const [form, setForm] = useState({
    name: '',
    category: '',
    description: '',
    price: '',
    priceAmount: '',
    priceCurrency: 'INR',
    image: '',
    packaging: '',
  });
  const [specs, setSpecs] = useState<SpecRow[]>([{ key: '', value: '' }]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const addSpecRow = () => setSpecs(prev => [...prev, { key: '', value: '' }]);
  const removeSpecRow = (i: number) => setSpecs(prev => prev.filter((_, idx) => idx !== i));
  const updateSpec = (i: number, field: 'key' | 'value', val: string) => {
    setSpecs(prev => prev.map((row, idx) => idx === i ? { ...row, [field]: val } : row));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    // Build specifications object from rows
    const specifications: Record<string, string> = {};
    specs.forEach(row => {
      if (row.key.trim() && row.value.trim()) {
        specifications[row.key.trim()] = row.value.trim();
      }
    });
    // Add packaging to specs if provided
    if (form.packaging.trim()) {
      specifications['Packaging'] = form.packaging.trim();
    }

    const payload = {
      name: form.name,
      description: form.description,
      category: form.category,
      price: form.priceAmount ? `${form.priceCurrency} ${form.priceAmount}` : form.price || undefined,
      priceAmount: form.priceAmount ? Number(form.priceAmount) : undefined,
      priceCurrency: form.priceAmount ? form.priceCurrency : undefined,
      image: form.image || undefined,
      specifications: Object.keys(specifications).length > 0 ? specifications : undefined,
    };

    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => router.push('/admin/products'), 1500);
      } else {
        setError(data.error || 'Failed to add product');
      }
    } catch {
      setError('Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
          <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-800">Product Added</h2>
        <p className="text-slate-500 mt-2">The product is now live on the site. Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Add New Product</h1>
        <p className="text-slate-500 text-sm mt-1">Product goes live immediately after saving</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic info */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 space-y-4">
          <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">Basic Information</h2>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Product Name *</label>
            <input
              name="name" value={form.name} onChange={handleChange}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g. Premium Basmati Rice"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
            <select
              name="category" value={form.category} onChange={handleChange}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              <option value="">Select a category</option>
              {categories.map((c: string) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description *</label>
            <textarea
              name="description" value={form.description} onChange={handleChange}
              rows={3}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder="Describe the product quality, origin, etc."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Product Image</label>
            <ImageUpload
              value={form.image}
              onChange={url => setForm(prev => ({ ...prev, image: url }))}
            />
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 space-y-4">
          <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">Pricing</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Price Amount</label>
              <input
                name="priceAmount" value={form.priceAmount} onChange={handleChange}
                type="number" min="0" step="0.01"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g. 10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
              <select
                name="priceCurrency" value={form.priceCurrency} onChange={handleChange}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <p className="text-xs text-slate-400">Leave blank if price is negotiable / contact-based</p>
        </div>

        {/* Packaging */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 space-y-4">
          <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">Packaging Options</h2>
          <div>
            <input
              name="packaging" value={form.packaging} onChange={handleChange}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g. 1kg, 5kg, 10kg, 25kg bags"
            />
            <p className="text-xs text-slate-400 mt-1">Separate options with commas</p>
          </div>
        </div>

        {/* Specifications */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">Specifications</h2>
            <button
              type="button" onClick={addSpecRow}
              className="text-xs text-primary hover:underline font-medium"
            >
              + Add row
            </button>
          </div>
          <div className="space-y-2">
            {specs.map((row, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={row.key}
                  onChange={e => updateSpec(i, 'key', e.target.value)}
                  placeholder="Field (e.g. Origin)"
                  className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  value={row.value}
                  onChange={e => updateSpec(i, 'value', e.target.value)}
                  placeholder="Value (e.g. India)"
                  className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => removeSpecRow(i)}
                  className="text-red-400 hover:text-red-600 px-2 transition"
                  disabled={specs.length === 1}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 bg-primary hover:bg-primary/90 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50"
          >
            {submitting ? 'Saving...' : 'Add Product'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition text-sm font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
