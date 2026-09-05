"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { roomService } from "@/lib/services/roomService";
import { bookingService } from "@/lib/services/bookingService";
import { discountService } from "@/lib/services/discountService";
import { PricePreview, Review, Room, PaymentMethod } from "@/types";
import { useAuthStore } from "@/hooks/useAuthStore";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { membershipDiscountPercent } from "@/lib/membership";
import DateRangeCalendar from "@/components/DateRangeCalendar";
import PaymentModal from "@/components/PaymentModal";
import { reviewService } from "@/lib/services/reviewService";
import {
  BedDouble,
  Building,
  CalendarDays,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Compass,
  FileText,
  Image as ImageIcon,
  Maximize2,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  X,
} from "lucide-react";

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
}

function nightsBetween(a: string, b: string) {
  if (!a || !b) return 0;
  const start = new Date(`${a}T00:00:00`).getTime();
  const end = new Date(`${b}T00:00:00`).getTime();
  return Math.max(1, Math.round((end - start) / 86400000));
}

function formatDate(date: string) {
  if (!date) return "";
  return new Date(`${date}T00:00:00`).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function RoomDetailPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  const initialCheckIn = searchParams.get("checkIn") ?? "";
  const initialCheckOut = searchParams.get("checkOut") ?? "";

  const [room, setRoom] = useState<Room | null>(null);
  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [guests, setGuests] = useState(1);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [pricing, setPricing] = useState<PricePreview | null>(null);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);

  // Gallery state
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Discount code state
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; percent: number } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [checkingCoupon, setCheckingCoupon] = useState(false);

  useEffect(() => {
    roomService
      .getById(Number(id))
      .then((data) => {
        setRoom(data);
        if (data.recommendedGuests) {
          setGuests(data.recommendedGuests);
        }
      })
      .catch((err) => setError(getErrorMessage(err, "Không thể tải phòng")));
  }, [id]);

  useEffect(() => {
    if (!room) return;
    reviewService.getForRoom(room.id).then(setReviews).catch(() => undefined);
  }, [room]);

  useEffect(() => {
    if (!room || !checkIn || !checkOut || checkOut <= checkIn) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clearing a stale async price quote when the date range becomes invalid is intentional
      setPricing(null);
      return;
    }
    let active = true;
    setPricingLoading(true);
    roomService
      .getPricePreview(room.id, checkIn, checkOut, guests)
      .then((quote) => active && setPricing(quote))
      .catch((err) => active && setError(getErrorMessage(err, "Không thể cập nhật báo giá")))
      .finally(() => active && setPricingLoading(false));
    return () => {
      active = false;
    };
  }, [room, checkIn, checkOut, guests]);

  const nights = nightsBetween(checkIn, checkOut);
  const extraGuests = Math.max(0, guests - (room?.recommendedGuests ?? 0));

  const beforeDiscount = pricing?.totalBeforeDiscount ?? 0;
  const couponAmount = appliedCoupon ? (beforeDiscount * appliedCoupon.percent) / 100 : 0;
  const afterCoupon = beforeDiscount - couponAmount;

  const membershipPercent = membershipDiscountPercent(user?.membershipTier);
  const membershipAmount = (afterCoupon * membershipPercent) / 100;

  const estimate = Math.max(0, afterCoupon - membershipAmount);

  const chooseDates = (a: string, b: string) => {
    setCheckIn(a);
    setCheckOut(b);
    setError("");
  };

  const handleApplyCoupon = async () => {
    setCouponError("");
    if (!couponInput.trim()) return;

    setCheckingCoupon(true);
    try {
      const preview = await discountService.validate(couponInput.trim());
      setAppliedCoupon({ code: preview.code, percent: preview.percent });
    } catch (err) {
      setAppliedCoupon(null);
      setCouponError(getErrorMessage(err, "Mã giảm giá không hợp lệ"));
    } finally {
      setCheckingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponError("");
  };

  const submit = (method: PaymentMethod) => {
    if (!room) return;

    setSubmitting(true);
    bookingService
      .create({
        roomId: room.id,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        guestCount: guests,
        note: note.trim() || undefined,
        paymentMethod: method,
        discountCode: appliedCoupon?.code,
      })
      .then((r) => {
        setPaymentOpen(false);
        setSuccess(r.bookingCode);
      })
      .catch((err) => setError(getErrorMessage(err, "Đặt phòng thất bại, vui lòng thử lại")))
      .finally(() => setSubmitting(false));
  };

  const handleConfirmClick = () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (!user?.emailVerified) {
      setError("Vui lòng xác thực email trước khi đặt phòng");
      return;
    }
    if (checkOut <= checkIn) {
      setError("Ngày trả phòng phải sau ngày nhận phòng");
      return;
    }
    setPaymentOpen(true);
  };

  if (!room) {
    return <main className="p-10 text-center text-neutral-500">{error || "Đang tải thông tin phòng..."}</main>;
  }

  const allImages = room.images && room.images.length > 0 ? room.images : ["/placeholder-room.jpg"];
  const currentImage = allImages[activeImageIndex] || allImages[0];

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
  };

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
  };

  return (
    <main className="mx-auto max-w-6xl px-5 py-10 sm:py-14">
      {/* Header Info */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-accent/10 px-2.5 py-0.5 text-xs font-bold text-accent uppercase">
              {room.typeLabel || room.type}
            </span>
            <span className="text-xs text-neutral-400">·</span>
            <p className="font-display text-sm italic text-neutral-500">{room.address}</p>
          </div>
          <h1 className="mt-1 font-display text-3xl text-ink sm:text-4xl">{room.name}</h1>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-neutral-500">
            ⭐ {reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "5.0"}
            <span className="ml-1 text-xs text-neutral-400">({reviews.length} đánh giá)</span>
          </span>
        </div>
      </div>

      {/* Interactive Multi-Image Gallery */}
      <div className="mt-6 space-y-3">
        {/* Main Hero Image */}
        <div className="group relative h-80 w-full overflow-hidden rounded-3xl bg-ink sm:h-110">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentImage}
            alt={`${room.name} - Ảnh ${activeImageIndex + 1}`}
            className="h-full w-full object-cover transition duration-500"
          />

          {/* Badge: Main / Gallery */}
          <div className="absolute top-4 left-4 flex gap-2">
            <span className="rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
              {activeImageIndex === 0 ? "⭐ Ảnh đại diện chính" : `🖼️ Ảnh chi tiết #${activeImageIndex}`}
            </span>
          </div>

          {/* Image Counter & Lightbox Toggle */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <span className="rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
              {activeImageIndex + 1} / {allImages.length}
            </span>
            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition hover:bg-black/80"
              title="Xem toàn màn hình"
            >
              <Maximize2 size={14} />
            </button>
          </div>

          {/* Next / Prev Navigation Buttons */}
          {allImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrevImage}
                className="absolute top-1/2 left-3 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white opacity-0 backdrop-blur-md transition group-hover:opacity-100 hover:bg-black/80"
                aria-label="Ảnh trước"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                onClick={handleNextImage}
                className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white opacity-0 backdrop-blur-md transition group-hover:opacity-100 hover:bg-black/80"
                aria-label="Ảnh kế tiếp"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}
        </div>

        {/* Thumbnail Carousel Bar */}
        {allImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {allImages.map((img, idx) => (
              <button
                key={img + idx}
                type="button"
                onClick={() => setActiveImageIndex(idx)}
                className={`relative h-18 w-24 shrink-0 overflow-hidden rounded-xl border-2 transition sm:h-20 sm:w-28 ${
                  activeImageIndex === idx
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt={`Thumbnail ${idx + 1}`} className="h-full w-full object-cover" />
                {idx === 0 && (
                  <span className="absolute bottom-1 left-1 rounded bg-black/70 px-1 py-0.2 text-[9px] font-bold text-white">
                    Cover
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Content & Booking Form */}
      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1.3fr_.85fr]">
        {/* Left Column: Room Details */}
        <div className="space-y-8">
          {/* Overview */}
          <div>
            <h2 className="font-display text-xl text-ink">Giới thiệu không gian</h2>
            <p className="mt-2 text-sm leading-relaxed text-neutral-600 sm:text-base">
              {room.description || "Chưa có mô tả chi tiết cho phòng này."}
            </p>
          </div>

          {/* Rich Room Specs */}
          <div>
            <h2 className="font-display text-xl text-ink">Thông số &amp; Tiện nghi phòng</h2>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {room.roomSize && (
                <div className="flex items-start gap-3 rounded-2xl border border-line bg-surface p-3.5 shadow-2xs">
                  <Maximize2 size={18} className="mt-0.5 text-primary" />
                  <div>
                    <p className="text-xs text-neutral-400">Diện tích</p>
                    <p className="font-semibold text-ink text-sm">{room.roomSize} m²</p>
                  </div>
                </div>
              )}

              {room.bedConfiguration && (
                <div className="flex items-start gap-3 rounded-2xl border border-line bg-surface p-3.5 shadow-2xs">
                  <BedDouble size={18} className="mt-0.5 text-primary" />
                  <div>
                    <p className="text-xs text-neutral-400">Loại giường</p>
                    <p className="font-semibold text-ink text-sm">{room.bedConfiguration}</p>
                  </div>
                </div>
              )}

              {room.viewDescription && (
                <div className="flex items-start gap-3 rounded-2xl border border-line bg-surface p-3.5 shadow-2xs col-span-2 sm:col-span-1">
                  <Compass size={18} className="mt-0.5 text-primary" />
                  <div>
                    <p className="text-xs text-neutral-400">Hướng nhìn</p>
                    <p className="font-semibold text-ink text-sm">{room.viewDescription}</p>
                  </div>
                </div>
              )}

              {room.bathroomDescription && (
                <div className="flex items-start gap-3 rounded-2xl border border-line bg-surface p-3.5 shadow-2xs">
                  <Sparkles size={18} className="mt-0.5 text-primary" />
                  <div>
                    <p className="text-xs text-neutral-400">Phòng tắm</p>
                    <p className="font-semibold text-ink text-sm">{room.bathroomDescription}</p>
                  </div>
                </div>
              )}

              {room.floor && (
                <div className="flex items-start gap-3 rounded-2xl border border-line bg-surface p-3.5 shadow-2xs">
                  <Building size={18} className="mt-0.5 text-primary" />
                  <div>
                    <p className="text-xs text-neutral-400">Vị trí tầng</p>
                    <p className="font-semibold text-ink text-sm">{room.floor}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3 rounded-2xl border border-line bg-surface p-3.5 shadow-2xs">
                <Clock size={18} className="mt-0.5 text-primary" />
                <div>
                  <p className="text-xs text-neutral-400">Giờ lưu trú</p>
                  <p className="font-semibold text-ink text-sm">
                    {room.checkInTime ?? "14:00"} – {room.checkOutTime ?? "12:00"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div>
            <h2 className="font-display text-xl text-ink">Tiện ích bao gồm</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {room.amenities && room.amenities.length > 0 ? (
                room.amenities.map((a) => (
                  <li
                    key={a}
                    className="flex items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 py-1.5 text-xs font-medium text-neutral-700 shadow-2xs"
                  >
                    <CheckCircle size={13} className="text-primary" />
                    {a}
                  </li>
                ))
              ) : (
                <li className="text-xs text-neutral-500">Bao gồm các tiện nghi phòng tiêu chuẩn.</li>
              )}
            </ul>
          </div>

          {/* House Rules */}
          {room.houseRules && (
            <div className="rounded-2xl border border-line bg-base/40 p-5">
              <h3 className="flex items-center gap-2 font-display text-base text-ink">
                <FileText size={16} className="text-primary" /> Quy định &amp; Lưu ý lưu trú
              </h3>
              <p className="mt-2 text-xs leading-5 whitespace-pre-line text-neutral-600">
                {room.houseRules}
              </p>
            </div>
          )}

          {/* Reviews */}
          <section className="border-t border-line pt-8">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">Đánh giá từ khách</p>
                <h2 className="mt-1 font-display text-xl text-ink">Trải nghiệm thực tế ({reviews.length})</h2>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {reviews.length ? (
                reviews.slice(0, 5).map((review) => (
                  <article key={review.id} className="rounded-2xl border border-line bg-surface p-4 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sm text-ink">{review.userFullName}</p>
                      <span className="text-amber-500 text-xs">
                        {"★".repeat(review.rating)}
                        <span className="text-neutral-200">{"★".repeat(5 - review.rating)}</span>
                      </span>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-neutral-600">{review.comment}</p>
                  </article>
                ))
              ) : (
                <p className="text-xs text-neutral-500">Phòng này chưa có đánh giá. Hãy là người đầu tiên chia sẻ trải nghiệm.</p>
              )}
            </div>
          </section>
        </div>

        {/* Right Column: Booking Widget */}
        <div className="h-fit rounded-3xl border border-line bg-surface p-6 shadow-sm">
          <div className="flex items-baseline justify-between border-b border-line pb-4">
            <div>
              <span className="text-xs text-neutral-400">Giá phòng gốc</span>
              <p className="text-2xl font-bold text-accent">
                {formatPrice(room.pricePerNight)}
                <span className="ml-1 text-xs font-normal text-neutral-400">/đêm</span>
              </p>
            </div>
            {nights > 0 && (
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                {nights} đêm lưu trú
              </span>
            )}
          </div>

          {/* Calendar Picker */}
          <div className="mt-5">
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-600">
              Chọn lịch lưu trú
            </label>
            <div className="mt-2">
              <DateRangeCalendar
                checkIn={checkIn}
                checkOut={checkOut}
                onChange={chooseDates}
                minDate={new Date().toISOString().slice(0, 10)}
              />
            </div>
          </div>

          {/* Guests Selector */}
          <div className="mt-5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-600">Số lượng khách</label>
              <span className="text-xs text-neutral-400">
                Đề xuất {room.recommendedGuests} · tối đa {room.maxGuests} khách
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between rounded-xl border border-line bg-base/50 p-2">
              <span className="text-sm font-semibold text-ink pl-2">{guests} khách</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setGuests(Math.max(1, guests - 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-surface font-bold text-ink hover:bg-neutral-100"
                >
                  −
                </button>
                <button
                  type="button"
                  onClick={() => setGuests(Math.min(room.maxGuests, guests + 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-surface font-bold text-ink hover:bg-neutral-100"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Extra guests surcharge */}
          {extraGuests > 0 && pricing && (
            <div className="mt-3 rounded-xl bg-accent/10 p-3 text-xs text-accent">
              Phụ thu {extraGuests} khách vượt chuẩn ({formatPrice(pricing.extraGuestSubtotal)})
            </div>
          )}

          {/* Coupon Code Input */}
          <div className="mt-5">
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-600">Mã ưu đãi</label>
            {appliedCoupon ? (
              <div className="mt-1.5 flex items-center justify-between rounded-xl border border-primary/40 bg-primary/5 px-3 py-2 text-xs">
                <span className="font-semibold text-primary">
                  {appliedCoupon.code} · giảm {appliedCoupon.percent}%
                </span>
                <button type="button" onClick={removeCoupon} className="text-neutral-400 hover:text-red-600">
                  Bỏ mã
                </button>
              </div>
            ) : (
              <div className="mt-1.5 flex gap-2">
                <input
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="Nhập mã giảm giá"
                  className="flex-1 rounded-xl border border-line bg-base/50 px-3 py-2 text-xs uppercase focus:border-primary focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={checkingCoupon || !couponInput.trim()}
                  className="rounded-xl border border-line bg-surface px-4 py-2 text-xs font-semibold hover:bg-neutral-100 disabled:opacity-50"
                >
                  {checkingCoupon ? "..." : "Áp dụng"}
                </button>
              </div>
            )}
            {couponError && <p className="mt-1 text-xs text-red-600">{couponError}</p>}
          </div>

          {/* Note Input */}
          <div className="mt-4">
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-600">Ghi chú yêu cầu</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="VD: Cần nhận phòng sớm, chuẩn bị thêm chăn..."
              className="mt-1.5 w-full rounded-xl border border-line bg-base/50 p-2.5 text-xs focus:border-primary focus:outline-none"
            />
          </div>

          {/* Price Breakdown */}
          {nights > 0 && (
            <div className="mt-5 space-y-2 rounded-2xl border border-line bg-base/30 p-4 text-xs">
              {pricingLoading && <p className="text-neutral-400">Đang tính giá lưu trú theo số đêm...</p>}
              {pricing && (
                <>
                  {pricing.weekdayNights > 0 && (
                    <div className="flex justify-between text-neutral-600">
                      <span>Ngày thường ({pricing.weekdayNights} đêm)</span>
                      <span>{formatPrice(pricing.weekdaySubtotal)}</span>
                    </div>
                  )}
                  {pricing.weekendNights > 0 && (
                    <div className="flex justify-between text-primary font-medium">
                      <span>Cuối tuần ({pricing.weekendNights} đêm)</span>
                      <span>{formatPrice(pricing.weekendSubtotal)}</span>
                    </div>
                  )}
                  {pricing.holidayNights > 0 && (
                    <div className="flex justify-between text-accent font-medium">
                      <span>Ngày lễ ×2 ({pricing.holidayNights} đêm)</span>
                      <span>{formatPrice(pricing.holidaySubtotal)}</span>
                    </div>
                  )}
                </>
              )}
              <div className="flex justify-between text-neutral-600">
                <span>Tạm tính ({nights} đêm)</span>
                <span>{formatPrice(beforeDiscount)}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-accent font-semibold">
                  <span>Mã {appliedCoupon.code} (-{appliedCoupon.percent}%)</span>
                  <span>-{formatPrice(couponAmount)}</span>
                </div>
              )}
              {membershipPercent > 0 && (
                <div className="flex justify-between text-primary font-semibold">
                  <span>Ưu đãi thành viên (-{membershipPercent}%)</span>
                  <span>-{formatPrice(membershipAmount)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-line pt-2 text-sm font-bold text-ink">
                <span>Tổng chi phí ({nights} đêm)</span>
                <span className="text-accent text-base">{formatPrice(estimate)}</span>
              </div>
            </div>
          )}

          {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
          {success && (
            <div className="mt-3 rounded-2xl bg-primary/10 p-3.5 text-xs text-primary">
              ✓ Đặt phòng thành công! Mã đơn: <b>#{success}</b>
            </div>
          )}

          <button
            disabled={!checkIn || !checkOut || submitting || pricingLoading || !pricing}
            onClick={handleConfirmClick}
            className="mt-5 w-full rounded-full bg-primary py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark disabled:opacity-50"
          >
            {nights > 0 ? `Xác nhận đặt phòng (${nights} đêm)` : "Chọn ngày để đặt phòng"}
          </button>
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-90 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <div
            className="relative flex max-h-[90vh] max-w-5xl flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentImage}
              alt="Fullscreen Room View"
              className="max-h-[80vh] w-auto rounded-2xl object-contain shadow-2xl"
            />
            <div className="mt-3 flex items-center gap-4 text-sm text-white">
              <button
                type="button"
                onClick={handlePrevImage}
                className="rounded-full bg-white/20 p-2 hover:bg-white/30"
              >
                <ChevronLeft size={20} />
              </button>
              <span>
                Ảnh {activeImageIndex + 1} / {allImages.length}
              </span>
              <button
                type="button"
                onClick={handleNextImage}
                className="rounded-full bg-white/20 p-2 hover:bg-white/30"
              >
                <ChevronRight size={20} />
              </button>
            </div>
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="absolute top-3 right-3 rounded-full bg-black/60 p-2 text-white hover:bg-black"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      <PaymentModal
        open={paymentOpen}
        onClose={() => !submitting && setPaymentOpen(false)}
        onConfirm={submit}
        totalPrice={estimate}
        loading={submitting}
      />
    </main>
  );
}

