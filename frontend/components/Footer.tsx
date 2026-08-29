import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-surface">
      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-4">
          <div className="sm:col-span-2">
            <p className="font-display text-xl italic text-primary">
              ForestView <span className="not-italic text-ink">Homestay</span>
            </p>
<p className="mt-3 max-w-xs text-sm text-neutral-500">
  Căn nhà gỗ nhỏ giữa rừng thông Đà Lạt — nơi bạn dừng chân, hít thở không khí trong lành và tận hưởng sự yên tĩnh.
</p>
          </div>

          <div>
            <p className="text-sm font-semibold text-ink">Khám phá</p>
            <ul className="mt-3 space-y-2 text-sm text-neutral-500">
              <li><Link href="/room-types" className="hover:text-primary">Chọn phòng</Link></li>
              <li><Link href="/about" className="hover:text-primary">Giới thiệu</Link></li>
              <li><Link href="/contact" className="hover:text-primary">Liên hệ</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-ink">Liên hệ</p>
            <ul className="mt-3 space-y-2 text-sm text-neutral-500">
              <li>Đà Lạt, Lâm Đồng</li>
              <li>hello@forestview.vn</li>
              <li>0900 000 000</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-line pt-6 text-xs text-neutral-400 sm:flex-row">
          <p>© {new Date().getFullYear()} ForestView Homestay. Đã đăng ký bản quyền.</p>
          <div className="flex gap-4">
            <Link href="/about" className="hover:text-primary">Về chúng tôi</Link>
            <Link href="/contact" className="hover:text-primary">Hỗ trợ</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}