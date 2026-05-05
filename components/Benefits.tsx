import { Award, Clock, HeartHandshake, ShieldCheck } from 'lucide-react'

interface Props {
  businessName?: string
  benefits?: string[] | null
}

const defaultBenefits = [
  'Fast response on WhatsApp',
  'Professional local service',
  'Clear prices before booking',
  'Easy scheduling for busy customers',
]

const icons = [
  <Clock key="clock" className="w-6 h-6" />,
  <Award key="award" className="w-6 h-6" />,
  <ShieldCheck key="shield" className="w-6 h-6" />,
  <HeartHandshake key="heart" className="w-6 h-6" />,
]

export default function Benefits({ businessName, benefits }: Props) {
  const items = benefits?.filter(Boolean).length ? benefits.filter(Boolean) : defaultBenefits

  return (
    <section id="benefits" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-gold font-semibold text-sm uppercase tracking-wider">Why choose us</span>
          <h2 className="text-4xl font-bold text-navy mt-2 mb-4">
            A better experience from first click to appointment
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            {businessName || 'This business'} makes it simple to understand the service, ask questions and book with confidence.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.slice(0, 4).map((benefit, index) => (
            <div key={benefit} className="rounded-2xl border border-stone-100 bg-stone-50 p-6 hover:border-gold/40 hover:-translate-y-1 transition-all">
              <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center text-gold mb-4">
                {icons[index % icons.length]}
              </div>
              <p className="text-navy font-bold text-lg leading-snug">{benefit}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
