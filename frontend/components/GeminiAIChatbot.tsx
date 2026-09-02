"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bot,
  Key,
  Maximize2,
  Minimize2,
  RefreshCw,
  Send,
  Sparkles,
  User,
  X,
} from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  time: string;
}

const SYSTEM_PROMPT = `
Bạn là "ForestView AI" - Trợ lý ảo thông minh, thân thiện và nhiệt tình của ForestView Homestay Đà Lạt.
Nhiệm vụ của bạn là tư vấn, giải đáp thắc mắc và hướng dẫn khách hàng đặt phòng tại homestay một cách chi tiết, dễ hiểu, lịch sự và mang phong cách ấm cúng đặc trưng của Đà Lạt.

Thông tin chi tiết về ForestView Homestay:
1. Địa chỉ & Vị trí:
   - Tọa lạc tại Phường 3, TP. Đà Lạt, Tỉnh Lâm Đồng, ẩn mình giữa đồi thông xanh ngát, cách trung tâm Hồ Xuân Hương khoảng 10 phút đi xe, không khí trong lành, se lạnh, view thung lũng săn mây.
2. Các hạng phòng (4 loại phòng chính):
   - Standard Room (Phòng Tiêu chuẩn): Giá từ 450.000đ/đêm, phù hợp 1-2 khách, 1 giường đôi Queen, view sân vườn hoa, đầy đủ tiện nghi ấm cúng.
   - Superior Room (Phòng Nâng cao): Giá từ 650.000đ/đêm, phù hợp 2 khách, view rừng thông thung lũng, có bồn tắm nằm ngâm mình thư giãn.
   - Deluxe Room (Phòng Cao cấp): Giá từ 900.000đ/đêm, phù hợp 2-3 khách, cửa kính panorama tràn viền bắt trọn cảnh hoàng hôn, ban công ngắm cảnh.
   - Suite Room (Phòng Tổng thống / Gia đình): Giá từ 1.350.000đ/đêm, phù hợp 4-6 khách, 2 giường King, có phòng khách biệt lập và bếp mini tiện dụng.
3. Quy định & Chính sách lưu trú:
   - Giờ nhận phòng (Check-in): Từ 14:00.
   - Giờ trả phòng (Check-out): Trước 12:00 trưa hôm sau.
   - Chính sách giá: Ngày cuối tuần (thứ 6, thứ 7) phụ thu nhẹ 100.000đ/đêm. Ngày Lễ/Tết nhân hệ số 2 theo quy định.
   - Phụ thu người vượt chuẩn: 150.000đ/người/đêm (đã bao gồm nệm phụ và tiện ích).
4. Chương trình Thành viên & Ưu đãi:
   - Bronze: Giảm 5% trọn đời.
   - Silver: Giảm 10% trọn đời.
   - Gold: Giảm 15% trọn đời.
   - Diamond: Giảm 20% trọn đời.
   - Khách có thể nhập mã giảm giá (VD: FORESTVIEW10, HOMESTAYDALAT) khi thanh toán.
5. Tiện ích & Dịch vụ nổi bật:
   - Sân nướng BBQ ngoài trời & Đốt lửa trại đêm.
   - Cà phê sáng & ăn sáng nông sản địa phương.
   - Cho thuê xe máy số/tay ga (120.000đ - 150.000đ/ngày).
   - Cho phép mang thú cưng (Pet-friendly) có thông báo trước.
   - Wifi cáp quang tốc độ cao phủ khắp khuôn viên, nước nóng 24/7, máy sưởi ấm.
6. Hướng dẫn đặt phòng:
   - Khách có thể chọn ngày nhận/trả phòng ở thanh tìm kiếm ngoài trang chủ, chọn hạng phòng yêu thích và tiến hành đặt phòng & thanh toán trực tuyến dễ dàng.

Hãy trả lời ngắn gọn, có cấu trúc rõ ràng (sử dụng gạch đầu dòng khi liệt kê giá và tiện ích), lịch sự và xưng hô thân mật là "ForestView AI" hoặc "mình" và gọi khách là "bạn" hoặc "quý khách".
`;

const SUGGESTIONS = [
  "Có những loại phòng nào và giá bao nhiêu?",
  "Giờ nhận & trả phòng như thế nào?",
  "Homestay có chỗ nướng BBQ và đốt lửa trại không?",
  "Chính sách mang thú cưng & thuê xe máy?",
];

