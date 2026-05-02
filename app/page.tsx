'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ThumbsUp, Upload, FileText, Zap, Check, ArrowRight, BarChart3, Globe2, MessageCircle, CalendarDays, Eye, Users, MousePointerClick, Sparkles } from 'lucide-react'
import LanguageSwitcher from '@/components/LanguageSwitcher'

type Lang = 'pt' | 'es' | 'en' | 'fr'

const homeCopy = {
  pt: {
    demos: 'Ver demos', login: 'Entrar', testLogin: 'Login teste', getStarted: 'Começar', badge: 'Landing page + leads + dashboard',
    heroTitle: 'Monte a landing page do seu negócio', heroAccent: ' em minutos.',
    heroText: 'Vitrine cria uma página profissional para o seu negócio, com WhatsApp, agendamento, fotos, avaliações, idiomas e um dashboard simples para acompanhar resultados.',
    primaryCta: 'Criar minha página', secondaryCta: 'Abrir dashboard demo', stats: [['4', 'Idiomas'], ['2', 'Planos'], ['24/7', 'Página online']],
    includedEyebrow: 'O que está incluído', includedTitle: 'Tudo para colocar seu negócio online com aparência profissional.', includedText: 'Um setup guiado, seções prontas e um dashboard claro para qualquer dono de negócio local.',
    features: [
      ['Enviar fotos', 'Envie as melhores fotos do seu negócio. A Vitrine organiza tudo numa página bonita.'],
      ['Preencher informações', 'Adicione nome, serviços, horários, localização e contatos em poucos minutos.'],
      ['Publicar rapidamente', 'Sua landing page fica pronta para compartilhar no Instagram, WhatsApp e Google.'],
    ],
    valueEyebrow: 'Feito para vender', valueTitle: 'Uma página simples para transformar visitantes em contatos reais.',
    valueText: 'Sem site complicado: seu negócio ganha uma vitrine focada, com WhatsApp, agendamento, fotos, avaliações, localização e métricas fáceis.', demoCta: 'Ver demos comerciais',
    valueCards: [
      ['WhatsApp em destaque', 'Leve visitantes direto para uma conversa.'],
      ['Agendamento pronto', 'Conecte o calendário ou plataforma que você já usa.'],
      ['Base de SEO local', 'Metadados, sitemap e estrutura para negócio local.'],
      ['Dashboard simples', 'Veja visitas, leads, canais e próxima ação recomendada.'],
    ],
    previewEyebrow: 'Prévia da página', previewTitle: 'Mostre seu negócio com fotos, serviços e botões claros.', previewText: 'Use suas fotos reais, horários, avaliações, WhatsApp e agendamento para criar uma apresentação confiável antes de divulgar.',
    previewCards: [['Foto principal', 'Primeira impressão'], ['Sobre o negócio', 'História e confiança'], ['Serviços', 'Ofertas claras'], ['Galeria', 'Prova visual']],
    processEyebrow: 'Processo simples', processTitle: 'Como funciona',
    steps: [['01', 'Crie sua página', 'Use o setup guiado para montar a estrutura principal.'], ['02', 'Adicione seu negócio', 'Preencha informações, fotos, serviços e horários.'], ['03', 'Compartilhe o link', 'Publique no Instagram, WhatsApp, Google e materiais com QR Code.']],
    plansEyebrow: 'Planos', plansTitle: 'Escolha a capacidade de páginas', plansText: 'A capacidade dos planos está pronta; condições comerciais ficam privadas durante o beta.',
    starterDesc: 'Perfeito para uma página de negócio', proDesc: 'Para múltiplos serviços ou locais', popular: 'Mais escolhido', startStarter: 'Começar Starter', choosePro: 'Escolher Pro',
    readyTags: ['Demos prontas', 'Leads por WhatsApp', 'Base de SEO'], readyTitle: 'Pronto para colocar no ar?', readyText: 'Crie uma página profissional e veja exatamente como seu negócio pode aparecer online.', readyCta: 'Criar uma página demo',
    footerDemo: 'Demo', footerDashboard: 'Dashboard', dashboardMock: { title: 'Dashboard Vitrine', business: 'Luna Studio', period: '30 dias', tabs: ['Visão geral', 'Leads', 'Canais', 'Ajustes'], metrics: [['128', 'Visitas'], ['34', 'Ações'], ['12', 'Leads'], ['9.4%', 'Conversão']], action: 'Próxima ação', actionText: 'Instagram é seu melhor canal. Continue compartilhando ali e teste um QR Code na loja.', leads: 'Leads recentes', channels: 'Top canais' },
  },
  en: {
    demos: 'View demos', login: 'Login', testLogin: 'Test login', getStarted: 'Get started', badge: 'Landing page + leads + dashboard',
    heroTitle: 'Build your business landing page', heroAccent: ' in minutes.',
    heroText: 'Vitrine creates a professional page for your business with WhatsApp, booking, photos, reviews, languages and a simple dashboard to track results.',
    primaryCta: 'Create my page', secondaryCta: 'Open demo dashboard', stats: [['4', 'Languages'], ['2', 'Plans'], ['24/7', 'Online page']],
    includedEyebrow: 'What is included', includedTitle: 'Everything to put your business online with a professional look.', includedText: 'A guided setup, ready-made sections and a clear dashboard for any local business owner.',
    features: [['Upload photos', 'Add your best business photos. Vitrine organizes them into a beautiful page.'], ['Fill your details', 'Add name, services, hours, location and contacts in a few minutes.'], ['Publish fast', 'Your landing page is ready to share on Instagram, WhatsApp and Google.']],
    valueEyebrow: 'Built for selling', valueTitle: 'A simple page to turn visitors into real contacts.', valueText: 'No complicated website: your business gets one focused page with WhatsApp, booking, photos, reviews, location and easy metrics.', demoCta: 'View commercial demos',
    valueCards: [['WhatsApp first', 'Move visitors straight into a conversation.'], ['Booking ready', 'Connect the calendar or platform you already use.'], ['Local SEO base', 'Metadata, sitemap and local business structure.'], ['Simple dashboard', 'See visits, leads, channels and the recommended next action.']],
    previewEyebrow: 'Page preview', previewTitle: 'Show your business with photos, services and clear buttons.', previewText: 'Use real photos, hours, reviews, WhatsApp and booking to create a trustworthy presentation before sharing.',
    previewCards: [['Hero photo', 'First impression'], ['About the business', 'Trust and story'], ['Services', 'Clear offers'], ['Gallery', 'Visual proof']],
    processEyebrow: 'Simple process', processTitle: 'How it works', steps: [['01', 'Create your page', 'Use the guided setup to build the main structure.'], ['02', 'Add your business', 'Fill in details, photos, services and opening hours.'], ['03', 'Share the link', 'Post it on Instagram, WhatsApp, Google and QR materials.']],
    plansEyebrow: 'Plans', plansTitle: 'Choose the page capacity', plansText: 'Plan capacity is ready; commercial terms stay private during beta.', starterDesc: 'Perfect for one business page', proDesc: 'For multiple services or locations', popular: 'Most popular', startStarter: 'Start Starter', choosePro: 'Choose Pro',
    readyTags: ['Ready demos', 'WhatsApp leads', 'SEO foundation'], readyTitle: 'Ready to go live?', readyText: 'Create a professional page and see exactly how your business can appear online.', readyCta: 'Create a demo page', footerDemo: 'Demo', footerDashboard: 'Dashboard', dashboardMock: { title: 'Vitrine Dashboard', business: 'Luna Studio', period: '30 days', tabs: ['Overview', 'Leads', 'Channels', 'Settings'], metrics: [['128', 'Visits'], ['34', 'Actions'], ['12', 'Leads'], ['9.4%', 'Conversion']], action: 'Recommended action', actionText: 'Instagram is your strongest channel. Keep sharing there and test an in-store QR Code.', leads: 'Recent leads', channels: 'Top channels' },
  },
  es: {
    demos: 'Ver demos', login: 'Entrar', testLogin: 'Login de prueba', getStarted: 'Empezar', badge: 'Landing page + leads + dashboard', heroTitle: 'Crea la landing page de tu negocio', heroAccent: ' en minutos.', heroText: 'Vitrine crea una página profesional para tu negocio con WhatsApp, reservas, fotos, reseñas, idiomas y un dashboard simple para seguir resultados.', primaryCta: 'Crear mi página', secondaryCta: 'Abrir dashboard demo', stats: [['4', 'Idiomas'], ['2', 'Planes'], ['24/7', 'Página online']], includedEyebrow: 'Qué incluye', includedTitle: 'Todo para poner tu negocio online con aspecto profesional.', includedText: 'Un setup guiado, secciones listas y un dashboard claro para cualquier dueño de negocio local.', features: [['Sube fotos', 'Agrega las mejores fotos de tu negocio. Vitrine las organiza en una página bonita.'], ['Completa tus datos', 'Añade nombre, servicios, horarios, ubicación y contactos en minutos.'], ['Publica rápido', 'Tu landing page queda lista para compartir en Instagram, WhatsApp y Google.']], valueEyebrow: 'Hecho para vender', valueTitle: 'Una página simple para convertir visitantes en contactos reales.', valueText: 'Sin sitio complicado: tu negocio gana una vitrina enfocada con WhatsApp, reservas, fotos, reseñas, ubicación y métricas fáciles.', demoCta: 'Ver demos comerciales', valueCards: [['WhatsApp primero', 'Lleva visitantes directo a una conversación.'], ['Reservas listas', 'Conecta el calendario o plataforma que ya usas.'], ['Base SEO local', 'Metadatos, sitemap y estructura para negocio local.'], ['Dashboard simple', 'Ve visitas, leads, canales y la próxima acción recomendada.']], previewEyebrow: 'Vista previa', previewTitle: 'Muestra tu negocio con fotos, servicios y botones claros.', previewText: 'Usa fotos reales, horarios, reseñas, WhatsApp y reservas para crear una presentación confiable antes de compartir.', previewCards: [['Foto principal', 'Primera impresión'], ['Sobre el negocio', 'Confianza e historia'], ['Servicios', 'Ofertas claras'], ['Galería', 'Prueba visual']], processEyebrow: 'Proceso simple', processTitle: 'Cómo funciona', steps: [['01', 'Crea tu página', 'Usa el setup guiado para construir la estructura principal.'], ['02', 'Añade tu negocio', 'Completa datos, fotos, servicios y horarios.'], ['03', 'Comparte el enlace', 'Publícalo en Instagram, WhatsApp, Google y materiales con QR.']], plansEyebrow: 'Planes', plansTitle: 'Elige la capacidad de páginas', plansText: 'La capacidad de los planes está lista; las condiciones comerciales quedan privadas durante beta.', starterDesc: 'Perfecto para una página de negocio', proDesc: 'Para múltiples servicios o ubicaciones', popular: 'Más popular', startStarter: 'Empezar Starter', choosePro: 'Elegir Pro', readyTags: ['Demos listas', 'Leads por WhatsApp', 'Base SEO'], readyTitle: '¿Listo para publicar?', readyText: 'Crea una página profesional y mira exactamente cómo puede aparecer tu negocio online.', readyCta: 'Crear una página demo', footerDemo: 'Demo', footerDashboard: 'Dashboard', dashboardMock: { title: 'Dashboard Vitrine', business: 'Luna Studio', period: '30 días', tabs: ['Resumen', 'Leads', 'Canales', 'Ajustes'], metrics: [['128', 'Visitas'], ['34', 'Acciones'], ['12', 'Leads'], ['9.4%', 'Conversión']], action: 'Acción recomendada', actionText: 'Instagram es tu canal más fuerte. Sigue compartiendo ahí y prueba un QR Code en la tienda.', leads: 'Leads recientes', channels: 'Top canales' },
  },
  fr: {
    demos: 'Voir les démos', login: 'Connexion', testLogin: 'Connexion test', getStarted: 'Commencer', badge: 'Landing page + leads + dashboard', heroTitle: 'Créez la landing page de votre entreprise', heroAccent: ' en quelques minutes.', heroText: 'Vitrine crée une page professionnelle pour votre entreprise avec WhatsApp, réservation, photos, avis, langues et un dashboard simple pour suivre les résultats.', primaryCta: 'Créer ma page', secondaryCta: 'Ouvrir le dashboard démo', stats: [['4', 'Langues'], ['2', 'Plans'], ['24/7', 'Page en ligne']], includedEyebrow: 'Ce qui est inclus', includedTitle: 'Tout pour mettre votre entreprise en ligne avec une image professionnelle.', includedText: 'Un setup guidé, des sections prêtes et un dashboard clair pour tout propriétaire local.', features: [['Ajoutez vos photos', 'Ajoutez les meilleures photos de votre entreprise. Vitrine les organise dans une belle page.'], ['Complétez vos informations', 'Ajoutez nom, services, horaires, adresse et contacts en quelques minutes.'], ['Publiez rapidement', 'Votre landing page est prête à partager sur Instagram, WhatsApp et Google.']], valueEyebrow: 'Conçu pour vendre', valueTitle: 'Une page simple pour transformer les visiteurs en vrais contacts.', valueText: 'Pas de site compliqué : votre entreprise obtient une vitrine claire avec WhatsApp, réservation, photos, avis, adresse et métriques faciles.', demoCta: 'Voir les démos commerciales', valueCards: [['WhatsApp d’abord', 'Amenez les visiteurs directement vers une conversation.'], ['Réservation prête', 'Connectez le calendrier ou la plateforme que vous utilisez déjà.'], ['Base SEO locale', 'Métadonnées, sitemap et structure pour entreprise locale.'], ['Dashboard simple', 'Suivez visites, leads, canaux et prochaine action recommandée.']], previewEyebrow: 'Aperçu de la page', previewTitle: 'Présentez votre entreprise avec photos, services et boutons clairs.', previewText: 'Utilisez vos vraies photos, horaires, avis, WhatsApp et réservation pour créer une présentation fiable avant de partager.', previewCards: [['Photo principale', 'Première impression'], ['À propos', 'Confiance et histoire'], ['Services', 'Offres claires'], ['Galerie', 'Preuve visuelle']], processEyebrow: 'Processus simple', processTitle: 'Comment ça marche', steps: [['01', 'Créez votre page', 'Utilisez le setup guidé pour construire la structure principale.'], ['02', 'Ajoutez votre entreprise', 'Complétez informations, photos, services et horaires.'], ['03', 'Partagez le lien', 'Publiez-le sur Instagram, WhatsApp, Google et supports avec QR Code.']], plansEyebrow: 'Plans', plansTitle: 'Choisissez la capacité de pages', plansText: 'La capacité des plans est prête ; les conditions commerciales restent privées pendant la bêta.', starterDesc: 'Parfait pour une page d’entreprise', proDesc: 'Pour plusieurs services ou lieux', popular: 'Le plus populaire', startStarter: 'Commencer Starter', choosePro: 'Choisir Pro', readyTags: ['Démos prêtes', 'Leads WhatsApp', 'Base SEO'], readyTitle: 'Prêt à publier ?', readyText: 'Créez une page professionnelle et voyez exactement comment votre entreprise peut apparaître en ligne.', readyCta: 'Créer une page démo', footerDemo: 'Démo', footerDashboard: 'Dashboard', dashboardMock: { title: 'Dashboard Vitrine', business: 'Luna Studio', period: '30 jours', tabs: ['Vue générale', 'Leads', 'Canaux', 'Réglages'], metrics: [['128', 'Visites'], ['34', 'Actions'], ['12', 'Leads'], ['9.4%', 'Conversion']], action: 'Action recommandée', actionText: 'Instagram est votre canal le plus fort. Continuez à partager là-bas et testez un QR Code en boutique.', leads: 'Leads récents', channels: 'Top canaux' },
  },
} satisfies Record<Lang, any>

