"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { getErrorMessage } from "@/lib/getErrorMessage";
import CalendarDatePicker from "@/components/CalendarDatePicker";

interface Holiday {
  id: number;
  date: string;
  name: string;
}

export default function AdminHolidaysPage() {
  const [items, setItems] = useState<Holiday[]>([]);
  const [date, setDate] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    api
      .get<Holiday[]>("/admin/holidays")
      .then((r) => setItems(r.data))
      .catch((e) => setError(getErrorMessage(e)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !name.trim()) return;

    setBusy(true);
    setError("");
    try {
      await api.post("/admin/holidays", { date, name: name.trim() });
      setDate("");
      setName("");
      load();
    } catch (err) {
      setError(getErrorMessage(err, "Không thể thêm ngày lễ"));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm("Xóa ngày lễ này?")) return;
    try {
      await api.delete(`/admin/holidays/${id}`);
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl text-ink">Ngày lễ &amp; giá lễ</h1>
      <p className="mt-2 text-sm text-neutral-500">
        Các ngày lễ Việt Nam cố định được hệ thống tự động nhân ×2. Bạn có thể thêm ngày lễ riêng tại
        đây. Giá lễ của từng phòng được cấu hình trong Quản lý phòng.
      </p>

      <form
        onSubmit={add}
        className="mt-6 grid gap-3 rounded-2xl border border-line bg-surface p-5 sm:grid-cols-[1fr_1.5fr_auto]"
      >
        <CalendarDatePicker value={date} onChange={setDate} label="Chọn ngày lễ" />
        <input
          required
          placeholder="Tên ngày lễ"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-lg border border-line px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
        <button
          disabled={busy}
          className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {busy ? "Đang lưu..." : "Thêm ngày lễ"}
        </button>
      </form>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <div className="mt-6 overflow-x-auto rounded-2xl border border-line">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 text-neutral-500">
            <tr>
              <th className="px-4 py-3">Ngày</th>
              <th className="px-4 py-3">Tên</th>
              <th className="px-4 py-3 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {items.map((h) => (
              <tr key={h.id}>
                <td className="px-4 py-3">
                  {new Date(`${h.date}T00:00:00`).toLocaleDateString("vi-VN")}
                </td>
                <td className="px-4 py-3">{h.name}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => remove(h.id)} className="text-red-600 hover:text-red-800">
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <p className="p-4 text-sm text-neutral-500">Đang tải...</p>}
        {!loading && items.length === 0 && (
          <p className="p-4 text-sm text-neutral-500">Chưa có ngày lễ riêng.</p>
        )}
      </div>
    </div>
  );
}
