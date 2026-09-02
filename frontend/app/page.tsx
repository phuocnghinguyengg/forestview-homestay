"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { roomTypeService } from "@/lib/services/roomTypeService";
import { RoomTypeAvailability, RoomTypeCode } from "@/types";
import { getErrorMessage } from "@/lib/getErrorMessage";
import DateRangeCalendar from "@/components/DateRangeCalendar";
import RoomSearchResultsModal from "@/components/RoomSearchResultsModal";
import RoomTypeBookingModal from "@/components/RoomTypeBookingModal";
import TrustBadges from "@/components/TrustBadges";
import ReviewShowcase from "@/components/ReviewShowcase";
import {
  CalendarDays,
  Coffee,
  Flame,
  Heart,
  MapPin,
  Maximize2,
  Navigation,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Wifi,
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
  return Math.max(1, Math.round((end - start) / 86400000));
}

const FEATURED_ROOM_TYPES = [
  {
    type: "STANDARD" as RoomTypeCode,
    name: "Standard Room",
    subtitle: "Phòng Tiêu Chuẩn",
    desc: "Ấm cúng, mộc mạc, view sân vườn hoa rực rỡ, lý tưởng cho kỳ nghỉ 2 người.",
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
    desc: "View trực diện thung lũng thông, bồn tắm ngâm mình thư thái ngắm sương mù.",
    price: 650000,
    guests: "2 khách",
    size: "28 m²",
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop",
    tag: "Được yêu thích",
  },
  {
    type: "DELUXE" as RoomTypeCode,
    name: "Deluxe Room",
    subtitle: "Phòng Cao Cấp",
    desc: "Cửa kính panorama bắt trọn cảnh hoàng hôn lãng mạn, ban công riêng đón gió.",
    price: 900000,
    guests: "2 - 3 khách",
    size: "35 m²",
    image: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=800&auto=format&fit=crop",
    tag: "View Hoàng Hôn",
  },
  {
    type: "SUITE" as RoomTypeCode,
    name: "Suite Family Room",
    subtitle: "Phòng Tổng Thống / Gia Đình",
    desc: "Không gian sang trọng rộng lớn, 2 giường King, phòng khách & bếp mini tiện nghi.",
    price: 1350000,
    guests: "4 - 6 khách",
    size: "50 m²",
    image: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=800&auto=format&fit=crop",
    tag: "Cao Cấp Nhất",
  },
];

const EXPERIENCES = [
  {
    icon: <Flame size={22} className="text-amber-500" />,
    title: "Tiệc Nướng BBQ & Lửa Trại",
    desc: "Khuôn viên ngoài trời thoáng đãng giữa rừng thông, sẵn sàng dụng cụ nướng và lửa trại ấm áp đêm lạnh.",
  },
  {
    icon: <Coffee size={22} className="text-amber-700" />,
    title: "Cà Phê Sáng & Săn Mây",
    desc: "Thưởng thức Arabica Cầu Đất nguyên chất ngay tại ban công khi những vệt sương sớm bao phủ thung lũng.",
  },
  {
    icon: <Navigation size={22} className="text-primary" />,
    title: "Thuê Xe Máy & Hướng Dẫn Tour",
    desc: "Xe tay ga/số đời mới giá ưu đãi, hỗ trợ tư vấn các cung đường săn mây, thác nước đẹp nhất Đà Lạt.",
  },
  {
    icon: <Heart size={22} className="text-rose-500" />,
    title: "Thân Thiện Với Thú Cưng",
    desc: "Khu vườn cỏ rộng rãi đón chào các bé cún/mèo cưng đồng hành cùng bạn trong chuyến đi nghỉ dưỡng.",
  },
];

