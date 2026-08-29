"use client";

import { useState } from "react";
import api from "@/lib/api";
import { getErrorMessage } from "@/lib/getErrorMessage";

export default function ImageUploader({
  images,
  onChange,
}: {
  images: string[];
  onChange: (urls: string[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post<{ url: string }>("/admin/upload/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onChange([...images, res.data.url]);
    } catch (err) {
      setError(getErrorMessage(err, "Tải ảnh thất bại"));
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeImage = (url: string) => {
    onChange(images.filter((img) => img !== url));
  };

  return (
    <div>
      <label className="text-sm text-neutral-600">Hình ảnh phòng</label>

      <div className="mt-2 flex flex-wrap gap-3">
        {images.map((url) => (
          <div key={url} className="relative h-20 w-20 overflow-hidden rounded-lg border border-neutral-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="room" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => removeImage(url)}
              className="absolute right-0 top-0 rounded-bl-lg bg-black/60 px-1.5 py-0.5 text-xs text-white"
            >
              ✕
            </button>
          </div>
        ))}

        <label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-lg border border-dashed border-neutral-300 text-xs text-neutral-500 hover:bg-neutral-50">
          {uploading ? "Đang tải..." : "+ Ảnh"}
          <input type="file" accept="image/*" onChange={handleFile} className="hidden" disabled={uploading} />
        </label>
      </div>

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}