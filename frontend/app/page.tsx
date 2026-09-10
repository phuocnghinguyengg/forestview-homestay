"use client";

import { useEffect, useMemo, useState } from "react";
import { roomTypeService } from "@/lib/services/roomTypeService";
import { reviewService } from "@/lib/services/reviewService";
import { discountService } from "@/lib/services/discountService";
import { RoomTypeAvailability, RoomTypeCode, Review, ReviewSummary, DiscountCodePreview } from "@/types";
import { getErrorMessage } from "@/lib/getErrorMessage";
import DateRangeCalendar from "@/components/DateRangeCalendar";
import RoomSearchResultsModal from "@/components/RoomSearchResultsModal";
import RoomTypeBookingModal from "@/components/RoomTypeBookingModal";
import Footer from "@/components/Footer";
import { useAuthModalStore } from "@/hooks/useAuthModalStore";
import {
  CalendarDays,
  Users,
  Search,
  Star,
  ShieldCheck,
  MapPin,
  Coffee,
  Flame,
  Navigation,
  Heart,
  ChevronRight,
  ChevronDown,
  Bed,
  Maximize2,
  Tag,
  PhoneCall,
  Clock,
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

// ================= DỮ LIỆU TIỆN ÍCH CHỌN LỌC =================
const EXPERIENCES = [
  {
    icon: <Flame className="h-5 w-5 text-accent" />,
    title: "Tiệc Nướng BBQ & Lửa Trại",
    desc: "Sân nướng thoáng mát giữa đồi thông, miễn phí bếp nướng và than củi.",
  },
  {
    icon: <Coffee className="h-5 w-5 text-lantern" />,
    title: "Cà Phê Sáng Săn Mây",
    desc: "Thưởng thức Arabica Cầu Đất nguyên chất ngay tại hiên gỗ ngắm sương mù.",
  },
  {
    icon: <Navigation className="h-5 w-5 text-primary" />,
    title: "Thuê Xe Máy & Lịch Trình",
    desc: "Xe tay ga đời mới giao nhận tận nơi kèm cẩm nang cung đường đẹp nhất.",
  },
  {
    icon: <Heart className="h-5 w-5 text-rose-500" />,
    title: "Thân Thiện Thú Cưng",
    desc: "Sân cỏ xanh rộng rãi an toàn đón chào các bé cún/mèo cưng đi cùng bạn.",
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
  const openAuthModal = useAuthModalStore((s) => s.openModal);

  // Search dates & guests
  const [checkIn, setCheckIn] = useState(() => todayISO());
  const [checkOut, setCheckOut] = useState(() => tomorrowISO());
  const [guests, setGuests] = useState(2);
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Search results modal
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [searchResults, setSearchResults] = useState<RoomTypeAvailability[] | null>(null);

  // Direct room booking modal
  const [activeModal, setActiveModal] = useState<{ type: RoomTypeCode; label: string } | null>(null);

  // Room category filter
  const [roomFilter, setRoomFilter] = useState<string>("all");

  // Reviews & rating summary
  const [reviewSummary, setReviewSummary] = useState<ReviewSummary | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);

  // Promo code checker
  const [promoCode, setPromoCode] = useState("");
  const [promoChecking, setPromoChecking] = useState(false);
  const [promoResult, setPromoResult] = useState<DiscountCodePreview | null>(null);
  const [promoError, setPromoError] = useState("");

  // FAQ accordion
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Quick inquiry
  const [inquiryName, setInquiryName] = useState("");
  const [inquiryPhone, setInquiryPhone] = useState("");
  const [inquirySent, setInquirySent] = useState(false);

  const nights = useMemo(() => getNights(checkIn, checkOut), [checkIn, checkOut]);

  useEffect(() => {
    reviewService
      .getSummary()
      .then(setReviewSummary)
      .catch(() => null);

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

  const filteredRooms = useMemo(() => {
    if (roomFilter === "all") return ROOM_TYPES;
    return ROOM_TYPES.filter((r) => r.category === roomFilter);
  }, [roomFilter]);

  return (
    <main className="landing-shell min-h-screen text-ink scroll-smooth">
      {/* ================= 1. HERO VÀ CÔNG CỤ TÌM PHÒNG (TRỌNG TÂM TRANG CHỦ) ================= */}
      <section id="section-search" className="relative px-4 pt-12 pb-16 text-center sm:px-6 lg:pt-16 lg:pb-20">
        <div className="mx-auto max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-surface/80 px-3.5 py-1 text-xs font-semibold text-primary shadow-xs backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            Đà Lạt, Lâm Đồng · Homestay Giữa Rừng Thông
          </div>

          <h1 className="mt-5 font-display text-3xl font-bold leading-tight text-ink sm:text-5xl">
            Tìm phòng nghỉ dưỡng tại <span className="italic text-primary">ForestView</span>
          </h1>
          <p className="mt-2.5 text-xs text-neutral-600 sm:text-sm">
            Chọn ngày nhận phòng và số lượng khách để kiểm tra phòng trống và mức giá tốt nhất theo thời gian thực.
          </p>

          {/* Clean Main Search Bar */}
          <div className="mt-8 rounded-3xl border border-line bg-surface p-3.5 shadow-xl sm:p-4">
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-[1.5fr_1fr_auto]">
              {/* Dates */}
              <div
                onClick={() => setCalendarOpen(!calendarOpen)}
                className="flex cursor-pointer items-center gap-3 rounded-2xl border border-line bg-canvas/40 p-3 text-left transition hover:border-primary hover:bg-canvas"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
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

              {/* Guests */}
              <div className="flex items-center gap-3 rounded-2xl border border-line bg-canvas/40 p-3 text-left">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
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
                        className="flex h-6 w-6 items-center justify-center rounded-lg border border-line bg-surface text-xs font-bold hover:bg-neutral-100 cursor-pointer"
                      >
                        −
                      </button>
                      <button
                        type="button"
                        onClick={() => setGuests(Math.min(10, guests + 1))}
                        className="flex h-6 w-6 items-center justify-center rounded-lg border border-line bg-surface text-xs font-bold hover:bg-neutral-100 cursor-pointer"
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
                className="flex h-full min-h-11 items-center justify-center gap-2 rounded-2xl bg-primary px-7 py-3 text-xs font-bold text-white shadow-md hover:bg-primary-dark transition disabled:opacity-50 cursor-pointer"
              >
                <Search size={15} />
                {searching ? "Đang tìm..." : "Tìm phòng"}
              </button>
            </div>

            {calendarOpen && (
              <div className="mt-3.5 border-t border-line/70 pt-3 text-left animate-in fade-in">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-600">Chọn lịch nhận &amp; trả phòng:</span>
                  <button
                    type="button"
                    onClick={() => setCalendarOpen(false)}
                    className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary hover:bg-primary hover:text-white transition cursor-pointer"
                  >
                    Xong ✓
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

            {searchError && <p className="mt-2.5 text-xs text-rose text-center font-medium">{searchError}</p>}
          </div>

          {/* Trust Badges */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-5 text-xs font-medium text-neutral-500">
            <span className="flex items-center gap-1.5">
              <Star size={14} className="fill-lantern text-lantern" />
              <b className="text-ink">{reviewSummary ? `${reviewSummary.averageRating.toFixed(1)}/5` : "4.9/5"}</b> Đánh giá hài lòng
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-primary" />
              100% Ảnh thực tế
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <Clock size={14} className="text-accent" />
              Check-in nhanh 24/7
            </span>
          </div>
        </div>
      </section>

      {/* ================= 2. CÁC HẠNG PHÒNG NGHỈ (GỌN GÀNG, SANG TRỌNG) ================= */}
      <section id="section-rooms" className="scroll-mt-16 border-t border-line/60 bg-surface px-4 py-12 sm:px-6 lg:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-display text-xs italic text-accent">Không gian lưu trú</p>
              <h2 className="mt-0.5 font-display text-2xl font-bold text-ink sm:text-3xl">Các hạng phòng nghỉ</h2>
            </div>

            {/* Clean filter tabs */}
            <div className="flex flex-wrap gap-1 rounded-full border border-line bg-canvas/60 p-1">
              {[
                { id: "all", label: "Tất cả" },
                { id: "couple", label: "Cặp đôi" },
                { id: "sunset", label: "Hoàng hôn" },
                { id: "family", label: "Gia đình" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setRoomFilter(tab.id)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition cursor-pointer ${
                    roomFilter === tab.id
                      ? "bg-primary text-white shadow-2xs"
                      : "text-neutral-600 hover:text-primary"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Clean 4 Room Cards Grid */}
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {filteredRooms.map((room) => (
              <div
                key={room.type}
                className="group flex flex-col overflow-hidden rounded-3xl border border-line bg-surface transition duration-300 hover:border-primary/40 hover:shadow-lg"
              >
                {/* Image */}
                <div className="relative h-44 w-full overflow-hidden bg-neutral-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={room.image}
                    alt={room.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute top-2.5 left-2.5 rounded-full bg-black/60 px-2.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-md">
                    {room.tag}
                  </span>
                </div>

                {/* Body */}
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="font-display text-base font-bold text-ink group-hover:text-primary transition">
                    {room.name}
                  </h3>
                  <p className="text-[11px] text-neutral-400">{room.subtitle}</p>

                  <p className="mt-2 flex-1 text-xs leading-5 text-neutral-600 line-clamp-2">
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
                      className="rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-primary-dark transition cursor-pointer flex items-center gap-1"
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

      {/* ================= 3. TIỆN ÍCH & TRẢI NGHIỆM ĐẶC QUYỀN (SÚC TÍCH) ================= */}
      <section id="section-experiences" className="scroll-mt-16 border-t border-line/60 bg-canvas/30 px-4 py-12 sm:px-6 lg:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="text-center max-w-xl mx-auto">
            <p className="font-display text-xs italic text-accent">Dịch vụ chu đáo</p>
            <h2 className="mt-0.5 font-display text-2xl font-bold text-ink sm:text-3xl">Tiện ích tại ForestView</h2>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {EXPERIENCES.map((exp) => (
              <div key={exp.title} className="rounded-2xl border border-line bg-surface p-4 transition hover:border-primary/30">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-canvas shadow-2xs">
                  {exp.icon}
                </div>
                <h4 className="mt-3 font-display text-sm font-bold text-ink">{exp.title}</h4>
                <p className="mt-1 text-xs leading-5 text-neutral-600">{exp.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= 4. HỘI VIÊN & MÃ ƯU ĐÃI (GỌN GÀNG) ================= */}
      <section id="section-perks" className="scroll-mt-16 border-t border-line/60 bg-surface px-4 py-12 sm:px-6 lg:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-3xl border border-primary/20 bg-linear-to-r from-primary/10 via-surface to-accent/10 p-6 sm:p-8">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-7">
                <span className="rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold text-white uppercase">
                  ForestView Club
                </span>
                <h3 className="mt-2 font-display text-xl font-bold text-ink sm:text-2xl">
                  Giảm 5% – 20% trọn đời cho Hội viên
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-neutral-600">
                  Tích lũy các hạng Bronze (5%), Silver (10%), Gold (15%), Diamond (20%) tự động chiết khấu cho mọi kỳ nghỉ.
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => openAuthModal("register")}
                    className="rounded-full bg-primary px-5 py-2 text-xs font-semibold text-white hover:bg-primary-dark transition cursor-pointer"
                  >
                    Đăng ký miễn phí
                  </button>
                  <button
                    type="button"
                    onClick={() => openAuthModal("login")}
                    className="rounded-full border border-line bg-surface px-4 py-2 text-xs font-semibold text-ink hover:bg-neutral-100 transition cursor-pointer"
                  >
                    Đăng nhập
                  </button>
                </div>
              </div>

              {/* Quick Promo Tester */}
              <div className="lg:col-span-5 rounded-2xl border border-line bg-surface p-4">
                <div className="flex items-center gap-2">
                  <Tag size={15} className="text-accent" />
                  <span className="text-xs font-bold text-ink">Kiểm tra mã giảm giá</span>
                </div>

                <form onSubmit={handleCheckPromo} className="mt-3 flex gap-2">
                  <input
                    type="text"
                    placeholder="VD: DALATSPRING"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1 uppercase font-mono rounded-xl border border-line bg-canvas/30 px-3 py-1.5 text-xs font-semibold text-ink focus:border-primary focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={promoChecking || !promoCode.trim()}
                    className="rounded-xl bg-primary px-3.5 py-1.5 text-xs font-bold text-white hover:bg-primary-dark transition disabled:opacity-50 cursor-pointer"
                  >
                    {promoChecking ? "..." : "Kiểm tra"}
                  </button>
                </form>

                {promoResult && (
                  <p className="mt-2 text-xs text-emerald-700 font-semibold">
                    ✓ Mã &ldquo;{promoResult.code}&rdquo; hợp lệ: Giảm ngay {promoResult.percent}%!
                  </p>
                )}
                {promoError && <p className="mt-2 text-xs text-rose font-medium">{promoError}</p>}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 5. ĐÁNH GIÁ THỰC TẾ & VỊ TRÍ ================= */}
      <section id="section-reviews" className="scroll-mt-16 border-t border-line/60 bg-canvas/30 px-4 py-12 sm:px-6 lg:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="text-center max-w-xl mx-auto">
            <p className="font-display text-xs italic text-accent">Khách hàng cảm nhận</p>
            <h2 className="mt-0.5 font-display text-2xl font-bold text-ink sm:text-3xl">Đánh giá thực tế</h2>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {reviews.length > 0 ? (
              reviews.map((r) => (
                <div key={r.id} className="rounded-2xl border border-line bg-surface p-4 shadow-2xs">
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
              ))
            ) : (
              [
                { name: "Minh Trang", room: "Superior Room", comment: "Phòng đẹp xuất sắc, bồn tắm ngắm thẳng thung lũng thông rất chill. Anh chị chủ homestay siêu nhiệt tình!" },
                { name: "Đức Anh", room: "Suite Family", comment: "Cả nhà 5 người ở phòng Suite rất thoải mái, bếp nấu tiện lợi. Buổi tối nướng BBQ ấm cúng." },
                { name: "Hoàng Nam", room: "Deluxe Room", comment: "Kính ngắm hoàng hôn đỉnh cao, đường đi ô tô 7 chỗ vào tận sân rất thuận tiện." },
              ].map((r, i) => (
                <div key={i} className="rounded-2xl border border-line bg-surface p-4 shadow-2xs">
                  <div className="flex items-center gap-0.5 text-xs text-lantern">
                    {"★★★★★"}
                  </div>
                  <p className="mt-2.5 text-xs leading-relaxed text-neutral-600 italic">
                    &ldquo;{r.comment}&rdquo;
                  </p>
                  <div className="mt-3 border-t border-line/60 pt-2 flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-ink">{r.name}</span>
                    <span className="text-neutral-400">{r.room}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ================= 6. HỎI ĐÁP & LIÊN HỆ (GỌN GÀNG) ================= */}
      <section id="section-faq" className="scroll-mt-16 border-t border-line/60 bg-surface px-4 py-12 sm:px-6 lg:py-16">
        <div className="mx-auto max-w-4xl">
          <div className="text-center max-w-xl mx-auto">
            <p className="font-display text-xs italic text-accent">Thông tin cần biết</p>
            <h2 className="mt-0.5 font-display text-2xl font-bold text-ink sm:text-3xl">Câu hỏi thường gặp</h2>
          </div>

          <div className="mt-6 space-y-2.5">
            {FAQS.map((item, idx) => (
              <div key={idx} className="rounded-2xl border border-line bg-canvas/20">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="flex w-full items-center justify-between p-4 text-left text-xs font-bold text-ink hover:text-primary transition cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle size={15} className="text-primary shrink-0" />
                    {item.q}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`shrink-0 text-neutral-400 transition-transform ${
                      openFaq === idx ? "rotate-180 text-primary" : ""
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="border-t border-line/60 px-4 pt-2 pb-4 text-xs leading-relaxed text-neutral-600">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= 7. LIÊN HỆ VÀ TƯ VẤN NHANH ================= */}
      <section id="section-contact" className="scroll-mt-16 border-t border-line/60 bg-canvas/40 px-4 py-12 sm:px-6 lg:py-16">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 items-center">
            <div>
              <p className="font-display text-xs italic text-accent">Hỗ trợ 24/7</p>
              <h3 className="mt-0.5 font-display text-2xl font-bold text-ink">Liên hệ ForestView Homestay</h3>
              <p className="mt-2 text-xs text-neutral-600">
                Địa chỉ: Phường 3, TP. Đà Lạt, Tỉnh Lâm Đồng (đường lớn ô tô vào tận sân).
              </p>

              <div className="mt-4 space-y-2 text-xs text-neutral-700">
                <p className="flex items-center gap-2">
                  <PhoneCall size={14} className="text-primary" />
                  <span><b>Hotline / Zalo:</b> 0900 000 000</span>
                </p>
                <p className="flex items-center gap-2">
                  <MapPin size={14} className="text-accent" />
                  <span><b>Cách trung tâm:</b> 7 phút xe máy / taxi</span>
                </p>
              </div>

              <div className="mt-5 flex flex-wrap gap-2.5">
                <a
                  href="tel:0900000000"
                  className="rounded-full bg-primary px-5 py-2 text-xs font-semibold text-white hover:bg-primary-dark transition"
                >
                  Gọi hotline
                </a>
                <a
                  href="https://maps.google.com/?q=Dalat+Lam+Dong"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-4 py-2 text-xs font-semibold text-ink hover:bg-neutral-100 transition"
                >
                  <Compass size={13} /> Chỉ đường Google Maps
                </a>
              </div>
            </div>

            {/* Quick Inquiry Form */}
            <div className="rounded-3xl border border-line bg-surface p-5 shadow-sm">
              <h4 className="font-display text-base font-bold text-ink">Yêu cầu giữ chỗ / Tư vấn nhanh</h4>
              <p className="mt-0.5 text-[11px] text-neutral-400">Chúng tôi sẽ liên hệ lại qua điện thoại/Zalo trong 15 phút.</p>

              {inquirySent ? (
                <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
                  <CheckCircle2 size={24} className="mx-auto text-emerald-600" />
                  <p className="mt-1 text-xs font-bold text-emerald-800">Đã gửi yêu cầu thành công!</p>
                  <p className="text-[11px] text-emerald-600">Quản lý ForestView sẽ liên hệ sớm nhất.</p>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (inquiryName.trim() && inquiryPhone.trim()) setInquirySent(true);
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
                      className="w-full rounded-xl border border-line bg-canvas/30 px-3 py-2 text-xs font-medium text-ink focus:border-primary focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <input
                      type="tel"
                      required
                      placeholder="Số điện thoại / Zalo *"
                      value={inquiryPhone}
                      onChange={(e) => setInquiryPhone(e.target.value)}
                      className="w-full rounded-xl border border-line bg-canvas/30 px-3 py-2 text-xs font-medium text-ink focus:border-primary focus:bg-white focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-primary py-2.5 text-xs font-bold text-white shadow-xs hover:bg-primary-dark transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
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