export default function Home() {
  const router = useRouter();

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

  const handleSearch = async () => {
    setSearchError("");
    if (!checkIn || !checkOut) {
      setSearchError("Vui lòng chọn ngày nhận và ngày trả phòng.");
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
      setSearchError(getErrorMessage(err, "Không thể tìm phòng trống lúc này"));
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
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-10 pb-16 sm:pt-16 sm:pb-24">
        {/* Subtle Background Pines Decor */}
        <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center opacity-35 blur-[100px]">
          <div className="h-[400px] w-[600px] rounded-full bg-primary/20" />
          <div className="h-[350px] w-[500px] rounded-full bg-accent/15" />
        </div>

        <div className="mx-auto max-w-6xl px-5">
          {/* Header Title Banner */}
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/80 px-4 py-1.5 text-xs font-semibold text-accent shadow-2xs backdrop-blur-md">
              <Sparkles size={13} className="text-accent" /> ForestView Homestay · Đà Lạt
            </div>

            <h1 className="mt-4 font-display text-4xl font-semibold leading-tight text-ink sm:text-6xl">
              Chốn dừng chân bình yên <br className="hidden sm:inline" />
              <span className="italic text-primary">giữa ngút ngàn thông reo</span>
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-neutral-600 sm:text-base">
              Thức giấc cùng biển mây bồng bềnh, nhâm nhi tách cà phê ấm nồng và tận hưởng trọn vẹn không gian nghỉ dưỡng biệt lập, tiện nghi giữa thiên nhiên Đà Lạt.
            </p>
          </div>

          {/* Quick Booking Search Bar */}
          <div className="mx-auto mt-10 max-w-4xl rounded-3xl border border-line bg-surface p-4 shadow-xl shadow-ink/5 backdrop-blur-md sm:p-6">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1.5fr_1fr_auto]">
              {/* Date Range Selector Trigger */}
              <div
                onClick={() => setCalendarOpen(!calendarOpen)}
                className="flex cursor-pointer items-center gap-3 rounded-2xl border border-line bg-base/50 p-3.5 transition hover:border-primary/50"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <CalendarDays size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                    Lịch lưu trú ({nights} đêm)
                  </p>
                  <p className="truncate text-sm font-semibold text-ink">
                    {formatDate(checkIn)} → {formatDate(checkOut)}
                  </p>
                </div>
              </div>

              {/* Guest Selector */}
              <div className="flex items-center gap-3 rounded-2xl border border-line bg-base/50 p-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <Users size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                    Số lượng khách
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-ink">{guests} người</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setGuests(Math.max(1, guests - 1))}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-line bg-surface font-bold text-xs hover:bg-neutral-100"
                      >
                        −
                      </button>
                      <button
                        type="button"
                        onClick={() => setGuests(Math.min(10, guests + 1))}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-line bg-surface font-bold text-xs hover:bg-neutral-100"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Search Submit Button */}
              <button
                type="button"
                onClick={handleSearch}
                disabled={searching}
                className="flex h-full min-h-[50px] items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-3.5 text-sm font-semibold text-white shadow-md transition duration-300 hover:bg-primary-dark disabled:opacity-50"
              >
                <Search size={16} />
                {searching ? "Đang tìm..." : "Tìm phòng trống"}
              </button>
            </div>

            {/* Dropdown Calendar Drawer */}
            {calendarOpen && (
              <div className="mt-4 border-t border-line/70 pt-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-600">
                    Chọn ngày nhận và trả phòng:
                  </span>
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
                    if (end) {
                      setCheckOut(end);
                    }
                  }}
                />
              </div>
            )}

            {searchError && (
              <p className="mt-3 text-xs text-red-600 text-center font-medium">{searchError}</p>
            )}
          </div>

          {/* Quick Metrics Ribbon */}
          <div className="mx-auto mt-8 flex max-w-3xl flex-wrap items-center justify-center gap-6 text-xs font-medium text-neutral-500">
            <span className="flex items-center gap-1.5">
              <Star size={14} className="fill-amber-400 text-amber-400" />
              <b className="text-ink">4.9/5</b> (150+ đánh giá thực tế)
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-primary" />
              100% hình ảnh chụp thực tế
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <MapPin size={14} className="text-accent" />
              Phường 3, TP. Đà Lạt (Cách trung tâm 10 phút)
            </span>
          </div>
        </div>
      </section>

      {/* Featured Room Types Section */}
      <section className="border-t border-line/60 bg-base/30 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                Không Gian Lưu Trú
              </p>
              <h2 className="mt-1 font-display text-3xl font-semibold text-ink sm:text-4xl">
                Các hạng phòng đặc sắc
              </h2>
            </div>
            <Link
              href={`/room-types?checkIn=${checkIn}&checkOut=${checkOut}`}
              className="group inline-flex items-center gap-1 text-sm font-semibold text-primary transition hover:text-primary-dark"
            >
              Xem tất cả hạng phòng <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>

          {/* Room Types Grid */}
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURED_ROOM_TYPES.map((room) => (
              <div
                key={room.type}
                className="group flex flex-col overflow-hidden rounded-3xl border border-line bg-surface transition duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl"
              >
                {/* Image & Badge */}
                <div className="relative h-52 w-full overflow-hidden bg-neutral-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={room.image}
                    alt={room.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <span className="absolute top-3 left-3 rounded-full bg-black/60 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
                    {room.tag}
                  </span>
                </div>

                {/* Body */}
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-display text-xl font-semibold text-ink group-hover:text-primary transition">
                    {room.name}
                  </h3>
                  <p className="mt-0.5 text-xs text-neutral-400">{room.subtitle}</p>

                  <p className="mt-3 flex-1 text-xs leading-relaxed text-neutral-600 line-clamp-2">
                    {room.desc}
                  </p>

                  <div className="mt-4 flex items-center justify-between border-t border-line/60 pt-3 text-xs text-neutral-500">
                    <span>{room.guests}</span>
                    <span>{room.size}</span>
                  </div>

                  <div className="mt-4 flex items-baseline justify-between">
                    <div>
                      <span className="text-[11px] text-neutral-400">Giá chỉ từ</span>
                      <p className="text-base font-bold text-accent">
                        {formatPrice(room.price)}
                        <span className="ml-1 text-[11px] font-normal text-neutral-400">/ đêm</span>
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
                      className="rounded-full bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary hover:text-white"
                    >
                      Chọn phòng →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Signature Experiences Section */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
              Trải Nghiệm Độc Đáo
            </p>
            <h2 className="mt-1 font-display text-3xl font-semibold text-ink sm:text-4xl">
              Nghỉ dưỡng trọn vẹn tại ForestView
            </h2>
            <p className="mt-3 text-sm text-neutral-600">
              Không chỉ là nơi nghỉ ngơi, ForestView mang đến những kỷ niệm khó quên giữa thiên nhiên xứ sương mù.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {EXPERIENCES.map((exp) => (
              <div
                key={exp.title}
                className="flex flex-col rounded-3xl border border-line bg-surface p-6 shadow-2xs transition hover:border-primary/40 hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-base">
                  {exp.icon}
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold text-ink">{exp.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-neutral-600">{exp.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Membership & Special Offers Banner */}
      <section className="border-t border-line/60 bg-gradient-to-br from-primary/5 via-surface to-accent/5 py-14">
        <div className="mx-auto max-w-6xl px-5">
          <div className="flex flex-col items-center justify-between gap-6 rounded-3xl border border-primary/20 bg-surface p-8 shadow-sm lg:flex-row lg:p-10">
            <div className="max-w-2xl">
              <span className="inline-block rounded-full bg-accent/10 px-3 py-1 text-xs font-bold text-accent uppercase">
                Ưu đãi độc quyền
              </span>
              <h2 className="mt-2 font-display text-2xl font-semibold text-ink sm:text-3xl">
                Chương trình Thành viên ForestView Club
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-neutral-600 sm:text-sm">
                Đăng ký tài khoản để tự động tích lũy và hưởng chiết khấu từ <b>5% đến 20% trọn đời</b> (Bronze, Silver, Gold, Diamond) cùng nhiều đặc quyền nhận phòng sớm &amp; hỗ trợ ưu tiên.
              </p>
            </div>

            <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="rounded-full bg-primary px-7 py-3 text-center text-xs font-semibold text-white shadow-sm transition hover:bg-primary-dark"
              >
                Đăng ký thành viên miễn phí
              </Link>
              <Link
                href="/rooms"
                className="rounded-full border border-line px-6 py-3 text-center text-xs font-semibold text-ink transition hover:bg-neutral-100"
              >
                Xem danh sách phòng
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges & Real Reviews */}
      <TrustBadges />
      <ReviewShowcase />

      {/* Modals */}
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
