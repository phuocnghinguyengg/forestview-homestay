"use client";

import { useState } from "react";
import { Room, RoomTypeCode } from "@/types";
import ImageUploader from "./ImageUploader";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-surface p-6">
        <h2 className="font-display text-xl text-ink">
          {initial ? "Sửa thông tin phòng" : "Thêm phòng mới"}
        </h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(form);
          }}
          className="mt-4 space-y-4"
        >
          <div>
            <label className="text-sm text-neutral-600">Loại phòng</label>
            <select
              required
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as RoomTypeCode })}
              className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm focus:border-primary focus:outline-none"
            >
              {ROOM_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <fieldset className="rounded-xl border border-line p-4">
            <legend className="px-1 text-sm font-medium text-ink">Thông tin lưu trú chi tiết</legend>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <div><label className="text-sm text-neutral-600">Diện tích (m²)</label><input type="number" min={1} value={form.roomSize ?? ""} onChange={(e) => setForm({ ...form, roomSize: e.target.value ? Number(e.target.value) : undefined })} className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm" /></div>
              <div><label className="text-sm text-neutral-600">Tầng / vị trí</label><input value={form.floor ?? ""} onChange={(e) => setForm({ ...form, floor: e.target.value })} className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm" /></div>
              <div><label className="text-sm text-neutral-600">Loại giường</label><input value={form.bedConfiguration ?? ""} onChange={(e) => setForm({ ...form, bedConfiguration: e.target.value })} placeholder="VD: 1 king bed" className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm" /></div>
              <div><label className="text-sm text-neutral-600">Phòng tắm</label><input value={form.bathroomDescription ?? ""} onChange={(e) => setForm({ ...form, bathroomDescription: e.target.value })} placeholder="VD: Tắm đứng, nước nóng" className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm" /></div>
              <div className="col-span-2"><label className="text-sm text-neutral-600">Hướng nhìn</label><input value={form.viewDescription ?? ""} onChange={(e) => setForm({ ...form, viewDescription: e.target.value })} placeholder="VD: Đồi thông và thung lũng" className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm" /></div>
              <div><label className="text-sm text-neutral-600">Giờ nhận phòng</label><input type="time" value={form.checkInTime ?? ""} onChange={(e) => setForm({ ...form, checkInTime: e.target.value })} className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm" /></div>
              <div><label className="text-sm text-neutral-600">Giờ trả phòng</label><input type="time" value={form.checkOutTime ?? ""} onChange={(e) => setForm({ ...form, checkOutTime: e.target.value })} className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm" /></div>
            </div>
            <label className="mt-3 block text-sm text-neutral-600">Quy định phòng</label><textarea rows={2} value={form.houseRules ?? ""} onChange={(e) => setForm({ ...form, houseRules: e.target.value })} placeholder="VD: Không hút thuốc, không tổ chức tiệc..." className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm" />
          </fieldset>

          <div>
            <label className="text-sm text-neutral-600">Tên phòng</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="text-sm text-neutral-600">Địa chỉ</label>
            <input
              required
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="text-sm text-neutral-600">Mô tả</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-neutral-600">Giá / đêm (VNĐ)</label>
              <input
                type="number"
                required
                min={0}
                value={form.pricePerNight}
                onChange={(e) => setForm({ ...form, pricePerNight: Number(e.target.value) })}
                className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="text-sm text-neutral-600">Số khách tối đa</label>
              <input
                type="number"
                required
                min={1}
                value={form.maxGuests}
                onChange={(e) => { const max = Math.max(1, Number(e.target.value)); setForm({ ...form, maxGuests: max, recommendedGuests: Math.min(form.recommendedGuests, max) }); }}
                className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="text-sm text-neutral-600">Khách đề xuất</label>
              <input type="number" min={1} max={form.maxGuests} required value={form.recommendedGuests} onChange={(e) => setForm({ ...form, recommendedGuests: Math.min(form.maxGuests, Math.max(1, Number(e.target.value))) })} className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm focus:border-primary focus:outline-none" />
            </div>
            <div>
              <label className="text-sm text-neutral-600">Phụ thu / khách / đêm</label>
              <input type="number" min={0} value={form.extraGuestFee} onChange={(e) => setForm({ ...form, extraGuestFee: Math.max(0, Number(e.target.value)) })} className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm focus:border-primary focus:outline-none" />
            </div>
            <div>
              <label className="text-sm text-neutral-600">Giá cuối tuần</label>
              <input type="number" min={0} value={form.weekendPrice ?? ""} onChange={(e) => setForm({ ...form, weekendPrice: e.target.value === "" ? undefined : Number(e.target.value) })} className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm focus:border-primary focus:outline-none" />
            </div>
          </div>

          <div>
            <label className="text-sm text-neutral-600">Giá ngày lễ (ưu tiên hơn tự động ×2)</label>
            <input type="number" min={0} value={form.holidayPrice ?? ""} onChange={(e) => setForm({ ...form, holidayPrice: e.target.value === "" ? undefined : Number(e.target.value) })} className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm focus:border-primary focus:outline-none" />
            <p className="mt-1 text-xs text-neutral-400">Nếu để trống, các đại lễ Việt Nam sẽ tự động dùng giá thường ×2.</p>
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
                className="flex-1 rounded-lg border border-line px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
              <button
                type="button"
                onClick={addAmenity}
                className="rounded-lg border border-line px-3 py-2 text-sm hover:bg-neutral-50"
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
              className="rounded-full border border-line px-4 py-2 text-sm hover:bg-neutral-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-white transition hover:bg-primary-dark disabled:opacity-50"
            >
              {submitting ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
