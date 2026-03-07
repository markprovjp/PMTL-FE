'use client'

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { SearchIcon, MenuIcon, CloseIcon } from "@/components/icons/ZenIcons";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import CategoryNav, { CategoryNavMobile } from "@/components/CategoryNav";

/* ══════════════════════════════════════════════════════════════
   HEADER - Senior Friendly Buddhist Design
   - Larger touch targets (48px minimum)
   - Clear typography
   - High contrast
   - Simple navigation structure
══════════════════════════════════════════════════════════════ */

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
);

const ChevronDown = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
      className={`px-3 py-3 text-sm font-medium tracking-wide transition-all duration-200 flex items-center gap-1.5 rounded-lg min-h-[44px] ${isOpen ? "text-gold bg-gold/5" : "text-foreground/80 hover:text-gold hover:bg-gold/5"}`}
    >
      {label}
      <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}><ChevronDown /></motion.span>
    </button>
    <AnimatePresence>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className={`absolute left-0 top-full mt-1 bg-card border border-border rounded-xl shadow-elevated z-40 overflow-hidden ${columns > 1 ? `w-96` : 'w-64'}`}
          >
            <div className={columns > 1 ? `grid grid-cols-${columns} gap-0` : ''}>
              {columns === 1 ? (
                <div className="p-2 space-y-1">
                  {items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className="block px-4 py-3 text-sm text-foreground/80 hover:text-gold hover:bg-sage-light rounded-lg transition-all duration-200 min-h-[44px] flex items-center"
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
                          className="block px-3 py-2.5 text-sm text-foreground/80 hover:text-gold hover:bg-sage-light rounded-lg transition-all duration-200"
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

const MobileMenu = ({ onClose }: { onClose: () => void }) => {
  const { user, logout } = useAuth();
  const [openSection, setOpenSection] = useState<string | null>(null);

  const sections = [
    {
      id: 'tu-hoc',
      label: "Tu Học",
      items: [
        { label: "Hướng Dẫn Sơ Học", href: "/beginner-guide" },
        { label: "Bạch Thoại Phật Pháp", href: "/hub/bach-thoai-phat-phap" },
        { label: "Thường Thức Niệm Phật", href: "/hub/thuong-thuc-niem-phat" },
        { label: "Thư Viện Tài Liệu", href: "/library" },
        { label: "Phim Truyện & Video", href: "/videos" },
        { label: "Đài Phát Thanh", href: "/radio" },
        { label: "Danh Bạ Toàn Cầu", href: "/directory" },
      ]
    },
    {
      id: 'cong-dong',
      label: "Cộng Đồng",
      items: [
        { label: "Hỏi Đáp & Sổ Lưu Bút", href: "/guestbook" },
        { label: "Sự Kiện & Pháp Hội", href: "/events" },
      ]
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
      {/* Mobile Header */}
      <div className="flex items-center justify-between p-5 border-b border-border bg-card sticky top-0 z-10">
        <Link href="/" onClick={onClose} className="flex items-center gap-2">
          <Image
            src="/images/logoo.png"
            alt="Phap Mon Tam Linh"
            width={180}
            height={56}
            className="h-12 w-auto object-contain"
          />
        </Link>
        <button 
          onClick={onClose} 
          className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-foreground hover:bg-border transition-colors"
          aria-label="Dong menu"
        >
          <CloseIcon />
        </button>
      </div>

      {/* Mobile Navigation */}
      <nav className="p-5 space-y-3">
        {/* User Section */}
        {user ? (
          <div className="flex items-center justify-between p-4 mb-4 rounded-xl bg-card border border-border">
            <Link href="/profile" onClick={onClose} className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center overflow-hidden">
                {user.avatar_url ? (
                  <Image src={user.avatar_url} alt="Avatar" width={48} height={48} className="w-full h-full object-cover" />
                ) : (
                  <span className="font-display text-lg text-gold">{(user.fullName || user.username)[0].toUpperCase()}</span>
                )}
              </div>
              <div>
                <p className="text-base font-medium text-foreground">{user.fullName || user.username}</p>
                <p className="text-sm text-muted-foreground">Xem ho so</p>
              </div>
            </Link>
            <button 
              onClick={() => { logout(); onClose(); }} 
              className="px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              Dang xuat
            </button>
          </div>
        ) : (
          <Link 
            href="/auth" 
            onClick={onClose} 
            className="flex items-center justify-center gap-3 w-full py-4 mb-4 bg-gold text-black rounded-xl text-base font-semibold min-h-[56px]"
          >
            <UserIcon /> Dang nhap / Dang ky
          </Link>
        )}

        {/* Main Navigation Links - Large Touch Targets */}
        <Link 
          href="/" 
          onClick={onClose} 
          className="flex items-center px-4 py-4 text-lg font-display text-foreground rounded-xl hover:bg-sage-light transition-colors min-h-[56px]"
        >
          Trang Chu
        </Link>

        <Link 
          href="/blog" 
          onClick={onClose} 
          className="flex items-center px-4 py-4 text-lg font-display text-foreground rounded-xl hover:bg-sage-light transition-colors min-h-[56px]"
        >
          Khai Thi
        </Link>

        <Link 
          href="/lunar-calendar" 
          onClick={onClose} 
          className="flex items-center px-4 py-4 text-lg font-display text-foreground rounded-xl hover:bg-sage-light transition-colors min-h-[56px]"
        >
          Lich Tu Hoc
        </Link>

        {/* Highlighted Niem Kinh Link */}
        <Link 
          href="/niem-kinh" 
          onClick={onClose} 
          className="flex items-center px-4 py-4 text-lg font-display text-gold bg-gold/10 rounded-xl border border-gold/20 min-h-[56px]"
        >
          Niem Kinh
        </Link>

        <Link 
          href="/shares" 
          onClick={onClose} 
          className="flex items-center px-4 py-4 text-lg font-display text-foreground rounded-xl hover:bg-sage-light transition-colors min-h-[56px]"
        >
          Dien Dan
        </Link>

        {/* Expandable Sections */}
        {sections.map((s) => (
          <div key={s.id} className="rounded-xl border border-border bg-card overflow-hidden">
            <button
              onClick={() => setOpenSection(openSection === s.id ? null : s.id)}
              className="w-full flex items-center justify-between p-4 text-left font-display text-lg text-foreground min-h-[56px]"
            >
              {s.label}
              <motion.span 
                animate={{ rotate: openSection === s.id ? 180 : 0 }}
                className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center"
              >
                <ChevronDown />
              </motion.span>
            </button>
            <AnimatePresence>
              {openSection === s.id && (
                <motion.div 
                  initial={{ height: 0 }} 
                  animate={{ height: "auto" }} 
                  exit={{ height: 0 }} 
                  className="overflow-hidden border-t border-border"
                >
                  <div className="p-2 space-y-1">
                    {s.items.map((item) => (
                      <Link 
                        key={item.href} 
                        href={item.href} 
                        onClick={onClose} 
                        className="block px-4 py-3 text-base text-foreground/80 hover:text-gold hover:bg-sage-light rounded-lg transition-colors min-h-[48px] flex items-center"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}

        {/* Category Topics Button */}
        <div className="pt-2">
          <button
            onClick={() => setOpenSection(openSection === 'khai-thi' ? null : 'khai-thi')}
            className={`w-full flex items-center justify-between p-4 text-left font-semibold text-base tracking-wide rounded-xl border-2 transition-all min-h-[56px] ${openSection === 'khai-thi'
                ? 'border-gold bg-gold/10 text-gold'
                : 'border-gold/40 text-gold hover:border-gold hover:bg-gold/5'
              }`}
          >
            Chu De Khai Thi
            <motion.span 
              animate={{ rotate: openSection === 'khai-thi' ? 180 : 0 }} 
              transition={{ duration: 0.2 }}
              className="w-8 h-8 rounded-lg bg-gold/20 flex items-center justify-center"
            >
              <ChevronDown />
            </motion.span>
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
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                  <CategoryNavMobile onClose={onClose} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Support Link */}
        <Link 
          href="/donations" 
          onClick={onClose} 
          className="flex items-center px-4 py-4 text-lg font-display text-sage rounded-xl hover:bg-sage-light transition-colors min-h-[56px] mt-4"
        >
          Ho Tri Phat Phap
        </Link>
      </nav>
    </motion.div>
  );
};

const Header = () => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout, loading } = useAuth();

  const groups = {
    tuHoc: [
      { label: "Huong Dan So Hoc", href: "/beginner-guide" },
      { label: "Bach Thoai Phat Phap", href: "/hub/bach-thoai-phat-phap" },
      { label: "Thuong Thuc Niem Phat", href: "/hub/thuong-thuc-niem-phat" },
      { label: "Thu Vien Tai Lieu", href: "/library" },
      { label: "Phim Truyen & Video", href: "/videos" },
      { label: "Dai Phat Thanh", href: "/radio" },
      { label: "Danh Ba Toan Cau", href: "/directory" },
    ],
    congDong: [
      { label: "Hoi Dap & So Luu But", href: "/guestbook" },
      { label: "Su Kien & Phap Hoi", href: "/events" },
    ]
  };

  return (
    <header className="sticky top-0 z-50">
      {/* Main Header Bar - Taller for better touch targets */}
      <div className="relative z-[60] bg-background/98 backdrop-blur-lg border-b border-border shadow-sm">
        <div className="container mx-auto px-4 lg:px-8 flex items-center justify-between h-20 gap-4">
          {/* Logo */}
          <div className="flex items-center gap-6 min-w-0">
            <Link href="/" className="flex items-center hover:opacity-90 transition-opacity flex-shrink-0">
              <Image
                src="/images/logoo.png"
                alt="Phap Mon Tam Linh"
                width={180}
                height={56}
                className="h-12 w-auto object-contain"
                priority
              />
            </Link>

            {/* Desktop Navigation - Larger text and spacing */}
            <nav className="hidden lg:flex items-center gap-1">
              <Link 
                href="/" 
                className="px-3 py-3 text-sm font-medium text-foreground/80 hover:text-gold hover:bg-gold/5 rounded-lg transition-all duration-200 whitespace-nowrap min-h-[44px] flex items-center"
              >
                Trang Chu
              </Link>

              <Link 
                href="/blog" 
                className="px-3 py-3 text-sm font-medium text-foreground/80 hover:text-gold hover:bg-gold/5 rounded-lg transition-all duration-200 whitespace-nowrap min-h-[44px] flex items-center"
              >
                Khai Thi
              </Link>

              <Link 
                href="/lunar-calendar" 
                className="px-3 py-3 text-sm font-medium text-foreground/80 hover:text-gold hover:bg-gold/5 rounded-lg transition-all duration-200 whitespace-nowrap min-h-[44px] flex items-center"
              >
                Lich Tu
              </Link>

              {/* Highlighted Niem Kinh */}
              <Link 
                href="/niem-kinh" 
                className="px-3 py-3 text-sm font-semibold text-gold bg-gold/10 hover:bg-gold/15 rounded-lg transition-all duration-200 whitespace-nowrap min-h-[44px] flex items-center"
              >
                Niem Kinh
              </Link>

              <Link 
                href="/shares" 
                className="px-3 py-3 text-sm font-medium text-foreground/80 hover:text-gold hover:bg-gold/5 rounded-lg transition-all duration-200 whitespace-nowrap min-h-[44px] flex items-center"
              >
                Dien Dan
              </Link>

              <NavDropdown
                label="Tu Hoc"
                items={groups.tuHoc}
                isOpen={activeDropdown === 'tuHoc'}
                onToggle={() => setActiveDropdown(activeDropdown === 'tuHoc' ? null : 'tuHoc')}
                onClose={() => setActiveDropdown(null)}
                columns={2}
              />

              <NavDropdown
                label="Cong Dong"
                items={groups.congDong}
                isOpen={activeDropdown === 'congDong'}
                onToggle={() => setActiveDropdown(activeDropdown === 'congDong' ? null : 'congDong')}
                onClose={() => setActiveDropdown(null)}
              />

              <button
                onClick={() => { setCategoryOpen(!categoryOpen); setActiveDropdown(null); }}
                className={`px-3 py-3 text-sm font-medium tracking-wide transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap rounded-lg min-h-[44px] ${categoryOpen ? "text-gold bg-gold/5" : "text-foreground/80 hover:text-gold hover:bg-gold/5"}`}
              >
                Chu De
                <motion.span animate={{ rotate: categoryOpen ? 180 : 0 }} transition={{ duration: 0.2 }}><ChevronDown /></motion.span>
              </button>
            </nav>
          </div>

          {/* Right Actions - Larger touch targets */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link 
              href="/search" 
              className="w-11 h-11 rounded-xl bg-secondary/50 hover:bg-secondary flex items-center justify-center text-foreground/70 hover:text-gold transition-all flex-shrink-0"
              aria-label="Tim kiem"
            >
              <SearchIcon />
            </Link>

            {!loading && (
              user ? (
                <div className="relative hidden md:block flex-shrink-0">
                  <button 
                    onClick={() => setUserMenuOpen(!userMenuOpen)} 
                    className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border hover:border-gold/40 hover:bg-gold/5 transition-all min-h-[44px]"
                  >
                    <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {user.avatar_url ? (
                        <Image src={user.avatar_url} alt="Avatar" width={32} height={32} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-sm text-gold font-semibold">{(user.fullName || user.username)[0].toUpperCase()}</span>
                      )}
                    </div>
                    <span className="text-sm text-foreground max-w-24 truncate hidden lg:inline">{user.fullName || user.username}</span>
                    <ChevronDown />
                  </button>
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 8 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, y: 8 }} 
                        className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-xl shadow-elevated overflow-hidden z-[100]"
                      >
                        <div className="p-3 border-b border-border bg-secondary/30">
                          <p className="text-sm text-foreground font-medium truncate">{user.fullName || user.username}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                        <div className="p-2">
                          <Link 
                            href="/profile" 
                            onClick={() => setUserMenuOpen(false)} 
                            className="block px-4 py-3 text-sm text-foreground hover:bg-sage-light hover:text-gold rounded-lg transition-colors min-h-[44px] flex items-center"
                          >
                            Ho so cua toi
                          </Link>
                          <button 
                            onClick={() => { logout(); setUserMenuOpen(false); }} 
                            className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-500/10 rounded-lg transition-colors min-h-[44px] flex items-center"
                          >
                            Dang xuat
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link 
                  href="/auth" 
                  className="hidden md:flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-gold text-black hover:bg-gold/90 rounded-xl transition-all min-h-[44px]"
                >
                  <UserIcon /> Dang nhap
                </Link>
              )
            )}

            {/* Mobile Menu Button - Large touch target */}
            <button 
              className="md:hidden w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-foreground hover:bg-border transition-colors" 
              onClick={() => setMobileOpen(true)}
              aria-label="Mo menu"
            >
              <MenuIcon />
            </button>
          </div>
        </div>
      </div>

      {/* Category Dropdown Overlay */}
      <AnimatePresence>
        {categoryOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" 
              onClick={() => setCategoryOpen(false)} 
            />
            <motion.div 
              initial={{ height: 0, opacity: 0 }} 
              animate={{ height: "auto", opacity: 1 }} 
              exit={{ height: 0, opacity: 0 }} 
              transition={{ duration: 0.3 }} 
              className="absolute left-0 right-0 top-full z-[45] overflow-hidden border-b border-border bg-card shadow-elevated"
            >
              <CategoryNav onClose={() => setCategoryOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>{mobileOpen && <MobileMenu onClose={() => setMobileOpen(false)} />}</AnimatePresence>
      {userMenuOpen && <div className="fixed inset-0 z-50" onClick={() => setUserMenuOpen(false)} />}
    </header>
  );
};

export default Header;
