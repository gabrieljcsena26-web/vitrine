'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Language } from '@/lib/translations'
import AiLandingRenderer, { type AiBusinessData, type AiPageConfig } from '@/components/AiLandingRenderer'

const AI_PREVIEW_STORAGE_KEY = 'vitrine_ai_page_config'

export default function PreviewPage() {
  const router = useRouter()
  const [lang, setLang] = useState<Language>('en')
  const [userData, setUserData] = useState<AiBusinessData | null>(null)
  const [aiConfig, setAiConfig] = useState<AiPageConfig | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('vitrine_business_data')
      if (!saved) {
        router.replace('/dashboard')
        return
      }
      const data = JSON.parse(saved) as AiBusinessData
      if (!data.businessName) {
        router.replace('/dashboard')
        return
      }
      setUserData(data)
      const savedAiConfig = localStorage.getItem(AI_PREVIEW_STORAGE_KEY)
      if (savedAiConfig) setAiConfig(JSON.parse(savedAiConfig) as AiPageConfig)
      if (data.lang && ['pt', 'es', 'en', 'fr'].includes(data.lang)) {
        setLang(data.lang as Language)
      }
    } catch {
      router.replace('/dashboard')
      return
    }
    setLoading(false)
  }, [router])

  if (loading || !userData) return null

  return (
    <AiLandingRenderer business={userData} aiConfig={aiConfig} lang={lang} setLang={setLang} previewMode />
  )
}
