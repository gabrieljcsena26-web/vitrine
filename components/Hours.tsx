'use client'
import type { Translations } from '@/lib/translations'
import { Clock } from 'lucide-react'

interface Props {
  t: Translations
}

export default function Hours({ t }: Props) {
  const schedule = [
    { day: t.hours.days.monday, hours: '9:00 – 20:00', open: true },
    { day: t.hours.days.tuesday, hours: '9:00 – 20:00', open: true },
    { day: t.hours.days.wednesday, hours: '9:00 – 20:00', open: true },
    { day: t.hours.days.thursday, hours: '9:00 – 20:00', open: true },
    { day: t.hours.days.friday, hours: '9:00 – 20:00', open: true },
    { day: t.hours.days.saturday, hours: '9:00 – 20:00', open: true },
    { day: t.hours.days.sunday, hours: t.hours.closed, open: false },
  ]

  const today = new Date().getDay() // 0=Sun, 1=Mon, ...
  const todayIndex = today === 0 ? 6 : today - 1

  return (
    <section id="hours" className="py-24 bg-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-gold font-semibold text-sm uppercase tracking-wider">
            Schedule
          </span>
          <h2 className="text-4xl font-bold text-navy mt-2">{t.hours.title}</h2>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-navy px-6 py-4 flex items-center gap-3">
            <Clock className="w-5 h-5 text-gold" />
            <span className="text-white font-semibold">Studio Elegance</span>
          </div>
          <div className="divide-y divide-gray-100">
            {schedule.map((item, i) => (
              <div
                key={i}
                className={`flex items-center justify-between px-6 py-4 transition-colors ${
                  i === todayIndex ? 'bg-gold/5' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  {i === todayIndex && (
                    <span className="w-2 h-2 bg-gold rounded-full" />
                  )}
                  <span
                    className={`font-medium ${
                      i === todayIndex ? 'text-navy font-semibold' : 'text-gray-700'
                    }`}
                  >
                    {item.day}
                  </span>
                </div>
                <span
                  className={`text-sm font-medium ${
                    item.open ? 'text-gray-600' : 'text-red-400'
                  } ${i === todayIndex ? 'text-gold font-semibold' : ''}`}
                >
                  {item.hours}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
