"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

// Trang chủ ("/") tự render Footer bên trong khung cuộn snap của riêng nó
// (xem app/page.tsx) để tránh xung đột 2 lớp scroll lồng nhau. Mọi trang khác
// dùng Footer mặc định ở layout gốc.
export default function ConditionalFooter() {
  const pathname = usePathname();

  if (pathname === "/") {
    return null;
  }

  return <Footer />;
}
