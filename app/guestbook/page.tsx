// app/guestbook/page.tsx — Guestbook main page (Server Component)
import type { Metadata } from 'next'
import { getGuestbookEntries, getGuestbookArchiveList, type ArchiveStat } from '@/lib/api/guestbook'
import GuestbookPageHeader from '@/components/guestbook/GuestbookPageHeader'
import GuestbookList from '@/components/guestbook/GuestbookList'
import GuestbookSidebar from '@/components/guestbook/GuestbookSidebar'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import StickyBanner from '@/components/StickyBanner'
import type { GuestbookList as GuestbookListType } from '@/types/strapi'

export const metadata: Metadata = {
  title: 'Sổ Lưu Bút & Hỏi Đáp | Phật Môn Tịnh Lữ',
  description: 'Nơi các thiện hữu giao lưu, hỏi đáp và chia sẻ kinh nghiệm tu học trên con đường Phật Pháp.',
}

const fallback: GuestbookListType = {
  data: [],
  meta: { pagination: { page: 1, pageSize: 20, pageCount: 0, total: 0 } },
}

export default async function GuestbookPage() {
  let initialData: GuestbookListType = fallback
  let archives: ArchiveStat[] = []

  try {
    const [entriesReq, archivesReq] = await Promise.all([
      getGuestbookEntries(1, 20),
      getGuestbookArchiveList()
    ])
    initialData = entriesReq
    archives = archivesReq
  } catch {
    // hiển thị trang trống nếu lỗi
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="section-padding">
        <div className="container mx-auto px-6 lg:px-8">

          {/* Page Header - Senior Friendly */}
          <GuestbookPageHeader />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
            {/* Main content */}
            <div className="lg:col-span-2 w-full min-w-0">
              <GuestbookList initialData={initialData} />
            </div>

            {/* Sidebar Archive */}
            <div>
              <GuestbookSidebar archives={archives} />
            </div>
          </div>

        </div>
      </main>
      <Footer />
      <StickyBanner />
    </div>
  )
}
