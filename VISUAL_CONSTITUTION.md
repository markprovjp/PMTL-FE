# PMTL Visual Constitution

> Tài liệu này là quy tắc thiết kế kỹ thuật cho mọi page và component của PMTL.
> Đọc đây **trước khi viết một dòng UI**.
> Mọi AI, mọi contributor: **document này thắng mọi cảm tính cá nhân**.

---

## 0. Triết lý tổng thể

PMTL không phải startup. Không phải blog cá nhân. Không phải diễn đàn.

PMTL là **trung tâm pháp số của một cộng đồng tu học Phật giáo Tịnh Độ**.

Cảm giác người dùng phải nhận được: **thanh tịnh — trang nghiêm — ấm — sâu**.

Tiêu chuẩn tối thiểu: **trông như một sản phẩm design intentional, không phải AI template**.

---

## 1. Design System Tokens (Chuẩn kỹ thuật)

### 1.1 Typography

| Vai trò | Class | Dùng khi nào |
|---|---|---|
| Heading lớn (H1, hero title) | `font-display text-4xl md:text-6xl` | Page hero, section tiêu đề chính |
| Heading trung (H2, section) | `font-display text-2xl md:text-3xl` | Section headings |
| Heading nhỏ (H3, card) | `font-display text-xl` | Card title, sidebar heading |
| Eyebrow / context label | `text-gold text-xs tracking-widest uppercase font-medium` | Trên mỗi section heading |
| Body text | `font-body text-base leading-relaxed text-foreground` | Nội dung đọc thông thường |
| Muted / meta | `text-sm text-muted-foreground` | Date, tag, meta info |
| Quote / trích dẫn | `font-display text-xl italic text-gold-dim` | Lời khai thị, trích kinh |

**Quy tắc typography:**
- `font-display` → **serif, trang nghiêm** → chỉ cho heading, quote, motif
- `font-body` → **sans-serif sạch** → body text, UI label, button
- Không mix font ngẫu nhiên. Không dùng `font-mono` trừ code block thực sự.
- Line-height cho body: `leading-relaxed` (1.625). Cho heading: `leading-tight`.
- Max readable width cho prose: `max-w-3xl` hoặc `max-w-prose`.

---

### 1.2 Color System

**Light mode (kem ngà):**
```
background    → hsl(38 45% 94%)   — kem ấm, không trắng tinh
foreground    → hsl(28 35% 15%)   — nâu tối, không đen tuyệt đối
card          → hsl(38 30% 97%)   — kem sáng, gần trắng
muted         → hsl(38 20% 88%)   — xám ấm nhẹ
muted-fg      → hsl(28 18% 42%)   — xám nâu, meta text
border        → hsl(38 20% 84%)   — viền kem nhạt
gold          → hsl(46 100% 46%)  — vàng Phật, accent chính
gold-dim      → hsl(44 90% 40%)   — vàng sậm, text trên sáng
gold-glow     → hsl(46 100% 60%)  — vàng sáng, gradient highlight
zen-surface   → hsl(38 30% 92%)   — surface trầm, backdrop
zen-border    → hsl(38 20% 82%)   — border tinh tế
```

**Dark mode (nâu đất áo Phật tử):**
```
background    → hsl(24 28% 8%)    — nâu đất tối, như đêm thiền
foreground    → hsl(35 25% 88%)   — trắng ngà, không lóa
card          → hsl(24 25% 11%)   — nâu sậm nhẹ
gold          → hsl(46 95% 52%)   — vàng dịu trong tối
zen-surface   → hsl(24 25% 12%)   — nền surface tối
```

**Quy tắc màu:**
- `text-gold` → accent chính. Dùng cho: eyebrow, icon highlight, active state, quote.
- `gold-gradient-text` → chỉ dùng cho heading hero hoặc motif lớn. **Không overuse**.
- `bg-zen-surface` → backdrop nhẹ cho card, sidebar, panel.
- `border-zen` hoặc `border-border` → viền. Không đặt border dày hoặc màu khác ngoài design system.
- **Forbidden**: blue hero, green CTA, purple gradient, gradient 3+ màu random.
- **Forbidden**: background trắng tinh (`bg-white`) cho page chính. Chỉ dùng trong popup/modal nếu cần.

---

### 1.3 Spacing Rhythm

