"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { Eye, EyeOff, X } from "lucide-react";

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
          ref={(el) => {
            inputRefs.current[idx] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          autoFocus={idx === 0}
          onChange={(e) => handleDigitChange(idx, e.target.value)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          onPaste={idx === 0 ? handlePaste : undefined}
          className={`h-12 w-10 rounded-none border-2 bg-canvas text-center text-lg font-bold text-ink transition focus:bg-surface focus:outline-none sm:h-13 sm:w-11 sm:text-xl ${
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
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md overflow-hidden rounded-none border border-line bg-surface p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200"
      >
        {/* Close button */}
        <button
          type="button"
          onClick={close}
          aria-label="Đóng"
          className="absolute top-5 right-5 rounded-full border border-line p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-ink cursor-pointer"
        >
          <X size={18} />
        </button>

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
    </div>,
    document.body
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
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginShowPassword, setLoginShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);

  // ---- Register form ----
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
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
        email: loginIdentifier.trim(),
        password: loginPassword,
      });
      login(res.accessToken, res.refreshToken, {
        id: res.id,
        fullName: res.fullName,
        username: res.username,
        email: res.email,
        phone: res.phone,
        avatarUrl: res.avatarUrl,
        role: res.role,
        emailVerified: res.emailVerified,
        membershipTier: res.membershipTier,
      });
      afterAuth(res.role);
    } catch (err) {
      setLoginError(getErrorMessage(err, "Tên đăng nhập/email hoặc mật khẩu không đúng"));
    } finally {
      setLoginBusy(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");

    const normalizedEmail = regEmail.trim().toLowerCase();
    const normalizedName = fullName.trim();
    const normalizedUsername = username.trim().toLowerCase();

    if (normalizedName.length < 2) return setRegError("Họ và tên phải có ít nhất 2 ký tự");
    if (normalizedUsername && !/^[a-zA-Z0-9_.-]{3,30}$/.test(normalizedUsername)) {
      return setRegError("Tên đăng nhập từ 3-30 ký tự (chữ cái, số, gạch dưới, gạch ngang, chấm)");
    }
    if (!normalizedEmail) return setRegError("Vui lòng nhập email hợp lệ");
    if (regPhone && !isValidPhoneNumber(regPhone)) return setRegError("Số điện thoại không hợp lệ");
    if (regPassword.length < 6) return setRegError("Mật khẩu phải có ít nhất 6 ký tự");
    if (regPassword !== regConfirm) return setRegError("Mật khẩu xác nhận không khớp với mật khẩu");

    setRegBusy(true);
    try {
      const res = await authService.register({
        fullName: normalizedName,
        username: normalizedUsername || undefined,
        email: normalizedEmail,
        password: regPassword,
        phone: regPhone,
      });
      setView("otp", res.email);
    } catch (err) {
      setRegError(getErrorMessage(err, "Đăng ký không thành công"));
    } finally {
      setRegBusy(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError("");
    const otp = otpDigits.join("");
    if (otp.length !== 6) return setOtpError("Vui lòng nhập đủ 6 chữ số mã OTP");

    setOtpBusy(true);
    try {
      const res = await authService.verifyOtp({ email: modalEmail, otp });
      login(res.accessToken, res.refreshToken, {
        id: res.id,
        fullName: res.fullName,
        username: res.username,
        email: res.email,
        phone: res.phone,
        avatarUrl: res.avatarUrl,
        role: res.role,
        emailVerified: res.emailVerified,
        membershipTier: res.membershipTier,
      });
      afterAuth(res.role);
    } catch (err) {
      setOtpError(getErrorMessage(err, "Mã OTP không đúng hoặc đã hết hạn"));
    } finally {
      setOtpBusy(false);
    }
  };

  const handleResendOtp = async () => {
    if (otpCooldown > 0) return;
    setOtpError("");
    setOtpMessage("");
    setOtpResending(true);
    try {
      await authService.resendOtp({ email: modalEmail });
      setOtpMessage("Đã gửi mã OTP mới tới email của bạn.");
      runCooldown(setOtpCooldown);
    } catch (err) {
      setOtpError(getErrorMessage(err, "Không thể gửi lại mã OTP"));
    } finally {
      setOtpResending(false);
    }
  };

  const handleSkipOtp = async () => {
    setOtpError("");
    setOtpSkipping(true);
    try {
      const res = await authService.skipOtp({ email: modalEmail });
      login(res.accessToken, res.refreshToken, {
        id: res.id,
        fullName: res.fullName,
        username: res.username,
        email: res.email,
        phone: res.phone,
        avatarUrl: res.avatarUrl,
        role: res.role,
        emailVerified: res.emailVerified,
        membershipTier: res.membershipTier,
      });
      afterAuth(res.role);
    } catch (err) {
      setOtpError(getErrorMessage(err, "Không thể bỏ qua xác thực lúc này"));
    } finally {
      setOtpSkipping(false);
    }
  };

  const handleRequestPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");
    setForgotMessage("");
    setForgotBusy(true);
    try {
      await authService.requestPasswordReset({ email: forgotEmail.trim().toLowerCase() });
      setForgotMessage("Mã xác thực đã được gửi tới email của bạn.");
      setForgotStep("otp");
      runCooldown(setForgotCooldown);
    } catch (err) {
      setForgotError(getErrorMessage(err, "Không thể gửi mã đặt lại mật khẩu"));
    } finally {
      setForgotBusy(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");
    setForgotMessage("");
    const otp = forgotDigits.join("");
    if (otp.length !== 6) return setForgotError("Vui lòng nhập đủ 6 chữ số mã OTP");
    if (forgotPassword.length < 6) return setForgotError("Mật khẩu mới phải có ít nhất 6 ký tự");
    if (forgotPassword !== forgotConfirm) return setForgotError("Mật khẩu xác nhận không khớp");

    setForgotBusy(true);
    try {
      await authService.resetPassword({
        email: forgotEmail.trim().toLowerCase(),
        otp,
        newPassword: forgotPassword,
      });
      setForgotStep("done");
    } catch (err) {
      setForgotError(getErrorMessage(err, "Đặt lại mật khẩu thất bại"));
    } finally {
      setForgotBusy(false);
    }
  };

  // ================= VIEW: LOGIN =================
  if (view === "login") {
    return (
      <div>
        <div className="text-center">
          <p className="text-[11px] font-bold tracking-[0.16em] text-primary uppercase">ForestView Homestay</p>
          <h2 className="mt-1 font-display text-2xl font-bold text-ink">Đăng nhập</h2>
          <p className="mt-1 text-xs text-neutral-500">Chào mừng bạn quay trở lại với kỳ nghỉ bình yên</p>
        </div>

        {loginError && (
          <div className="mt-4 rounded-none border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs text-rose-700">
            {loginError}
          </div>
        )}

        <form onSubmit={handleLogin} className="mt-5 space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Tên đăng nhập hoặc Email</label>
            <input
              type="text"
              required
              autoFocus
              placeholder="Nhập tên đăng nhập hoặc email..."
              value={loginIdentifier}
              onChange={(e) => setLoginIdentifier(e.target.value)}
              className="w-full rounded-none border border-line bg-canvas/40 px-3.5 py-2.5 text-xs font-medium text-ink focus:border-primary focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-neutral-700">Mật khẩu</label>
              <button
                type="button"
                onClick={() => setView("forgot", loginIdentifier.includes("@") ? loginIdentifier : "")}
                className="text-[11px] font-semibold text-accent hover:underline cursor-pointer"
              >
                Quên mật khẩu?
              </button>
            </div>
            <div className="relative">
              <input
                type={loginShowPassword ? "text" : "password"}
                required
                placeholder="Nhập mật khẩu..."
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full rounded-none border border-line bg-canvas/40 px-3.5 py-2.5 pr-10 text-xs font-medium text-ink focus:border-primary focus:bg-white focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setLoginShowPassword(!loginShowPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                {loginShowPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loginBusy}
            className="w-full rounded-none bg-primary py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-primary-dark disabled:opacity-50 cursor-pointer mt-2"
          >
            {loginBusy ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <div className="mt-6 border-t border-line/70 pt-4 text-center text-xs text-neutral-500">
          Chưa có tài khoản?{" "}
          <button
            type="button"
            onClick={() => setView("register")}
            className="font-bold text-primary hover:underline cursor-pointer"
          >
            Đăng ký ngay
          </button>
        </div>
      </div>
    );
  }

  // ================= VIEW: REGISTER =================
  if (view === "register") {
    return (
      <div>
        <div className="text-center">
          <p className="text-[11px] font-bold tracking-[0.16em] text-primary uppercase">ForestView Homestay</p>
          <h2 className="mt-1 font-display text-2xl font-bold text-ink">Tạo tài khoản mới</h2>
          <p className="mt-1 text-xs text-neutral-500">Trở thành hội viên để nhận chiết khấu đến 20%</p>
        </div>

        {regError && (
          <div className="mt-3.5 rounded-none border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs text-rose-700">
            {regError}
          </div>
        )}

        <form onSubmit={handleRegister} className="mt-4 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Họ và tên *</label>
            <input
              type="text"
              required
              autoFocus
              placeholder="VD: Nguyễn Văn An"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-none border border-line bg-canvas/40 px-3.5 py-2 text-xs font-medium text-ink focus:border-primary focus:bg-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Tên đăng nhập <span className="font-normal text-neutral-400">(tùy chọn)</span>
              </label>
              <input
                type="text"
                placeholder="VD: vanan123"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-none border border-line bg-canvas/40 px-3.5 py-2 text-xs font-medium text-ink focus:border-primary focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Số điện thoại</label>
              <PhoneInput
                defaultCountry="VN"
                international
                placeholder="Số điện thoại"
                value={regPhone}
                onChange={setRegPhone}
                className="w-full rounded-none border border-line bg-canvas/40 px-3 py-1 text-xs focus-within:border-primary focus-within:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Email *</label>
            <input
              type="email"
              required
              placeholder="email@example.com"
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
              className="w-full rounded-none border border-line bg-canvas/40 px-3.5 py-2 text-xs font-medium text-ink focus:border-primary focus:bg-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Mật khẩu *</label>
              <div className="relative">
                <input
                  type={regShowPassword ? "text" : "password"}
                  required
                  placeholder="Tối thiểu 6 ký tự"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full rounded-none border border-line bg-canvas/40 px-3 py-2 pr-8 text-xs font-medium text-ink focus:border-primary focus:bg-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setRegShowPassword(!regShowPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400"
                >
                  {regShowPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Xác nhận MK *</label>
              <div className="relative">
                <input
                  type={regShowConfirm ? "text" : "password"}
                  required
                  placeholder="Nhập lại mật khẩu"
                  value={regConfirm}
                  onChange={(e) => setRegConfirm(e.target.value)}
                  className="w-full rounded-none border border-line bg-canvas/40 px-3 py-2 pr-8 text-xs font-medium text-ink focus:border-primary focus:bg-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setRegShowConfirm(!regShowConfirm)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400"
                >
                  {regShowConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={regBusy}
            className="w-full rounded-none bg-primary py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-primary-dark disabled:opacity-50 cursor-pointer mt-3"
          >
            {regBusy ? "Đang tạo tài khoản..." : "Đăng ký thành viên"}
          </button>
        </form>

        <div className="mt-4 border-t border-line/70 pt-3 text-center text-xs text-neutral-500">
          Đã có tài khoản?{" "}
          <button
            type="button"
            onClick={() => setView("login")}
            className="font-bold text-primary hover:underline cursor-pointer"
          >
            Đăng nhập ngay
          </button>
        </div>
      </div>
    );
  }

  // ================= VIEW: OTP =================
  if (view === "otp") {
    return (
      <div className="text-center">
        <p className="text-[11px] font-bold tracking-[0.16em] text-primary uppercase">Xác thực OTP</p>
        <h2 className="mt-1 font-display text-2xl font-bold text-ink">Kiểm tra email của bạn</h2>
        <p className="mt-1 text-xs text-neutral-500">
          Mã OTP 6 số đã được gửi tới <b>{modalEmail}</b>
        </p>

        {otpError && (
          <div className="mt-3 rounded-none border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
            {otpError}
          </div>
        )}
        {otpMessage && (
          <div className="mt-3 rounded-none border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
            {otpMessage}
          </div>
        )}

        <form onSubmit={handleVerifyOtp} className="mt-6 space-y-5">
          <OtpBoxes digits={otpDigits} onChange={setOtpDigits} hasError={Boolean(otpError)} />

          <button
            type="submit"
            disabled={otpBusy || otpDigits.join("").length !== 6}
            className="w-full rounded-none bg-primary py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-primary-dark disabled:opacity-50 cursor-pointer"
          >
            {otpBusy ? "Đang xác thực..." : "Xác thực & Đăng nhập"}
          </button>
        </form>

        <div className="mt-5 flex items-center justify-between text-xs text-neutral-500 border-t border-line/70 pt-3">
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={otpCooldown > 0 || otpResending}
            className="font-semibold text-primary hover:underline disabled:opacity-50 cursor-pointer"
          >
            {otpCooldown > 0 ? `Gửi lại mã (${otpCooldown}s)` : otpResending ? "Đang gửi..." : "Gửi lại OTP"}
          </button>

          <button
            type="button"
            onClick={handleSkipOtp}
            disabled={otpSkipping}
            className="text-neutral-400 hover:text-neutral-600 hover:underline cursor-pointer"
          >
            {otpSkipping ? "Đang bỏ qua..." : "Bỏ qua lúc này →"}
          </button>
        </div>
      </div>
    );
  }

  // ================= VIEW: FORGOT PASSWORD =================
  return (
    <div>
      <div className="text-center">
        <p className="text-[11px] font-bold tracking-[0.16em] text-primary uppercase">Khôi phục tài khoản</p>
        <h2 className="mt-1 font-display text-2xl font-bold text-ink">Quên mật khẩu</h2>
      </div>

      {forgotError && (
        <div className="mt-3 rounded-none border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
          {forgotError}
        </div>
      )}
      {forgotMessage && (
        <div className="mt-3 rounded-none border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
          {forgotMessage}
        </div>
      )}

      {forgotStep === "email" && (
        <form onSubmit={handleRequestPasswordReset} className="mt-5 space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Email tài khoản</label>
            <input
              type="email"
              required
              autoFocus
              placeholder="email@example.com"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              className="w-full rounded-none border border-line bg-canvas/40 px-3.5 py-2.5 text-xs font-medium text-ink focus:border-primary focus:bg-white focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={forgotBusy}
            className="w-full rounded-none bg-primary py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-primary-dark disabled:opacity-50 cursor-pointer"
          >
            {forgotBusy ? "Đang gửi mã..." : "Gửi mã xác thực"}
          </button>
        </form>
      )}

      {forgotStep === "otp" && (
        <form onSubmit={handleResetPassword} className="mt-5 space-y-4">
          <div>
            <label className="block text-center text-xs font-semibold text-neutral-600 mb-2">Nhập mã OTP 6 số</label>
            <OtpBoxes digits={forgotDigits} onChange={setForgotDigits} hasError={Boolean(forgotError)} />
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Mật khẩu mới</label>
              <div className="relative">
                <input
                  type={forgotShowPassword ? "text" : "password"}
                  required
                  placeholder="Tối thiểu 6 ký tự"
                  value={forgotPassword}
                  onChange={(e) => setForgotPassword(e.target.value)}
                  className="w-full rounded-none border border-line bg-canvas/40 px-3 py-2 pr-8 text-xs font-medium text-ink focus:border-primary focus:bg-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setForgotShowPassword(!forgotShowPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400"
                >
                  {forgotShowPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Xác nhận MK</label>
              <div className="relative">
                <input
                  type={forgotShowConfirm ? "text" : "password"}
                  required
                  placeholder="Nhập lại mật khẩu"
                  value={forgotConfirm}
                  onChange={(e) => setForgotConfirm(e.target.value)}
                  className="w-full rounded-none border border-line bg-canvas/40 px-3 py-2 pr-8 text-xs font-medium text-ink focus:border-primary focus:bg-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setForgotShowConfirm(!forgotShowConfirm)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400"
                >
                  {forgotShowConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={forgotBusy || forgotDigits.join("").length !== 6}
            className="w-full rounded-none bg-primary py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-primary-dark disabled:opacity-50 cursor-pointer"
          >
            {forgotBusy ? "Đang đổi mật khẩu..." : "Đặt lại mật khẩu"}
          </button>
        </form>
      )}

      {forgotStep === "done" && (
        <div className="mt-5 text-center space-y-4">
          <p className="text-xs text-neutral-600">Mật khẩu của bạn đã được đặt lại thành công!</p>
          <button
            type="button"
            onClick={() => setView("login")}
            className="w-full rounded-none bg-primary py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-primary-dark cursor-pointer"
          >
            Đăng nhập ngay
          </button>
        </div>
      )}

      <div className="mt-5 border-t border-line/70 pt-3 text-center text-xs text-neutral-500">
        <button
          type="button"
          onClick={() => setView("login")}
          className="font-bold text-primary hover:underline cursor-pointer"
        >
          ← Quay lại Đăng nhập
        </button>
      </div>
    </div>
  );
}
