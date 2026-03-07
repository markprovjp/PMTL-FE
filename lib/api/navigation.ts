// ─────────────────────────────────────────────────────────────
//  lib/api/navigation.ts — Navigation builder
//  Server-side only — fetch hub-pages + build menu structure
// ─────────────────────────────────────────────────────────────

import { getHubPages } from '@/lib/api/hub'
import type { HubPage } from '@/types/strapi'

export interface NavItem {
  label: string
  href: string
}

export interface NavGroup {
  title: string
  items: NavItem[]
}

export interface NavigationData {
  topLevel: NavItem[]
  tuHoc: NavGroup['items']
  congDong: NavGroup['items']
  hoTri: NavItem
}

/**
 * Build navigation structure from CMS
 * - Top-level: cố định
 * - Tu Học: từ hub-pages + system links
 * - Cộng Đồng: cố định
 * - Hộ Trì: cố định
 */
export async function buildNavigation(): Promise<NavigationData> {
  // Fetch hub-pages có showInMenu=true, sắp xếp theo sortOrder
  const hubPages = await getHubPages()

  // System links (Thư Viện, Video, Radio, Danh Bạ) — luôn hiển thị
  const systemLinks: NavItem[] = [
    { label: "Thư Viện Tài Liệu", href: "/library" },
    { label: "Phim Truyện & Video", href: "/videos" },
    { label: "Đài Phát Thanh", href: "/radio" },
    { label: "Danh Bạ Toàn Cầu", href: "/directory" },
  ]

  // Chuyển hub-pages thành nav items
  const hubItems: NavItem[] = hubPages.map((page: HubPage) => ({
    label: page.title,
    href: `/hub/${page.slug}`,
  }))

  return {
    topLevel: [
      { label: "Trang Chủ", href: "/" },
      { label: "Khai Thị", href: "/blog" },
      { label: "Lịch Tu Học", href: "/lunar-calendar" },
      { label: "Niệm Kinh", href: "/niem-kinh" },
      { label: "Diễn Đàn", href: "/shares" },
    ],
    tuHoc: [...hubItems, ...systemLinks],
    congDong: [
      { label: "Hỏi Đáp & Sổ Lưu Bút", href: "/guestbook" },
      { label: "Sự Kiện & Pháp Hội", href: "/events" },
    ],
    hoTri: { label: "Hộ Trì Phật Pháp", href: "/donations" },
  }
}
