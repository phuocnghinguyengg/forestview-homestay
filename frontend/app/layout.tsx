import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";
import AuthInitializer from "@/components/AuthInitializer";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import UnverifiedBanner from "@/components/UnverifiedBanner";

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const manrope = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "ForestView Homestay Đà Lạt — Đặt phòng dễ dàng",
  description: "Khám phá và đặt homestay giữa rừng thông tại Đà Lạt.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className={`${fraunces.variable} ${manrope.variable} flex min-h-screen flex-col antialiased`}>
        <AuthInitializer />
        <Navbar />
        <UnverifiedBanner />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}