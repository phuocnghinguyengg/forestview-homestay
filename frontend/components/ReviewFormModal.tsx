"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { reviewService } from "@/lib/services/reviewService";
import { getErrorMessage } from "@/lib/getErrorMessage";

export default function ReviewFormModal({
  bookingId,
  roomName,
  onClose,
  onSubmitted,
}: {
  bookingId: number;
  roomName: string;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");

    try {
      await reviewService.create({ bookingId, rating, comment: comment.trim() || undefined });
      onSubmitted();
    } catch (err) {
      setError(getErrorMessage(err, "Không thể gửi đánh giá, vui lòng thử lại"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 85 }}>
      <div role="dialog" aria-modal="true" aria-label="Đánh giá" className="modal-panel max-w-md p-6 sm:p-7">
        <p className="font-display text-xs italic text-accent">Chia sẻ trải nghiệm của bạn</p>
        <h2 className="mt-1 font-display text-2xl text-ink">{roomName}</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Đánh giá của bạn giúp những vị khách tiếp theo hiểu rõ hơn về kỳ nghỉ tại ForestView.
        </p>

        <div className="mt-5 flex justify-center gap-1.5">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onMouseEnter={() => setHoverRating(value)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(value)}
              aria-label={`${value} sao`}
              className="p-1 transition"
            >
              <Star
                size={28}
                className={
                  value <= (hoverRating || rating)
                    ? "fill-lantern text-lantern"
                    : "text-neutral-200"
                }
              />
            </button>
          ))}
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          placeholder="Cảm nhận của bạn về phòng, dịch vụ, không gian..."
          className="mt-5 w-full rounded-xl border border-line bg-canvas/40 px-3.5 py-2.5 text-sm text-ink focus:border-primary focus:outline-none"
        />

        {error && <p className="mt-2 text-sm text-rose">{error}</p>}

        <div className="mt-5 flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="btn btn-outline"
          >
            Để sau
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="btn btn-primary"
          >
            {submitting ? "Đang gửi..." : "Gửi đánh giá"}
          </button>
        </div>
      </div>
    </div>
  );
}
