'use client'

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDownIcon } from "@/components/icons/ZenIcons";

const sections = [
  {
    id: "quan-the-am",
    question: "1. Quán Thế Âm Bồ Tát Là Ai?",
    answer: `Quán Thế Âm Bồ Tát — còn gọi là Quan Âm, Quán Tự Tại — là vị Bồ Tát của Đại Từ Đại Bi, phổ cứu nhân gian khó khăn, sở hữu vô lượng trí tuệ và thần thông.

Ngài đã thành Phật từ vô lượng kiếp trước, hiệu là "Chánh Pháp Minh Như Lai", nhưng vì tình thương chúng sinh mà hiện thân Bồ Tát trở lại. Cùng Văn Thù, Phổ Hiền, Địa Tạng — Ngài là một trong "Tứ Đại Bồ Tát".

Tại Tây Phương Cực Lạc, Ngài đồng hành cùng Phật A Di Đà và Bồ Tát Đại Thế Chí — ba vị hợp thành "Tây Phương Tam Thánh". Ngài có mối nhân duyên sâu sắc với chúng sinh Ta Bà: hữu cảm tức ứng, không nguyện không theo — đó là ý nghĩa câu "Gia gia A Di Đà, hộ hộ Quán Thế Âm".

Trải qua lịch sử, Ngài đã hóa thân vô số — từ Lưu Tát Ha (Đông Tấn), Đại Hòa Thượng Bảo Chí Công (Nam Triều) cho đến Tăng Già Đại Sư đời Đường. Mỗi hóa thân đều mang theo thần thông và kỳ tích chấn động.`,
  },
  {
    id: "lu-master",
    question: "2. Giới Thiệu Sư Phụ Lư Quân Hoành",
    answer: `Trong thế kỷ 21, vị Đại Đức được mệnh danh là hóa thân của Quán Thế Âm Bồ Tát chính là Đài Trưởng Lư Quân Hoành — Đài Phát Thanh Đông Phương, Sydney, Úc.

Ngài có pháp nhãn thần thông: chỉ cần biết năm sinh, cầm tinh và giới tính, không bị giới hạn bởi không gian và thời gian, Ngài có thể nhìn thấy Đồ Đằng, biết kiếp trước kiếp này, nhân-quả báo ứng — giúp người hiểu nhân quả như bóng với hình, từ đó hành thiện bỏ ác, thay đổi vận mệnh.

Từ năm 2012 đến nay, Sư Phụ đã được mời diễn giảng tại Liên Hợp Quốc, Quốc hội Hoa Kỳ và nhiều trường đại học trên thế giới. Năm 2015, Đại Pháp Hội tại Malaysia và Singapore quy tụ hơn mười vạn người tu học.

Sách Pháp Môn Tâm Linh đã xuất bản hơn 10.000.000 quyển, lưu thông khắp thế giới — cứu người không cần hồi báo, Ngài là hiện thân sống động của tinh thần Đại Từ Đại Bi.`,
  },
  {
    id: "phap-mon",
    question: "3. Pháp Môn Tâm Linh Là Gì?",
    answer: `Pháp Môn Tâm Linh là tâm nguyện từ bi của Quán Thế Âm Bồ Tát dành cho chúng sinh thời hiện đại — thuộc Phật Giáo Đại Thừa, phù hợp với căn cơ con người ngày nay.

Pháp Môn dạy chúng ta trả nghiệp bằng cách thực hành Ngũ Đại Pháp Bảo, giúp:
• Thoát khỏi đau khổ, bệnh tật, phiền não
• Hóa giải mâu thuẫn, nghiệt chướng oan gia
• Nâng cao trí tuệ và phúc đức bản thân
• Siêu độ người thân đã khuất

Nhờ hiệu quả linh nghiệm nhanh chóng, chỉ trong 5 năm ngắn ngủi đã có hơn 10 triệu tín đồ trên toàn thế giới theo tu học — một con số chưa từng có trong lịch sử Phật giáo hiện đại.`,
  },
  {
    id: "five-dharmas",
    question: "4. Ngũ Đại Pháp Bảo Tu Học",
    answer: `**Niệm Kinh** — Tụng Chú Đại Bi, Tâm Kinh, Chuẩn Đề Thần Chú, Lễ Phật Đại Sám Hối Văn mỗi ngày. Kinh văn là lời khai thị của chư Phật, tiêu nghiệp chướng, tăng năng lượng, khai mở trí huệ.

**Phát Nguyện** — Lập nguyện chân thành, kiên cố. Nguyện lực có thể cải biến vận mệnh, thu hút gia trì của chư Phật Bồ Tát.

**Phóng Sinh** — Cứu sinh mạng bị giam cầm, bồi dưỡng tâm từ bi, tích lũy công đức phúc báo, tiêu tai kéo dài thọ mạng.

**Đọc Bạch Thoại Phật Pháp** — Học hiểu giáo lý qua ngôn ngữ đời thường của Sư Phụ, thực hành đúng pháp, tránh tà kiến.

**Đại Sám Hối (Ngôi Nhà Nhỏ)** — Viết và đốt kinh văn siêu độ oan gia trái chủ, hóa giải nghiệp lực nhiều kiếp, thanh lọc thân tâm.`,
  },
];

