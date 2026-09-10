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
import { useAuthStore } from "@/hooks/useAuthStore";
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
  Sparkles,
  Bed,
  Maximize2,
  Tag,
  PhoneCall,
  Mail,
  Clock,
  Car,
  HelpCircle,
  Send,
  CheckCircle2,
  AlertCircle,
  Compass,
  Utensils,
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

// ================= DỮ LIỆU CÁC HẠNG PHÒNG =================
const FEATURED_ROOM_TYPES = [
  {
    type: "STANDARD" as RoomTypeCode,
    name: "Standard Room",
    subtitle: "Phòng Tiêu Chuẩn",
    category: "couple",
    desc: "Ấm cúng, mộc mạc với cửa sổ mở ra khu vườn cúc họa mi rực rỡ. Rất thích hợp cho các cặp đôi hoặc bạn bè cần không gian nghỉ ngơi thư thái.",
    price: 450000,
    guests: "1 - 2 khách",
    maxGuests: 2,
    size: "22 m²",
    bed: "1 Giường Queen đôi",
    view: "Vườn hoa & Rừng thông",
    amenities: ["WiFi tốc độ cao", "Bình nóng lạnh", "Máy sấy tóc", "Trà & Cà phê miễn phí", "Nước uống đóng chai"],
    image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1000&auto=format&fit=crop",
    tag: "Phổ biến nhất",
    badgeColor: "bg-primary text-white",
  },
  {
    type: "SUPERIOR" as RoomTypeCode,
    name: "Superior Room",
    subtitle: "Phòng Nâng Cao",
    category: "couple",
    desc: "View trực diện thung lũng thông reo. Có bồn tắm ngâm mình thư giãn cạnh khung cửa kính nhìn ra làn sương sớm lãng mạn.",
    price: 650000,
    guests: "2 khách",
    maxGuests: 2,
    size: "28 m²",
    bed: "1 Giường King lớn",
    view: "Thung lũng sương & Đồi thông",
    amenities: ["Bồn tắm ngâm thảo mộc", "Ban công ngắm cảnh", "WiFi tốc độ cao", "Loa Bluetooth mini", "Áo choàng tắm"],
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1000&auto=format&fit=crop",
    tag: "Yêu thích nhất",
    badgeColor: "bg-accent text-white",
  },
  {
    type: "DELUXE" as RoomTypeCode,
    name: "Deluxe Room",
    subtitle: "Phòng Cao Cấp",
    category: "sunset",
    desc: "Vách kính Panorama bắt trọn hoàng hôn ráng chiều tuyệt đẹp của Đà Lạt. Ban công riêng lộng gió và sofa đọc sách êm ái.",
    price: 900000,
    guests: "2 - 3 khách",
    maxGuests: 3,
    size: "35 m²",
    bed: "1 Giường King + 1 Sofa bed",
    view: "Panorama Hoàng hôn & Rừng thông",
    amenities: ["Ban công riêng tư", "Kính ngắm toàn cảnh", "Smart TV 55 inch", "Bồn tắm nằm", "Máy pha cà phê capsule"],
    image: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=1000&auto=format&fit=crop",
    tag: "View Hoàng Hôn",
    badgeColor: "bg-lantern-dark text-white",
  },
  {
    type: "SUITE" as RoomTypeCode,
    name: "Suite Family",
    subtitle: "Phòng Gia Đình Biệt Lập",
    category: "family",
    desc: "Không gian rộng rãi tầng áp mái với 2 giường King êm ái, phòng khách riêng biệt và quầy bar bếp mini đầy đủ tiện nghi sinh hoạt.",
    price: 1350000,
    guests: "4 - 6 khách",
    maxGuests: 6,
    size: "50 m²",
    bed: "2 Giường King + Bếp mini",
    view: "View đỉnh đồi thông 360°",
    amenities: ["Bếp mini & Tủ lạnh", "Khu tiếp khách riêng", "2 Bồn rửa mặt riêng biệt", "Bàn ăn gia đình", "Smart TV Netflix"],
    image: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=1000&auto=format&fit=crop",
    tag: "Sang trọng nhất",
    badgeColor: "bg-primary-dark text-white",
  },
];

// ================= DỮ LIỆU TRẢI NGHIỆM ĐẶC QUYỀN =================
const EXPERIENCES = [
  {
    icon: <Flame className="h-6 w-6 text-accent" />,
    title: "Tiệc Nướng BBQ & Đốt Lửa Trại",
    desc: "Sân nướng ngoài trời giữa rừng thông lộng gió. Bếp than hồng sưởi ấm đêm lạnh Đà Lạt, tiếng nhạc acoustic du dương dưới ánh đèn vàng lãng mạn.",
    tag: "Miễn phí bếp nướng & than",
  },
  {
    icon: <Coffee className="h-6 w-6 text-lantern" />,
    title: "Cà Phê Sáng Săn Mây Cầu Đất",
    desc: "Thưởng thức từng ngụm Arabica mộc rang xay nóng hổi ngay tại hiên gỗ khi làn sương sớm còn vờn qua ngọn thông.",
    tag: "Phục vụ 07:00 – 10:00",
  },
  {
    icon: <Navigation className="h-6 w-6 text-primary" />,
    title: "Thuê Xe Máy & Lộ Trình Săn Mây",
    desc: "Đội xe tay ga đời mới, bảo dưỡng định kỳ với giá ưu đãi. Chủ homestay sẵn sàng chia sẻ bản đồ những cung đường đèo và thác nước đẹp nhất.",
    tag: "Giao nhận tại homestay",
  },
  {
    icon: <Heart className="h-6 w-6 text-rose-500" />,
    title: "Homestay Thân Thiện Thú Cưng",
    desc: "Khuôn viên cỏ xanh rào kín an toàn chào đón các bé cún/mèo cưng đồng hành cùng bạn. Homestay chuẩn bị sẵn bát ăn và nệm nằm.",
    tag: "Pet-friendly 100%",
  },
  {
    icon: <Utensils className="h-6 w-6 text-amber-600" />,
    title: "Trà Chiều & Bánh Ngọt Thảo Mộc",
    desc: "Set trà atiso hoa cúc ấm thơm ăn kèm mứt dâu tây Đà Lạt tự làm, ngồi ngắm hoàng hôn ráng vàng dần buông xuống thung lũng.",
    tag: "Góc chill hoàng hôn",
  },
  {
    icon: <Sparkles className="h-6 w-6 text-emerald-600" />,
    title: "Rạp Phim Ngoài Trời & Boardgames",
    desc: "Màn chiếu lớn xem phim đêm cạnh lò sưởi, hàng chục bộ boardgame thú vị (Ma Sói, Uno, Mèo Nổ) cho nhóm bạn gắn kết kỷ niệm.",
    tag: "Buổi tối ấm cúng",
  },
];

