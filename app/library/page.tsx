'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import StickyBanner from '@/components/StickyBanner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { BookOpen, Download, Headphones, Globe, ChevronRight } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

// ── Types ────────────────────────────────────────────────────
interface Book {
  id: string
  titleVi: string
  titleCn: string
  description?: string
  color: string
  readUrl?: string
  pdfUrl?: string
  audioUrl?: string
}

interface ShelfGroup {
  label: string
  books: Book[]
}

interface Shelf {
  id: string
  title: string
  description: string
  groups: ShelfGroup[]
}

// ── Color palettes per shelf ─────────────────────────────────
const C = {
  amber:   'from-amber-800/80 to-amber-700/60 border-amber-600/30',
  orange:  'from-orange-800/80 to-orange-700/60 border-orange-600/30',
  teal:    'from-teal-800/80 to-teal-700/60 border-teal-600/30',
  jade:    'from-emerald-800/80 to-emerald-700/60 border-emerald-600/30',
  rose:    'from-rose-800/80 to-rose-700/60 border-rose-600/30',
  pink:    'from-pink-800/80 to-pink-700/60 border-pink-600/30',
  purple:  'from-purple-800/80 to-purple-700/60 border-purple-600/30',
  indigo:  'from-indigo-800/80 to-indigo-700/60 border-indigo-600/30',
  blue:    'from-blue-800/80 to-blue-700/60 border-blue-600/30',
  sky:     'from-sky-800/80 to-sky-700/60 border-sky-600/30',
  green:   'from-green-800/80 to-green-700/60 border-green-600/30',
  red:     'from-red-800/80 to-red-700/60 border-red-600/30',
}

