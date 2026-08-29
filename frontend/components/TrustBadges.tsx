const BADGES = [
  {
    title: "Xác thực chủ homestay",
    desc: "Mỗi homestay đều được đội ngũ ForestView kiểm duyệt trước khi đăng.",
  },
  {
    title: "Hủy phòng linh hoạt",
    desc: "Hủy miễn phí trước 48 giờ nhận phòng theo chính sách từng homestay.",
  },
  {
    title: "Hỗ trợ tận tâm",
    desc: "Đội ngũ ForestView sẵn sàng hỗ trợ bạn trong suốt chuyến đi.",
  },
  {
    title: "Đặt phòng an toàn",
    desc: "Thông tin và giao dịch của bạn được bảo mật trong mọi bước đặt phòng.",
  },
];

export default function TrustBadges() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-16">
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {BADGES.map((b) => (
          <div key={b.title} className="rounded-2xl border border-line bg-surface p-5">
            <div className="h-8 w-8 rounded-full bg-primary/10" />
            <h3 className="mt-4 font-display text-base text-ink">{b.title}</h3>
            <p className="mt-1.5 text-sm text-neutral-500">{b.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}