| Vị trí | Class |
|---|---|
| Hero section padding | `py-24 md:py-32` hoặc `py-32 md:py-44` cho hero lớn |
| Section padding chuẩn | `py-16 md:py-24` |
| Section padding nhỏ | `py-12 md:py-16` |
| Container max-width | `container mx-auto px-6` (max 1400px theo tailwind config) |
| Prose content max-width | `max-w-3xl mx-auto` |
| Wide content max-width | `max-w-5xl mx-auto` |
| Card gap | `gap-6` hoặc `gap-8` |
| Section title margin-bottom | `mb-8 md:mb-12` |

**Quy tắc spacing:**
- Hero LUÔN rộng rãi. Không giảm padding hero xuống dưới `py-20`.
- Section transition: dùng `zen-divider` hoặc margin tự nhiên. Không dùng `<hr>` cứng.
- Card padding nội dung: `p-6` hoặc `p-8`. Không `p-3`.

---

### 1.4 Materials & Surface

```
Card chuẩn:
  bg-card border border-border rounded-xl shadow-elevated
  hover: hover:shadow-gold hover:border-gold/20 transition-all

Card kính mờ (hero overlay, sidebar):
  bg-zen-surface/80 backdrop-blur-sm border border-zen-border rounded-xl

Panel/Sidebar:
  bg-zen-surface border border-border rounded-xl

Divider:
  <div className="zen-divider max-w-xs mx-auto my-12" />

Badge/Tag:
  bg-gold/10 text-gold-dim text-xs px-3 py-1 rounded-full

Button primary:
  bg-gold text-background hover:bg-gold/90 font-medium rounded-full px-6 py-3

Button ghost:
  border border-border hover:border-gold/40 hover:text-gold rounded-full px-6 py-3

Icon decorative:
  text-gold/60 (không dùng màu solid, quá nặng)
```

---

### 1.5 Motion Language

**Nguyên tắc motion của PMTL: fade + rise nhẹ, không giật, không spinning, không bounce.**

```css
/* Tailwind animation đã có sẵn: */
animate-fade-in   → opacity 0→1, translateY 10px→0, duration 0.5s ease-out

/* Framer Motion pattern chuẩn (nếu dùng): */
initial: { opacity: 0, y: 16 }
animate: { opacity: 1, y: 0 }
transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }

/* Stagger cho danh sách: */
staggerChildren: 0.08
delayChildren: 0.1
```

**Hover interaction:**
```css
Card hover: hover:shadow-gold hover:border-gold/20 transition-all duration-300
Link hover: hover:text-gold transition-colors duration-200
Button hover: hover:bg-gold/90 transition-colors duration-200
Image hover: group-hover:scale-105 transition-transform duration-700 (chậm!)
```

**Forbidden motion:**
- Rotate/spin animation trừ loading spinner
- Bounce/elastic animation
- Parallax mạnh làm choáng
- Fade quá nhanh < 200ms (trông giật)
- Hover scale lớn hơn 1.05

---

### 1.6 Image Treatment

```
Hero image: object-cover w-full h-full với overlay gradient
  overlay: bg-gradient-to-t from-background/80 via-background/20 to-transparent

Card thumbnail: aspect-[16/9] hoặc aspect-[4/3], object-cover, rounded-lg

Avatar/circle: aspect-square, object-cover, rounded-full

Image fallback: bg-zen-surface với icon centered
```

---

## 2. Phân Loại Page Archetype

Mỗi page thuộc một archetype. AI phải xác định archetype trước khi code.
**Tuyệt đối không copy layout từ archetype khác.**

---

### ARCHETYPE A: RADIO
**Mood:** Phát thanh — âm thanh — dòng chảy — immersive — nocturnal

**Visual motif:** Sóng âm thanh, ánh đèn sân khấu, không gian tối ấm như đêm thiền âm nhạc.

**Layout pattern:**
```
HERO: toàn màn hình tối, waveform hoặc pulse animation nền
  → featured episode spotlight: tên chương trình, mô tả, play button lớn
  → "Đang phát" hoặc "Tập mới nhất" — badge rõ ràng

PLAYER BAR: sticky bottom hoặc floating sticky top dưới header
  → minimal: thumbnail nhỏ + title + controls + progress bar

PLAYLIST / SERIES:
  → horizontal scroll strip hoặc vertical stack
  → card nhỏ, compact, emphasis vào số tập + duration
  → active episode: gold highlight

ARCHIVE:
  → grouped by series/season hoặc chronological
  → không dùng blog card
```

