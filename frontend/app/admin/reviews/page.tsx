"use client";

import { useEffect, useMemo, useState } from "react";
import { Star, Trash2 } from "lucide-react";
import { Review } from "@/types";
import { reviewService } from "@/lib/services/reviewService";
import { getErrorMessage } from "@/lib/getErrorMessage";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filter, setFilter] = useState("ALL");
  const [error, setError] = useState("");
  const load = () => reviewService.getAll().then(setReviews).catch((e) => setError(getErrorMessage(e)));
  useEffect(() => { load(); }, []);
  const filtered = useMemo(() => filter === "ALL" ? reviews : reviews.filter((review) => review.rating === Number(filter)), [reviews, filter]);
  const remove = async (id: number) => { if (!confirm("Ẩn đánh giá này khỏi hệ thống?")) return; try { await reviewService.removeAdmin(id); load(); } catch (e) { setError(getErrorMessage(e)); } };
  const average = reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;
  return <div><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-semibold uppercase tracking-wide text-primary">Voice of guest</p><h1 className="mt-1 font-display text-3xl text-ink">Đánh giá khách hàng</h1><p className="mt-2 text-sm text-neutral-500">Theo dõi phản hồi và giữ chất lượng trải nghiệm lưu trú.</p></div><div className="rounded-2xl bg-primary/10 px-5 py-3 text-right"><p className="text-2xl font-semibold text-primary">{average.toFixed(1)} <Star className="inline fill-current" size={19}/></p><p className="text-xs text-primary">{reviews.length} đánh giá</p></div></div>{error && <p className="mt-4 text-sm text-red-600">{error}</p>}<div className="mt-6 flex gap-2"><button onClick={() => setFilter("ALL")} className={`rounded-full px-4 py-2 text-sm ${filter === "ALL" ? "bg-primary text-white" : "bg-base text-neutral-600"}`}>Tất cả</button>{[5,4,3,2,1].map((rating) => <button key={rating} onClick={() => setFilter(String(rating))} className={`rounded-full px-4 py-2 text-sm ${filter === String(rating) ? "bg-primary text-white" : "bg-base text-neutral-600"}`}>{rating} sao</button>)}</div><div className="mt-6 space-y-3">{filtered.map((review) => <article key={review.id} className="flex gap-4 rounded-2xl border border-line p-5"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10 font-display text-accent">{review.userFullName.slice(0,1)}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap justify-between gap-2"><div><p className="font-medium text-ink">{review.userFullName}</p><p className="text-xs text-neutral-500">{review.roomName} · {review.roomTypeLabel}</p></div><p className="text-amber-500">{"★".repeat(review.rating)}<span className="text-neutral-200">{"★".repeat(5-review.rating)}</span></p></div><p className="mt-3 text-sm leading-6 text-neutral-600">{review.comment}</p></div><button aria-label="Xóa đánh giá" onClick={() => remove(review.id)} className="h-fit rounded-lg p-2 text-neutral-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={17}/></button></article>)}{!filtered.length && <p className="py-10 text-center text-sm text-neutral-500">Chưa có đánh giá phù hợp.</p>}</div></div>;
}
