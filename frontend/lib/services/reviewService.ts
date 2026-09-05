import api from "@/lib/api";
import { Review, ReviewSummary } from "@/types";

export const reviewService = {
  getAll: () => api.get<Review[]>("/reviews").then((res) => res.data),
  getForRoom: (roomId: number) => api.get<Review[]>(`/reviews/room/${roomId}`).then((res) => res.data),
  getSummary: () => api.get<ReviewSummary>("/reviews/summary").then((res) => res.data),
  create: (payload: { bookingId: number; rating: number; comment?: string }) =>
    api.post<Review>("/reviews", payload).then((res) => res.data),
  removeAdmin: (id: number) => api.delete(`/admin/reviews/${id}`),
};