**Thiết kế không được:** card như blog, pagination cho episode, grid 3 cột đơn giản.

**Thiết kế nên:** spotlight, immersive dark hero, player luôn accessible, episode list compact.

---

### ARCHETYPE B: VIDEOS
**Mood:** Cinematic — visual-heavy — gallery editorial — poster wall

**Visual motif:** Màn ảnh rộng, ô poster, ánh sáng rọi từ màn hình.

**Layout pattern:**
```
HERO: featured video — full bleed, với thumbnail overlay + play button nổi
  → hoặc 16:9 large với autoplay/preview nếu có
  → title, mô tả ngắn, meta (thời lượng, ngày, chủ đề)

CATEGORY STRIP:
  → tab hoặc pill filter ngang
  → gold underline cho active

GALLERY:
  → masonry 2-3 cột HOẶC editorial grid (featured + 4 nhỏ)
  → không dùng 3 cột uniform giống blog grid
  → thumbnail poster style: play overlay khi hover, title dưới hoặc overlay

VIDEO DETAIL (nếu có):
  → player chiếm 70% viewport width
  → sidebar: related, series, description
```

**Thiết kế không được:** playlist âm thanh, card blog với video thumbnail đơn giản.

**Thiết kế nên:** cinematic hero, play-first UX, poster aesthetic.

---

### ARCHETYPE C: LIBRARY / THƯ VIỆN
**Mood:** Thư viện số — học thuật — đáng tin cậy — trật tự

**Visual motif:** Ngăn sách, phân loại rõ ràng, metadata mạnh, không gian đọc.

**Layout pattern:**
```
HERO: không phô trương
  → heading rõ, subtitle ngắn, search bar nổi bật ở trung tâm

FILTER PANEL:
  → category tabs hoặc sidebar category list
  → rõ ràng, sắc gọn, không decorative quá

CONTENT GRID/SHELF:
  → "shelf" metaphor: grid 2-4 cột với metadata đầy đủ
  → mỗi item có: title, category badge, format badge (PDF/Audio/Video), filesize
  → hover: download button hoặc preview link xuất hiện
  → không dùng card quá decorative — library phải "functional đẹp"

FEATURED/RECENT:
  → highlight 2-3 tài liệu mới nhất ở top, lớn hơn
```

**Thiết kế không được:** gallery ảnh, card blog, hero chiếm nửa màn.

**Thiết kế nên:** index rõ ràng, filter mạnh, metadata visible, shelf aesthetic.

---

### ARCHETYPE D: EVENTS / SỰ KIỆN
**Mood:** Nghi lễ — cộng đồng — thời điểm — thư mời dự hội

**Visual motif:** Thư mời, lịch, countdown, ribbon sự kiện, cảm giác "hội tụ".

**Layout pattern:**
```
HERO: như một thư mời trang trọng
  → heading: "Pháp Hội & Sự Kiện"
  → background: subtle texture hoặc pattern liên quan Phật giáo
  → nếu có sự kiện sắp diễn ra: featured upcoming event nổi bật ở hero
  → countdown timer nếu sự kiện < 30 ngày

UPCOMING EVENTS (ưu tiên số 1):
  → layout KHÁC với past events — to hơn, nổi hơn
  → card event như "invitation card": border vàng, date badge lớn, ribbon "Sắp diễn ra"
  → thông tin: ngày + giờ + địa điểm + loại sự kiện + CTA đăng ký/tham dự

PAST EVENTS:
  → nhỏ hơn, compact hơn, desaturated hơn
  → gallery thumbnail + title + date
  → label rõ: "Đã kết thúc" — không giống upcoming

TIMELINE OPTION:
  → horizontal timeline strip hoặc vertical schedule
  → grouped by month
```

**Thiết kế không được:** card như blog post, pagination đơn giản, same card style cho upcoming và past.

**Thiết kế nên:** invitation aesthetic, date badge, timeline, ceremony feel.

---

### ARCHETYPE E: GUESTBOOK / SỔ LƯU BÚT
**Mood:** Cộng đồng — ấm áp — cá nhân — gần gũi — trang trọng

