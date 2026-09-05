"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { Review, ReviewSummary } from "@/types";
import { reviewService } from "@/lib/services/reviewService";

export default function ReviewShowcase({ limit = 3 }: { limit?: number }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    Promise.all([
      reviewService.getAll().catch(() => []),
      reviewService.getSummary().catch(() => null),
    ]).then(([reviewData, summaryData]) => {
      if (!active) return;
      setReviews(reviewData.slice(0, limit));
      setSummary(summaryData);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [limit]);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-3 py-10 text-sm text-neutral-400">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-line border-t-primary" />
        Đang tải đánh giá...
      </div>
    );
  }

  if (!reviews.length) {
    return (
      <div className="rounded-2xl border border-dashed border-line bg-surface/60 p-8 text-center">
        <p className="text-sm text-neutral-500">
          Chưa có đánh giá nào. Hãy là vị khách đầu tiên chia sẻ trải nghiệm
          lưu trú của bạn tại ForestView!
        </p>
      </div>
    );
  }

  return (
    <div>
      {summary && (
        <div className="mb-5 flex justify-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-sm text-white">
            <span className="font-semibold">{summary.averageRating.toFixed(1)}</span>
            <Star size={15} className="fill-current" />
            <span className="text-white/75">({summary.totalReviews} đánh giá)</span>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {reviews.map((review) => (
          <article
            key={review.id}
            className="flex flex-col rounded-2xl border border-line bg-surface p-5 shadow-2xs"
          >
            <p className="text-xs text-amber-500">
              {"★".repeat(review.rating)}
              <span className="text-neutral-200">{"★".repeat(5 - review.rating)}</span>
            </p>
            <p className="mt-3 flex-1 text-xs leading-5 text-neutral-600 italic">
              &ldquo;{review.comment}&rdquo;
            </p>
            <div className="mt-4 border-t border-line/60 pt-3">
              <p className="font-medium text-sm text-ink">{review.userFullName}</p>
              <p className="text-[11px] text-neutral-500">{review.roomName}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
