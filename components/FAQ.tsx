interface FAQItem {
  question: string
  answer: string
}

interface Props {
  items?: FAQItem[] | null
}

const defaultFaqs: FAQItem[] = [
  {
    question: 'How can I book?',
    answer: 'Use the WhatsApp or booking button on this page and the team will help you choose the best time.',
  },
  {
    question: 'Can I ask for prices before booking?',
    answer: 'Yes. Send a message with the service you need and you will receive clear information before confirming.',
  },
  {
    question: 'Where are you located?',
    answer: 'Check the location section on this page for the address and directions.',
  },
  {
    question: 'Do I need to pay online?',
    answer: 'No. Contact the business directly to confirm the appointment and payment method.',
  },
]

export default function FAQ({ items }: Props) {
  const faqs = items?.filter((item) => item.question && item.answer).length
    ? items.filter((item) => item.question && item.answer)
    : defaultFaqs

  return (
    <section id="faq" className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-gold font-semibold text-sm uppercase tracking-wider">FAQ</span>
          <h2 className="text-4xl font-bold text-navy mt-2">Questions before contacting?</h2>
        </div>

        <div className="space-y-4">
          {faqs.slice(0, 6).map((item) => (
            <details key={item.question} className="group rounded-2xl border border-stone-100 bg-stone-50 p-5 open:bg-white open:shadow-sm transition-all">
              <summary className="cursor-pointer list-none flex items-center justify-between gap-4 text-navy font-bold">
                {item.question}
                <span className="text-gold text-2xl leading-none group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="text-gray-500 leading-relaxed mt-4">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
