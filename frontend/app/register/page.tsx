"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { authService } from "@/lib/services/authService";
import { getErrorMessage } from "@/lib/getErrorMessage";

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState<string | undefined>();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (phone && !isValidPhoneNumber(phone)) {
      setError("Số điện thoại không hợp lệ cho khu vực đã chọn");
      return;
    }

    setSubmitting(true);
    try {
      const res = await authService.register({ fullName, email, password, phone });
      router.push(`/verify-otp?email=${encodeURIComponent(res.email)}`);
    } catch (err) {
      setError(getErrorMessage(err, "Đăng ký thất bại, vui lòng thử lại"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-5 py-12">
      <p className="font-display text-sm italic text-accent">Chào mừng bạn</p>
      <h1 className="mt-1 font-display text-3xl text-ink">Tạo tài khoản</h1>
      <p className="mt-2 text-sm text-neutral-500">
        Đăng ký để bắt đầu đặt homestay giữa rừng thông Đà Lạt.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="text-sm text-neutral-600">Họ và tên</label>
          <input
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-ink focus:border-primary focus:outline-none"
          />
        </div>
        <div>
          <label className="text-sm text-neutral-600">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-ink focus:border-primary focus:outline-none"
          />
        </div>
        <div>
          <label className="text-sm text-neutral-600">Số điện thoại</label>
          <div className="phone-input-wrapper mt-1">
            <PhoneInput
              international
              defaultCountry="VN"
              value={phone}
              onChange={setPhone}
              placeholder="Nhập số điện thoại"
            />
          </div>
        </div>
        <div>
          <label className="text-sm text-neutral-600">Mật khẩu</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-ink focus:border-primary focus:outline-none"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-50"
        >
          {submitting ? "Đang xử lý..." : "Đăng ký"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-500">
        Đã có tài khoản?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Đăng nhập
        </Link>
      </p>
    </main>
  );
}