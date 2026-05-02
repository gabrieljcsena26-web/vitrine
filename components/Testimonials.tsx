import { Star } from 'lucide-react'

export interface Testimonial {
  name: string
  text: string
  rating?: number
}

interface Props {
  testimonials?: Testimonial[] | null
  showDefaults?: boolean
}

const defaultTestimonials: Testimonial[] = [
  { name: 'Local customer', text: 'Very professional service, quick response and easy booking.', rating: 5 },
  { name: 'Happy client', text: 'The whole experience was simple, clear and reliable from start to finish.', rating: 5 },
  { name: 'Returning customer', text: 'Great attention to detail and a friendly team. Highly recommended.', rating: 5 },
]

export default function Testimonials({ testimonials, showDefaults = false }: Props) {
  const realItems = testimonials?.filter((item) => item.name && item.text) ?? []
  const items = realItems.length ? realItems : showDefaults ? defaultTestimonials : []

  if (items.length === 0) return null

  return (
    <section id="testimonials" className="py-24 bg-stone-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-gold font-semibold text-sm uppercase tracking-wider">Reviews</span>
          <h2 className="text-4xl font-bold text-navy mt-2 mb-4">What customers say</h2>
          <p className="text-gray-500 text-lg">Social proof helps new visitors feel confident before contacting you.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.slice(0, 3).map((item) => (
            <article key={`${item.name}-${item.text}`} className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm">
              <div className="flex items-center gap-1 text-gold mb-4">
                {Array.from({ length: Math.max(1, Math.min(5, item.rating ?? 5)) }).map((_, index) => (
                  <Star key={index} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 leading-relaxed mb-5">“{item.text}”</p>
              <p className="text-navy font-bold">{item.name}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
