'use client'
import { useState, useRef, useEffect } from 'react'
import type { Translations } from '@/lib/translations'
import { MessageCircle, X, Send } from 'lucide-react'

interface Message {
  from: 'user' | 'bot'
  text: string
}

interface BusinessInfo {
  name: string
  address?: string
  email?: string
  phone?: string
  hours?: { day: string; open: boolean; from: string; to: string }[]
  services?: { name: string; price: string }[]
  bookingUrl?: string
  whatsappNumber?: string
}

interface Props {
  t: Translations
  businessInfo?: BusinessInfo
}

function getSmartResponse(input: string, info: BusinessInfo): string {
  const q = input.toLowerCase().trim()

  // ── Greetings ──────────────────────────────────────────────────────────────
  if (/^(hi|hello|hey|oi|olá|ola|hola|bom dia|boa tarde|boa noite|buenos días|buenas tardes|buenas noches|good morning|good afternoon|good evening)\b/.test(q)) {
    return `Hello! 👋 Welcome to ${info.name}. How can I help you today? You can ask about our services, prices, opening hours, location, or how to book an appointment.`
  }

  // ── Booking / appointment ─────────────────────────────────────────────────
  if (/book|appointment|reserv|agendar|marcação|marcar|cita|schedule|horário disponível|quiero reservar|como agendar/.test(q)) {
    if (info.bookingUrl) {
      return `To book an appointment, use our online scheduling link: ${info.bookingUrl} 📅\nYou can choose your preferred date and time directly there.`
    }
    const ways: string[] = []
    if (info.phone) ways.push(`📞 Call us: ${info.phone}`)
    if (info.email) ways.push(`✉️ Email us: ${info.email}`)
    if (info.whatsappNumber) ways.push(`💬 WhatsApp: ${info.whatsappNumber}`)
    if (ways.length > 0) return `To schedule an appointment:\n${ways.join('\n')}`
    return `To book an appointment, please use the contact form on this page and we'll get back to you quickly! 📅`
  }

  // ── Prices / services ─────────────────────────────────────────────────────
  if (/price|cost|how much|pricing|preço|quanto|valor|custo|precio|cuánto|serviços|servicios|services|what do you offer|o que vocês fazem/.test(q)) {
    if (info.services && info.services.length > 0) {
      const list = info.services
        .filter((s) => s.name)
        .map((s) => {
          const price = s.price ? ` — ${s.price}` : ''
          return `• ${s.name}${price}`
        })
        .join('\n')
      return `Here are our services and prices:\n${list}`
    }
    const contact = info.email || info.phone
    return contact
      ? `For detailed pricing, please contact us at ${contact} and we'll be happy to help!`
      : `For our current pricing, please use the contact form on this page and we'll send you all the details!`
  }

  // ── Opening hours ─────────────────────────────────────────────────────────
  if (/hour|open|when|horário|horario|abre|fecha|opens|closes|funcionamento|what time|que horas|a que horas/.test(q)) {
    if (info.hours && info.hours.length > 0) {
      const openDays = info.hours.filter((h) => h.open)
      if (openDays.length > 0) {
        const schedule = openDays.map((h) => `• ${h.day}: ${h.from}–${h.to}`).join('\n')
        return `🕐 Our opening hours:\n${schedule}`
      }
    }
    const contact = info.phone || info.email
    return contact
      ? `For our current hours, please contact us at ${contact}.`
      : `Please use the contact form to ask about our hours and we'll reply promptly!`
  }

  // ── Location / address ────────────────────────────────────────────────────
  if (/where|location|address|endereço|onde|direção|como chegar|como llegar|ubicación|dirección|find you|where are you/.test(q)) {
    if (info.address) {
      return `📍 You can find us at:\n${info.address}`
    }
    const contact = info.phone || info.email
    return contact
      ? `For directions, please contact us at ${contact} and we'll guide you right to us!`
      : `Please use the contact form for our address and we'll respond quickly!`
  }

  // ── Contact / phone / email / WhatsApp ────────────────────────────────────
  if (/contact|phone|email|whatsapp|telefone|ligar|speak|talk|como falar|como contactar|como me comunico/.test(q)) {
    const parts: string[] = []
    if (info.phone) parts.push(`📞 Phone: ${info.phone}`)
    if (info.email) parts.push(`✉️ Email: ${info.email}`)
    if (info.whatsappNumber) parts.push(`💬 WhatsApp: ${info.whatsappNumber}`)
    if (parts.length > 0) return `Here's how to reach us:\n${parts.join('\n')}`
    return `You can reach us through the contact form at the bottom of this page and we'll get back to you shortly!`
  }

  // ── About / identity ──────────────────────────────────────────────────────
  if (/about|who are you|who is|o que é|quem|sobre|what is/.test(q)) {
    const servicesHint =
      info.services && info.services.length > 0
        ? ` We offer ${info.services
            .slice(0, 3)
            .filter((s) => s.name)
            .map((s) => s.name)
            .join(', ')}${info.services.length > 3 ? ', and more' : ''}.`
        : ''
    return `Welcome to ${info.name}! 😊${servicesHint} Feel free to ask about our services, prices, hours, or how to book. I'm here to help!`
  }

  // ── Availability / wait time ──────────────────────────────────────────────
  if (/available|availability|wait|waiting|disponível|disponible|espera/.test(q)) {
    if (info.bookingUrl) {
      return `You can check real-time availability and book directly at: ${info.bookingUrl} 📅`
    }
    const contact = info.phone || info.email
    return contact
      ? `For availability, please contact us at ${contact} and we'll find the best time for you!`
      : `Please use the contact form to check availability and we'll reply as soon as possible!`
  }

  // ── Default fallback ──────────────────────────────────────────────────────
  const parts: string[] = []
  if (info.phone) parts.push(info.phone)
  if (info.email) parts.push(info.email)
  const reachUs = parts.length > 0 ? parts.join(' or ') : 'the contact form below'
  return `Thank you for your message! 😊 A team member will get back to you shortly. For immediate help, reach us at ${reachUs}.`
}

