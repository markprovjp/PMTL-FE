// app/library/page.tsx — Server Component
// Fetch data server-side, truyền xuống LibraryClient để render
import type { Metadata } from 'next'
import { fetchDownloads, DOWNLOAD_CATEGORIES, type DownloadItem } from '@/lib/api/downloads'
import LibraryClient from '@/components/library/LibraryClient'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import StickyBanner from '@/components/StickyBanner'

export const metadata: Metadata = {
  title: 'Thư Viện Tài Liệu | Phật Môn Tịnh Lữ',
  description: 'Tổng hợp kinh điển, khai thị, audio, video và tài liệu tu học của Pháp Môn Tâm Linh. Tất cả miễn phí.',
}

export const revalidate = 3600

export default async function LibraryPage() {
  let allItems: DownloadItem[] = []

  try {
    const result = await fetchDownloads({ pageSize: 100 })
    allItems = result.items
  } catch {
    // hiển thị trang trống nếu lỗi
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="section-padding">
        <div className="container mx-auto px-6 lg:px-8">
          {/* Page Header */}
          <div className="flex flex-col items-center mb-16 text-center">
            <p className="text-gold text-sm font-semibold tracking-widest uppercase mb-4">
              Tai Lieu Tu Hoc
            </p>
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl text-foreground mb-5 text-balance">
              Thu Vien Tai Lieu
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl">
              Tong hop kinh dien, khai thi, audio, video va tai lieu tu hoc. Tat ca mien phi.
            </p>
          </div>
          <LibraryClient initialItems={allItems} categories={[...DOWNLOAD_CATEGORIES]} />
        </div>
      </main>
      <Footer />
      <StickyBanner />
    </div>
  )
}
