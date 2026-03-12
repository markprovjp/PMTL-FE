'use client'

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { SearchIcon, MenuIcon, CloseIcon } from "@/components/icons/ZenIcons";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import CategoryNav, { CategoryNavMobile } from "@/components/CategoryNav";
import NotificationMenu from "@/components/notifications/NotificationMenu";
import type { NavItem } from "@/lib/api/navigation";
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock";

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
);

const ChevronDown = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const NavDropdown = ({ label, items, isOpen, onToggle, onClose, columns = 1 }: {
  label: string;
  items: { label: string; href: string }[];
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  columns?: number;
}) => (
  <div className="relative group">
    <button
      onClick={onToggle}
      className={`px-2 lg:px-2.5 py-2.5 text-xs font-medium tracking-wide transition-colors flex items-center gap-1 ${isOpen ? "text-gold" : "text-muted-foreground hover:text-gold"}`}
    >
      {label}
      <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}><ChevronDown /></motion.span>
    </button>
    <AnimatePresence>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.12 }}
            className={`absolute left-0 top-full mt-0.5 bg-card border border-border rounded-lg shadow-lg z-40 overflow-hidden ${columns > 1 ? `w-80` : 'w-56'}`}
          >
            <div className={columns > 1 ? `grid grid-cols-${columns} gap-0` : ''}>
              {columns === 1 ? (
                <div className="p-1.5 space-y-0.5">
                  {items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className="block px-3 py-1.5 text-xs text-muted-foreground hover:text-gold hover:bg-secondary/60 rounded transition-colors"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              ) : (
                <>
                  {Array.from({ length: columns }).map((_, col) => (
                    <div key={col} className="p-2 border-r border-border last:border-r-0">
                      {items.slice(col * Math.ceil(items.length / columns), (col + 1) * Math.ceil(items.length / columns)).map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={onClose}
                          className="block px-2 py-1 text-xs text-muted-foreground hover:text-gold hover:bg-secondary/50 rounded transition-colors"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  ))}
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  </div>
);

const MobileMenu = ({ onClose, tuHoc, congDong, hoTri }: { onClose: () => void; tuHoc: NavItem[]; congDong: NavItem[]; hoTri: NavItem }) => {
  const { user, logout } = useAuth();
  const [openSection, setOpenSection] = useState<string | null>(null);

  const sections = [
    {
      id: 'tu-hoc',
      label: "Tu Học",
      items: tuHoc
    },
    {
      id: 'cong-dong',
      label: "Cộng Đồng",
      items: congDong
    },
  ];

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "tween", duration: 0.3 }}
      className="fixed inset-0 z-[100] bg-background overflow-y-auto"
    >
      <div className="flex items-center justify-between p-6 border-b border-border">
        <Link href="/" onClick={onClose} className="flex items-center gap-2">
          <Image
            src="/images/logoo.png"
            alt="Phap Mon Tam Linh"
            width={160}
            height={50}
            className="h-10 w-auto object-contain"
          />
        </Link>
        <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground">
          <CloseIcon />
        </button>
      </div>
      <nav className="p-6 space-y-2">
        {user ? (
          <div className="flex items-center justify-between py-3 mb-4 border-b border-border">
            <Link href="/profile" onClick={onClose} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gold/20 flex items-center justify-center overflow-hidden">
                {user.avatar_url ? (
                  <Image src={user.avatar_url} alt="Avatar" width={36} height={36} className="w-full h-full object-cover" />
                ) : (
                  <span className="font-display text-sm text-gold">{(user.fullName || user.username)[0].toUpperCase()}</span>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{user.fullName || user.username}</p>
                <p className="text-xs text-muted-foreground">Xem hồ sơ</p>
              </div>
            </Link>
            <button onClick={() => { logout(); onClose(); }} className="text-xs text-red-400">Đăng xuất</button>
          </div>
        ) : (
          <Link href="/auth" onClick={onClose} className="flex items-center justify-center gap-2 w-full py-3 mb-6 border border-gold/50 text-gold rounded-lg text-sm font-medium">
            <UserIcon /> Đăng nhập / Đăng ký
          </Link>
        )}

        <Link href="/" onClick={onClose} className="block py-3 px-2 text-base font-display text-foreground border-b border-border/50">
          Trang Chủ
        </Link>

        <Link href="/blog" onClick={onClose} className="block py-3 px-2 text-base font-display text-foreground border-b border-border/50">
          Khai Thị (Blog)
        </Link>

        <Link href="/lunar-calendar" onClick={onClose} className="block py-3 px-2 text-base font-display text-foreground border-b border-border/50">
          Lịch Tu Học
        </Link>
        <Link href="/niem-kinh" onClick={onClose} className="block py-3 px-2 text-base font-display text-gold border-b border-border/50">
          Niệm Kinh
        </Link>
        <Link href="/shares" onClick={onClose} className="block py-3 px-2 text-base font-display text-foreground border-b border-border/50">
          Diễn Đàn
        </Link>
        <NotificationMenu mobile />

        {sections.map((s) => (
          <div key={s.id} className="border-b border-border/50">
            <button
              onClick={() => setOpenSection(openSection === s.id ? null : s.id)}
              className="w-full flex items-center justify-between py-4 px-2 text-left font-display text-base text-foreground"
            >
              {s.label}
              <motion.span animate={{ rotate: openSection === s.id ? 180 : 0 }}><ChevronDown /></motion.span>
            </button>
            <AnimatePresence>
              {openSection === s.id && (
                <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden pl-4 pb-2">
                  {s.items.map((item) => (
                    <Link key={item.href} href={item.href} onClick={onClose} className="block py-2.5 text-sm text-muted-foreground hover:text-gold">
                      {item.label}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}

        <div className="px-2 py-3">
          <button
            onClick={() => setOpenSection(openSection === 'khai-thi' ? null : 'khai-thi')}
            className={`w-full flex items-center justify-between py-3.5 px-4 text-left font-semibold text-sm tracking-wide rounded-lg border-2 transition-all ${openSection === 'khai-thi'
              ? 'border-gold bg-gold/5 text-gold'
              : 'border-gold/50 text-gold hover:border-gold hover:bg-gold/5'
              }`}
          >
            Chủ Đề Khai Thị
            <motion.span animate={{ rotate: openSection === 'khai-thi' ? 180 : 0 }} transition={{ duration: 0.2 }}><ChevronDown /></motion.span>
          </button>
          <AnimatePresence>
            {openSection === 'khai-thi' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden mt-2"
              >
                <div className="rounded-lg border border-border bg-secondary/20 overflow-hidden">
                  <CategoryNavMobile onClose={onClose} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Link href={hoTri.href} onClick={onClose} className="block py-4 px-2 text-base font-display text-foreground">
          {hoTri.label}
        </Link>
      </nav>
    </motion.div>
  );
};

const Header = ({ tuHoc, congDong, hoTri }: { tuHoc?: NavItem[]; congDong?: NavItem[]; hoTri?: NavItem } = {}) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout, loading } = useAuth();

  useBodyScrollLock(mobileOpen || categoryOpen || userMenuOpen);

  // Default nav items nếu không truyền props
  const defaultTuHoc: NavItem[] = [
    { label: "Hướng Dẫn Sơ Học", href: "/beginner-guide" },
    { label: "Bạch Thoại Phật Pháp", href: "/hub/bach-thoai-phat-phap" },
    { label: "Thường Thức Niệm Phật", href: "/hub/thuong-thuc-niem-phat" },
    { label: "Thư Viện Tài Liệu", href: "/library" },
    { label: "Phim Truyện & Video", href: "/videos" },
    { label: "Đài Phát Thanh", href: "/radio" },
    { label: "Danh Bạ Toàn Cầu", href: "/directory" },
  ]

  const defaultCongDong: NavItem[] = [
    { label: "Hỏi Đáp & Sổ Lưu Bút", href: "/guestbook" },
    { label: "Sự Kiện & Pháp Hội", href: "/events" },
  ]

  const defaultHoTri: NavItem = { label: "Hộ Trì Phật Pháp", href: "/donations" }

  const groups = {
    tuHoc: tuHoc ?? defaultTuHoc,
    congDong: congDong ?? defaultCongDong,
    hoTri: hoTri ?? defaultHoTri
  };

  return (
    <header className="sticky top-0 z-50">
      <div className="relative z-[60] bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-3 lg:px-6 flex items-center justify-between h-16 gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/" className="flex items-center hover:opacity-80 transition-opacity flex-shrink-0">
              <Image
                src="/images/logoo.png"
                alt="Phap Mon Tam Linh"
                width={160}
                height={48}
                className="h-10 w-auto object-contain"
                priority
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-0.5">
              <Link href="/" className="px-2 py-2.5 text-xs font-medium text-muted-foreground hover:text-gold transition-colors whitespace-nowrap">
                Trang Chủ
              </Link>

              <Link href="/blog" className="px-2 py-2.5 text-xs font-medium text-muted-foreground hover:text-gold transition-colors whitespace-nowrap">
                Khai Thị
              </Link>

              <Link href="/lunar-calendar" className="px-2 py-2.5 text-xs font-medium text-muted-foreground hover:text-gold transition-colors whitespace-nowrap">
                Lịch Tu
              </Link>

              <Link href="/niem-kinh" className="px-2 py-2.5 text-xs font-medium text-muted-foreground hover:text-gold transition-colors whitespace-nowrap">
                Niệm Kinh
              </Link>

              <Link href="/shares" className="px-2 py-2.5 text-xs font-medium text-muted-foreground hover:text-gold transition-colors whitespace-nowrap">
                Diễn Đàn
              </Link>

              <NavDropdown
                label="Tu Học"
                items={groups.tuHoc}
                isOpen={activeDropdown === 'tuHoc'}
                onToggle={() => setActiveDropdown(activeDropdown === 'tuHoc' ? null : 'tuHoc')}
                onClose={() => setActiveDropdown(null)}
                columns={2}
              />

              <NavDropdown
                label="Cộng Đồng"
                items={groups.congDong}
                isOpen={activeDropdown === 'congDong'}
                onToggle={() => setActiveDropdown(activeDropdown === 'congDong' ? null : 'congDong')}
                onClose={() => setActiveDropdown(null)}
              />

              <button
                onClick={() => { setCategoryOpen(!categoryOpen); setActiveDropdown(null); }}
                className={`px-2 py-2.5 text-xs font-medium tracking-wide transition-colors flex items-center gap-1 whitespace-nowrap ${categoryOpen ? "text-gold" : "text-muted-foreground hover:text-gold"}`}
              >
                Chủ Đề
                <motion.span animate={{ rotate: categoryOpen ? 180 : 0 }} transition={{ duration: 0.2 }}><ChevronDown /></motion.span>
              </button>

              <Link href={groups.hoTri.href} className="px-2 py-2.5 text-xs font-medium text-gold/70 hover:text-gold transition-colors whitespace-nowrap ml-1 border-l border-border/50 pl-3">
                {groups.hoTri.label}
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Link href="/search" className="rounded-md border border-transparent p-1.5 text-muted-foreground transition-colors hover:border-gold/25 hover:text-gold flex-shrink-0">
              <SearchIcon />
            </Link>
            <NotificationMenu />

            {!loading && (
              user ? (
                <div className="relative hidden md:block flex-shrink-0">
                  <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 transition-all hover:border-gold/40">
                    <div className="flex size-4 items-center justify-center overflow-hidden rounded-full bg-gold/20 flex-shrink-0">
                      {user.avatar_url ? (
                        <Image src={user.avatar_url} alt="Avatar" width={16} height={16} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] text-gold font-bold">{(user.fullName || user.username)[0].toUpperCase()}</span>
                      )}
                    </div>
                    <span className="text-xs text-foreground max-w-20 truncate hidden lg:inline">{user.fullName || user.username}</span>
                    <ChevronDown />
                  </button>
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} className="absolute right-0 top-full z-[100] mt-2 w-52 overflow-hidden rounded-lg border border-border bg-card shadow-ant">
                        <div className="p-2 border-b border-border"><p className="text-xs text-foreground px-2 py-1 truncate">{user.email}</p></div>
                        <div className="p-1">
                          <Link href="/profile" onClick={() => setUserMenuOpen(false)} className="block rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-secondary">Hồ sơ của tôi</Link>
                          <button onClick={() => { logout(); setUserMenuOpen(false); }} className="w-full rounded-md px-3 py-2 text-left text-sm text-red-400 transition-colors hover:bg-red-500/10">Đăng xuất</button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link href="/auth" className="hidden md:flex items-center gap-1.5 rounded-md border border-gold/40 px-3 py-1.5 text-xs font-medium text-gold transition-all hover:bg-gold/10">
                  <UserIcon /> Đăng nhập
                </Link>
              )
            )}

            <button className="md:hidden p-2 text-muted-foreground hover:text-foreground" onClick={() => setMobileOpen(true)}>
              <MenuIcon />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {categoryOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={() => setCategoryOpen(false)} />
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="absolute left-0 right-0 top-full z-[45] overflow-hidden border-b border-border bg-card shadow-2xl">
              <CategoryNav onClose={() => setCategoryOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>{mobileOpen && <MobileMenu onClose={() => setMobileOpen(false)} tuHoc={groups.tuHoc} congDong={groups.congDong} hoTri={groups.hoTri} />}</AnimatePresence>
      {userMenuOpen && <div className="fixed inset-0 z-50" onClick={() => setUserMenuOpen(false)} />}
    </header>
  );
};

export default Header;
