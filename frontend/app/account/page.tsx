"use client";

import { useEffect, useState } from "react";
import { KeyRound, Mail, Phone } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import AccountLayout from "@/components/AccountLayout";
import TabSwitcher from "@/components/TabSwitcher";
import { accountService, AccountProfile } from "@/lib/services/accountService";
import { getErrorMessage } from "@/lib/getErrorMessage";

const inputClass =
  "mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-ink focus:border-primary focus:outline-none";

function Notice({ message, error }: { message: string; error: string }) {
  if (!message && !error) return null;
  return (
    <div
      className={`rounded-xl border px-4 py-3 text-sm ${
        error ? "border-red-200 bg-red-50 text-red-700" : "border-primary/20 bg-primary/5 text-primary"
      }`}
    >
      {error || message}
    </div>
  );
}

function PasswordTab() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (newPassword !== confirm) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setBusy(true);
    try {
      await accountService.changePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");
      setMessage("Đổi mật khẩu thành công.");
    } catch (err) {
      setError(getErrorMessage(err, "Không thể đổi mật khẩu"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-md">
      <h2 className="font-display text-xl text-ink">Thay Đổi Mật Khẩu</h2>
      <p className="mt-1 text-sm text-neutral-500">Đổi mật khẩu định kỳ để bảo vệ tài khoản của bạn.</p>

      <form onSubmit={submit} className="mt-5 space-y-4">
        <div>
          <label className="text-sm text-neutral-600">Mật khẩu hiện tại</label>
          <input
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="text-sm text-neutral-600">Mật khẩu mới</label>
          <input
            type="password"
            required
            minLength={6}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="text-sm text-neutral-600">Xác nhận mật khẩu mới</label>
          <input
            type="password"
            required
            minLength={6}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={inputClass}
          />
        </div>

        <Notice message={message} error={error} />

        <button
          disabled={busy}
          className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
        >
          {busy ? "Đang cập nhật..." : "Đổi mật khẩu"}
        </button>
      </form>
    </div>
  );
}

function EmailTab({ profile, onUpdated }: { profile: AccountProfile | null; onUpdated: (p: AccountProfile) => void }) {
  const [newEmail, setNewEmail] = useState(profile?.email ?? "");
  const [otp, setOtp] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const requestEmail = async () => {
    setMessage("");
    setError("");
    if (!newEmail || newEmail === profile?.email) {
      setError("Vui lòng nhập email mới khác email hiện tại.");
      return;
    }
    setBusy("request");
    try {
      await accountService.requestEmailChange({ newEmail: newEmail.trim() });
      setEmailSent(true);
      setMessage("Mã OTP đã được gửi tới email mới.");
    } catch (err) {
      setError(getErrorMessage(err, "Không thể gửi mã OTP"));
    } finally {
      setBusy("");
    }
  };

  const verifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setBusy("verify");
    try {
      const updated = await accountService.verifyEmailChange({ newEmail: newEmail.trim(), otp });
      onUpdated(updated);
      setEmailSent(false);
      setOtp("");
      setMessage("Email đã được cập nhật.");
    } catch (err) {
      setError(getErrorMessage(err, "Mã OTP không đúng hoặc đã hết hạn"));
    } finally {
      setBusy("");
    }
  };

  return (
    <div className="max-w-md">
      <h2 className="font-display text-xl text-ink">Thay Đổi Email</h2>
      <p className="mt-1 text-sm text-neutral-500">Mã OTP sẽ được gửi tới email mới để xác nhận.</p>

      <div className="mt-5 space-y-4">
        <div>
          <label className="text-sm text-neutral-600">Email hiện tại</label>
          <input disabled value={profile?.email ?? ""} className={`${inputClass} bg-base text-neutral-500`} />
        </div>

        <div>
          <label className="text-sm text-neutral-600">Email mới</label>
          <div className="mt-1 flex flex-col gap-2 sm:flex-row">
            <input
              type="email"
              value={newEmail}
              onChange={(e) => {
                setNewEmail(e.target.value);
                setEmailSent(false);
              }}
              className="flex-1 rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-ink focus:border-primary focus:outline-none"
            />
            <button
              type="button"
              onClick={requestEmail}
              disabled={busy === "request"}
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
            >
              {busy === "request" ? "Đang gửi..." : "Gửi mã OTP"}
            </button>
          </div>
        </div>

        {emailSent && (
          <form onSubmit={verifyEmail} className="flex flex-col gap-2 sm:flex-row">
            <input
              required
              maxLength={6}
              inputMode="numeric"
              pattern="[0-9]{6}"
              placeholder="Mã OTP 6 số"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              className="flex-1 rounded-lg border border-line bg-surface px-3 py-2.5 text-center text-lg tracking-[0.4em] text-ink focus:border-primary focus:outline-none"
            />
            <button
              disabled={busy === "verify" || otp.length !== 6}
              className="rounded-full border border-primary px-6 py-2.5 text-sm font-semibold text-primary hover:bg-primary hover:text-white disabled:opacity-50"
            >
              {busy === "verify" ? "Đang xác nhận..." : "Xác nhận email"}
            </button>
          </form>
        )}

        <Notice message={message} error={error} />
      </div>
    </div>
  );
}

