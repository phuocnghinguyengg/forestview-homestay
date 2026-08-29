import { isAxiosError } from "axios";

export function getErrorMessage(
  err: unknown,
  fallback = "Đã có lỗi xảy ra, vui lòng thử lại"
): string {
  if (isAxiosError(err)) {
    const data = err.response?.data;

    if (typeof data === "string" && data.trim()) return data;

    if (data && typeof data === "object") {
      const obj = data as Record<string, unknown>;

      if (typeof obj.error === "string" && obj.error.trim()) return obj.error;
      if (typeof obj.message === "string" && obj.message.trim()) return obj.message;

      const validation = Object.entries(obj)
        .filter(([, value]) => typeof value === "string" && value.trim())
        .map(([key, value]) => `${key}: ${value}`);

      if (validation.length) return validation.join(" • ");
    }

    if (err.code === "ECONNABORTED" || err.code === "ETIMEDOUT") {
      return "Máy chủ phản hồi quá lâu. Vui lòng thử lại.";
    }

    if (err.response?.status === 403) {
      return "Bạn không có quyền thực hiện thao tác này. Hãy đăng nhập lại bằng tài khoản ADMIN.";
    }

    if (err.response?.status === 400) {
      return "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.";
    }
  }

  return fallback;
}
