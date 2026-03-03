'use client';

import { useEffect, useState } from 'react';
import type { PendingProduct } from '@/lib/pending-products';

type Tab = 'pending' | 'approved' | 'rejected';

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
};

export default function PendingProductsPage() {
  const [products, setProducts] = useState<PendingProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('pending');
  const [actionId, setActionId] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<{ id: string; name: string } | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const load = () => {
    setLoading(true);
    fetch('/api/admin/products/pending')
      .then(r => r.json())
      .then(data => setProducts(data.products || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async (id: string) => {
    setActionId(id);
    try {
      const res = await fetch(`/api/admin/products/${id}/approve`, { method: 'POST' });
      if (res.ok) load();
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    setActionId(rejectModal.id);
    try {
      const res = await fetch(`/api/admin/products/${rejectModal.id}/approve`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectReason }),
      });
      if (res.ok) {
        load();
        setRejectModal(null);
        setRejectReason('');
      }
    } finally {
      setActionId(null);
    }
  };

  const filtered = products.filter(p => p.status === tab);
  const counts = {
    pending: products.filter(p => p.status === 'pending').length,
    approved: products.filter(p => p.status === 'approved').length,
    rejected: products.filter(p => p.status === 'rejected').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Product Approvals</h1>
        <p className="text-slate-500 text-sm mt-1">Review and approve products before they go live</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit">
        {(['pending', 'approved', 'rejected'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition capitalize ${
              tab === t ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t} <span className="ml-1 text-xs font-bold">({counts[t]})</span>
          </button>
        ))}
      </div>

      {/* Cards */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-slate-100">
          <p className="text-slate-400">No {tab} products.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(product => (
            <div key={product.id} className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
              <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                {/* Image */}
                {product.image ? (
                  <img src={product.image} alt={product.name}
                    className="w-20 h-20 rounded-lg object-cover bg-slate-100 flex-shrink-0" />
                ) : (
                  <div className="w-20 h-20 rounded-lg bg-slate-100 flex items-center justify-center text-3xl flex-shrink-0">
                    📦
                  </div>
                )}

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-start gap-2 mb-2">
                    <h3 className="font-semibold text-slate-800 text-lg">{product.name}</h3>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_STYLES[product.status]}`}>
                      {product.status}
                    </span>
                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                      {product.category}
                    </span>
                  </div>

                  <p className="text-slate-600 text-sm mb-3 line-clamp-2">{product.description}</p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 text-xs text-slate-500 mb-3">
                    {product.priceAmount != null && (
                      <span>💰 {product.priceCurrency} {product.priceAmount}</span>
                    )}
                    {product.specifications?.Packaging && (
                      <span>📦 {product.specifications.Packaging}</span>
                    )}
                    <span>🕐 {new Date(product.submittedAt).toLocaleDateString()}</span>
                  </div>

                  {/* Specs */}
                  {product.specifications && Object.keys(product.specifications).filter(k => k !== 'Packaging').length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {Object.entries(product.specifications)
                        .filter(([k]) => k !== 'Packaging')
                        .map(([key, val]) => (
                          <span key={key} className="text-xs bg-slate-50 border border-slate-200 px-2 py-1 rounded">
                            <strong>{key}:</strong> {val}
                          </span>
                        ))}
                    </div>
                  )}

                  {product.rejectionReason && (
                    <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600 mb-3">
                      <strong>Rejection reason:</strong> {product.rejectionReason}
                    </div>
                  )}
                </div>

                {/* Actions (only for pending) */}
                {product.status === 'pending' && (
                  <div className="flex lg:flex-col gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleApprove(product.id)}
                      disabled={actionId === product.id}
                      className="flex-1 lg:flex-none bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
                    >
                      {actionId === product.id ? '...' : '✓ Approve'}
                    </button>
                    <button
                      onClick={() => { setRejectModal({ id: product.id, name: product.name }); setRejectReason(''); }}
                      disabled={actionId === product.id}
                      className="flex-1 lg:flex-none bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
                    >
                      ✕ Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="font-bold text-slate-800 text-lg mb-1">Reject Product</h3>
            <p className="text-slate-500 text-sm mb-4">"{rejectModal.name}"</p>

            <label className="block text-sm font-medium text-slate-700 mb-2">
              Reason for rejection (optional)
            </label>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              rows={3}
              placeholder="e.g. Missing specifications, incorrect category, duplicate product..."
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none mb-4"
            />

            <div className="flex gap-3">
              <button
                onClick={handleReject}
                disabled={actionId === rejectModal.id}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-medium text-sm transition disabled:opacity-50"
              >
                {actionId === rejectModal.id ? 'Rejecting...' : 'Confirm Reject'}
              </button>
              <button
                onClick={() => setRejectModal(null)}
                className="flex-1 border border-slate-200 text-slate-600 py-2 rounded-lg text-sm hover:bg-slate-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
