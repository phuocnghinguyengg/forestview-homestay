import type { Metadata } from "next";
import { Gilda_Display, Barlow, Barlow_Condensed } from "next/font/google";
import "./globals.css";
import AuthInitializer from "@/components/AuthInitializer";
import Navbar from "@/components/Navbar";
import ConditionalFooter from "@/components/ConditionalFooter";
import UnverifiedBanner from "@/components/UnverifiedBanner";
import AuthModal from "@/components/AuthModal";

// Whole-site typography, synced with the reference template:
// Gilda Display for headings (--font-display, used by h1/h2/h3 and .font-display
// everywhere — home, modals, and the admin panel all pick this up automatically),
// Barlow for body copy (--font-body), and Barlow Condensed for uppercase
// tracked labels/nav/buttons (--font-label).
const gildaDisplay = Gilda_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
});

const barlow = Barlow({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-label",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ForestView Homestay Đà Lạt — Đặt phòng dễ dàng",
  description: "Khám phá và đặt homestay giữa rừng thông tại Đà Lạt.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body
        className={`${gildaDisplay.variable} ${barlow.variable} ${barlowCondensed.variable} flex min-h-screen flex-col antialiased`}
      >
        <AuthInitializer />
        <Navbar />
        <UnverifiedBanner />

        <div className="flex-1 flex flex-col">
          {children}
        </div>

        <ConditionalFooter />
        <AuthModal />
      </body>
    </html>
  );
}