"use client";

import { useMemo, useState } from "react";
import { roomTypeService } from "@/lib/services/roomTypeService";
import { RoomTypeAvailability, RoomTypeCode } from "@/types";
import { getErrorMessage } from "@/lib/getErrorMessage";
import RoomTypeBookingModal from "@/components/RoomTypeBookingModal";
import DateRangeCalendar from "@/components/DateRangeCalendar";
import { CalendarDays, ChevronRight, Sparkles } from "lucide-react";

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
}

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

function formatDate(date: string) {
  if (!date) return "";
  return new Date(`${date}T00:00:00`).toLocaleDateString("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getNights(a: string, b: string) {
  if (!a || !b) return 1;
  const start = new Date(`${a}T00:00:00`).getTime();
  const end = new Date(`${b}T00:00:00`).getTime();
  return Math.max(1, Math.round((end - start) / 86400000));
}

type SortOption = "none" | "price-asc" | "price-desc";

const TYPE_FILTER_OPTIONS: { value: RoomTypeCode | "ALL"; label: string }[] = [
  { value: "ALL", label: "Tất cả loại phòng" },
  { value: "STANDARD", label: "Standard Room" },
  { value: "SUPERIOR", label: "Superior Room" },
  { value: "DELUXE", label: "Deluxe Room" },
  { value: "SUITE", label: "Suite Room" },
];

export default function RoomTypesPage() {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [typeFilter, setTypeFilter] = useState<RoomTypeCode | "ALL">("ALL");
  const [results, setResults] = useState<RoomTypeAvailability[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sort, setSort] = useState<SortOption>("none");
  const [calendarOpen, setCalendarOpen] = useState(true);

  const [activeModal, setActiveModal] = useState<{ type: RoomTypeCode; label: string } | null>(null);

  const nights = useMemo(() => getNights(checkIn, checkOut), [checkIn, checkOut]);

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
      setCalendarOpen(false);
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
    <main className="mx-auto max-w-5xl px-5 py-12 sm:py-16">
      <p className="font-display text-sm italic text-accent">Đà Lạt, Lâm Đồng</p>
      <h1 className="mt-1 font-display text-3xl text-ink sm:text-4xl">Chọn phòng nghỉ dưỡng</h1>
      <p className="mt-2 text-sm text-neutral-600 sm:text-base">
        Chọn lịch lưu trú để kiểm tra chính xác số phòng còn trống và mức giá tốt nhất theo số đêm.
      </p>

      {/* Calendar search section */}
      <div className="mt-8 rounded-3xl border border-line bg-surface p-5 shadow-xs sm:p-7">
        {calendarOpen ? (
          <>
            <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
              <CalendarDays size={16} /> Chọn ngày nhận và trả phòng
            </div>
            <DateRangeCalendar
              checkIn={checkIn}
              checkOut={checkOut}
              minDate={todayISO()}
              onChange={(a, b) => {
                setCheckIn(a);
                setCheckOut(b);
              }}
            />
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1">
                <label className="text-xs font-medium text-neutral-600">Lọc theo hạng phòng</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as RoomTypeCode | "ALL")}
                  className="mt-1 w-full rounded-xl border border-line bg-base/50 px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
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
                className="rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark disabled:opacity-50"
              >
                {loading ? "Đang tìm phòng..." : checkIn && checkOut ? `Kiểm tra phòng (${nights} đêm)` : "Kiểm tra phòng trống"}
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="rounded-xl border border-line bg-base/50 px-3 py-2">
                Nhận: <b>{formatDate(checkIn)}</b>
              </span>
              <span className="rounded-xl border border-line bg-base/50 px-3 py-2">
                Trả: <b>{formatDate(checkOut)}</b>
              </span>
              <span className="rounded-xl bg-primary/10 px-3 py-2 font-semibold text-primary">
                <b>{nights}</b> đêm lưu trú
              </span>
              <span className="rounded-xl border border-line px-3 py-2 text-neutral-600">
                {TYPE_FILTER_OPTIONS.find((o) => o.value === typeFilter)?.label}
              </span>
            </div>
            <button
              onClick={() => setCalendarOpen(true)}
              className="self-start rounded-full border border-line px-4 py-2 text-sm font-medium transition hover:bg-neutral-100 sm:self-auto"
            >
              Đổi ngày / loại phòng
            </button>
          </div>
        )}
      </div>

      {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}

      {results === null && !loading && (
        <div className="mt-10 rounded-3xl border border-dashed border-neutral-300 p-10 text-center text-sm text-neutral-500">
          <CalendarDays size={32} className="mx-auto text-neutral-300" />
          <p className="mt-2 font-medium">Vui lòng chọn ngày nhận và trả phòng</p>
          <p className="mt-0.5 text-xs text-neutral-400">
            Sau đó bấm &quot;Kiểm tra phòng trống&quot; để xem danh sách phòng còn trống theo số đêm.
          </p>
        </div>
      )}

      {results !== null && (
        <>
          <div className="mt-10 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="font-display text-xl text-ink">Kết quả tìm kiếm</span>
              <span className="ml-2 text-xs font-semibold text-primary">
                ({nights} đêm lưu trú: {formatDate(checkIn)} → {formatDate(checkOut)})
              </span>
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="rounded-xl border border-line bg-surface px-3 py-2 text-xs focus:border-primary focus:outline-none"
            >
              <option value="none">Sắp xếp mặc định</option>
              <option value="price-asc">Giá: thấp đến cao</option>
              <option value="price-desc">Giá: cao đến thấp</option>
            </select>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {sortedResults.map((rt) => {
              const soldOut = rt.availableRooms === 0;
              return (
                <button
                  key={rt.type}
                  onClick={() => !soldOut && setActiveModal({ type: rt.type, label: rt.label })}
                  disabled={soldOut}
                  className={`group flex items-center gap-4 rounded-3xl border border-line bg-surface p-4 text-left transition ${
                    soldOut
                      ? "cursor-not-allowed opacity-50"
                      : "hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                  }`}
                >
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-neutral-100 sm:h-28 sm:w-28">
                    {rt.coverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={rt.coverImage}
                        alt={rt.label}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-neutral-400">
                        Chưa có ảnh
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-display text-lg font-semibold text-ink group-hover:text-primary transition">
                      {rt.label}
                    </h3>

                    {rt.minPrice != null && (
                      <p className="mt-1 text-sm font-bold text-accent">
                        Từ {formatPrice(rt.minPrice)}
                        <span className="ml-1 text-xs font-normal text-neutral-500">
                          / {nights} đêm
                        </span>
                      </p>
                    )}

                    <p className="mt-1 text-xs text-neutral-500">
                      {soldOut ? "Đã hết phòng" : `Còn ${rt.availableRooms}/${rt.totalRooms} phòng`}
                    </p>

                    <span
                      className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                        soldOut ? "bg-neutral-100 text-neutral-500" : "bg-primary/10 text-primary"
                      }`}
                    >
                      {soldOut ? "Hết phòng" : "Xem các phòng khả dụng →"}
                    </span>
                  </div>
                </button>
              );
            })}

            {sortedResults.length === 0 && (
              <p className="col-span-2 text-sm text-neutral-500">
                Không có loại phòng nào khớp với lựa chọn của bạn trong khoảng {nights} đêm này.
              </p>
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

