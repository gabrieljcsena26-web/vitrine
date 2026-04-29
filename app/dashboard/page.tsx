'use client'
import { useState, useMemo, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Scissors, Plus, Trash2, Upload, ArrowRight, Check } from 'lucide-react'

interface Service {
  name: string
  price: string
}

const STEPS = ['Business Info', 'Services & Hours', 'Photos', 'Preview']

const CATEGORIES = [
  'Hair Salon', 'Barber Shop', 'Nail Salon', 'Spa & Wellness', 'Beauty Clinic',
  'Tattoo Studio', 'Massage Therapy', 'Makeup Artist', 'Personal Trainer', 'Other',
]

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

// Configuration
const GENERATION_DURATION_MS = 2000 // Simulated page generation time
const COPY_SUCCESS_DURATION_MS = 2000 // How long to show "Copied!" message
const MAX_IMAGE_PX = 1000 // Max width/height for compressed photos
const IMAGE_QUALITY = 0.75 // JPEG quality for compressed photos

// Compress an image file to a small data URL using canvas
function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = reject
    reader.onload = (e) => {
      const img = new window.Image()
      img.onerror = reject
      img.onload = () => {
        let { width, height } = img
        if (width > MAX_IMAGE_PX || height > MAX_IMAGE_PX) {
          if (width >= height) {
            height = Math.round((height * MAX_IMAGE_PX) / width)
            width = MAX_IMAGE_PX
          } else {
            width = Math.round((width * MAX_IMAGE_PX) / height)
            height = MAX_IMAGE_PX
          }
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) { reject(new Error('canvas context unavailable')); return }
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', IMAGE_QUALITY))
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  })
}

// Helper function to generate URL-safe slug from business name
function generateSlug(name: string): string {
  const slug = (name || 'my-business')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
  
  // Fallback to default if result is empty (e.g., input was all special characters)
  return slug || 'my-business'
}

