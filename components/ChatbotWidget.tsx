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
}

interface Props {
  t: Translations
  businessInfo?: BusinessInfo
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

function getDynamicResponse(input: string, info: BusinessInfo): string {
  const lower = input.toLowerCase()

  if (lower.includes('book') || lower.includes('appointment') || lower.includes('reserv') || lower.includes('cita') || lower.includes('marcação')) {
    const contact = info.phone ? `call us at ${info.phone}` : info.email ? `email us at ${info.email}` : 'contact us'
    const addr = info.address ? ` or visit us at ${info.address}` : ''
    return `To book an appointment, ${contact}${addr}.`
  }

  if (lower.includes('price') || lower.includes('cost') || lower.includes('€') || lower.includes('precio') || lower.includes('preço') || lower.includes('quanto')) {
    if (info.services && info.services.length > 0) {
      const list = info.services
        .filter((s) => s.name)
        .map((s) => {
          const cleanPrice = s.price ? s.price.replace(/€/g, '').trim() : ''
          return `${s.name}${cleanPrice ? ` — €${cleanPrice}` : ''}`
        })
        .join(', ')
      return `Our services: ${list}.`
    }
    return `Please contact us for our current pricing.`
  }

  if (lower.includes('hour') || lower.includes('open') || lower.includes('horário') || lower.includes('horario') || lower.includes('when')) {
    if (info.hours && info.hours.length > 0) {
      const openDays = info.hours.filter((h) => h.open)
      if (openDays.length > 0) {
        const schedule = openDays.map((h) => `${h.day}: ${h.from}–${h.to}`).join(', ')
        return `We are open: ${schedule}.`
      }
    }
    return `Please contact us for our current hours.`
  }

  const contact = info.phone || info.email || 'our contact page'
  return `Thank you for your message! A team member will respond shortly. For urgent inquiries, reach us at ${contact}.`
}

export default function ChatbotWidget({ t, businessInfo }: Props) {
  const greeting = businessInfo
    ? `Hello! Welcome to ${businessInfo.name} 👋 How can I help you today?`
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

  // Update greeting when language or businessInfo changes
  useEffect(() => {
    const newGreeting = businessInfo
      ? `Hello! Welcome to ${businessInfo.name} 👋 How can I help you today?`
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
        ? getDynamicResponse(captured, businessInfo)
        : getMockResponse(captured, t)
      const botMsg: Message = { from: 'bot', text: response }
      setMessages((prev) => [...prev, botMsg])
    }, 800)
  }

  const displayName = businessInfo?.name || 'Studio Elegance'

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat window */}
      {open && (
        <div className="mb-4 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col" style={{ height: '420px' }}>
          {/* Header */}
          <div className="bg-navy px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gold rounded-full flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-navy" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{displayName}</p>
                <p className="text-green-400 text-xs">Online</p>
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
                  className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
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

          {/* Input */}
          <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
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
              className="w-9 h-9 bg-gold rounded-full flex items-center justify-center hover:bg-yellow-400 transition-colors flex-shrink-0"
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
