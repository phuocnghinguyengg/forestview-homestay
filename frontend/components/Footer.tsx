import Link from "next/link";
import { Mail, Phone, MapPin, Send, Heart, Star } from "lucide-react";

export default function Footer({ embedded = false }: { embedded?: boolean }) {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: "Khám phá",
      links: [
        { label: "Chọn phòng", href: "/room-types" },
        { label: "Giới thiệu", href: "/about" },
        { label: "Liên hệ", href: "/contact" },
      ],
    },
    {
      title: "Tài khoản",
      links: [
        { label: "Đăng nhập", href: "/login" },
        { label: "Đăng ký", href: "/register" },
        { label: "Lịch sử đặt phòng", href: "/dashboard" },
      ],
    },
    {
      title: "Hỗ trợ",
      links: [
        { label: "Câu hỏi thường gặp", href: "#" },
        { label: "Chính sách hoàn trả", href: "#" },
        { label: "Điều khoản sử dụng", href: "#" },
      ],
    },
  ];

  const socialLinks = [
    { icon: Send, href: "#", label: "Message" },
    { icon: Heart, href: "#", label: "Like" },
    { icon: Star, href: "#", label: "Review" },
  ];

  return (
    <footer className={`${embedded ? "" : "mt-24"} border-t border-line bg-surface`}>
      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        {/* Brand & Description */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center text-surface font-display font-bold text-lg">
                F
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold text-primary">ForestView</h3>
                <p className="text-xs text-neutral-600">Homestay</p>
              </div>
            </div>
            
            <p className="text-sm text-neutral-600 leading-relaxed mb-6">
              Căn nhà gỗ nhỏ giữa rừng thông Đà Lạt — nơi bạn dừng chân, hít thở không khí trong lành và tận hưởng sự yên tĩnh.
            </p>

            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <Link
                    key={social.label}
                    href={social.href}
                    className="w-10 h-10 rounded-full bg-neutral-100 hover:bg-primary hover:text-surface flex items-center justify-center transition-all group"
                    aria-label={social.label}
                  >
                    <Icon size={18} />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Footer Sections */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="text-sm font-semibold text-ink mb-4">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-neutral-600 hover:text-primary hover:translate-x-1 transition-all inline-flex items-center gap-1"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12 pb-12 border-b border-line">
          <div className="flex gap-3 items-start">
            <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center text-primary shrink-0 mt-0.5">
              <MapPin size={18} />
            </div>
            <div>
              <p className="text-xs text-neutral-600 font-medium mb-1">Địa chỉ</p>
              <p className="text-sm text-ink font-medium">Đà Lạt, Lâm Đồng</p>
            </div>
          </div>

          <div className="flex gap-3 items-start">
            <div className="w-10 h-10 rounded-lg bg-accent-light flex items-center justify-center text-accent shrink-0 mt-0.5">
              <Mail size={18} />
            </div>
            <div>
              <p className="text-xs text-neutral-600 font-medium mb-1">Email</p>
              <p className="text-sm text-ink font-medium">hello@forestview.vn</p>
            </div>
          </div>

          <div className="flex gap-3 items-start">
            <div className="w-10 h-10 rounded-lg bg-success-light flex items-center justify-center text-success shrink-0 mt-0.5">
              <Phone size={18} />
            </div>
            <div>
              <p className="text-xs text-neutral-600 font-medium mb-1">Điện thoại</p>
              <p className="text-sm text-ink font-medium">0900 000 000</p>
            </div>
          </div>
        </div>

        {/* Copyright & Legal */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p>
            © {currentYear} ForestView Homestay. Tất cả quyền được bảo lưu.
          </p>

          <div className="flex gap-6">
            <Link href="#" className="hover:text-primary transition-colors">
              Chính sách bảo mật
            </Link>
            <Link href="#" className="hover:text-primary transition-colors">
              Điều khoản dịch vụ
            </Link>
            <Link href="#" className="hover:text-primary transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}