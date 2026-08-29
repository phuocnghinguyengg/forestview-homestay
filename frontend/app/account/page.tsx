"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { accountService, AccountProfile } from "@/lib/services/accountService";
import { useAuthStore } from "@/hooks/useAuthStore";
import { getErrorMessage } from "@/lib/getErrorMessage";

function AccountContent() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [profile, setProfile] = useState<AccountProfile>({ fullName: user?.fullName ?? "", email: user?.email ?? "", phone: "" });
  const [phone, setPhone] = useState("");
  const [profileMessage, setProfileMessage] = useState("");
  const [password, setPassword] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [passwordMessage, setPasswordMessage] = useState("");
  const [email, setEmail] = useState(user?.email ?? "");
  const [newEmail, setNewEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [emailStep, setEmailStep] = useState<"idle" | "otp">("idle");
  const [emailMessage, setEmailMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    accountService.getProfile().then((data) => {
      setProfile(data);
      setPhone(data.phone ?? "");
      setEmail(data.email);
    }).catch(() => {
      setProfile({ fullName: user?.fullName ?? "", email: user?.email ?? "", phone: "" });
      setEmail(user?.email ?? "");
    }).finally(() => setLoading(false));
  }, [user]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault(); setProfileMessage(""); setSaving(true);
    try {
      const data = await accountService.updateProfile({ fullName: profile.fullName.trim(), phone: phone.trim() || undefined });
      setProfile(data); setPhone(data.phone ?? ""); setProfileMessage("Đã cập nhật thông tin tài khoản.");
    } catch (err) { setProfileMessage(getErrorMessage(err, "Không thể cập nhật thông tin.")); }
    finally { setSaving(false); }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault(); setPasswordMessage("");
    if (password.newPassword.length < 6) return setPasswordMessage("Mật khẩu mới cần ít nhất 6 ký tự.");
    if (password.newPassword !== password.confirmPassword) return setPasswordMessage("Mật khẩu xác nhận không khớp.");
    setSaving(true);
    try {
      await accountService.changePassword({ currentPassword: password.currentPassword, newPassword: password.newPassword });
      setPassword({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordMessage("Đổi mật khẩu thành công.");
    } catch (err) { setPasswordMessage(getErrorMessage(err, "Không thể đổi mật khẩu.")); }
    finally { setSaving(false); }
  };

  const requestEmail = async () => {
    setEmailMessage("");
    if (!newEmail || newEmail === email) return setEmailMessage("Vui lòng nhập email mới khác email hiện tại.");
    setSaving(true);
    try { await accountService.requestEmailChange({ newEmail }); setEmailStep("otp"); setEmailMessage("Mã OTP đã được gửi tới email mới."); }
    catch (err) { setEmailMessage(getErrorMessage(err, "Không thể gửi mã OTP.")); }
    finally { setSaving(false); }
  };

  const verifyEmail = async () => {
    setEmailMessage(""); setSaving(true);
    try {
      const data = await accountService.verifyEmailChange({ newEmail, otp });
      setProfile(data); setEmail(data.email); setNewEmail(""); setOtp(""); setEmailStep("idle");
      setEmailMessage("Đã thay đổi email thành công.");
    } catch (err) { setEmailMessage(getErrorMessage(err, "Mã OTP không đúng hoặc đã hết hạn.")); }
    finally { setSaving(false); }
  };

  if (loading) return <main className="mx-auto max-w-3xl px-5 py-16 text-center text-sm text-neutral-500">Đang tải thông tin tài khoản...</main>;

  return (
    <main className="mx-auto max-w-3xl px-5 py-12">
      <p className="font-display text-sm italic text-accent">Không gian riêng của bạn</p>
      <h1 className="mt-1 font-display text-3xl text-ink">Tài khoản của tôi</h1>
      <p className="mt-2 text-sm text-neutral-500">Quản lý thông tin cá nhân và bảo mật tài khoản ForestView.</p>

      <section className="mt-8 rounded-2xl border border-line bg-surface p-6">
        <h2 className="font-display text-xl text-ink">Thông tin cá nhân</h2>
        <form onSubmit={saveProfile} className="mt-5 space-y-4">
          <div><label className="text-sm text-neutral-600">Họ và tên</label><input value={profile.fullName} onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} required className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-ink focus:border-primary focus:outline-none" /></div>
          <div><label className="text-sm text-neutral-600">Email hiện tại</label><input value={email} disabled className="mt-1 w-full rounded-lg border border-line bg-base px-3 py-2.5 text-sm text-neutral-500" /></div>
          <div><label className="text-sm text-neutral-600">Số điện thoại</label><input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Nhập số điện thoại" className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-ink focus:border-primary focus:outline-none" /></div>
          {profileMessage && <p className="text-sm text-primary">{profileMessage}</p>}
          <button disabled={saving} className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50">{saving ? "Đang lưu..." : "Lưu thông tin"}</button>
        </form>
      </section>

      <section className="mt-5 rounded-2xl border border-line bg-surface p-6">
        <h2 className="font-display text-xl text-ink">Thay đổi email</h2>
        <p className="mt-1 text-sm text-neutral-500">Email mới sẽ được xác thực bằng mã OTP gửi qua email.</p>
        <div className="mt-5 space-y-4">
          <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} disabled={emailStep === "otp"} placeholder="Email mới" className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-ink focus:border-primary focus:outline-none" />
          {emailStep === "otp" && <input value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" placeholder="Mã OTP 6 số" className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-center text-xl tracking-[0.4em] text-ink focus:border-primary focus:outline-none" />}
          {emailMessage && <p className="text-sm text-primary">{emailMessage}</p>}
          {emailStep === "idle" ? <button type="button" onClick={requestEmail} disabled={saving} className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50">Gửi mã xác thực</button> : <button type="button" onClick={verifyEmail} disabled={saving || otp.length !== 6} className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50">Xác nhận email</button>}
        </div>
      </section>

      <section className="mt-5 rounded-2xl border border-line bg-surface p-6">
        <h2 className="font-display text-xl text-ink">Đổi mật khẩu</h2>
        <form onSubmit={changePassword} className="mt-5 space-y-4">
          <input type="password" required value={password.currentPassword} onChange={(e) => setPassword({ ...password, currentPassword: e.target.value })} placeholder="Mật khẩu hiện tại" className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-ink focus:border-primary focus:outline-none" />
          <input type="password" required minLength={6} value={password.newPassword} onChange={(e) => setPassword({ ...password, newPassword: e.target.value })} placeholder="Mật khẩu mới" className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-ink focus:border-primary focus:outline-none" />
          <input type="password" required minLength={6} value={password.confirmPassword} onChange={(e) => setPassword({ ...password, confirmPassword: e.target.value })} placeholder="Xác nhận mật khẩu mới" className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-ink focus:border-primary focus:outline-none" />
          {passwordMessage && <p className="text-sm text-primary">{passwordMessage}</p>}
          <button disabled={saving} className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50">Đổi mật khẩu</button>
        </form>
      </section>

      <button type="button" onClick={() => router.push("/dashboard")} className="mt-6 text-sm font-medium text-primary hover:underline">← Quay lại tài khoản</button>
    </main>
  );
}

export default function AccountPage() { return <ProtectedRoute><AccountContent /></ProtectedRoute>; }
