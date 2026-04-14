'use client'
import type { Translations } from '@/lib/translations'
import Image from 'next/image'
import { MapPin, Mail } from 'lucide-react'

interface Props {
  t: Translations
  address: string
  email: string
  description?: string
  businessName?: string
  aboutPhoto?: string
}

export default function About({ t, address, email, description, businessName, aboutPhoto }: Props) {
  const imgSrc = aboutPhoto || 'https://picsum.photos/seed/salon2/800/600'
  return (
    <section id="about" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <div className="relative">
            <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src={imgSrc}
                alt={businessName || 'About'}
                fill
                className="object-cover"
                unoptimized={imgSrc.startsWith('data:')}
              />
            </div>
            <div className="absolute -bottom-6 -right-6 bg-navy rounded-2xl p-6 shadow-xl">
              <p className="text-gold font-bold text-3xl">10+</p>
              <p className="text-white text-sm">Years of experience</p>
            </div>
          </div>

          {/* Content */}
          <div>
            <span className="text-gold font-semibold text-sm uppercase tracking-wider">
              {businessName || 'Studio Elegance'}
            </span>
            <h2 className="text-4xl font-bold text-navy mt-2 mb-6">
              {t.about.title}
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-8">
              {description || t.about.description}
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-600">
                <div className="w-10 h-10 bg-gold/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-gold" />
                </div>
                <span>{address}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <div className="w-10 h-10 bg-gold/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-gold" />
                </div>
                <span>{email}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