function safeImageSrc(src: string): string {
  const trimmed = src.trim()
  if (/^data:image\/(?:png|jpe?g|webp);base64,[a-z0-9+/=]+$/i.test(trimmed)) return encodeURI(trimmed)
  if (/^https:\/\/[^\s"'<>]+$/i.test(trimmed)) return encodeURI(trimmed)
  return ''
}

export default function DashboardPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [businessName, setBusinessName] = useState('')
  const [category, setCategory] = useState('Hair Salon')
  const [description, setDescription] = useState('')
  const [address, setAddress] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [lang, setLang] = useState('en')
  const [nameError, setNameError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [services, setServices] = useState<Service[]>([
    { name: 'Haircut', price: '25' },
    { name: 'Color', price: '65' },
  ])
  const [hours, setHours] = useState(
    DAYS.map((day) => ({ day, open: day !== 'Sunday', from: '09:00', to: '20:00' }))
  )
  const [heroPhoto, setHeroPhoto] = useState('')
  const [aboutPhoto, setAboutPhoto] = useState('')
  const [galleryPhotos, setGalleryPhotos] = useState<string[]>([])
  const [galleryDragging, setGalleryDragging] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGenerated, setIsGenerated] = useState(false)
  const [generationError, setGenerationError] = useState('')
  const [copySuccess, setCopySuccess] = useState(false)
  const [dashboardToken, setDashboardToken] = useState('')
  const [origin, setOrigin] = useState('')
  const generateTimeoutRef = useRef<NodeJS.Timeout>()
  const copySuccessTimeoutRef = useRef<NodeJS.Timeout>()
  const heroInputRef = useRef<HTMLInputElement>(null)
  const aboutInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)

  // Dashboard recovery
  const [recoveryEmail, setRecoveryEmail] = useState('')
  const [recoverySending, setRecoverySending] = useState(false)
  const [recoverySent, setRecoverySent] = useState(false)

  // Generate page URL slug
  const pageSlug = useMemo(() => generateSlug(businessName), [businessName])
  const pagePath = `/p/${pageSlug}`
  const publicPageUrl = origin ? `${origin}${pagePath}` : pagePath

  useEffect(() => {
    setOrigin(window.location.origin)

    return () => {
      if (generateTimeoutRef.current) {
        clearTimeout(generateTimeoutRef.current)
      }
      if (copySuccessTimeoutRef.current) {
        clearTimeout(copySuccessTimeoutRef.current)
      }
    }
  }, [])

  // Restore previously saved data
  useEffect(() => {
    try {
      const saved = localStorage.getItem('vitrine_business_data')
      if (saved) {
        const data = JSON.parse(saved)
        if (data.businessName) setBusinessName(data.businessName)
        if (data.category) setCategory(data.category)
        if (data.description) setDescription(data.description)
        if (data.address) setAddress(data.address)
        if (data.email) setEmail(data.email)
        if (data.phone) setPhone(data.phone)
        if (data.lang) setLang(data.lang)
        if (Array.isArray(data.services) && data.services.length) setServices(data.services)
        if (Array.isArray(data.hours) && data.hours.length) setHours(data.hours)
        if (Array.isArray(data.photos) && data.photos.length) {
          setHeroPhoto((data.photos as string[])[0] || '')
          setAboutPhoto((data.photos as string[])[1] || '')
          setGalleryPhotos((data.photos as string[]).slice(2).filter(Boolean))
        }
      }
    } catch {
      // ignore corrupt saved data
    }
  }, [])

  const addService = () => setServices([...services, { name: '', price: '' }])
  const removeService = (i: number) => setServices(services.filter((_, idx) => idx !== i))
  const updateService = (i: number, field: keyof Service, val: string) => {
    setServices(services.map((s, idx) => (idx === i ? { ...s, [field]: val } : s)))
  }
  const toggleDay = (i: number) => {
    setHours(hours.map((h, idx) => (idx === i ? { ...h, open: !h.open } : h)))
  }

  const handleSlotFile = (file: File, setter: (v: string) => void) => {
    if (!file.type.startsWith('image/')) return
    compressImage(file)
      .then((dataUrl) => {
        if (dataUrl && dataUrl.startsWith('data:image/')) setter(dataUrl)
      })
      .catch(() => undefined)
  }

  const handleGalleryFiles = (files: FileList | null) => {
    if (!files) return
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return
      compressImage(file)
        .then((dataUrl) => {
          if (dataUrl && dataUrl.startsWith('data:image/')) {
            setGalleryPhotos((prev) => [...prev, dataUrl])
          }
        })
        .catch(() => undefined)
    })
  }

  const saveBusinessData = (): boolean => {
    const photos = [heroPhoto, aboutPhoto, ...galleryPhotos]
    const data = { businessName, category, description, address, email, phone, lang, services, hours, photos }
    try {
      localStorage.setItem('vitrine_business_data', JSON.stringify(data))
      return true
    } catch {
      // Quota exceeded — retry without photos so at least the text data is saved
      try {
        localStorage.setItem('vitrine_business_data', JSON.stringify({ ...data, photos: [] }))
      } catch {
        // localStorage unavailable — ignore
      }
      return false
    }
  }

  const handleNext = () => {
    if (step === 0) {
      if (!validateBusinessInfo()) return
    }
    setStep(step + 1)
  }

  const validateBusinessInfo = () => {
    const missingName = !businessName.trim()
    const missingEmail = !email.trim()

    setNameError(missingName ? 'Business name is required.' : '')
    setEmailError(missingEmail ? 'Email is required to publish your page and send your dashboard link.' : '')

    return !missingName && !missingEmail
  }

  const handleGeneratePage = async () => {
    if (!validateBusinessInfo()) {
      setStep(0)
      return
    }
    if (generateTimeoutRef.current) {
      clearTimeout(generateTimeoutRef.current)
    }
    saveBusinessData()
    setIsGenerating(true)
    setGenerationError('')
    try {
      const res = await fetch('/api/businesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName,
          slug: pageSlug,
          category,
          description,
          address,
          email,
          phone,
          lang,
          services,
          hours,
          photos: [heroPhoto, aboutPhoto, ...galleryPhotos],
        }),
      })
      if (!res.ok) {
        throw new Error('Failed to publish your page. Please try again or contact support if the problem persists.')
      }
      const json = await res.json()
      if (json.token) setDashboardToken(json.token)
      generateTimeoutRef.current = setTimeout(() => {
        setIsGenerating(false)
        setIsGenerated(true)
      }, GENERATION_DURATION_MS)
    } catch (err) {
      setIsGenerating(false)
      setGenerationError(
        err instanceof Error
          ? err.message
          : 'Failed to publish your page. Please try again or contact support if the problem persists.'
      )
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicPageUrl)
      setCopySuccess(true)
      copySuccessTimeoutRef.current = setTimeout(() => setCopySuccess(false), COPY_SUCCESS_DURATION_MS)
    } catch (err) {
      // Fallback for browsers that don't support clipboard API
      console.error('Failed to copy:', err)
      alert(`Failed to copy link. Please copy manually:\n\n${publicPageUrl}`)
    }
  }

  const handleRecovery = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!recoveryEmail.trim()) return
    setRecoverySending(true)
    try {
      await fetch('/api/dashboard/recover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: recoveryEmail.trim() }),
      })
    } catch {
      // fail silently
    } finally {
      setRecoverySending(false)
      setRecoverySent(true)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-navy border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gold rounded-full flex items-center justify-center">
              <Scissors className="w-3.5 h-3.5 text-navy" />
            </div>
            <span className="text-white font-bold">Vitrine</span>
          </Link>
          <Link href="/demo" className="text-gray-400 hover:text-white text-sm transition-colors">
            View Demo →
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress steps */}
        <div className="mb-10">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 -z-10" />
            <div
              className="absolute top-4 left-0 h-0.5 bg-gold -z-10 transition-all duration-500"
              style={{ width: `${(step / (STEPS.length - 1)) * 100}%` }}
            />
            {STEPS.map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <button
                  onClick={() => i <= step && setStep(i)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    i < step
                      ? 'bg-gold text-navy'
                      : i === step
                      ? 'bg-navy text-white ring-2 ring-gold ring-offset-2'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {i < step ? <Check className="w-4 h-4" /> : i + 1}
                </button>
                <span className={`text-xs font-medium hidden sm:block ${i === step ? 'text-navy' : 'text-gray-400'}`}>
                  {s}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Step content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {step === 0 && (
            <div>
              <h2 className="text-2xl font-bold text-navy mb-6">Business Information</h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Name *</label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => { setBusinessName(e.target.value); if (e.target.value.trim()) setNameError('') }}
                    placeholder="e.g. My Barbershop"
                    className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:border-gold transition-colors ${nameError ? 'border-red-400' : 'border-gray-200'}`}
                  />
                  {nameError && <p className="text-red-500 text-xs mt-1">{nameError}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-gold transition-colors bg-white"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    placeholder="Tell your customers about your business..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-gold transition-colors resize-none"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Street, City, Country"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-gold transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 555 000 0000"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-gold transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (e.target.value.trim()) setEmailError('') }}
                    placeholder="contact@yourbusiness.com"
                    className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:border-gold transition-colors ${emailError ? 'border-red-400' : 'border-gray-200'}`}
                  />
                  {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Language Preference</label>
                  <div className="flex gap-2">
                    {['pt', 'es', 'en'].map((l) => (
                      <button
                        key={l}
                        onClick={() => setLang(l)}
                        className={`px-4 py-2 rounded-xl border font-medium uppercase text-sm transition-all ${
                          lang === l
                            ? 'bg-navy text-gold border-navy'
                            : 'border-gray-200 text-gray-500 hover:border-gray-300'
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-navy mb-6">Services & Opening Hours</h2>

              {/* Services */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800">Services</h3>
                  <button
                    onClick={addService}
                    className="flex items-center gap-1 text-gold text-sm font-medium hover:text-yellow-600 transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Add service
                  </button>
                </div>
                <div className="space-y-3">
                  {services.map((svc, i) => (
                    <div key={i} className="flex gap-3 items-center">
                      <input
                        type="text"
                        value={svc.name}
                        onChange={(e) => updateService(i, 'name', e.target.value)}
                        placeholder="Service name"
                        className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-gold transition-colors text-sm"
                      />
                      <div className="relative w-28">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
                        <input
                          type="number"
                          value={svc.price}
                          onChange={(e) => updateService(i, 'price', e.target.value)}
                          placeholder="0"
                          className="w-full border border-gray-200 rounded-xl pl-7 pr-3 py-2.5 focus:outline-none focus:border-gold transition-colors text-sm"
                        />
                      </div>
                      <button
                        onClick={() => removeService(i)}
                        className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hours */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-4">Opening Hours</h3>
                <div className="space-y-2">
                  {hours.map((h, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <button
                        onClick={() => toggleDay(i)}
                        className={`w-5 h-5 rounded flex-shrink-0 border-2 flex items-center justify-center transition-all ${
                          h.open ? 'bg-gold border-gold' : 'border-gray-300'
                        }`}
                      >
                        {h.open && <Check className="w-3 h-3 text-navy" />}
                      </button>
                      <span className="w-28 text-sm font-medium text-gray-700">{h.day}</span>
                      {h.open ? (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <input
                            type="time"
                            value={h.from}
                            onChange={(e) =>
                              setHours(hours.map((hh, idx) => (idx === i ? { ...hh, from: e.target.value } : hh)))
                            }
                            className="border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:border-gold text-sm"
                          />
                          <span>–</span>
                          <input
                            type="time"
                            value={h.to}
                            onChange={(e) =>
                              setHours(hours.map((hh, idx) => (idx === i ? { ...hh, to: e.target.value } : hh)))
                            }
                            className="border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:border-gold text-sm"
                          />
                        </div>
                      ) : (
                        <span className="text-sm text-red-400">Closed</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-navy mb-2">Photos</h2>
              <p className="text-gray-400 text-sm mb-8">
                Add a photo for each section. Each slot appears in a specific place on your page.
              </p>

              {/* Hidden file inputs — one per slot */}
              <input ref={heroInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleSlotFile(e.target.files[0], setHeroPhoto)} />
              <input ref={aboutInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleSlotFile(e.target.files[0], setAboutPhoto)} />
              <input ref={galleryInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleGalleryFiles(e.target.files)} />

              <div className="space-y-5">
                {/* ── Slot 1: Hero Photo ── */}
                <div className="border border-gray-200 rounded-2xl p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-gold font-black text-sm">1</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center flex-wrap gap-2 mb-1">
                        <h3 className="font-bold text-navy">Hero Photo</h3>
                        <span className="bg-gold text-navy text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Full-screen background
                        </span>
                      </div>
                      <p className="text-gray-400 text-xs mb-4">
                        First thing visitors see — fills the entire screen on arrival. Best: a wide photo of your space or best work.
                      </p>
                      {heroPhoto ? (
                        <div className="relative w-full h-36 rounded-xl overflow-hidden group">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={safeImageSrc(heroPhoto)} alt="Hero photo" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button onClick={() => heroInputRef.current?.click()} className="bg-white text-navy text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-gold transition-colors">
                              Change
                            </button>
                            <button onClick={() => setHeroPhoto('')} className="bg-red-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-red-600 transition-colors">
                              Remove
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => heroInputRef.current?.click()}
                          className="flex items-center gap-3 border-2 border-dashed border-gray-200 rounded-xl px-5 py-4 w-full hover:border-gold/50 hover:bg-gray-50 transition-all text-left"
                        >
                          <Upload className="w-5 h-5 text-gray-300 flex-shrink-0" />
                          <span className="text-gray-400 text-sm">Click to upload hero photo</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── Slot 2: About Photo ── */}
                <div className="border border-gray-200 rounded-2xl p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-navy/5 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-navy font-black text-sm">2</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center flex-wrap gap-2 mb-1">
                        <h3 className="font-bold text-navy">About Photo</h3>
                        <span className="bg-navy text-gold text-[10px] font-bold px-2 py-0.5 rounded-full">
                          About Us section
                        </span>
                      </div>
                      <p className="text-gray-400 text-xs mb-4">
                        Shown beside your description in the &ldquo;About Us&rdquo; section. Best: a portrait, team photo, or interior shot.
                      </p>
                      {aboutPhoto ? (
                        <div className="relative w-full h-36 rounded-xl overflow-hidden group">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={safeImageSrc(aboutPhoto)} alt="About photo" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button onClick={() => aboutInputRef.current?.click()} className="bg-white text-navy text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-gold transition-colors">
                              Change
                            </button>
                            <button onClick={() => setAboutPhoto('')} className="bg-red-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-red-600 transition-colors">
                              Remove
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => aboutInputRef.current?.click()}
                          className="flex items-center gap-3 border-2 border-dashed border-gray-200 rounded-xl px-5 py-4 w-full hover:border-gold/50 hover:bg-gray-50 transition-all text-left"
                        >
                          <Upload className="w-5 h-5 text-gray-300 flex-shrink-0" />
                          <span className="text-gray-400 text-sm">Click to upload about photo</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── Slot 3+: Gallery Photos ── */}
                <div className="border border-gray-200 rounded-2xl p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-gray-500 font-black text-xs">3+</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center flex-wrap gap-2 mb-1">
                        <h3 className="font-bold text-navy">Gallery Photos</h3>
                        <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Portfolio grid
                        </span>
                      </div>
                      <p className="text-gray-400 text-xs mb-4">
                        Shown in the photo grid on your page. Add your best work photos — the more the better!
                      </p>
                      {galleryPhotos.length > 0 && (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
                          {galleryPhotos.map((src, i) => (
                            <div key={i} className="relative group">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={safeImageSrc(src)}
                                alt={`Gallery ${i + 1}`}
                                className="w-full h-20 object-cover rounded-lg"
                              />
                              <button
                                onClick={() => setGalleryPhotos(galleryPhotos.filter((_, idx) => idx !== i))}
                                className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      <div
                        onDragOver={(e) => { e.preventDefault(); setGalleryDragging(true) }}
                        onDragLeave={() => setGalleryDragging(false)}
                        onDrop={(e) => {
                          e.preventDefault()
                          setGalleryDragging(false)
                          handleGalleryFiles(e.dataTransfer.files)
                        }}
                        onClick={() => galleryInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
                          galleryDragging
                            ? 'border-gold bg-gold/5'
                            : 'border-gray-200 hover:border-gold/50 hover:bg-gray-50'
                        }`}
                      >
                        <Upload className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-400 text-sm">
                          {galleryPhotos.length > 0 ? 'Drag & drop or click to add more' : 'Drag & drop or click to add gallery photos'}
                        </p>
                        <p className="text-gray-300 text-xs mt-1">JPG, PNG, WEBP</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-8">
              {!isGenerated ? (
                <>
                  <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check className="w-10 h-10 text-gold" />
                  </div>
                  <h2 className="text-2xl font-bold text-navy mb-3">
                    {businessName || 'Your business'} is ready!
                  </h2>
                  <p className="text-gray-500 mb-8">
                    Your page is ready to preview. Click below to see how it looks.
                  </p>
                  <div className="bg-gray-50 rounded-xl p-4 mb-8 text-left max-w-sm mx-auto">
                    <p className="text-xs text-gray-400 mb-1">Your page URL</p>
                    <p className="text-navy font-mono text-sm break-all">
                      {publicPageUrl}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={() => { saveBusinessData(); router.push('/preview') }}
                      className="flex items-center gap-2 justify-center bg-navy text-white px-8 py-3 rounded-full font-semibold hover:bg-navy/90 transition-colors"
                    >
                      Preview Page
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={handleGeneratePage}
                      disabled={isGenerating}
                      className="bg-gold text-navy px-8 py-3 rounded-full font-bold hover:bg-yellow-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 justify-center"
                    >
                      {isGenerating ? (
                        <>
                          <span className="inline-block w-4 h-4 border-2 border-navy border-t-transparent rounded-full animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>Generate My Page 🚀</>
                      )}
                    </button>
                  </div>
                  {generationError && (
                    <p className="mt-4 text-sm text-red-500 max-w-sm mx-auto">
                      {generationError}
                    </p>
                  )}
                </>
              ) : (
                <>
                  <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check className="w-10 h-10 text-green-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-navy mb-3">
                    🎉 Page Generated Successfully!
                  </h2>
                  <p className="text-gray-500 mb-6">
                    Your page is now live and ready to share with customers.
                  </p>
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-8 text-left max-w-sm mx-auto">
                    <p className="text-xs text-green-600 font-medium mb-2">✓ Your page is live at:</p>
                    <p className="text-navy font-mono text-sm break-all">
                      {publicPageUrl}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                      href={`/p/${pageSlug}`}
                      onClick={saveBusinessData}
                      className="flex items-center gap-2 justify-center bg-gold text-navy px-8 py-3 rounded-full font-bold hover:bg-yellow-400 transition-colors"
                    >
                      View Your Page
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <button 
                      onClick={handleCopyLink}
                      className="bg-navy text-white px-8 py-3 rounded-full font-semibold hover:bg-navy/90 transition-colors"
                    >
                      {copySuccess ? '✓ Copied!' : 'Copy Link'}
                    </button>
                  </div>
                  {dashboardToken && (
                    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4 max-w-sm mx-auto text-left">
                      <p className="text-xs text-blue-600 font-medium mb-2">📊 Your private dashboard:</p>
                      <Link
                        href={`/dashboard/${dashboardToken}`}
                        className="text-blue-700 font-mono text-sm break-all hover:underline"
                      >
                        /dashboard/{dashboardToken}
                      </Link>
                      <p className="text-xs text-blue-500 mt-1">Save this link — it&apos;s your only way to access leads &amp; stats.</p>
                    </div>
                  )}
                  <p className="text-sm text-gray-400 mt-6">
                    Share this link on Instagram, WhatsApp, or Google to get more customers!
                  </p>
                </>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
            <button
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
              className="px-6 py-2.5 border border-gray-200 rounded-xl text-gray-600 font-medium hover:border-gray-300 transition-colors disabled:opacity-30"
            >
              Back
            </button>
            {step < STEPS.length - 1 ? (
              <button
                onClick={handleNext}
                className="px-6 py-2.5 bg-navy text-white rounded-xl font-medium hover:bg-navy/90 transition-colors flex items-center gap-2"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : null}
          </div>
        </div>

        {/* Dashboard recovery */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-base font-bold text-navy mb-1">Already have a page?</h3>
          <p className="text-sm text-gray-500 mb-4">
            Enter your email and we&apos;ll send your dashboard link(s) so you can access your leads and stats.
          </p>
          {recoverySent ? (
            <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
              <Check className="w-4 h-4" />
              If we found an account with that email, we sent the dashboard link(s) to your inbox.
            </div>
          ) : (
            <form onSubmit={handleRecovery} className="flex gap-3 flex-col sm:flex-row">
              <input
                type="email"
                required
                value={recoveryEmail}
                onChange={(e) => setRecoveryEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold transition-colors"
              />
              <button
                type="submit"
                disabled={recoverySending || !recoveryEmail.trim()}
                className="bg-navy text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-navy/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {recoverySending ? 'Sending…' : 'Send my link'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
