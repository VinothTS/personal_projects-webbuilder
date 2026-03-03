'use client';

import { useState, useRef } from 'react';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
}

export default function ImageUpload({ value, onChange }: ImageUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<'upload' | 'url'>(value ? 'url' : 'upload');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  // Local blob URL for instant preview before the server responds
  const [localPreview, setLocalPreview] = useState('');

  const previewSrc = localPreview || value;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show instant local preview
    const blobUrl = URL.createObjectURL(file);
    setLocalPreview(blobUrl);
    setUploadError('');
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('images', file);

      const res = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (data.success && data.uploaded?.[0]) {
        onChange(data.uploaded[0].url);
        setLocalPreview(''); // use server URL from now on
      } else {
        setUploadError(data.error || 'Upload failed');
        setLocalPreview('');
      }
    } catch {
      setUploadError('Upload failed. Please try again.');
      setLocalPreview('');
    } finally {
      setUploading(false);
    }
  };

  const clearImage = () => {
    onChange('');
    setLocalPreview('');
    setUploadError('');
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="space-y-3">
      {/* Mode toggle */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
            mode === 'upload' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Upload from Computer
        </button>
        <button
          type="button"
          onClick={() => setMode('url')}
          className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
            mode === 'url' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Enter URL
        </button>
      </div>

      {/* Upload input */}
      {mode === 'upload' && (
        <div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-full border-2 border-dashed border-slate-200 rounded-lg p-5 flex flex-col items-center gap-2 hover:border-primary hover:bg-primary/5 transition disabled:opacity-50 cursor-pointer"
          >
            {uploading ? (
              <span className="text-sm text-slate-500">Uploading...</span>
            ) : (
              <>
                <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm text-slate-500">Click to choose image from your computer</span>
                <span className="text-xs text-slate-400">PNG, JPG, WEBP, GIF supported</span>
              </>
            )}
          </button>
          {uploadError && (
            <p className="text-xs text-red-500 mt-1">{uploadError}</p>
          )}
        </div>
      )}

      {/* URL input */}
      {mode === 'url' && (
        <input
          type="text"
          value={value}
          onChange={e => { onChange(e.target.value); setLocalPreview(''); }}
          placeholder="https://example.com/image.jpg"
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      )}

      {/* Preview */}
      {previewSrc && (
        <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewSrc}
            alt="Preview"
            className="w-full max-h-48 object-cover"
            onError={() => { setLocalPreview(''); if (!value.startsWith('/')) onChange(''); }}
          />
          <div className="absolute top-2 right-2 flex gap-1">
            <button
              type="button"
              onClick={clearImage}
              className="bg-red-500 hover:bg-red-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-xs shadow transition"
              title="Remove image"
            >
              ✕
            </button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-xs px-2 py-1 truncate">
            {uploading ? 'Uploading...' : (value.startsWith('/') ? 'Uploaded ✓' : value)}
          </div>
        </div>
      )}
    </div>
  );
}