**Visual motif:** Note cards, prayer notes, bức thư, trang sổ tay, "writing desk".

**Layout pattern:**
```
HERO: ấm, mời gọi, không lạnh lùng
  → heading như lời dẫn vào sổ: "Lưu lại lời Pháp duyên..."
  → không có banner image to, dùng pattern nhẹ hoặc zen-surface

ENTRY WALL:
  → entries như note cards (không phải forum post)
  → card style: bo lớn, padding rộng, phông to hơn một chút
  → avatar + tên + ngày nhỏ nhẹ
  → content chính đọc thoải mái
  → phân biệt: pinned/featured entry có gold accent

FORM VIẾT NHẮN:
  → không phải form HTML mặc định
  → textarea lớn, như trang giấy, border nhẹ
  → label viết như lời dẫn: "Bút tích của đạo hữu..."
  → CTA button trang trọng: "Ghi lại lưu bút"

SIDEBAR ARCHIVE:
  → đẹp như mục lục
  → grouped by month/year với số lượng
  → hover: gold underline
```

**Thiết kế không được:** forum thread layout, table/list dày đặc, form HTML bare.

**Thiết kế nên:** note card aesthetic, writing desk metaphor, community warmth.

---

### ARCHETYPE F: HUB PAGE / TRANG CHUYÊN ĐỀ
**Mood:** Editorial spiritual landing — chuyên sâu — curated — bespoke

**Visual motif:** Mỗi hub page có motif riêng theo chủ đề. Không có motif chung.

**Layout pattern:**

```
HERO (bespoke, lớn, chủ đề rõ):
  → background gợi chủ đề: ảnh cover từ CMS, overlay gradient
  → tiêu đề hub rõ, description
  → KHÔNG giống hero của trang chủ hay blog

CONTENT BLOCKS (thứ tự theo dữ liệu CMS):
  Mỗi block type có layout KHÁC NHAU:

  [rich-text]:
    → văn bản trang nghiêm, max-w-3xl, typography prose
    → không wrap trong card đơn thuần

  [featured-posts]:
    → editorial 2-column: 1 bài featured to + 2-3 bài nhỏ
    → không phải grid đều 3 cột

  [downloads]:
    → file shelf: icon type (PDF/MP3/MP4) + title + download button
    → compact, không decorative quá

  [curated-links]:
    → link cards: title + icon + mô tả ngắn
    → style khác với blog card

  [gallery]:
    → masonry hoặc grid với aspect ratio nhất quán

TONE by content type:
  Học pháp       → thư viện/học thuật (index rõ, metadata mạnh)
  Thực hành      → hướng dẫn/ritual (steps clear, CTA rõ)
  Cảm hứng       → editorial/storytelling (image heavy, quote nổi bật)
```

**Thiết kế không được:** render tất cả block bằng cùng một card component.

**Thiết kế nên:** mỗi block type có visual treatment riêng, thay phiên nhịp page.

---

### ARCHETYPE G: BLOG LIST / DANH SÁCH BÀI VIẾT
**Mood:** Editorial — curated — học pháp — không phải news feed

**Visual motif:** Trang tạp chí pháp — bài viết được chọn lọc, trình bày có phẩm cách.

**Layout pattern:**
```
HERO/INTRO:
  → không cần hero ảnh to
  → heading + description ngắn + filter/search

FEATURED POST (nếu có):
  → bài đầu tiên hoặc được ghim: to hơn, ngang full width
  → ảnh thumbnail to (aspect 16/9), title lớn, excerpt

GRID:
  → editorial mixed: không uniform 3 cột giống nhau
  → hoặc 1 to + 2 nhỏ + 3 nhỏ alternating
  → hoặc list layout có ảnh bên trái cho mỗi item

SIDEBAR (nếu dùng two-column):
  → categories, recent, tags
  → không được nặng hơn content

PAGINATION:
  → đủ thoáng, gold accent cho active page
  → "Trang trước / Trang sau" thay vì số đơn thuần nếu phù hợp
```

---

### ARCHETYPE H: BLOG DETAIL / BÀI ĐỌC SÂU
**Mood:** Contemplative — đọc sâu — tĩnh lặng — một mình với pháp âm

**Visual motif:** Trang sách, ánh đọc, không có distraction.

