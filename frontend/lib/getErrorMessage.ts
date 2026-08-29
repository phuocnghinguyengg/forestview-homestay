import { isAxiosError } from "axios";

export function getErrorMessage(err: unknown, fallback = "Đã có lỗi xảy ra, vui lòng thử lại"): string {
  if (isAxiosError(err)) {
    return err.response?.data?.error ?? fallback;
  }
  return fallback;
}