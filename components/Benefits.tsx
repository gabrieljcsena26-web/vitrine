import { Award, Clock, HeartHandshake, ShieldCheck } from 'lucide-react'
import type { Language } from '@/lib/translations'

interface Props {
  businessName?: string
  benefits?: string[] | null
  lang?: Language
}

const copy = {
  pt: {
    eyebrow: 'Por que escolher',
    title: 'Tudo claro antes do cliente chamar ou reservar',
    subtitle: (name?: string) => `${name || 'Este negócio'} mostra serviços, preços, fotos e contacto direto numa experiência simples de decidir.`,
    benefits: ['Resposta rápida no WhatsApp', 'Serviço local profissional', 'Preços claros antes da reserva', 'Agendamento fácil para clientes ocupados'],
  },
  en: {
    eyebrow: 'Why choose us',
    title: 'A better experience from first click to appointment',
    subtitle: (name?: string) => `${name || 'This business'} makes it simple to understand the service, ask questions and book with confidence.`,
    benefits: ['Fast response on WhatsApp', 'Professional local service', 'Clear prices before booking', 'Easy scheduling for busy customers'],
  },
  es: {
    eyebrow: 'Por qué elegirnos',
    title: 'Todo claro antes de contactar o reservar',
    subtitle: (name?: string) => `${name || 'Este negocio'} muestra servicios, precios, fotos y contacto directo en una experiencia fácil de decidir.`,
    benefits: ['Respuesta rápida por WhatsApp', 'Servicio local profesional', 'Precios claros antes de reservar', 'Reserva fácil para clientes ocupados'],
  },
  fr: {
    eyebrow: 'Pourquoi choisir',
    title: 'Tout est clair avant de contacter ou réserver',
    subtitle: (name?: string) => `${name || 'Cette entreprise'} présente services, prix, photos et contact direct dans une expérience simple.`,
    benefits: ['Réponse rapide sur WhatsApp', 'Service local professionnel', 'Prix clairs avant réservation', 'Réservation simple pour clients pressés'],
  },
} as const

const icons = [
  <Clock key="clock" className="w-6 h-6" />,
  <Award key="award" className="w-6 h-6" />,
  <ShieldCheck key="shield" className="w-6 h-6" />,
  <HeartHandshake key="heart" className="w-6 h-6" />,
]

export default function Benefits({ businessName, benefits, lang = 'en' }: Props) {
  const text = copy[lang] ?? copy.en
  const items = benefits?.filter(Boolean).length ? benefits.filter(Boolean) : text.benefits

  return (
    <section id="benefits" className="py-24 bg-white relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-gold font-semibold text-sm uppercase tracking-wider">{text.eyebrow}</span>
          <h2 className="text-4xl font-bold text-navy mt-2 mb-4">
            {text.title}
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            {text.subtitle(businessName)}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.slice(0, 4).map((benefit, index) => (
            <div key={benefit} className="group rounded-[1.75rem] border border-stone-100 bg-gradient-to-br from-white to-stone-50 p-6 shadow-sm hover:border-gold/40 hover:-translate-y-1 hover:shadow-xl hover:shadow-gold/10 transition-all">
              <div className="w-12 h-12 bg-gold/10 rounded-2xl flex items-center justify-center text-gold mb-5 group-hover:bg-gold group-hover:text-navy transition-colors">
                {icons[index % icons.length]}
              </div>
              <p className="text-navy font-bold text-lg leading-snug">{benefit}</p>
              <div className="mt-5 h-1 w-12 rounded-full bg-gold/40 group-hover:w-20 transition-all" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
