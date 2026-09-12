"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { roomTypeService } from "@/lib/services/roomTypeService";
import { reviewService } from "@/lib/services/reviewService";
import { discountService } from "@/lib/services/discountService";
import { RoomTypeAvailability, RoomTypeCode, Review, DiscountCodePreview } from "@/types";
import { getErrorMessage } from "@/lib/getErrorMessage";
import DateRangeCalendar from "@/components/DateRangeCalendar";
import RoomSearchResultsModal from "@/components/RoomSearchResultsModal";
import RoomTypeBookingModal from "@/components/RoomTypeBookingModal";
import TrustBadges from "@/components/TrustBadges";
import Footer from "@/components/Footer";
import {
  CalendarDays,
  Users,
  Search,
  Star,
  MapPin,
  ChevronRight,
  Bed,
  Maximize2,
  Tag,
  PhoneCall,
  HelpCircle,
  Send,
  CheckCircle2,
  Compass,
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

// ================= DỮ LIỆU HẠNG PHÒNG =================
const ROOM_TYPES = [
  {
    type: "STANDARD" as RoomTypeCode,
    name: "Standard Room",
    subtitle: "Phòng Tiêu Chuẩn",
    category: "couple",
    desc: "Ấm cúng, view vườn cúc họa mi rực rỡ, thích hợp cho cặp đôi nghỉ ngơi nhẹ nhàng.",
    price: 450000,
    guests: "1 - 2 khách",
    size: "22 m²",
    bed: "1 Giường Queen đôi",
    amenities: ["WiFi tốc độ cao", "Bình nóng lạnh", "Máy sấy tóc", "Trà & Cà phê"],
    image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=900&auto=format&fit=crop",
    tag: "Phổ biến",
  },
  {
    type: "SUPERIOR" as RoomTypeCode,
    name: "Superior Room",
    subtitle: "Phòng Nâng Cao",
    category: "couple",
    desc: "View trực diện thung lũng thông reo, bồn tắm ngâm mình thư giãn ngắm sương sớm.",
    price: 650000,
    guests: "2 khách",
    size: "28 m²",
    bed: "1 Giường King lớn",
    amenities: ["Bồn tắm thảo mộc", "Ban công ngắm cảnh", "Loa Bluetooth", "Áo choàng"],
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=900&auto=format&fit=crop",
    tag: "Yêu thích",
  },
  {
    type: "DELUXE" as RoomTypeCode,
    name: "Deluxe Room",
    subtitle: "Phòng Cao Cấp",
    category: "sunset",
    desc: "Vách kính Panorama bắt trọn hoàng hôn Đà Lạt tuyệt đẹp, ban công riêng biệt lộng gió.",
    price: 900000,
    guests: "2 - 3 khách",
    size: "35 m²",
    bed: "1 Giường King + Sofa",
    amenities: ["Kính ngắm toàn cảnh", "Smart TV 55 inch", "Bồn tắm nằm", "Máy pha cà phê"],
    image: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=900&auto=format&fit=crop",
    tag: "View Hoàng Hôn",
  },
  {
    type: "SUITE" as RoomTypeCode,
    name: "Suite Family",
    subtitle: "Phòng Gia Đình",
    category: "family",
    desc: "Tầng áp mái rộng rãi với 2 giường King, phòng khách riêng và bếp mini tiện nghi.",
    price: 1350000,
    guests: "4 - 6 khách",
    size: "50 m²",
    bed: "2 Giường King + Bếp",
    amenities: ["Bếp mini & Tủ lạnh", "Phòng khách riêng", "Smart TV Netflix", "Bàn ăn gia đình"],
    image: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=900&auto=format&fit=crop",
    tag: "Sang trọng nhất",
  },
];

// ================= FAQ NGẮN GỌN =================
const FAQS = [
  {
    q: "Giờ nhận phòng và trả phòng tại homestay?",
    a: "Check-in từ 14:00 và Check-out trước 12:00 trưa hôm sau. Homestay hỗ trợ gửi hành lý miễn phí nếu bạn đến sớm hoặc về muộn.",
  },
  {
    q: "Đường xe ô tô có vào tận nơi không?",
    a: "Đường bê tông rộng rãi, xe 4 chỗ, 7 chỗ đến 16 chỗ vào thẳng sân homestay. Có bãi đỗ xe riêng miễn phí an toàn 24/7.",
  },
  {
    q: "Homestay có cho mang thú cưng không?",
    a: "Có! ForestView hoàn toàn chào đón thú cưng (Pet-friendly). Vui lòng thông báo trước khi đặt phòng để chuẩn bị bát nước và khăn riêng.",
  },
  {
    q: "Chính sách hủy phòng và thanh toán?",
    a: "Hỗ trợ hủy phòng miễn phí trước 24 giờ. Chấp nhận chuyển khoản VietQR, tiền mặt, thẻ ATM/Visa khi check-in.",
  },
];

export default function Home() {

  // Search dates & guests
  const [checkIn, setCheckIn] = useState(() => todayISO());
  const [checkOut, setCheckOut] = useState(() => tomorrowISO());
  const [guests, setGuests] = useState(2);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const calendarFieldRef = useRef<HTMLDivElement>(null);

  // Khoá cuộn trang nền khi lịch đang mở (lịch hiển thị dạng overlay giữa màn hình,
  // không còn phụ thuộc vị trí/scroll của khối Hero nên luôn xem được đầy đủ).
  useEffect(() => {
    if (!calendarOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCalendarOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [calendarOpen]);

  // Search results modal
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [searchResults, setSearchResults] = useState<RoomTypeAvailability[] | null>(null);

  // Direct room booking modal
  const [activeModal, setActiveModal] = useState<{ type: RoomTypeCode; label: string } | null>(null);

  // Reviews & rating summary
  const [reviews, setReviews] = useState<Review[]>([]);

  // Promo code checker
  const [promoCode, setPromoCode] = useState("");
  const [promoChecking, setPromoChecking] = useState(false);
  const [promoResult, setPromoResult] = useState<DiscountCodePreview | null>(null);
  const [promoError, setPromoError] = useState("");

  // Quick inquiry
  const [inquiryName, setInquiryName] = useState("");
  const [inquiryEmail, setInquiryEmail] = useState("");
  const [inquiryPhone, setInquiryPhone] = useState("");
  const [inquiryIssue, setInquiryIssue] = useState("");
  const [inquirySent, setInquirySent] = useState(false);

  const nights = useMemo(() => getNights(checkIn, checkOut), [checkIn, checkOut]);

  useEffect(() => {
    reviewService
      .getAll()
      .then((data) => setReviews(data.slice(0, 3)))
      .catch(() => []);
  }, []);

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
      const data = await roomTypeService.getAvailability(checkIn, checkOut, guests);
      setSearchResults(data);
    } catch (err) {
      setSearchError(getErrorMessage(err, "Không thể kiểm tra phòng lúc này"));
    } finally {
      setSearching(false);
    }
  };

  const handleSelectTypeFromSearch = (selectedType: RoomTypeCode) => {
    setSearchResults(null);
    const item = ROOM_TYPES.find((r) => r.type === selectedType);
    setActiveModal({
      type: selectedType,
      label: item?.name || selectedType,
    });
  };

  const handleCheckPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) return;
    setPromoChecking(true);
    setPromoError("");
    setPromoResult(null);
    try {
      const res = await discountService.validate(promoCode.trim().toUpperCase());
      setPromoResult(res);
    } catch (err) {
      setPromoError(getErrorMessage(err, "Mã ưu đãi không hợp lệ"));
    } finally {
      setPromoChecking(false);
    }
  };

  return (
    <main className="landing-shell min-h-screen text-ink scroll-smooth">
      {/* ================= HERO: ẢNH TĨNH + THANH TÌM PHÒNG NẰM GẦN CUỐI HERO ================= */}
      <section className="snap-section relative w-full">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1800&auto=format&fit=crop"
            alt="Rừng thông Đà Lạt trong sương sớm"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-canvas-deep/70 via-canvas-deep/45 to-canvas-deep/85" />
        </div>

        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 pt-28 pb-40 text-center sm:pt-32">
          <p className="font-label mb-4 text-[14px] uppercase tracking-[6px] text-white/90">
            Homestay Của Bạn Tại Đà Lạt
          </p>
          <h1 className="max-w-4xl font-display text-5xl leading-tight tracking-[1px] text-white sm:text-6xl lg:text-7xl">
            Tìm Chốn Bình Yên Giữa Rừng Thông Đà Lạt
          </h1>
          <button
            type="button"
            onClick={() => document.getElementById("section-rooms")?.scrollIntoView({ behavior: "smooth" })}
            className="btn btn-accent mt-8 h-[52px] px-8"
          >
            Xem phòng nghỉ
          </button>
        </div>

        {/* Thanh tìm phòng — nổi đè lên gần mép dưới ảnh Hero */}
        <div className="relative z-30 -mt-24 px-4 sm:-mt-16">
          <div className="mx-auto max-w-4xl rounded-none border border-line bg-surface p-4 shadow-xl sm:p-5">
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-[1.5fr_1fr_auto]">
              {/* Dates */}
              <div ref={calendarFieldRef} className="relative">
                <div
                  onClick={() => setCalendarOpen((v) => !v)}
                  className="flex h-full cursor-pointer items-center gap-3 rounded-none border border-line bg-canvas/40 p-3 text-left transition hover:border-primary hover:bg-canvas"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-none bg-primary/10 text-primary">
                    <CalendarDays size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                      Lưu trú ({nights} đêm)
                    </p>
                    <p className="truncate text-xs font-bold text-ink sm:text-sm">
                      {formatDate(checkIn)} → {formatDate(checkOut)}
                    </p>
                  </div>
                </div>

                {/* Lịch chọn ngày — hiển thị dạng overlay giữa màn hình (portal) để luôn
                   xem được đầy đủ, không phụ thuộc vào vị trí của ô này hay việc cuộn trang. */}
                {calendarOpen &&
                  typeof document !== "undefined" &&
                  createPortal(
                    <div
                      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200"
                      onClick={(e) => {
                        if (e.target === e.currentTarget) setCalendarOpen(false);
                      }}
                    >
                      <div
                        role="dialog"
                        aria-modal="true"
                        className="flex max-h-[90vh] w-[min(92vw,640px)] flex-col overflow-hidden rounded-none border border-line bg-surface shadow-2xl animate-in zoom-in-95 duration-200"
                      >
                        <div className="flex shrink-0 items-center justify-between border-b border-line/60 p-4">
                          <span className="text-xs font-semibold text-neutral-600">Chọn lịch nhận &amp; trả phòng:</span>
                          <button
                            type="button"
                            onClick={() => setCalendarOpen(false)}
                            className="rounded-none bg-primary/10 px-3 py-1 text-xs font-bold text-primary hover:bg-primary hover:text-white transition cursor-pointer"
                          >
                            Xong ✓
                          </button>
                        </div>
                        <div className="min-h-0 flex-1 overflow-y-auto p-4">
                          <DateRangeCalendar
                            checkIn={checkIn}
                            checkOut={checkOut}
                            minDate={todayISO()}
                            onChange={(start, end) => {
                              setCheckIn(start);
                              setCheckOut(end);
                              // Tự đóng lịch ngay khi đã chọn xong đủ cặp ngày nhận/trả hợp lệ
                              if (start && end) setCalendarOpen(false);
                            }}
                          />
                        </div>
                      </div>
                    </div>,
                    document.body
                  )}
              </div>

              {/* Guests */}
              <div className="flex items-center gap-3 rounded-none border border-line bg-canvas/40 p-3 text-left">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-none bg-accent/10 text-accent">
                  <Users size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">Số lượng khách</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-ink sm:text-sm">{guests} người</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setGuests(Math.max(1, guests - 1))}
                        className="flex h-6 w-6 items-center justify-center rounded-none border border-line bg-surface text-xs font-bold hover:bg-neutral-100 cursor-pointer"
                      >
                        −
                      </button>
                      <button
                        type="button"
                        onClick={() => setGuests(Math.min(10, guests + 1))}
                        className="flex h-6 w-6 items-center justify-center rounded-none border border-line bg-surface text-xs font-bold hover:bg-neutral-100 cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Search button */}
              <button
                type="button"
                onClick={handleSearch}
                disabled={searching}
                className="btn btn-primary h-full min-h-11 text-[11px] disabled:opacity-50"
              >
                <Search size={15} />
                {searching ? "Đang tìm..." : "Tìm phòng"}
              </button>
            </div>

            {searchError && <p className="mt-2.5 text-xs text-rose text-center font-medium">{searchError}</p>}
          </div>
        </div>

        {/* Trust badges — hiển thị ngay trong Hero, ngay dưới thanh tìm phòng */}
        <div className="relative z-10">
          <TrustBadges />
        </div>
      </section>

      {/* ================= 2. CÁC HẠNG PHÒNG NGHỈ (GỌN GÀNG, SANG TRỌNG) ================= */}
      <section id="section-rooms" className="snap-section border-t border-line/60 bg-surface px-4 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center gap-1 text-center">
            <h2 className="font-label text-4xl font-medium uppercase tracking-[3px] text-ink sm:text-5xl">Không gian lưu trú</h2>
          </div>

          {/* Clean 4 Room Cards Grid */}
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {ROOM_TYPES.map((room) => (
              <div
                key={room.type}
                className="group flex flex-col overflow-hidden rounded-none bg-surface shadow-lg transition duration-300 hover:shadow-2xl"
              >
                {/* Image */}
                <div className="relative h-56 w-full overflow-hidden bg-neutral-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={room.image}
                    alt={room.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute top-2.5 left-2.5 rounded-none bg-black/60 px-2.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-md">
                    {room.tag}
                  </span>
                </div>

                {/* Body */}
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="font-display text-lg font-bold text-ink group-hover:text-primary transition">
                    {room.name}
                  </h3>
                  <p className="text-[11px] text-neutral-400">{room.subtitle}</p>

                  <p className="mt-2 flex-1 text-sm leading-5 text-neutral-600 line-clamp-2">
                    {room.desc}
                  </p>

                  <div className="mt-3 flex items-center justify-between border-t border-line/60 pt-2.5 text-[11px] text-neutral-500">
                    <span className="flex items-center gap-1">
                      <Users size={13} className="text-primary" /> {room.guests}
                    </span>
                    <span className="flex items-center gap-1">
                      <Maximize2 size={13} className="text-accent" /> {room.size}
                    </span>
                    <span className="flex items-center gap-1">
                      <Bed size={13} className="text-neutral-400" /> {room.bed}
                    </span>
                  </div>

                  <div className="mt-4 flex items-baseline justify-between pt-1">
                    <div>
                      <span className="text-[10px] text-neutral-400 block">Giá từ</span>
                      <p className="text-sm font-bold text-accent">
                        {formatPrice(room.price)}
                        <span className="ml-0.5 text-[10px] font-normal text-neutral-400">/đêm</span>
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
                      className="btn btn-primary h-9 px-3.5 text-[10px] gap-1"
                    >
                      Chọn phòng <ChevronRight size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= 4. HỘI VIÊN (TRÁI) & ĐÁNH GIÁ THỰC TẾ (PHẢI) ================= */}
      <section id="section-perks" className="snap-section border-t border-line/60 bg-surface px-4 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-start">
            {/* Cột trái: Khách hàng thân thiết (trình bày trơn, không đóng khung — giống cột phải) */}
            <div>
              <h2 className="font-label text-4xl font-medium uppercase tracking-[3px] text-ink sm:text-5xl">
                Khách hàng thân thiết
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-neutral-600">
                Hạng thành viên được tự động ghi nhận và nâng hạng dựa trên số lần đặt phòng hoặc tổng chi tiêu tại homestay — không cần đăng ký, đặt càng nhiều thì mức chiết khấu cho lần đặt tiếp theo càng cao. Chi tiết từng hạng và điều kiện đạt được ngay bên dưới:
              </p>

              {/* Bảng hạng thành viên: quyền lợi + cách nhận được */}
              <div className="mt-5 space-y-2.5">
                {[
                  { tier: "Bronze", percent: "5%", how: "Sau 20 lần đặt phòng thành công, hoặc tổng chi tiêu từ 10 triệu đồng" },
                  { tier: "Silver", percent: "10%", how: "Sau 40 lần đặt phòng thành công, hoặc tổng chi tiêu từ 20 triệu đồng" },
                  { tier: "Gold", percent: "15%", how: "Sau 80 lần đặt phòng, hoặc tổng chi tiêu từ 40 triệu đồng" },
                  { tier: "Diamond", percent: "20%", how: "Sau 160 lần đặt phòng, hoặc tổng chi tiêu từ 80 triệu đồng" },
                ].map((row) => (
                  <div
                    key={row.tier}
                    className="flex items-center gap-3 rounded-none border border-line bg-surface/80 p-3"
                  >
                    <span className="flex h-11 w-14 shrink-0 items-center justify-center rounded-none bg-primary/10 font-display text-sm font-bold text-primary">
                      {row.percent}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-ink">{row.tier}</p>
                      <p className="text-[11px] leading-snug text-neutral-600">{row.how}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cột phải: Đánh giá thực tế từ khách hàng (chỉ dữ liệu thật từ API, không dùng đánh giá ảo) */}
            <div>
              <div className="text-left">
                <h2 className="font-label text-4xl font-medium uppercase tracking-[3px] text-ink sm:text-5xl">Khách hàng cảm nhận</h2>
              </div>

              {reviews.length > 0 ? (
                <div className="mt-6 space-y-4">
                  {reviews.map((r) => (
                    <div key={r.id} className="rounded-none border border-line bg-surface p-4 shadow-2xs">
                      <div className="flex items-center gap-0.5 text-xs text-lantern">
                        {Array.from({ length: r.rating }).map((_, i) => (
                          <Star key={i} size={13} className="fill-lantern text-lantern" />
                        ))}
                      </div>
                      <p className="mt-2.5 text-xs leading-relaxed text-neutral-600 italic line-clamp-3">
                        &ldquo;{r.comment}&rdquo;
                      </p>
                      <div className="mt-3 border-t border-line/60 pt-2 flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-ink">{r.userFullName}</span>
                        <span className="text-neutral-400">{r.roomName}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-6 text-center text-xs text-neutral-400">
                  Chưa có đánh giá nào từ khách hàng.
                </p>
              )}
            </div>
          </div>

          {/* Kiểm tra mã giảm giá — nằm giữa, bên dưới 2 cột */}
          <div className="mx-auto mt-10 max-w-md rounded-none border border-line bg-canvas/20 p-4">
            <div className="flex items-center justify-center gap-2">
              <Tag size={15} className="text-accent" />
              <span className="text-xs font-bold text-ink">Kiểm tra mã giảm giá</span>
            </div>

            <form onSubmit={handleCheckPromo} className="mt-3 flex gap-2">
              <input
                type="text"
                placeholder="VD: DALATSPRING"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="flex-1 uppercase font-mono rounded-none border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-ink focus:border-primary focus:outline-none"
              />
              <button
                type="submit"
                disabled={promoChecking || !promoCode.trim()}
                className="rounded-none bg-primary px-3.5 py-1.5 text-xs font-bold text-white hover:bg-primary-dark transition disabled:opacity-50 cursor-pointer"
              >
                {promoChecking ? "..." : "Kiểm tra"}
              </button>
            </form>

            {promoResult && (
              <p className="mt-2 text-center text-xs text-emerald-700 font-semibold">
                ✓ Mã &ldquo;{promoResult.code}&rdquo; hợp lệ: Giảm ngay {promoResult.percent}%!
              </p>
            )}
            {promoError && <p className="mt-2 text-center text-xs text-rose font-medium">{promoError}</p>}
          </div>
        </div>
      </section>

      {/* ================= 6. HỎI ĐÁP & LIÊN HỆ (GỌN GÀNG) ================= */}
      {/* ================= 6. HỎI ĐÁP & LIÊN HỆ (GỘP CHUNG) ================= */}
      <section id="section-faq" className="snap-section border-t border-line/60 bg-surface px-4 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="font-label text-4xl font-medium uppercase tracking-[3px] text-ink sm:text-5xl">Thông tin cần biết & Hỗ trợ 24/7</h2>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* FAQ — nội dung hiển thị đầy đủ, không cần bấm mở */}
            <div className="space-y-2.5">
              {FAQS.map((item, idx) => (
                <div key={idx} className="rounded-none border border-line bg-canvas/20 p-4">
                  <p className="flex items-start gap-2 text-xs font-bold text-ink">
                    <HelpCircle size={15} className="mt-0.5 text-primary shrink-0" />
                    {item.q}
                  </p>
                  <p className="mt-1.5 pl-[23px] text-xs leading-relaxed text-neutral-600">
                    {item.a}
                  </p>
                </div>
              ))}

              <div className="mt-2 space-y-2 rounded-none border border-line bg-canvas/20 p-4 text-xs text-neutral-700">
                <p className="flex items-center gap-2">
                  <PhoneCall size={14} className="text-primary" />
                  <span><b>Hotline / Zalo:</b> 0900 000 000</span>
                </p>
                <p className="flex items-center gap-2">
                  <MapPin size={14} className="text-accent" />
                  <span><b>Địa chỉ:</b> Phường 3, TP. Đà Lạt, Tỉnh Lâm Đồng</span>
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <a href="tel:0900000000" className="btn btn-primary h-9 px-4 text-[10px]">
                    Gọi hotline
                  </a>
                  <a
                    href="https://maps.google.com/?q=Dalat+Lam+Dong"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline h-9 gap-1.5 px-4 text-[10px]"
                  >
                    <Compass size={13} /> Chỉ đường
                  </a>
                </div>
              </div>
            </div>

            {/* Quick Inquiry Form */}
            <div className="rounded-none border border-line bg-surface p-5 shadow-sm">
              <h4 className="font-display text-base font-bold text-ink">Yêu cầu tư vấn thêm</h4>
              <p className="mt-0.5 text-[11px] text-neutral-400">Để lại email và vấn đề bạn cần hỗ trợ, chúng tôi sẽ phản hồi sớm nhất.</p>

              {inquirySent ? (
                <div className="mt-4 rounded-none border border-emerald-200 bg-emerald-50 p-4 text-center">
                  <CheckCircle2 size={24} className="mx-auto text-emerald-600" />
                  <p className="mt-1 text-xs font-bold text-emerald-800">Đã gửi yêu cầu thành công!</p>
                  <p className="text-[11px] text-emerald-600">Quản lý ForestView sẽ liên hệ sớm nhất.</p>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (inquiryName.trim() && inquiryEmail.trim() && inquiryIssue.trim()) setInquirySent(true);
                  }}
                  className="mt-3 space-y-2.5"
                >
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Họ và tên của bạn *"
                      value={inquiryName}
                      onChange={(e) => setInquiryName(e.target.value)}
                      className="w-full rounded-none border border-line bg-canvas/30 px-3 py-2 text-xs font-medium text-ink focus:border-primary focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      required
                      placeholder="Email của bạn *"
                      value={inquiryEmail}
                      onChange={(e) => setInquiryEmail(e.target.value)}
                      className="w-full rounded-none border border-line bg-canvas/30 px-3 py-2 text-xs font-medium text-ink focus:border-primary focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <input
                      type="tel"
                      placeholder="Số điện thoại / Zalo (không bắt buộc)"
                      value={inquiryPhone}
                      onChange={(e) => setInquiryPhone(e.target.value)}
                      className="w-full rounded-none border border-line bg-canvas/30 px-3 py-2 text-xs font-medium text-ink focus:border-primary focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <textarea
                      required
                      rows={3}
                      placeholder="Bạn cần hỗ trợ vấn đề gì? *"
                      value={inquiryIssue}
                      onChange={(e) => setInquiryIssue(e.target.value)}
                      className="w-full resize-none rounded-none border border-line bg-canvas/30 px-3 py-2 text-xs font-medium text-ink focus:border-primary focus:bg-white focus:outline-none"
                    />
                  </div>
                  <button type="submit" className="btn btn-primary w-full text-[11px]">
                    <Send size={13} /> Gửi yêu cầu tư vấn
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer embedded />

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
    </main>
  );
}