// ── Data ─────────────────────────────────────────────────────
const shelves: Shelf[] = [
  {
    id: 'nhap-mon',
    title: 'Kệ 1 — Nhập Môn',
    description: 'Vạn sự khởi đầu nan. Nếu bạn là người mới, đang bỡ ngỡ chưa biết bắt đầu từ đâu, hãy ghé kệ này đầu tiên. Tại đây có tấm bản đồ chỉ đường tỉ mỉ từ cách niệm câu kinh đầu tiên, nghi thức lập bàn thờ, cho đến cách dùng Ngôi Nhà Nhỏ để trả nợ nghiệp.',
    groups: [
      {
        label: '',
        books: [
          { id: 'nm-1', titleVi: 'Cẩm Nang Nhập Môn Pháp Môn Tâm Linh', titleCn: '心灵法门入门手册', color: C.amber, description: 'Tài liệu nhập môn toàn diện giới thiệu Pháp Môn Tâm Linh, hướng dẫn từng bước từ cơ bản đến nâng cao.', pdfUrl: '#', readUrl: '#' },
          { id: 'nm-2', titleVi: 'Phật Giáo Niệm Tụng Hợp Tập', titleCn: '经文念诵集', color: C.amber, description: 'Tổng hợp các bài kinh văn cần thiết cho việc tu học hàng ngày.', pdfUrl: '#', readUrl: '#' },
          { id: 'nm-3', titleVi: 'Kim Chỉ Nam Tụng Niệm Ngôi Nhà Nhỏ', titleCn: '小房子念诵指南', color: C.amber, description: 'Hướng dẫn chi tiết cách viết và niệm Ngôi Nhà Nhỏ để siêu độ oan gia trái chủ.', pdfUrl: '#', readUrl: '#' },
          { id: 'nm-4', titleVi: 'Tuyển Tập Khai Thị Về Việc Thiết Lập Bàn Thờ Phật', titleCn: '设佛台开示合集', color: C.orange },
          { id: 'nm-5', titleVi: 'Phật Học Vấn Đáp 175 Câu', titleCn: '佛学问答175问', color: C.orange },
          { id: 'nm-6', titleVi: 'Cẩm Nang Hướng Dẫn Hoằng Pháp Độ Nhân', titleCn: '弘法度人辅导手册', color: C.orange },
        ],
      },
    ],
  },
  {
    id: 'bach-thoai',
    title: 'Kệ 2 — Bạch Thoại Phật Pháp',
    description: 'Đừng ngại Phật pháp cao siêu khó hiểu. Bộ sách này chính là chìa khóa vạn năng, nơi Sư phụ dùng lời lẽ đời thường, dung dị nhất để giảng giải những triết lý thâm sâu. Đọc để hiểu thấu lẽ đời, khai mở trí tuệ và học cách sửa tính sửa nết để đời bớt khổ.',
    groups: [
      {
        label: 'Bộ Sách Bạch Thoại (12 Tập)',
        books: [
          { id: 'bt-1',  titleVi: 'Bạch Thoại Phật Pháp Tập 1',  titleCn: '白话佛法（第一册）',  color: C.teal },
          { id: 'bt-2',  titleVi: 'Bạch Thoại Phật Pháp Tập 2',  titleCn: '白话佛法（第二册）',  color: C.teal },
          { id: 'bt-3',  titleVi: 'Bạch Thoại Phật Pháp Tập 3',  titleCn: '白话佛法（第三册）',  color: C.teal },
          { id: 'bt-4',  titleVi: 'Bạch Thoại Phật Pháp Tập 4',  titleCn: '白话佛法（第四册）',  color: C.jade },
          { id: 'bt-5',  titleVi: 'Bạch Thoại Phật Pháp Tập 5',  titleCn: '白话佛法（第五册）',  color: C.jade },
          { id: 'bt-6',  titleVi: 'Bạch Thoại Phật Pháp Tập 6',  titleCn: '白话佛法（第六册）',  color: C.jade },
          { id: 'bt-7',  titleVi: 'Bạch Thoại Phật Pháp Tập 7',  titleCn: '白话佛法（第七册）',  color: C.teal },
          { id: 'bt-8',  titleVi: 'Bạch Thoại Phật Pháp Tập 8',  titleCn: '白话佛法（第八册）',  color: C.teal },
          { id: 'bt-9',  titleVi: 'Bạch Thoại Phật Pháp Tập 9',  titleCn: '白话佛法（第九册）',  color: C.teal },
          { id: 'bt-10', titleVi: 'Bạch Thoại Phật Pháp Tập 10', titleCn: '白话佛法（第十册）',  color: C.jade },
          { id: 'bt-11', titleVi: 'Bạch Thoại Phật Pháp Tập 11', titleCn: '白话佛法（第十一册）', color: C.jade },
          { id: 'bt-12', titleVi: 'Bạch Thoại Phật Pháp Tập 12', titleCn: '白话佛法（第十二册）', color: C.jade },
        ],
      },
      {
        label: 'Bản Phát Thanh và Bài Giảng Video',
        books: [
          { id: 'bt-13', titleVi: 'Bạch Thoại Phật Pháp Bản Phát Thanh Tập 1', titleCn: '白话佛法广播讲座1', color: C.sky },
          { id: 'bt-14', titleVi: 'Bạch Thoại Phật Pháp Bản Phát Thanh Tập 2', titleCn: '白话佛法广播讲座2', color: C.sky },
          { id: 'bt-15', titleVi: 'Bài Giảng Khai Thị Quyển 1', titleCn: '视频开示第一册', color: C.blue, pdfUrl: '#', readUrl: '#' },
          { id: 'bt-16', titleVi: 'Bài Giảng Khai Thị Quyển 2', titleCn: '视频开示第二册', color: C.blue, pdfUrl: '#', readUrl: '#' },
          { id: 'bt-17', titleVi: 'Bài Giảng Khai Thị Quyển 3', titleCn: '视频开示第三册', color: C.blue, pdfUrl: '#', readUrl: '#' },
          { id: 'bt-18', titleVi: 'Bài Giảng Khai Thị Quyển 4', titleCn: '视频开示第四册', color: C.blue, pdfUrl: '#', readUrl: '#' },
        ],
      },
    ],
  },
  {
    id: 'doi-song',
    title: 'Kệ 3 — Phật Pháp & Đời Sống',
    description: 'Cơm áo gạo tiền, bệnh tật ốm đau, vợ chồng lục đục... là những nỗi khổ rất thật của người tại gia. Kệ sách này đi thẳng vào vấn đề nóng bỏng các bạn đang gặp, cùng những minh chứng người thật việc thật để có thêm niềm tin thay đổi vận mệnh.',
    groups: [
      {
        label: '',
        books: [
          { id: 'ds-1', titleVi: 'Chuyên Đề Bách Khoa Bệnh Tật', titleCn: '疾病百科', color: C.rose },
          { id: 'ds-2', titleVi: 'Các Ca Bệnh Thực Tế Quyển 1', titleCn: '疾病实例1', color: C.rose },
          { id: 'ds-3', titleVi: 'Các Ca Bệnh Thực Tế Quyển 2', titleCn: '疾病实例2', color: C.rose },
          { id: 'ds-4', titleVi: 'Chuyên Đề Hôn Nhân & Tình Cảm Quyển 1', titleCn: '婚姻情感1', color: C.pink },
          { id: 'ds-5', titleVi: 'Chuyên Đề Hôn Nhân & Tình Cảm Quyển 2', titleCn: '婚姻情感2', color: C.pink },
          { id: 'ds-6', titleVi: 'Sách Ảnh Ăn Chay, Giữ Giới Sát Sinh, Phóng Sinh', titleCn: '吃素戒杀放生图册', color: C.pink },
        ],
      },
    ],
  },
  {
    id: 'nhan-qua',
    title: 'Kệ 4 — Nhân Quả Ba Đời',
    description: 'Kệ sách này vén màn những bí mật về phong thủy nhà cửa, về các cõi giới vô hình và quy luật nhân quả ba đời. Đọc để giải mã những thắc mắc "Tại sao mình khổ?", để thấu hiểu nguồn gốc vận mệnh và sống tự tại.',
    groups: [
      {
        label: '',
        books: [
          { id: 'nq-1', titleVi: 'Nhất Mệnh Nhị Vận Tam Phong Thủy', titleCn: '一命二运三风水', color: C.purple },
          { id: 'nq-2', titleVi: 'Thế Giới Đồ Đằng', titleCn: '图腾世界', color: C.purple },
          { id: 'nq-3', titleVi: 'Thiên Địa Nhân', titleCn: '天地人', color: C.purple },
          { id: 'nq-4', titleVi: 'Phật Tử Thiên Địa Du Ký Quyển 1', titleCn: '佛子天地游记（上）', color: C.indigo, pdfUrl: '#', readUrl: '#' },
          { id: 'nq-5', titleVi: 'Phật Tử Thiên Địa Du Ký Quyển 2', titleCn: '佛子天地游记（下）', color: C.indigo, pdfUrl: '#', readUrl: '#' },
        ],
      },
    ],
  },
  {
    id: 'phat-ngon',
    title: 'Kệ 5 — Phật Ngôn & Thiền Ngữ',
    description: 'Đây là những liều vitamin cho tâm hồn giữa cuộc sống bộn bề. Chỉ cần vài phút lật giở những lời khai thị ngắn gọn hay những câu thiền ngữ nhẹ nhàng cũng đủ để bạn thấy lòng mình lắng lại và tìm lại sự thanh tịnh vốn có.',
    groups: [
      {
        label: 'Phật Ngôn Phật Ngữ (14 Tập)',
        books: [
          ...Array.from({ length: 14 }, (_, i) => ({
            id: `pn-${i + 1}`,
            titleVi: `Phật Ngôn Phật Ngữ Tập ${i + 1}`,
            titleCn: `佛言佛语${i + 1 > 1 ? i + 1 : '小册子'}`,
            color: C.blue,
          })),
        ],
      },
      {
        label: 'Phật Ngôn Kệ Ngữ (4 Tập)',
        books: [
          { id: 'pnk-1', titleVi: 'Phật Ngôn Kệ Ngữ Tập 1', titleCn: '佛言偈語第一冊', color: C.sky },
          { id: 'pnk-2', titleVi: 'Phật Ngôn Kệ Ngữ Tập 2', titleCn: '佛言偈語第二冊', color: C.sky },
          { id: 'pnk-3', titleVi: 'Phật Ngôn Kệ Ngữ Tập 3', titleCn: '佛言偈語第三冊', color: C.sky },
          { id: 'pnk-4', titleVi: 'Phật Ngôn Kệ Ngữ Tập 4', titleCn: '佛言偈語第四册', color: C.sky },
        ],
      },
      {
        label: 'Thiền Ngữ & Đệ Tử Khai Thị',
        books: [
          { id: 'tn-1', titleVi: 'Thiền Ngữ Tâm Linh Quyển 1', titleCn: '心灵禅语', color: C.indigo },
          { id: 'tn-2', titleVi: 'Thiền Ngữ Tâm Linh Quyển 2', titleCn: '心灵禅语第二册', color: C.indigo },
          { id: 'dt-1', titleVi: 'Đệ Tử Khai Thị Tập 1', titleCn: '弟子开示1', color: C.purple },
          { id: 'dt-2', titleVi: 'Đệ Tử Khai Thị Tập 2', titleCn: '弟子开示2', color: C.purple },
        ],
      },
    ],
  },
  {
    id: 'kien-thuc',
    title: 'Kệ 6 — Kiến Thức & Lý Luận',
    description: 'Muốn xây nhà cao, móng phải vững. Kệ sách này dành cho những ai muốn đi sâu tìm hiểu, tra cứu các thuật ngữ và củng cố nền tảng lý luận Phật học. Một kho tàng tri thức giúp con đường tu tập thêm vững vàng, tránh lạc lối vào mê tín dị đoan.',
    groups: [
      {
        label: '',
        books: [
          { id: 'kt-1', titleVi: 'Quan Niệm Mới về Phật Pháp', titleCn: '佛法新概念', color: C.green },
          { id: 'kt-2', titleVi: 'Không Gian Mới của Phật Pháp', titleCn: '佛法新空间', color: C.green },
          { id: 'kt-3', titleVi: 'Khai Thị Kiến Thức Phật Học Thường Thức Quyển 1', titleCn: '佛学常识开示集锦1', color: C.jade },
          { id: 'kt-4', titleVi: 'Khai Thị Kiến Thức Phật Học Thường Thức Quyển 2', titleCn: '佛学常识开示集锦2', color: C.jade },
        ],
      },
    ],
  },
  {
    id: 'hoang-phap',
    title: 'Kệ 7 — Dấu Chân Hoằng Pháp',
    description: 'Nơi đây lưu giữ những khoảnh khắc lịch sử trang nghiêm của các Pháp hội và những giọt nước mắt hạnh phúc của hàng triệu đồng tu khi được cứu độ. Đọc để thấy mình không cô đơn trên con đường này.',
    groups: [
      {
        label: '',
        books: [
          { id: 'hp-1', titleVi: 'Dấu Chân Hoằng Pháp 2014 — Tập Trên', titleCn: '弘法足迹2014（上）', color: C.red },
          { id: 'hp-2', titleVi: 'Dấu Chân Hoằng Pháp 2014 — Tập Giữa', titleCn: '弘法足迹2014（中）', color: C.red },
          { id: 'hp-3', titleVi: 'Dấu Chân Hoằng Pháp 2014 — Tập Dưới', titleCn: '弘法足迹2014（下）', color: C.red },
          { id: 'hp-4', titleVi: 'Pháp Hội Cảm Ngộ Chia Sẻ Quyển 1', titleCn: '法会感悟分享第一册', color: C.orange },
        ],
      },
    ],
  },
]

