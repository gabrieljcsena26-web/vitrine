import { Clock, MapPin, Navigation } from 'lucide-react'
import type { Translations } from '@/lib/translations'

interface HourEntry {
  day: string
  open: boolean
  from: string
  to: string
}

interface Props {
  address?: string | null
  mapUrl?: string | null
  businessName?: string
  hours?: HourEntry[]
  t?: Translations
}

function getEmbedUrl(address?: string | null, mapUrl?: string | null) {
  if (mapUrl?.startsWith('https://www.google.com/maps/embed')) return mapUrl
  if (address) return `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`
  return null
}

function getDirectionsUrl(address?: string | null, mapUrl?: string | null) {
  if (mapUrl?.startsWith('http')) return mapUrl
  if (address) return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
  return null
}

export default function LocationMap({ address, mapUrl, businessName, hours, t }: Props) {
  const embedUrl = getEmbedUrl(address, mapUrl)
  const directionsUrl = getDirectionsUrl(address, mapUrl)
  const schedule = hours && hours.length > 0
    ? hours.map((h) => ({ day: h.day, hours: h.open ? `${h.from} - ${h.to}` : t?.hours.closed || 'Closed', open: h.open }))
    : []

  if (!address && !embedUrl && schedule.length === 0) return null

  return (
    <section id="location" className="py-24 bg-navy text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-2xl">
          <span className="text-gold font-semibold text-sm uppercase tracking-wider">Location</span>
          <h2 className="text-4xl font-bold mt-2">Find us easily</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 items-stretch">
          <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-white/5 min-h-[380px]">
            {embedUrl ? (
              <iframe
                title={`${businessName || 'Business'} location`}
                src={embedUrl}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-[380px] border-0"
              />
            ) : (
              <div className="h-[380px] flex items-center justify-center text-gray-400">Location map unavailable</div>
            )}
          </div>
          <div>
            <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-6">
              {address && (
                <div className="flex items-start gap-3 text-gray-300">
                  <MapPin className="w-5 h-5 text-gold flex-shrink-0 mt-1" />
                  <p className="text-lg leading-relaxed">{address}</p>
                </div>
              )}
              {directionsUrl && (
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-2 bg-gold text-navy px-6 py-3 rounded-full font-bold hover:bg-yellow-400 transition-colors"
                >
                  <Navigation className="w-4 h-4" />
                  Get directions
                </a>
              )}
            </div>
            {schedule.length > 0 && (
              <div className="mt-4 overflow-hidden rounded-3xl border border-white/10 bg-white text-navy shadow-2xl">
                <div className="flex items-center gap-3 bg-navy px-5 py-4 text-white">
                  <Clock className="h-5 w-5 text-gold" />
                  <p className="font-black">{t?.hours.title || 'Opening hours'}</p>
                </div>
                <div className="divide-y divide-stone-100">
                  {schedule.map((item) => (
                    <div key={item.day} className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
                      <span className="font-bold text-navy">{item.day}</span>
                      <span className={item.open ? 'font-semibold text-gray-500' : 'font-semibold text-red-400'}>{item.hours}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
