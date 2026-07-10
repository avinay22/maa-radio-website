"use client";

import React, { useRef, useState } from "react";
import { Upload, X, ImageIcon } from "lucide-react";

interface ImageUploaderProps {
  value: string; // current image URL or Base64
  onChange: (value: string) => void;
  label?: string;
  maxSizeMB?: number;
  aspectHint?: string; // e.g. "square" | "landscape" | "any"
}

export default function ImageUploader({
  value,
  onChange,
  label = "Product Image",
  maxSizeMB = 2,
  aspectHint = "any",
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    setError("");
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (PNG, JPG, WebP, AVIF).");
      return;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`Image must be under ${maxSizeMB}MB. Please compress or resize it first.`);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) onChange(e.target.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) processFile(e.target.files[0]);
    // Reset input so same file can be re-selected after removal
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-[10px] font-bold uppercase text-[#666666] tracking-wider block">
          {label}
        </label>
      )}

      {/* Hidden native file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
        aria-label={`Upload ${label}`}
      />

      {!value ? (
        /* ── Empty State: Dropzone ───────────────────────────────────────── */
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
          className={`border-2 border-dashed rounded-sm p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#7A2E2E]/30 ${
            isDragging
              ? "border-[#7A2E2E] bg-[#7A2E2E]/5"
              : "border-[#E2E2DF] bg-white hover:border-[#8A6A44] hover:bg-[#F8F8F6]"
          }`}
        >
          <div className="w-12 h-12 rounded-sm bg-[#F8F8F6] border border-[#E2E2DF] flex items-center justify-center text-[#8A6A44] mb-4">
            {isDragging ? <ImageIcon size={20} /> : <Upload size={20} />}
          </div>
          <p className="text-sm font-bold text-[#222222]">
            {isDragging ? "Drop image here" : "Drag & drop image here"}
          </p>
          <p className="text-xs text-[#666666] mt-1">
            or{" "}
            <span className="text-[#7A2E2E] underline font-semibold">
              browse from your device
            </span>
          </p>
          {aspectHint !== "any" && (
            <p className="text-[9px] text-[#999999] mt-1 capitalize">
              Best: {aspectHint} format
            </p>
          )}
          <p className="text-[9px] text-[#AAAAAA] mt-3">
            PNG, JPG, WebP — max {maxSizeMB}MB
          </p>
        </div>
      ) : (
        /* ── Filled State: Preview ───────────────────────────────────────── */
        <div className="border border-[#E2E2DF] bg-white p-3 space-y-3">
          <div className="bg-[#F8F8F6] flex items-center justify-center p-4 border border-[#E2E2DF] min-h-[140px]">
            <img
              src={value}
              alt="Preview"
              className="max-h-[160px] w-auto object-contain drop-shadow-sm"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex-1 py-2 border border-[#E2E2DF] hover:bg-[#F8F8F6] text-[10px] font-bold uppercase tracking-wider text-[#222222] transition-colors"
            >
              Change Image
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              title="Remove image"
              className="px-3 border border-[#E2E2DF] hover:border-[#7A2E2E] hover:text-[#7A2E2E] text-[#666666] transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="text-[10px] text-[#7A2E2E] font-semibold">{error}</p>
      )}
    </div>
  );
}
