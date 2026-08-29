"use client";

import { useEffect, useState } from "react";
import { roomService } from "@/lib/services/roomService";
import { Room } from "@/types";

export default function Home() {
  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    roomService.getAll().then(setRooms).catch(console.error);
  }, []);

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Danh sách Homestay</h1>
      <pre>{JSON.stringify(rooms, null, 2)}</pre>
    </main>
  );
}