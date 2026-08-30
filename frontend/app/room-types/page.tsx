"use client";

import { useState } from "react";
import { roomTypeService } from "@/lib/services/roomTypeService";
import { RoomTypeAvailability, RoomTypeCode } from "@/types";
import { getErrorMessage } from "@/lib/getErrorMessage";
import RoomTypeBookingModal from "@/components/RoomTypeBookingModal";

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
}

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

type SortOption = "none" | "price-asc" | "price-desc";

const TYPE_FILTER_OPTIONS: { value: RoomTypeCode | "ALL"; label: string }[] = [
  { value: "ALL", label: "Tất cả loại phòng" },
  { value: "SINGLE", label: "Phòng đơn" },
  { value: "DOUBLE", label: "Phòng đôi" },
  { value: "FAMILY", label: "Phòng gia đình" },
  { value: "DELUXE", label: "Phòng cao cấp" },
];

export default function RoomTypesPage() {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [typeFilter, setTypeFilter] = useState<RoomTypeCode | "ALL">("ALL");
  const [results, setResults] = useState<RoomTypeAvailability[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sort, setSort] = useState<SortOption>("none");

  const [activeModal, setActiveModal] = useState<{ type: RoomTypeCode; label: string } | null>(null);

  const handleSearch = async () => {
    setError("");

    if (!checkIn || !checkOut) {
      setError("Vui lòng chọn đầy đủ ngày nhận và trả phòng");
      return;
    }
    if (checkOut <= checkIn) {
      setError("Ngày trả phòng phải sau ngày nhận phòng");
      return;
    }

    setLoading(true);
    try {
      const data = await roomTypeService.getAvailability(checkIn, checkOut);
      const filtered = typeFilter === "ALL" ? data : data.filter((rt) => rt.type === typeFilter);
      setResults(filtered);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const sortedResults = results
    ? [...results].sort((a, b) => {
        if (sort === "price-asc") return (a.minPrice ?? Infinity) - (b.minPrice ?? Infinity);
        if (sort === "price-desc") return (b.minPrice ?? -Infinity) - (a.minPrice ?? -Infinity);
        return 0;
      })
    : [];

  return (
    <main className="mx-auto max-w-5xl px-5 py-16">
      <p className="font-display text-sm italic text-accent">Đà Lạt, Lâm Đồng</p>
      <h1 className="mt-1 font-display text-3xl text-ink">Chọn phòng</h1>
      <p className="mt-2 text-neutral-600">
        Chọn ngày và loại phòng để kiểm tra tình trạng còn trống.
      </p>

      <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-line bg-surface p-5 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="text-sm text-neutral-600">Nhận phòng</label>
          <input
            type="date"
            value={checkIn}
            min={todayISO()}
            onChange={(e) => setCheckIn(e.target.value)}
            className="mt-1 w-full rounded-lg border border-line px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
          />
        </div>
        <div className="flex-1">
          <label className="text-sm text-neutral-600">Trả phòng</label>
          <input
            type="date"
            value={checkOut}
            min={checkIn || todayISO()}
            onChange={(e) => setCheckOut(e.target.value)}
            className="mt-1 w-full rounded-lg border border-line px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
          />
        </div>
        <div className="flex-1">
          <label className="text-sm text-neutral-600">Loại phòng</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as RoomTypeCode | "ALL")}
            className="mt-1 w-full rounded-lg border border-line px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
          >
            {TYPE_FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleSearch}
          disabled={loading}
          className="rounded-full bg-primary px-8 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-50"
        >
          {loading ? "Đang tìm..." : "Kiểm tra phòng trống"}
        </button>
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {results === null && !loading && (
        <p className="mt-10 text-center text-sm text-neutral-500">
          Nhập ngày và chọn loại phòng, sau đó bấm &quot;Kiểm tra phòng trống&quot; để xem kết quả.
        </p>
      )}

      {results !== null && (
        <>
          <div className="mt-8 flex items-center justify-between">
            <span className="text-sm text-neutral-500">{sortedResults.length} loại phòng</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="rounded-lg border border-line px-3 py-1.5 text-sm focus:border-primary focus:outline-none"
            >
              <option value="none">Sắp xếp mặc định</option>
              <option value="price-asc">Giá: thấp đến cao</option>
              <option value="price-desc">Giá: cao đến thấp</option>
            </select>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {sortedResults.map((rt) => {
              const soldOut = rt.availableRooms === 0;
              return (
                <button
                  key={rt.type}
                  onClick={() => !soldOut && setActiveModal({ type: rt.type, label: rt.label })}
                  disabled={soldOut}
                  className={`flex items-center gap-4 rounded-2xl border border-line bg-surface p-4 text-left transition ${
                    soldOut ? "cursor-not-allowed opacity-50" : "hover:border-primary hover:shadow-sm"
                  }`}
                >
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-t-2xl rounded-b-md bg-neutral-100">
                    {rt.coverImage && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={rt.coverImage} alt={rt.label} className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display text-lg text-ink">{rt.label}</h3>
                    {rt.minPrice && (
                      <p className="text-sm font-medium text-accent">
                        Từ {formatPrice(rt.minPrice)}
                        <span className="text-xs font-normal text-neutral-400"> /đêm</span>
                      </p>
                    )}
                    <p className="mt-1 text-sm text-neutral-500">
                      {soldOut ? "Đã hết phòng" : `Còn ${rt.availableRooms}/${rt.totalRooms} phòng`}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      soldOut ? "bg-neutral-100 text-neutral-500" : "bg-primary/10 text-primary"
                    }`}
                  >
                    {soldOut ? "Hết phòng" : "Còn phòng"}
                  </span>
                </button>
              );
            })}

            {sortedResults.length === 0 && (
              <p className="text-sm text-neutral-500">Không có loại phòng nào khớp với lựa chọn của bạn.</p>
            )}
          </div>
        </>
      )}

      {activeModal && (
        <RoomTypeBookingModal
          type={activeModal.type}
          typeLabel={activeModal.label}
          checkIn={checkIn}
          checkOut={checkOut}
          onClose={() => setActiveModal(null)}
        />
      )}
    </main>
  );
}