function getTimeNow() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function GeminiAIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [inputKey, setInputKey] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load API key & welcome message
  useEffect(() => {
    const savedKey =
      localStorage.getItem("forestview_gemini_api_key") ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
      "";
    if (savedKey) {
      setApiKey(savedKey);
      setInputKey(savedKey);
    }

    setMessages([
      {
        id: "welcome-1",
        sender: "ai",
        text: "Xin chào quý khách! 🌲 Mình là **ForestView AI** - Trợ lý ảo của ForestView Homestay Đà Lạt.\n\nMình có thể giúp gì cho chuyến đi nghỉ dưỡng của bạn hôm nay? (Tra cứu giá phòng, tiện ích BBQ, ưu đãi thành viên, v.v.)",
        time: getTimeNow(),
      },
    ]);
  }, []);

  // Auto scroll
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, loading]);

  const handleSaveApiKey = () => {
    const trimmed = inputKey.trim();
    setApiKey(trimmed);
    localStorage.setItem("forestview_gemini_api_key", trimmed);
    setShowKeyModal(false);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputValue).trim();
    if (!query || loading) return;

    const userMsg: Message = {
      id: "user-" + Date.now(),
      sender: "user",
      text: query,
      time: getTimeNow(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setLoading(true);

    const activeKey =
      apiKey ||
      localStorage.getItem("forestview_gemini_api_key") ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
      "";

    if (!activeKey) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: "ai-error-" + Date.now(),
            sender: "ai",
            text: "⚠️ **Chưa cấu hình Gemini API Key**\n\nĐể kích hoạt AI trả lời tự động bằng Google Gemini, bạn vui lòng nhấn vào nút **⚙️ Cài đặt API Key** ở góc trên khung chat và dán API Key của bạn từ [Google AI Studio](https://aistudio.google.com/app/apikey).",
            time: getTimeNow(),
          },
        ]);
        setLoading(false);
      }, 500);
      return;
    }

    try {
      // Prepare conversation history for Gemini API
      const contents = [
        {
          role: "user",
          parts: [{ text: `${SYSTEM_PROMPT}\n\nNgười dùng hỏi: ${query}` }],
        },
      ];

      // Call Google Gemini API (gemini-1.5-flash or gemini-2.5-flash)
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${activeKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 800,
            },
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Lỗi khi gọi Google Gemini API");
      }

      const replyText =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Xin lỗi bạn, mình chưa hiểu rõ câu hỏi. Bạn có thể hỏi lại hoặc liên hệ hotline để được hỗ trợ trực tiếp nhé!";

      setMessages((prev) => [
        ...prev,
        {
          id: "ai-" + Date.now(),
          sender: "ai",
          text: replyText,
          time: getTimeNow(),
        },
      ]);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Đã xảy ra sự cố kết nối với AI";
      setMessages((prev) => [
        ...prev,
        {
          id: "ai-err-" + Date.now(),
          sender: "ai",
          text: `❌ **Không thể kết nối Gemini API**: ${errorMsg}.\n\nVui lòng kiểm tra lại API Key trong mục **⚙️ Cài đặt API Key**.`,
          time: getTimeNow(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const resetChat = () => {
    setMessages([
      {
        id: "welcome-" + Date.now(),
        sender: "ai",
        text: "Chào bạn! Cuộc trò chuyện đã được làm mới. Hãy đặt bất kỳ câu hỏi nào về ForestView Homestay nhé! 🌲",
        time: getTimeNow(),
      },
    ]);
  };

  return (
    <>
      {/* 3-Dots Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {!isOpen && (
          <div className="group relative">
            <button
              onClick={() => setIsOpen(true)}
              aria-label="Mở trợ lý AI Chatbot Gemini"
              className="relative flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-xl shadow-primary/30 transition duration-300 hover:scale-105 hover:bg-primary-dark active:scale-95 focus:outline-none"
            >
              {/* 3 Dots Icon inside button */}
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse [animation-delay:200ms]" />
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse [animation-delay:400ms]" />
              </div>

              {/* Sparkle badge */}
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white shadow-xs">
                ✨
              </span>
            </button>

            {/* Tooltip */}
            <div className="pointer-events-none absolute right-16 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-xl bg-ink/90 px-3.5 py-1.5 text-xs font-semibold text-white opacity-0 shadow-lg backdrop-blur-md transition-opacity duration-200 group-hover:opacity-100">
              Trợ lý AI Gemini · ForestView
            </div>
          </div>
        )}

        {/* Chatbot Window */}
        {isOpen && (
          <div
            className={`flex flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-2xl backdrop-blur-md transition-all duration-300 ${
              isExpanded
                ? "h-[85vh] w-[92vw] sm:w-[600px]"
                : "h-[560px] max-h-[82vh] w-[92vw] sm:w-[400px]"
            }`}
          >
            {/* Chatbot Header */}
            <div className="flex items-center justify-between border-b border-line bg-primary px-4 py-3.5 text-white">
              <div className="flex items-center gap-2.5">
                <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md">
                  <Sparkles size={18} />
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-primary bg-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-display text-sm font-semibold">ForestView AI</h3>
                    <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider">
                      Gemini
                    </span>
                  </div>
                  <p className="text-[11px] text-white/80">Trực tuyến · Sẵn sàng tư vấn</p>
                </div>
              </div>

              {/* Header Actions */}
              <div className="flex items-center gap-1 text-white/90">
                <button
                  type="button"
                  onClick={() => setShowKeyModal(true)}
                  title="Cài đặt Gemini API Key"
                  className="rounded-lg p-1.5 hover:bg-white/15"
                >
                  <Key size={16} />
                </button>
                <button
                  type="button"
                  onClick={resetChat}
                  title="Làm mới cuộc trò chuyện"
                  className="rounded-lg p-1.5 hover:bg-white/15"
                >
                  <RefreshCw size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  title={isExpanded ? "Thu nhỏ" : "Phóng to"}
                  className="hidden rounded-lg p-1.5 hover:bg-white/15 sm:block"
                >
                  {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  title="Đóng chat"
                  className="rounded-lg p-1.5 hover:bg-white/15"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* API Key Banner if not set */}
            {!apiKey && (
              <div className="flex items-center justify-between border-b border-amber-200 bg-amber-50 px-3.5 py-2 text-xs text-amber-800">
                <span>Chưa nhập Gemini API Key để trò chuyện.</span>
                <button
                  type="button"
                  onClick={() => setShowKeyModal(true)}
                  className="rounded-md bg-amber-600 px-2 py-0.5 font-semibold text-white hover:bg-amber-700"
                >
                  Nhập Key
                </button>
              </div>
            )}

            {/* Message List */}
            <div className="flex-1 space-y-3.5 overflow-y-auto p-4 scrollbar-thin">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${
                    msg.sender === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      msg.sender === "user"
                        ? "bg-accent text-white"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    {msg.sender === "user" ? <User size={13} /> : <Bot size={14} />}
                  </div>

                  {/* Bubble */}
                  <div className="max-w-[82%] space-y-1">
                    <div
                      className={`rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                        msg.sender === "user"
                          ? "bg-primary text-white rounded-tr-xs"
                          : "border border-line bg-base/60 text-ink rounded-tl-xs whitespace-pre-line"
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span
                      className={`block text-[10px] text-neutral-400 ${
                        msg.sender === "user" ? "text-right" : "text-left"
                      }`}
                    >
                      {msg.time}
                    </span>
                  </div>
                </div>
              ))}

              {/* Typing Loader */}
              {loading && (
                <div className="flex items-start gap-2.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Bot size={14} />
                  </div>
                  <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-xs border border-line bg-base/60 px-4 py-3">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-primary/60" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-primary/60 [animation-delay:150ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-primary/60 [animation-delay:300ms]" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggestion Chips */}
            {messages.length <= 2 && (
              <div className="border-t border-line/60 bg-base/20 px-3 py-2">
                <p className="text-[10px] font-semibold text-neutral-400">Gợi ý câu hỏi nhanh:</p>
                <div className="mt-1 flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {SUGGESTIONS.map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => handleSendMessage(sug)}
                      className="shrink-0 rounded-full border border-line bg-surface px-2.5 py-1 text-[11px] text-neutral-600 transition hover:border-primary hover:text-primary"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="border-t border-line bg-surface p-3"
            >
              <div className="flex items-center gap-2 rounded-2xl border border-line bg-base/50 p-1.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Hỏi AI về phòng, giá, dịch vụ..."
                  className="flex-1 bg-transparent px-2.5 text-xs text-ink focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || loading}
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Send size={14} />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* API Key Configuration Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-80 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-line bg-surface p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2">
                <Key size={18} className="text-primary" />
                <h3 className="font-display text-lg text-ink">Cài đặt Gemini API Key</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowKeyModal(false)}
                className="rounded-full p-1 text-neutral-400 hover:text-ink"
              >
                <X size={18} />
              </button>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-neutral-600">
              Nhập Google Gemini API Key để kích hoạt trợ lý AI trả lời thông tin homestay theo thời gian thực. API Key được lưu an toàn trên trình duyệt của bạn.
            </p>

            <div className="mt-4">
              <label className="text-xs font-semibold text-neutral-700">Gemini API Key</label>
              <input
                type="password"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="AIzaSy..."
                className="mt-1.5 w-full rounded-xl border border-line bg-base/50 px-3.5 py-2.5 text-xs focus:border-primary focus:outline-none"
              />
              <p className="mt-1.5 text-[11px] text-neutral-400">
                Chưa có key? Lấy miễn phí tại{" "}
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline font-medium"
                >
                  Google AI Studio →
                </a>
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowKeyModal(false)}
                className="rounded-full border border-line px-4 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-100"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveApiKey}
                className="rounded-full bg-primary px-5 py-2 text-xs font-semibold text-white hover:bg-primary-dark shadow-xs"
              >
                Lưu &amp; Kích hoạt
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
