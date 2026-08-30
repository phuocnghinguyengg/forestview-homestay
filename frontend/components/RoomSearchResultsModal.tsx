"use client";

import { RoomTypeAvailability, RoomTypeCode } from "@/types";

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
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
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-[2rem] bg-surface shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-line bg-surface/95 px-6 py-5 backdrop-blur sm:px-8">
          <div>
            <p className="font-display text-sm italic text-accent">
              ForestView Homestay
            </p>

            <h2 className="mt-1 font-display text-2xl text-ink sm:text-3xl">
              Phòng còn trống
            </h2>

            <p className="mt-1 text-sm text-neutral-500">
              {checkIn} → {checkOut} · {nights} đêm
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="rounded-full border border-line px-3 py-2 text-neutral-500 hover:bg-base hover:text-ink"
          >
            ✕
          </button>
        </div>

        <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3 sm:p-8">
          {results.map((rt) => {
            const soldOut = rt.availableRooms <= 0;

            return (
              <button
                key={rt.type}
                type="button"
                disabled={soldOut}
                onClick={() => onSelectType(rt.type)}
                className={`overflow-hidden rounded-2xl border border-line bg-white text-left transition ${
                  soldOut
                    ? "cursor-not-allowed opacity-50"
                    : "hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-lg"
                }`}
              >
                <div className="relative h-44 overflow-hidden bg-neutral-100">
                  {rt.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={rt.coverImage}
                      alt={rt.label}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-neutral-400">
                      Chưa có hình ảnh
                    </div>
                  )}

                  <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-primary shadow-sm">
                    {soldOut
                      ? "Hết phòng"
                      : `Còn ${rt.availableRooms} phòng`}
                  </span>
                </div>

                <div className="p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
                    Loại phòng
                  </p>

                  <h3 className="mt-1 font-display text-xl text-ink">
                    {rt.label}
                  </h3>

                  <p className="mt-2 text-sm text-neutral-500">
                    Tổng {rt.totalRooms} phòng
                  </p>

                  <p className="mt-4 text-lg font-semibold text-primary">
                    {rt.minPrice == null
                      ? "Liên hệ"
                      : formatPrice(rt.minPrice)}

                    {rt.minPrice != null && (
                      <span className="ml-1 text-xs font-normal text-neutral-400">
                        / đêm
                      </span>
                    )}
                  </p>

                  <span className="mt-4 inline-flex rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white">
                    {soldOut ? "Không khả dụng" : "Xem phòng"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {results.length === 0 && (
          <div className="px-6 pb-8 text-center text-sm text-neutral-500">
            Không có loại phòng phù hợp.
          </div>
        )}
      </div>
    </div>
  );
}