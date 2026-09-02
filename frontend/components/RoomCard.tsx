import Link from "next/link";
import { Room } from "@/types";

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
}

export default function RoomCard({ room }: { room: Room }) {
  const cover = room.images?.[0] ?? "/placeholder-room.jpg";

  return (
    <Link href={`/rooms/${room.id}`} className="group block">
      <div className="relative h-56 w-full overflow-hidden rounded-t-[2.5rem] rounded-b-md bg-neutral-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={cover}
          alt={room.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      </div>
      <div className="h-px w-full bg-gradient-to-r from-accent via-accent/40 to-transparent" />
      <div className="pt-4">
        <h3 className="font-display text-lg text-ink">{room.name}</h3>
        <p className="mt-1 text-sm text-neutral-500">{room.address}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-base font-semibold text-accent">
            {formatPrice(room.quotedStayPrice ?? room.pricePerNight)}
            <span className="text-xs font-normal text-neutral-400">{room.quotedStayPrice ? " / kỳ lưu trú" : " /đêm"}</span>
          </span>
          <span className="text-xs text-neutral-500">Tối đa {room.maxGuests} khách</span>
        </div>
      </div>
    </Link>
  );
}
