'use client';
// ─────────────────────────────────────────────────────────────
//  /shares — Diễn đàn chia sẻ cộng đồng (Fully Dynamic)
// ─────────────────────────────────────────────────────────────
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, MoreHorizontal, CheckCircle2, Info, Pin, ImageIcon, Globe } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StickyBanner from '@/components/StickyBanner';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { PAGINATION, getPaginationRange } from '@/lib/config/pagination';
import { cn } from '@/lib/utils';
import {
  fetchPosts,
  likePost,
  submitPost,
  submitComment,
  likeComment,
  viewPost,
  uploadFile,
  type CommunityPost,
  type CommunityComment,
} from '@/lib/api/community';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const CATEGORIES = ['Tất cả', 'Sức Khoẻ', 'Gia Đình', 'Sự Nghiệp', 'Hôn Nhân', 'Tâm Linh', 'Thi Cử', 'Kinh Doanh', 'Mất Ngủ', 'Mối Quan Hệ'];

/* ── Icons ────────────────────────────────────────────────── */
const HeartIcon = ({ filled, className = 'w-4 h-4' }: { filled?: boolean; className?: string }) => (
  <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" className={className}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const ChatIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const EyeIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round" /><circle cx="12" cy="12" r="3" />
  </svg>
);
const PlayIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}><polygon points="5 3 19 12 5 21 5 3" /></svg>
);
const SendIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
    <line x1="22" y1="2" x2="11" y2="13" strokeLinecap="round" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);
const XIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round" /><line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round" />
  </svg>
);
const PlusIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const QuoteIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5 3.871 3.871 0 01-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5 3.871 3.871 0 01-2.748-1.179z" />
  </svg>
);
const StarIcon = ({ filled }: { filled: boolean }) => (
  <svg viewBox="0 0 20 20" className={`w-4 h-4 ${filled ? 'fill-amber-400 text-amber-400' : 'fill-none text-border'}`} stroke="currentColor" strokeWidth="1.5">
    <path d="M10 1.5l2.47 5.01 5.53.8-4 3.9.94 5.49L10 14.26l-4.94 2.44.94-5.49-4-3.9 5.53-.8L10 1.5z" />
  </svg>
);

/* ── Share Pagination ─────────────────────────────────────── */
interface SharesPaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}
const SharesPagination = ({ currentPage, totalPages, onPageChange }: SharesPaginationProps) => {
  if (totalPages <= 1) return null
  const range = getPaginationRange(currentPage, totalPages)
  return (
    <nav className="flex items-center justify-center gap-1 mt-10" aria-label="Phân trang chia sẻ">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className={cn('inline-flex h-9 items-center gap-1.5 px-3 rounded-lg border text-sm font-medium transition-all', currentPage <= 1 ? 'border-border/40 text-muted-foreground/40 cursor-not-allowed' : 'border-border text-muted-foreground hover:border-gold/50 hover:text-gold hover:bg-gold/5')}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Trước</span>
      </button>
      {range.map((item, idx) => item === 'ellipsis' ? (
        <span key={`e-${idx}`} className="flex h-9 w-9 items-center justify-center text-muted-foreground/60"><MoreHorizontal className="h-4 w-4" /></span>
      ) : (
        <button
          key={item}
          onClick={() => item !== currentPage && onPageChange(item)}
          className={cn('inline-flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-medium transition-all', item === currentPage ? 'border-gold bg-gold/10 text-gold font-semibold cursor-default' : 'border-border/60 text-muted-foreground hover:border-gold/40 hover:text-gold hover:bg-gold/5')}
        >{item}</button>
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className={cn('inline-flex h-9 items-center gap-1.5 px-3 rounded-lg border text-sm font-medium transition-all', currentPage >= totalPages ? 'border-border/40 text-muted-foreground/40 cursor-not-allowed' : 'border-border text-muted-foreground hover:border-gold/50 hover:text-gold hover:bg-gold/5')}
      >
        <span className="hidden sm:inline">Sau</span>
        <ChevronRight className="h-4 w-4" />
      </button>
      <span className="ml-3 text-xs text-muted-foreground/60 hidden md:block">Trang {currentPage}/{totalPages}</span>
    </nav>
  )
}

/* ── Format helpers ──────────────────────────────────────────── */
function fmt(n: number) {
  if (!n) return '0';
  if (n >= 1000) return (n / 1000).toFixed(1).replace('.0', '') + 'K';
  return String(n);
}
function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Vừa xong';
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} ngày trước`;
  return new Date(dateStr).toLocaleDateString('vi-VN');
}
function avatar(name: string, size = 9) {
  const colors = ['from-gold/40 to-amber-600/40 text-gold', 'from-emerald-500/30 to-teal-600/30 text-emerald-400', 'from-purple-500/30 to-indigo-600/30 text-purple-400', 'from-rose-500/30 to-pink-600/30 text-rose-400'];
  const idx = name.charCodeAt(0) % colors.length;
  return `w-${size} h-${size} rounded-full bg-gradient-to-br ${colors[idx]} flex items-center justify-center font-bold text-sm shrink-0`;
}
function initials(name: string) { return name.charAt(0).toUpperCase(); }

/* ── Type Badge ───────────────────────────────────────────────── */
const TypeBadge = ({ type }: { type: string }) => {
  const map: Record<string, { label: string; color: string }> = {
    story: { label: 'Câu Chuyện', color: 'bg-emerald-500/15 text-emerald-400' },
    feedback: { label: 'Cảm Ngộ', color: 'bg-amber-500/15 text-amber-400' },
    video: { label: 'Video', color: 'bg-red-500/15 text-red-400' },
  };
  const t = map[type] || map.story;
  return <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${t.color}`}>{t.label}</span>;
};

