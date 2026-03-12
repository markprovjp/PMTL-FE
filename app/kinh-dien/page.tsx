import type { Metadata } from 'next'

import Footer from '@/components/Footer'
import HeaderServer from '@/components/HeaderServer'
import StickyBanner from '@/components/StickyBanner'
import SutraLibraryClient from '@/components/sutra/SutraLibraryClient'
import { fetchSutraList } from '@/lib/api/sutra'

export const revalidate = 600

export const metadata: Metadata = {
  title: 'Kinh Điển Đại Thừa | Pháp Môn Tâm Linh',
  description: 'Kho kinh điển đại thừa có phân tập/phẩm, lưu tiến độ đọc, bookmark và chú giải thuật ngữ ngay trong văn bản.',
}

export default async function SutraLibraryPage() {
  const sutras = await fetchSutraList().catch(() => [])

  return (
    <div className="min-h-screen bg-background">
      <StickyBanner />
      <HeaderServer />
      <main className="py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6">
          <section className="mb-8 rounded-xl border border-gold/15 bg-card/70 p-6 md:p-8">
            <p className="ant-label text-gold">Kinh điển đại thừa</p>
            <h1 className="ant-title mt-3 text-4xl text-foreground md:text-5xl">Thư viện Kinh</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground md:text-base">
              Đọc theo tập/phẩm, lưu lại vị trí đang đọc, đánh dấu bookmark và tra chú giải ngay trên văn bản để đồng tu tiện học, tiện ôn.
            </p>
          </section>
          <SutraLibraryClient items={sutras} />
        </div>
      </main>
      <Footer />
    </div>
  )
}

