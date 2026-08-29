export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-16">
      <p className="font-display text-sm italic text-accent">Câu chuyện của chúng tôi</p>
      <h1 className="mt-1 font-display text-3xl text-ink">Về ForestView Homestay</h1>

      <div className="mt-8 space-y-5 leading-relaxed text-neutral-600">
        <p>
          ForestView Homestay là một căn nhà gỗ nhỏ nằm giữa rừng thông ở Đà Lạt, được chúng tôi
          xây dựng và vun đắp từ tình yêu với những buổi sáng sương mù và nhịp sống chậm rãi.
        </p>
        <p>
          Chúng tôi tự tay chăm chút từng phòng nghỉ — từ phòng đơn ấm cúng cho khách đi một mình,
          đến phòng gia đình rộng rãi có sân vườn riêng — để mỗi vị khách đều tìm được không gian
          phù hợp nhất với chuyến đi của mình.
        </p>
        <p>
          Đây không phải là một nền tảng trung gian — ForestView là homestay của chính chúng tôi,
          và chúng tôi trực tiếp đón tiếp, chăm sóc từng vị khách trong suốt thời gian lưu trú.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4">
        {[
          { label: "Loại phòng", value: "4" },
          { label: "Lượt khách đã đón", value: "1.000+" },
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