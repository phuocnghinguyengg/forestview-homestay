"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { roomTypeService } from "@/lib/services/roomTypeService";
import { bookingService } from "@/lib/services/bookingService";
import { discountService } from "@/lib/services/discountService";

import {
  MembershipTier,
  PaymentMethod,
  Room,
  RoomTypeCode,
} from "@/types";

import { useAuthStore } from "@/hooks/useAuthStore";
import { accountService } from "@/lib/services/accountService";
import { getErrorMessage } from "@/lib/getErrorMessage";

import PaymentModal from "./PaymentModal";

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("vi-VN");
}

function getNights(checkIn: string, checkOut: string) {
  const start = new Date(`${checkIn}T00:00:00`).getTime();
  const end = new Date(`${checkOut}T00:00:00`).getTime();

  return Math.max(1, Math.round((end - start) / 86400000));
}

type RoomRequestState = {
  key: string;
  rooms: Room[];
  error: string;
};

export default function RoomTypeBookingModal({
  type,
  typeLabel,
  checkIn,
  checkOut,
  onClose,
}: {
  type: RoomTypeCode;
  typeLabel: string;
  checkIn: string;
  checkOut: string;
  onClose: () => void;
}) {
  const router = useRouter();

  const { isAuthenticated, user } = useAuthStore();

    const requestKey = useMemo(
    () => `${type}|${checkIn}|${checkOut}`,
    [type, checkIn, checkOut]
  );

  const [roomRequest, setRoomRequest] =
    useState<RoomRequestState>({
      key: "",
      rooms: [],
      error: "",
    });

  const loading = roomRequest.key !== requestKey;

  const rooms =
    roomRequest.key === requestKey
      ? roomRequest.rooms
      : [];

  const error =
    roomRequest.key === requestKey
      ? roomRequest.error
      : "";

  const [detailRoom, setDetailRoom] =
    useState<Room | null>(null);

  const [selectedRoom, setSelectedRoom] =
    useState<Room | null>(null);

  const [guestCount, setGuestCount] =
    useState(1);

  const [guestInput, setGuestInput] =
    useState("1");

  const [note, setNote] =
    useState("");

  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; percent: number } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [checkingCoupon, setCheckingCoupon] = useState(false);

  const [paymentOpen, setPaymentOpen] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [result, setResult] = useState<{
    code: string;
    status: string;
  } | null>(null);

  const [membership, setMembership] =
    useState<{
      tier: MembershipTier;
      discount: number;
    }>({
      tier: user?.membershipTier ?? "NONE",
      discount: 0,
    });

    useEffect(() => {
    let active = true;

    roomTypeService
      .getAvailableRooms(
        type,
        checkIn,
        checkOut
      )
      .then((data) => {
        if (!active) return;

        setRoomRequest({
          key: requestKey,
          rooms: data.slice(0, 3),
          error: "",
        });
      })
      .catch((err) => {
        if (!active) return;

        setRoomRequest({
          key: requestKey,
          rooms: [],
          error: getErrorMessage(err),
        });
      });

    return () => {
      active = false;
    };
  }, [
    type,
    checkIn,
    checkOut,
    requestKey,
  ]);

    useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    let active = true;

    accountService
      .getMe()
      .then((data) => {
        if (!active) return;

        setMembership({
          tier:
            data.membershipTier ??
            "NONE",

          discount:
            data.membershipDiscountPercent ??
            0,
        });
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  const nights = useMemo(
    () =>
      getNights(
        checkIn,
        checkOut
      ),
    [checkIn, checkOut]
  );

  const extraGuests = selectedRoom
    ? Math.max(
        0,
        guestCount -
          (selectedRoom.recommendedGuests ?? 1)
      )
    : 0;

  const extraFee = selectedRoom
    ? (selectedRoom.extraGuestFee ?? 0) *
      extraGuests *
      nights
    : 0;

  const roomSubtotal = selectedRoom
    ? selectedRoom.pricePerNight * nights
    : 0;

  const beforeDiscountTotal = roomSubtotal + extraFee;

  const couponAmount = appliedCoupon
    ? (beforeDiscountTotal * appliedCoupon.percent) / 100
    : 0;

  const afterCoupon = beforeDiscountTotal - couponAmount;

  const membershipDiscount =
    afterCoupon *
    (membership.discount / 100);

  const estimate = Math.max(
    0,
    afterCoupon -
      membershipDiscount
  );

  const applyCoupon = async () => {
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

  const selectGuestCount = (value: number) => {
    if (!selectedRoom) return;

    const next = Math.min(
      selectedRoom.maxGuests,
      Math.max(1, value)
    );

    setGuestCount(next);
    setGuestInput(String(next));
  };

  const handleGuestInput = (value: string) => {
    setGuestInput(value);

    if (value === "") {
      return;
    }

    const parsed = Number(value);

    if (Number.isFinite(parsed)) {
      selectGuestCount(parsed);
    }
  };

  const confirmBooking = (
    method: PaymentMethod
  ) => {
    if (!selectedRoom) return;

    setSubmitting(true);
    setErrorForBooking("");

    bookingService
      .create({
        roomId: selectedRoom.id,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        guestCount,
        note: note.trim() || undefined,
        paymentMethod: method,
        discountCode: appliedCoupon?.code,
      })
      .then((res) => {
        setResult({
          code: res.bookingCode,
          status: res.status,
        });

        setPaymentOpen(false);
      })
      .catch((err) => {
        setErrorForBooking(
          getErrorMessage(
            err,
            "Đặt phòng thất bại, vui lòng thử lại"
          )
        );
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

    const [bookingError, setBookingError] =
    useState("");

  const setErrorForBooking = (
    value: string
  ) => {
    setBookingError(value);
  };

  const requireBookingAuth = () => {
    if (!isAuthenticated) {
      onClose();
      router.push("/login");
      return false;
    }

    if (!user?.emailVerified) {
      setErrorForBooking(
        "Vui lòng xác thực email trước khi đặt phòng"
      );
      return false;
    }

    return true;
  };

  return (
    <>
      <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]">
        <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-4xl bg-surface shadow-2xl">
          {result ? (
            <div className="px-6 py-14 text-center sm:px-10">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl text-primary">
                ✓
              </div>

              <h2 className="mt-5 font-display text-3xl text-ink">
                {result.status === "CONFIRMED"
                  ? "Đặt phòng thành công"
                  : "Đã giữ chỗ"}
              </h2>

              <p className="mt-2 text-sm text-neutral-500">
                Mã đặt phòng:{" "}
                <b className="text-accent">
                  #{result.code}
                </b>
              </p>

              {result.status === "PENDING" && (
                <p className="mt-3 text-sm text-accent">
                  Chỗ được giữ trong 2 giờ và
                  đang chờ admin xác nhận.
                </p>
              )}

              <div className="mt-7 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full border border-line px-5 py-2.5 text-sm"
                >
                  Đóng
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    router.push("/dashboard");
                  }}
                  className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white"
                >
                  Xem lịch sử
                </button>
              </div>
            </div>
          ) : detailRoom ? (
            <div>
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-surface/95 px-6 py-4 backdrop-blur sm:px-8">
                <div>
                  <p className="font-display text-sm italic text-accent">
                    Chi tiết phòng
                  </p>

                  <h2 className="font-display text-2xl text-ink">
                    {detailRoom.name}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setDetailRoom(null)
                  }
                  className="rounded-full border border-line px-3 py-2 text-sm text-neutral-500"
                >
                  ← Quay lại
                </button>
              </div>

              <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="bg-neutral-100">
                  {detailRoom.images?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={detailRoom.images[0]}
                      alt={detailRoom.name}
                      className="h-full min-h-80 max-h-130 w-full object-cover"
                    />
                  ) : (
                    <div className="flex min-h-80 items-center justify-center text-sm text-neutral-400">
                      Chưa có hình ảnh
                    </div>
                  )}
                </div>

                <div className="p-6 sm:p-8">
                  <p className="text-sm text-neutral-500">
                    {detailRoom.address}
                  </p>

                  <p className="mt-4 text-lg font-semibold text-primary">
                    {formatPrice(
                      detailRoom.pricePerNight
                    )}

                    <span className="text-xs font-normal text-neutral-400">
                      {" "}
                      / đêm
                    </span>
                  </p>

                  <p className="mt-4 text-sm leading-6 text-neutral-600">
                    {detailRoom.description ||
                      "Không có mô tả thêm cho phòng này."}
                  </p>

                  <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl bg-base p-3">
                      <p className="text-neutral-400">
                        Khách đề xuất
                      </p>

                      <p className="mt-1 font-semibold text-ink">
                        {detailRoom.recommendedGuests}{" "}
                        khách
                      </p>
                    </div>

                    <div className="rounded-xl bg-base p-3">
                      <p className="text-neutral-400">
                        Tối đa
                      </p>

                      <p className="mt-1 font-semibold text-ink">
                        {detailRoom.maxGuests} khách
                      </p>
                    </div>
                  </div>

                  {detailRoom.amenities?.length >
                    0 && (
                    <div className="mt-6">
                      <p className="text-sm font-semibold text-ink">
                        Tiện ích
                      </p>

                      <div className="mt-2 flex flex-wrap gap-2">
                        {detailRoom.amenities.map(
                          (amenity) => (
                            <span
                              key={amenity}
                              className="rounded-full border border-line px-3 py-1.5 text-xs text-neutral-600"
                            >
                              {amenity}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRoom(
                        detailRoom
                      );
                      setGuestCount(1);
                      setGuestInput("1");
                      setDetailRoom(null);
                      setBookingError("");
                    }}
                    className="mt-7 w-full rounded-full bg-primary py-3 text-sm font-semibold text-white hover:bg-primary-dark"
                  >
                    Chọn phòng này
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-line bg-surface/95 px-6 py-5 backdrop-blur sm:px-8">
                <div>
                  <p className="font-display text-sm italic text-accent">
                    {formatDate(checkIn)} →{" "}
                    {formatDate(checkOut)} ·{" "}
                    {nights} đêm
                  </p>

                  <h2 className="mt-1 font-display text-2xl text-ink">
                    {typeLabel}
                  </h2>

                  <p className="mt-1 text-sm text-neutral-500">
                    Chọn một trong tối đa 3 phòng
                    phù hợp để xem toàn bộ chi tiết.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full border border-line px-3 py-2 text-sm text-neutral-500"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 sm:p-8">
                {loading && (
                  <div className="flex items-center gap-3 py-6 text-sm text-neutral-500">
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-line border-t-primary" />
                    Đang tải phòng...
                  </div>
                )}

                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                    {error}
                  </div>
                )}

                {!loading &&
                  !error &&
                  rooms.length === 0 && (
                    <p className="text-sm text-neutral-500">
                      Không còn phòng trong khoảng
                      ngày đã chọn.
                    </p>
                  )}

                {!loading &&
                  !error &&
                  rooms.length > 0 && (
                    <div className="grid gap-4 sm:grid-cols-3">
                      {rooms.map((room) => (
                        <button
                          key={room.id}
                          type="button"
                          onClick={() =>
                            setDetailRoom(room)
                          }
                          className={`overflow-hidden rounded-2xl border text-left transition ${
                            selectedRoom?.id ===
                            room.id
                              ? "border-primary ring-2 ring-primary/10"
                              : "border-line hover:border-primary/50 hover:shadow-lg"
                          }`}
                        >
                          <div className="h-40 overflow-hidden bg-neutral-100">
                            {room.images?.[0] ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={room.images[0]}
                                alt={room.name}
                                className="h-full w-full object-cover transition duration-300 hover:scale-105"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-xs text-neutral-400">
                                Chưa có hình
                              </div>
                            )}
                          </div>

                          <div className="p-4">
                            <p className="font-display text-lg text-ink">
                              {room.name}
                            </p>

                            <p className="mt-1 text-xs text-neutral-500">
                              Đề xuất{" "}
                              {room.recommendedGuests}{" "}
                              · tối đa{" "}
                              {room.maxGuests} khách
                            </p>

                            <p className="mt-3 font-semibold text-primary">
                              {formatPrice(
                                room.pricePerNight
                              )}

                              <span className="text-xs font-normal text-neutral-400">
                                {" "}
                                / đêm
                              </span>
                            </p>

                            <p className="mt-3 text-xs font-semibold text-accent">
                              Nhấn để xem đầy đủ chi tiết
                              →
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                {selectedRoom && (
                  <div className="mt-7 rounded-2xl border border-line bg-base p-5 sm:p-6">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                          Phòng đã chọn
                        </p>

                        <h3 className="mt-1 font-display text-xl text-ink">
                          {selectedRoom.name}
                        </h3>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setDetailRoom(
                            selectedRoom
                          )
                        }
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        Xem lại chi tiết
                      </button>
                    </div>

                    <div className="mt-5 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
                      <div>
                        <label
                          htmlFor="guest-count"
                          className="text-sm font-medium text-ink"
                        >
                          Số khách
                        </label>

                        <div className="mt-2 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              selectGuestCount(
                                guestCount - 1
                              )
                            }
                            className="h-10 w-10 rounded-full border border-line"
                          >
                            −
                          </button>

                          <input
                            id="guest-count"
                            value={guestInput}
                            inputMode="numeric"
                            onChange={(e) =>
                              handleGuestInput(
                                e.target.value.replace(
                                  /\D/g,
                                  ""
                                )
                              )
                            }
                            onBlur={() => {
                              if (!guestInput) {
                                selectGuestCount(1);
                              }
                            }}
                            className="h-10 w-16 rounded-lg border border-line bg-surface text-center font-semibold text-ink focus:border-primary focus:outline-none"
                            aria-label="Số khách"
                          />

                          <button
                            type="button"
                            onClick={() =>
                              selectGuestCount(
                                guestCount + 1
                              )
                            }
                            className="h-10 w-10 rounded-full border border-line"
                          >
                            +
                          </button>

                          <span className="text-xs text-neutral-400">
                            1–{selectedRoom.maxGuests}
                          </span>
                        </div>

                        {extraGuests > 0 && (
                          <div className="mt-3 rounded-xl border border-accent/20 bg-accent/10 p-3 text-sm text-accent">
                            <b>Phụ thu khách</b>

                            <p className="mt-1">
                              Vượt {extraGuests} khách
                              so với mức đề xuất.
                              Phụ thu:{" "}
                              {formatPrice(extraFee)}.
                            </p>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="text-sm font-medium text-ink">
                          Mã giảm giá
                        </label>

                        {appliedCoupon ? (
                          <div className="mt-2 flex items-center justify-between rounded-xl border border-primary/40 bg-primary/5 px-3 py-2 text-sm">
                            <span className="font-medium text-primary">
                              {appliedCoupon.code} · giảm {appliedCoupon.percent}%
                            </span>
                            <button
                              type="button"
                              onClick={removeCoupon}
                              className="text-xs text-neutral-500 hover:text-red-600"
                            >
                              Bỏ mã
                            </button>
                          </div>
                        ) : (
                          <div className="mt-2 flex gap-2">
                            <input
                              value={couponInput}
                              onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                              placeholder="Nhập mã giảm giá"
                              className="flex-1 rounded-xl border border-line bg-surface px-3 py-2.5 text-sm uppercase focus:border-primary focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={applyCoupon}
                              disabled={checkingCoupon || !couponInput.trim()}
                              className="rounded-xl border border-line px-3 py-2.5 text-sm hover:bg-neutral-50 disabled:opacity-50"
                            >
                              {checkingCoupon ? "..." : "Áp dụng"}
                            </button>
                          </div>
                        )}
                        {couponError && <p className="mt-1 text-xs text-red-600">{couponError}</p>}
                      </div>

                      <div>
                        <label
                          htmlFor="booking-note"
                          className="text-sm font-medium text-ink"
                        >
                          Yêu cầu / ghi chú
                        </label>

                        <textarea
                          id="booking-note"
                          value={note}
                          onChange={(e) =>
                            setNote(e.target.value)
                          }
                          rows={4}
                          placeholder="Ví dụ: nhận phòng muộn, kê thêm giường..."
                          className="mt-2 w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="mt-5 rounded-xl bg-surface p-4">
                      <div className="flex justify-between text-sm">
                        <span>Giá phòng</span>

                        <b>
                          {formatPrice(
                            roomSubtotal
                          )}
                        </b>
                      </div>

                      {extraFee > 0 && (
                        <div className="mt-1 flex justify-between text-sm">
                          <span>
                            Phụ thu khách
                          </span>

                          <b>
                            {formatPrice(extraFee)}
                          </b>
                        </div>
                      )}

                      {appliedCoupon && (
                        <div className="mt-1 flex justify-between text-sm text-accent">
                          <span>
                            Mã {appliedCoupon.code} -{appliedCoupon.percent}%
                          </span>

                          <b>
                            -
                            {formatPrice(couponAmount)}
                          </b>
                        </div>
                      )}

                      {membership.discount > 0 && (
                        <div className="mt-1 flex justify-between text-sm text-primary">
                          <span>
                            Membership{" "}
                            {membership.tier} -
                            {membership.discount}%
                          </span>

                          <b>
                            -
                            {formatPrice(
                              membershipDiscount
                            )}
                          </b>
                        </div>
                      )}

                      <div className="mt-3 flex justify-between border-t border-line pt-3">
                        <span className="font-semibold text-ink">
                          Tạm tính
                        </span>

                        <b className="text-lg text-accent">
                          {formatPrice(estimate)}
                        </b>
                      </div>

                      <p className="mt-2 text-xs text-neutral-400">
                        Giá cuối cùng sẽ được xác nhận
                        khi tạo đơn.
                      </p>
                    </div>

                    {bookingError && (
                      <p className="mt-3 text-sm text-red-600">
                        {bookingError}
                      </p>
                    )}

                    {!isAuthenticated &&
                      !bookingError && (
                        <p className="mt-3 text-sm text-accent">
                          Bạn cần{" "}
                          <Link
                            href="/login"
                            className="underline"
                          >
                            đăng nhập
                          </Link>{" "}
                          để đặt phòng.
                        </p>
                      )}

                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => {
                        if (
                          requireBookingAuth()
                        ) {
                          setPaymentOpen(true);
                        }
                      }}
                      className="mt-4 w-full rounded-full bg-primary py-3 text-sm font-semibold text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {submitting
                        ? "Đang xử lý..."
                        : "Xác nhận đặt phòng"}
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <PaymentModal
        open={paymentOpen}
        onClose={() =>
          !submitting &&
          setPaymentOpen(false)
        }
        onConfirm={confirmBooking}
        totalPrice={estimate}
        loading={submitting}
      />
    </>
  );
}