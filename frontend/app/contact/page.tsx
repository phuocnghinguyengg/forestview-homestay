"use client";

import { useState } from "react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <main className="mx-auto max-w-2xl px-5 py-16">
      <p className="font-display text-sm italic text-accent">Chúng tôi luôn lắng nghe</p>
      <h1 className="mt-1 font-display text-3xl text-ink">Liên hệ với ForestView</h1>
<p className="mt-2 text-neutral-600">
  Có thắc mắc về phòng nghỉ hoặc muốn đặt lịch trực tiếp với chúng tôi? Gửi tin nhắn ngay bên dưới.
</p>

      <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2">
        <div className="space-y-3 text-sm text-neutral-600">
          <p><span className="font-medium text-ink">Địa chỉ:</span> Đà Lạt, Lâm Đồng</p>
          <p><span className="font-medium text-ink">Email:</span> hello@forestview.vn</p>
          <p><span className="font-medium text-ink">Điện thoại:</span> 0900 000 000</p>
          <p><span className="font-medium text-ink">Giờ hỗ trợ:</span> 8:00 – 21:00 mỗi ngày</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            required
            placeholder="Họ tên"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-lg border border-line px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
          />
          <input
            required
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full rounded-lg border border-line px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
          />
          <textarea
            required
            placeholder="Nội dung"
            rows={4}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            className="w-full rounded-lg border border-line px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
          />
          <button
            type="submit"
            className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-white transition hover:bg-primary-dark"
          >
            Gửi liên hệ
          </button>
          {sent && <p className="text-sm text-primary">Cảm ơn bạn! Chúng tôi sẽ phản hồi sớm nhất.</p>}
        </form>
      </div>
    </main>
  );
}