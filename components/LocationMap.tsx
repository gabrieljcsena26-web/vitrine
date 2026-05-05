import { MapPin, Navigation } from 'lucide-react'

interface Props {
  address?: string | null
  mapUrl?: string | null
  businessName?: string
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

export default function LocationMap({ address, mapUrl, businessName }: Props) {
  const embedUrl = getEmbedUrl(address, mapUrl)
  const directionsUrl = getDirectionsUrl(address, mapUrl)

  if (!address && !embedUrl) return null

  return (
    <section id="location" className="py-24 bg-navy text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-10 items-center">
          <div>
            <span className="text-gold font-semibold text-sm uppercase tracking-wider">Location</span>
            <h2 className="text-4xl font-bold mt-2 mb-5">Find us easily</h2>
            <div className="flex items-start gap-3 text-gray-300 mb-6">
              <MapPin className="w-5 h-5 text-gold flex-shrink-0 mt-1" />
              <p className="text-lg leading-relaxed">{address}</p>
            </div>
            {directionsUrl && (
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gold text-navy px-6 py-3 rounded-full font-bold hover:bg-yellow-400 transition-colors"
              >
                <Navigation className="w-4 h-4" />
                Get directions
              </a>
            )}
          </div>

          <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-white/5 min-h-[360px]">
            {embedUrl ? (
              <iframe
                title={`${businessName || 'Business'} location`}
                src={embedUrl}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-[360px] border-0"
              />
            ) : (
              <div className="h-[360px] flex items-center justify-center text-gray-400">Location map unavailable</div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
