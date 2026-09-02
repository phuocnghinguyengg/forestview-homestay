"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { roomTypeService } from "@/lib/services/roomTypeService";
import { RoomTypeAvailability } from "@/types";
import { getErrorMessage } from "@/lib/getErrorMessage";
import DateRangeCalendar from "@/components/DateRangeCalendar";
import { CalendarDays, ChevronRight, Sparkles, Star } from "lucide-react";

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
  if (!checkIn || !checkOut) return 1;

  const start = new Date(`${checkIn}T00:00:00`).getTime();
  const end = new Date(`${checkOut}T00:00:00`).getTime();

  return end > start ? Math.round((end - start) / 86400000) : 1;
}

type SortOption = "none" | "price-asc" | "price-desc";

export default function RoomsPage() {
  const router = useRouter();

  const [checkIn, setCheckIn] = useState(() => todayISO());
  const [checkOut, setCheckOut] = useState(() => tomorrowISO());

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

  const nights = useMemo(() => getNights(checkIn, checkOut), [checkIn, checkOut]);

  const handleCheckInChange = (value: string) => {
    setError("");
    setCheckIn(value);

    if (checkOut && value >= checkOut) {
      const next = new Date(`${value}T00:00:00`);
      next.setDate(next.getDate() + 1);
      setCheckOut(next.toISOString().split("T")[0]);
    }
  };

  const handleCheckOutChange = (value: string) => {
    setError("");

    if (checkIn && value <= checkIn) {
      setError("Ngày trả phòng phải sau ngày nhận phòng.");
      return;
    }

    setCheckOut(value);
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
      <section className="max-w-3xl">
        <p className="font-display text-sm italic text-accent">Đà Lạt, Lâm Đồng</p>

        <h1 className="mt-2 font-display text-4xl leading-tight text-ink sm:text-5xl">
          Chọn không gian nghỉ dưỡng
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600 sm:text-base">
          Kiểm tra tình trạng phòng còn trống theo số đêm lưu trú giữa rừng thông bạt ngàn.
        </p>
      </section>

      {/* Date Range Calendar Search Bar */}
      <section className="mt-8 overflow-hidden rounded-3xl border border-line bg-surface shadow-xs">
        <div className="border-b border-line px-5 py-4 sm:px-7">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <CalendarDays size={18} />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                Thời gian lưu trú
              </p>
              <p className="mt-0.5 text-xs text-neutral-500">
                Chọn ngày nhận và trả phòng để tính chính xác số đêm
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-7">
          <DateRangeCalendar
            checkIn={checkIn}
            checkOut={checkOut}
            minDate={todayISO()}
            onChange={(start, end) => {
              handleCheckInChange(start);
              if (end) handleCheckOutChange(end);
            }}
          />

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="rounded-xl border border-line bg-base/50 px-3 py-2">
                Nhận: <b>{formatDate(checkIn)}</b>
              </span>
              <span className="rounded-xl border border-line bg-base/50 px-3 py-2">
                Trả: <b>{formatDate(checkOut)}</b>
              </span>
              <span className="rounded-xl bg-primary/10 px-3.5 py-2 font-bold text-primary">
                {nights} đêm lưu trú
              </span>
            </div>

            <button
              type="button"
              onClick={handleSearch}
              disabled={loading}
              className="h-[46px] rounded-full bg-primary px-8 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Đang tìm phòng..." : `Kiểm tra phòng (${nights} đêm)`}
            </button>
          </div>
        </div>
      </section>

      {error && (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Results Header */}
      <section className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            ForestView Homestay
          </p>

          <h2 className="mt-1 font-display text-2xl text-ink">
            {searched ? `Phòng khả dụng (${nights} đêm)` : "Các hạng phòng nghỉ"}
          </h2>

          <p className="mt-1 text-sm text-neutral-500">
            {formatDate(checkIn)} → {formatDate(checkOut)} · {nights} đêm lưu trú
          </p>
        </div>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          className="rounded-xl border border-line bg-surface px-4 py-2 text-xs text-ink focus:border-primary focus:outline-none"
          aria-label="Sắp xếp phòng"
        >
          <option value="none">Sắp xếp mặc định</option>
          <option value="price-asc">Giá: thấp đến cao</option>
          <option value="price-desc">Giá: cao đến thấp</option>
        </select>
      </section>

      {/* Results Grid */}
      <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {sortedResults.map((rt) => {
          const soldOut = searched && rt.availableRooms === 0;

          return (
            <article
              key={rt.type}
              className={`group overflow-hidden rounded-3xl border border-line bg-surface transition ${
                soldOut
                  ? "opacity-60"
                  : "hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
              }`}
            >
              <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr]">
                <div className="relative min-h-52 overflow-hidden bg-neutral-100 sm:min-h-full">
                  {rt.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={rt.coverImage}
                      alt={rt.label}
                      className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full min-h-52 items-center justify-center text-sm text-neutral-400">
                      Chưa có hình ảnh
                    </div>
                  )}

                  <span
                    className={`absolute top-4 left-4 rounded-full px-3 py-1 text-xs font-semibold shadow-xs ${
                      soldOut ? "bg-white/90 text-neutral-500" : "bg-primary text-white"
                    }`}
                  >
                    {soldOut ? "Hết phòng" : `Còn ${rt.availableRooms} phòng`}
                  </span>
                </div>

                <div className="flex flex-col p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-accent">
                        Hạng phòng
                      </p>

                      <h3 className="mt-1 font-display text-2xl text-ink group-hover:text-primary transition">
                        {rt.label}
                      </h3>
                    </div>

                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
                      aria-hidden="true"
                    >
                      <Star size={16} className="fill-current" />
                    </span>
                  </div>

                  {rt.minPrice != null && (
                    <div className="mt-4 border-t border-line/60 pt-3">
                      <span className="text-xs text-neutral-400">Giá trọn gói ({nights} đêm)</span>
                      <p className="text-xl font-bold text-accent">
                        {formatPrice(rt.minPrice)}
                        <span className="ml-1 text-xs font-normal text-neutral-500">
                          / {nights} đêm
                        </span>
                      </p>
                    </div>
                  )}

                  <p className="mt-2 text-xs leading-5 text-neutral-500">
                    {soldOut
                      ? "Phòng này hiện không còn phòng trong khoảng ngày bạn chọn."
                      : `Còn ${rt.availableRooms}/${rt.totalRooms} phòng khả dụng.`}
                  </p>

                  <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => goToType(rt.type)}
                      disabled={soldOut}
                      className="flex-1 rounded-full bg-primary px-5 py-2.5 text-center text-xs font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-500"
                    >
                      {soldOut ? "Hết phòng" : `Xem các phòng (${nights} đêm) →`}
                    </button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {!loading && sortedResults.length === 0 && (
        <div className="mt-8 rounded-3xl border border-line bg-surface px-6 py-12 text-center">
          <p className="font-display text-xl text-ink">Chưa tìm thấy phòng phù hợp</p>
          <p className="mt-2 text-sm text-neutral-500">Hãy thử chọn một khoảng thời gian khác.</p>
        </div>
      )}
    </main>
  );
}

