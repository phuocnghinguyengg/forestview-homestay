"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { Review, ReviewSummary } from "@/types";
import { reviewService } from "@/lib/services/reviewService";

export default function ReviewShowcase() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  useEffect(() => { reviewService.getAll().then((data) => setReviews(data.slice(0, 3))).catch(() => undefined); reviewService.getSummary().then(setSummary).catch(() => undefined); }, []);
  if (!reviews.length && !summary) return null;
  return <section className="mx-auto max-w-6xl px-5 py-16"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="font-display text-sm italic text-accent">Từ những vị khách đã lưu trú</p><h2 className="mt-2 font-display text-3xl text-ink">Kỳ nghỉ được nhớ mãi</h2></div>{summary && <div className="rounded-2xl bg-primary px-5 py-3 text-white"><span className="text-2xl font-semibold">{summary.averageRating.toFixed(1)}</span><Star className="ml-1 inline fill-current" size={17}/><span className="ml-2 text-sm text-white/75">{summary.totalReviews} đánh giá</span></div>}</div><div className="mt-7 grid gap-4 md:grid-cols-3">{reviews.map((review) => <article key={review.id} className="rounded-2xl border border-line bg-surface p-5"><p className="text-amber-500">{"★".repeat(review.rating)}<span className="text-neutral-200">{"★".repeat(5 - review.rating)}</span></p><p className="mt-3 text-sm leading-6 text-neutral-600">“{review.comment}”</p><div className="mt-5 border-t border-line pt-3"><p className="font-medium text-ink">{review.userFullName}</p><p className="text-xs text-neutral-500">{review.roomName}</p></div></article>)}</div></section>;
}
