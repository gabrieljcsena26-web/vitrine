'use client'
import type { Translations } from '@/lib/translations'
import { Scissors, Sparkles, Heart, Wind } from 'lucide-react'

interface Service {
  name: string
  price: string
  icon: React.ReactNode
  description: string
}

interface Props {
  t: Translations
}

export default function Services({ t }: Props) {
  const services: Service[] = [
    {
      name: 'Haircut',
      price: '25€',
      icon: <Scissors className="w-6 h-6" />,
      description: 'Precision cut tailored to your face shape and style preferences',
    },
    {
      name: 'Color',
      price: '65€',
      icon: <Sparkles className="w-6 h-6" />,
      description: 'Full color, highlights, balayage — all with premium products',
    },
    {
      name: 'Treatment',
      price: '45€',
      icon: <Heart className="w-6 h-6" />,
      description: 'Deep conditioning and repair treatments for healthy, shiny hair',
    },
    {
      name: 'Blowout',
      price: '30€',
      icon: <Wind className="w-6 h-6" />,
      description: 'Professional blowout for volume, smoothness, and lasting style',
    },
  ]

  return (
    <section id="services" className="py-24 bg-navy">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-gold font-semibold text-sm uppercase tracking-wider">
            What we offer
          </span>
          <h2 className="text-4xl font-bold text-white mt-2 mb-4">
            {t.services.title}
          </h2>
          <p className="text-gray-400 text-lg">{t.services.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, i) => (
            <div
              key={i}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-gold/30 transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className="w-12 h-12 bg-gold/20 rounded-xl flex items-center justify-center mb-4 text-gold group-hover:bg-gold group-hover:text-navy transition-all duration-300">
                {service.icon}
              </div>
              <h3 className="text-white font-bold text-xl mb-2">{service.name}</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                {service.description}
              </p>
              <div className="text-gold font-bold text-2xl">{service.price}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