function PhoneTab({ profile, onUpdated }: { profile: AccountProfile | null; onUpdated: (p: AccountProfile) => void }) {
  const [fullName, setFullName] = useState(profile?.fullName ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setBusy(true);
    try {
      const updated = await accountService.updateProfile({ fullName: fullName.trim(), phone: phone.trim() });
      onUpdated(updated);
      setMessage("Số điện thoại đã được cập nhật.");
    } catch (err) {
      setError(getErrorMessage(err, "Không thể cập nhật số điện thoại"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-md">
      <h2 className="font-display text-xl text-ink">Thay Đổi Số Điện Thoại</h2>
      <p className="mt-1 text-sm text-neutral-500">Cập nhật số điện thoại liên hệ khi nhận phòng.</p>

      <form onSubmit={submit} className="mt-5 space-y-4">
        <div>
          <label className="text-sm text-neutral-600">Họ và tên</label>
          <input required value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="text-sm text-neutral-600">Số điện thoại</label>
          <input
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inputClass}
            placeholder="VD: 0912345678"
          />
        </div>

        <Notice message={message} error={error} />

        <button
          disabled={busy}
          className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
        >
          {busy ? "Đang lưu..." : "Lưu số điện thoại"}
        </button>
      </form>
    </div>
  );
}

function AccountContent() {
  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [tab, setTab] = useState<"password" | "email" | "phone">("password");

  useEffect(() => {
    accountService
      .getMe()
      .then(setProfile)
      .catch((err) => setLoadError(getErrorMessage(err, "Không thể tải thông tin tài khoản")))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AccountLayout>
      <div className="space-y-6">
        <div>
          <p className="font-display text-xs italic text-accent">Bảo mật &amp; thông tin</p>
          <h1 className="mt-1 font-display text-2xl text-ink">Tài khoản của tôi</h1>
        </div>

        {loading && <p className="text-sm text-neutral-500">Đang tải thông tin tài khoản...</p>}
        {loadError && <p className="text-sm text-red-600">{loadError}</p>}

        {!loading && !loadError && (
          <>
            <TabSwitcher
              tabs={[
                { key: "password", label: "Thay Đổi Mật Khẩu", icon: <KeyRound size={15} /> },
                { key: "email", label: "Thay Đổi Email", icon: <Mail size={15} /> },
                { key: "phone", label: "Thay Đổi Số Điện Thoại", icon: <Phone size={15} /> },
              ]}
              active={tab}
              onChange={setTab}
            />

            {tab === "password" && <PasswordTab />}
            {tab === "email" && <EmailTab profile={profile} onUpdated={setProfile} />}
            {tab === "phone" && <PhoneTab profile={profile} onUpdated={setProfile} />}
          </>
        )}
      </div>
    </AccountLayout>
  );
}

export default function AccountPage() {
  return (
    <ProtectedRoute allowedRoles={["USER", "ADMIN"]}>
      <AccountContent />
    </ProtectedRoute>
  );
}
