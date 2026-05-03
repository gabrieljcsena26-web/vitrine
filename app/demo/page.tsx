import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ThumbsUp } from 'lucide-react'
import { commercialDemos } from '@/lib/demo-pages'

export const metadata = {
  title: 'Commercial demos — Vitrine',
  description: 'Explore ready-to-sell landing page demos for food businesses, barbershops, cleaning companies, beauty clinics and professional services.',
}

export default function DemoHubPage() {
  return (
    <main className="min-h-screen bg-navy text-white">
      <nav className="border-b border-white/10 bg-navy/95">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gold rounded-full flex items-center justify-center">
              <ThumbsUp className="w-4 h-4 text-navy" />
            </div>
            <span className="font-bold text-xl">Vitrine</span>
          </Link>
          <Link href="/dashboard" className="bg-gold text-navy px-4 py-2 rounded-full text-sm font-black hover:bg-yellow-400 transition-colors">
            Create demo
          </Link>
        </div>
      </nav>

      <section className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(212,175,55,0.18),transparent_32%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.08),transparent_28%)]" />
        <div className="relative max-w-6xl mx-auto text-center">
          <span className="inline-flex rounded-full border border-gold/20 bg-gold/10 px-4 py-2 text-gold text-sm font-bold uppercase tracking-wider">
            Sales-ready examples
          </span>
          <h1 className="text-5xl md:text-7xl font-black leading-tight mt-6 mb-6">
            Demos comerciais com estruturas diferentes para cada tipo de negócio.
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Veja como a Vitrine muda o formato para comida com cardápio e QR, barbearia, limpeza, estética e serviços profissionais como advocacia ou consultoria.
          </p>
        </div>
      </section>

      <section className="px-4 pb-24">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {commercialDemos.map((demo) => (
            <Link key={demo.slug} href={`/demo/${demo.slug}`} className="group rounded-3xl overflow-hidden bg-white text-navy shadow-2xl hover:-translate-y-2 transition-all">
              <div className="relative h-64">
                <Image src={demo.photos[0]} alt={demo.businessName} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="bg-gold text-navy text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-wider">{demo.category}</span>
                  <h2 className="text-white text-2xl font-black mt-3">{demo.businessName}</h2>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-500 leading-relaxed mb-5">{demo.subheadline}</p>
                <span className="inline-flex items-center gap-2 text-gold font-black group-hover:gap-3 transition-all">
                  Ver demo
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
