'use client'

import { useEffect, useRef } from 'react'
import { ReactLenis, type LenisRef } from 'lenis/react'

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<LenisRef>(null)

  useEffect(() => {
    const lenis = lenisRef.current?.lenis
    if (!lenis) return

    // Watch body[data-scroll-locked] attribute set by Radix Dialog/Sheet/Drawer
    // When any overlay locks the body, pause Lenis to prevent scroll bleed
    const observer = new MutationObserver(() => {
      const isLocked = document.body.hasAttribute('data-scroll-locked')
      if (isLocked) {
        lenis.stop()
      } else {
        lenis.start()
      }
    })

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['data-scroll-locked'],
    })

    return () => observer.disconnect()
  }, [])

  return (
    <ReactLenis
      ref={lenisRef}
      root
      options={{ lerp: 0.1, duration: 1.2, smoothWheel: true }}
    >
      {children}
    </ReactLenis>
  )
}
