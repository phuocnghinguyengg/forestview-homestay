"use client";

import { useEffect, useState } from "react";
import { discountService } from "@/lib/services/discountService";
import { DiscountCode } from "@/types";
import { getErrorMessage } from "@/lib/getErrorMessage";
import CalendarDatePicker from "@/components/CalendarDatePicker";
import { Plus, Tag, Trash2 } from "lucide-react";

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminDiscountCodesPage() {
  const [items, setItems] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  const [code, setCode] = useState("");
  const [percent, setPercent] = useState(10);
  const [description, setDescription] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    discountService
      .getAllAdmin()
      .then(setItems)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!code.trim() || !startAt || !endAt) {
      setError("Vui lòng nhập đầy đủ mã, thời gian bắt đầu và kết thúc");
      return;
    }
    if (endAt <= startAt) {
      setError("Thời gian kết thúc phải sau thời gian bắt đầu");
      return;
    }

    setSubmitting(true);
    try {
      await discountService.create({
        code: code.trim().toUpperCase(),
        percent,
        description: description.trim() || undefined,
        startAt,
        endAt,
      });
      setCode("");
      setPercent(10);
      setDescription("");
      setStartAt("");
      setEndAt("");
      setSuccess("Đã tạo mã giảm giá và gửi email thông báo tới toàn bộ khách hàng.");
      load();
    } catch (err) {
      setError(getErrorMessage(err, "Không thể tạo mã giảm giá"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id: number) => {
    setBusyId(id);
    try {
      await discountService.toggleActive(id);
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Xóa mã giảm giá này?")) return;
    setBusyId(id);
    try {
      await discountService.remove(id);
      load();
    } catch (err) {
      setError(getErrorMessage(err, "Không thể xóa mã giảm giá"));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-ink">Mã ưu đãi &amp; Giảm giá</h1>
        <p className="mt-1 text-xs text-neutral-500">
          Mã giảm giá được áp dụng trên giá gốc trước, sau đó ưu đãi hạng thành viên mới được tính tiếp. Khi phát hành, email thông báo sẽ tự động gửi tới toàn bộ khách hàng.
        </p>
      </div>

      {/* Create form */}
      <form
        onSubmit={handleCreate}
        className="grid gap-3 rounded-2xl border border-line bg-surface p-4 sm:grid-cols-2 sm:p-5"
      >
        <div>
          <label className="text-xs font-medium text-neutral-600">Mã giảm giá *</label>
          <input
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="VD: FORESTVIEW10"
            className="mt-1 w-full rounded-xl border border-line bg-base/50 px-3 py-2 text-sm uppercase focus:border-primary focus:outline-none"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-neutral-600">Phần trăm giảm (%) *</label>
          <div className="relative mt-1">
            <input
              required
              type="number"
              min={1}
              max={100}
              value={percent}
              onChange={(e) => setPercent(Number(e.target.value))}
              className="w-full rounded-xl border border-line bg-base/50 px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
            <span className="absolute top-1/2 right-3 -translate-y-1/2 text-xs font-bold text-neutral-400">
              %
            </span>
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className="text-xs font-medium text-neutral-600">Mô tả (tùy chọn)</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="VD: Ưu đãi mừng năm mới giữa rừng thông"
            className="mt-1 w-full rounded-xl border border-line bg-base/50 px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-neutral-600">Bắt đầu sử dụng *</label>
          <div className="mt-1 grid grid-cols-[1fr_100px] gap-2">
            <CalendarDatePicker
              value={startAt.split("T")[0] ?? ""}
              onChange={(date) => setStartAt(`${date}T${startAt.split("T")[1] || "00:00"}`)}
              label="Chọn ngày bắt đầu"
            />
            <input
              required
              type="time"
              value={startAt.split("T")[1] ?? "00:00"}
              onChange={(e) =>
                setStartAt(`${startAt.split("T")[0] || new Date().toISOString().slice(0, 10)}T${e.target.value}`)
              }
              className="rounded-xl border border-line bg-base/50 px-2 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-neutral-600">Hết hạn sử dụng *</label>
          <div className="mt-1 grid grid-cols-[1fr_100px] gap-2">
            <CalendarDatePicker
              value={endAt.split("T")[0] ?? ""}
              onChange={(date) => setEndAt(`${date}T${endAt.split("T")[1] || "23:59"}`)}
              label="Chọn ngày hết hạn"
            />
            <input
              required
              type="time"
              value={endAt.split("T")[1] ?? "23:59"}
              onChange={(e) =>
                setEndAt(`${endAt.split("T")[0] || new Date().toISOString().slice(0, 10)}T${e.target.value}`)
              }
              className="rounded-xl border border-line bg-base/50 px-2 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        <div className="sm:col-span-2">
          <button
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark disabled:opacity-50"
          >
            <Plus size={16} />
            {submitting ? "Đang tạo & gửi email..." : "Tạo mã & gửi email cho khách hàng"}
          </button>
        </div>
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-primary">{success}</p>}

      {/* List discount codes - No horizontal scroll! */}
      <div className="space-y-3">
        <h2 className="font-display text-lg text-ink">Danh sách mã ưu đãi ({items.length})</h2>

        {loading && (
          <div className="flex items-center justify-center py-12 text-sm text-neutral-500">
            <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-line border-t-primary" />
            Đang tải mã giảm giá...
          </div>
        )}

        {items.map((d) => (
          <div
            key={d.id}
            className={`flex flex-col gap-3 rounded-2xl border p-4 transition sm:flex-row sm:items-center sm:justify-between ${
              d.active ? "border-line bg-surface hover:border-primary/40" : "border-dashed border-neutral-300 bg-neutral-50 opacity-70"
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent/10 font-bold text-accent">
                <Tag size={20} />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-base font-bold tracking-wider text-ink">{d.code}</span>
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                    -{d.percent}%
                  </span>
                  {d.description && <span className="text-xs text-neutral-500">· {d.description}</span>}
                </div>
                <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500">
                  <span>Bắt đầu: <b className="text-neutral-700">{formatDateTime(d.startAt)}</b></span>
                  <span>Hết hạn: <b className="text-neutral-700">{formatDateTime(d.endAt)}</b></span>
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center justify-end gap-2 border-t border-line/60 pt-2 sm:w-44 sm:border-t-0 sm:pt-0">
              <button
                type="button"
                onClick={() => handleToggle(d.id)}
                disabled={busyId === d.id}
                className={`rounded-xl px-3 py-1.5 text-xs font-medium transition disabled:opacity-50 ${
                  d.active ? "bg-primary/10 text-primary hover:bg-primary/20" : "bg-neutral-200 text-neutral-600 hover:bg-neutral-300"
                }`}
              >
                {d.active ? "Đang bật" : "Đã tắt"}
              </button>

              <button
                type="button"
                onClick={() => handleDelete(d.id)}
                disabled={busyId === d.id}
                className="rounded-xl p-1.5 text-neutral-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                title="Xóa mã"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}

        {!loading && items.length === 0 && (
          <div className="rounded-2xl border border-line bg-surface p-8 text-center text-sm text-neutral-500">
            Chưa có mã giảm giá nào.
          </div>
        )}
      </div>
    </div>
  );
}