**Layout pattern:**
```
READING HEADER:
  → breadcrumb nhẹ
  → category badge + date
  → title lớn, công thức display
  → ảnh cover full width (nếu có), với caption
  → author + read time + share buttons

READING BODY (chiếm main):
  → max-w-3xl, prose typography
  → blockquote: gold left-border, italic, font-display
  → image captions: muted text italic center
  → heading nội dung: rõ ràng hierarchy (H2, H3)

STICKY SIDEBAR (optional, desktop only):
  → table of contents (TOC)
  → reading progress indicator
  → sticky với scroll

FOOTER BÀI:
  → tags (clickable đến tag page)
  → share buttons
  → related posts (3 bài)
  → comments section
```

**Thiết kế không được:** wide layout, full-width text, không có reading focus.

**Thiết kế nên:** typography-first, narrow prose, contemplative rhythm.

---

### ARCHETYPE I: CATEGORY PAGE
**Mood:** Taxonomy — thư mục — navigation aid — không phải landing page

**Visual motif:** Mục lục chuyên đề, phân dẫn đọc giả.

**Layout pattern:**
```
HEADER:
  → tên category + icon (nếu có)
  → description ngắn
  → breadcrumb nếu có parent category

POST GRID:
  → tương tự Blog List nhưng single-category focus
  → có thể single column thoáng hơn
  → không cần featured post

RELATED CATEGORIES:
  → cuối page: chip list của các category liên quan

PAGINATION: chuẩn
```

---

## 3. Quy tắc 70/30

```
70% CONSISTENCY (bắt buộc, không thương lượng):
  ✓ font-display cho heading, font-body cho content
  ✓ gold là accent duy nhất — không thêm màu accent khác
  ✓ nền trầm ấm — không dùng trắng đơn thuần
  ✓ border mảnh — không border dày hoặc đổi màu border
  ✓ card bo lớn (rounded-xl hoặc rounded-2xl) — không sharp corners
  ✓ motion: fade+rise nhẹ — không bounce, không spin
  ✓ spacing rhythm: section py-16/py-24, hero py-24/py-32
  ✓ eyebrow label: text-gold tracking-widest uppercase text-xs
  ✓ zen-divider giữa các section lớn

30% INDIVIDUALITY (phải có, không được bỏ qua):
  ✓ hero composition riêng (không giống trang khác)
  ✓ section ordering phù hợp nội dung
  ✓ visual motif riêng (waveform, invitation, shelf, note card...)
  ✓ card style phù hợp loại content (không dùng card blog cho event)
  ✓ emphasis strategy riêng (trang nào nhấn cái gì)
  ✓ một chi tiết thiết kế đặc trưng page này
```

---

## 4. Lệnh Cấm (Tuyệt đối không vi phạm)

```
✗ KHÔNG dùng layout boilerplate giống blog mặc định
✗ KHÔNG copy structure từ page khác mà không adapt
✗ KHÔNG đặt background: white (#fff hoặc bg-white) cho page section chính
✗ KHÔNG dùng blue hero, green CTA, purple gradient
✗ KHÔNG dùng card giống hệt nhau cho mọi loại content
✗ KHÔNG làm hero nhỏ hơn py-20
✗ KHÔNG thêm màu accent ngoài gold system
✗ KHÔNG dùng bounce/elastic/spin animation
✗ KHÔNG lồng quá nhiều card trong 1 page — max 2 card style khác nhau
✗ KHÔNG thiếu eyebrow label cho section heading quan trọng
✗ KHÔNG dùng font khác ngoài display/body trong design system
✗ KHÔNG render dynamic CMS content là plain list nếu content cho phép layout tốt hơn
✗ KHÔNG để page trống hoặc vỡ khi CMS thiếu data — luôn có fallback composition
```

---

## 5. AI Workflow trước khi code page

**Mỗi lần nhận task thiết kế/code một page mới, AI phải tuân thủ các bước sau.**

### Bước 1: Phân loại archetype
```
Page này thuộc archetype nào trong: 
Radio / Videos / Library / Events / Guestbook / Hub / Blog List / Blog Detail / Category / Other?
```

### Bước 2: Xác định visual direction (5-8 dòng)
```
- Mood của page là gì?
- Visual motif chọn là gì?
- Màu nền chủ đạo của hero?
- Điểm khác biệt so với các page khác trong site?
- Một chi tiết thiết kế đặc trưng sẽ dùng?
```