// Render chuỗi text có **bold** thành JSX
function renderAnswer(text: string) {
  return text.split('\n\n').map((para, i) => {
    // Tách phần bold khỏi phần thường
    const parts = para.split(/(\*\*[^*]+\*\*)/g);
    return (
      <p key={i} className="text-muted-foreground leading-loose text-sm mb-3 last:mb-0 whitespace-pre-line">
        {parts.map((part, j) =>
          part.startsWith('**') && part.endsWith('**') ? (
            <strong key={j} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>
          ) : (
            <span key={j}>{part}</span>
          )
        )}
      </p>
    );
  });
}

const AboutSection = () => {
  const [openId, setOpenId] = useState<string | null>("quan-the-am");

  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-gold text-sm font-medium tracking-widest uppercase mb-3">Giới Thiệu</p>
            <h2 className="font-display text-3xl md:text-4xl text-foreground mb-6 leading-tight">
              Pháp Môn Tâm Linh<br />
              <span className="gold-gradient-text">Hướng Dẫn Tu Học</span>
            </h2>
            <div className="zen-divider w-20 mb-6" />
            <p className="text-muted-foreground leading-loose text-base mb-8 italic border-l-2 border-gold/30 pl-6">
              Nguyện rằng sẽ càng có thêm nhiều chúng sinh hữu duyên có thể lên được chiếc thuyền cứu độ của Quán Thế Âm Bồ Tát, tâm hồn thanh tịnh, thoát khổ an vui, tiêu trừ nghiệp chướng, siêu độ hữu duyên, trả sạch oán kết, quảng độ chúng sinh, đồng đăng cực lạc.
            </p>

            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Đồng Tu Toàn Cầu", value: "Hàng triệu" },
                { label: "Năm Hoằng Pháp", value: "20+" },
                { label: "Quán Âm Đường", value: "Toàn Cầu" },
              ].map((stat) => (
                <div key={stat.label} className="text-center p-4 rounded-xl bg-card border border-border">
                  <p className="font-display text-xl text-gold mb-1">{stat.value}</p>
                  <p className="text-xs text-muted-foreground leading-tight">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-3"
          >
            {sections.map((sec) => (
              <div key={sec.id} className="rounded-xl border border-border bg-card overflow-hidden">
                <button
                  onClick={() => setOpenId(openId === sec.id ? null : sec.id)}
                  className="w-full flex items-center justify-between p-5 text-left group"
                >
                  <span className="font-display text-lg text-foreground group-hover:text-gold transition-colors">
                    {sec.question}
                  </span>
                  <motion.span
                    animate={{ rotate: openId === sec.id ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="shrink-0 ml-4 text-muted-foreground"
                  >
                    <ChevronDownIcon />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {openId === sec.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 border-t border-border pt-4">
                        {renderAnswer(sec.answer)}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}

            <div className="p-4 rounded-xl bg-secondary/50 border border-border text-sm text-muted-foreground">
              <p className="mb-1 font-medium text-foreground">Địa chỉ Văn phòng Đài Đông Phương:</p>
              <p>2A Holden Street, Ashfield NSW 2131 Australia</p>
              <p className="mt-1">
                <a href="tel:+61292832758" className="text-gold hover:underline">+61 2 9283 2758</a>
                {" · "}
                <a href="https://xlch.org/" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">xlch.org</a>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
