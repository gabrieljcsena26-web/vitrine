import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import CommercialDemoPage from '@/components/CommercialDemoPage'
import { commercialDemos, getCommercialDemo } from '@/lib/demo-pages'
import { getBaseUrl } from '@/lib/utils'

interface PageProps {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return commercialDemos.map((demo) => ({ slug: demo.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const demo = getCommercialDemo(slug)

  if (!demo) {
    return {
      title: 'Demo not found — Vitrine',
    }
  }

  const url = `${getBaseUrl()}/demo/${demo.slug}`
  return {
    title: `${demo.businessName} — Demo Vitrine`,
    description: demo.subheadline,
    alternates: { canonical: url },
    openGraph: {
      title: `${demo.businessName} — Demo Vitrine`,
      description: demo.subheadline,
      url,
      type: 'website',
      images: [{ url: demo.photos[0], alt: demo.businessName }],
    },
  }
}

export default async function DemoSlugPage({ params }: PageProps) {
  const { slug } = await params
  const demo = getCommercialDemo(slug)

  if (!demo) notFound()

  return <CommercialDemoPage demo={demo} />
}
