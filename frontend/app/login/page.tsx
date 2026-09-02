"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authService } from "@/lib/services/authService";
import { useAuthStore } from "@/hooks/useAuthStore";
import { getErrorMessage } from "@/lib/getErrorMessage";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Sparkles,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await authService.login({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      login(res.accessToken, res.refreshToken, {
        fullName: res.fullName,
        email: res.email,
        role: res.role,
        emailVerified: res.emailVerified,
        membershipTier: res.membershipTier,
      });

      router.push(res.role === "ADMIN" ? "/admin" : "/");
    } catch (err) {
      setError(getErrorMessage(err, "Email hoặc mật khẩu không đúng"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-[calc(100vh-140px)] max-w-lg flex-col justify-center px-5 py-10 sm:py-16">
      {/* Back to home */}
      <Link
        href="/"
        className="group mb-6 inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 transition hover:text-primary"
      >
        <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
        Về trang chủ
      </Link>

      {/* Card */}
      <div className="rounded-3xl border border-line bg-surface p-7 shadow-xl shadow-ink/5 sm:p-9">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
            <Sparkles size={13} /> ForestView Homestay
          </div>
          <h1 className="mt-3 font-display text-3xl font-semibold text-ink sm:text-4xl">
            Đăng nhập
          </h1>
          <p className="mt-1.5 text-xs text-neutral-500 sm:text-sm">
            Chào mừng bạn quay lại với kỳ nghỉ giữa rừng thông Đà Lạt.
          </p>
        </div>

        {/* Error alert */}
        {error && (
          <div className="mt-6 flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700">
            <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-600" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-neutral-700">
              Địa chỉ Email
            </label>
            <div className="relative mt-1.5">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-400">
                <Mail size={16} />
              </span>
              <input
                type="email"
                name="email"
                required
                autoFocus
                placeholder="name@example.com"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-xl border border-line bg-base/40 py-2.5 pr-3.5 pl-10 text-xs text-ink transition focus:border-primary focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/10 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-neutral-700">
                Mật khẩu
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-primary hover:underline"
              >
                Quên mật khẩu?
              </Link>
            </div>
            <div className="relative mt-1.5">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-400">
                <Lock size={16} />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                className="w-full rounded-xl border border-line bg-base/40 py-2.5 pr-10 pl-10 text-xs text-ink transition focus:border-primary focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/10 sm:text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-neutral-400 transition hover:text-ink"
                title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || !form.email || !form.password}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-xs font-semibold text-white shadow-sm transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
          >
            {submitting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Đang xử lý đăng nhập...
              </>
            ) : (
              "Đăng nhập ngay"
            )}
          </button>
        </form>

        {/* Footer link */}
        <div className="mt-6 border-t border-line/70 pt-5 text-center text-xs text-neutral-500">
          Chưa có tài khoản?{" "}
          <Link
            href="/register"
            className="font-bold text-primary hover:underline"
          >
            Đăng ký tài khoản mới
          </Link>
        </div>
      </div>
    </main>
  );
}