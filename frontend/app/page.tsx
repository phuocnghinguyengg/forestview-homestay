import Link from "next/link";
import TrustBadges from "@/components/TrustBadges";

export default function Home() {
  return (
    <>
      <main className="relative min-h-[calc(100vh-73px)] overflow-hidden">
        <svg
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[45%] w-full text-primary/[0.07]"
          viewBox="0 0 1200 300"
          preserveAspectRatio="none"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M100 300 L130 180 L100 210 L130 120 L100 150 L150 20 L200 150 L170 120 L200 210 L170 180 L200 300 Z" />
          <path d="M320 300 L355 160 L320 195 L355 90 L320 125 L385 10 L450 125 L415 90 L450 195 L415 160 L450 300 Z" />
          <path d="M560 300 L590 200 L560 225 L590 150 L560 175 L610 60 L660 175 L630 150 L660 225 L630 200 L660 300 Z" />
          <path d="M780 300 L815 160 L780 195 L815 90 L780 125 L845 10 L910 125 L875 90 L910 195 L875 160 L910 300 Z" />
          <path d="M1000 300 L1030 200 L1000 225 L1030 150 L1000 175 L1050 60 L1100 175 L1070 150 L1100 225 L1070 200 L1100 300 Z" />
        </svg>

        <div className="relative mx-auto max-w-3xl px-5 pt-24 pb-16 text-center sm:pt-32">
          <p className="font-display text-sm italic tracking-wide text-accent">Đà Lạt, Lâm Đồng</p>
          <h1 className="mx-auto mt-4 max-w-2xl font-display text-4xl leading-tight text-ink sm:text-6xl">
            Chốn dừng chân giữa rừng thông Đà Lạt
          </h1>
          <p className="mx-auto mt-6 max-w-md text-neutral-600">
            Những homestay ẩn mình giữa thiên nhiên, không khí se lạnh, đặt phòng chỉ trong vài phút.
          </p>
          <div className="mt-10">
            <Link
              href="/room-types"
              className="inline-block rounded-full bg-primary px-9 py-4 text-sm font-semibold text-white transition hover:bg-primary-dark"
            >
              Khám phá homestay
            </Link>
          </div>
        </div>
      </main>

      <TrustBadges />
    </>
  );
}