"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
}

function nightsBetween(a: string, b: string) {
  if (!a || !b) return 0;
  const start = new Date(`${a}T00:00:00`).getTime();
  const end = new Date(`${b}T00:00:00`).getTime();
  return Math.max(1, Math.round((end - start) / 86400000));
}

export default function RoomDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  const [room, setRoom] = useState<Room | null>(null);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [pricing, setPricing] = useState<PricePreview | null>(null);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);

  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; percent: number } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [checkingCoupon, setCheckingCoupon] = useState(false);

  useEffect(() => {
    roomService
      .getById(Number(id))
      .then(setRoom)
      .catch((err) => setError(getErrorMessage(err, "Không thể tải phòng")));
  }, [id]);

  useEffect(() => {
    if (!room) return;
    reviewService.getForRoom(room.id).then(setReviews).catch(() => undefined);
  }, [room]);

  useEffect(() => {
    if (!room || !checkIn || !checkOut || checkOut <= checkIn) {
      setPricing(null);
      return;
    }
    let active = true;
    setPricingLoading(true);
    roomService.getPricePreview(room.id, checkIn, checkOut, guests)
      .then((quote) => active && setPricing(quote))
      .catch((err) => active && setError(getErrorMessage(err, "Không thể cập nhật báo giá")))
      .finally(() => active && setPricingLoading(false));
    return () => { active = false; };
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
    return <main className="p-10 text-center text-neutral-500">{error || "Đang tải..."}</main>;
  }

  return (
    <main className="mx-auto max-w-5xl px-5 py-12">
      <p className="font-display text-sm italic text-accent">{room.address}</p>
      <h1 className="mt-1 font-display text-3xl text-ink">{room.name}</h1>

      <div className="mt-6 h-80 w-full overflow-hidden rounded-t-[2.5rem] rounded-b-md bg-neutral-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={room.images?.[0] ?? "/placeholder-room.jpg"}
          alt={room.name}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1.4fr_.8fr]">
        <div>
          <h2 className="font-display text-xl text-ink">Mô tả</h2>
          <p className="mt-2 leading-relaxed text-neutral-600">{room.description || "Chưa có mô tả."}</p>

          <h2 className="mt-8 font-display text-xl text-ink">Tiện ích</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {room.amenities.map((a) => (
              <li key={a} className="rounded-full border border-line px-3 py-1 text-sm text-neutral-700">
                {a}
              </li>
            ))}
          </ul>

          <h2 className="mt-8 font-display text-xl text-ink">Thông tin phòng</h2>
          <dl className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
            {room.roomSize && <div className="rounded-xl bg-base p-3"><dt className="text-neutral-500">Diện tích</dt><dd className="mt-1 font-medium text-ink">{room.roomSize} m²</dd></div>}
            {room.bedConfiguration && <div className="rounded-xl bg-base p-3"><dt className="text-neutral-500">Giường</dt><dd className="mt-1 font-medium text-ink">{room.bedConfiguration}</dd></div>}
            {room.bathroomDescription && <div className="rounded-xl bg-base p-3"><dt className="text-neutral-500">Phòng tắm</dt><dd className="mt-1 font-medium text-ink">{room.bathroomDescription}</dd></div>}
            {room.viewDescription && <div className="rounded-xl bg-base p-3"><dt className="text-neutral-500">Hướng nhìn</dt><dd className="mt-1 font-medium text-ink">{room.viewDescription}</dd></div>}
            {room.floor && <div className="rounded-xl bg-base p-3"><dt className="text-neutral-500">Vị trí</dt><dd className="mt-1 font-medium text-ink">{room.floor}</dd></div>}
            <div className="rounded-xl bg-base p-3"><dt className="text-neutral-500">Giờ lưu trú</dt><dd className="mt-1 font-medium text-ink">{room.checkInTime ?? "14:00"} – {room.checkOutTime ?? "12:00"}</dd></div>
          </dl>
          {room.houseRules && <div className="mt-4 rounded-xl border border-line p-4 text-sm"><p className="font-medium text-ink">Quy định phòng</p><p className="mt-1 whitespace-pre-line text-neutral-600">{room.houseRules}</p></div>}

          <section className="mt-10 border-t border-line pt-8">
            <div className="flex items-end justify-between"><div><p className="text-sm font-semibold uppercase tracking-wide text-primary">Khách đã lưu trú</p><h2 className="mt-1 font-display text-xl text-ink">Đánh giá về phòng này</h2></div><span className="text-sm text-neutral-500">{reviews.length} đánh giá</span></div>
            <div className="mt-4 space-y-3">{reviews.length ? reviews.slice(0, 5).map((review) => <article key={review.id} className="rounded-xl border border-line p-4"><div className="flex items-center justify-between"><p className="font-medium text-ink">{review.userFullName}</p><span className="text-amber-500">{"★".repeat(review.rating)}<span className="text-neutral-200">{"★".repeat(5 - review.rating)}</span></span></div><p className="mt-2 text-sm leading-6 text-neutral-600">{review.comment}</p></article>) : <p className="text-sm text-neutral-500">Phòng này chưa có đánh giá. Hãy là người đầu tiên chia sẻ trải nghiệm.</p>}</div>
          </section>
        </div>

        <div className="h-fit rounded-2xl border border-line bg-surface p-5">
          <p className="text-xl font-semibold text-accent">
            {formatPrice(room.pricePerNight)}{" "}
            <span className="text-sm font-normal text-neutral-400">/đêm</span>
          </p>

          <div className="mt-4">
            <DateRangeCalendar
              checkIn={checkIn}
              checkOut={checkOut}
              onChange={chooseDates}
              minDate={new Date().toISOString().slice(0, 10)}
            />
          </div>

          <div className="mt-4">
            <label className="text-sm text-neutral-600">Số khách</label>
            <div className="mt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setGuests(Math.max(1, guests - 1))}
                className="h-9 w-9 rounded-full border border-line"
              >
                −
              </button>
              <span className="w-8 text-center font-semibold">{guests}</span>
              <button
                type="button"
                onClick={() => setGuests(Math.min(room.maxGuests, guests + 1))}
                className="h-9 w-9 rounded-full border border-line"
              >
                +
              </button>
              <span className="text-xs text-neutral-400">
                Đề xuất {room.recommendedGuests}, tối đa {room.maxGuests}
              </span>
            </div>
          </div>

          {extraGuests > 0 && pricing && (
            <div className="mt-3 rounded-lg bg-accent/10 p-3 text-sm text-accent">
              Phụ thu {extraGuests} khách × {nights} đêm: {formatPrice(pricing.extraGuestSubtotal)}
            </div>
          )}

          <div className="mt-4">
            <label className="text-sm text-neutral-600">Mã giảm giá</label>
            {appliedCoupon ? (
              <div className="mt-1 flex items-center justify-between rounded-lg border border-primary/40 bg-primary/5 px-3 py-2 text-sm">
                <span className="font-medium text-primary">
                  {appliedCoupon.code} · giảm {appliedCoupon.percent}%
                </span>
                <button type="button" onClick={removeCoupon} className="text-xs text-neutral-500 hover:text-red-600">
                  Bỏ mã
                </button>
              </div>
            ) : (
              <div className="mt-1 flex gap-2">
                <input
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="Nhập mã giảm giá"
                  className="flex-1 rounded-lg border border-line px-3 py-2 text-sm uppercase focus:border-primary focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={checkingCoupon || !couponInput.trim()}
                  className="rounded-lg border border-line px-3 py-2 text-sm hover:bg-neutral-50 disabled:opacity-50"
                >
                  {checkingCoupon ? "..." : "Áp dụng"}
                </button>
              </div>
            )}
            {couponError && <p className="mt-1 text-xs text-red-600">{couponError}</p>}
          </div>

          <div className="mt-4">
            <label className="text-sm text-neutral-600">Yêu cầu / ghi chú</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>

          {nights > 0 && (
            <div className="mt-4 space-y-1.5 rounded-xl border border-line p-3 text-sm">
              {pricingLoading && <p className="text-xs text-neutral-400">Đang cập nhật giá theo lịch...</p>}
              {pricing && <>
                {pricing.weekdayNights > 0 && <div className="flex justify-between text-neutral-500"><span>Ngày thường ({pricing.weekdayNights} đêm)</span><span>{formatPrice(pricing.weekdaySubtotal)}</span></div>}
                {pricing.weekendNights > 0 && <div className="flex justify-between text-primary"><span>Cuối tuần +100.000đ ({pricing.weekendNights} đêm)</span><span>{formatPrice(pricing.weekendSubtotal)}</span></div>}
                {pricing.holidayNights > 0 && <div className="flex justify-between text-accent"><span>Ngày lễ ×2 ({pricing.holidayNights} đêm)</span><span>{formatPrice(pricing.holidaySubtotal)}</span></div>}
              </>}
              <div className="flex justify-between text-neutral-500">
                <span>Tạm tính ({nights} đêm)</span>
                <span>{formatPrice(beforeDiscount)}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-accent">
                  <span>Mã {appliedCoupon.code} (-{appliedCoupon.percent}%)</span>
                  <span>-{formatPrice(couponAmount)}</span>
                </div>
              )}
              {membershipPercent > 0 && (
                <div className="flex justify-between text-primary">
                  <span>Ưu đãi thành viên (-{membershipPercent}%)</span>
                  <span>-{formatPrice(membershipAmount)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-line pt-1.5 font-semibold text-ink">
                <span>Tổng cộng</span>
                <span>{formatPrice(estimate)}</span>
              </div>
            </div>
          )}

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          {success && (
            <div className="mt-3 rounded-xl bg-primary/10 p-3 text-sm text-primary">
              Đặt phòng thành công. Mã: <b>#{success}</b>
            </div>
          )}

          <button
            disabled={!checkIn || !checkOut || submitting || pricingLoading || !pricing}
            onClick={handleConfirmClick}
            className="mt-4 w-full rounded-full bg-primary py-2.5 font-medium text-white hover:bg-primary-dark disabled:opacity-50"
          >
            Xác nhận đặt phòng
          </button>
        </div>
      </div>

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
