"use client";

import { useState } from "react";
import { Star, Trash2, Upload, Eye, Image as ImageIcon } from "lucide-react";
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
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError("");
    setUploading(true);
    const newUrls: string[] = [];
    const total = files.length;

    try {
      for (let i = 0; i < total; i++) {
        setUploadProgress(`Đang tải ảnh ${i + 1}/${total}...`);
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);

        const res = await api.post<{ url: string }>("/admin/upload/image", formData);
        if (res.data.url) {
          newUrls.push(res.data.url);
        }
      }
      onChange([...images, ...newUrls]);
    } catch (err) {
      setError(getErrorMessage(err, "Tải ảnh thất bại"));
    } finally {
      setUploading(false);
      setUploadProgress("");
      e.target.value = "";
    }
  };

  const removeImage = (indexToRemove: number) => {
    onChange(images.filter((_, idx) => idx !== indexToRemove));
  };

  const setAsMain = (indexToMain: number) => {
    if (indexToMain === 0) return;
    const newImages = [...images];
    const [selected] = newImages.splice(indexToMain, 1);
    newImages.unshift(selected);
    onChange(newImages);
  };

  const mainImage = images[0];
  const galleryImages = images.slice(1);

  return (
    <div className="rounded-2xl border border-line bg-base/50 p-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <label className="flex items-center gap-2 font-medium text-ink">
            <ImageIcon size={18} className="text-primary" />
            Hình ảnh phòng ({images.length} ảnh)
          </label>
          <p className="mt-0.5 text-xs text-neutral-500">
            <b>Ảnh đầu tiên</b> sẽ làm ảnh đại diện bên ngoài thẻ phòng. Các ảnh còn lại sẽ là ảnh chi tiết bên trong khi khách bấm xem phòng.
          </p>
        </div>

        <label className="mt-2 inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-primary-dark sm:mt-0">
          <Upload size={14} />
          {uploading ? (uploadProgress || "Đang tải...") : "+ Chọn ảnh tải lên"}
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFiles}
            className="hidden"
            disabled={uploading}
          />
        </label>
      </div>

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

      {/* Main image highlight */}
      {mainImage ? (
        <div className="mt-4 space-y-3">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-600">
                <Star size={14} className="fill-amber-500 text-amber-500" />
                Ảnh chính (Hiển thị ở thẻ bên ngoài)
              </span>
            </div>
            <div className="group relative h-48 w-full overflow-hidden rounded-xl border-2 border-amber-500/40 bg-neutral-100 shadow-sm sm:h-56">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={mainImage} alt="Main room cover" className="h-full w-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => setPreviewUrl(mainImage)}
                  className="flex items-center gap-1 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-medium text-ink shadow hover:bg-white"
                >
                  <Eye size={14} /> Xem
                </button>
                <button
                  type="button"
                  onClick={() => removeImage(0)}
                  className="flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white shadow hover:bg-red-700"
                >
                  <Trash2 size={14} /> Xóa
                </button>
              </div>
              <span className="absolute bottom-2 left-2 rounded-md bg-black/70 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
                ⭐ Ảnh đại diện chính
              </span>
            </div>
          </div>

          {/* Gallery images */}
          {galleryImages.length > 0 && (
            <div className="pt-2">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-600">
                  Ảnh chi tiết bên trong ({galleryImages.length} ảnh)
                </span>
                <span className="text-[11px] text-neutral-400">
                  Bấm &quot;Đặt làm ảnh chính&quot; để đổi ảnh đại diện
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {galleryImages.map((url, index) => {
                  const actualIdx = index + 1;
                  return (
                    <div
                      key={url + actualIdx}
                      className="group relative h-28 overflow-hidden rounded-xl border border-line bg-neutral-100 shadow-xs"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`Detail ${actualIdx}`} className="h-full w-full object-cover" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/60 p-2 opacity-0 transition group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => setAsMain(actualIdx)}
                          className="flex w-full items-center justify-center gap-1 rounded-md bg-amber-500 py-1 text-[11px] font-semibold text-white shadow hover:bg-amber-600"
                        >
                          <Star size={12} className="fill-current" /> Đặt làm chính
                        </button>
                        <div className="flex w-full justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setPreviewUrl(url)}
                            className="rounded-md bg-white/90 p-1 text-ink hover:bg-white"
                            title="Xem ảnh"
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeImage(actualIdx)}
                            className="rounded-md bg-red-600 p-1 text-white hover:bg-red-700"
                            title="Xóa ảnh"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                      <span className="absolute bottom-1.5 left-1.5 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
                        #{actualIdx}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-3 flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300 py-8 text-center">
          <ImageIcon size={32} className="text-neutral-300" />
          <p className="mt-2 text-xs font-medium text-neutral-600">Chưa có ảnh nào được thêm</p>
          <p className="mt-0.5 text-[11px] text-neutral-400">
            Tải lên ít nhất 1 ảnh đại diện và các ảnh chi tiết (phòng ngủ, ban công, phòng tắm...)
          </p>
        </div>
      )}

      {/* Lightbox Preview Modal */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-80 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setPreviewUrl(null)}
        >
          <div className="relative max-h-[90vh] max-w-4xl overflow-hidden rounded-2xl bg-black">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="Preview" className="max-h-[85vh] w-auto object-contain" />
            <button
              type="button"
              onClick={() => setPreviewUrl(null)}
              className="absolute top-3 right-3 rounded-full bg-white/80 p-2 text-ink hover:bg-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}