import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Loader } from 'lucide-react';

export default function DragDropUpload({ images = [], onImagesChange, onUpload, uploading = false, label = 'Upload photos', hint = 'JPG, PNG or WebP' }) {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (files.length > 0) onUpload(files);
  }, [onUpload]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) onUpload(files);
    e.target.value = '';
  };

  const removeImage = (index) => {
    onImagesChange(images.filter((_, i) => i !== index));
  };

  return (
    <div>
      {/* Existing images */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-4">
          {images.map((img, i) => (
            <div key={i} className="relative group">
              <img src={img} alt={`Photo ${i + 1}`} className="w-24 h-24 rounded-lg object-cover border border-stone-200" />
              <button
                onClick={() => removeImage(i)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          dragOver
            ? 'border-brand-500 bg-brand-50 scale-[1.01]'
            : 'border-stone-300 hover:border-brand-400 hover:bg-stone-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-2 py-2">
            <Loader className="w-8 h-8 text-brand-600 animate-spin" />
            <p className="text-sm text-brand-700 font-medium">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-2">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${dragOver ? 'bg-brand-100' : 'bg-stone-100'}`}>
              <Upload className={`w-6 h-6 ${dragOver ? 'text-brand-600' : 'text-stone-400'}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-stone-700">
                {dragOver ? 'Drop photos here' : label}
              </p>
              <p className="text-xs text-stone-500 mt-0.5">Drag & drop or click to browse. {hint}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
