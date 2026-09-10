"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";

import { authService } from "@/lib/services/authService";
import { useAuthStore } from "@/hooks/useAuthStore";
import { useAuthModalStore, AuthModalView } from "@/hooks/useAuthModalStore";
import { getErrorMessage } from "@/lib/getErrorMessage";

type ForgotStep = "email" | "otp" | "done";

function OtpBoxes({
  digits,
  onChange,
  hasError,
}: {
  digits: string[];
  onChange: (digits: string[]) => void;
  hasError: boolean;
}) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleDigitChange = (idx: number, val: string) => {
    const digit = val.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[idx] = digit;
    onChange(next);
    if (digit && idx < 5) inputRefs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!digits[idx] && idx > 0) {
        const next = [...digits];
        next[idx - 1] = "";
        onChange(next);
        inputRefs.current[idx - 1]?.focus();
      } else {
        const next = [...digits];
        next[idx] = "";
        onChange(next);
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
      onChange(next);
      inputRefs.current[Math.min(pasted.length, 5)]?.focus();
    }
  };

  return (
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
          className={`h-12 w-10 rounded-xl border-2 bg-canvas text-center text-lg font-bold text-ink transition focus:bg-surface focus:outline-none sm:h-13 sm:w-11 sm:text-xl ${
            d ? "border-primary text-primary" : "border-line focus:border-primary"
          } ${hasError ? "border-rose/40" : ""}`}
        />
      ))}
    </div>
  );
}

export default function AuthModal() {
  const router = useRouter();
  const { open, view, email: modalEmail, token, setView, close } = useAuthModalStore();
  const login = useAuthStore((s) => s.login);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prevOverflow; };
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  const titles: Record<typeof view, string> = {
    login: "Đăng nhập",
    register: "Tạo tài khoản mới",
    otp: "Xác thực email",
    forgot: "Quên mật khẩu",
  };

  const AUTH_NAV: { view: AuthModalView; label: string }[] = [
    { view: "login", label: "Đăng nhập" },
    { view: "register", label: "Đăng ký" },
  ];

  return createPortal(
    <div
      className="modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) close(); }}
    >
      <div role="dialog" aria-modal="true" aria-label={titles[view]} className="modal-panel modal-panel--row h-[min(90vh,720px)] max-w-2xl">
        <aside className="side-nav">
          {AUTH_NAV.map((item) => (
            <button key={item.view} type="button" onClick={() => setView(item.view)} className={`side-nav-btn ${view === item.view ? "active" : ""}`}>
              {item.label}
            </button>
          ))}
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="modal-head flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[11px] font-bold tracking-[0.16em] text-primary uppercase">ForestView Homestay</p>
              <h2 className="mt-1 truncate font-display text-2xl text-ink">{titles[view]}</h2>
            </div>
            <button type="button" onClick={close} aria-label="Đóng" className="shrink-0 rounded-full border border-line p-2 text-neutral-500 transition hover:bg-canvas hover:text-ink">✕</button>
          </div>

          <AuthModalBody
            key={token}
            view={view}
            modalEmail={modalEmail}
            setView={setView}
            close={close}
            login={login}
            router={router}
          />
        </div>
      </div>
    </div>,
    document.body,
  );
}