// ================= DỮ LIỆU THƯ VIỆN HÌNH ẢNH =================
const GALLERY_CATEGORIES = [
  { id: "all", label: "Tất cả ảnh" },
  { id: "rooms", label: "Phòng ngủ" },
  { id: "scenery", label: "Đồi thông & View" },
  { id: "night", label: "Lửa trại & Buổi tối" },
];

const GALLERY_IMAGES = [
  {
    url: "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=900&auto=format&fit=crop",
    category: "rooms",
    title: "Standard Room ngập tràn ánh nắng",
    caption: "Ánh sáng tự nhiên len lỏi qua ô cửa gỗ",
  },
  {
    url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=900&auto=format&fit=crop",
    category: "scenery",
    title: "Sương mù sớm phủ thung lũng thông",
    caption: "Bình minh se lạnh ngắm từ ban công",
  },
  {
    url: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=900&auto=format&fit=crop",
    category: "rooms",
    title: "Superior Room bồn tắm ngắm mây",
    caption: "Ngâm bồn thảo mộc ngắm thông reo",
  },
  {
    url: "https://images.unsplash.com/photo-1510312305653-8ed496efae75?q=80&w=900&auto=format&fit=crop",
    category: "night",
    title: "Đêm lửa trại bập bùng giữa rừng thông",
    caption: "Bếp than hồng và chuyện trò thâu đêm",
  },
  {
    url: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=900&auto=format&fit=crop",
    category: "rooms",
    title: "Deluxe Room vách kính hoàng hôn",
    caption: "Bắt trọn hoàng hôn ráng chiều lãng mạn",
  },
  {
    url: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=900&auto=format&fit=crop",
    category: "scenery",
    title: "Rừng thông bạt ngàn bao quanh nhà",
    caption: "Không khí trong lành tuyệt đối tách biệt khói bụi",
  },
];

// ================= DỮ LIỆU ĐIỂM ĐẾN LÂN CẬN =================
const NEARBY_PLACES = [
  { name: "Cáp treo Đồi Robin", distance: "1.2 km", time: "3 phút", desc: "Ngắm toàn cảnh Đà Lạt từ trên cao và đi cáp treo đến Thiền Viện Trúc Lâm." },
  { name: "Thác Datanla & Máng trượt", distance: "2.5 km", time: "6 phút", desc: "Khu du lịch sinh thái nổi tiếng với hệ thống máng trượt xuyên rừng dài nhất Đông Nam Á." },
  { name: "Hồ Xuân Hương & Quảng trường", distance: "3.2 km", time: "7 phút", desc: "Trái tim thành phố, biểu tượng nụ hoa Atiso và đường đi dạo ven hồ thơ mộng." },
  { name: "Tiệm Cà Phê Túi Mơ To", distance: "4.0 km", time: "8 phút", desc: "Quán cà phê nhà lồng hoa cúc họa mi nổi tiếng nhất Đà Lạt về đêm." },
  { name: "Chợ Đêm Đà Lạt", distance: "3.8 km", time: "8 phút", desc: "Thưởng thức sữa đậu nành nóng, bánh tráng nướng và dâu tây tươi ngon." },
  { name: "Dinh 3 Bảo Đại", distance: "2.8 km", time: "6 phút", desc: "Biệt điện mang đậm phong cách kiến trúc Pháp giữa rừng thông yên bình." },
];

// ================= DỮ LIỆU FAQ =================
const FAQ_ITEMS = [
  {
    q: "Giờ nhận phòng (Check-in) và trả phòng (Check-out) là mấy giờ?",
    a: "Giờ nhận phòng tiêu chuẩn là từ 14:00 và giờ trả phòng là trước 12:00 trưa hôm sau. Nếu bạn đến sớm hơn hoặc chuyến xe rời đi muộn hơn, homestay luôn sẵn lòng giữ hành lý miễn phí và mời bạn thư giãn tại phòng chờ/sân cà phê.",
  },
  {
    q: "Đường xe ô tô có vào tận cổng homestay được không? Có bãi đỗ xe không?",
    a: "Đường vào ForestView là đường nhựa/bê tông rộng rãi, xe 4 chỗ, 7 chỗ đến 16 chỗ vào thẳng tận sân nhà. Homestay có bãi đỗ xe ô tô và xe máy riêng biệt hoàn toàn miễn phí, có camera an ninh 24/7.",
  },
  {
    q: "Homestay có cho phép mang thú cưng (chó/mèo) đi cùng không?",
    a: "Có! ForestView là homestay thân thiện với thú cưng (Pet-friendly). Chúng tôi có khoảng sân cỏ rộng rãi cho các bé dạo chơi. Bạn chỉ cần thông báo trước khi đặt phòng để chúng tôi sắp xếp bát nước và khăn riêng cho bé.",
  },
  {
    q: "Chúng tôi muốn tự tổ chức tiệc BBQ ngoài trời thì homestay hỗ trợ gì?",
    a: "Homestay hỗ trợ miễn phí 100% bếp nướng, than nướng không khói, vỉ nướng, quạt thổi, chén dĩa và gia vị cơ bản. Ngoài ra, homestay có liên kết cung cấp set thịt ướp sẵn (bò tơ, heo rừng lai, gà đồi, rau củ tươi Đà Lạt) nếu bạn không tiện tự chuẩn bị.",
  },
  {
    q: "Chính sách hủy phòng và hoàn tiền khi thay đổi lịch trình?",
    a: "Với các ngày thường, quý khách được hỗ trợ hủy phòng hoặc đổi ngày miễn phí trước 24 giờ so với giờ nhận phòng. Trong trường hợp bất khả kháng do thời tiết, chúng tôi luôn ưu tiên hỗ trợ bảo lưu đặt phòng trọn đời cho quý khách.",
  },
  {
    q: "Các hình thức thanh toán được chấp nhận tại ForestView?",
    a: "Quý khách có thể thanh toán thuận tiện qua: Chuyển khoản ngân hàng (quét mã QR VietQR tự động xác nhận), Thẻ quốc tế/nội địa, Ví điện tử MoMo, hoặc thanh toán tiền mặt trực tiếp khi nhận phòng.",
  },
];

