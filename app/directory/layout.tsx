import Header from '@/components/Header'
import Footer from '@/components/Footer'
import StickyBanner from '@/components/StickyBanner'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      {children}
      <Footer />
      <StickyBanner />
    </div>
  )
}
