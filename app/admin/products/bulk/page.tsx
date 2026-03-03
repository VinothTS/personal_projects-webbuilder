'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const REQUIRED_COLUMNS = ['name', 'description', 'category'];
const ALL_COLUMNS = ['name', 'category', 'description', 'price', 'priceAmount', 'priceCurrency', 'image', 'packaging'];

interface ParsedRow {
  name: string;
  category: string;
  description: string;
  price?: string;
  priceAmount?: string;
  priceCurrency?: string;
  image?: string;
  specifications?: Record<string, string>;
  _error?: string;
}

// Extract just the filename from a path like "C:\Users\vinoth\Desktop\rice.jpg" or "./images/rice.jpg"
function basename(filePath: string): string {
  return filePath.replace(/\\/g, '/').split('/').pop() || filePath;
}

function validateRow(parsed: ParsedRow, categories: string[]): ParsedRow {
  const missing = REQUIRED_COLUMNS.filter(col => !parsed[col as keyof ParsedRow]);
  if (missing.length > 0) {
    parsed._error = `Missing: ${missing.join(', ')}`;
  } else if (categories.length > 0 && !categories.includes(parsed.category)) {
    parsed._error = `Invalid category: "${parsed.category}". Must be one of: ${categories.join(', ')}`;
  }
  return parsed;
}

function buildRow(
  raw: Record<string, string>,
  categories: string[],
  imageMap: Record<string, string>
): ParsedRow {
  const specs: Record<string, string> = {};
  Object.keys(raw).forEach(k => {
    if (!ALL_COLUMNS.includes(k) && raw[k]) specs[k] = raw[k];
  });
  if (raw.packaging) specs['Packaging'] = raw.packaging;

  // Resolve image: if the column value is a filename that was uploaded, use its URL
  let imageUrl = raw.image || undefined;
  if (imageUrl) {
    const fn = basename(imageUrl);
    if (imageMap[fn]) imageUrl = imageMap[fn];
  }

  const parsed: ParsedRow = {
    name: raw.name || '',
    category: raw.category || '',
    description: raw.description || '',
    price: raw.price || undefined,
    priceAmount: raw.priceamount || raw.price_amount || undefined,
    priceCurrency: raw.pricecurrency || raw.price_currency || 'INR',
    image: imageUrl,
    specifications: Object.keys(specs).length > 0 ? specs : undefined,
  };
  return validateRow(parsed, categories);
}

function parseCSV(text: string, categories: string[], imageMap: Record<string, string>): ParsedRow[] {
  const lines = text.trim().split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, '').toLowerCase());
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const raw: Record<string, string> = {};
    headers.forEach((h, i) => { raw[h] = values[i] || ''; });
    return buildRow(raw, categories, imageMap);
  });
}

