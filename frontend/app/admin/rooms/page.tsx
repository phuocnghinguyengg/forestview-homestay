"use client";

import { useEffect, useState } from "react";
import { roomService } from "@/lib/services/roomService";
import { Room } from "@/types";
import RoomFormModal, { RoomFormValues } from "@/components/RoomFormModal";
import { getErrorMessage } from "@/lib/getErrorMessage";

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
}

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);

  const loadRooms = () => {
    setLoading(true);
    roomService
      .getAllAdmin()
      .then(setRooms)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const openCreate = () => {
    setEditingRoom(undefined);
    setModalOpen(true);
  };

  const openEdit = (room: Room) => {
    setEditingRoom(room);
    setModalOpen(true);
  };

  const handleSubmit = async (values: RoomFormValues) => {
    setSubmitting(true);
    try {
      if (editingRoom) {
        await roomService.update(editingRoom.id, values);
      } else {
        await roomService.create(values);
      }
      setModalOpen(false);
      loadRooms();
    } catch (err) {
      alert(getErrorMessage(err, "Lưu phòng thất bại"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (id: number) => {
    try {
      await roomService.toggleActive(id);
      loadRooms();
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Xóa phòng này? Hành động không thể hoàn tác.")) return;
    try {
      await roomService.remove(id);
      loadRooms();
    } catch (err) {
      alert(getErrorMessage(err, "Không thể xóa phòng (có thể đang có đơn đặt liên quan)"));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-ink">Quản lý phòng</h1>
        <button
          onClick={openCreate}
          className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-dark"
        >
          + Thêm phòng
        </button>
      </div>

      {loading && <p className="mt-6 text-neutral-500">Đang tải...</p>}
      {error && <p className="mt-6 text-red-600">{error}</p>}

      <div className="mt-6 overflow-x-auto rounded-2xl border border-line">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 text-neutral-500">
            <tr>
              <th className="px-4 py-3">Tên phòng</th>
              <th className="px-4 py-3">Loại phòng</th>
              <th className="px-4 py-3">Giá/đêm</th>
              <th className="px-4 py-3">Cuối tuần</th>
              <th className="px-4 py-3">Ngày lễ</th>
              <th className="px-4 py-3">Khách tối đa</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rooms.map((room) => (
              <tr key={room.id}>
                <td className="px-4 py-3 font-medium text-ink">{room.name}</td>
                <td className="px-4 py-3 text-neutral-600">{room.typeLabel}</td>
                <td className="px-4 py-3">{formatPrice(room.pricePerNight)}</td>
                <td className="px-4 py-3">{room.weekendPrice ? formatPrice(room.weekendPrice) : "Mặc định"}</td>
                <td className="px-4 py-3">{room.holidayPrice ? formatPrice(room.holidayPrice) : "Tự động ×2"}</td>
                <td className="px-4 py-3">{room.maxGuests}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleToggleActive(room.id)}
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      room.active ? "bg-primary/10 text-primary" : "bg-neutral-100 text-neutral-500"
                    }`}
                  >
                    {room.active ? "Đang hoạt động" : "Đã ẩn"}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => openEdit(room)}
                    className="mr-3 text-neutral-600 transition hover:text-primary"
                  >
                    Sửa
                  </button>
                  <button onClick={() => handleDelete(room.id)} className="text-red-600 hover:text-red-800">
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <RoomFormModal
          initial={editingRoom}
          onClose={() => setModalOpen(false)}
          onSubmit={handleSubmit}
          submitting={submitting}
        />
      )}
    </div>
  );
}