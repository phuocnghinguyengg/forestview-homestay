import Link from "next/link";
import { Room } from "@/types";
import { Image as ImageIcon, Users } from "lucide-react";

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
}

export default function RoomCard({
  room,
  nights,
  checkIn,
  checkOut,
}: {
  room: Room;
  nights?: number;
  checkIn?: string;
  checkOut?: string;
}) {
  const cover = room.images?.[0] ?? "/placeholder-room.jpg";
  const photoCount = room.images?.length ?? 0;

  // Build link with dates if available
  const queryParams = checkIn && checkOut ? `?checkIn=${checkIn}&checkOut=${checkOut}` : "";
  const href = `/rooms/${room.id}${queryParams}`;

  return (
    <Link href={href} className="group block overflow-hidden rounded-3xl border border-line bg-surface transition duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
      <div className="relative h-56 w-full overflow-hidden bg-neutral-100 sm:h-60">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={cover}
          alt={room.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />

        {/* Room type tag */}
        <div className="absolute top-3 left-3">
          <span className="rounded-full bg-black/60 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
            {room.typeLabel || room.type}
          </span>
        </div>

        {/* Photo count badge */}
        {photoCount > 0 && (
          <div className="absolute top-3 right-3">
            <span className="flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md">
              <ImageIcon size={12} /> {photoCount} ảnh
            </span>
          </div>
        )}
      </div>

      <div className="p-5">
        <h3 className="truncate font-display text-lg font-semibold text-ink group-hover:text-primary transition">
          {room.name}
        </h3>
        <p className="mt-1 truncate text-xs text-neutral-500">{room.address}</p>

        <div className="mt-4 flex items-end justify-between border-t border-line/60 pt-3">
          <div>
            <span className="text-xs text-neutral-400">Giá phòng</span>
            <p className="text-base font-bold text-accent sm:text-lg">
              {formatPrice(room.quotedStayPrice ?? room.pricePerNight * (nights && nights > 0 ? nights : 1))}
              <span className="ml-1 text-xs font-normal text-neutral-500">
                {nights && nights > 0 ? `/ ${nights} đêm` : room.quotedStayPrice ? " / kỳ lưu trú" : " / đêm"}
              </span>
            </p>
          </div>

          <span className="flex items-center gap-1 rounded-full bg-base px-2.5 py-1 text-xs text-neutral-600">
            <Users size={12} /> Tối đa {room.maxGuests}
          </span>
        </div>
      </div>
    </Link>
  );
}