function getMockResponse(input: string, t: Translations): string {
  const lower = input.toLowerCase()
  if (lower.includes('book') || lower.includes('appointment') || lower.includes('reserv') || lower.includes('cita') || lower.includes('marcação')) {
    return t.chatbot.responses.booking
  }
  if (lower.includes('price') || lower.includes('cost') || lower.includes('€') || lower.includes('precio') || lower.includes('preço') || lower.includes('quanto')) {
    return t.chatbot.responses.price
  }
  if (lower.includes('hour') || lower.includes('open') || lower.includes('horário') || lower.includes('horario') || lower.includes('when')) {
    return t.chatbot.responses.hours
  }
  return t.chatbot.responses.default
}

export default function ChatbotWidget({ t, businessInfo }: Props) {
  const greeting = businessInfo
    ? `Hello! Welcome to ${businessInfo.name} 👋 How can I help you today? Ask about our services, prices, hours, or how to book.`
    : t.chatbot.greeting

  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { from: 'bot', text: greeting },
  ])
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const newGreeting = businessInfo
      ? `Hello! Welcome to ${businessInfo.name} 👋 How can I help you today? Ask about our services, prices, hours, or how to book.`
      : t.chatbot.greeting
    setMessages([{ from: 'bot', text: newGreeting }])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t.chatbot.greeting, businessInfo?.name])

  const sendMessage = () => {
    if (!input.trim()) return
    const userMsg: Message = { from: 'user', text: input.trim() }
    setMessages((prev) => [...prev, userMsg])
    const captured = input
    setInput('')
    setTimeout(() => {
      const response = businessInfo
        ? getSmartResponse(captured, businessInfo)
        : getMockResponse(captured, t)
      const botMsg: Message = { from: 'bot', text: response }
      setMessages((prev) => [...prev, botMsg])
    }, 600)
  }

  const displayName = businessInfo?.name || 'Studio Elegance'

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <div className="mb-4 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col" style={{ height: '440px' }}>
          {/* Header */}
          <div className="bg-navy px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gold rounded-full flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-navy" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{displayName}</p>
                <p className="text-green-400 text-xs">Online · Ready to help</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm whitespace-pre-line ${
                    msg.from === 'user'
                      ? 'bg-gold text-navy font-medium rounded-tr-sm'
                      : 'bg-white text-gray-700 shadow-sm border border-gray-100 rounded-tl-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Quick suggestions */}
          {messages.length === 1 && (
            <div className="px-3 pb-2 bg-gray-50 flex flex-wrap gap-1.5 flex-shrink-0">
              {['Services & Prices', 'Opening Hours', 'Book Now', 'Location'].map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    const userMsg: Message = { from: 'user', text: s }
                    setMessages((prev) => [...prev, userMsg])
                    setTimeout(() => {
                      const response = businessInfo ? getSmartResponse(s, businessInfo) : getMockResponse(s, t)
                      setMessages((prev) => [...prev, { from: 'bot', text: response }])
                    }, 600)
                  }}
                  className="bg-white border border-gray-200 text-gray-600 text-xs px-2.5 py-1 rounded-full hover:border-gold hover:text-gold transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 bg-white border-t border-gray-100 flex gap-2 flex-shrink-0">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder={t.chatbot.placeholder}
              className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm outline-none focus:bg-gray-200 transition-colors"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className="w-9 h-9 bg-gold rounded-full flex items-center justify-center hover:bg-yellow-400 transition-colors flex-shrink-0 disabled:opacity-40"
            >
              <Send className="w-4 h-4 text-navy" />
            </button>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className="w-14 h-14 bg-gold rounded-full flex items-center justify-center shadow-lg hover:bg-yellow-400 transition-all hover:scale-110 active:scale-95"
        aria-label="Open chat"
      >
        {open ? (
          <X className="w-6 h-6 text-navy" />
        ) : (
          <MessageCircle className="w-6 h-6 text-navy" />
        )}
      </button>
    </div>
  )
}
