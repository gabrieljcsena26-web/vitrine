import { Star } from 'lucide-react'
import Image from 'next/image'

export interface Testimonial {
  name: string
  text: string
  rating?: number
  photo?: string
}

interface Props {
  testimonials?: Testimonial[] | null
  showDefaults?: boolean
}

const defaultTestimonials: Testimonial[] = [
  { name: 'Mariana Costa', text: 'Very professional service, quick response and easy booking.', rating: 5, photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop' },
  { name: 'Daniel Martins', text: 'The whole experience was simple, clear and reliable from start to finish.', rating: 4, photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop' },
  { name: 'Sofia Almeida', text: 'Great attention to detail and a friendly team. Highly recommended.', rating: 5, photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop' },
]

const GENERIC_NAMES = ['local customer', 'happy client', 'returning customer']

export default function Testimonials({ testimonials, showDefaults = false }: Props) {
  const realItems = testimonials
    ?.filter((item) => item.name && item.text)
    .map((item, index) => GENERIC_NAMES.includes(item.name.toLowerCase())
      ? { ...item, name: defaultTestimonials[index % defaultTestimonials.length].name }
      : item)
    ?? []
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
              <div className="flex items-center gap-3 mb-5">
                {item.photo && (
                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-stone-100 flex-shrink-0">
                    <Image src={item.photo} alt={item.name} fill className="object-cover" />
                  </div>
                )}
                <div>
                  <p className="text-navy font-bold">{item.name}</p>
                  <div className="flex items-center gap-1 text-gold mt-1">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star key={index} className={`w-4 h-4 ${index < Math.max(1, Math.min(5, item.rating ?? 5)) ? 'fill-current' : 'text-stone-200'}`} />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed mb-5">“{item.text}”</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