### Bước 3: Liệt kê section structure
```
Section 1: [tên] — [layout description ngắn]
Section 2: [tên] — [layout description ngắn]
...
```

### Bước 4: Xác nhận điểm individuality
```
Điều gì làm page này khác với page khác trong site?
Nếu không có câu trả lời rõ ràng → redesign trước khi code.
```

### Bước 5: Mới bắt đầu code

---

## 6. Prompt Template cho từng Archetype

### Template: Radio
```
Thiết kế lại trang Radio của PMTL theo hướng immersive broadcast.
- Mood: phát thanh đêm khuya, âm thanh thiền định, không gian tĩnh lặng nhưng sống động âm thanh.
- Hero tối, có waveform hoặc pulse visual, player episode featured nổi bật.
- Playlist compact, không dùng blog card.
- Player sticky, minimal, luôn accessible.
- Brand PMTL giữ nguyên: gold accent, typography trang nghiêm.
- Page phải trông khác hoàn toàn so với Videos và Library.
```

### Template: Videos
```
Thiết kế lại trang Videos của PMTL theo hướng cinematic gallery.
- Mood: màn ảnh rộng, poster wall, editorial visual.
- Hero là featured video full bleed với play button nổi.
- Gallery không uniform 3 cột — dùng editorial mixed grid.
- Category filter rõ ràng nhưng không chiếm không gian.
- Thumbnail poster aesthetic — không giống thumbnail blog.
- Brand PMTL giữ nguyên, page có cá tính cinematic riêng.
```

### Template: Library
```
Thiết kế lại trang Thư Viện của PMTL theo hướng scholarly digital archive.
- Mood: thư viện số, học thuật, đáng tin cậy, trật tự.
- Search bar nổi bật ở hero — đây là primary action.
- Filter panel sắc gọn theo category.
- Content dạng shelf/grid hybrid — metadata đầy đủ (format, size, category).
- Download action clear ngay trên card.
- Không dùng decorative quá — library phải "functional đẹp".
- Brand PMTL giữ nguyên, page có aesthetic thư viện riêng.
```

### Template: Events
```
Thiết kế lại trang Sự Kiện của PMTL theo hướng ceremonial + invitation.
- Mood: thư mời dự pháp hội, nghi lễ, cộng đồng hội tụ.
- Hero như một thư mời trang trọng — nếu có upcoming event: feature nó ở hero.
- Upcoming events: to hơn, nổi hơn, invitation card style, date badge lớn.
- Past events: compact, khác hẳn upcoming, desaturated nhẹ.
- Dùng date badge, timeline strip, hoặc schedule element.
- Không dùng card như blog card.
- Brand PMTL giữ nguyên, page có cảm giác nghi lễ và cộng đồng.
```

### Template: Guestbook
```
Thiết kế lại trang Sổ Lưu Bút của PMTL theo hướng community warmth.
- Mood: cộng đồng tu học, ấm áp, cá nhân, trang trọng mà gần gũi.
- Entries như note cards/prayer notes — không phải forum post.
- Form viết nhắn như trang giấy: textarea lớn, label dẫn đạo, CTA trang trọng.
- Sidebar archive đẹp như mục lục thư viện.
- Pinned/featured entries có gold accent.
- Không dùng list/table layout.
- Brand PMTL giữ nguyên, page có writing desk metaphor.
```

### Template: Hub Page
```
Đây là trang chuyên đề PMTL lấy data từ Strapi (hub-page). 
Hãy thiết kế như một editorial spiritual landing page bespoke, không phải danh sách.

- Hero lớn, gắn với chủ đề của hub (dùng cover image từ CMS).
- Mỗi block type (rich-text, posts, downloads, links, gallery) có visual treatment riêng.
- Không render tất cả block bằng cùng một card component.
- Thay phiên layout block: wide text → featured 2-col → shelf → link grid.
- Tone theo nội dung: học pháp → thư viện; thực hành → hướng dẫn; cảm hứng → editorial.
- Nếu field CMS thiếu: dùng fallback composition đẹp, không collapse thành list đơn.
- Brand PMTL giữ nguyên, page có motif riêng theo chủ đề hub.
```

