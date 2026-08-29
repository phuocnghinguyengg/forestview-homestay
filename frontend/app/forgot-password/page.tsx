"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { passwordService } from "@/lib/services/passwordService";
import { getErrorMessage } from "@/lib/getErrorMessage";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState<"email" | "reset">("email");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const sendOtp = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setMessage(""); setLoading(true);
    try { await passwordService.forgot(email); setStep("reset"); setMessage("Mã OTP đã được gửi tới email của bạn."); }
    catch (err) { setError(getErrorMessage(err, "Không thể gửi mã OTP.")); }
    finally { setLoading(false); }
  };

  const reset = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setMessage("");
    if (newPassword.length < 6) return setError("Mật khẩu mới cần ít nhất 6 ký tự.");
    if (newPassword !== confirmPassword) return setError("Mật khẩu xác nhận không khớp.");
    setLoading(true);
    try { await passwordService.reset({ email, otp, newPassword }); setMessage("Đặt lại mật khẩu thành công. Đang chuyển tới trang đăng nhập..."); setTimeout(() => router.push("/login"), 900); }
    catch (err) { setError(getErrorMessage(err, "OTP không đúng hoặc đã hết hạn.")); }
    finally { setLoading(false); }
  };

  return <main className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-5 py-12">
    <p className="font-display text-sm italic text-accent">Khôi phục tài khoản</p>
    <h1 className="mt-1 font-display text-3xl text-ink">Quên mật khẩu</h1>
    <p className="mt-2 text-sm text-neutral-500">Nhận mã OTP qua email để đặt lại mật khẩu.</p>
    {step === "email" ? <form onSubmit={sendOtp} className="mt-8 space-y-4"><div><label className="text-sm text-neutral-600">Email</label><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-ink focus:border-primary focus:outline-none" /></div>{error && <p className="text-sm text-red-600">{error}</p>}<button disabled={loading} className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50">{loading ? "Đang gửi..." : "Gửi mã OTP"}</button></form> : <form onSubmit={reset} className="mt-8 space-y-4"><input value={email} disabled className="w-full rounded-lg border border-line bg-base px-3 py-2.5 text-sm text-neutral-500" /><input required maxLength={6} inputMode="numeric" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="Mã OTP 6 số" className="w-full rounded-lg border border-line bg-surface px-3 py-3 text-center text-2xl tracking-[0.5em] text-ink focus:border-primary focus:outline-none" /><input type="password" required minLength={6} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Mật khẩu mới" className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-ink focus:border-primary focus:outline-none" /><input type="password" required minLength={6} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Xác nhận mật khẩu mới" className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-ink focus:border-primary focus:outline-none" />{error && <p className="text-sm text-red-600">{error}</p>}{message && <p className="text-sm text-primary">{message}</p>}<button disabled={loading || otp.length !== 6} className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50">{loading ? "Đang cập nhật..." : "Đặt lại mật khẩu"}</button></form>}
    {message && step === "email" && <p className="mt-4 text-sm text-primary">{message}</p>}
    <p className="mt-6 text-center text-sm text-neutral-500"><Link href="/login" className="font-medium text-primary hover:underline">← Quay lại đăng nhập</Link></p>
  </main>;
}
