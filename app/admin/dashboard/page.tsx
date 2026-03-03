'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { PendingProduct } from '@/lib/pending-products';
import type { Product } from '@/types/product';

interface Stats {
  totalLive: number;
  totalPending: number;
  totalRejected: number;
  categories: Record<string, number>;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentPending, setRecentPending] = useState<PendingProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/products').then(r => r.json()),
      fetch('/api/admin/products/pending').then(r => r.json()),
    ]).then(([liveData, pendingData]) => {
      const live: Product[] = liveData.products || [];
      const all: PendingProduct[] = pendingData.products || [];
      const pending = all.filter(p => p.status === 'pending');
      const rejected = all.filter(p => p.status === 'rejected');

      const cats: Record<string, number> = {};
      live.forEach(p => { cats[p.category] = (cats[p.category] || 0) + 1; });

      setStats({
        totalLive: live.length,
        totalPending: pending.length,
        totalRejected: rejected.length,
        categories: cats,
      });
      setRecentPending(pending.slice(0, 5));
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl h-28" />
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Live Products', value: stats?.totalLive ?? 0, color: 'bg-emerald-500', icon: '📦' },
    { label: 'Pending Approval', value: stats?.totalPending ?? 0, color: 'bg-amber-500', icon: '⏳' },
    { label: 'Rejected', value: stats?.totalRejected ?? 0, color: 'bg-red-500', icon: '✗' },
    { label: 'Categories', value: Object.keys(stats?.categories ?? {}).length, color: 'bg-blue-500', icon: '🏷' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Overview of your product catalog</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(card => (
          <div key={card.label} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">{card.label}</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{card.value}</p>
              </div>
              <span className="text-2xl">{card.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Categories breakdown */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <h2 className="font-semibold text-slate-800 mb-4">Products by Category</h2>
          {Object.keys(stats?.categories ?? {}).length === 0 ? (
            <p className="text-slate-400 text-sm">No products yet.</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(stats?.categories ?? {}).map(([cat, count]) => (
                <div key={cat} className="flex items-center gap-3">
                  <span className="text-sm text-slate-600 w-32 truncate">{cat}</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${(count / (stats?.totalLive || 1)) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-slate-700 w-6 text-right">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent pending */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800">Pending Approvals</h2>
            <Link href="/admin/products/pending" className="text-primary text-xs hover:underline">
              View all →
            </Link>
          </div>
          {recentPending.length === 0 ? (
            <p className="text-slate-400 text-sm">No products waiting for approval.</p>
          ) : (
            <div className="space-y-3">
              {recentPending.map(p => (
                <div key={p.id} className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{p.name}</p>
                    <p className="text-xs text-slate-500">{p.category}</p>
                  </div>
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium flex-shrink-0">
                    Pending
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
        <h2 className="font-semibold text-slate-800 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/products/add"
            className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Single Product
          </Link>
          <Link href="/admin/products/bulk"
            className="inline-flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-700 transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Bulk Upload CSV/Excel
          </Link>
          <Link href="/admin/products/pending"
            className="inline-flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-600 transition">
            Review Pending ({stats?.totalPending ?? 0})
          </Link>
        </div>
      </div>
    </div>
  );
}
