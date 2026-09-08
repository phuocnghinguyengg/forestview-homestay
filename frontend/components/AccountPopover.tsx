"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { LogOut, Settings2, ShieldCheck, UserRound, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/hooks/useAuthStore";

function displayName(fullName?: string) {
  const words = fullName?.trim().split(/\s+/).filter(Boolean) ?? [];
  return words.length > 2 ? words.slice(-2).join(" ") : words.join(" ");
}

export default function AccountPopover({ compact = false }: { compact?: boolean }) {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    setOpen(false);
    router.push("/");
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={`${compact ? "h-10 w-10" : "flex h-10 items-center gap-2 px-2.5"} rounded-full border border-line bg-surface text-ink transition hover:border-primary hover:text-primary`}
        aria-label="Mở bảng điều khiển tài khoản"
      >
        <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-primary">
          {user.avatarUrl ? <Image src={user.avatarUrl} alt="" width={32} height={32} unoptimized className="h-full w-full object-cover" /> : <UserRound size={16} />}
        </span>
        {!compact && <span className="hidden max-w-32 truncate text-sm font-semibold sm:block">{displayName(user.fullName)}</span>}
      </button>

      {open && (
        <>
          <button type="button" aria-label="Đóng bảng điều khiển tài khoản" onClick={() => setOpen(false)} className="fixed inset-0 z-40 cursor-default bg-ink/25 backdrop-blur-sm" />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div role="dialog" aria-modal="true" aria-label="Bảng điều khiển tài khoản" className="w-full max-w-md overflow-hidden rounded-3xl border border-line bg-surface shadow-2xl">
            <div className="flex items-start justify-between bg-ink px-5 py-6 text-white sm:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white/10 font-display text-lg font-bold">
                  {user.avatarUrl ? <Image src={user.avatarUrl} alt="" width={44} height={44} unoptimized className="h-full w-full object-cover" /> : user.fullName.charAt(0).toUpperCase()}
                </span>
                <span className="min-w-0"><span className="block truncate font-display text-xl">{displayName(user.fullName)}</span><span className="mt-0.5 block truncate text-xs text-white/55">{user.email}</span></span>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="rounded-full p-1 text-white/60 hover:bg-white/10 hover:text-white" aria-label="Đóng"><X size={16} /></button>
            </div>
            <div className="space-y-1 p-3 sm:p-4">
              <p className="px-3 pb-2 text-[11px] font-bold tracking-[0.16em] text-neutral-400 uppercase">Điều hướng nhanh</p>
              <Link href="/account" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-2xl px-3 py-3.5 text-sm font-semibold text-ink transition hover:bg-canvas hover:text-primary"><Settings2 size={17} /> <span>Tài khoản của tôi<small className="mt-0.5 block text-xs font-normal text-neutral-500">Thông tin và bảo mật</small></span></Link>
              <Link href="/dashboard" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-2xl px-3 py-3.5 text-sm font-semibold text-ink transition hover:bg-canvas hover:text-primary"><UserRound size={17} /> <span>Lịch sử đặt phòng<small className="mt-0.5 block text-xs font-normal text-neutral-500">Theo dõi booking và đánh giá</small></span></Link>
              {user.role === "ADMIN" && <Link href="/admin" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-2xl px-3 py-3.5 text-sm font-semibold text-ink transition hover:bg-canvas hover:text-primary"><ShieldCheck size={17} /> <span>Không gian quản trị<small className="mt-0.5 block text-xs font-normal text-neutral-500">Vận hành ForestView</small></span></Link>}
              <div className="my-1 border-t border-line" />
              <button type="button" onClick={handleLogout} className="flex w-full items-center gap-3 rounded-2xl px-3 py-3.5 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"><LogOut size={17} /> Đăng xuất</button>
            </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
