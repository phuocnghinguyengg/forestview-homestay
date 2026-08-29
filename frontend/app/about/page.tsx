export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-16">
      <p className="font-display text-sm italic text-accent">Câu chuyện của chúng tôi</p>
      <h1 className="mt-1 font-display text-3xl text-ink">Về ForestView Homestay</h1>

      <div className="mt-8 space-y-5 leading-relaxed text-neutral-600">
        <p>
          ForestView Homestay ra đời từ tình yêu với những buổi sáng sương mù giữa rừng thông Đà Lạt —
          nơi nhịp sống chậm lại và thiên nhiên trở thành người bạn đồng hành.
        </p>
        <p>
          Chúng tôi chọn lọc kỹ càng từng homestay trong hệ thống, đảm bảo không gian ấm cúng,
          sạch sẽ và mang đậm bản sắc địa phương — để mỗi chuyến đi của bạn không chỉ là một
          chỗ ở, mà là một trải nghiệm đáng nhớ.
        </p>
        <p>
          Từ những căn phòng nhỏ xinh giữa vườn hoa đến các homestay gia đình rộng rãi nhìn ra
          thung lũng, ForestView đồng hành cùng bạn tìm đúng nơi dừng chân phù hợp nhất.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4">
        {[
          { label: "Homestay đối tác", value: "20+" },
          { label: "Lượt đặt phòng", value: "1.000+" },
          { label: "Đánh giá trung bình", value: "4.8/5" },
          { label: "Năm hoạt động", value: "3+" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-line bg-surface p-4 text-center">
            <p className="font-display text-2xl text-primary">{s.value}</p>
            <p className="mt-1 text-xs text-neutral-500">{s.label}</p>
          </div>
        ))}
      </div>
    </main>
  );
}