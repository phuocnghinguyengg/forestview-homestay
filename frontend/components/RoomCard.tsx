import Link from "next/link";
import { Room } from "@/types";

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
}

export default function RoomCard({ room }: { room: Room }) {
  const cover = room.images?.[0] ?? "/placeholder-room.jpg";

  return (
    <Link
      href={`/rooms/${room.id}`}
      className="group block overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:shadow-lg"
    >
      <div className="relative h-48 w-full overflow-hidden bg-neutral-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={cover}
          alt={room.name}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-neutral-900">{room.name}</h3>
        <p className="mt-1 line-clamp-1 text-sm text-neutral-500">{room.address}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-base font-bold text-rose-600">
            {formatPrice(room.pricePerNight)}
            <span className="text-xs font-normal text-neutral-400"> /đêm</span>
          </span>
          <span className="text-xs text-neutral-500">Tối đa {room.maxGuests} khách</span>
        </div>
      </div>
    </Link>
  );
}