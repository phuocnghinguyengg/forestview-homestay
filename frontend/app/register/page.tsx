"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";

import { authService } from "@/lib/services/authService";
import { useGuestOnly } from "@/hooks/useGuestOnly";
import { getErrorMessage } from "@/lib/getErrorMessage";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  Sparkles,
  User,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  useGuestOnly();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState<string | undefined>();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedName = fullName.trim();

    if (normalizedName.length < 2) {
      setError("Họ và tên phải có ít nhất 2 ký tự");
      return;
    }

    if (!normalizedEmail) {
      setError("Vui lòng nhập email hợp lệ");
      return;
    }

    if (phone && !isValidPhoneNumber(phone)) {
      setError("Số điện thoại không hợp lệ");
      return;
    }

    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp với mật khẩu đã nhập");
      return;
    }

    setSubmitting(true);

    try {
      const res = await authService.register({
        fullName: normalizedName,
        email: normalizedEmail,
        password,
        phone,
      });

      router.push(`/verify-otp?email=${encodeURIComponent(res.email)}`);
    } catch (err) {
      setError(getErrorMessage(err, "Đăng ký thất bại, vui lòng thử lại"));
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
            <Sparkles size={13} /> Chào mừng bạn mới
          </div>
          <h1 className="mt-3 font-display text-3xl font-semibold text-ink sm:text-4xl">
            Tạo tài khoản mới
          </h1>
          <p className="mt-1.5 text-xs text-neutral-500 sm:text-sm">
            Đăng ký để nhận ưu đãi thành viên &amp; đặt homestay nhanh chóng.
          </p>
        </div>

        {/* Membership perk pill */}
        <div className="mt-5 flex items-center gap-2.5 rounded-2xl border border-primary/20 bg-primary/5 p-3 text-xs text-primary">
          <CheckCircle2 size={16} className="shrink-0" />
          <span>Tích lũy đặt phòng để mở khóa các hạng thành viên và nhận ưu đãi giảm giá.</span>
        </div>

        {/* Error alert */}
        {error && (
          <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700">
            <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-600" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-neutral-700">
              Họ và tên
            </label>
            <div className="relative mt-1.5">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-400">
                <User size={16} />
              </span>
              <input
                type="text"
                required
                autoFocus
                placeholder="Nguyễn Văn A"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="name"
                className="w-full rounded-xl border border-line bg-base/40 py-2.5 pr-3.5 pl-10 text-xs text-ink transition focus:border-primary focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/10 sm:text-sm"
              />
            </div>
          </div>

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
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="w-full rounded-xl border border-line bg-base/40 py-2.5 pr-3.5 pl-10 text-xs text-ink transition focus:border-primary focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/10 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-700">
              Số điện thoại <span className="font-normal text-neutral-400">(Tùy chọn)</span>
            </label>
            <div className="phone-input-wrapper mt-1.5">
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
            <label className="text-xs font-semibold text-neutral-700">
              Mật khẩu <span className="font-normal text-neutral-400">(Tối thiểu 6 ký tự)</span>
            </label>
            <div className="relative mt-1.5">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-400">
                <Lock size={16} />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
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

          <div>
            <label className="text-xs font-semibold text-neutral-700">
              Xác nhận lại mật khẩu
            </label>
            <div className="relative mt-1.5">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-400">
                <Lock size={16} />
              </span>
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                minLength={6}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                className="w-full rounded-xl border border-line bg-base/40 py-2.5 pr-10 pl-10 text-xs text-ink transition focus:border-primary focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/10 sm:text-sm"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-neutral-400 transition hover:text-ink"
                title={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || !fullName || !email || !password || !confirmPassword}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-xs font-semibold text-white shadow-sm transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
          >
            {submitting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Đang tạo tài khoản...
              </>
            ) : (
              "Đăng ký & Nhận mã xác thực"
            )}
          </button>
        </form>

        {/* Footer link */}
        <div className="mt-6 border-t border-line/70 pt-5 text-center text-xs text-neutral-500">
          Đã có tài khoản ForestView?{" "}
          <Link
            href="/login"
            className="font-bold text-primary hover:underline"
          >
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    </main>
  );
}