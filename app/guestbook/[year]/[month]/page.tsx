// app/guestbook/[year]/[month]/page.tsx — Guestbook archive month page (server)
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeftIcon } from 'lucide-react'
import { getGuestbookArchive } from '@/lib/api/guestbook'
import GuestbookList from '@/components/guestbook/GuestbookList'
import type { GuestbookList as GuestbookListType } from '@/types/strapi'

interface Params {
  year: string
  month: string
}

const MONTH_VI = [
  '', 'Tháng Một', 'Tháng Hai', 'Tháng Ba', 'Tháng Tư', 'Tháng Năm', 'Tháng Sáu',
  'Tháng Bảy', 'Tháng Tám', 'Tháng Chín', 'Tháng Mười', 'Tháng Mười Một', 'Tháng Mười Hai',
]

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { year: yearStr, month: monthStr } = await params
  const y = parseInt(yearStr, 10)
  const m = parseInt(monthStr, 10)
  if (isNaN(y) || isNaN(m) || m < 1 || m > 12) return {}
  return {
    title: `Lưu Bút ${MONTH_VI[m]} ${y} | Phật Môn Tịnh Lữ`,
  }
}

export default async function GuestbookArchivePage({ params }: { params: Promise<Params> }) {
  const { year: yearStr, month: monthStr } = await params
  const year = parseInt(yearStr, 10)
  const month = parseInt(monthStr, 10)

  if (isNaN(year) || isNaN(month) || month < 1 || month > 12 || year < 2000) {
    notFound()
  }

  let initialData: GuestbookListType = {
    data: [],
    meta: { pagination: { page: 1, pageSize: 20, pageCount: 0, total: 0 } },
  }

  try {
    initialData = await getGuestbookArchive(year, month, 1, 20)
  } catch {
    // hiển thị trang trống
  }

  const monthLabel = `${MONTH_VI[month]} ${year}`

  return (
    <main className="min-h-screen py-16">
      <div className="container max-w-3xl mx-auto px-4">
        <Link
          href="/guestbook"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gold transition-colors mb-8"
        >
          <ChevronLeftIcon className="w-4 h-4" />
          Tất cả lưu bút
        </Link>

        <h1 className="font-display text-3xl text-foreground mb-2">Lưu Bút</h1>
        <p className="text-muted-foreground mb-10 text-sm">{monthLabel}</p>

        <GuestbookList initialData={initialData} year={year} month={month} />
      </div>
    </main>
  )
}
