"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authService } from "@/lib/services/authService";
import { useAuthStore } from "@/hooks/useAuthStore";
import { getErrorMessage } from "@/lib/getErrorMessage";

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email") ?? "";
  const login = useAuthStore((s) => s.login);

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [skipping, setSkipping] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError("Không tìm thấy email xác thực.");
      return;
    }

    setError("");
    setResendMessage("");
    setSubmitting(true);

    try {
      const res = await authService.verifyOtp({
        email,
        otp,
      });

      login(res.accessToken, res.refreshToken, {
        fullName: res.fullName,
        email: res.email,
        role: res.role,
        emailVerified: res.emailVerified,
        membershipTier: res.membershipTier,
        membershipLabel: res.membershipLabel,
        membershipDiscountPercent: res.membershipDiscountPercent,
      });

      router.push(res.role === "ADMIN" ? "/admin" : "/");
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Mã OTP không đúng hoặc đã hết hạn"
        )
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError("Không tìm thấy email để gửi lại mã.");
      return;
    }

    setError("");
    setResendMessage("");
    setResending(true);

    try {
      await authService.resendOtp({ email });

      setResendMessage(
        "Đã gửi lại mã OTP mới tới email của bạn."
      );
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Không thể gửi lại mã, vui lòng thử lại sau"
        )
      );
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
        membershipTier: res.membershipTier,
        membershipLabel: res.membershipLabel,
        membershipDiscountPercent: res.membershipDiscountPercent,
      });

      router.push(res.role === "ADMIN" ? "/admin" : "/");
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Không thể bỏ qua xác thực"
        )
      );
    } finally {
      setSkipping(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-5 py-12">
      <p className="font-display text-sm italic text-accent">
        Bước cuối cùng
      </p>

      <h1 className="mt-1 font-display text-3xl text-ink">
        Nhập mã xác thực
      </h1>

      <p className="mt-2 text-sm text-neutral-500">
        Mã gồm 6 chữ số đã được gửi tới{" "}
        <span className="font-medium text-ink">
          {email || "email của bạn"}
        </span>
        . Mã có hiệu lực trong 10 phút.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <input
          required
          maxLength={6}
          inputMode="numeric"
          pattern="[0-9]{6}"
          placeholder="000000"
          value={otp}
          onChange={(e) =>
            setOtp(e.target.value.replace(/\D/g, ""))
          }
          className="w-full rounded-lg border border-line bg-surface px-3 py-3 text-center text-2xl tracking-[0.5em] text-ink focus:border-primary focus:outline-none"
        />

        {error && (
          <p className="text-sm text-red-600">
            {error}
          </p>
        )}

        {resendMessage && (
          <p className="text-sm text-primary">
            {resendMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting || otp.length !== 6 || !email}
          className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-50"
        >
          {submitting
            ? "Đang xác thực..."
            : "Xác thực"}
        </button>
      </form>

      <button
        type="button"
        onClick={handleResend}
        disabled={resending || !email}
        className="mt-5 text-center text-sm font-medium text-primary hover:underline disabled:opacity-50"
      >
        {resending ? "Đang gửi..." : "Gửi lại mã"}
      </button>

      <button
        type="button"
        onClick={handleSkip}
        disabled={skipping || !email}
        className="mt-3 text-center text-sm text-neutral-400 hover:text-neutral-600 disabled:opacity-50"
      >
        {skipping
          ? "Đang xử lý..."
          : "Bỏ qua xác thực (không thể đặt phòng cho đến khi xác thực)"}
      </button>
    </main>
  );
}

function VerifyOtpFallback() {
  return (
    <main className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-5 py-12">
      <p className="font-display text-sm italic text-accent">
        Bước cuối cùng
      </p>

      <h1 className="mt-1 font-display text-3xl text-ink">
        Nhập mã xác thực
      </h1>

      <p className="mt-2 text-sm text-neutral-500">
        Đang tải trang xác thực...
      </p>
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