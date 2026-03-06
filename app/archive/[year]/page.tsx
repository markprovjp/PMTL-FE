// app/archive/[year]/page.tsx — Archive year overview (server)
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeftIcon } from 'lucide-react'
import { getArchiveIndex, getArchivePosts } from '@/lib/api/archive'
import ArchiveGrid from '@/components/archive/ArchiveGrid'
import ArchivePostList from '@/components/archive/ArchivePostList'
import type { ArchiveYear, StrapiList, BlogPost } from '@/types/strapi'

interface Params {
  year: string
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { year: yearStr } = await params
  const y = parseInt(yearStr, 10)
  if (isNaN(y)) return {}
  return { title: `Lưu Trữ Năm ${y} | Phật Môn Tịnh Lữ` }
}

export const revalidate = 3600

export default async function ArchiveYearPage({ params }: { params: Promise<Params> }) {
  const { year: yearStr } = await params
  const year = parseInt(yearStr, 10)
  if (isNaN(year) || year < 2000) notFound()

  let index: ArchiveYear[] = []
  let posts: StrapiList<BlogPost> = {
    data: [],
    meta: { pagination: { page: 1, pageSize: 12, pageCount: 0, total: 0 } },
  }

  try {
    ;[index, posts] = await Promise.all([getArchiveIndex(), getArchivePosts(year, undefined, 1, 20)])
  } catch {
    // hiển thị trang trống
  }

  // Filter index to just this year for the month grid
  const yearData = index.filter((y) => y.year === year)

  return (
    <main className="min-h-screen py-16">
      <div className="container max-w-4xl mx-auto px-4">
        <Link
          href="/archive"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gold transition-colors mb-8"
        >
          <ChevronLeftIcon className="w-4 h-4" />
          Tổng hợp lưu trữ
        </Link>

        <h1 className="font-display text-3xl text-foreground mb-10">Năm {year}</h1>

        {yearData.length > 0 && (
          <div className="mb-12">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Theo tháng
            </h2>
            <ArchiveGrid data={yearData} />
          </div>
        )}

        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-6">
            Tất cả bài viết
          </h2>
          <ArchivePostList data={posts} year={year} />
        </div>
      </div>
    </main>
  )
}
