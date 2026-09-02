"use client";

import { useEffect, useState } from "react";
import { discountService } from "@/lib/services/discountService";
import { DiscountCode } from "@/types";
import { getErrorMessage } from "@/lib/getErrorMessage";
import CalendarDatePicker from "@/components/CalendarDatePicker";

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("vi-VN");
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
    <div>
      <h1 className="font-display text-2xl text-ink">Mã giảm giá</h1>
      <p className="mt-2 text-sm text-neutral-500">
        Mã giảm giá được áp dụng trên giá gốc trước, sau đó ưu đãi hạng thành viên mới được tính tiếp
        trên phần đã giảm. Khi phát hành, email thông báo sẽ tự động gửi tới toàn bộ khách hàng.
      </p>

      <form
        onSubmit={handleCreate}
        className="mt-6 grid gap-3 rounded-2xl border border-line bg-surface p-5 sm:grid-cols-2"
      >
        <div>
          <label className="text-sm text-neutral-600">Mã giảm giá</label>
          <input
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="VD: FORESTVIEW10"
            className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm uppercase focus:border-primary focus:outline-none"
          />
        </div>

        <div>
          <label className="text-sm text-neutral-600">Phần trăm giảm (%)</label>
          <input
            required
            type="number"
            min={1}
            max={100}
            value={percent}
            onChange={(e) => setPercent(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="text-sm text-neutral-600">Mô tả (tùy chọn)</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="VD: Ưu đãi mừng năm mới"
            className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </div>

        <div>
          <label className="text-sm text-neutral-600">Bắt đầu sử dụng</label>
          <div className="mt-1 grid grid-cols-[1fr_110px] gap-2"><CalendarDatePicker value={startAt.split("T")[0] ?? ""} onChange={(date) => setStartAt(`${date}T${startAt.split("T")[1] || "00:00"}`)} /><input required type="time" value={startAt.split("T")[1] ?? ""} onChange={(e) => setStartAt(`${startAt.split("T")[0] || new Date().toISOString().slice(0, 10)}T${e.target.value}`)} className="rounded-xl border border-line px-3 py-2 text-sm focus:border-primary focus:outline-none" /></div>
        </div>

        <div>
          <label className="text-sm text-neutral-600">Hết hạn</label>
          <div className="mt-1 grid grid-cols-[1fr_110px] gap-2"><CalendarDatePicker value={endAt.split("T")[0] ?? ""} onChange={(date) => setEndAt(`${date}T${endAt.split("T")[1] || "23:59"}`)} /><input required type="time" value={endAt.split("T")[1] ?? ""} onChange={(e) => setEndAt(`${endAt.split("T")[0] || new Date().toISOString().slice(0, 10)}T${e.target.value}`)} className="rounded-xl border border-line px-3 py-2 text-sm focus:border-primary focus:outline-none" /></div>
        </div>

        <div className="sm:col-span-2">
          <button
            disabled={submitting}
            className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-50"
          >
            {submitting ? "Đang tạo..." : "Tạo mã & gửi email cho khách hàng"}
          </button>
        </div>
      </form>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      {success && <p className="mt-3 text-sm text-primary">{success}</p>}

      <div className="mt-6 overflow-x-auto rounded-2xl border border-line">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 text-neutral-500">
            <tr>
              <th className="px-4 py-3">Mã</th>
              <th className="px-4 py-3">Giảm</th>
              <th className="px-4 py-3">Bắt đầu</th>
              <th className="px-4 py-3">Hết hạn</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {items.map((d) => (
              <tr key={d.id}>
                <td className="px-4 py-3 font-medium text-ink">{d.code}</td>
                <td className="px-4 py-3">{d.percent}%</td>
                <td className="px-4 py-3 text-neutral-600">{formatDateTime(d.startAt)}</td>
                <td className="px-4 py-3 text-neutral-600">{formatDateTime(d.endAt)}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleToggle(d.id)}
                    disabled={busyId === d.id}
                    className={`rounded-full px-3 py-1 text-xs font-medium disabled:opacity-50 ${
                      d.active ? "bg-primary/10 text-primary" : "bg-neutral-100 text-neutral-500"
                    }`}
                  >
                    {d.active ? "Đang bật" : "Đã tắt"}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleDelete(d.id)}
                    disabled={busyId === d.id}
                    className="text-red-600 hover:text-red-800 disabled:opacity-50"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <p className="p-4 text-sm text-neutral-500">Đang tải...</p>}
        {!loading && items.length === 0 && (
          <p className="p-4 text-sm text-neutral-500">Chưa có mã giảm giá nào.</p>
        )}
      </div>
    </div>
  );
}