// ── Book Cover Component ──────────────────────────────────────
function BookCover({
  book,
  index,
  onClick,
}: {
  book: Book
  index: number
  onClick: () => void
}) {
  const hasContent = !!(book.readUrl || book.pdfUrl || book.audioUrl)

  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: Math.min(index * 0.04, 0.4) }}
      whileHover={{ y: -6, rotateY: 4 }}
      onClick={onClick}
      className="group relative aspect-[3/4] cursor-pointer"
      style={{ perspective: '900px' }}
      title={book.titleVi}
    >
      {/* Shadow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4/5 h-3 bg-black/30 blur-md rounded-full translate-y-2 group-hover:translate-y-3 group-hover:w-full transition-all duration-300" />

      {/* Cover */}
      <div
        className={`relative h-full rounded-md border overflow-hidden bg-gradient-to-br ${book.color} transition-shadow duration-300 group-hover:shadow-xl`}
      >
        {/* Spine */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-black/20" />
        {/* Gloss */}
        <div className="absolute left-1 top-0 bottom-0 w-0.5 bg-white/10" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center gap-2">
          <div className="w-7 h-7 rounded bg-white/15 flex items-center justify-center shrink-0">
            <BookOpen className="w-3.5 h-3.5 text-white/80" />
          </div>
          <h3 className="text-xs md:text-sm font-display text-white leading-tight drop-shadow line-clamp-4">
            {book.titleVi}
          </h3>
          <p className="text-[10px] text-white/50 leading-tight">{book.titleCn}</p>
        </div>

        {/* Coming Soon badge */}
        {!hasContent && (
          <div className="absolute top-2 right-2">
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-white/60 font-medium">
              Sắp có
            </span>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-300" />
      </div>
    </motion.button>
  )
}

// ── Book Detail Dialog ────────────────────────────────────────
function BookDetailDialog({
  book,
  onClose,
}: {
  book: Book | null
  onClose: () => void
}) {
  if (!book) return null

  const hasContent = !!(book.readUrl || book.pdfUrl || book.audioUrl)

  return (
    <Dialog open={!!book} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl leading-tight pr-4">
            {book.titleVi}
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-0.5">{book.titleCn}</p>
        </DialogHeader>

        <Separator />

        {book.description && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {book.description}
          </p>
        )}

        {hasContent ? (
          <div className="grid grid-cols-1 gap-3 pt-1">
            {book.readUrl && (
              <a href={book.readUrl} target="_blank" rel="noopener noreferrer">
                <Button className="w-full gap-2 bg-amber-600 hover:bg-amber-700 text-white">
                  <BookOpen className="w-4 h-4" />
                  Đọc Online
                  <ChevronRight className="w-4 h-4 ml-auto" />
                </Button>
              </a>
            )}
            {book.pdfUrl && (
              <a href={book.pdfUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="w-full gap-2">
                  <Download className="w-4 h-4" />
                  Tải E-book PDF
                  <ChevronRight className="w-4 h-4 ml-auto" />
                </Button>
              </a>
            )}
            {book.audioUrl && (
              <a href={book.audioUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="w-full gap-2">
                  <Headphones className="w-4 h-4" />
                  Nghe Sách Audio
                  <ChevronRight className="w-4 h-4 ml-auto" />
                </Button>
              </a>
            )}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed bg-muted/30 p-6 text-center">
            <p className="text-sm text-muted-foreground font-medium mb-1">Bản dịch tiếng Việt đang được chuẩn bị</p>
            <p className="text-xs text-muted-foreground/70">
              Bạn có thể truy cập phiên bản tiếng Trung tại website gốc.
            </p>
            <a
              href="https://xlch.org"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-4 text-xs text-amber-500 hover:text-amber-600 font-medium transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              Truy cập xlch.org
            </a>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ── Shelf Section ─────────────────────────────────────────────
function ShelfSection({
  shelf,
  onBookClick,
}: {
  shelf: Shelf
  onBookClick: (book: Book) => void
}) {
  return (
    <section className="py-12 border-t border-border/50 first:border-t-0">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-8"
      >
        <div className="flex items-start gap-3">
          <div className="w-1 h-10 bg-gradient-to-b from-amber-500 to-amber-600 rounded mt-0.5 shrink-0" />
          <div>
            <h2 className="text-2xl md:text-3xl font-display text-foreground">{shelf.title}</h2>
            <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed max-w-2xl">{shelf.description}</p>
          </div>
        </div>
      </motion.div>

      {shelf.groups.map((group, gi) => (
        <div key={gi} className={gi > 0 ? 'mt-10' : ''}>
          {group.label && (
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
              {group.label}
            </p>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {group.books.map((book, bi) => (
              <BookCover
                key={book.id}
                book={book}
                index={bi}
                onClick={() => onBookClick(book)}
              />
            ))}
          </div>
        </div>
      ))}
    </section>
  )
}

// ── Page ──────────────────────────────────────────────────────
export default function LibraryPage() {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)

  const totalBooks = shelves.reduce(
    (acc, s) => acc + s.groups.reduce((a, g) => a + g.books.length, 0),
    0
  )

  return (
    <div className="min-h-screen bg-background">
      <StickyBanner />
      <Header />
      <main className="py-16">
        <div className="container mx-auto px-6">

          {/* ── Page Header ───────────────────────────────── */}
          <div className="flex flex-col items-center text-center mb-16">
            <p className="text-gold text-sm font-medium tracking-widest uppercase mb-3">
              心灵法门
            </p>
            <h1 className="font-display text-4xl md:text-5xl text-foreground mb-4">
              Thư Viện Pháp Bảo
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl">
              {totalBooks} đầu sách — Miễn phí, không kinh doanh Phật pháp
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {shelves.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="text-xs px-3 py-1.5 rounded-full border border-border bg-card hover:border-amber-500/40 hover:text-amber-600 dark:hover:text-amber-400 transition-colors text-muted-foreground"
                >
                  {s.title.split('—')[1]?.trim() ?? s.title}
                </a>
              ))}
            </div>
          </div>

          {/* ── Shelves ───────────────────────────────────── */}
          {shelves.map((shelf) => (
            <div key={shelf.id} id={shelf.id}>
              <ShelfSection shelf={shelf} onBookClick={setSelectedBook} />
            </div>
          ))}

          {/* ── Download CTA ──────────────────────────────── */}
          <div className="mt-16 p-8 rounded-2xl bg-card border border-border text-center">
            <h3 className="font-display text-2xl text-foreground mb-2">
              Tất Cả Tài Liệu Đều Miễn Phí
            </h3>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto text-sm">
              Sách, audio và kinh văn Pháp Môn Tâm Linh không bao giờ được dùng để kinh doanh. Hãy tự do tải về và chia sẻ.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <a
                href="https://xlch.org"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white transition-colors font-medium text-sm"
              >
                <Globe className="w-4 h-4" />
                Website Gốc xlch.org
              </a>
              <a
                href="https://xinlingfamen.info"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors font-medium text-sm"
              >
                <Globe className="w-4 h-4" />
                Website Toàn Cầu
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <StickyBanner />

      {/* ── Book Detail Dialog ────────────────────────────── */}
      <BookDetailDialog book={selectedBook} onClose={() => setSelectedBook(null)} />
    </div>
  )
}
