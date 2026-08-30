"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { roomTypeService } from "@/lib/services/roomTypeService";
import { RoomTypeAvailability } from "@/types";
import { getErrorMessage } from "@/lib/getErrorMessage";

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

function tomorrowISO() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

function formatDate(value: string) {
  if (!value) return "Chọn ngày";
  return new Intl.DateTimeFormat("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function getNights(checkIn: string, checkOut: string) {
  if (!checkIn || !checkOut) return 0;
  const start = new Date(`${checkIn}T00:00:00`).getTime();
  const end = new Date(`${checkOut}T00:00:00`).getTime();
  return end > start ? Math.round((end - start) / 86400000) : 0;
}

type SortOption = "none" | "price-asc" | "price-desc";

export default function RoomTypesPage() {
  const router = useRouter();

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [results, setResults] = useState<RoomTypeAvailability[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sort, setSort] = useState<SortOption>("none");

  useEffect(() => {
    const ci = todayISO();
    const co = tomorrowISO();

    roomTypeService
      .getAvailability(ci, co)
      .then(setResults)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const nights = useMemo(
    () => getNights(checkIn, checkOut),
    [checkIn, checkOut]
  );

  const handleCheckInChange = (value: string) => {
    setError("");
    setCheckIn(value);

    if (checkOut && value >= checkOut) {
      const next = new Date(`${value}T00:00:00`);
      next.setDate(next.getDate() + 1);
      setCheckOut(next.toISOString().split("T")[0]);
    }
  };

  const handleSearch = async () => {
    setError("");

    if (!checkIn || !checkOut) {
      setError("Vui lòng chọn ngày nhận phòng và ngày trả phòng.");
      return;
    }

    if (checkOut <= checkIn) {
      setError("Ngày trả phòng phải sau ngày nhận phòng.");
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const data = await roomTypeService.getAvailability(checkIn, checkOut);
      setResults(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const goToType = (type: string) => {
    const ci = checkIn || todayISO();
    const co = checkOut || tomorrowISO();

    router.push(`/room-types/${type}?checkIn=${ci}&checkOut=${co}`);
  };

  const sortedResults = [...results].sort((a, b) => {
    if (sort === "price-asc") {
      return (a.minPrice ?? Infinity) - (b.minPrice ?? Infinity);
    }

    if (sort === "price-desc") {
      return (b.minPrice ?? -Infinity) - (a.minPrice ?? -Infinity);
    }

    return 0;
  });

  return (
    <main className="mx-auto max-w-6xl px-5 py-12 sm:py-16">
      {/* Header */}
      <section className="max-w-3xl">
        <p className="font-display text-sm italic text-accent">
          Đà Lạt, Lâm Đồng
        </p>

        <h1 className="mt-2 font-display text-4xl leading-tight text-ink sm:text-5xl">
          Chọn phòng cho kỳ nghỉ của bạn
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600 sm:text-base">
          Chọn ngày lưu trú để xem chính xác phòng còn trống và tìm không gian
          phù hợp nhất với chuyến đi của bạn.
        </p>
      </section>

      {/* Date picker / search panel */}
      <section className="mt-8 overflow-hidden rounded-3xl border border-line bg-surface shadow-sm">
        <div className="border-b border-line px-5 py-5 sm:px-7">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <span aria-hidden="true">★</span>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                Thời gian lưu trú
              </p>
              <p className="mt-0.5 text-sm text-neutral-500">
                Chọn ngày nhận và trả phòng
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-[1fr_auto_1fr_auto] sm:items-end sm:p-7">
          {/* Check-in */}
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Nhận phòng
            </span>

            <div className="mt-2 rounded-2xl border border-line bg-base p-3 transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10">
              <div className="flex items-center gap-3">
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-lg"
                  aria-hidden="true"
                >
                  📅
                </span>

                <div className="min-w-0 flex-1">
                  <p className="text-xs text-neutral-400">Ngày nhận</p>
                  <p className="mt-0.5 truncate text-sm font-semibold text-ink">
                    {formatDate(checkIn)}
                  </p>
                </div>

                <input
                  type="date"
                  value={checkIn}
                  min={todayISO()}
                  onChange={(e) => handleCheckInChange(e.target.value)}
                  className="h-10 w-10 cursor-pointer rounded-lg opacity-0"
                  aria-label="Chọn ngày nhận phòng"
                />
              </div>
            </div>
          </label>

          <div className="hidden pb-6 text-neutral-300 sm:block" aria-hidden="true">
            →
          </div>

          {/* Check-out */}
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Trả phòng
            </span>

            <div className="mt-2 rounded-2xl border border-line bg-base p-3 transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10">
              <div className="flex items-center gap-3">
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-lg"
                  aria-hidden="true"
                >
                  📅
                </span>

                <div className="min-w-0 flex-1">
                  <p className="text-xs text-neutral-400">Ngày trả</p>
                  <p className="mt-0.5 truncate text-sm font-semibold text-ink">
                    {formatDate(checkOut)}
                  </p>
                </div>

                <input
                  type="date"
                  value={checkOut}
                  min={checkIn || todayISO()}
                  onChange={(e) => {
                    setError("");
                    setCheckOut(e.target.value);
                  }}
                  className="h-10 w-10 cursor-pointer rounded-lg opacity-0"
                  aria-label="Chọn ngày trả phòng"
                />
              </div>
            </div>
          </label>

          <button
            type="button"
            onClick={handleSearch}
            disabled={loading}
            className="h-16.5 rounded-2xl bg-primary px-7 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Đang tìm..." : "Tìm phòng"}
          </button>
        </div>

        <div className="flex flex-col gap-2 border-t border-line bg-base/50 px-5 py-4 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <div className="flex items-center gap-2 text-neutral-500">
            <span aria-hidden="true">✓</span>
            <span>Ngày nhận từ hôm nay</span>
          </div>

          {nights > 0 ? (
            <p className="font-medium text-primary">
              {nights} đêm lưu trú · {formatDate(checkIn)} → {formatDate(checkOut)}
            </p>
          ) : (
            <p className="text-neutral-400">
              Chọn đủ hai ngày để xem số đêm
            </p>
          )}
        </div>
      </section>

      {error && (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Results heading */}
      <section className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            ForestView Homestay
          </p>

          <h2 className="mt-1 font-display text-2xl text-ink">
            {searched ? "Phòng phù hợp với lịch của bạn" : "Các loại phòng"}
          </h2>

          <p className="mt-1 text-sm text-neutral-500">
            {searched
              ? `${sortedResults.filter((rt) => rt.availableRooms > 0).length} loại phòng còn khả dụng`
              : `${sortedResults.length} loại phòng đang có`}
          </p>
        </div>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          className="rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-ink focus:border-primary focus:outline-none"
          aria-label="Sắp xếp phòng"
        >
          <option value="none">Sắp xếp mặc định</option>
          <option value="price-asc">Giá: thấp đến cao</option>
          <option value="price-desc">Giá: cao đến thấp</option>
        </select>
      </section>

      {/* Room cards */}
      <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {sortedResults.map((rt) => {
          const soldOut = searched && rt.availableRooms === 0;

          return (
            <article
              key={rt.type}
              className={`overflow-hidden rounded-3xl border border-line bg-surface transition ${
                soldOut
                  ? "opacity-60"
                  : "hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
              }`}
            >
              <div className="grid grid-cols-1 sm:grid-cols-[190px_1fr]">
                <div className="relative min-h-52 overflow-hidden bg-neutral-100 sm:min-h-full">
                  {rt.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={rt.coverImage}
                      alt={rt.label}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full min-h-52 items-center justify-center text-sm text-neutral-400">
                      Chưa có hình ảnh
                    </div>
                  )}

                  {searched && (
                    <span
                      className={`absolute left-4 top-4 rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm ${
                        soldOut
                          ? "bg-white/90 text-neutral-500"
                          : "bg-primary text-white"
                      }`}
                    >
                      {soldOut
                        ? "Hết phòng"
                        : `Còn ${rt.availableRooms} phòng`}
                    </span>
                  )}
                </div>

                <div className="flex flex-col p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-accent">
                        Loại phòng
                      </p>

                      <h3 className="mt-1 font-display text-2xl text-ink">
                        {rt.label}
                      </h3>
                    </div>

                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
                      aria-hidden="true"
                    >
                      ★
                    </span>
                  </div>

                  {rt.minPrice != null && (
                    <div className="mt-4">
                      <span className="text-xs text-neutral-400">Từ</span>
                      <p className="text-lg font-semibold text-primary">
                        {formatPrice(rt.minPrice)}
                        <span className="ml-1 text-xs font-normal text-neutral-400">
                          / đêm
                        </span>
                      </p>
                    </div>
                  )}

                  <p className="mt-3 text-sm leading-6 text-neutral-500">
                    {!searched
                      ? `Tổng ${rt.totalRooms} phòng · chọn ngày để kiểm tra khả dụng`
                      : soldOut
                        ? "Phòng này hiện không còn phòng trong khoảng thời gian bạn chọn."
                        : `Còn ${rt.availableRooms}/${rt.totalRooms} phòng trong khoảng thời gian đã chọn.`}
                  </p>

                  <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => goToType(rt.type)}
                      disabled={soldOut}
                      className="flex-1 rounded-full bg-primary px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-500"
                    >
                      {soldOut ? "Hết phòng" : "Xem & đặt phòng"}
                    </button>

                    {!searched && (
                      <button
                        type="button"
                        onClick={() => goToType(rt.type)}
                        className="rounded-full border border-line px-5 py-3 text-sm font-semibold text-ink transition hover:border-primary hover:text-primary"
                      >
                        Chi tiết
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {!loading && sortedResults.length === 0 && (
        <div className="mt-8 rounded-3xl border border-line bg-surface px-6 py-12 text-center">
          <p className="font-display text-xl text-ink">
            Chưa tìm thấy loại phòng
          </p>
          <p className="mt-2 text-sm text-neutral-500">
            Hãy thử chọn một khoảng thời gian khác.
          </p>
        </div>
      )}
    </main>
  );
}