export default function Home() {
  const { isAuthenticated } = useAuthStore();
  const openAuthModal = useAuthModalStore((s) => s.openModal);

  // Date & Guest states
  const [checkIn, setCheckIn] = useState(() => todayISO());
  const [checkOut, setCheckOut] = useState(() => tomorrowISO());
  const [guests, setGuests] = useState(2);
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Search results modal state
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [searchResults, setSearchResults] = useState<RoomTypeAvailability[] | null>(null);

  // Direct Room Booking Modal State
  const [activeModal, setActiveModal] = useState<{ type: RoomTypeCode; label: string } | null>(null);

  // Reviews & Summary from Backend
  const [reviewSummary, setReviewSummary] = useState<ReviewSummary | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  // Room category filter
  const [selectedRoomCategory, setSelectedRoomCategory] = useState<string>("all");

  // Gallery filter & Lightbox
  const [activeGalleryCat, setActiveGalleryCat] = useState("all");
  const [lightboxImg, setLightboxImg] = useState<{ url: string; title: string; caption: string } | null>(null);

  // FAQ accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Live promo code tester
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [promoChecking, setPromoChecking] = useState(false);
  const [promoResult, setPromoResult] = useState<DiscountCodePreview | null>(null);
  const [promoError, setPromoError] = useState("");

  // Quick inquiry form state
  const [inquiryName, setInquiryName] = useState("");
  const [inquiryPhone, setInquiryPhone] = useState("");
  const [inquiryDate, setInquiryDate] = useState("");
  const [inquiryNote, setInquiryNote] = useState("");
  const [inquirySubmitted, setInquirySubmitted] = useState(false);

  const nights = useMemo(() => getNights(checkIn, checkOut), [checkIn, checkOut]);

  // Load real reviews & summary on mount
  useEffect(() => {
    reviewService
      .getSummary()
      .then(setReviewSummary)
      .catch(() => setReviewSummary(null));

    reviewService
      .getAll()
      .then((data) => {
        setReviews(data.slice(0, 6));
        setReviewsLoading(false);
      })
      .catch(() => {
        setReviewsLoading(false);
      });
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

  const handleTestPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCodeInput.trim()) return;
    setPromoChecking(true);
    setPromoError("");
    setPromoResult(null);

    try {
      const res = await discountService.validate(promoCodeInput.trim().toUpperCase());
      setPromoResult(res);
    } catch (err) {
      setPromoError(getErrorMessage(err, "Mã không hợp lệ hoặc đã hết hạn"));
    } finally {
      setPromoChecking(false);
    }
  };

  const handleQuickInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryName.trim() || !inquiryPhone.trim()) return;
    setInquirySubmitted(true);
  };

  const filteredRooms = useMemo(() => {
    if (selectedRoomCategory === "all") return FEATURED_ROOM_TYPES;
    return FEATURED_ROOM_TYPES.filter((r) => r.category === selectedRoomCategory);
  }, [selectedRoomCategory]);

  const filteredGallery = useMemo(() => {
    if (activeGalleryCat === "all") return GALLERY_IMAGES;
    return GALLERY_IMAGES.filter((img) => img.category === activeGalleryCat);
  }, [activeGalleryCat]);

  return (
    <div className="landing-shell min-h-screen text-ink scroll-smooth pb-16 md:pb-0">
      {/* ================= 1. HERO SECTION ================= */}
      <section
        id="section-hero"
        className="relative flex min-h-[85vh] flex-col items-center justify-center overflow-hidden px-4 pt-16 pb-20 text-center sm:px-6 lg:pt-20 lg:pb-28"
      >
        {/* Subtle Decorative Pines SVG Background */}
        <svg
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[38%] w-full text-primary/6"
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

        <div className="relative z-10 mx-auto max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-surface/80 px-4 py-1.5 text-xs font-semibold tracking-wide text-primary shadow-xs backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
            Đà Lạt, Lâm Đồng · Homestay Giữa Rừng Thông
          </div>

          <h1 className="mx-auto mt-6 max-w-3xl font-display text-4xl leading-[1.15] text-ink sm:text-6xl sm:leading-[1.12]">
            Thức dậy cùng mây ngàn, <br />
            <span className="italic text-primary">chạm vào bình yên</span> giữa đồi thông
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-neutral-600 sm:text-base">
            ForestView Homestay là chốn dừng chân mộc mạc nép mình bên thung lũng thông xanh Đà Lạt.
            Nơi bạn lắng nghe tiếng chim hót sớm mai, tận hưởng tách cà phê Arabica ấm nồng và lưu lại những ngày thong thả nhất.
          </p>

          {/* Booking Engine / Search Bar */}
          <div className="mx-auto mt-9 max-w-4xl rounded-3xl border border-white/90 bg-white/90 p-4 shadow-2xl shadow-primary/10 backdrop-blur-xl sm:p-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1.5fr_1fr_auto]">
              {/* Date range trigger */}
              <div
                onClick={() => setCalendarOpen(!calendarOpen)}
                className="flex cursor-pointer items-center gap-3.5 rounded-2xl border border-line bg-canvas/50 p-3.5 text-left transition hover:border-primary/50 hover:bg-canvas/80"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <CalendarDays size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                    Thời gian lưu trú ({nights} đêm)
                  </p>
                  <p className="truncate text-xs font-semibold text-ink sm:text-sm">
                    {formatDate(checkIn)} → {formatDate(checkOut)}
                  </p>
                </div>
              </div>

              {/* Guests */}
              <div className="flex items-center gap-3.5 rounded-2xl border border-line bg-canvas/50 p-3.5 text-left">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <Users size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                    Số lượng khách
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-ink sm:text-sm">{guests} người</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setGuests(Math.max(1, guests - 1))}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-line bg-surface font-bold text-xs hover:bg-neutral-100 cursor-pointer"
                      >
                        −
                      </button>
                      <button
                        type="button"
                        onClick={() => setGuests(Math.min(10, guests + 1))}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-line bg-surface font-bold text-xs hover:bg-neutral-100 cursor-pointer"
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
                className="flex h-full min-h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-primary-dark disabled:opacity-50 cursor-pointer"
              >
                <Search size={16} />
                {searching ? "Đang kiểm tra..." : "Tìm phòng trống"}
              </button>
            </div>

            {/* Date Calendar Popover */}
            {calendarOpen && (
              <div className="mt-4 border-t border-line/70 pt-4 text-left animate-in fade-in duration-200">
                <div className="mb-2.5 flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-700">Chọn lịch nhận &amp; trả phòng:</span>
                  <button
                    type="button"
                    onClick={() => setCalendarOpen(false)}
                    className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary hover:bg-primary hover:text-white transition cursor-pointer"
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

            {searchError && (
              <p className="mt-3 text-xs text-rose text-center font-medium">{searchError}</p>
            )}
          </div>

          {/* Key Proof Points / Metrics */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-neutral-600 sm:gap-7">
            <span className="flex items-center gap-1.5">
              <Star size={15} className="fill-lantern text-lantern" />
              <b className="text-ink">{reviewSummary ? `${reviewSummary.averageRating.toFixed(1)}/5` : "4.9/5"}</b> Đánh giá hài lòng
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={15} className="text-primary" />
              100% Ảnh chụp thực tế
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <Clock size={15} className="text-accent" />
              Hỗ trợ check-in 24/7
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <Sparkles size={15} className="text-emerald-600" />
              Miễn phí cà phê sáng &amp; bếp BBQ
            </span>
          </div>
        </div>
      </section>

      {/* ================= 2. PHÒNG NGHỈ (ROOM CATALOG & FILTER) ================= */}
      <section id="section-rooms" className="scroll-mt-20 border-t border-line/60 bg-canvas/40 px-4 py-16 sm:px-6 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-display text-sm italic text-accent">Không gian lưu trú</p>
              <h2 className="mt-1 font-display text-3xl font-bold text-ink sm:text-4xl">
                Các hạng phòng tại ForestView
              </h2>
              <p className="mt-2 text-sm text-neutral-600 max-w-xl">
                Tất cả các phòng đều được xây dựng từ gỗ thông tự nhiên, trang bị nệm êm ái, cửa sổ lớn ngắm trọn thung lũng và tiện nghi cao cấp.
              </p>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex flex-wrap gap-1.5 rounded-full border border-line bg-surface/80 p-1.5 shadow-2xs">
              {[
                { id: "all", label: "Tất cả phòng" },
                { id: "couple", label: "Cặp đôi (1-2 khách)" },
                { id: "sunset", label: "View Hoàng hôn" },
                { id: "family", label: "Gia đình / Nhóm" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedRoomCategory(tab.id)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                    selectedRoomCategory === tab.id
                      ? "bg-primary text-white shadow-2xs"
                      : "text-neutral-600 hover:text-primary hover:bg-canvas"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Room Cards Grid */}
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {filteredRooms.map((room) => (
              <div
                key={room.type}
                className="group flex flex-col overflow-hidden rounded-3xl border border-line bg-surface transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl"
              >
                {/* Room Image */}
                <div className="relative h-56 w-full overflow-hidden bg-neutral-100 sm:h-52">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={room.image}
                    alt={room.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <span className={`absolute top-3 left-3 rounded-full px-3 py-1 text-[11px] font-semibold backdrop-blur-md ${room.badgeColor}`}>
                    {room.tag}
                  </span>
                  <span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md">
                    {room.view}
                  </span>
                </div>

                {/* Room Details */}
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <h3 className="font-display text-lg font-bold text-ink group-hover:text-primary transition">
                        {room.name}
                      </h3>
                      <p className="text-xs text-neutral-400">{room.subtitle}</p>
                    </div>
                  </div>

                  <p className="mt-3 flex-1 text-xs leading-5 text-neutral-600">
                    {room.desc}
                  </p>

                  {/* Room Specs */}
                  <div className="mt-4 grid grid-cols-2 gap-2 border-y border-line/60 py-3 text-xs text-neutral-600">
                    <div className="flex items-center gap-1.5">
                      <Users size={14} className="text-primary" />
                      <span>{room.guests}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Maximize2 size={14} className="text-accent" />
                      <span>{room.size}</span>
                    </div>
                    <div className="col-span-2 flex items-center gap-1.5 truncate text-[11px] text-neutral-500">
                      <Bed size={14} className="text-neutral-400 shrink-0" />
                      <span className="truncate">{room.bed}</span>
                    </div>
                  </div>

                  {/* Key Amenities */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {room.amenities.slice(0, 3).map((am) => (
                      <span
                        key={am}
                        className="rounded-md bg-canvas px-2 py-0.5 text-[10px] font-medium text-neutral-600"
                      >
                        ✓ {am}
                      </span>
                    ))}
                    {room.amenities.length > 3 && (
                      <span className="rounded-md bg-canvas px-2 py-0.5 text-[10px] font-medium text-neutral-400">
                        +{room.amenities.length - 3} tiện ích
                      </span>
                    )}
                  </div>

                  {/* Price & Action */}
                  <div className="mt-5 flex items-end justify-between pt-1">
                    <div>
                      <span className="text-[11px] text-neutral-400 block">Giá từ</span>
                      <p className="text-lg font-bold text-accent">
                        {formatPrice(room.price)}
                        <span className="ml-1 text-[11px] font-normal text-neutral-400">/đêm</span>
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
                      className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-primary-dark cursor-pointer flex items-center gap-1"
                    >
                      Đặt phòng <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom callout */}
          <div className="mt-10 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-center sm:p-5">
            <p className="text-xs text-neutral-600 sm:text-sm">
              💡 <b>Mẹo cho bạn:</b> Đặt từ <b>2 đêm</b> trở lên hoặc đăng ký hội viên <b>ForestView Club</b> để nhận thêm ưu đãi giảm giá tự động từ <b>5% - 20%</b>!
            </p>
          </div>
        </div>
      </section>

      {/* ================= 3. TRẢI NGHIỆM ĐẶC QUYỀN (SIGNATURE EXPERIENCES) ================= */}
      <section id="section-experiences" className="scroll-mt-20 border-t border-line/60 bg-surface px-4 py-16 sm:px-6 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-2xl mx-auto">
            <p className="font-display text-sm italic text-accent">Dịch vụ &amp; Tiện ích đặc quyền</p>
            <h2 className="mt-1 font-display text-3xl font-bold text-ink sm:text-4xl">
              Trải nghiệm độc bản giữa rừng thông
            </h2>
            <p className="mt-2 text-sm text-neutral-600">
              Không chỉ là nơi nghỉ ngơi, ForestView mang đến những khoảnh khắc đáng nhớ nhất cho chuyến du hành Đà Lạt của bạn.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {EXPERIENCES.map((exp) => (
              <div
                key={exp.title}
                className="group flex flex-col rounded-3xl border border-line bg-canvas/30 p-6 transition-all duration-300 hover:border-primary/40 hover:bg-surface hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface shadow-2xs group-hover:scale-110 transition-transform">
                    {exp.icon}
                  </div>
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold text-primary">
                    {exp.tag}
                  </span>
                </div>

                <h3 className="mt-5 font-display text-lg font-bold text-ink group-hover:text-primary transition">
                  {exp.title}
                </h3>
                <p className="mt-2 text-xs leading-5 text-neutral-600">
                  {exp.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= 4. THƯ VIỆN HÌNH ẢNH THỰC TẾ (ATMOSPHERIC GALLERY) ================= */}
      <section id="section-gallery" className="scroll-mt-20 border-t border-line/60 bg-canvas/30 px-4 py-16 sm:px-6 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-display text-sm italic text-accent">Bộ sưu tập hình ảnh</p>
              <h2 className="mt-1 font-display text-3xl font-bold text-ink sm:text-4xl">
                Những góc bình yên tại ForestView
              </h2>
              <p className="mt-2 text-sm text-neutral-600 max-w-xl">
                Mỗi góc nhà đều được chăm chút tỉ mỉ với ánh sáng ấm cúng, hoa cỏ Đà Lạt và hương gỗ thông nồng nàn.
              </p>
            </div>

            {/* Gallery Category Filter */}
            <div className="flex flex-wrap gap-1.5 rounded-full border border-line bg-surface/80 p-1.5 shadow-2xs">
              {GALLERY_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveGalleryCat(cat.id)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                    activeGalleryCat === cat.id
                      ? "bg-primary text-white shadow-2xs"
                      : "text-neutral-600 hover:text-primary hover:bg-canvas"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Images Grid */}
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredGallery.map((img) => (
              <div
                key={img.url}
                onClick={() => setLightboxImg(img)}
                className="group relative h-64 overflow-hidden rounded-3xl border border-line bg-neutral-200 cursor-pointer shadow-xs transition duration-300 hover:shadow-xl"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt={img.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-108"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <span className="inline-block rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-medium backdrop-blur-md">
                    Xem ảnh lớn
                  </span>
                  <h4 className="mt-2 font-display text-base font-semibold">{img.title}</h4>
                  <p className="text-xs text-white/80">{img.caption}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Lightbox Modal */}
          {lightboxImg && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm animate-in fade-in"
              onClick={() => setLightboxImg(null)}
            >
              <div
                className="relative max-w-4xl overflow-hidden rounded-3xl border border-white/20 bg-black shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={lightboxImg.url}
                  alt={lightboxImg.title}
                  className="max-h-[75vh] w-full object-contain"
                />
                <div className="p-5 text-left bg-ink text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-display text-lg font-bold">{lightboxImg.title}</h3>
                      <p className="text-xs text-neutral-400">{lightboxImg.caption}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setLightboxImg(null)}
                      className="rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold hover:bg-white/20 transition cursor-pointer"
                    >
                      Đóng ✕
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ================= 5. HỘI VIÊN & MÃ GIẢM GIÁ (CLUB & PROMO CHECKER) ================= */}
      <section id="section-perks" className="scroll-mt-20 border-t border-line/60 bg-surface px-4 py-16 sm:px-6 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
            {/* Left: Club perks */}
            <div className="lg:col-span-7">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                ForestView Club
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold text-ink sm:text-4xl">
                Đặc quyền Hội viên: Giảm đến 20% trọn đời
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                Chỉ cần tạo tài khoản miễn phí, mỗi đêm lưu trú của bạn đều được tích lũy để tự động thăng hạng thẻ thành viên. Ưu đãi áp dụng vĩnh viễn trên mọi lần đặt phòng!
              </p>

              {/* Tiers List */}
              <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-line bg-canvas/40 p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-base font-bold text-amber-700">🥉 Hạng Bronze</span>
                    <span className="rounded-full bg-amber-700/10 px-2 py-0.5 text-xs font-bold text-amber-700">Giảm 5%</span>
                  </div>
                  <p className="mt-2 text-xs text-neutral-600">Áp dụng ngay sau kỳ nghỉ đầu tiên. Tự động trừ vào hóa đơn.</p>
                </div>

                <div className="rounded-2xl border border-line bg-canvas/40 p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-base font-bold text-neutral-500">🥈 Hạng Silver</span>
                    <span className="rounded-full bg-neutral-500/10 px-2 py-0.5 text-xs font-bold text-neutral-700">Giảm 10%</span>
                  </div>
                  <p className="mt-2 text-xs text-neutral-600">Tích lũy từ 3 đêm. Tặng set trà atiso &amp; mứt dâu đón chào.</p>
                </div>

                <div className="rounded-2xl border border-line bg-canvas/40 p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-base font-bold text-yellow-600">🥇 Hạng Gold</span>
                    <span className="rounded-full bg-yellow-600/10 px-2 py-0.5 text-xs font-bold text-yellow-700">Giảm 15%</span>
                  </div>
                  <p className="mt-2 text-xs text-neutral-600">Tích lũy từ 7 đêm. Miễn phí nhận phòng sớm 2h (tùy tình trạng phòng).</p>
                </div>

                <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-base font-bold text-primary">💎 Hạng Diamond</span>
                    <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-white">Giảm 20%</span>
                  </div>
                  <p className="mt-2 text-xs text-neutral-600">Tích lũy từ 15 đêm. Ưu tiên giữ phòng view đẹp nhất + Giỏ quà đặc sản.</p>
                </div>
              </div>

              {/* Join Button */}
              {!isAuthenticated && (
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => openAuthModal("register")}
                    className="rounded-full bg-primary px-6 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-primary-dark cursor-pointer"
                  >
                    Đăng ký hội viên miễn phí
                  </button>
                  <button
                    type="button"
                    onClick={() => openAuthModal("login")}
                    className="rounded-full border border-line bg-surface px-5 py-2.5 text-xs font-semibold text-ink transition hover:bg-neutral-100 cursor-pointer"
                  >
                    Đã có tài khoản? Đăng nhập
                  </button>
                </div>
              )}
            </div>

            {/* Right: Live Promo Code Checker */}
            <div className="lg:col-span-5">
              <div className="rounded-3xl border border-line bg-canvas/60 p-6 sm:p-8 shadow-sm">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 text-accent">
                    <Tag size={18} />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-bold text-ink">Kiểm tra Mã Giảm Giá</h3>
                    <p className="text-xs text-neutral-500">Nhập mã ưu đãi của bạn để kiểm tra mức chiết khấu</p>
                  </div>
                </div>

                <form onSubmit={handleTestPromo} className="mt-5 space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ví dụ: DALATSPRING"
                      value={promoCodeInput}
                      onChange={(e) => setPromoCodeInput(e.target.value)}
                      className="flex-1 uppercase tracking-wider font-mono rounded-xl border border-line bg-surface px-3.5 py-2.5 text-xs font-semibold text-ink placeholder:text-neutral-400 focus:border-primary focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={promoChecking || !promoCodeInput.trim()}
                      className="rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-primary-dark disabled:opacity-50 cursor-pointer"
                    >
                      {promoChecking ? "Đang ktra..." : "Kiểm tra"}
                    </button>
                  </div>

                  {promoResult && (
                    <div className="rounded-2xl border border-emerald-300 bg-emerald-50/80 p-3.5 text-xs text-emerald-800 animate-in fade-in">
                      <div className="flex items-center gap-2 font-semibold">
                        <CheckCircle2 size={16} className="text-emerald-600" />
                        Mã &ldquo;{promoResult.code}&rdquo; hợp lệ!
                      </div>
                      <p className="mt-1 pl-6">
                        Bạn được chiết khấu ngay <b>{promoResult.percent}%</b> trên tổng giá trị đặt phòng.
                      </p>
                    </div>
                  )}

                  {promoError && (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-3.5 text-xs text-rose-700 animate-in fade-in flex items-center gap-2">
                      <AlertCircle size={16} className="text-rose-600 shrink-0" />
                      <span>{promoError}</span>
                    </div>
                  )}
                </form>

                <div className="mt-6 border-t border-line/60 pt-4 text-xs text-neutral-500">
                  <p className="font-semibold text-ink">Mã ưu đãi công khai hiện có:</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span
                      onClick={() => setPromoCodeInput("DALATSPRING")}
                      className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-dashed border-primary/40 bg-surface px-2.5 py-1 font-mono text-[11px] font-bold text-primary hover:bg-primary/5"
                    >
                      DALATSPRING (Giảm 10%)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 6. ĐÁNH GIÁ KHÁCH HÀNG (REVIEWS & TRUST) ================= */}
      <section id="section-reviews" className="scroll-mt-20 border-t border-line/60 bg-canvas/30 px-4 py-16 sm:px-6 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-2xl mx-auto">
            <p className="font-display text-sm italic text-accent">Cảm nhận chân thực</p>
            <h2 className="mt-1 font-display text-3xl font-bold text-ink sm:text-4xl">
              Khách hàng nói gì về ForestView
            </h2>
            <p className="mt-2 text-sm text-neutral-600">
              100% đánh giá từ những vị khách đã trực tiếp lưu trú và trải nghiệm không gian homestay.
            </p>
          </div>

          {/* Rating Summary Bar */}
          <div className="mt-8 flex justify-center">
            <div className="inline-flex items-center gap-3 rounded-full border border-line bg-surface px-6 py-2.5 shadow-sm">
              <div className="flex items-center gap-1 text-lantern font-bold text-base">
                <Star size={18} className="fill-lantern" />
                <span>{reviewSummary ? reviewSummary.averageRating.toFixed(1) : "4.9"} / 5.0</span>
              </div>
              <span className="text-neutral-300">|</span>
              <span className="text-xs font-semibold text-neutral-600">
                Dựa trên {reviewSummary ? reviewSummary.totalReviews : "30+"} đánh giá thực tế
              </span>
            </div>
          </div>

          {/* Reviews Grid */}
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {reviewsLoading ? (
              <div className="col-span-full py-10 text-center text-xs text-neutral-500">
                Đang tải các đánh giá mới nhất...
              </div>
            ) : reviews.length > 0 ? (
              reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="flex flex-col justify-between rounded-3xl border border-line bg-surface p-6 shadow-2xs transition hover:border-primary/40 hover:shadow-md"
                >
                  <div>
                    {/* Stars */}
                    <div className="flex items-center gap-1 text-lantern text-xs">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={i < rev.rating ? "fill-lantern text-lantern" : "text-neutral-200"}
                        />
                      ))}
                    </div>

                    <p className="mt-3 text-xs leading-relaxed text-neutral-700 italic">
                      &ldquo;{rev.comment}&rdquo;
                    </p>
                  </div>

                  <div className="mt-5 border-t border-line/60 pt-3 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-ink">{rev.userFullName}</p>
                      <p className="text-[11px] text-neutral-400">{rev.roomName || rev.roomTypeLabel}</p>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                      ✓ Đã lưu trú
                    </span>
                  </div>
                </div>
              ))
            ) : (
              // Fallback sample testimonials if API empty
              [
                {
                  id: 1,
                  userFullName: "Nguyễn Minh Trang",
                  roomName: "Superior Room (View Thung Lũng)",
                  rating: 5,
                  comment: "Phòng đẹp xuất sắc y hệt ảnh, bồn tắm ngắm thẳng ra thung lũng thông rất chill. Anh chị chủ homestay siêu nhiệt tình, cà phê sáng rất thơm ngon!",
                },
                {
                  id: 2,
                  userFullName: "Trần Đức Anh",
                  roomName: "Suite Family",
                  rating: 5,
                  comment: "Cả gia đình mình 5 người ở phòng Suite rất rộng rãi, bếp nấu tiện lợi. Buổi tối nướng BBQ bên bếp than lửa ấm cúng vô cùng. Sẽ quay lại!",
                },
                {
                  id: 3,
                  userFullName: "Lê Hoàng Nam",
                  roomName: "Deluxe Room",
                  rating: 5,
                  comment: "Kính ngắm hoàng hôn đỉnh cao, hoàng hôn Đà Lạt nhìn từ ban công phòng tuyệt đẹp. Đường đi ô tô 7 chỗ vào tận sân rất thuận tiện.",
                },
              ].map((rev) => (
                <div
                  key={rev.id}
                  className="flex flex-col justify-between rounded-3xl border border-line bg-surface p-6 shadow-2xs"
                >
                  <div>
                    <div className="flex items-center gap-1 text-lantern text-xs">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} size={14} className="fill-lantern text-lantern" />
                      ))}
                    </div>
                    <p className="mt-3 text-xs leading-relaxed text-neutral-700 italic">
                      &ldquo;{rev.comment}&rdquo;
                    </p>
                  </div>
                  <div className="mt-5 border-t border-line/60 pt-3 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-ink">{rev.userFullName}</p>
                      <p className="text-[11px] text-neutral-400">{rev.roomName}</p>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                      ✓ Đã lưu trú
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ================= 7. VỊ TRÍ & ĐIỂM ĐẾN LÂN CẬN (LOCATION GUIDE) ================= */}
      <section id="section-location" className="scroll-mt-20 border-t border-line/60 bg-surface px-4 py-16 sm:px-6 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-5">
              <p className="font-display text-sm italic text-accent">Vị trí đắc địa</p>
              <h2 className="mt-1 font-display text-3xl font-bold text-ink sm:text-4xl">
                Nép mình giữa rừng, kết nối mọi điểm đến
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                Tọa lạc tại Phường 3, TP. Đà Lạt — vị trí lý tưởng đủ yên tĩnh tách biệt khỏi ồn ào phố thị, nhưng chỉ mất vài phút di chuyển đến trung tâm và các điểm tham quan nổi tiếng.
              </p>

              <div className="mt-6 rounded-2xl border border-line bg-canvas/40 p-4 text-xs text-neutral-700 space-y-2">
                <p className="flex items-center gap-2">
                  <MapPin size={15} className="text-accent shrink-0" />
                  <span><b>Địa chỉ:</b> Phường 3, TP. Đà Lạt, Tỉnh Lâm Đồng</span>
                </p>
                <p className="flex items-center gap-2">
                  <Car size={15} className="text-primary shrink-0" />
                  <span><b>Đường đi:</b> Đường bê tông rộng rãi, ô tô 4-16 chỗ vào tận sân</span>
                </p>
                <p className="flex items-center gap-2">
                  <Clock size={15} className="text-lantern shrink-0" />
                  <span><b>Cách trung tâm:</b> Chỉ 7 phút đi xe máy / taxi</span>
                </p>
              </div>

              <div className="mt-6">
                <a
                  href="https://maps.google.com/?q=Dalat+Lam+Dong"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-primary-dark"
                >
                  <Compass size={15} /> Mở bản đồ chỉ đường Google Maps
                </a>
              </div>
            </div>

            {/* Nearby attractions list */}
            <div className="lg:col-span-7">
              <div className="rounded-3xl border border-line bg-canvas/30 p-6 sm:p-8">
                <h3 className="font-display text-lg font-bold text-ink mb-4">
                  Khoảng cách đến các địa danh nổi tiếng:
                </h3>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {NEARBY_PLACES.map((place) => (
                    <div
                      key={place.name}
                      className="rounded-2xl border border-line/80 bg-surface p-4 transition hover:border-primary/30 hover:shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-xs text-ink">{place.name}</h4>
                        <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-bold text-accent">
                          {place.time}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-neutral-400 font-medium">Khoảng cách: {place.distance}</p>
                      <p className="mt-1.5 text-[11px] leading-4 text-neutral-600">{place.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 8. CÂU HỎI THƯỜNG GẶP (FAQ ACCORDION) ================= */}
      <section id="section-faq" className="scroll-mt-20 border-t border-line/60 bg-canvas/30 px-4 py-16 sm:px-6 lg:py-24">
        <div className="mx-auto max-w-4xl">
          <div className="text-center max-w-xl mx-auto">
            <p className="font-display text-sm italic text-accent">Giải đáp thắc mắc</p>
            <h2 className="mt-1 font-display text-3xl font-bold text-ink sm:text-4xl">
              Câu hỏi thường gặp
            </h2>
            <p className="mt-2 text-sm text-neutral-600">
              Mọi điều bạn cần biết trước khi khởi hành đến với ForestView Homestay Đà Lạt.
            </p>
          </div>

          <div className="mt-10 space-y-3">
            {FAQ_ITEMS.map((item, idx) => (
              <div
                key={idx}
                className="overflow-hidden rounded-2xl border border-line bg-surface transition shadow-2xs"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                  className="flex w-full items-center justify-between p-5 text-left text-sm font-semibold text-ink hover:text-primary transition cursor-pointer"
                >
                  <span className="flex items-center gap-3">
                    <HelpCircle size={18} className="text-primary shrink-0" />
                    {item.q}
                  </span>
                  <ChevronDown
                    size={18}
                    className={`shrink-0 text-neutral-400 transition-transform duration-300 ${
                      openFaqIndex === idx ? "rotate-180 text-primary" : ""
                    }`}
                  />
                </button>

                {openFaqIndex === idx && (
                  <div className="border-t border-line/60 px-5 pt-3 pb-5 text-xs leading-relaxed text-neutral-600 animate-in fade-in">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= 9. VỀ CHÚNG TÔI (OUR STORY) ================= */}
      <section id="section-about" className="scroll-mt-20 border-t border-line/60 bg-surface px-4 py-16 sm:px-6 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-6">
              <p className="font-display text-sm italic text-accent">Câu chuyện của chúng tôi</p>
              <h2 className="mt-1 font-display text-3xl font-bold text-ink sm:text-4xl">
                ForestView: Chốn về của những tâm hồn yêu Đà Lạt
              </h2>
              <div className="mt-5 space-y-4 text-sm leading-relaxed text-neutral-600">
                <p>
                  ForestView bắt đầu từ ước mơ về một mái nhà gỗ nhỏ nép mình dưới rặng thông già, nơi mỗi sớm mai có thể kéo rèm đón từng vạt nắng xuyên qua làn sương bảng lảng và nhấp một ngụm trà ấm.
                </p>
                <p>
                  Chúng tôi xây dựng ForestView không phải như một khách sạn thương mại công nghiệp, mà như một ngôi nhà thực sự của chính mình — nơi mỗi góc nhỏ đều có hơi ấm, mỗi món đồ gỗ đều được đẽo gọt mộc mạc và mỗi vị khách ghé thăm đều là một người bạn phương xa trở về.
                </p>
              </div>

              <div className="mt-8 grid grid-cols-3 gap-4">
                <div className="rounded-2xl border border-line bg-canvas/40 p-4 text-center">
                  <p className="font-display text-2xl font-bold text-primary">4</p>
                  <p className="mt-0.5 text-xs text-neutral-500">Hạng phòng</p>
                </div>
                <div className="rounded-2xl border border-line bg-canvas/40 p-4 text-center">
                  <p className="font-display text-2xl font-bold text-accent">100%</p>
                  <p className="mt-0.5 text-xs text-neutral-500">Gỗ thông tự nhiên</p>
                </div>
                <div className="rounded-2xl border border-line bg-canvas/40 p-4 text-center">
                  <p className="font-display text-2xl font-bold text-lantern-dark">4.9 ★</p>
                  <p className="mt-0.5 text-xs text-neutral-500">Khách hài lòng</p>
                </div>
              </div>
            </div>

            <div className="relative lg:col-span-6">
              <div className="relative h-96 w-full overflow-hidden rounded-3xl border border-line shadow-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1000&auto=format&fit=crop"
                  alt="Rừng thông Đà Lạt quanh ForestView"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <p className="font-display text-lg font-bold italic">&ldquo;Đến Đà Lạt để sống chậm hơn một chút.&rdquo;</p>
                  <p className="text-xs text-white/80 mt-1">— Đội ngũ ForestView Homestay</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 10. TƯ VẤN & LIÊN HỆ (INQUIRY & CONTACT) ================= */}
      <section id="section-contact" className="scroll-mt-20 border-t border-line/60 bg-canvas/50 px-4 py-16 sm:px-6 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
            {/* Left: Contact info */}
            <div className="lg:col-span-5">
              <p className="font-display text-sm italic text-accent">Chúng tôi luôn lắng nghe</p>
              <h2 className="mt-1 font-display text-3xl font-bold text-ink sm:text-4xl">
                Liên hệ trực tiếp với ForestView
              </h2>
              <p className="mt-3 text-sm text-neutral-600">
                Bạn cần tư vấn chọn phòng phù hợp, đặt xe máy hay yêu cầu chuẩn bị tiệc BBQ đặc biệt? Hãy nhắn ngay cho chúng tôi!
              </p>

              <div className="mt-8 space-y-4 rounded-3xl border border-line bg-surface p-6 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <PhoneCall size={18} />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-neutral-400">Hotline / Zalo hỗ trợ 24/7</p>
                    <a href="tel:0900000000" className="text-sm font-bold text-ink hover:text-primary transition">
                      0900 000 000
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3 border-t border-line/60 pt-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-neutral-400">Email phản hồi</p>
                    <a href="mailto:hello@forestview.vn" className="text-sm font-bold text-ink hover:text-accent transition">
                      hello@forestview.vn
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3 border-t border-line/60 pt-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-lantern/10 text-lantern-dark">
                    <Clock size={18} />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-neutral-400">Thời gian đón tiếp</p>
                    <p className="text-xs font-semibold text-ink">07:00 – 22:00 (Hỗ trợ check-in muộn theo hẹn)</p>
                  </div>
                </div>
              </div>

              {/* Direct Call / Zalo Buttons */}
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="tel:0900000000"
                  className="rounded-full bg-primary px-6 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-primary-dark transition"
                >
                  Gọi hotline ngay
                </a>
                <a
                  href="https://zalo.me"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-line bg-surface px-6 py-2.5 text-xs font-semibold text-ink hover:bg-neutral-100 transition"
                >
                  Nhắn tin qua Zalo
                </a>
              </div>
            </div>

            {/* Right: Quick Callback / Inquiry Form */}
            <div className="lg:col-span-7">
              <div className="rounded-3xl border border-line bg-surface p-6 sm:p-8 shadow-sm">
                <h3 className="font-display text-xl font-bold text-ink">
                  Gửi yêu cầu tư vấn &amp; Giữ chỗ nhanh
                </h3>
                <p className="mt-1 text-xs text-neutral-500">
                  Điền thông tin bên dưới, quản lý ForestView sẽ liên hệ lại qua số điện thoại/Zalo trong vòng 15 phút.
                </p>

                {inquirySubmitted ? (
                  <div className="mt-6 rounded-2xl border border-emerald-300 bg-emerald-50 p-6 text-center animate-in fade-in">
                    <CheckCircle2 size={36} className="mx-auto text-emerald-600" />
                    <h4 className="mt-2 font-display text-base font-bold text-emerald-900">
                      Đã nhận được thông tin của bạn!
                    </h4>
                    <p className="mt-1 text-xs text-emerald-700">
                      ForestView sẽ gọi hoặc nhắn tin Zalo cho bạn theo số <b>{inquiryPhone}</b> để xác nhận và hỗ trợ mức giá tốt nhất.
                    </p>
                    <button
                      type="button"
                      onClick={() => setInquirySubmitted(false)}
                      className="mt-4 text-xs font-semibold text-emerald-800 underline hover:no-underline cursor-pointer"
                    >
                      Gửi yêu cầu khác
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleQuickInquiry} className="mt-6 space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-semibold text-neutral-700 mb-1">Họ và tên của bạn *</label>
                        <input
                          type="text"
                          required
                          placeholder="Nguyễn Văn A"
                          value={inquiryName}
                          onChange={(e) => setInquiryName(e.target.value)}
                          className="w-full rounded-xl border border-line bg-canvas/30 px-3.5 py-2.5 text-xs font-medium text-ink focus:border-primary focus:bg-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-neutral-700 mb-1">Số điện thoại / Zalo *</label>
                        <input
                          type="tel"
                          required
                          placeholder="0912 345 678"
                          value={inquiryPhone}
                          onChange={(e) => setInquiryPhone(e.target.value)}
                          className="w-full rounded-xl border border-line bg-canvas/30 px-3.5 py-2.5 text-xs font-medium text-ink focus:border-primary focus:bg-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">Ngày dự kiến đến</label>
                      <input
                        type="date"
                        value={inquiryDate}
                        onChange={(e) => setInquiryDate(e.target.value)}
                        className="w-full rounded-xl border border-line bg-canvas/30 px-3.5 py-2.5 text-xs font-medium text-ink focus:border-primary focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">Ghi chú hoặc yêu cầu đặc biệt</label>
                      <textarea
                        rows={3}
                        placeholder="Số lượng người, có mang thú cưng không, cần chuẩn bị tiệc BBQ..."
                        value={inquiryNote}
                        onChange={(e) => setInquiryNote(e.target.value)}
                        className="w-full rounded-xl border border-line bg-canvas/30 px-3.5 py-2.5 text-xs font-medium text-ink focus:border-primary focus:bg-white focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full rounded-xl bg-primary py-3 text-xs font-bold text-white shadow-md transition hover:bg-primary-dark cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Send size={15} /> Gửi yêu cầu tư vấn ngay
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 11. FOOTER EMBEDDED ================= */}
      <Footer embedded />

      {/* ================= 12. STICKY BOTTOM QUICK BOOKING DOCK (MOBILE & TABLET) ================= */}
      <div className="fixed bottom-0 inset-x-0 z-40 border-t border-line bg-white/95 px-4 py-3 shadow-xl backdrop-blur-md md:hidden">
        <div className="flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] text-neutral-400 block font-medium">ForestView Homestay</span>
            <span className="text-xs font-bold text-accent">Từ 450.000₫/đêm</span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="tel:0900000000"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-surface text-ink hover:bg-neutral-100"
              title="Gọi hotline"
            >
              <PhoneCall size={16} />
            </a>
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById("section-rooms");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-primary-dark cursor-pointer"
            >
              Chọn phòng ngay
            </button>
          </div>
        </div>
      </div>

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
    </div>
  );
}