/* ══════════════════════ POST CARD ══════════════════════════════ */
interface PostCardProps {
  post: CommunityPost;
  onOpen: (p: CommunityPost) => void;
  onLike: (id: string | number) => void;
  liked: boolean;
}
const PostCard = ({ post, onOpen, onLike, liked }: PostCardProps) => (
  <motion.article
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -2 }}
    className="group rounded-2xl bg-card border border-border overflow-hidden hover:border-gold/40 hover:shadow-xl hover:shadow-black/20 transition-all duration-300 flex flex-col cursor-pointer"
    onClick={() => onOpen(post)}
  >
    {/* Cover / Video thumbnail */}
    {(post.coverUrl || post.type === 'video') && (
      <div className="relative aspect-video overflow-hidden bg-secondary shrink-0">
        {post.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.coverUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${post.id}/640/360`; }} />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-secondary to-border flex items-center justify-center">
            <PlayIcon className="w-12 h-12 text-muted-foreground/30" />
          </div>
        )}
        {post.type === 'video' && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-gold/90 text-black flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
              <PlayIcon className="w-5 h-5 ml-0.5" />
            </div>
          </div>
        )}
        {post.pinned && (
          <div className="absolute top-2 right-2 bg-gold text-black text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <Pin className="w-2.5 h-2.5" /> Ghim
          </div>
        )}
        <div className="absolute top-2 left-2 flex gap-1.5">
          <span className="bg-black/60 text-gold text-xs px-2 py-0.5 rounded-full backdrop-blur-sm">{post.category}</span>
          <TypeBadge type={post.type} />
        </div>
      </div>
    )}

    {/* Feedback-style (no image) */}
    {post.type === 'feedback' && !post.coverUrl && (
      <div className="px-5 pt-5 flex items-start gap-2">
        <QuoteIcon className="w-8 h-8 text-gold/20 shrink-0 mt-0.5" />
        <span className="flex gap-1.5">
          <span className="bg-black/5 text-gold text-xs px-2 py-0.5 rounded-full border border-gold/20">{post.category}</span>
          <TypeBadge type={post.type} />
        </span>
      </div>
    )}

    <div className="p-4 flex flex-col flex-1 gap-3">
      <h3 className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-gold transition-colors">{post.title}</h3>
      <p className={`text-xs text-foreground/60 leading-relaxed line-clamp-3 flex-1 ${post.type === 'feedback' ? 'italic' : ''}`}>{post.content}</p>

      {/* Rating */}
      {post.rating && (
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((i) => <StarIcon key={i} filled={i <= post.rating!} />)}
        </div>
      )}

      {/* Author */}
      <div className="flex items-center gap-2">
        {post.author_avatar ? (
          <img src={post.author_avatar} alt={post.author_name} className="w-7 h-7 rounded-full object-cover" />
        ) : (
          <div className={avatar(post.author_name, 7)}>
            {initials(post.author_name)}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-xs font-medium text-foreground/80 truncate">{post.author_name}</p>
          {post.author_country && <p className="text-[10px] text-muted-foreground truncate">@ {post.author_country}</p>}
        </div>
        <span className="text-[10px] text-muted-foreground/50 ml-auto shrink-0">{timeAgo(post.createdAt)}</span>
      </div>

      {/* Footer stats */}
      <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1"><EyeIcon className="w-3.5 h-3.5" />{fmt(post.views)}</span>
          <span className="flex items-center gap-1"><ChatIcon className="w-3.5 h-3.5" />{Array.isArray(post.comments) ? post.comments.length : 0}</span>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onLike(post.documentId); }}
          className={`flex items-center gap-1 transition-colors ${liked ? 'text-rose-400' : 'hover:text-rose-400'}`}
        >
          <HeartIcon filled={liked} className="w-3.5 h-3.5" />
          <span>{fmt(post.likes + (liked ? 1 : 0))}</span>
        </button>
      </div>
    </div>
  </motion.article>
);

/* ══════════════════════ COMMENT ITEM ═══════════════════════════ */
const CommentItem = ({ comment, postId }: { comment: CommunityComment; postId: string | number }) => {
  const { user } = useAuth();
  const [likes, setLikes] = useState(comment.likes);
  const [liked, setLiked] = useState(false);
  const [showReply, setShowReply] = useState(false);
  const [reply, setReply] = useState('');
  const [replyName, setReplyName] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (user) {
      setReplyName(user.fullName || user.username || '');
    } else {
      const saved = localStorage.getItem('pmtl_author_name');
      if (saved) setReplyName(saved);
    }
  }, [user]);

  const handleLike = async () => {
    if (liked) return;
    setLiked(true);
    setLikes((l) => l + 1);
    try {
      await likeComment(comment.documentId);
      toast.success('Đã thích bình luận');
    } catch {
      setLiked(false);
      setLikes((l) => l - 1);
      toast.error('Không thể thích bình luận');
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = user ? (user.fullName || user.username) : replyName;
    if (!reply.trim() || !finalName.trim()) {
      if (!finalName.trim()) toast.error('Vui lòng nhập tên của bạn');
      return;
    }
    setSending(true);
    try {
      await submitComment({
        postId,
        content: reply,
        author_name: finalName,
        author_country: '',
        parent_comment: comment.id,
        author_avatar: user?.avatar_url || undefined
      });
      toast.success('Trả lời đã được gửi và đang chờ duyệt');
      setReply('');
      if (!user) localStorage.setItem('pmtl_author_name', finalName);
      setShowReply(false);
    } catch {
      toast.error('Gửi trả lời thất bại');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex gap-3">
      {comment.author_avatar ? (
        <img src={comment.author_avatar} alt={comment.author_name} className="w-8 h-8 rounded-full object-cover" />
      ) : (
        <div className={avatar(comment.author_name, 8)}>{initials(comment.author_name)}</div>
      )}
      <div className="flex-1 min-w-0">
        <div className="bg-secondary/50 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs font-semibold text-foreground/90">{comment.author_name}</span>
            {comment.author_country && <span className="text-[10px] text-muted-foreground">@ {comment.author_country}</span>}
          </div>
          <p className="text-sm text-foreground/75 leading-relaxed">{comment.content}</p>
        </div>
        <div className="flex items-center gap-4 mt-1.5 ml-2">
          <button onClick={handleLike} className={`flex items-center gap-1 text-xs transition-colors ${liked ? 'text-rose-400' : 'text-muted-foreground hover:text-rose-400'}`}>
            <HeartIcon filled={liked} className="w-3 h-3" />{likes}
          </button>
          <button onClick={() => setShowReply((s) => !s)} className="text-xs text-muted-foreground hover:text-gold transition-colors">
            Trả lời
          </button>
          <span className="text-[10px] text-muted-foreground/50">{timeAgo(comment.createdAt)}</span>
        </div>
        {showReply && (
          <form onSubmit={handleReply} className="mt-2 flex flex-col gap-2">
            {!user && !localStorage.getItem('pmtl_author_name') && (
              <input
                value={replyName}
                onChange={(e) => setReplyName(e.target.value)}
                placeholder="Tên bạn..."
                required
                className="px-3 py-1.5 rounded-lg bg-secondary border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold/50 w-48"
              />
            )}
            <div className="flex gap-2">
              <input
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder={user || replyName ? `Trả lời ${comment.author_name}...` : "Viết trả lời..."}
                required
                className="flex-1 px-3 py-1.5 rounded-lg bg-secondary border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold/50"
              />
              <button
                type="submit"
                disabled={sending}
                className="px-3 py-1.5 rounded-lg bg-primary text-xs font-bold text-primary-foreground disabled:opacity-50 hover:bg-gold transition-colors"
              >
                Gửi
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

/* ══════════════════════ DETAIL MODAL ══════════════════════════ */
interface DetailModalProps { post: CommunityPost | null; onClose: () => void; onLike: (id: string | number) => void; liked: boolean; }
const DetailModal = ({ post, onClose, onLike, liked }: DetailModalProps) => {
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [commentName, setCommentName] = useState('');
  const [commentCountry, setCommentCountry] = useState('');
  const [sending, setSending] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!post) return;
    setComments(post.comments || []);

    if (user) {
      setCommentName(user.fullName || user.username || '');
    } else {
      const saved = localStorage.getItem('pmtl_author_name');
      if (saved) setCommentName(saved);
    }
    setCommentCountry('');
  }, [post, user]);

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = user ? (user.fullName || user.username) : commentName;
    if (!commentText.trim() || !finalName.trim()) return;
    setSending(true);
    try {
      await submitComment({
        postId: post!.documentId,
        content: commentText,
        author_name: finalName,
        author_country: commentCountry,
        author_avatar: user?.avatar_url || undefined
      });
      toast.success('Bình luận đã được gửi và đang chờ duyệt');
      setCommentText('');
      if (!user) localStorage.setItem('pmtl_author_name', finalName);
    } catch {
      toast.error('Gửi bình luận thất bại');
    } finally {
      setSending(false);
    }
  };

  return (
    <AnimatePresence>
      {post && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            className="bg-card border border-border rounded-t-3xl sm:rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag handle */}
            <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm px-6 pt-4 pb-3 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TypeBadge type={post.type} />
                <span className="text-xs text-muted-foreground">{post.category}</span>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-secondary hover:bg-border flex items-center justify-center transition-colors">
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            <div className="px-5 pb-6 space-y-4">
              {/* Author at the top */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {post.author_avatar ? (
                    <img src={post.author_avatar} alt={post.author_name} className="w-10 h-10 rounded-full object-cover border border-border" />
                  ) : (
                    <div className={`${avatar(post.author_name, 10)} text-base`}>{initials(post.author_name)}</div>
                  )}
                  <div className="flex flex-col">
                    <h3 className="font-semibold text-[15px] text-foreground flex items-center gap-1.5 leading-tight">
                      {post.author_name}
                      {post.author_country && <span className="text-muted-foreground font-normal text-xs">@ {post.author_country}</span>}
                    </h3>
                    <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                      {timeAgo(post.createdAt)}
                      <span className="w-0.5 h-0.5 rounded-full bg-muted-foreground/50" />
                      <Globe className="w-3 h-3 text-muted-foreground/70" />
                    </div>
                  </div>
                </div>
                {post.rating && (
                  <div className="flex gap-0.5 mt-1">
                    {[1, 2, 3, 4, 5].map((i) => <StarIcon key={i} filled={i <= post.rating!} />)}
                  </div>
                )}
              </div>

              {/* Title & Content */}
              <div className="space-y-2.5 pt-1">
                <h2 className="font-display text-lg sm:text-xl text-foreground font-semibold leading-snug">{post.title}</h2>
                <div className={`text-[15px] text-foreground/90 leading-relaxed whitespace-pre-wrap ${post.type === 'feedback' ? 'italic border-l-4 border-gold/30 pl-4 bg-gold/5 p-3 rounded-r-xl' : ''}`}>
                  {post.content}
                </div>
              </div>

              {/* Cover / Video */}
              {post.coverUrl && post.type !== 'video' && (
                <div className="rounded-xl overflow-hidden -mx-5 bg-black/5 flex items-center justify-center relative">
                  <img src={post.coverUrl} alt={post.title} className="w-full h-auto max-h-[60vh] object-contain" onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${post.id}/640/360`; }} />
                </div>
              )}

              {post.type === 'video' && post.video_url && (
                <div className="aspect-video rounded-xl overflow-hidden bg-black -mx-5 relative group">
                  {post.coverUrl && <img src={post.coverUrl} alt={post.title} className="w-full h-full object-cover opacity-75 group-hover:opacity-60 transition-opacity" />}
                  <a href={post.video_url} target="_blank" rel="noopener noreferrer" className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-gold/90 text-black flex items-center justify-center shadow-2xl hover:scale-110 transition-transform backdrop-blur-sm">
                      <PlayIcon className="w-8 h-8 ml-1" />
                    </div>
                  </a>
                </div>
              )}

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {post.tags.map((t) => (
                    <span key={t} className="text-xs font-medium px-2.5 py-1 rounded-md bg-secondary text-muted-foreground/80 lowercase">#{t}</span>
                  ))}
                </div>
              )}

              {/* Stats */}
              <div className="flex items-center justify-between py-3 border-y border-border text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5 bg-rose-500/10 text-rose-500 px-2.5 py-1 rounded-full text-xs font-medium">
                  <HeartIcon filled className="w-3.5 h-3.5" />
                  {fmt(post.likes + (liked ? 1 : 0))}
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs">
                  <span className="cursor-pointer hover:text-foreground transition-colors">{comments.length} bình luận</span>
                  <span className="flex items-center gap-1 cursor-default"><EyeIcon className="w-3.5 h-3.5" /> {fmt(post.views)} lượt xem</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pb-2">
                <button onClick={() => onLike(post.documentId)} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold transition-colors ${liked ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20' : 'bg-secondary text-foreground hover:bg-secondary/80'}`}>
                  <HeartIcon filled={liked} className="w-5 h-5" />
                  {liked ? 'Đã yêu thích' : 'Yêu thích'}
                </button>
                <div className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold bg-secondary text-foreground cursor-default">
                  <ChatIcon className="w-5 h-5" />
                  Bình luận
                </div>
              </div>

              {/* Comments Section */}
              <div className="space-y-4">
                <h3 className="font-semibold text-base text-foreground flex items-center gap-2">
                  <ChatIcon className="w-5 h-5 text-gold" /> Bình luận ({comments.length})
                </h3>

                {comments.length > 0 ? (
                  <div className="space-y-4">
                    {comments.map((c) => (
                      <CommentItem key={c.id} comment={c} postId={post.documentId} />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground/60 text-center py-6">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
                )}

                {/* Comment form */}
                <form onSubmit={handleComment} className="space-y-3 pt-4 border-t border-border">
                  <h4 className="text-sm font-medium text-foreground">Để lại cảm nghĩ</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {(!user && !localStorage.getItem('pmtl_author_name')) && (
                      <input value={commentName} onChange={(e) => setCommentName(e.target.value)} placeholder="Tên bạn *" required className="px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold/50 transition-colors" />
                    )}
                  </div>
                  <textarea value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Chia sẻ cảm nghĩ, kinh nghiệm của bạn..." required rows={3} className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold/50 transition-colors resize-none" />
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">Bình luận được Admin duyệt trong 24h</p>
                    <button type="submit" disabled={sending} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm hover:bg-primary/90 disabled:opacity-50 transition-colors">
                      <SendIcon />{sending ? 'Đang gửi...' : 'Bình luận'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* ══════════════════════ SUBMIT POST MODAL ══════════════════════ */
const SubmitModal = ({ onClose, user }: { onClose: () => void; user: any }) => {
  const [form, setForm] = useState({
    title: '', content: '', type: 'story', category: 'Tâm Linh',
    author_name: user ? (user.fullName || user.username) : '',
    author_country: '', video_url: '', tags: '',
  });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      let cover_image;
      if (coverFile) {
        cover_image = await uploadFile(coverFile);
      }
      await submitPost({
        ...form,
        video_url: form.video_url || undefined,
        tags: form.tags || undefined,
        cover_image: cover_image || undefined,
        author_avatar: user?.avatar_url || undefined,
      });
      toast.success('Bài viết đã được gửi và đang chờ duyệt');
      setSent(true);
    } catch {
      toast.error('Gửi bài viết thất bại');
    } finally {
      setSending(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50" onClick={onClose}>
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 320 }}
        className="bg-card border border-border rounded-t-3xl sm:rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm px-6 pt-4 pb-3 border-b border-border flex items-center justify-between">
          <h2 className="font-display text-lg text-foreground">Đăng Bài Chia Sẻ</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-secondary hover:bg-border flex items-center justify-center transition-colors"><XIcon className="w-4 h-4" /></button>
        </div>

        {sent ? (
          <div className="px-6 py-12 text-center space-y-6">
            <Alert className="bg-emerald-500/5 border-emerald-500/20 text-emerald-500 py-8">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-4" />
              <AlertTitle className="text-xl font-display mb-2">Cảm ơn bạn đã chia sẻ!</AlertTitle>
              <AlertDescription className="text-sm">
                Bài viết của bạn đã được tiếp nhận và đang chờ Admin duyệt.
                Mọi chia sẻ của bạn đều là hạt mầm thiện lành truyền cảm hứng tới cộng đồng.
              </AlertDescription>
            </Alert>
            <button onClick={onClose} className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all">
              Đóng và Tiếp tục
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">Loại bài *</label>
                <select name="type" value={form.type} onChange={handleChange} className="px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground focus:outline-none focus:border-gold/50">
                  <option value="story">Câu Chuyện</option>
                  <option value="feedback">Cảm Ngộ / Trải Nghiệm</option>
                  <option value="video">Video</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">Danh mục *</label>
                <select name="category" value={form.category} onChange={handleChange} className="px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground focus:outline-none focus:border-gold/50">
                  {CATEGORIES.slice(1).map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Tiêu đề *</label>
              <input name="title" value={form.title} onChange={handleChange} placeholder="Tiêu đề câu chuyện của bạn..." required className="px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold/50" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Nội dung *</label>
              <textarea name="content" value={form.content} onChange={handleChange} placeholder="Chia sẻ câu chuyện, trải nghiệm của bạn..." required rows={6} className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold/50 resize-none" />
            </div>

            {form.type === 'video' && (
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">Link Video (YouTube, Vimeo...)</label>
                <input name="video_url" value={form.video_url} onChange={handleChange} placeholder="https://youtube.com/..." className="px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold/50" />
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Ảnh bìa cho bài viết</label>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary border border-border text-sm text-foreground cursor-pointer hover:bg-border/50 transition-colors">
                    <ImageIcon className="w-4 h-4 text-muted-foreground" />
                    {coverFile ? 'Đổi ảnh bìa' : 'Tải ảnh lên'}
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  </label>
                  {coverFile && <span className="text-xs text-muted-foreground truncate w-40">{coverFile.name}</span>}
                </div>
                {coverPreview && (
                  <div className="relative aspect-video rounded-xl overflow-hidden border border-border bg-secondary">
                    <img src={coverPreview} alt="Preview" className="w-full h-full object-cover" />
                    <button onClick={() => { setCoverFile(null); setCoverPreview(null); }} className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors">
                      <XIcon className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">Họ tên *</label>
                <input name="author_name" value={form.author_name} onChange={handleChange} required placeholder="Tên của bạn..." className="px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold/50" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">Quốc gia</label>
                <input name="author_country" value={form.author_country} onChange={handleChange} placeholder="Việt Nam" className="px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold/50" />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Tags (ngăn cách bằng dấu phẩy)</label>
              <input name="tags" value={form.tags} onChange={handleChange} placeholder="phuocbau, samhoi, kietac..." className="px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold/50" />
            </div>

            <Alert className="bg-amber-500/5 border-amber-500/20 text-amber-500">
              <Info className="w-4 h-4" />
              <AlertTitle className="text-xs font-semibold">Lưu ý kiểm duyệt</AlertTitle>
              <AlertDescription className="text-[10px] leading-relaxed">
                Để đảm bảo chất lượng nội dung, bài viết sẽ được Admin duyệt trong vòng 24 giờ trước khi hiển thị công khai.
              </AlertDescription>
            </Alert>

            <button type="submit" disabled={sending} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
              <SendIcon />{sending ? 'Đang gửi...' : 'Gửi Bài Chia Sẻ'}
            </button>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
};

/* ══════════════════════ SKELETON ════════════════════════════════ */
const SkeletonCard = () => (
  <div className="rounded-2xl bg-card border border-border overflow-hidden animate-pulse">
    <div className="aspect-video bg-secondary/50" />
    <div className="p-4 space-y-3">
      <div className="h-4 bg-secondary/50 rounded w-3/4" />
      <div className="h-3 bg-secondary/50 rounded w-full" />
      <div className="h-3 bg-secondary/50 rounded w-2/3" />
      <div className="h-8 bg-secondary/50 rounded-full w-24 mt-2" />
    </div>
  </div>
);

/* ══════════════════════ MAIN PAGE ══════════════════════════════ */
export default function SharesPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Tất cả');
  const [sort, setSort] = useState('newest');
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [showSubmit, setShowSubmit] = useState(false);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const searchTimeout = useRef<NodeJS.Timeout>();

  useEffect(() => {
    try {
      const stored = localStorage.getItem('pmtl_liked_community');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setLikedIds(new Set(parsed.map(String)));
      }
    } catch { }
  }, []);

  const load = useCallback(async (q?: string, cat?: string, s?: string, page = 1) => {
    setLoading(true);
    try {
      const { posts: p, total: t } = await fetchPosts({
        search: q ?? search,
        category: cat ?? category,
        sort: s ?? sort,
        page,
        pageSize: PAGINATION.BLOG_PAGE_SIZE,
      });
      setPosts(p);
      setTotal(t);
      setTotalPages(Math.ceil(t / PAGINATION.BLOG_PAGE_SIZE) || 1);
      setCurrentPage(page);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [search, category, sort]);

  useEffect(() => { load(); }, [load]);

  const handleSearch = (val: string) => {
    setSearch(val);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => load(val, category, sort, 1), 400);
  };

  const handleCategory = (cat: string) => {
    setCategory(cat);
    load(search, cat, sort, 1);
  };

  const handleSort = (s: string) => {
    setSort(s);
    load(search, category, s, 1);
  };

  const handlePageChange = (page: number) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    load(search, category, sort, page);
  };

  const handleLike = async (id: string | number) => {
    const sid = String(id);
    if (likedIds.has(sid)) {
      toast.info('Bạn đã thích bài viết này rồi');
      return;
    }

    setLikedIds((prev) => {
      const n = new Set(prev);
      n.add(sid);
      localStorage.setItem('pmtl_liked_community', JSON.stringify(Array.from(n)));
      return n;
    });

    try {
      await likePost(sid);
      toast.success('Đã thích bài viết');
    } catch {
      setLikedIds((prev) => {
        const n = new Set(prev);
        n.delete(sid);
        localStorage.setItem('pmtl_liked_community', JSON.stringify(Array.from(n)));
        return n;
      });
      toast.error('Không thể thích bài viết');
    }
  };

  const handleOpenPost = async (p: CommunityPost) => {
    setSelectedPost(p);
    // Tăng lượt xem
    try {
      const newViews = await viewPost(p.documentId);
      if (newViews > 0) {
        setSelectedPost((prev) => prev ? { ...prev, views: newViews } : prev);
        setPosts((current) => current.map((item) => item.documentId === p.documentId ? { ...item, views: newViews } : item));
      }
    } catch { }
  };

  const pinned = posts.filter((p) => p.pinned);
  const regular = posts.filter((p) => !p.pinned);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="py-16">
        <div className="container mx-auto px-6">
          {/* ── Compact Hero Section ─────────────────────────── */}
          <div className="relative mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto text-center"
            >
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-gold text-[10px] font-bold uppercase tracking-widest mb-4">
                Diễn Đàn Đồng Tu
              </div>

              <h1 className="font-display text-3xl md:text-5xl text-foreground mb-4 leading-tight">
                NGƯỜI THẬT <span className="text-gold">VIỆC THẬT</span>
              </h1>

              <p className="text-muted-foreground text-sm md:text-base leading-relaxed max-w-2xl mx-auto mb-8">
                Những chia sẻ người thật việc thật từ đồng tu khắp thế giới — Hãy cùng lan tỏa năng lượng thiện lành và truyền cảm hứng tu học.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pb-8 border-b border-border/50">
                <button
                  onClick={() => setShowSubmit(true)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gold text-black font-bold hover:bg-gold/90 active:scale-95 transition-all shadow-lg shadow-gold/10 text-sm"
                >
                  <PlusIcon className="w-4 h-4" />
                  Chia Sẻ Câu Chuyện
                </button>

                <div className="flex items-center gap-8 text-sm">
                  {[
                    { value: total > 0 ? `${total}+` : '—', label: 'Bài viết' },
                    { value: '50+', label: 'Quốc Gia' },
                    { value: '10M+', label: 'Lượt Đọc' },
                    { value: '4.9★', label: 'Đánh giá' },
                  ].map((s) => (
                    <div key={s.label} className="text-left">
                      <p className="font-display text-lg text-gold leading-none">{s.value}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* ── Filter Bar ─────────────────────────────────────── */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="mb-8 space-y-4">
            <div className="relative max-w-xl mx-auto">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" strokeLinecap="round" /></svg>
              <input type="text" placeholder="Tìm kiếm câu chuyện, tác giả..." value={search} onChange={(e) => handleSearch(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-xl bg-card border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-gold/50 transition-colors" />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <div className="flex gap-2 overflow-x-auto pb-1 flex-1 scrollbar-none">
                {CATEGORIES.map((cat) => (
                  <button key={cat} onClick={() => handleCategory(cat)} className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${category === cat ? 'bg-gold text-black shadow-sm' : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:border-gold/30'}`}>
                    {cat}
                  </button>
                ))}
              </div>
              <select value={sort} onChange={(e) => handleSort(e.target.value)} className="shrink-0 px-4 py-2 rounded-xl bg-card border border-border text-sm text-foreground focus:outline-none focus:border-gold/50 cursor-pointer">
                <option value="newest">Mới Nhất</option>
                <option value="popular">Nhiều Xem Nhất</option>
                <option value="most_liked">Nhiều Tim Nhất</option>
              </select>
            </div>

            {!loading && (
              <p className="text-xs text-muted-foreground/60 text-center">
                Hiển thị <span className="text-gold font-medium">{posts.length}</span> / {total} câu chuyện
              </p>
            )}
          </motion.div>

          {/* ── Pinned Posts ───────────────────────────────────── */}
          {!loading && pinned.length > 0 && (
            <div className="mb-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                <Pin className="w-3.5 h-3.5" /> Bài Ghim
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {pinned.map((post) => (
                  <PostCard key={post.id} post={post} onOpen={handleOpenPost} onLike={handleLike} liked={likedIds.has(String(post.documentId))} />
                ))}
              </div>
            </div>
          )}

          {/* ── Main Masonry Grid ──────────────────────────────── */}
          {loading ? (
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="break-inside-avoid mb-5"><SkeletonCard /></div>
              ))}
            </div>
          ) : regular.length > 0 ? (
            <>
              <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-5">
                {regular.map((post, i) => (
                  <motion.div
                    key={post.id}
                    className="break-inside-avoid mb-5"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.4, delay: (i % 4) * 0.06 }}
                  >
                    <PostCard post={post} onOpen={handleOpenPost} onLike={handleLike} liked={likedIds.has(String(post.documentId))} />
                  </motion.div>
                ))}
              </div>
              {/* Phân trang */}
              <SharesPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
              <QuoteIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground/20" />
              <h3 className="font-display text-xl text-foreground mb-2">
                {posts.length === 0 && !search ? 'Chưa có bài chia sẻ nào' : 'Không tìm thấy kết quả'}
              </h3>
              <p className="text-muted-foreground text-sm mb-6">
                {posts.length === 0 && !search ? 'Hãy là người đầu tiên chia sẻ câu chuyện của bạn!' : 'Thử từ khóa khác hoặc đổi danh mục.'}
              </p>
              {search && (
                <button onClick={() => { setSearch(''); setCategory('Tất cả'); load('', 'Tất cả', sort); }} className="px-5 py-2.5 rounded-xl bg-secondary text-sm text-foreground hover:bg-border transition-colors mr-3">
                  Xóa bộ lọc
                </button>
              )}
              <button onClick={() => setShowSubmit(true)} className="px-5 py-2.5 rounded-xl bg-gold text-black text-sm font-medium hover:bg-gold/90 transition-colors">
                Đăng bài ngay
              </button>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
      <StickyBanner />

      {/* ── Modals ──────────────────────────────────────────────── */}
      <DetailModal
        post={selectedPost}
        onClose={() => setSelectedPost(null)}
        onLike={handleLike}
        liked={selectedPost ? likedIds.has(selectedPost.documentId) : false}
      />

      <AnimatePresence>
        {showSubmit && <SubmitModal onClose={() => setShowSubmit(false)} user={user} />}
      </AnimatePresence>
    </div>
  );
}