export default function BulkUploadPage() {
  const router = useRouter();
  const dataFileRef = useRef<HTMLInputElement>(null);
  const imagesFileRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<string[]>([]);
  // imageMap: originalFilename → uploaded URL
  const [imageMap, setImageMap] = useState<Record<string, string>>({});
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imageUploadError, setImageUploadError] = useState('');

  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<{ success: boolean; name: string; error?: string }[] | null>(null);

  useEffect(() => {
    fetch('/api/admin/categories')
      .then(r => r.json())
      .then(data => setCategories(data.categories || []));
  }, []);

  // ── Image upload ──────────────────────────────────────────────────────────
  const handleImageFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploadingImages(true);
    setImageUploadError('');

    try {
      const formData = new FormData();
      files.forEach(f => formData.append('images', f));

      const res = await fetch('/api/admin/upload-image', { method: 'POST', body: formData });
      const data = await res.json();

      if (data.success) {
        const newMap: Record<string, string> = { ...imageMap };
        (data.uploaded as { originalName: string; url: string }[]).forEach(u => {
          newMap[u.originalName] = u.url;
        });
        setImageMap(newMap);

        // Re-parse existing rows with updated image map (if data file already loaded)
        if (rows.length > 0) {
          setRows(prev => prev.map(row => {
            if (!row.image) return row;
            const fn = basename(row.image);
            if (newMap[fn] && row.image !== newMap[fn]) {
              return { ...row, image: newMap[fn] };
            }
            return row;
          }));
        }
      } else {
        setImageUploadError(data.error || 'Image upload failed');
      }
    } catch {
      setImageUploadError('Image upload failed. Please try again.');
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImageFromMap = (name: string) => {
    setImageMap(prev => {
      const updated = { ...prev };
      delete updated[name];
      return updated;
    });
  };

  // ── Data file (CSV / Excel) ───────────────────────────────────────────────
  const handleDataFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setResults(null);

    const ext = file.name.split('.').pop()?.toLowerCase();

    if (ext === 'csv') {
      const text = await file.text();
      setRows(parseCSV(text, categories, imageMap));
    } else if (ext === 'xlsx' || ext === 'xls') {
      const arrayBuffer = await file.arrayBuffer();
      const XLSX = await import('xlsx');
      const wb = XLSX.read(arrayBuffer, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const jsonData: Record<string, string>[] = XLSX.utils.sheet_to_json(ws, { defval: '' });

      const parsed: ParsedRow[] = jsonData.map(row => {
        const raw: Record<string, string> = {};
        Object.entries(row).forEach(([k, v]) => {
          raw[k.toLowerCase().replace(/\s+/g, '')] = String(v);
        });
        return buildRow(raw, categories, imageMap);
      });
      setRows(parsed);
    } else {
      alert('Please upload a .csv or .xlsx file');
    }
  };

  const validRows = rows.filter(r => !r._error);
  const invalidRows = rows.filter(r => r._error);

  const handleSubmit = async () => {
    if (validRows.length === 0) return;
    setUploading(true);
    try {
      const res = await fetch('/api/admin/products/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: validRows }),
      });
      const data = await res.json();
      setResults(data.results || []);
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const header = 'name,category,description,price,priceAmount,priceCurrency,image,packaging,Origin,Grade';
    const sample = 'Basmati Rice,Rice,Long grain aromatic rice,₹10/Kg,10,INR,rice.jpg,1kg,India,Premium';
    const blob = new Blob([header + '\n' + sample], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'products-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const uploadedImageCount = Object.keys(imageMap).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Bulk Upload</h1>
          <p className="text-slate-500 text-sm mt-1">Upload product images first, then upload your CSV or Excel file</p>
        </div>
        <button
          onClick={downloadTemplate}
          className="inline-flex items-center gap-2 border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm hover:bg-slate-50 transition"
        >
          ⬇ Download Template
        </button>
      </div>

      {/* Step 1 — Upload product images */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
          <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold flex-shrink-0">1</span>
          <div>
            <p className="font-semibold text-slate-800 text-sm">Upload Product Images <span className="text-slate-400 font-normal">(optional)</span></p>
            <p className="text-xs text-slate-500">Select all images from your computer. The filename (e.g. <code className="bg-slate-100 px-1 rounded">rice.jpg</code>) must match the image column in your CSV/Excel.</p>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <input
            ref={imagesFileRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageFiles}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => imagesFileRef.current?.click()}
            disabled={uploadingImages}
            className="w-full border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center gap-2 hover:border-primary hover:bg-primary/5 transition disabled:opacity-50 cursor-pointer"
          >
            {uploadingImages ? (
              <span className="text-sm text-slate-500">Uploading images...</span>
            ) : (
              <>
                <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-medium text-slate-600">Click to select product images</span>
                <span className="text-xs text-slate-400">Select multiple images at once — PNG, JPG, WEBP supported</span>
              </>
            )}
          </button>

          {imageUploadError && (
            <p className="text-sm text-red-500">{imageUploadError}</p>
          )}

          {uploadedImageCount > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-600 mb-2">{uploadedImageCount} image{uploadedImageCount !== 1 ? 's' : ''} ready</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {Object.entries(imageMap).map(([name, url]) => (
                  <div key={name} className="relative group rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={name} className="w-full h-24 object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => removeImageFromMap(name)}
                        className="bg-red-500 text-white text-xs px-2 py-1 rounded hover:bg-red-600"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="px-2 py-1 bg-white border-t border-slate-100">
                      <p className="text-xs text-slate-600 truncate" title={name}>{name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Step 2 — Upload CSV / Excel */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
          <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold flex-shrink-0">2</span>
          <div>
            <p className="font-semibold text-slate-800 text-sm">Upload Product Data (CSV or Excel)</p>
            <p className="text-xs text-slate-500">The <code className="bg-slate-100 px-1 rounded">image</code> column should contain the filename (e.g. <code className="bg-slate-100 px-1 rounded">rice.jpg</code>) — it will be matched to the images you uploaded above.</p>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Format guide */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <p className="text-xs font-semibold text-blue-800 mb-2">Required columns</p>
            <div className="flex flex-wrap gap-2">
              {REQUIRED_COLUMNS.map(c => (
                <span key={c} className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded font-medium">{c} *</span>
              ))}
              {['price', 'priceAmount', 'priceCurrency', 'image', 'packaging'].map(c => (
                <span key={c} className="bg-white text-slate-600 border border-slate-200 text-xs px-2 py-1 rounded">{c}</span>
              ))}
              <span className="bg-slate-100 text-slate-500 text-xs px-2 py-1 rounded italic">+ extra columns → specifications</span>
            </div>
            {categories.length > 0 && (
              <p className="text-xs text-blue-600 mt-2">Category must be one of: {categories.join(', ')}</p>
            )}
          </div>

          <input
            ref={dataFileRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleDataFile}
            className="hidden"
          />
          <div
            className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-primary transition cursor-pointer"
            onClick={() => dataFileRef.current?.click()}
          >
            <div className="text-4xl mb-2">📊</div>
            <p className="font-semibold text-slate-700 text-sm">
              {fileName ? fileName : 'Click to upload CSV or Excel file'}
            </p>
            <p className="text-slate-400 text-xs mt-1">Supports .csv, .xlsx, .xls</p>
          </div>
        </div>
      </div>

      {/* Preview table */}
      {rows.length > 0 && !results && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-800">{rows.length} rows found</p>
              <p className="text-xs text-slate-500 mt-0.5">
                <span className="text-emerald-600">{validRows.length} valid</span>
                {invalidRows.length > 0 && (
                  <span className="text-red-500 ml-2">{invalidRows.length} invalid (will be skipped)</span>
                )}
              </p>
            </div>
            <button
              onClick={handleSubmit}
              disabled={uploading || validRows.length === 0}
              className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-lg text-sm font-semibold transition disabled:opacity-50"
            >
              {uploading ? 'Submitting...' : `Submit ${validRows.length} for Approval`}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-4 py-2 text-slate-500 font-semibold">Image</th>
                  <th className="text-left px-4 py-2 text-slate-500 font-semibold">Name</th>
                  <th className="text-left px-4 py-2 text-slate-500 font-semibold">Category</th>
                  <th className="text-left px-4 py-2 text-slate-500 font-semibold">Price</th>
                  <th className="text-left px-4 py-2 text-slate-500 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} className={`border-b border-slate-50 ${row._error ? 'bg-red-50' : 'hover:bg-slate-50'}`}>
                    <td className="px-4 py-2.5">
                      {row.image && row.image.startsWith('/') ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={row.image} alt="" className="w-10 h-10 rounded object-cover bg-slate-100" />
                      ) : row.image ? (
                        <span className="text-amber-600 text-xs" title={row.image}>⚠ not matched</span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 font-medium text-slate-800">{row.name || '—'}</td>
                    <td className="px-4 py-2.5 text-slate-600">{row.category || '—'}</td>
                    <td className="px-4 py-2.5 text-slate-600">
                      {row.priceAmount ? `${row.priceCurrency} ${row.priceAmount}` : row.price || '—'}
                    </td>
                    <td className="px-4 py-2.5">
                      {row._error ? (
                        <span className="text-red-600">✕ {row._error}</span>
                      ) : (
                        <span className="text-emerald-600">✓ Valid</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h3 className="font-semibold text-slate-800 mb-4">
            Upload Complete — {results.filter(r => r.success).length}/{results.length} submitted
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {results.map((r, i) => (
              <div key={i} className={`flex items-center gap-2 text-sm p-2 rounded ${r.success ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                <span>{r.success ? '✓' : '✕'}</span>
                <span className="font-medium">{r.name}</span>
                {r.error && <span className="text-xs opacity-70">— {r.error}</span>}
              </div>
            ))}
          </div>
          <button
            onClick={() => router.push('/admin/products/pending')}
            className="mt-4 bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-lg text-sm font-medium transition"
          >
            Go to Pending Approvals →
          </button>
        </div>
      )}
    </div>
  );
}
