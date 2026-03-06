// app/hub/[slug]/page.tsx — Hub page (server)
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getHubBySlug } from '@/lib/api/hub'
import HubPageComponent from '@/components/hub/HubPageComponent'

interface Params {
  slug: string
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  try {
    const { slug } = await params
    const hub = await getHubBySlug(slug)
    if (!hub) return {}
    return {
      title: `${hub.title} | Phật Môn Tịnh Lữ`,
      description: hub.description ?? undefined,
    }
  } catch {
    return {}
  }
}

export const revalidate = 3600

export default async function HubPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  let hub
  try {
    hub = await getHubBySlug(slug)
  } catch {
    notFound()
  }

  if (!hub) notFound()

  return <HubPageComponent hubPage={hub} />
}
