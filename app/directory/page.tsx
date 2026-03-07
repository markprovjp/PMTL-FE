'use client'

import { useState } from "react";
import { motion } from "framer-motion";

import { SearchIcon } from "@/components/icons/ZenIcons";

interface Center { name: string; address: string; phone: string; hours: string; }
interface Region { id: string; name: string; centers: Center[]; }

const regions: Region[] = [
  {
    id: "us", name: "Hoa Kỳ", centers: [
      { name: "Quán Âm Đường New York", address: "142-09 Cherry Ave, Flushing, NY 11355", phone: "+1 718-888-6326", hours: "T2-CN: 10:00 - 17:00" },
      { name: "Quán Âm Đường San Francisco", address: "645 Monterey Blvd, San Francisco, CA 94127", phone: "+1 415-682-0888", hours: "T3-CN: 10:00 - 17:00" },
      { name: "Quán Âm Đường Los Angeles", address: "838 E Las Tunas Dr, San Gabriel, CA 91776", phone: "+1 626-872-0488", hours: "T2-CN: 10:00 - 17:00" },
      { name: "Quán Âm Đường Houston", address: "9968 Bellaire Blvd #B, Houston, TX 77036", phone: "+1 832-430-8686", hours: "T2-CN: 10:00 - 16:00" },
    ]
  },
  {
    id: "eu", name: "Châu Âu", centers: [
      { name: "Quán Âm Đường Paris", address: "56 Avenue d'Ivry, 75013 Paris, France", phone: "+33 1 45 86 40 88", hours: "T2-T7: 10:00 - 17:00" },
      { name: "Quán Âm Đường London", address: "171 Uxbridge Rd, Shepherd's Bush, London W12 9RA", phone: "+44 20 8222 7966", hours: "T2-CN: 10:00 - 17:00" },
    ]
  },
  {
    id: "asia", name: "Châu Á", centers: [
      { name: "Quán Âm Đường Singapore", address: "156 Tyrwhitt Rd, Singapore 207568", phone: "+65 6222 2603", hours: "T2-CN: 10:00 - 18:00" },
      { name: "Quán Âm Đường Kuala Lumpur", address: "13, Jalan 14/105C, Taman Midah, 56000 KL", phone: "+60 3-9171 2272", hours: "T2-T7: 10:00 - 17:00" },
      { name: "Quán Âm Đường Tokyo", address: "1-2-3 Shinjuku, Shinjuku-ku, Tokyo 160-0022", phone: "+81 3-5367-1717", hours: "T3-CN: 10:00 - 17:00" },
    ]
  },
  {
    id: "au", name: "Châu Úc", centers: [
      { name: "Quán Âm Đường Sydney (Trụ Sở Chính)", address: "2A Holden Street, Ashfield NSW 2131, Australia", phone: "+61 2 9283 2758", hours: "T2-CN: 10:00 - 17:00" },
      { name: "Quán Âm Đường Melbourne", address: "1-5 Anderson Rd, Thornbury VIC 3071", phone: "+61 3 9480 5188", hours: "T2-T7: 10:00 - 17:00" },
    ]
  },
];

export default function DirectoryPage() {
  const [search, setSearch] = useState("");
  const [activeRegion, setActiveRegion] = useState<string | null>(null);

  const filteredRegions = regions.filter((r) => !activeRegion || r.id === activeRegion).map((r) => ({
    ...r,
    centers: r.centers.filter((c) => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.address.toLowerCase().includes(search.toLowerCase())),
  })).filter((r) => r.centers.length > 0);

  return (
    <>
      <main className="py-16">
        <div className="container mx-auto px-6">

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center text-center mb-10">
            <p className="text-gold text-sm font-medium tracking-widest uppercase mb-3">Toàn Cầu</p>
            <h1 className="font-display text-4xl md:text-5xl text-foreground mb-4">Quán Âm Đường Toàn Cầu</h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">Tìm Quán Âm Đường gần bạn nhất — 30+ quốc gia trên toàn thế giới.</p>
          </motion.div>

          <div className="flex gap-2 flex-wrap justify-center mb-6">
            <button onClick={() => setActiveRegion(null)} className={`px-4 py-2 rounded-full text-xs font-medium transition-colors ${!activeRegion ? "bg-gold text-black" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>Tất cả</button>
            {regions.map((r) => (
              <button key={r.id} onClick={() => setActiveRegion(activeRegion === r.id ? null : r.id)} className={`px-4 py-2 rounded-full text-xs font-medium transition-colors ${activeRegion === r.id ? "bg-gold text-black" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>{r.name}</button>
            ))}
          </div>

          <div className="max-w-lg mx-auto mb-10 relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm theo tên hoặc địa chỉ..." className="w-full pl-10 pr-4 py-3 rounded-xl bg-card border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-gold/30" />
          </div>

          <div className="space-y-10">
            {filteredRegions.map((region) => (
              <div key={region.id}>
                <h2 className="font-display text-2xl text-foreground mb-4">{region.name}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {region.centers.map((center) => (
                    <div key={center.name} className="p-5 rounded-xl bg-card border border-border hover:border-gold/20 transition-all">
                      <h3 className="text-sm font-medium text-foreground mb-2">{center.name}</h3>
                      <a href={`https://maps.google.com/?q=${encodeURIComponent(center.address)}`} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-gold transition-colors block mb-1">{center.address}</a>
                      <a href={`tel:${center.phone}`} className="text-xs text-gold">{center.phone}</a>
                      <p className="text-xs text-muted-foreground mt-1">{center.hours}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
