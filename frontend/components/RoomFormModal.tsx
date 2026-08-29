"use client";

import { useState } from "react";
import { Room } from "@/types";
import ImageUploader from "./ImageUploader";

export interface RoomFormValues {
  name: string;
  description: string;
  address: string;
  pricePerNight: number;
  maxGuests: number;
  images: string[];
  amenities: string[];
  type: "SINGLE" | "DOUBLE" | "FAMILY" | "DELUXE";
}

export default function RoomFormModal({
  initial,
  onClose,
  onSubmit,
  submitting,
}: {
  initial?: Room;
  onClose: () => void;
  onSubmit: (values: RoomFormValues) => void;
  submitting: boolean;
}) {
  const [form, setForm] = useState<RoomFormValues>({
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    address: initial?.address ?? "",
    pricePerNight: initial?.pricePerNight ?? 0,
    maxGuests: initial?.maxGuests ?? 2,
    images: initial?.images ?? [],
    amenities: initial?.amenities ?? [],
    type: initial?.type ?? "DELUXE",
  });
  const [amenityInput, setAmenityInput] = useState("");

  const addAmenity = () => {
    const val = amenityInput.trim();
    if (val && !form.amenities.includes(val)) {
      setForm({ ...form, amenities: [...form.amenities, val] });
    }
    setAmenityInput("");
  };

  const removeAmenity = (a: string) => {
    setForm({ ...form, amenities: form.amenities.filter((x) => x !== a) });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6">
        <h2 className="text-lg font-bold text-neutral-900">
          {initial ? "Sửa thông tin phòng" : "Thêm phòng mới"}
        </h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();

            const name = form.name.trim();
            const address = form.address.trim();
            const description = form.description.trim();
            const pricePerNight = Number(form.pricePerNight);
            const maxGuests = Number(form.maxGuests);

            if (!name || !address) {
              alert("Vui lòng nhập tên phòng và địa chỉ.");
              return;
            }

            if (!Number.isFinite(pricePerNight) || pricePerNight <= 0) {
              alert("Giá phòng phải lớn hơn 0.");
              return;
            }

            if (!Number.isInteger(maxGuests) || maxGuests < 1) {
              alert("Số khách tối đa phải từ 1 trở lên.");
              return;
            }

            onSubmit({
              ...form,
              name,
              address,
              description,
              pricePerNight,
              maxGuests,
              images: Array.isArray(form.images) ? form.images.filter(Boolean) : [],
              amenities: Array.isArray(form.amenities)
                ? form.amenities.map((item) => item.trim()).filter(Boolean)
                : [],
              type: form.type || "DELUXE",
            });
          }}
          className="mt-4 space-y-4"
        >
          <div>
            <label className="text-sm text-neutral-600">Tên phòng</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="text-sm text-neutral-600">Địa chỉ</label>
            <input
              required
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="text-sm text-neutral-600">Mô tả</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-neutral-600">Giá / đêm (VNĐ)</label>
              <input
                type="number"
                required
                min={1}
                value={form.pricePerNight}
                onChange={(e) => setForm({ ...form, pricePerNight: Number(e.target.value) })}
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm text-neutral-600">Số khách tối đa</label>
              <input
                type="number"
                required
                min={1}
                value={form.maxGuests}
                onChange={(e) => setForm({ ...form, maxGuests: Number(e.target.value) })}
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-neutral-600">Loại phòng</label>
            <select
              required
              value={form.type}
              onChange={(e) =>
                setForm({
                  ...form,
                  type: e.target.value as RoomFormValues["type"],
                })
              }
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            >
              <option value="SINGLE">Phòng đơn</option>
              <option value="DOUBLE">Phòng đôi</option>
              <option value="FAMILY">Phòng gia đình</option>
              <option value="DELUXE">Phòng Deluxe</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-neutral-600">Tiện ích</label>
            <div className="mt-1 flex gap-2">
              <input
                value={amenityInput}
                onChange={(e) => setAmenityInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addAmenity();
                  }
                }}
                placeholder="VD: Wifi, Bể bơi..."
                className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={addAmenity}
                className="rounded-lg border border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-50"
              >
                Thêm
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {form.amenities.map((a) => (
                <span
                  key={a}
                  className="flex items-center gap-1 rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-700"
                >
                  {a}
                  <button type="button" onClick={() => removeAmenity(a)} className="text-neutral-400">
                    ✕
                  </button>
                </span>
              ))}
            </div>
          </div>

          <ImageUploader images={form.images} onChange={(images) => setForm({ ...form, images })} />

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-rose-600 px-5 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50"
            >
              {submitting ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}