"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

// Trang chủ ("/") tự render Footer bên trong khung cuộn snap của riêng nó
// (xem app/page.tsx) để tránh xung đột 2 lớp scroll lồng nhau. Mọi trang khác
// dùng Footer mặc định ở layout gốc. Trang /admin không hiển thị Footer vì nó
// luôn được nhúng trong popup "Không gian quản trị" qua iframe — nếu không ẩn,
// Footer sẽ lộ ra khi cuộn xuống cuối nội dung bên trong popup.
export default function ConditionalFooter() {
  const pathname = usePathname();

  if (pathname === "/" || pathname.startsWith("/admin")) {
    return null;
  }

  return <Footer />;
}
