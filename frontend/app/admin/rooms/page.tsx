"use client";

import { useEffect, useMemo, useState } from "react";
import { roomService } from "@/lib/services/roomService";
import { Room, RoomTypeCode } from "@/types";
import RoomFormModal, { RoomFormValues } from "@/components/RoomFormModal";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { BedDouble, Edit3, Eye, EyeOff, Plus, Search, Trash2, Users, Image as ImageIcon } from "lucide-react";

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
}

const TYPE_FILTERS: { value: RoomTypeCode | "ALL"; label: string }[] = [
  { value: "ALL", label: "Tất cả" },
  { value: "STANDARD", label: "Standard" },
  { value: "SUPERIOR", label: "Superior" },
  { value: "DELUXE", label: "Deluxe" },
  { value: "SUITE", label: "Suite" },
];

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<RoomTypeCode | "ALL">("ALL");

  const loadRooms = () => {
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

  const filteredRooms = useMemo(() => {
    return rooms.filter((r) => {
      const matchType = selectedType === "ALL" || r.type === selectedType;
      const matchSearch =
        search.trim() === "" ||
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.address.toLowerCase().includes(search.toLowerCase());
      return matchType && matchSearch;
    });
  }, [rooms, selectedType, search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl text-ink">Quản lý phòng</h1>
          <p className="mt-0.5 text-xs text-neutral-500">
            Tổng cộng {rooms.length} phòng ({rooms.filter((r) => r.active).length} đang hoạt động)
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark"
        >
          <Plus size={16} /> Thêm phòng mới
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Tìm theo tên phòng, địa chỉ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-line bg-base/50 py-2 pr-3 pl-9 text-sm focus:border-primary focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {TYPE_FILTERS.map((tf) => (
            <button
              key={tf.value}
              type="button"
              onClick={() => setSelectedType(tf.value)}
              className={`rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                selectedType === tf.value
                  ? "bg-primary text-white shadow-xs"
                  : "bg-base text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12 text-sm text-neutral-500">
          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-line border-t-primary" />
          Đang tải danh sách phòng...
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Room list: Responsive Cards (No horizontal scroll needed!) */}
      <div className="space-y-3">
        {filteredRooms.map((room) => {
          const cover = room.images?.[0] || "/placeholder-room.jpg";
          const imageCount = room.images?.length || 0;

          return (
            <div
              key={room.id}
              className={`group flex flex-col gap-4 rounded-2xl border p-4 transition sm:flex-row sm:items-center sm:justify-between ${
                room.active
                  ? "border-line bg-surface hover:border-primary/40 hover:shadow-xs"
                  : "border-dashed border-neutral-300 bg-neutral-50/70 opacity-75"
              }`}
            >
              {/* Left: Thumbnail & Main Info */}
              <div className="flex flex-1 items-start gap-4">
                <div className="relative h-22 w-28 shrink-0 overflow-hidden rounded-xl bg-neutral-100 sm:h-24 sm:w-32">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={cover} alt={room.name} className="h-full w-full object-cover" />
                  <span className="absolute bottom-1 right-1 flex items-center gap-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-xs">
                    <ImageIcon size={10} /> {imageCount}
                  </span>
                  {!room.active && (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-xs font-semibold text-white">
                      Đã ẩn
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-accent/10 px-2 py-0.5 text-[11px] font-semibold text-accent uppercase">
                      {room.typeLabel || room.type}
                    </span>
                    <h3 className="truncate font-display text-base font-semibold text-ink sm:text-lg">
                      {room.name}
                    </h3>
                  </div>

                  <p className="mt-1 truncate text-xs text-neutral-500">{room.address}</p>

                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                    <span className="font-semibold text-primary">
                      {formatPrice(room.pricePerNight)}
                      <span className="font-normal text-neutral-400">/đêm</span>
                    </span>

                    {room.weekendPrice ? (
                      <span className="text-neutral-500">
                        Cuối tuần: <b className="text-ink">{formatPrice(room.weekendPrice)}</b>
                      </span>
                    ) : null}

                    {room.holidayPrice ? (
                      <span className="text-neutral-500">
                        Ngày lễ: <b className="text-ink">{formatPrice(room.holidayPrice)}</b>
                      </span>
                    ) : (
                      <span className="text-neutral-400">Lễ: ×2</span>
                    )}

                    <span className="flex items-center gap-1 text-neutral-500">
                      <Users size={12} /> Tối đa {room.maxGuests} (đề xuất {room.recommendedGuests || 2})
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Actions always visible without scrolling */}
              <div className="flex items-center justify-end gap-2 border-t border-line/60 pt-3 sm:border-t-0 sm:pt-0">
                <button
                  type="button"
                  onClick={() => handleToggleActive(room.id)}
                  title={room.active ? "Nhấn để ẩn phòng" : "Nhấn để kích hoạt phòng"}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                    room.active
                      ? "bg-primary/10 text-primary hover:bg-primary/20"
                      : "bg-neutral-200 text-neutral-600 hover:bg-neutral-300"
                  }`}
                >
                  {room.active ? (
                    <>
                      <Eye size={14} /> Hoạt động
                    </>
                  ) : (
                    <>
                      <EyeOff size={14} /> Đã ẩn
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => openEdit(room)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-ink shadow-2xs transition hover:border-primary hover:text-primary"
                >
                  <Edit3 size={13} /> Sửa
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(room.id)}
                  className="inline-flex items-center gap-1 rounded-xl p-2 text-neutral-400 transition hover:bg-red-50 hover:text-red-600"
                  title="Xóa phòng"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}

        {!loading && filteredRooms.length === 0 && (
          <div className="rounded-2xl border border-line bg-surface p-8 text-center text-sm text-neutral-500">
            Không tìm thấy phòng nào phù hợp.
          </div>
        )}
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