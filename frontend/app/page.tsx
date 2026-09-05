"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { roomTypeService } from "@/lib/services/roomTypeService";
import { RoomTypeAvailability, RoomTypeCode } from "@/types";
import { getErrorMessage } from "@/lib/getErrorMessage";
import DateRangeCalendar from "@/components/DateRangeCalendar";
import RoomSearchResultsModal from "@/components/RoomSearchResultsModal";
import RoomTypeBookingModal from "@/components/RoomTypeBookingModal";
import ReviewShowcase from "@/components/ReviewShowcase";
import Footer from "@/components/Footer";
import {
  CalendarDays,
  ChevronDown,
  Coffee,
  Flame,
  Heart,
  MapPin,
  Navigation,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from "lucide-react";

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

function formatDate(date: string) {
  if (!date) return "";
  return new Date(`${date}T00:00:00`).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getNights(a: string, b: string) {
  if (!a || !b) return 1;
  const start = new Date(`${a}T00:00:00`).getTime();
  const end = new Date(`${b}T00:00:00`).getTime();
  return Math.max(1, Math.round((end - start) / 86400000)) || 1;
}

const FEATURED_ROOM_TYPES = [
  {
    type: "STANDARD" as RoomTypeCode,
    name: "Standard Room",
    subtitle: "Phòng Tiêu Chuẩn",
    desc: "Ấm cúng, view sân vườn hoa rực rỡ, lý tưởng cho cặp đôi.",
    price: 450000,
    guests: "1 - 2 khách",
    size: "22 m²",
    image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=800&auto=format&fit=crop",
    tag: "Phổ biến",
  },
  {
    type: "SUPERIOR" as RoomTypeCode,
    name: "Superior Room",
    subtitle: "Phòng Nâng Cao",
    desc: "View thung lũng thông, bồn tắm ngâm mình thư thái ngắm sương.",
    price: 650000,
    guests: "2 khách",
    size: "28 m²",
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop",
    tag: "Yêu thích",
  },
  {
    type: "DELUXE" as RoomTypeCode,
    name: "Deluxe Room",
    subtitle: "Phòng Cao Cấp",
    desc: "Kính panorama bắt trọn hoàng hôn lãng mạn, ban công riêng.",
    price: 900000,
    guests: "2 - 3 khách",
    size: "35 m²",
    image: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=800&auto=format&fit=crop",
    tag: "View Hoàng Hôn",
  },
  {
    type: "SUITE" as RoomTypeCode,
    name: "Suite Family",
    subtitle: "Phòng Gia Đình",
    desc: "2 giường King, phòng khách biệt lập & bếp mini tiện nghi.",
    price: 1350000,
    guests: "4 - 6 khách",
    size: "50 m²",
    image: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=800&auto=format&fit=crop",
    tag: "Cao Cấp Nhất",
  },
];

const EXPERIENCES = [
  {
    icon: <Flame size={20} className="text-amber-500" />,
    title: "Tiệc Nướng BBQ & Lửa Trại",
    desc: "Sân nướng ngoài trời giữa đồi thông thơ mộng và bếp lửa ấm cúng đêm lạnh.",
  },
  {
    icon: <Coffee size={20} className="text-amber-700" />,
    title: "Cà Phê Sáng Săn Mây",
    desc: "Thưởng thức Arabica Cầu Đất nguyên chất khi sương sớm còn phủ thung lũng.",
  },
  {
    icon: <Navigation size={20} className="text-primary" />,
    title: "Thuê Xe Máy & Lịch Trình",
    desc: "Xe đời mới giá ưu đãi, gợi ý cung đường săn mây và thác nước đẹp nhất.",
  },
  {
    icon: <Heart size={20} className="text-rose-500" />,
    title: "Thân Thiện Thú Cưng",
    desc: "Sân vườn cỏ xanh rộng rãi đón chào các bé cún/mèo cưng đi cùng bạn.",
  },
];

const SECTIONS = [
  { id: "section-hero", label: "Tìm phòng" },
  { id: "section-rooms", label: "Không gian lưu trú" },
  { id: "section-experiences", label: "Trải nghiệm & Ưu đãi" },
  { id: "section-reviews", label: "Đánh giá & Cam kết" },
];

export default function Home() {
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);

  const [checkIn, setCheckIn] = useState(() => todayISO());
  const [checkOut, setCheckOut] = useState(() => tomorrowISO());
  const [guests, setGuests] = useState(2);
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Search Results Modal State
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [searchResults, setSearchResults] = useState<RoomTypeAvailability[] | null>(null);

  // Direct Room Booking Modal State
  const [activeModal, setActiveModal] = useState<{ type: RoomTypeCode; label: string } | null>(null);

  const nights = useMemo(() => getNights(checkIn, checkOut), [checkIn, checkOut]);

  // Ref to the scroll container
  const scrollContainerRef = useRef<HTMLElement | null>(null);

  // IntersectionObserver: sync dots with actual scroll position
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const observers: IntersectionObserver[] = [];

    SECTIONS.forEach((sec, idx) => {
      const el = document.getElementById(sec.id);
      if (!el) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSectionIndex(idx);
            }
          });
        },
        {
          root: container,
          threshold: 0.5, // section is considered active when 50%+ is visible
        }
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  // Scroll to section: scroll inside the snap container by section index
  const scrollToSection = (id: string, index: number) => {
    const container = scrollContainerRef.current;
    const element = document.getElementById(id);
    if (container && element) {
      // Use scrollTo relative to container so snap works correctly
      container.scrollTo({ top: element.offsetTop, behavior: "smooth" });
    }
  };

  const handleSearch = async () => {
    setSearchError("");
    if (!checkIn || !checkOut) {
      setSearchError("Vui lòng chọn ngày nhận và trả phòng.");
      return;
    }
    if (checkOut <= checkIn) {
      setSearchError("Ngày trả phòng phải sau ngày nhận phòng.");
      return;
    }

    setSearching(true);
    try {
      const data = await roomTypeService.getAvailability(checkIn, checkOut);
      setSearchResults(data);
    } catch (err) {
      setSearchError(getErrorMessage(err, "Không thể tìm phòng lúc này"));
    } finally {
      setSearching(false);
    }
  };

  const handleSelectTypeFromSearch = (selectedType: RoomTypeCode) => {
    setSearchResults(null);
    const item = FEATURED_ROOM_TYPES.find((r) => r.type === selectedType);
    setActiveModal({
      type: selectedType,
      label: item?.name || selectedType,
    });
  };

  return (
    <>
      {/* Floating Section Navigation Dots */}
      <div className="fixed top-1/2 right-4 z-40 hidden -translate-y-1/2 flex-col gap-2.5 md:flex">
        {SECTIONS.map((sec, idx) => (
          <button
            key={sec.id}
            type="button"
            onClick={() => scrollToSection(sec.id, idx)}
            title={sec.label}
            className="group flex items-center justify-end gap-2 p-1"
          >
            <span className="pointer-events-none rounded-md bg-ink/80 px-2 py-0.5 text-[11px] font-medium text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              {sec.label}
            </span>
            <span
              className={`h-2.5 rounded-full transition-all duration-300 ${
                activeSectionIndex === idx
                  ? "w-6 bg-primary shadow-xs"
                  : "w-2.5 bg-neutral-300 hover:bg-neutral-400"
              }`}
            />
          </button>
        ))}
      </div>

      {/* Snap Scrollable Container (Mỗi scroll là 1 khấc) */}
      <main
        ref={scrollContainerRef}
        className="h-[calc(100vh-69px)] w-full overflow-y-auto overflow-x-hidden snap-y snap-mandatory scroll-smooth"
      >
        
        {/* ================= KHẤC 1: TÌM PHÒNG & HERO BANNER ================= */}
        <section
          id="section-hero"
          className="relative flex min-h-[calc(100vh-69px)] w-full snap-start snap-always flex-col items-center justify-center overflow-hidden px-5 py-6 text-center"
        >
          {/* Subtle Pines Decorative SVG at Bottom */}
          <svg
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[35%] w-full text-primary/[0.06]"
            viewBox="0 0 1200 300"
            preserveAspectRatio="none"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M100 300 L130 180 L100 210 L130 120 L100 150 L150 20 L200 150 L170 120 L200 210 L170 180 L200 300 Z" />
            <path d="M320 300 L355 160 L320 195 L355 90 L320 125 L385 10 L450 125 L415 90 L450 195 L415 160 L450 300 Z" />
            <path d="M560 300 L590 200 L560 225 L590 150 L560 175 L610 60 L660 175 L630 150 L660 225 L630 200 L660 300 Z" />
            <path d="M780 300 L815 160 L780 195 L815 90 L780 125 L845 10 L910 125 L875 90 L910 195 L875 160 L910 300 Z" />
            <path d="M1000 300 L1030 200 L1000 225 L1030 150 L1000 175 L1050 60 L1100 175 L1070 150 L1100 225 L1070 200 L1100 300 Z" />
          </svg>

          <div className="relative z-10 mx-auto max-w-3xl">
            <p className="font-display text-sm italic tracking-wide text-accent">
              Đà Lạt, Lâm Đồng
            </p>

            <h1 className="mx-auto mt-3 max-w-2xl font-display text-4xl leading-tight text-ink sm:text-6xl">
              Chốn dừng chân giữa rừng thông Đà Lạt
            </h1>

            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-neutral-600 sm:text-base">
              Những homestay ẩn mình giữa thiên nhiên, không khí se lạnh, đặt phòng chỉ trong vài phút.
            </p>

            {/* Quick Compact Search Bar */}
            <div className="mx-auto mt-8 max-w-3xl rounded-3xl border border-line bg-surface p-4 shadow-xl shadow-ink/5 backdrop-blur-md sm:p-5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1.4fr_1fr_auto]">
                {/* Date range trigger */}
                <div
                  onClick={() => setCalendarOpen(!calendarOpen)}
                  className="flex cursor-pointer items-center gap-3 rounded-2xl border border-line bg-base/50 p-3 text-left transition hover:border-primary/50"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <CalendarDays size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                      Thời gian lưu trú ({nights} đêm)
                    </p>
                    <p className="truncate text-xs font-semibold text-ink sm:text-sm">
                      {formatDate(checkIn)} → {formatDate(checkOut)}
                    </p>
                  </div>
                </div>

                {/* Guests */}
                <div className="flex items-center gap-3 rounded-2xl border border-line bg-base/50 p-3 text-left">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                    <Users size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                      Số khách
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-ink sm:text-sm">{guests} người</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setGuests(Math.max(1, guests - 1))}
                          className="flex h-6 w-6 items-center justify-center rounded-lg border border-line bg-surface font-bold text-xs hover:bg-neutral-100"
                        >
                          −
                        </button>
                        <button
                          type="button"
                          onClick={() => setGuests(Math.min(10, guests + 1))}
                          className="flex h-6 w-6 items-center justify-center rounded-lg border border-line bg-surface font-bold text-xs hover:bg-neutral-100"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Search Button */}
                <button
                  type="button"
                  onClick={handleSearch}
                  disabled={searching}
                  className="flex h-full min-h-[46px] items-center justify-center gap-2 rounded-2xl bg-primary px-7 py-3 text-xs font-semibold text-white shadow-md transition hover:bg-primary-dark disabled:opacity-50"
                >
                  <Search size={15} />
                  {searching ? "Đang tìm..." : "Tìm phòng trống"}
                </button>
              </div>

              {/* Date Calendar Popover */}
              {calendarOpen && (
                <div className="mt-3 border-t border-line/70 pt-3 text-left">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-600">Chọn lịch nhận &amp; trả phòng:</span>
                    <button
                      type="button"
                      onClick={() => setCalendarOpen(false)}
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      Xong
                    </button>
                  </div>
                  <DateRangeCalendar
                    checkIn={checkIn}
                    checkOut={checkOut}
                    minDate={todayISO()}
                    onChange={(start, end) => {
                      setCheckIn(start);
                      setCheckOut(end);
                    }}
                  />
                </div>
              )}

              {searchError && (
                <p className="mt-2.5 text-xs text-red-600 text-center font-medium">{searchError}</p>
              )}
            </div>

            {/* Quick Metrics */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-neutral-500 sm:gap-6">
              <span className="flex items-center gap-1.5">
                <Star size={13} className="fill-amber-400 text-amber-400" />
                <b className="text-ink">4.9/5</b> Đánh giá thực tế
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-primary" />
                100% Ảnh thực tế
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <MapPin size={13} className="text-accent" />
                Phường 3, TP. Đà Lạt
              </span>
            </div>

            {/* Down Cue Button */}
            <div className="mt-8">
              <button
                type="button"
                onClick={() => scrollToSection("section-rooms", 1)}
                className="group inline-flex items-center gap-1.5 rounded-full border border-line bg-surface/80 px-4 py-2 text-xs font-medium text-neutral-600 shadow-2xs transition hover:border-primary hover:text-primary"
              >
                Khám phá không gian lưu trú <ChevronDown size={14} className="transition-transform group-hover:translate-y-0.5" />
              </button>
            </div>
          </div>
        </section>

        {/* ================= KHẤC 2: KHÔNG GIAN LƯU TRÚ (HẠNG PHÒNG) ================= */}
        <section
          id="section-rooms"
          className="flex min-h-[calc(100vh-69px)] w-full snap-start snap-always flex-col justify-center border-t border-line/60 bg-base/30 px-5 py-8"
        >
          <div className="mx-auto w-full max-w-6xl">
            {/* Header */}
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="font-display text-xs italic text-accent">Không gian lưu trú</p>
                <h2 className="mt-0.5 font-display text-2xl font-semibold text-ink sm:text-3xl">
                  Các hạng phòng tại ForestView
                </h2>
              </div>
              <Link
                href={`/room-types?checkIn=${checkIn}&checkOut=${checkOut}`}
                className="group inline-flex items-center gap-1 text-xs font-semibold text-primary transition hover:text-primary-dark"
              >
                Xem tất cả phòng &amp; lịch <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </div>

            {/* 4 Room Cards Grid (Compact & Perfectly Fitted) */}
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURED_ROOM_TYPES.map((room) => (
                <div
                  key={room.type}
                  className="group flex flex-col overflow-hidden rounded-3xl border border-line bg-surface transition duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
                >
                  <div className="relative h-44 w-full overflow-hidden bg-neutral-100 sm:h-40">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={room.image}
                      alt={room.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <span className="absolute top-2.5 left-2.5 rounded-full bg-black/60 px-2.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-md">
                      {room.tag}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="font-display text-base font-semibold text-ink group-hover:text-primary transition">
                      {room.name}
                    </h3>
                    <p className="text-[11px] text-neutral-400">{room.subtitle}</p>

                    <p className="mt-2 flex-1 text-xs leading-5 text-neutral-600 line-clamp-2">
                      {room.desc}
                    </p>

                    <div className="mt-3 flex items-center justify-between border-t border-line/60 pt-2 text-[11px] text-neutral-500">
                      <span>{room.guests}</span>
                      <span>{room.size}</span>
                    </div>

                    <div className="mt-3 flex items-baseline justify-between">
                      <div>
                        <span className="text-[10px] text-neutral-400">Giá từ</span>
                        <p className="text-sm font-bold text-accent">
                          {formatPrice(room.price)}
                          <span className="ml-1 text-[10px] font-normal text-neutral-400">/đêm</span>
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setActiveModal({
                            type: room.type,
                            label: room.name,
                          })
                        }
                        className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary transition hover:bg-primary hover:text-white"
                      >
                        Chọn phòng →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Next section hint */}
            <div className="mt-5 text-center">
              <button
                type="button"
                onClick={() => scrollToSection("section-experiences", 2)}
                className="text-xs text-neutral-400 transition hover:text-primary"
              >
                Cuộn tiếp để xem Trải nghiệm &amp; Ưu đãi ↓
              </button>
            </div>
          </div>
        </section>

        {/* ================= KHẤC 3: TRẢI NGHIỆM & ƯU ĐÃI THÀNH VIÊN ================= */}
        <section
          id="section-experiences"
          className="flex min-h-[calc(100vh-69px)] w-full snap-start snap-always flex-col justify-center border-t border-line/60 bg-surface px-5 py-8"
        >
          <div className="mx-auto w-full max-w-6xl">
            <div className="text-center">
              <p className="font-display text-xs italic text-accent">Dịch vụ &amp; Tiện ích</p>
              <h2 className="mt-0.5 font-display text-2xl font-semibold text-ink sm:text-3xl">
                Trải nghiệm độc đáo tại ForestView
              </h2>
            </div>

            {/* 4 Experiences Grid */}
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {EXPERIENCES.map((exp) => (
                <div
                  key={exp.title}
                  className="flex flex-col rounded-2xl border border-line bg-base/30 p-5 transition hover:border-primary/40 hover:shadow-xs"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface shadow-2xs">
                    {exp.icon}
                  </div>
                  <h3 className="mt-3 font-display text-base font-semibold text-ink">{exp.title}</h3>
                  <p className="mt-1.5 text-xs leading-5 text-neutral-600">{exp.desc}</p>
                </div>
              ))}
            </div>

            {/* Compact Member Perks Banner */}
            <div className="mt-6 rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/10 via-surface to-accent/10 p-6">
              <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold text-white uppercase">
                      Hội viên
                    </span>
                    <h3 className="font-display text-lg font-semibold text-ink">
                      ForestView Club: Giảm 5% – 20% trọn đời
                    </h3>
                  </div>
                  <p className="mt-1 text-xs text-neutral-600">
                    Tích lũy hạng Bronze, Silver, Gold, Diamond để hưởng chiết khấu tự động cho mọi kỳ nghỉ.
                  </p>
                </div>

                <div className="flex shrink-0 gap-2">
                  <Link
                    href="/register"
                    className="rounded-full bg-primary px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-primary-dark transition"
                  >
                    Đăng ký miễn phí
                  </Link>
                  <Link
                    href="/rooms"
                    className="rounded-full border border-line bg-surface px-4 py-2 text-xs font-semibold text-ink hover:bg-neutral-100 transition"
                  >
                    Xem phòng
                  </Link>
                </div>
              </div>
            </div>

            {/* Next section hint */}
            <div className="mt-5 text-center">
              <button
                type="button"
                onClick={() => scrollToSection("section-reviews", 3)}
                className="text-xs text-neutral-400 transition hover:text-primary"
              >
                Cuộn tiếp để xem Đánh giá từ khách du lịch ↓
              </button>
            </div>
          </div>
        </section>

        {/* ================= KHẤC 4: ĐÁNH GIÁ & CAM KẾT CHẤT LƯỢNG ================= */}
        <section
          id="section-reviews"
          className="flex min-h-[calc(100vh-69px)] w-full snap-start snap-always flex-col justify-center border-t border-line/60 bg-base/40 px-5 py-8"
        >
          <div className="mx-auto w-full max-w-6xl">
            <div className="text-center">
              <p className="font-display text-xs italic text-accent">Đánh giá từ khách hàng</p>
              <h2 className="mt-0.5 font-display text-2xl font-semibold text-ink sm:text-3xl">
                Cảm nhận thực tế khi lưu trú
              </h2>
            </div>

            {/* Đánh giá thực tế từ khách đã lưu trú (dữ liệu thật từ API) */}
            <div className="mt-6">
              <ReviewShowcase limit={3} />
            </div>

            {/* Trust Badges */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl border border-line bg-surface p-4 text-center">
                <p className="font-display text-xl font-bold text-accent">4.9 / 5</p>
                <p className="mt-0.5 text-[11px] text-neutral-500">Điểm đánh giá hài lòng</p>
              </div>
              <div className="rounded-2xl border border-line bg-surface p-4 text-center">
                <p className="font-display text-xl font-bold text-primary">100%</p>
                <p className="mt-0.5 text-[11px] text-neutral-500">Ảnh phòng chụp thực tế</p>
              </div>
              <div className="rounded-2xl border border-line bg-surface p-4 text-center">
                <p className="font-display text-xl font-bold text-accent">24 / 7</p>
                <p className="mt-0.5 text-[11px] text-neutral-500">Hỗ trợ &amp; Check-in nhanh</p>
              </div>
              <div className="rounded-2xl border border-line bg-surface p-4 text-center">
                <p className="font-display text-xl font-bold text-primary">0 ₫</p>
                <p className="mt-0.5 text-[11px] text-neutral-500">Hủy phòng linh hoạt 24h</p>
              </div>
            </div>

            {/* Bottom CTA & Back to top */}
            <div className="mt-6 flex flex-col items-center justify-between gap-3 border-t border-line/60 pt-4 sm:flex-row">
              <p className="text-xs text-neutral-500">
                ForestView Homestay · Phường 3, TP. Đà Lạt, Tỉnh Lâm Đồng
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => scrollToSection("section-hero", 0)}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  ↑ Về lại đầu trang (Tìm phòng)
                </button>
                <Link
                  href="/room-types"
                  className="rounded-full bg-primary px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-primary-dark transition"
                >
                  Đặt phòng ngay
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ================= FOOTER (Cuối cùng của khung cuộn snap) ================= */}
        <section
          id="section-footer"
          className="w-full snap-end"
        >
          <Footer embedded />
        </section>

      </main>

      {/* Search Results Modal */}
      {searchResults && (
        <RoomSearchResultsModal
          results={searchResults}
          checkIn={checkIn}
          checkOut={checkOut}
          nights={nights}
          onSelectType={handleSelectTypeFromSearch}
          onClose={() => setSearchResults(null)}
        />
      )}

      {/* Direct Room Booking Modal */}
      {activeModal && (
        <RoomTypeBookingModal
          type={activeModal.type}
          typeLabel={activeModal.label}
          checkIn={checkIn}
          checkOut={checkOut}
          onClose={() => setActiveModal(null)}
        />
      )}
    </>
  );
}
