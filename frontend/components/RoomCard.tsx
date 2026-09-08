import Link from "next/link";
import { Room } from "@/types";
import { Image as ImageIcon, Users, MapPin, Star } from "lucide-react";
import { Badge } from "@/components/ui/index";

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

  const price = room.quotedStayPrice ?? room.pricePerNight * (nights && nights > 0 ? nights : 1);
  const rating = Math.round(Math.random() * 5 * 10) / 10; // Placeholder rating

  return (
    <Link href={href} className="group">
      <div className="card-hover h-full flex flex-col">
        {/* Image Section */}
        <div className="relative h-56 w-full overflow-hidden bg-neutral-100 sm:h-64">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cover}
            alt={room.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Top Left Badge */}
          <div className="absolute top-3 left-3 z-10">
            <Badge variant="success">{room.typeLabel || room.type}</Badge>
          </div>

          {/* Top Right Badge */}
          {photoCount > 0 && (
            <div className="absolute top-3 right-3 z-10">
              <Badge variant="info">
                <ImageIcon size={12} /> {photoCount}
              </Badge>
            </div>
          )}

          {/* Rating Badge (Bottom Left) */}
          <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1 bg-surface/95 backdrop-blur-sm rounded-lg px-2.5 py-1.5 shadow-sm">
            <Star size={14} className="text-amber-500 fill-current" />
            <span className="text-sm font-semibold text-ink">{rating.toFixed(1)}</span>
          </div>

          {/* Guest Count Badge (Bottom Right) */}
          <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1 bg-surface/95 backdrop-blur-sm rounded-lg px-2.5 py-1.5 shadow-sm">
            <Users size={14} className="text-primary" />
            <span className="text-sm font-medium text-ink">Tối đa {room.maxGuests}</span>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-5 sm:p-6 flex flex-col flex-grow">
          {/* Title */}
          <h3 className="font-display text-lg sm:text-xl font-semibold text-ink group-hover:text-primary transition line-clamp-2">
            {room.name}
          </h3>

          {/* Address */}
          <div className="flex items-start gap-2 mt-2 text-neutral-600">
            <MapPin size={14} className="flex-shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm line-clamp-2">{room.address}</p>
          </div>

          {/* Divider */}
          <div className="my-4 border-t border-line" />

          {/* Price Section */}
          <div className="mt-auto">
            <p className="text-xs text-neutral-600 font-medium mb-1">GIÁ</p>
            <div className="flex items-baseline gap-2">
              <p className="text-lg sm:text-2xl font-bold text-accent">
                {formatPrice(price)}
              </p>
              <span className="text-xs text-neutral-500">
                {nights && nights > 0 ? `/ ${nights} đêm` : room.quotedStayPrice ? "/ kỳ" : "/ đêm"}
              </span>
            </div>
          </div>

          {/* CTA Button */}
          <button className="mt-4 w-full py-2.5 px-4 rounded-lg bg-gradient-primary text-surface font-medium text-sm hover:shadow-lg transition-all active:scale-95">
            Xem chi tiết
          </button>
        </div>
      </div>
    </Link>
  );
}


