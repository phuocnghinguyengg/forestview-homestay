"use client";

import { Suspense, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { authService } from "@/lib/services/authService";
import { useAuthStore } from "@/hooks/useAuthStore";
import { getErrorMessage } from "@/lib/getErrorMessage";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Mail,
  ShieldCheck,
} from "lucide-react";

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email") ?? "";
  const login = useAuthStore((s) => s.login);

  // 6 individual OTP digit inputs
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [skipping, setSkipping] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  const otp = digits.join("");

  // Handle individual digit input
  const handleDigitChange = (idx: number, val: string) => {
    const digit = val.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[idx] = digit;
    setDigits(next);
    setError("");
    setResendMessage("");

    // Auto-advance focus
    if (digit && idx < 5) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!digits[idx] && idx > 0) {
        const next = [...digits];
        next[idx - 1] = "";
        setDigits(next);
        inputRefs.current[idx - 1]?.focus();
      } else {
        const next = [...digits];
        next[idx] = "";
        setDigits(next);
      }
    } else if (e.key === "ArrowLeft" && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    } else if (e.key === "ArrowRight" && idx < 5) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length > 0) {
      const next = ["", "", "", "", "", ""];
      for (let i = 0; i < pasted.length; i++) {
        next[i] = pasted[i];
      }
      setDigits(next);
      // Focus on the last filled or next empty
      const focusIdx = Math.min(pasted.length, 5);
      inputRefs.current[focusIdx]?.focus();
    }
  };

  const startResendCooldown = () => {
    setResendCooldown(60);
    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError("Không tìm thấy email xác thực.");
      return;
    }
    if (otp.length !== 6) {
      setError("Vui lòng nhập đủ 6 chữ số.");
      return;
    }

    setError("");
    setResendMessage("");
    setSubmitting(true);

    try {
      const res = await authService.verifyOtp({ email, otp });

      login(res.accessToken, res.refreshToken, {
        fullName: res.fullName,
        email: res.email,
        role: res.role,
        emailVerified: res.emailVerified,
      });

      router.push(res.role === "ADMIN" ? "/admin" : "/");
    } catch (err) {
      setError(getErrorMessage(err, "Mã OTP không đúng hoặc đã hết hạn"));
      // Clear digits on error
      setDigits(["", "", "", "", "", ""]);
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!email || resendCooldown > 0) return;

    setError("");
    setResendMessage("");
    setResending(true);

    try {
      await authService.resendOtp({ email });
      setResendMessage("Đã gửi lại mã OTP mới. Vui lòng kiểm tra hộp thư.");
      startResendCooldown();
    } catch (err) {
      setError(getErrorMessage(err, "Không thể gửi lại mã, vui lòng thử lại"));
    } finally {
      setResending(false);
    }
  };

  const handleSkip = async () => {
    if (!email) {
      setError("Không tìm thấy email xác thực.");
      return;
    }

    if (
      !confirm(
        "Bỏ qua xác thực? Bạn sẽ không thể đặt phòng cho đến khi xác thực email."
      )
    ) {
      return;
    }

    setError("");
    setResendMessage("");
    setSkipping(true);

    try {
      const res = await authService.skipOtp({ email });

      login(res.accessToken, res.refreshToken, {
        fullName: res.fullName,
        email: res.email,
        role: res.role,
        emailVerified: res.emailVerified,
      });

      router.push(res.role === "ADMIN" ? "/admin" : "/");
    } catch (err) {
      setError(getErrorMessage(err, "Không thể bỏ qua xác thực"));
    } finally {
      setSkipping(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-[calc(100vh-140px)] max-w-lg flex-col justify-center px-5 py-10 sm:py-16">
      {/* Back */}
      <Link
        href="/register"
        className="group mb-6 inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 transition hover:text-primary"
      >
        <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
        Quay lại đăng ký
      </Link>

      {/* Card */}
      <div className="rounded-3xl border border-line bg-surface p-7 shadow-xl shadow-ink/5 sm:p-9">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ShieldCheck size={28} />
          </div>
          <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
            Xác thực Email
          </h1>
          <p className="mt-2 text-xs text-neutral-500 sm:text-sm">
            Mã gồm <b>6 chữ số</b> đã được gửi tới{" "}
            <span className="font-semibold text-ink">{email || "email của bạn"}</span>
            . Mã có hiệu lực trong <b>10 phút</b>.
          </p>
        </div>

        {/* Email icon row */}
        <div className="mt-4 flex items-center gap-2 rounded-2xl border border-line bg-base/40 px-4 py-2.5">
          <Mail size={15} className="shrink-0 text-neutral-400" />
          <span className="truncate text-xs font-medium text-neutral-600">{email || "—"}</span>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700">
            <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-600" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Success resend */}
        {resendMessage && (
          <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-green-200 bg-green-50 p-3.5 text-xs text-green-700">
            <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-green-600" />
            <span className="leading-relaxed">{resendMessage}</span>
          </div>
        )}

        {/* 6 individual OTP boxes */}
        <form onSubmit={handleSubmit} className="mt-6">
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            {digits.map((d, idx) => (
              <input
                key={idx}
                ref={(el) => { inputRefs.current[idx] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                autoFocus={idx === 0}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                onPaste={idx === 0 ? handlePaste : undefined}
                className={`h-12 w-10 rounded-xl border-2 bg-base/40 text-center text-lg font-bold text-ink transition focus:bg-surface focus:outline-none sm:h-14 sm:w-12 sm:text-xl ${
                  d
                    ? "border-primary text-primary shadow-sm shadow-primary/20"
                    : "border-line focus:border-primary"
                } ${error ? "border-red-300" : ""}`}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={submitting || otp.length !== 6 || !email}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-xs font-semibold text-white shadow-sm transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Đang xác thực...
              </>
            ) : (
              <>
                <ShieldCheck size={16} />
                Xác thực & Hoàn tất đăng ký
              </>
            )}
          </button>
        </form>

        {/* Resend */}
        <div className="mt-5 flex flex-col items-center gap-2 border-t border-line/70 pt-4 text-center">
          <p className="text-xs text-neutral-500">Chưa nhận được mã?</p>
          <button
            type="button"
            onClick={handleResend}
            disabled={resending || !email || resendCooldown > 0}
            className="text-xs font-semibold text-primary transition hover:underline disabled:cursor-not-allowed disabled:opacity-50"
          >
            {resending
              ? "Đang gửi lại..."
              : resendCooldown > 0
              ? `Gửi lại sau ${resendCooldown}s`
              : "Gửi lại mã OTP"}
          </button>
        </div>

        {/* Skip */}
        <div className="mt-3 text-center">
          <button
            type="button"
            onClick={handleSkip}
            disabled={skipping || !email}
            className="text-xs text-neutral-400 transition hover:text-neutral-600 disabled:opacity-50"
          >
            {skipping ? "Đang xử lý..." : "Bỏ qua lúc này (sẽ không thể đặt phòng)"}
          </button>
        </div>
      </div>
    </main>
  );
}

function VerifyOtpFallback() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-140px)] max-w-lg flex-col items-center justify-center px-5 py-10">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
        <Loader2 size={28} className="animate-spin text-primary" />
      </div>
      <p className="mt-4 text-sm text-neutral-500">Đang tải trang xác thực...</p>
    </main>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<VerifyOtpFallback />}>
      <VerifyOtpContent />
    </Suspense>
  );
}