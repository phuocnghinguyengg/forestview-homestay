"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { getErrorMessage } from "@/lib/getErrorMessage";
import CalendarDatePicker from "@/components/CalendarDatePicker";
import { CalendarDays, Plus, Trash2 } from "lucide-react";

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
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-ink">Ngày lễ &amp; Giá lễ</h1>
        <p className="mt-1 text-xs text-neutral-500">
          Các ngày lễ Việt Nam cố định được hệ thống tự động nhân ×2. Bạn có thể thêm ngày lễ riêng tại đây. Giá lễ của từng phòng được cấu hình trong Quản lý phòng.
        </p>
      </div>

      <form
        onSubmit={add}
        className="grid gap-3 rounded-2xl border border-line bg-surface p-4 sm:grid-cols-[1.2fr_1.5fr_auto] sm:p-5"
      >
        <div>
          <label className="text-xs font-medium text-neutral-600">Ngày lễ *</label>
          <div className="mt-1">
            <CalendarDatePicker value={date} onChange={setDate} label="Chọn ngày lễ" />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-neutral-600">Tên dịp lễ *</label>
          <input
            required
            placeholder="VD: Lễ hội Hoa Đà Lạt"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-xl border border-line bg-base/50 px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </div>

        <div className="flex items-end">
          <button
            disabled={busy}
            className="inline-flex h-[38px] w-full items-center justify-center gap-1.5 rounded-full bg-primary px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark disabled:opacity-50 sm:w-auto"
          >
            <Plus size={16} />
            {busy ? "Đang lưu..." : "Thêm ngày lễ"}
          </button>
        </div>
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Holiday list - Responsive cards */}
      <div className="space-y-3">
        <h2 className="font-display text-lg text-ink">Danh sách ngày lễ đặc biệt ({items.length})</h2>

        {loading && (
          <div className="flex items-center justify-center py-12 text-sm text-neutral-500">
            <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-line border-t-primary" />
            Đang tải danh sách ngày lễ...
          </div>
        )}

        {items.map((h) => (
          <div
            key={h.id}
            className="flex items-center justify-between rounded-2xl border border-line bg-surface p-4 transition hover:border-primary/40"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <CalendarDays size={18} />
              </div>
              <div>
                <p className="font-semibold text-ink">{h.name}</p>
                <p className="text-xs text-neutral-500">
                  {new Date(`${h.date}T00:00:00`).toLocaleDateString("vi-VN", {
                    weekday: "long",
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            <button
              onClick={() => remove(h.id)}
              className="rounded-xl p-2 text-neutral-400 hover:bg-red-50 hover:text-red-600"
              title="Xóa ngày lễ"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}

        {!loading && items.length === 0 && (
          <div className="rounded-2xl border border-line bg-surface p-8 text-center text-sm text-neutral-500">
            Chưa có ngày lễ riêng. Hệ thống vẫn tự động áp dụng giá lễ theo quy định đại lễ VN.
          </div>
        )}
      </div>
    </div>
  );
}