### Template: Blog List
```
Thiết kế lại trang danh sách blog PMTL theo hướng editorial magazine.
- Mood: tạp chí pháp — bài viết được chọn lọc, có phẩm cách.
- Featured post (bài đầu/được ghim): to hơn, ngang full, ảnh lớn.
- Grid còn lại: editorial mixed — không uniform 3 cột đều nhau.
- Filter/search ngắn gọn không chiếm không gian reading.
- Card blog có ảnh, title, excerpt, category, date — đủ thông tin.
- Không giống grid card SaaS hay news feed social.
- Brand PMTL giữ nguyên, page có editorial aesthetic riêng.
```

### Template: Blog Detail
```
Thiết kế lại trang đọc bài blog PMTL theo hướng contemplative reading.
- Mood: đọc sâu, tĩnh lặng, một mình với pháp âm.
- Typography-first: max-w-3xl prose, heading rõ hierarchy, blockquote gold.
- Sticky sidebar desktop: TOC + reading progress (nhẹ).
- Footer bài: tags clickable, share, related posts.
- Comments section: liền mạch, không phá mood Reading.
- Không làm wide layout — đây là reading page, không phải landing page.
- Brand PMTL giữ nguyên, page có reading-sanctuary aesthetic.
```

---

## 7. Data từ CMS — Quy tắc Presentation Layer

Với mọi trang lấy data động từ Strapi:

```
Rule 1: Layout KHÔNG được phụ thuộc hoàn toàn vào số lượng field có data.
        → Nếu field thiếu: fallback graceful, không collapse thành list trơn

Rule 2: Presentation layer phải mạnh dù data minimal.
        → 1 field = vẫn phải đẹp theo archetype

Rule 3: CMS thiếu content ≠ page phá design.
        → Define rõ fallback cho mọi optional field

Rule 4: Block-based content (hub-page) phải render theo block type.
        → rich_text ≠ post_list ≠ download_list về visual treatment

Fallback strategy mẫu:
  coverImage missing  → bg-zen-surface với gold icon centered
  description missing → không render description div (không để trống)
  posts empty         → "Chưa có nội dung" styled đẹp, không phải blank
  gallery empty       → ẩn section, không render empty grid
```

---

## 8. Component Reuse Policy

Trước khi tạo component mới cho page:

```
1. Check components/           — component đã có chưa?
2. Check page reference        — app/videos/page.tsx (visual reference chính)
3. Check archetype pattern     — section này dùng pattern gì?
4. Extend closest reusable     — nếu 80% giống → extend, không tạo mới
5. Tạo mới chỉ khi             — archetype yêu cầu component hoàn toàn mới

Shared components (không tạo duplicate):
  Header / HeaderServer → navigation
  Footer                → footer
  StickyBanner         → banner
  BlogPagination       → pagination
  Breadcrumbs          → breadcrumbs
  ViewTracker          → analytics
  CategoryNav          → dynamic category menu
```

---

## 9. Checklist trước khi ship page

```
VISUAL:
  ☐ Có eyebrow label cho section heading chính
  ☐ Hero không nhỏ hơn py-20
  ☐ Không có white background section (trừ popup/modal)
  ☐ Gold là accent duy nhất — không có màu accent lạ
  ☐ Motion: chỉ fade+rise, không có bounce/spin
  ☐ Card bo lớn (rounded-xl trở lên)
  ☐ Mobile: kiểm tra layout không vỡ ở 375px

IDENTITY:
  ☐ Hero composition KHÁC với trang khác trong site
  ☐ Có ít nhất 1 visual motif riêng cho page này
  ☐ Card style phù hợp loại content (không dùng blog card cho event)
  ☐ Section ordering logic theo nội dung trang

DATA:
  ☐ Mọi optional field CMS có fallback đẹp
  ☐ Page không vỡ khi data = []
  ☐ Block content render theo block type, không generic

TECHNICAL:
  ☐ Server Component (trừ phần interactivity thực sự)
  ☐ ISR revalidate được set
  ☐ generateStaticParams nếu có slug
  ☐ generateMetadata đầy đủ
  ☐ 0 TypeScript errors
```

---

*PMTL Visual Constitution — Phiên bản 1.0*
*Đọc cùng với FRONTEND_CONSTITUTION.md & BE_CONSTITUTION.md*
*Mọi thay đổi design system phải cập nhật document này.*