export default function HomePage() {
  const [lang, setLang] = useState<Lang>('pt')
  const t = homeCopy[lang]
  const starterFeatures = {
    pt: ['Página multilíngue', 'Captura de leads', 'Canais rastreáveis', 'Dashboard básico'],
    en: ['Multilingual page', 'Lead capture', 'Tracking channels', 'Basic dashboard'],
    es: ['Página multilingüe', 'Captura de leads', 'Canales rastreables', 'Dashboard básico'],
    fr: ['Page multilingue', 'Capture de leads', 'Canaux suivis', 'Dashboard de base'],
  }[lang]
  const proFeatures = {
    pt: ['Tudo do Starter', '3 páginas', 'Dashboard demo', 'Melhorias prioritárias'],
    en: ['Everything in Starter', '3 pages', 'Demo dashboard', 'Priority improvements'],
    es: ['Todo lo de Starter', '3 páginas', 'Dashboard demo', 'Mejoras prioritarias'],
    fr: ['Tout dans Starter', '3 pages', 'Dashboard démo', 'Améliorations prioritaires'],
  }[lang]

  return (
    <div className="min-h-screen bg-navy text-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-navy/95 backdrop-blur-sm border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gold rounded-full flex items-center justify-center">
              <ThumbsUp className="w-4 h-4 text-navy" />
            </div>
            <span className="font-bold text-xl">Vitrine</span>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden md:block">
              <LanguageSwitcher lang={lang} setLang={(value) => setLang(value as Lang)} />
            </div>
            <Link href="/demo" className="text-gray-400 hover:text-white transition-colors text-sm">
              {t.demos}
            </Link>
            <Link href="/login" className="text-gray-400 hover:text-white transition-colors text-sm">
              {t.login}
            </Link>
            <Link href="/login" className="hidden sm:inline-flex text-gold hover:text-yellow-300 transition-colors text-sm font-semibold">
              {t.testLogin}
            </Link>
            <Link
              href="/dashboard"
              className="bg-gold text-navy px-4 py-2 rounded-full text-sm font-semibold hover:bg-yellow-400 transition-colors"
            >
              {t.getStarted}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(212,175,55,0.18),transparent_32%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.08),transparent_28%)]" />
        <div className="relative max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_0.9fr] gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/20 rounded-full px-4 py-2 mb-8">
              <Zap className="w-4 h-4 text-gold" />
              <span className="text-gold text-sm font-medium">{t.badge}</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
              {t.heroTitle}
              <span className="text-gold">{t.heroAccent}</span>
            </h1>
            <p className="text-xl text-gray-400 mb-10 max-w-2xl">
              {t.heroText}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/dashboard"
                className="bg-gold text-navy px-8 py-4 rounded-full font-bold text-lg hover:bg-yellow-400 transition-all hover:scale-105 shadow-lg shadow-gold/20 flex items-center gap-2 justify-center"
              >
                {t.primaryCta}
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/login"
                className="bg-white/10 border border-white/20 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/20 transition-all flex items-center gap-2 justify-center"
              >
                {t.secondaryCta}
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-10 max-w-xl">
              {t.stats.map(([value, label]: string[]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-2xl font-black text-white">{value}</p>
                  <p className="text-xs text-gray-400 mt-1">{label}</p>
                </div>
              ))}
            </div>
            <div className="md:hidden mt-6">
              <LanguageSwitcher lang={lang} setLang={(value) => setLang(value as Lang)} />
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 bg-gold/10 blur-3xl rounded-full" />
            <div className="relative rounded-[2rem] border border-white/10 bg-white/10 backdrop-blur p-4 shadow-2xl">
              <div className="rounded-[1.5rem] overflow-hidden bg-white text-navy">
                <div className="bg-navy text-white p-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-gold font-black">{t.dashboardMock.title}</p>
                    <h3 className="text-2xl font-black mt-1">{t.dashboardMock.business}</h3>
                  </div>
                  <span className="rounded-full bg-white/10 border border-white/10 px-3 py-1 text-xs font-bold">{t.dashboardMock.period}</span>
                </div>
                <div className="p-4 bg-stone-50 border-b border-stone-100 grid grid-cols-4 gap-2">
                  {t.dashboardMock.tabs.map((tab: string, index: number) => (
                    <div key={tab} className={`rounded-xl px-2 py-2 text-center text-[10px] font-black ${index === 0 ? 'bg-navy text-white' : 'bg-white text-gray-400'}`}>
                      {tab}
                    </div>
                  ))}
                </div>
                <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-3 border-b border-stone-100">
                  {[Eye, MousePointerClick, Users, Sparkles].map((Icon, index) => (
                    <div key={t.dashboardMock.metrics[index][1]} className="rounded-2xl bg-stone-50 p-3 border border-stone-100">
                      <Icon className="w-4 h-4 text-gold mb-2" />
                      <p className="font-black text-xl">{t.dashboardMock.metrics[index][0]}</p>
                      <p className="text-[10px] uppercase text-gray-400 font-bold">{t.dashboardMock.metrics[index][1]}</p>
                    </div>
                  ))}
                </div>
                <div className="p-5 space-y-4">
                  <div className="rounded-2xl bg-navy p-4 text-white">
                    <p className="text-[10px] uppercase tracking-wider text-gold font-black mb-1">{t.dashboardMock.action}</p>
                    <p className="text-xs text-gray-300 leading-relaxed">{t.dashboardMock.actionText}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-stone-100 p-3">
                      <p className="text-sm font-black mb-2">{t.dashboardMock.leads}</p>
                      {['Maria Silva', 'João Pereira'].map((name) => (
                        <div key={name} className="flex items-center justify-between rounded-xl bg-stone-50 px-3 py-2 mb-2">
                          <span className="text-xs font-bold truncate">{name}</span>
                          <span className="text-[10px] text-gold font-black">Hot</span>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-2xl border border-stone-100 p-3">
                      <p className="text-sm font-black mb-2">{t.dashboardMock.channels}</p>
                      {['Instagram', 'WhatsApp'].map((source, i) => (
                        <div key={source} className="mb-3">
                          <div className="flex justify-between text-xs font-bold mb-1"><span>{source}</span><span>{18 - i * 6}</span></div>
                          <div className="h-2 bg-stone-100 rounded-full overflow-hidden"><div className="h-full bg-gold rounded-full" style={{ width: `${88 - i * 24}%` }} /></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="py-20 px-4 bg-white text-navy">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-gold font-semibold text-sm uppercase tracking-wider">{t.includedEyebrow}</span>
            <h2 className="text-4xl md:text-5xl font-black mt-2">{t.includedTitle}</h2>
            <p className="text-gray-500 text-lg mt-4 max-w-2xl mx-auto">
              {t.includedText}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {t.features.map(([title, desc]: string[], i: number) => (
              <div key={i} className="bg-stone-50 border border-stone-100 rounded-3xl p-7 hover:border-gold/40 hover:-translate-y-1 transition-all shadow-sm">
                <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center text-gold mb-4">
                  {i === 0 ? <Upload className="w-6 h-6" /> : i === 1 ? <FileText className="w-6 h-6" /> : <Zap className="w-6 h-6" />}
                </div>
                <h3 className="text-navy font-black text-lg mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Light value section */}
      <section className="py-20 px-4 bg-stone-50 text-navy border-y border-stone-100">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-10 items-center">
            <div>
              <span className="text-gold font-semibold text-sm uppercase tracking-wider">{t.valueEyebrow}</span>
              <h2 className="text-4xl md:text-5xl font-black mt-2 mb-5">
                {t.valueTitle}
              </h2>
              <p className="text-gray-500 text-lg leading-relaxed mb-6">
                {t.valueText}
              </p>
              <Link href="/demo" className="inline-flex items-center gap-2 bg-navy text-white px-6 py-3 rounded-full font-bold hover:bg-navy/90 transition-colors">
                {t.demoCta}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {t.valueCards.map(([title, desc]: string[], i: number) => (
                <div key={title} className="rounded-3xl border border-stone-100 bg-white p-5 hover:border-gold/40 hover:-translate-y-1 transition-all shadow-sm">
                  <div className="w-11 h-11 rounded-2xl bg-gold/10 text-gold flex items-center justify-center mb-4">
                    {i === 0 ? <MessageCircle className="w-5 h-5" /> : i === 1 ? <CalendarDays className="w-5 h-5" /> : i === 2 ? <Globe2 className="w-5 h-5" /> : <BarChart3 className="w-5 h-5" />}
                  </div>
                  <p className="font-black text-navy text-lg mb-1">{title}</p>
                  <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Visual demo */}
      <section className="py-20 px-4 bg-gradient-to-b from-navy via-slate-950 to-navy text-white border-y border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-10 items-center">
            <div>
              <span className="text-gold font-semibold text-sm uppercase tracking-wider">{t.previewEyebrow}</span>
              <h2 className="text-4xl md:text-5xl font-black mt-2 mb-5">{t.previewTitle}</h2>
              <p className="text-gray-500 text-lg leading-relaxed mb-6">
                {t.previewText}
              </p>
              <div className="grid grid-cols-2 gap-3">
                {t.previewCards.map(([title, desc]: string[]) => (
                  <div key={title} className="rounded-2xl bg-white/5 border border-white/10 p-4 hover:border-gold/30 transition-colors">
                    <p className="font-bold text-white">{title}</p>
                    <p className="text-sm text-gray-400 mt-1">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                ['https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=900&auto=format&fit=crop', 'Salon interior'],
                ['https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=900&auto=format&fit=crop', 'Hair styling'],
                ['https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=900&auto=format&fit=crop', 'Beauty service'],
                ['https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=900&auto=format&fit=crop', 'Haircut detail'],
              ].map(([src, alt], index) => (
                <div key={alt} className={`rounded-3xl overflow-hidden shadow-2xl shadow-black/30 border border-white/10 ${index === 0 ? 'row-span-2 h-96' : 'h-44'}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={alt} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-4 bg-white text-navy">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-gold font-semibold text-sm uppercase tracking-wider">{t.processEyebrow}</span>
          <h2 className="text-4xl font-bold mt-2 mb-16">{t.processTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {t.steps.map(([step, title, desc]: string[], i: number) => (
              <div key={i} className="relative rounded-3xl bg-stone-50 border border-stone-100 p-8 shadow-sm">
                <div className="text-gold/25 font-black text-7xl absolute -top-5 left-1/2 -translate-x-1/2 select-none">
                  {step}
                </div>
                <div className="relative pt-8">
                  <h3 className="text-navy font-black text-xl mb-3">{title}</h3>
                  <p className="text-gray-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plan limits */}
      <section className="py-24 px-4 bg-stone-50 text-navy border-y border-stone-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-gold font-semibold text-sm uppercase tracking-wider">{t.plansEyebrow}</span>
            <h2 className="text-4xl font-bold mt-2">{t.plansTitle}</h2>
            <p className="text-gray-500 mt-4">{t.plansText}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {[
              {
                name: 'Starter',
                pages: '1 page',
                desc: t.starterDesc,
                features: starterFeatures,
                cta: t.startStarter,
                highlighted: false,
              },
              {
                name: 'Pro',
                pages: '3 pages',
                desc: t.proDesc,
                features: proFeatures,
                cta: t.choosePro,
                highlighted: true,
              },
            ].map((plan, i) => (
              <div
                key={i}
                className={`relative rounded-2xl p-8 border transition-all hover:-translate-y-1 ${
                  plan.highlighted
                    ? 'bg-gold border-gold text-navy'
                    : 'bg-white border-stone-100 text-navy hover:border-gold/30 shadow-sm'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-navy text-gold text-xs font-bold px-3 py-1 rounded-full border border-gold">
                    {t.popular}
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="font-bold text-xl mb-1 text-navy">
                    {plan.name}
                  </h3>
                  <p className={`text-sm mb-4 ${plan.highlighted ? 'text-navy/70' : 'text-gray-500'}`}>
                    {plan.desc}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-navy">
                      {plan.pages}
                    </span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feat, j) => (
                    <li key={j} className="flex items-center gap-2">
                      <Check className={`w-4 h-4 flex-shrink-0 ${plan.highlighted ? 'text-navy' : 'text-gold'}`} />
                      <span className={`text-sm ${plan.highlighted ? 'text-navy' : 'text-gray-600'}`}>{feat}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/dashboard"
                  className={`block text-center py-3 rounded-full font-bold transition-all ${
                    plan.highlighted
                      ? 'bg-navy text-gold hover:bg-navy/90'
                      : 'bg-gold text-navy hover:bg-yellow-400'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 text-center bg-white text-navy">
        <div className="max-w-2xl mx-auto rounded-[2rem] bg-gradient-to-br from-stone-50 to-white border border-stone-100 p-10 shadow-sm">
          <div className="flex justify-center gap-2 mb-5 flex-wrap">
            {t.readyTags.map((label: string) => (
              <span key={label} className="rounded-full border border-gold/20 bg-gold/10 px-3 py-1 text-gold text-xs font-bold">
                {label}
              </span>
            ))}
          </div>
          <h2 className="text-4xl font-bold mb-4">
            {t.readyTitle}
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            {t.readyText}
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-gold text-navy px-10 py-4 rounded-full font-bold text-lg hover:bg-yellow-400 transition-all hover:scale-105"
          >
            {t.readyCta}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gold rounded-full flex items-center justify-center">
              <ThumbsUp className="w-3 h-3 text-navy" />
            </div>
            <span className="font-bold text-sm">Vitrine</span>
          </div>
          <p className="text-gray-500 text-sm">© {new Date().getFullYear()} Vitrine. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/demo" className="text-gray-500 hover:text-gold text-sm transition-colors">{t.footerDemo}</Link>
            <Link href="/dashboard" className="text-gray-500 hover:text-gold text-sm transition-colors">{t.footerDashboard}</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
