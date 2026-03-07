'use client'

import Link from "next/link";
import Image from "next/image";

/* ══════════════════════════════════════════════════════════════
   FOOTER - Senior Friendly Buddhist Design
   - Larger text and touch targets
   - Clear visual hierarchy
   - More generous spacing
══════════════════════════════════════════════════════════════ */

const YoutubeIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.96-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white" />
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const TiktokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.35 6.35 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.24 8.24 0 0 0 4.82 1.54V6.78a4.85 4.85 0 0 1-1.05-.09z" />
  </svg>
);

const ZaloIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <rect width="24" height="24" rx="5" fill="none" />
    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm.75 14.5H11.3c-.28 0-.5-.22-.5-.5s.22-.5.5-.5h.45v-4.5h-.45c-.28 0-.5-.22-.5-.5s.22-.5.5-.5h1.45c.28 0 .5.22.5.5v5h.45c.28 0 .5.22.5.5s-.22.5-.5.5zm-1.25-8a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
  </svg>
);

const navGroups = [
  {
    title: "Tu Học",
    links: [
      { label: "Hướng Dẫn Sơ Học", href: "/beginner-guide" },
      { label: "Lịch Tu Học", href: "/lunar-calendar" },
      { label: "Hỏi Đáp Phật Học", href: "/qa" },
      { label: "Danh Bạ Toàn Cầu", href: "/directory" },
      { label: "Hộ Trì Phật Pháp", href: "/donations" },
    ]
  },
  {
    title: "Khai Thị",
    links: [
      { label: "Thư Viện Kinh Văn", href: "/library" },
      { label: "Chương Trình Radio", href: "/radio" },
      { label: "Video Khai Thị", href: "/videos" },
      { label: "Blog Phật Pháp", href: "/blog" },
    ]
  },
  {
    title: "Cộng Đồng",
    links: [
      { label: "Chứng Nghiệm & Chia Sẻ", href: "/shares" },
      { label: "Sự Kiện & Pháp Hội", href: "/events" },
    ]
  }
];

const downloadLinks = [
  { label: "12 Tập Bạch Thoại PDF", href: "https://xlch.org/download" },
  { label: "Audio Niệm Kinh", href: "https://xlch.org/audio" },
  { label: "Mẫu Ngôi Nhà Nhỏ", href: "https://xlch.org/ngoinha" },
  { label: "Hướng Dẫn Sơ Học", href: "https://xlch.org/guide" },
  { label: "Kinh Văn Thường Dụng", href: "https://xlch.org/kinh" },
];

const externalLinks = [
  { label: "YouTube", href: "https://youtube.com/@phapmon.tamlinh?si=EkMtyo76fes5pJoQ" },
  { label: "Facebook", href: "https://www.facebook.com/groups/1772491517480555/?ref=share" },
  { label: "Zalo", href: "https://zalo.me/g/sjajsj328" },
  { label: "TikTok", href: "https://www.tiktok.com/@pmtl_0983885116" },
  { label: "xinlingfamen.info", href: "https://xinlingfamen.info" },
  { label: "xlch.org", href: "https://xlch.org" },
];

const Footer = () => (
  <footer className="border-t border-border bg-card">
    <div className="container mx-auto px-6 lg:px-8 pt-16 pb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-10 lg:gap-8 mb-12">
        {/* Brand Column */}
        <div className="lg:col-span-2">
          <Link href="/" className="inline-block mb-6 hover:opacity-90 transition-opacity">
            <Image
              src="/images/logoo.png"
              alt="Phap Mon Tam Linh"
              width={180}
              height={56}
              className="h-14 w-auto object-contain"
            />
          </Link>
          <p className="text-base text-muted-foreground leading-relaxed mb-6 max-w-sm">
            Truc tiep tu dai Phat phap cua Truong Lu Quan Hoanh. Tat ca tai lieu hoan toan mien phi.
          </p>
          <div className="flex items-center gap-3">
            {[
              { icon: <FacebookIcon />, href: "https://facebook.com", label: "Facebook" },
              { icon: <YoutubeIcon />, href: "https://youtube.com", label: "YouTube" },
              { icon: <TiktokIcon />, href: "https://tiktok.com", label: "TikTok" },
              { icon: <ZaloIcon />, href: "https://zalo.me", label: "Zalo" },
            ].map(({ icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-gold hover:bg-gold/10 transition-all min-h-[44px]"
              >
                {icon}
              </a>
            ))}
          </div>
        </div>

        {/* Navigation Groups */}
        {navGroups.map((group) => (
          <div key={group.title}>
            <h4 className="text-sm font-semibold uppercase tracking-widest text-foreground mb-5">{group.title}</h4>
            <ul className="space-y-3">
              {group.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-base text-muted-foreground hover:text-gold transition-colors py-1 block">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Downloads */}
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-widest text-foreground mb-5">Tai Lieu</h4>
          <ul className="space-y-3">
            {downloadLinks.map((l) => (
              <li key={l.label}>
                <a href={l.href} target="_blank" rel="noopener noreferrer" className="text-base text-muted-foreground hover:text-gold transition-colors py-1 block">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-widest text-foreground mb-5">Lien Ket</h4>
          <ul className="space-y-3 mb-6">
            {externalLinks.slice(0, 4).map((l) => (
              <li key={l.label}>
                <a href={l.href} target="_blank" rel="noopener noreferrer" className="text-base text-muted-foreground hover:text-gold transition-colors py-1 block">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="pt-5 border-t border-border space-y-2">
            <p className="text-xs uppercase tracking-wider text-muted-foreground/60 mb-2">Tru so chinh</p>
            <p className="text-sm text-muted-foreground leading-relaxed">2A Holden Street, Ashfield, NSW 2131, Australia</p>
            <a href="tel:+61292832758" className="text-sm text-gold hover:text-gold-glow transition-colors block py-1">+61 2 9283 2758</a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground text-center sm:text-left">
          {new Date().getFullYear()} Phap Mon Tam Linh. Nguyen dem cong duc nay huong ve khap tat ca chung sinh deu tron thanh Phat dao.
        </p>
        <p className="text-base text-gold/70 font-display shrink-0">Nam Mo A Di Da Phat</p>
      </div>
    </div>
  </footer>
);

export default Footer;
