// app/guestbook/page.tsx — Guestbook main page (server)
import type { Metadata } from 'next'
import { BookHeartIcon } from 'lucide-react'
import { getGuestbookEntries } from '@/lib/api/guestbook'
import GuestbookList from '@/components/guestbook/GuestbookList'
import type { GuestbookList as GuestbookListType } from '@/types/strapi'

export const metadata: Metadata = {
  title: 'Lưu Bút | Phật Môn Tịnh Lữ',
  description: 'Những chia sẻ của hành giả và thiện hữu trên con đường tu học.',
}

const fallback: GuestbookListType = {
  data: [],
  meta: { pagination: { page: 1, pageSize: 20, pageCount: 0, total: 0 } },
}

export default async function GuestbookPage() {
  let initialData: GuestbookListType = fallback
  try {
    initialData = await getGuestbookEntries(1, 20)
  } catch {
    // hiển thị trang trống nếu lỗi
  }

  return (
    <main className="min-h-screen py-16">
      <div className="container max-w-3xl mx-auto px-4">
        {/* Heading */}
        <div className="flex items-center gap-3 mb-4">
          <BookHeartIcon className="w-7 h-7 text-gold" />
          <h1 className="font-display text-3xl text-foreground">Lưu Bút</h1>
        </div>
        <p className="text-muted-foreground mb-12 leading-relaxed">
          Mỗi dòng lưu bút là một kỷ niệm trên con đường tu học. Quý thiện hữu hoan hỷ chia sẻ.
        </p>

        <GuestbookList initialData={initialData} />
      </div>
    </main>
  )
}
