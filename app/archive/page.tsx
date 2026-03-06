// app/archive/page.tsx — Archive index page (server)
import type { Metadata } from 'next'
import { ArchiveIcon } from 'lucide-react'
import { getArchiveIndex } from '@/lib/api/archive'
import ArchiveGrid from '@/components/archive/ArchiveGrid'
import type { ArchiveYear } from '@/types/strapi'

export const metadata: Metadata = {
  title: 'Lưu Trữ Bài Viết | Phật Môn Tịnh Lữ',
  description: 'Kho lưu trữ toàn bộ bài viết theo năm và tháng.',
}

export const revalidate = 3600

export default async function ArchivePage() {
  let data: ArchiveYear[] = []
  try {
    data = await getArchiveIndex()
  } catch {
    // nếu lỗi hiển thị trang trống
  }

  return (
    <main className="min-h-screen py-16">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-4">
          <ArchiveIcon className="w-7 h-7 text-gold" />
          <h1 className="font-display text-3xl text-foreground">Lưu Trữ</h1>
        </div>
        <p className="text-muted-foreground mb-12 leading-relaxed">
          Tổng hợp bài viết theo năm và tháng. Chọn tháng để xem danh sách bài viết.
        </p>

        <ArchiveGrid data={data} />
      </div>
    </main>
  )
}
