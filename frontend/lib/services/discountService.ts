import api from "@/lib/api";
import { DiscountCode, DiscountCodePreview } from "@/types";

export interface DiscountCodeCreatePayload {
  code: string;
  percent: number;
  description?: string;
  startAt: string;
  endAt: string;
}

export const discountService = {
  validate: (code: string) =>
    api.get<DiscountCodePreview>("/discount-codes/validate", { params: { code } }).then((res) => res.data),

  getAllAdmin: () => api.get<DiscountCode[]>("/admin/discount-codes").then((res) => res.data),

  create: (data: DiscountCodeCreatePayload) =>
    api.post<DiscountCode>("/admin/discount-codes", data).then((res) => res.data),

  toggleActive: (id: number) => api.patch(`/admin/discount-codes/${id}/toggle-active`),

  remove: (id: number) => api.delete(`/admin/discount-codes/${id}`),
};
