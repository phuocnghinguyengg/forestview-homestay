"use client";

import { RoomTypeAvailability, RoomTypeCode } from "@/types";

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}

function formatDate(date: string) {
  if (!date) return "";
  return new Date(`${date}T00:00:00`).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function RoomSearchResultsModal({
  results,
  checkIn,
  checkOut,
  nights,
  onSelectType,
  onClose,
}: {
  results: RoomTypeAvailability[];
  checkIn: string;
  checkOut: string;
  nights: number;
  onSelectType: (type: RoomTypeCode) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-surface shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-line bg-surface/95 px-6 py-5 backdrop-blur sm:px-8">
          <div>
            <p className="font-display text-sm italic text-accent">
              ForestView Homestay · Đà Lạt
            </p>

            <h2 className="mt-1 font-display text-2xl text-ink sm:text-3xl">
              Phòng còn trống ({nights} đêm)
            </h2>

            <p className="mt-1 text-sm text-neutral-500">
              {formatDate(checkIn)} → {formatDate(checkOut)} · <b>{nights} đêm lưu trú</b>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="rounded-full border border-line p-2.5 text-neutral-500 transition hover:bg-neutral-100 hover:text-ink"
          >
            ✕
          </button>
        </div>

        <div className="grid gap-5 p-6 sm:grid-cols-2 lg:grid-cols-3 sm:p-8">
          {results.map((rt) => {
            const soldOut = rt.availableRooms <= 0;

            return (
              <button
                key={rt.type}
                type="button"
                disabled={soldOut}
                onClick={() => onSelectType(rt.type)}
                className={`group overflow-hidden rounded-3xl border border-line bg-surface text-left transition ${
                  soldOut
                    ? "cursor-not-allowed opacity-50"
                    : "hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
                }`}
              >
                <div className="relative h-44 overflow-hidden bg-neutral-100">
                  {rt.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={rt.coverImage}
                      alt={rt.label}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-neutral-400">
                      Chưa có hình ảnh
                    </div>
                  )}

                  <span
                    className={`absolute top-3 left-3 rounded-full px-3 py-1 text-xs font-semibold shadow-xs ${
                      soldOut ? "bg-neutral-200 text-neutral-600" : "bg-primary text-white"
                    }`}
                  >
                    {soldOut ? "Hết phòng" : `Còn ${rt.availableRooms} phòng`}
                  </span>
                </div>

                <div className="p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
                    Loại phòng
                  </p>

                  <h3 className="mt-1 font-display text-xl text-ink">
                    {rt.label}
                  </h3>

                  <p className="mt-1.5 text-xs text-neutral-500">
                    Tổng {rt.totalRooms} phòng trong hệ thống
                  </p>

                  <div className="mt-4 border-t border-line/60 pt-3">
                    <span className="text-xs text-neutral-400">Giá trọn gói</span>
                    <p className="text-lg font-bold text-accent">
                      {rt.minPrice == null ? "Liên hệ" : formatPrice(rt.minPrice)}
                      {rt.minPrice != null && (
                        <span className="ml-1 text-xs font-normal text-neutral-500">
                          / {nights} đêm
                        </span>
                      )}
                    </p>
                  </div>

                  <span
                    className={`mt-4 inline-flex w-full items-center justify-center rounded-full py-2.5 text-xs font-semibold text-white shadow-xs transition ${
                      soldOut ? "bg-neutral-300 text-neutral-500" : "bg-primary group-hover:bg-primary-dark"
                    }`}
                  >
                    {soldOut ? "Không khả dụng" : "Xem & chọn phòng →"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {results.length === 0 && (
          <div className="px-6 pb-12 text-center text-sm text-neutral-500">
            Không có loại phòng nào phù hợp trong khoảng {nights} đêm đã chọn.
          </div>
        )}
      </div>
    </div>
  );
}

