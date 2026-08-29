"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authService } from "@/lib/services/authService";
import { useAuthStore } from "@/hooks/useAuthStore";
import { getErrorMessage } from "@/lib/getErrorMessage";

export default function RegisterPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const [form, setForm] = useState({ fullName: "", email: "", password: "", phone: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const payload = {
      fullName: form.fullName.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
      phone: form.phone.trim(),
    };

    if (!payload.fullName || !payload.email || !payload.password) {
      setError("Vui lòng nhập đầy đủ thông tin bắt buộc.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await authService.register(payload);
      login(res.accessToken, res.refreshToken, {
        fullName: res.fullName,
        email: res.email,
        role: res.role,
      });
      router.push("/dashboard");
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
            name="fullName"
            required
            value={form.fullName}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-ink focus:border-primary focus:outline-none"
          />
        </div>
        <div>
          <label className="text-sm text-neutral-600">Email</label>
          <input
            type="email"
            name="email"
            required
            value={form.email}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-ink focus:border-primary focus:outline-none"
          />
        </div>
        <div>
          <label className="text-sm text-neutral-600">Số điện thoại</label>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-ink focus:border-primary focus:outline-none"
          />
        </div>
        <div>
          <label className="text-sm text-neutral-600">Mật khẩu</label>
          <input
            type="password"
            name="password"
            required
            minLength={6}
            value={form.password}
            onChange={handleChange}
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