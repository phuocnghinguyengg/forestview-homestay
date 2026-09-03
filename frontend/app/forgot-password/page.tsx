"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { authService } from "@/lib/services/authService";
import { useGuestOnly } from "@/hooks/useGuestOnly";
import { getErrorMessage } from "@/lib/getErrorMessage";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
} from "lucide-react";

type Step = "email" | "otp" | "done";

export default function ForgotPasswordPage() {
  useGuestOnly();
  const [step, setStep] = useState<Step>("email");

  const [email, setEmail] = useState("");
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  const otp = digits.join("");

  // OTP input handlers
  const handleDigitChange = (idx: number, val: string) => {
    const digit = val.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[idx] = digit;
    setDigits(next);
    setError("");
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
      for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
      setDigits(next);
      const focusIdx = Math.min(pasted.length, 5);
      inputRefs.current[focusIdx]?.focus();
    }
  };

  const startResendCooldown = () => {
    setResendCooldown(60);
    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  // Step 1: Request OTP
  const requestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setBusy(true);
    try {
      await authService.requestPasswordReset({ email: email.trim().toLowerCase() });
      setStep("otp");
      startResendCooldown();
    } catch (err) {
      setError(getErrorMessage(err, "Không thể gửi mã OTP"));
    } finally {
      setBusy(false);
    }
  };

  // Resend OTP
  const resendOtp = async () => {
    if (resendCooldown > 0) return;
    setError("");
    setBusy(true);
    try {
      await authService.requestPasswordReset({ email: email.trim().toLowerCase() });
      setMessage("Đã gửi lại mã OTP mới.");
      startResendCooldown();
    } catch (err) {
      setError(getErrorMessage(err, "Không thể gửi lại mã"));
    } finally {
      setBusy(false);
    }
  };

  // Step 2: Reset password
  const resetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (otp.length !== 6) {
      setError("Vui lòng nhập đủ 6 chữ số OTP.");
      return;
    }
    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }
    if (password !== confirm) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setBusy(true);
    try {
      await authService.resetPassword({
        email: email.trim().toLowerCase(),
        otp,
        newPassword: password,
      });
      setStep("done");
    } catch (err) {
      setError(getErrorMessage(err, "Mã OTP không đúng hoặc đã hết hạn"));
      setDigits(["", "", "", "", "", ""]);
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-[calc(100vh-140px)] max-w-lg flex-col justify-center px-5 py-10 sm:py-16">
      <Link
        href="/login"
        className="group mb-6 inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 transition hover:text-primary"
      >
        <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
        Quay lại đăng nhập
      </Link>

      <div className="rounded-3xl border border-line bg-surface p-7 shadow-xl shadow-ink/5 sm:p-9">

        {/* ===== STEP: DONE ===== */}
        {step === "done" && (
          <div className="flex flex-col items-center py-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 text-green-600">
              <CheckCircle2 size={32} />
            </div>
            <h1 className="mt-4 font-display text-2xl font-semibold text-ink sm:text-3xl">
              Đặt lại mật khẩu thành công!
            </h1>
            <p className="mt-2 text-xs text-neutral-500 sm:text-sm">
              Mật khẩu của bạn đã được cập nhật. Bạn có thể đăng nhập ngay bây giờ.
            </p>
            <Link
              href="/login"
              className="mt-6 flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-xs font-semibold text-white shadow-sm transition hover:bg-primary-dark sm:text-sm"
            >
              Đăng nhập ngay
            </Link>
          </div>
        )}

        {/* ===== STEP: EMAIL ===== */}
        {step === "email" && (
          <>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                <KeyRound size={26} />
              </div>
              <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
                Quên mật khẩu?
              </h1>
              <p className="mt-2 text-xs text-neutral-500 sm:text-sm">
                Nhập email đã đăng ký — chúng tôi sẽ gửi mã OTP để đặt lại mật khẩu.
              </p>
            </div>

            {error && (
              <div className="mt-5 flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700">
                <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={requestOtp} className="mt-6 space-y-4">
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
                    autoFocus
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    className="w-full rounded-xl border border-line bg-base/40 py-2.5 pr-3.5 pl-10 text-xs text-ink transition focus:border-primary focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/10 sm:text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={busy || !email}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-xs font-semibold text-white shadow-sm transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
              >
                {busy ? (
                  <><Loader2 size={16} className="animate-spin" /> Đang gửi mã...</>
                ) : (
                  "Gửi mã xác thực OTP"
                )}
              </button>
            </form>
          </>
        )}

        {/* ===== STEP: OTP + NEW PASSWORD ===== */}
        {step === "otp" && (
          <>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <ShieldCheck size={26} />
              </div>
              <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
                Nhập mã & Mật khẩu mới
              </h1>
              <p className="mt-2 text-xs text-neutral-500 sm:text-sm">
                Mã OTP đã gửi tới{" "}
                <span className="font-semibold text-ink">{email}</span>
              </p>
            </div>

            {error && (
              <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700">
                <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}
            {message && (
              <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-green-200 bg-green-50 p-3.5 text-xs text-green-700">
                <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-green-600" />
                <span>{message}</span>
              </div>
            )}

            <form onSubmit={resetPassword} className="mt-5 space-y-4">
              {/* 6-digit OTP boxes */}
              <div>
                <label className="text-xs font-semibold text-neutral-700">
                  Mã OTP (6 chữ số)
                </label>
                <div className="mt-2 flex items-center justify-center gap-2 sm:gap-3">
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
                      className={`h-12 w-10 rounded-xl border-2 bg-base/40 text-center text-lg font-bold text-ink transition focus:bg-surface focus:outline-none sm:h-13 sm:w-11 sm:text-xl ${
                        d
                          ? "border-primary text-primary shadow-sm shadow-primary/20"
                          : "border-line focus:border-primary"
                      } ${error ? "border-red-300" : ""}`}
                    />
                  ))}
                </div>
              </div>

              {/* New password */}
              <div>
                <label className="text-xs font-semibold text-neutral-700">
                  Mật khẩu mới
                </label>
                <div className="relative mt-1.5">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-400">
                    <Lock size={16} />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    placeholder="Tối thiểu 6 ký tự"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    className="w-full rounded-xl border border-line bg-base/40 py-2.5 pr-10 pl-10 text-xs text-ink transition focus:border-primary focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/10 sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-neutral-400 transition hover:text-ink"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm password */}
              <div>
                <label className="text-xs font-semibold text-neutral-700">
                  Xác nhận mật khẩu mới
                </label>
                <div className="relative mt-1.5">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-400">
                    <Lock size={16} />
                  </span>
                  <input
                    type={showConfirm ? "text" : "password"}
                    required
                    minLength={6}
                    placeholder="Nhập lại mật khẩu mới"
                    value={confirm}
                    onChange={(e) => { setConfirm(e.target.value); setError(""); }}
                    className="w-full rounded-xl border border-line bg-base/40 py-2.5 pr-10 pl-10 text-xs text-ink transition focus:border-primary focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/10 sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-neutral-400 transition hover:text-ink"
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={busy || otp.length !== 6 || !password || !confirm}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-xs font-semibold text-white shadow-sm transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
              >
                {busy ? (
                  <><Loader2 size={16} className="animate-spin" /> Đang cập nhật...</>
                ) : (
                  "Đặt lại mật khẩu"
                )}
              </button>
            </form>

            {/* Resend + back */}
            <div className="mt-5 flex flex-col items-center gap-2 border-t border-line/70 pt-4 text-center">
              <button
                type="button"
                onClick={resendOtp}
                disabled={busy || resendCooldown > 0}
                className="text-xs font-semibold text-primary transition hover:underline disabled:cursor-not-allowed disabled:opacity-50"
              >
                {resendCooldown > 0
                  ? `Gửi lại mã sau ${resendCooldown}s`
                  : "Gửi lại mã OTP"}
              </button>
              <button
                type="button"
                onClick={() => { setStep("email"); setError(""); setMessage(""); }}
                className="text-xs text-neutral-400 hover:text-neutral-600 transition"
              >
                Thay đổi email
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