function AuthModalBody({
  view,
  modalEmail,
  setView,
  close,
  login,
  router,
}: {
  view: AuthModalView;
  modalEmail: string;
  setView: (view: AuthModalView, email?: string) => void;
  close: () => void;
  login: ReturnType<typeof useAuthStore.getState>["login"];
  router: ReturnType<typeof useRouter>;
}) {
  // ---- Login form ----
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loginShowPassword, setLoginShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);

  // ---- Register form ----
  const [fullName, setFullName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [regPhone, setRegPhone] = useState<string | undefined>();
  const [regShowPassword, setRegShowPassword] = useState(false);
  const [regShowConfirm, setRegShowConfirm] = useState(false);
  const [regError, setRegError] = useState("");
  const [regBusy, setRegBusy] = useState(false);

  // ---- OTP (post-register) ----
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [otpBusy, setOtpBusy] = useState(false);
  const [otpResending, setOtpResending] = useState(false);
  const [otpSkipping, setOtpSkipping] = useState(false);
  const [otpMessage, setOtpMessage] = useState("");
  const [otpCooldown, setOtpCooldown] = useState(0);

  // ---- Forgot password ----
  const [forgotStep, setForgotStep] = useState<ForgotStep>("email");
  const [forgotEmail, setForgotEmail] = useState(view === "forgot" ? modalEmail : "");
  const [forgotDigits, setForgotDigits] = useState(["", "", "", "", "", ""]);
  const [forgotPassword, setForgotPassword] = useState("");
  const [forgotConfirm, setForgotConfirm] = useState("");
  const [forgotShowPassword, setForgotShowPassword] = useState(false);
  const [forgotShowConfirm, setForgotShowConfirm] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [forgotMessage, setForgotMessage] = useState("");
  const [forgotBusy, setForgotBusy] = useState(false);
  const [forgotCooldown, setForgotCooldown] = useState(0);

  const afterAuth = (role: string) => {
    close();
    router.push(role === "ADMIN" ? "/admin" : "/");
  };

  const runCooldown = (setter: React.Dispatch<React.SetStateAction<number>>) => {
    setter(60);
    const timer = setInterval(() => {
      setter((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginBusy(true);
    try {
      const res = await authService.login({
        email: loginForm.email.trim().toLowerCase(),
        password: loginForm.password,
      });
      login(res.accessToken, res.refreshToken, {
        fullName: res.fullName,
        email: res.email,
        avatarUrl: res.avatarUrl,
        role: res.role,
        emailVerified: res.emailVerified,
        membershipTier: res.membershipTier,
      });
      afterAuth(res.role);
    } catch (err) {
      setLoginError(getErrorMessage(err, "Email hoặc mật khẩu không đúng"));
    } finally {
      setLoginBusy(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");

    const normalizedEmail = regEmail.trim().toLowerCase();
    const normalizedName = fullName.trim();

    if (normalizedName.length < 2) return setRegError("Họ và tên phải có ít nhất 2 ký tự");
    if (!normalizedEmail) return setRegError("Vui lòng nhập email hợp lệ");
    if (regPhone && !isValidPhoneNumber(regPhone)) return setRegError("Số điện thoại không hợp lệ");
    if (regPassword.length < 6) return setRegError("Mật khẩu phải có ít nhất 6 ký tự");
    if (regPassword !== regConfirm) return setRegError("Mật khẩu xác nhận không khớp với mật khẩu đã nhập");

    setRegBusy(true);
    try {
      const res = await authService.register({
        fullName: normalizedName,
        email: normalizedEmail,
        password: regPassword,
        phone: regPhone,
      });
      setView("otp", res.email);
    } catch (err) {
      setRegError(getErrorMessage(err, "Đăng ký thất bại, vui lòng thử lại"));
    } finally {
      setRegBusy(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const otp = otpDigits.join("");
    if (!modalEmail) return setOtpError("Không tìm thấy email xác thực.");
    if (otp.length !== 6) return setOtpError("Vui lòng nhập đủ 6 chữ số.");

    setOtpError("");
    setOtpMessage("");
    setOtpBusy(true);
    try {
      const res = await authService.verifyOtp({ email: modalEmail, otp });
      login(res.accessToken, res.refreshToken, {
        fullName: res.fullName,
        email: res.email,
        role: res.role,
        emailVerified: res.emailVerified,
      });
      afterAuth(res.role);
    } catch (err) {
      setOtpError(getErrorMessage(err, "Mã OTP không đúng hoặc đã hết hạn"));
      setOtpDigits(["", "", "", "", "", ""]);
    } finally {
      setOtpBusy(false);
    }
  };

  const handleResendOtp = async () => {
    if (!modalEmail || otpCooldown > 0) return;
    setOtpError("");
    setOtpMessage("");
    setOtpResending(true);
    try {
      await authService.resendOtp({ email: modalEmail });
      setOtpMessage("Đã gửi lại mã OTP mới. Vui lòng kiểm tra hộp thư.");
      runCooldown(setOtpCooldown);
    } catch (err) {
      setOtpError(getErrorMessage(err, "Không thể gửi lại mã, vui lòng thử lại"));
    } finally {
      setOtpResending(false);
    }
  };

  const handleSkipOtp = async () => {
    if (!modalEmail) return setOtpError("Không tìm thấy email xác thực.");
    if (!confirm("Bỏ qua xác thực? Bạn sẽ không thể đặt phòng cho đến khi xác thực email.")) return;

    setOtpError("");
    setOtpSkipping(true);
    try {
      const res = await authService.skipOtp({ email: modalEmail });
      login(res.accessToken, res.refreshToken, {
        fullName: res.fullName,
        email: res.email,
        role: res.role,
        emailVerified: res.emailVerified,
      });
      afterAuth(res.role);
    } catch (err) {
      setOtpError(getErrorMessage(err, "Không thể bỏ qua xác thực"));
    } finally {
      setOtpSkipping(false);
    }
  };

  const requestForgotOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");
    setForgotMessage("");
    setForgotBusy(true);
    try {
      await authService.requestPasswordReset({ email: forgotEmail.trim().toLowerCase() });
      setForgotStep("otp");
      runCooldown(setForgotCooldown);
    } catch (err) {
      setForgotError(getErrorMessage(err, "Không thể gửi mã OTP"));
    } finally {
      setForgotBusy(false);
    }
  };

  const resendForgotOtp = async () => {
    if (forgotCooldown > 0) return;
    setForgotError("");
    setForgotBusy(true);
    try {
      await authService.requestPasswordReset({ email: forgotEmail.trim().toLowerCase() });
      setForgotMessage("Đã gửi lại mã OTP mới.");
      runCooldown(setForgotCooldown);
    } catch (err) {
      setForgotError(getErrorMessage(err, "Không thể gửi lại mã"));
    } finally {
      setForgotBusy(false);
    }
  };

  const submitResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");
    setForgotMessage("");
    const otp = forgotDigits.join("");

    if (otp.length !== 6) return setForgotError("Vui lòng nhập đủ 6 chữ số OTP.");
    if (forgotPassword.length < 6) return setForgotError("Mật khẩu phải có ít nhất 6 ký tự.");
    if (forgotPassword !== forgotConfirm) return setForgotError("Mật khẩu xác nhận không khớp.");

    setForgotBusy(true);
    try {
      await authService.resetPassword({
        email: forgotEmail.trim().toLowerCase(),
        otp,
        newPassword: forgotPassword,
      });
      setForgotStep("done");
    } catch (err) {
      setForgotError(getErrorMessage(err, "Mã OTP không đúng hoặc đã hết hạn"));
      setForgotDigits(["", "", "", "", "", ""]);
    } finally {
      setForgotBusy(false);
    }
  };

  return (
        <div className="min-h-0 flex-1 overflow-y-auto p-6 sm:p-8">
          {view === "login" && (
            <>
              <p className="text-sm text-neutral-500">Chào mừng bạn quay lại với kỳ nghỉ giữa rừng thông Đà Lạt.</p>
              {loginError && <p className="mt-4 rounded-2xl border border-rose/30 bg-rose/10 p-3.5 text-xs text-rose-dark">{loginError}</p>}
              <form onSubmit={handleLogin} className="mt-5 space-y-4">
                <label className="field-label">Địa chỉ Email
                  <input type="email" required autoFocus value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} className="field-input mt-1" placeholder="name@example.com" />
                </label>
                <label className="field-label">
                  <span className="flex items-center justify-between">
                    Mật khẩu
                    <button type="button" onClick={() => setView("forgot", loginForm.email)} className="text-xs font-medium text-primary hover:underline">Quên mật khẩu?</button>
                  </span>
                  <span className="relative mt-1 block">
                    <input type={loginShowPassword ? "text" : "password"} required value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} className="field-input pr-16" placeholder="••••••••" />
                    <button type="button" onClick={() => setLoginShowPassword((v) => !v)} className="absolute inset-y-0 right-3 text-xs font-semibold text-neutral-400 hover:text-ink">{loginShowPassword ? "Ẩn" : "Hiện"}</button>
                  </span>
                </label>
                <button type="submit" disabled={loginBusy || !loginForm.email || !loginForm.password} className="btn btn-primary w-full">{loginBusy ? "Đang đăng nhập..." : "Đăng nhập ngay"}</button>
              </form>
              <p className="mt-6 border-t border-line/70 pt-5 text-center text-xs text-neutral-500">
                Chưa có tài khoản?{" "}
                <button type="button" onClick={() => setView("register")} className="font-bold text-primary hover:underline">Đăng ký tài khoản mới</button>
              </p>
            </>
          )}

          {view === "register" && (
            <>
              <p className="text-sm text-neutral-500">Đăng ký để nhận ưu đãi thành viên &amp; đặt homestay nhanh chóng.</p>
              {regError && <p className="mt-4 rounded-2xl border border-rose/30 bg-rose/10 p-3.5 text-xs text-rose-dark">{regError}</p>}
              <form onSubmit={handleRegister} className="mt-5 space-y-4">
                <label className="field-label">Họ và tên
                  <input type="text" required autoFocus value={fullName} onChange={(e) => setFullName(e.target.value)} className="field-input mt-1" placeholder="Nguyễn Văn A" autoComplete="name" />
                </label>
                <label className="field-label">Địa chỉ Email
                  <input type="email" required value={regEmail} onChange={(e) => setRegEmail(e.target.value)} className="field-input mt-1" placeholder="name@example.com" autoComplete="email" />
                </label>
                <label className="field-label">Số điện thoại <span className="font-normal text-neutral-400">(Tùy chọn)</span>
                  <div className="phone-input-wrapper mt-1">
                    <PhoneInput international defaultCountry="VN" value={regPhone} onChange={setRegPhone} placeholder="Nhập số điện thoại" />
                  </div>
                </label>
                <label className="field-label">Mật khẩu <span className="font-normal text-neutral-400">(Tối thiểu 6 ký tự)</span>
                  <span className="relative mt-1 block">
                    <input type={regShowPassword ? "text" : "password"} required minLength={6} value={regPassword} onChange={(e) => setRegPassword(e.target.value)} className="field-input pr-16" placeholder="••••••••" autoComplete="new-password" />
                    <button type="button" onClick={() => setRegShowPassword((v) => !v)} className="absolute inset-y-0 right-3 text-xs font-semibold text-neutral-400 hover:text-ink">{regShowPassword ? "Ẩn" : "Hiện"}</button>
                  </span>
                </label>
                <label className="field-label">Xác nhận lại mật khẩu
                  <span className="relative mt-1 block">
                    <input type={regShowConfirm ? "text" : "password"} required minLength={6} value={regConfirm} onChange={(e) => setRegConfirm(e.target.value)} className="field-input pr-16" placeholder="••••••••" autoComplete="new-password" />
                    <button type="button" onClick={() => setRegShowConfirm((v) => !v)} className="absolute inset-y-0 right-3 text-xs font-semibold text-neutral-400 hover:text-ink">{regShowConfirm ? "Ẩn" : "Hiện"}</button>
                  </span>
                </label>
                <button type="submit" disabled={regBusy || !fullName || !regEmail || !regPassword || !regConfirm} className="btn btn-primary w-full">{regBusy ? "Đang tạo tài khoản..." : "Đăng ký & Nhận mã xác thực"}</button>
              </form>
              <p className="mt-6 border-t border-line/70 pt-5 text-center text-xs text-neutral-500">
                Đã có tài khoản ForestView?{" "}
                <button type="button" onClick={() => setView("login")} className="font-bold text-primary hover:underline">Đăng nhập ngay</button>
              </p>
            </>
          )}

          {view === "otp" && (
            <>
              <p className="text-sm text-neutral-500">
                Mã gồm <b>6 chữ số</b> đã được gửi tới <span className="font-semibold text-ink">{modalEmail || "email của bạn"}</span>. Mã có hiệu lực trong <b>10 phút</b>.
              </p>
              {otpError && <p className="mt-4 rounded-2xl border border-rose/30 bg-rose/10 p-3.5 text-xs text-rose-dark">{otpError}</p>}
              {otpMessage && <p className="mt-4 rounded-2xl border border-primary/20 bg-primary/10 p-3.5 text-xs text-primary">{otpMessage}</p>}
              <form onSubmit={handleVerifyOtp} className="mt-6">
                <OtpBoxes digits={otpDigits} onChange={setOtpDigits} hasError={!!otpError} />
                <button type="submit" disabled={otpBusy || otpDigits.join("").length !== 6} className="btn btn-primary mt-6 w-full">{otpBusy ? "Đang xác thực..." : "Xác thực & Hoàn tất đăng ký"}</button>
              </form>
              <div className="mt-5 flex flex-col items-center gap-2 border-t border-line/70 pt-4 text-center">
                <p className="text-xs text-neutral-500">Chưa nhận được mã?</p>
                <button type="button" onClick={handleResendOtp} disabled={otpResending || otpCooldown > 0} className="text-xs font-semibold text-primary hover:underline disabled:opacity-50">
                  {otpResending ? "Đang gửi lại..." : otpCooldown > 0 ? `Gửi lại sau ${otpCooldown}s` : "Gửi lại mã OTP"}
                </button>
              </div>
              <div className="mt-3 text-center">
                <button type="button" onClick={handleSkipOtp} disabled={otpSkipping} className="text-xs text-neutral-400 hover:text-neutral-600 disabled:opacity-50">
                  {otpSkipping ? "Đang xử lý..." : "Bỏ qua lúc này (sẽ không thể đặt phòng)"}
                </button>
              </div>
            </>
          )}

          {view === "forgot" && (
            <>
              {forgotStep === "done" && (
                <div className="flex flex-col items-center py-4 text-center">
                  <h3 className="font-display text-2xl text-ink">Đặt lại mật khẩu thành công!</h3>
                  <p className="mt-2 text-sm text-neutral-500">Mật khẩu của bạn đã được cập nhật. Bạn có thể đăng nhập ngay bây giờ.</p>
                  <button type="button" onClick={() => setView("login")} className="btn btn-primary mt-6">Đăng nhập ngay</button>
                </div>
              )}

              {forgotStep === "email" && (
                <>
                  <p className="text-sm text-neutral-500">Nhập email đã đăng ký — chúng tôi sẽ gửi mã OTP để đặt lại mật khẩu.</p>
                  {forgotError && <p className="mt-4 rounded-2xl border border-rose/30 bg-rose/10 p-3.5 text-xs text-rose-dark">{forgotError}</p>}
                  <form onSubmit={requestForgotOtp} className="mt-5 space-y-4">
                    <label className="field-label">Địa chỉ Email
                      <input type="email" required autoFocus value={forgotEmail} onChange={(e) => { setForgotEmail(e.target.value); setForgotError(""); }} className="field-input mt-1" placeholder="name@example.com" />
                    </label>
                    <button type="submit" disabled={forgotBusy || !forgotEmail} className="btn btn-primary w-full">{forgotBusy ? "Đang gửi mã..." : "Gửi mã xác thực OTP"}</button>
                  </form>
                  <p className="mt-6 border-t border-line/70 pt-5 text-center text-xs text-neutral-500">
                    <button type="button" onClick={() => setView("login")} className="font-bold text-primary hover:underline">Quay lại đăng nhập</button>
                  </p>
                </>
              )}

              {forgotStep === "otp" && (
                <>
                  <p className="text-sm text-neutral-500">Mã OTP đã gửi tới <span className="font-semibold text-ink">{forgotEmail}</span></p>
                  {forgotError && <p className="mt-4 rounded-2xl border border-rose/30 bg-rose/10 p-3.5 text-xs text-rose-dark">{forgotError}</p>}
                  {forgotMessage && <p className="mt-4 rounded-2xl border border-primary/20 bg-primary/10 p-3.5 text-xs text-primary">{forgotMessage}</p>}
                  <form onSubmit={submitResetPassword} className="mt-5 space-y-4">
                    <label className="field-label">Mã OTP (6 chữ số)
                      <div className="mt-2"><OtpBoxes digits={forgotDigits} onChange={setForgotDigits} hasError={!!forgotError} /></div>
                    </label>
                    <label className="field-label">Mật khẩu mới
                      <span className="relative mt-1 block">
                        <input type={forgotShowPassword ? "text" : "password"} required minLength={6} value={forgotPassword} onChange={(e) => { setForgotPassword(e.target.value); setForgotError(""); }} className="field-input pr-16" placeholder="Tối thiểu 6 ký tự" />
                        <button type="button" onClick={() => setForgotShowPassword((v) => !v)} className="absolute inset-y-0 right-3 text-xs font-semibold text-neutral-400 hover:text-ink">{forgotShowPassword ? "Ẩn" : "Hiện"}</button>
                      </span>
                    </label>
                    <label className="field-label">Xác nhận mật khẩu mới
                      <span className="relative mt-1 block">
                        <input type={forgotShowConfirm ? "text" : "password"} required minLength={6} value={forgotConfirm} onChange={(e) => { setForgotConfirm(e.target.value); setForgotError(""); }} className="field-input pr-16" placeholder="Nhập lại mật khẩu mới" />
                        <button type="button" onClick={() => setForgotShowConfirm((v) => !v)} className="absolute inset-y-0 right-3 text-xs font-semibold text-neutral-400 hover:text-ink">{forgotShowConfirm ? "Ẩn" : "Hiện"}</button>
                      </span>
                    </label>
                    <button type="submit" disabled={forgotBusy || forgotDigits.join("").length !== 6 || !forgotPassword || !forgotConfirm} className="btn btn-primary w-full">{forgotBusy ? "Đang cập nhật..." : "Đặt lại mật khẩu"}</button>
                  </form>
                  <div className="mt-5 flex flex-col items-center gap-2 border-t border-line/70 pt-4 text-center">
                    <button type="button" onClick={resendForgotOtp} disabled={forgotBusy || forgotCooldown > 0} className="text-xs font-semibold text-primary hover:underline disabled:opacity-50">
                      {forgotCooldown > 0 ? `Gửi lại mã sau ${forgotCooldown}s` : "Gửi lại mã OTP"}
                    </button>
                    <button type="button" onClick={() => { setForgotStep("email"); setForgotError(""); setForgotMessage(""); }} className="text-xs text-neutral-400 hover:text-neutral-600">Thay đổi email</button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
  );
}
