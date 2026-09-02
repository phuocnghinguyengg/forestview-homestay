"use client";

import { useState } from "react";
import { Room, RoomTypeCode } from "@/types";
import ImageUploader from "./ImageUploader";
import { BedDouble, Building, DollarSign, FileText, Info } from "lucide-react";

export interface RoomFormValues {
  name: string;
  description: string;
  address: string;
  pricePerNight: number;
  maxGuests: number;
  recommendedGuests: number;
  extraGuestFee: number;
  weekendPrice?: number;
  holidayPrice?: number;
  images: string[];
  amenities: string[];
  type: RoomTypeCode;
  roomSize?: number;
  bedConfiguration?: string;
  viewDescription?: string;
  bathroomDescription?: string;
  floor?: string;
  checkInTime?: string;
  checkOutTime?: string;
  houseRules?: string;
}

const ROOM_TYPE_OPTIONS: { value: RoomTypeCode; label: string }[] = [
  { value: "STANDARD", label: "Standard Room" },
  { value: "SUPERIOR", label: "Superior Room" },
  { value: "DELUXE", label: "Deluxe Room" },
  { value: "SUITE", label: "Suite Room" },
];

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
    recommendedGuests: initial?.recommendedGuests ?? Math.min(2, initial?.maxGuests ?? 2),
    extraGuestFee: initial?.extraGuestFee ?? 0,
    weekendPrice: initial?.weekendPrice ?? undefined,
    holidayPrice: initial?.holidayPrice ?? undefined,
    images: initial?.images ?? [],
    amenities: initial?.amenities ?? [],
    type: initial?.type ?? "STANDARD",
    roomSize: initial?.roomSize ?? undefined,
    bedConfiguration: initial?.bedConfiguration ?? "",
    viewDescription: initial?.viewDescription ?? "",
    bathroomDescription: initial?.bathroomDescription ?? "",
    floor: initial?.floor ?? "",
    checkInTime: initial?.checkInTime ?? "14:00",
    checkOutTime: initial?.checkOutTime ?? "12:00",
    houseRules: initial?.houseRules ?? "",
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
    <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/50 p-3 backdrop-blur-xs sm:p-4">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-surface p-5 shadow-2xl sm:p-7">
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div>
            <h2 className="font-display text-xl text-ink sm:text-2xl">
              {initial ? "Sửa thông tin phòng" : "Thêm phòng mới"}
            </h2>
            <p className="mt-0.5 text-xs text-neutral-500">
              Quản lý thông tin lưu trú, giá và bộ sưu tập ảnh phòng
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-neutral-400 hover:bg-neutral-100 hover:text-ink"
          >
            ✕
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(form);
          }}
          className="mt-5 space-y-5"
        >
          {/* Section: Thông tin cơ bản */}
          <div className="space-y-3 rounded-2xl border border-line bg-base/30 p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
              <Building size={16} className="text-primary" /> Thông tin cơ bản
            </h3>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-neutral-600">Loại phòng *</label>
                <select
                  required
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as RoomTypeCode })}
                  className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none"
                >
                  {ROOM_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-600">Tên phòng *</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="VD: Phòng Sunset Deluxe 101"
                  className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-600">Địa chỉ / Vị trí *</label>
              <input
                required
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="VD: Đồi Dã Chiến, Phường 11, TP. Đà Lạt"
                className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-600">Mô tả giới thiệu phòng</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                placeholder="Mô tả không gian, phong cách bài trí..."
                className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Section: Thông tin lưu trú & Chi tiết */}
          <div className="space-y-3 rounded-2xl border border-line bg-base/30 p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
              <BedDouble size={16} className="text-primary" /> Chi tiết phòng &amp; Lưu trú
            </h3>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div>
                <label className="text-xs font-medium text-neutral-600">Diện tích (m²)</label>
                <input
                  type="number"
                  min={1}
                  value={form.roomSize ?? ""}
                  onChange={(e) => setForm({ ...form, roomSize: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="VD: 35"
                  className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-600">Tầng / Vị trí</label>
                <input
                  value={form.floor ?? ""}
                  onChange={(e) => setForm({ ...form, floor: e.target.value })}
                  placeholder="VD: Tầng 2, view rừng"
                  className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-600">Loại giường</label>
                <input
                  value={form.bedConfiguration ?? ""}
                  onChange={(e) => setForm({ ...form, bedConfiguration: e.target.value })}
                  placeholder="VD: 1 giường King lớn"
                  className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-600">Phòng tắm</label>
                <input
                  value={form.bathroomDescription ?? ""}
                  onChange={(e) => setForm({ ...form, bathroomDescription: e.target.value })}
                  placeholder="VD: Bồn tắm gỗ, tắm đứng"
                  className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <div className="col-span-2 sm:col-span-2">
                <label className="text-xs font-medium text-neutral-600">Hướng nhìn (View)</label>
                <input
                  value={form.viewDescription ?? ""}
                  onChange={(e) => setForm({ ...form, viewDescription: e.target.value })}
                  placeholder="VD: Đồi thông &amp; thung lũng sương mù"
                  className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-neutral-600">Giờ nhận phòng</label>
                <input
                  type="time"
                  value={form.checkInTime ?? "14:00"}
                  onChange={(e) => setForm({ ...form, checkInTime: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-neutral-600">Giờ trả phòng</label>
                <input
                  type="time"
                  value={form.checkOutTime ?? "12:00"}
                  onChange={(e) => setForm({ ...form, checkOutTime: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-600">Quy định phòng</label>
              <textarea
                rows={2}
                value={form.houseRules ?? ""}
                onChange={(e) => setForm({ ...form, houseRules: e.target.value })}
                placeholder="VD: Không hút thuốc lá trong phòng, giữ trật tự sau 22h..."
                className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Section: Giá & Sức chứa */}
          <div className="space-y-3 rounded-2xl border border-line bg-base/30 p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
              <DollarSign size={16} className="text-primary" /> Giá &amp; Sức chứa
            </h3>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div>
                <label className="text-xs font-medium text-neutral-600">Giá ngày thường / đêm *</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={form.pricePerNight || ""}
                  onChange={(e) => setForm({ ...form, pricePerNight: Number(e.target.value) })}
                  placeholder="VD: 600000"
                  className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-600">Giá cuối tuần (T6-CN)</label>
                <input
                  type="number"
                  min={0}
                  value={form.weekendPrice ?? ""}
                  onChange={(e) => setForm({ ...form, weekendPrice: e.target.value === "" ? undefined : Number(e.target.value) })}
                  placeholder="Mặc định: giá thường"
                  className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-600">Giá ngày lễ</label>
                <input
                  type="number"
                  min={0}
                  value={form.holidayPrice ?? ""}
                  onChange={(e) => setForm({ ...form, holidayPrice: e.target.value === "" ? undefined : Number(e.target.value) })}
                  placeholder="Mặc định: ×2 giá thường"
                  className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="text-xs font-medium text-neutral-600">Số khách tối đa *</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={form.maxGuests}
                  onChange={(e) => {
                    const max = Math.max(1, Number(e.target.value));
                    setForm({ ...form, maxGuests: max, recommendedGuests: Math.min(form.recommendedGuests, max) });
                  }}
                  className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-600">Số khách đề xuất</label>
                <input
                  type="number"
                  min={1}
                  max={form.maxGuests}
                  required
                  value={form.recommendedGuests}
                  onChange={(e) => setForm({ ...form, recommendedGuests: Math.min(form.maxGuests, Math.max(1, Number(e.target.value))) })}
                  className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-600">Phụ thu thêm khách/đêm</label>
                <input
                  type="number"
                  min={0}
                  value={form.extraGuestFee}
                  onChange={(e) => setForm({ ...form, extraGuestFee: Math.max(0, Number(e.target.value)) })}
                  className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section: Tiện ích */}
          <div>
            <label className="text-xs font-medium text-neutral-600">Tiện ích phòng</label>
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
                placeholder="VD: Wifi tốc độ cao, Ban công săn mây, Máy sấy tóc..."
                className="flex-1 rounded-xl border border-line bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
              <button
                type="button"
                onClick={addAmenity}
                className="rounded-xl border border-line px-4 py-2 text-sm font-medium hover:bg-neutral-100"
              >
                + Thêm
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {form.amenities.map((a) => (
                <span
                  key={a}
                  className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                >
                  {a}
                  <button
                    type="button"
                    onClick={() => removeAmenity(a)}
                    className="text-primary hover:text-red-600"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Section: Upload ảnh (Main & Gallery) */}
          <ImageUploader images={form.images} onChange={(images) => setForm({ ...form, images })} />

          {/* Buttons */}
          <div className="flex justify-end gap-3 border-t border-line pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-line px-5 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-primary px-7 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark disabled:opacity-50"
            >
              {submitting ? "Đang lưu..." : "Lưu thông tin phòng"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

