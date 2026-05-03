'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ThumbsUp, Zap, Check, ArrowRight, BarChart3, MessageCircle, Sparkles, ShieldCheck, Star, Store, QrCode } from 'lucide-react'
import LanguageSwitcher from '@/components/LanguageSwitcher'

type Lang = 'pt' | 'es' | 'en' | 'fr'

const homeCopy = {
  pt: {
    demos: 'Ver demos', login: 'Entrar', testLogin: 'Login teste', getStarted: 'Começar', badge: '3 estruturas prontas para negócios locais',
    heroTitle: 'Escolha o estilo. A Vitrine monta uma landing pronta para converter', heroAccent: ' em minutos.',
    heroText: 'Restauração, salão ou serviços profissionais: cada landing já nasce com fotos, CTA, horário, localização, WhatsApp ou link de booking e dashboard simples.',
    primaryCta: 'Criar minha Vitrine', secondaryCta: 'Ver dashboard teste', stats: [['3', 'Modelos'], ['1 clique', 'WhatsApp/Booking'], ['24/7', 'Online']],
    includedEyebrow: 'O que está incluído', includedTitle: 'Tudo para colocar seu negócio online com aparência profissional.', includedText: 'Um setup guiado, seções prontas e um dashboard claro para qualquer dono de negócio local.',
    features: [
      ['Enviar fotos', 'Envie as melhores fotos do seu negócio. A Vitrine organiza tudo numa página bonita.'],
      ['Preencher informações', 'Adicione nome, serviços, horários, localização e contatos em poucos minutos.'],
      ['Publicar rapidamente', 'Sua landing page fica pronta para compartilhar no Instagram, WhatsApp e Google.'],
    ],
    valueEyebrow: 'Por que escolher a Vitrine', valueTitle: 'Menos site complicado. Mais clientes a chamar.',
    valueText: 'Você escolhe o tipo de negócio, coloca fotos e contactos, e recebe uma página organizada para gerar confiança e ação.', demoCta: 'Começar agora',
    valueCards: [
      ['WhatsApp em destaque', 'Leve visitantes direto para uma conversa.'],
      ['Agendamento pronto', 'Conecte o calendário ou plataforma que você já usa.'],
      ['Base de SEO local', 'Metadados, sitemap e estrutura para negócio local.'],
      ['Dashboard simples', 'Veja visitas, leads, canais e próxima ação recomendada.'],
    ],
    previewEyebrow: 'Demos por segmento', previewTitle: 'Veja modelos para restauração, salão, clínicas e escritórios.', previewText: 'Cada estrutura muda para o objetivo certo: pedido, agendamento, consulta ou contacto profissional.',
    previewCards: [['Foto principal', 'Primeira impressão'], ['Sobre o negócio', 'História e confiança'], ['Serviços', 'Ofertas claras'], ['Galeria', 'Prova visual']],
    processEyebrow: 'Processo simples', processTitle: 'Como funciona',
    steps: [['01', 'Crie sua página', 'Use o setup guiado para montar a estrutura principal.'], ['02', 'Adicione seu negócio', 'Preencha informações, fotos, serviços e horários.'], ['03', 'Compartilhe o link', 'Publique no Instagram, WhatsApp, Google e materiais com QR Code.']],
    plansEyebrow: 'Planos', plansTitle: 'Escolha o ritmo de crescimento do seu negócio', plansText: 'Comece com uma página profissional e evolua para relatórios semanais, múltiplas páginas e canais rastreáveis no Pro.',
    starterDesc: 'Perfeito para validar uma página profissional', proDesc: 'Para crescer com até 3 páginas e relatórios semanais', popular: 'Mais escolhido', startStarter: 'Começar Starter', choosePro: 'Escolher Pro',
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
    previewEyebrow: 'Page preview', previewTitle: 'Any business can become a beautiful Vitrine that is easy to share.', previewText: 'In the setup you choose the business type, add your photos and build a welcoming page for salons, barbershops, food businesses with menus, cleaning, beauty, fitness and more.',
    previewCards: [['Hero photo', 'First impression'], ['About the business', 'Trust and story'], ['Services', 'Clear offers'], ['Gallery', 'Visual proof']],
    processEyebrow: 'Simple process', processTitle: 'How it works', steps: [['01', 'Create your page', 'Use the guided setup to build the main structure.'], ['02', 'Add your business', 'Fill in details, photos, services and opening hours.'], ['03', 'Share the link', 'Post it on Instagram, WhatsApp, Google and QR materials.']],
    plansEyebrow: 'Plans', plansTitle: 'Choose your business growth rhythm', plansText: 'Start with a professional page and upgrade to weekly reports, multiple pages and tracked channels on Pro.', starterDesc: 'Perfect to validate one professional page', proDesc: 'For growth with up to 3 pages and weekly reports', popular: 'Most popular', startStarter: 'Start Starter', choosePro: 'Choose Pro',
    readyTags: ['Ready demos', 'WhatsApp leads', 'SEO foundation'], readyTitle: 'Ready to go live?', readyText: 'Create a professional page and see exactly how your business can appear online.', readyCta: 'Create a demo page', footerDemo: 'Demo', footerDashboard: 'Dashboard', dashboardMock: { title: 'Vitrine Dashboard', business: 'Luna Studio', period: '30 days', tabs: ['Overview', 'Leads', 'Channels', 'Settings'], metrics: [['128', 'Visits'], ['34', 'Actions'], ['12', 'Leads'], ['9.4%', 'Conversion']], action: 'Recommended action', actionText: 'Instagram is your strongest channel. Keep sharing there and test an in-store QR Code.', leads: 'Recent leads', channels: 'Top channels' },
  },
  es: {
    demos: 'Ver demos', login: 'Entrar', testLogin: 'Login de prueba', getStarted: 'Empezar', badge: 'Landing page + leads + dashboard', heroTitle: 'Crea la landing page de tu negocio', heroAccent: ' en minutos.', heroText: 'Vitrine crea una página profesional para tu negocio con WhatsApp, reservas, fotos, reseñas, idiomas y un dashboard simple para seguir resultados.', primaryCta: 'Crear mi página', secondaryCta: 'Abrir dashboard demo', stats: [['4', 'Idiomas'], ['2', 'Planes'], ['24/7', 'Página online']], includedEyebrow: 'Qué incluye', includedTitle: 'Todo para poner tu negocio online con aspecto profesional.', includedText: 'Un setup guiado, secciones listas y un dashboard claro para cualquier dueño de negocio local.', features: [['Sube fotos', 'Agrega las mejores fotos de tu negocio. Vitrine las organiza en una página bonita.'], ['Completa tus datos', 'Añade nombre, servicios, horarios, ubicación y contactos en minutos.'], ['Publica rápido', 'Tu landing page queda lista para compartir en Instagram, WhatsApp y Google.']], valueEyebrow: 'Hecho para vender', valueTitle: 'Una página simple para convertir visitantes en contactos reales.', valueText: 'Sin sitio complicado: tu negocio gana una vitrina enfocada con WhatsApp, reservas, fotos, reseñas, ubicación y métricas fáciles.', demoCta: 'Ver demos comerciales', valueCards: [['WhatsApp primero', 'Lleva visitantes directo a una conversación.'], ['Reservas listas', 'Conecta el calendario o plataforma que ya usas.'], ['Base SEO local', 'Metadatos, sitemap y estructura para negocio local.'], ['Dashboard simple', 'Ve visitas, leads, canales y la próxima acción recomendada.']], previewEyebrow: 'Vista previa', previewTitle: 'Cualquier negocio puede convertirse en una Vitrine bonita y fácil de compartir.', previewText: 'En el setup eliges el tipo de negocio, agregas tus fotos y creas una página acogedora para salones, barberías, negocios de comida con menú, limpieza, estética, fitness y más.', previewCards: [['Foto principal', 'Primera impresión'], ['Sobre el negocio', 'Confianza e historia'], ['Servicios', 'Ofertas claras'], ['Galería', 'Prueba visual']], processEyebrow: 'Proceso simple', processTitle: 'Cómo funciona', steps: [['01', 'Crea tu página', 'Usa el setup guiado para construir la estructura principal.'], ['02', 'Añade tu negocio', 'Completa datos, fotos, servicios y horarios.'], ['03', 'Comparte el enlace', 'Publícalo en Instagram, WhatsApp, Google y materiales con QR.']], plansEyebrow: 'Planes', plansTitle: 'Elige el ritmo de crecimiento de tu negocio', plansText: 'Empieza con una página profesional y sube a reportes semanales, múltiples páginas y canales rastreables en Pro.', starterDesc: 'Perfecto para validar una página profesional', proDesc: 'Para crecer con hasta 3 páginas y reportes semanales', popular: 'Más popular', startStarter: 'Empezar Starter', choosePro: 'Elegir Pro', readyTags: ['Demos listas', 'Leads por WhatsApp', 'Base SEO'], readyTitle: '¿Listo para publicar?', readyText: 'Crea una página profesional y mira exactamente cómo puede aparecer tu negocio online.', readyCta: 'Crear una página demo', footerDemo: 'Demo', footerDashboard: 'Dashboard', dashboardMock: { title: 'Dashboard Vitrine', business: 'Luna Studio', period: '30 días', tabs: ['Resumen', 'Leads', 'Canales', 'Ajustes'], metrics: [['128', 'Visitas'], ['34', 'Acciones'], ['12', 'Leads'], ['9.4%', 'Conversión']], action: 'Acción recomendada', actionText: 'Instagram es tu canal más fuerte. Sigue compartiendo ahí y prueba un QR Code en la tienda.', leads: 'Leads recientes', channels: 'Top canales' },
  },
  fr: {
    demos: 'Voir les démos', login: 'Connexion', testLogin: 'Connexion test', getStarted: 'Commencer', badge: 'Landing page + leads + dashboard', heroTitle: 'Créez la landing page de votre entreprise', heroAccent: ' en quelques minutes.', heroText: 'Vitrine crée une page professionnelle pour votre entreprise avec WhatsApp, réservation, photos, avis, langues et un dashboard simple pour suivre les résultats.', primaryCta: 'Créer ma page', secondaryCta: 'Ouvrir le dashboard démo', stats: [['4', 'Langues'], ['2', 'Plans'], ['24/7', 'Page en ligne']], includedEyebrow: 'Ce qui est inclus', includedTitle: 'Tout pour mettre votre entreprise en ligne avec une image professionnelle.', includedText: 'Un setup guidé, des sections prêtes et un dashboard clair pour tout propriétaire local.', features: [['Ajoutez vos photos', 'Ajoutez les meilleures photos de votre entreprise. Vitrine les organise dans une belle page.'], ['Complétez vos informations', 'Ajoutez nom, services, horaires, adresse et contacts en quelques minutes.'], ['Publiez rapidement', 'Votre landing page est prête à partager sur Instagram, WhatsApp et Google.']], valueEyebrow: 'Conçu pour vendre', valueTitle: 'Une page simple pour transformer les visiteurs en vrais contacts.', valueText: 'Pas de site compliqué : votre entreprise obtient une vitrine claire avec WhatsApp, réservation, photos, avis, adresse et métriques faciles.', demoCta: 'Voir les démos commerciales', valueCards: [['WhatsApp d’abord', 'Amenez les visiteurs directement vers une conversation.'], ['Réservation prête', 'Connectez le calendrier ou la plateforme que vous utilisez déjà.'], ['Base SEO locale', 'Métadonnées, sitemap et structure pour entreprise locale.'], ['Dashboard simple', 'Suivez visites, leads, canaux et prochaine action recommandée.']], previewEyebrow: 'Aperçu de la page', previewTitle: 'Toute entreprise peut devenir une belle Vitrine facile à partager.', previewText: 'Dans le setup, vous choisissez le type d’entreprise, ajoutez vos photos et créez une page accueillante pour salons, barbiers, commerces alimentaires avec menu, nettoyage, beauté, fitness et plus encore.', previewCards: [['Photo principale', 'Première impression'], ['À propos', 'Confiance et histoire'], ['Services', 'Offres claires'], ['Galerie', 'Preuve visuelle']], processEyebrow: 'Processus simple', processTitle: 'Comment ça marche', steps: [['01', 'Créez votre page', 'Utilisez le setup guidé pour construire la structure principale.'], ['02', 'Ajoutez votre entreprise', 'Complétez informations, photos, services et horaires.'], ['03', 'Partagez le lien', 'Publiez-le sur Instagram, WhatsApp, Google et supports avec QR Code.']], plansEyebrow: 'Plans', plansTitle: 'Choisissez le rythme de croissance', plansText: 'Commencez avec une page professionnelle puis passez aux rapports hebdomadaires, pages multiples et canaux suivis en Pro.', starterDesc: 'Parfait pour valider une page professionnelle', proDesc: 'Pour grandir avec jusqu’à 3 pages et rapports hebdomadaires', popular: 'Le plus populaire', startStarter: 'Commencer Starter', choosePro: 'Choisir Pro', readyTags: ['Démos prêtes', 'Leads WhatsApp', 'Base SEO'], readyTitle: 'Prêt à publier ?', readyText: 'Créez une page professionnelle et voyez exactement comment votre entreprise peut apparaître en ligne.', readyCta: 'Créer une page démo', footerDemo: 'Démo', footerDashboard: 'Dashboard', dashboardMock: { title: 'Dashboard Vitrine', business: 'Luna Studio', period: '30 jours', tabs: ['Vue générale', 'Leads', 'Canaux', 'Réglages'], metrics: [['128', 'Visites'], ['34', 'Actions'], ['12', 'Leads'], ['9.4%', 'Conversion']], action: 'Action recommandée', actionText: 'Instagram est votre canal le plus fort. Continuez à partager là-bas et testez un QR Code en boutique.', leads: 'Leads récents', channels: 'Top canaux' },
  },
} satisfies Record<Lang, any>

const landingPreviewImages = {
  food: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=900&auto=format&fit=crop',
  salon: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=900&auto=format&fit=crop',
  professional: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=900&auto=format&fit=crop',
}

const landingPreviewsByLang = {
  pt: [
    { label: 'Restauração', title: 'Menu, QR e pedidos', subtitle: 'Restaurantes, cafés, bares, padarias e food trucks.', image: landingPreviewImages.food, cta: 'Pedir no WhatsApp', details: ['Mais pedidos', 'Cardápio QR', 'Horário aberto'], meta: 'Horário + mapa' },
    { label: 'Salão', title: 'Agenda e beleza', subtitle: 'Salão, barbearia, unhas, estética leve e autocuidado.', image: landingPreviewImages.salon, cta: 'Reservar horário', details: ['Serviços', 'Galeria', 'Localização'], meta: 'Horário + mapa' },
    { label: 'Clínicas & escritórios', title: 'Confiança e consulta', subtitle: 'Clínicas, advocacia, consultoria, terapeutas e freelancers.', image: landingPreviewImages.professional, cta: 'Agendar consulta', details: ['Autoridade', 'Processo claro', 'FAQ'], meta: 'Horário + mapa' },
  ],
  en: [
    { label: 'Food', title: 'Menu, QR and orders', subtitle: 'Restaurants, cafés, bars, bakeries and food trucks.', image: landingPreviewImages.food, cta: 'Order on WhatsApp', details: ['Best sellers', 'QR menu', 'Open hours'], meta: 'Hours + map' },
    { label: 'Salon', title: 'Beauty and bookings', subtitle: 'Hair salons, barbers, nails, light aesthetics and self-care.', image: landingPreviewImages.salon, cta: 'Book a time', details: ['Services', 'Gallery', 'Location'], meta: 'Hours + map' },
    { label: 'Clinics & offices', title: 'Trust and consultation', subtitle: 'Clinics, law, consulting, therapists and freelancers.', image: landingPreviewImages.professional, cta: 'Book a consultation', details: ['Authority', 'Clear process', 'FAQ'], meta: 'Hours + map' },
  ],
  es: [
    { label: 'Restauración', title: 'Menú, QR y pedidos', subtitle: 'Restaurantes, cafés, bares, panaderías y food trucks.', image: landingPreviewImages.food, cta: 'Pedir por WhatsApp', details: ['Más pedidos', 'Menú QR', 'Horario abierto'], meta: 'Horario + mapa' },
    { label: 'Salón', title: 'Agenda y belleza', subtitle: 'Salón, barbería, uñas, estética ligera y autocuidado.', image: landingPreviewImages.salon, cta: 'Reservar horario', details: ['Servicios', 'Galería', 'Ubicación'], meta: 'Horario + mapa' },
    { label: 'Clínicas y oficinas', title: 'Confianza y consulta', subtitle: 'Clínicas, abogacía, consultoría, terapeutas y freelancers.', image: landingPreviewImages.professional, cta: 'Agendar consulta', details: ['Autoridad', 'Proceso claro', 'FAQ'], meta: 'Horario + mapa' },
  ],
  fr: [
    { label: 'Restauration', title: 'Menu, QR et commandes', subtitle: 'Restaurants, cafés, bars, boulangeries et food trucks.', image: landingPreviewImages.food, cta: 'Commander sur WhatsApp', details: ['Plus demandés', 'Menu QR', 'Horaires ouverts'], meta: 'Horaires + carte' },
    { label: 'Salon', title: 'Beauté et réservations', subtitle: 'Salon, barbier, ongles, esthétique légère et soin personnel.', image: landingPreviewImages.salon, cta: 'Réserver un horaire', details: ['Services', 'Galerie', 'Adresse'], meta: 'Horaires + carte' },
    { label: 'Cliniques et bureaux', title: 'Confiance et consultation', subtitle: 'Cliniques, droit, conseil, thérapeutes et freelances.', image: landingPreviewImages.professional, cta: 'Prendre rendez-vous', details: ['Autorité', 'Processus clair', 'FAQ'], meta: 'Horaires + carte' },
  ],
} satisfies Record<Lang, Array<{ label: string; title: string; subtitle: string; image: string; cta: string; details: string[]; meta: string }>>

export default function HomePage() {
  const [lang, setLang] = useState<Lang>('pt')
  const t = homeCopy[lang]
  const mock = t.dashboardMock
  const landingPreviews = landingPreviewsByLang[lang]
  const starterFeatures = {
    pt: ['1 página publicada', 'Preview com suas fotos', 'QR Code da página', 'Relatório a cada 14 dias', 'Dashboard básico'],
    en: ['1 published page', 'Preview with your photos', 'Page QR Code', 'Report every 14 days', 'Basic dashboard'],
    es: ['1 página publicada', 'Preview con tus fotos', 'QR Code de la página', 'Reporte cada 14 días', 'Dashboard básico'],
    fr: ['1 page publiée', 'Aperçu avec vos photos', 'QR Code de la page', 'Rapport tous les 14 jours', 'Dashboard de base'],
  }[lang]
  const proFeatures = {
    pt: ['Tudo do Starter', 'Até 3 páginas', 'Relatórios semanais', 'QRs por campanha', 'QR de cardápio', 'Recomendações prioritárias'],
    en: ['Everything in Starter', 'Up to 3 pages', 'Weekly reports', 'Campaign QR codes', 'Menu QR Code', 'Priority recommendations'],
    es: ['Todo lo de Starter', 'Hasta 3 páginas', 'Reportes semanales', 'QRs por campaña', 'QR de menú', 'Recomendaciones prioritarias'],
    fr: ['Tout dans Starter', 'Jusqu’à 3 pages', 'Rapports hebdomadaires', 'QR par campagne', 'QR de menu', 'Recommandations prioritaires'],
  }[lang]
  const planBadges = {
    pt: { starter: 'Relatório quinzenal', pro: 'Relatório semanal' },
    en: { starter: 'Biweekly report', pro: 'Weekly report' },
    es: { starter: 'Reporte quincenal', pro: 'Reporte semanal' },
    fr: { starter: 'Rapport bimensuel', pro: 'Rapport hebdomadaire' },
  }[lang]
  const trustPills = {
    pt: ['Visual premium', 'WhatsApp em 1 toque', 'Cardápio com QR', 'Dashboard simples'],
    en: ['Premium look', '1-tap WhatsApp', 'Menu with QR', 'Simple dashboard'],
    es: ['Visual premium', 'WhatsApp en 1 toque', 'Menú con QR', 'Dashboard simple'],
    fr: ['Image premium', 'WhatsApp en 1 clic', 'Menu avec QR', 'Dashboard simple'],
  }[lang]
  const credibility = {
    pt: {
      eyebrow: 'Por que escolher a Vitrine',
      title: 'Confiança, leads e ação no mesmo lugar.',
      text: 'Uma landing bonita para passar profissionalismo, botões claros para gerar WhatsApp ou booking, QR para campanhas e um dashboard simples para acompanhar visitas, leads e melhores canais.',
      cards: [
        ['Aparência premium', 'Fotos, prova visual, avaliações, mapa e idiomas numa página que transmite seriedade.'],
        ['Leads sem complicação', 'Visitantes chegam ao WhatsApp, booking ou formulário com menos passos e mais intenção.'],
        ['QR + dashboard', 'Use QR em loja, mesa, flyer ou sacola e veja visitas, cliques, leads e canais fortes.'],
      ],
    },
    en: {
      eyebrow: 'Why choose Vitrine',
      title: 'Trust, leads and action in one place.',
      text: 'A polished landing page to build confidence, clear buttons for WhatsApp or booking, QR for campaigns and a simple dashboard to track visits, leads and top channels.',
      cards: [
        ['Premium appearance', 'Photos, visual proof, reviews, map and languages in a page that feels serious.'],
        ['Leads without friction', 'Visitors reach WhatsApp, booking or the form with fewer steps and stronger intent.'],
        ['QR + dashboard', 'Use QR in-store, on tables, flyers or bags and track visits, clicks, leads and top channels.'],
      ],
    },
    es: {
      eyebrow: 'Por qué elegir Vitrine',
      title: 'Confianza, leads y acción en un solo lugar.',
      text: 'Una landing bonita para transmitir profesionalismo, botones claros para WhatsApp o reservas, QR para campañas y un dashboard simple para seguir visitas, leads y mejores canales.',
      cards: [
        ['Apariencia premium', 'Fotos, prueba visual, reseñas, mapa e idiomas en una página que transmite seriedad.'],
        ['Leads sin fricción', 'Visitantes llegan a WhatsApp, reservas o formulario con menos pasos y más intención.'],
        ['QR + dashboard', 'Usa QR en tienda, mesas, flyers o bolsas y mide visitas, clics, leads y canales fuertes.'],
      ],
    },
    fr: {
      eyebrow: 'Pourquoi choisir Vitrine',
      title: 'Confiance, leads et action au même endroit.',
      text: 'Une landing page soignée pour inspirer confiance, des boutons clairs pour WhatsApp ou réservation, QR pour campagnes et dashboard simple pour suivre visites, leads et meilleurs canaux.',
      cards: [
        ['Image premium', 'Photos, preuve visuelle, avis, carte et langues dans une page qui inspire le sérieux.'],
        ['Leads sans friction', 'Les visiteurs arrivent sur WhatsApp, réservation ou formulaire avec moins d’étapes.'],
        ['QR + dashboard', 'Utilisez le QR en boutique, sur tables, flyers ou sacs et suivez visites, clics, leads et canaux forts.'],
      ],
    },
  }[lang]
  const trustStats = {
    pt: [['5★', 'Confiança'], ['Leads', 'Contactos'], ['QR', 'Rastreio']],
    en: [['5★', 'Trust'], ['Leads', 'Contacts'], ['QR', 'Tracking']],
    es: [['5★', 'Confianza'], ['Leads', 'Contactos'], ['QR', 'Rastreo']],
    fr: [['5★', 'Confiance'], ['Leads', 'Contacts'], ['QR', 'Suivi']],
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
        <div className="relative max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.92fr] gap-10 items-center">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/20 rounded-full px-4 py-2 mb-8">
                <Zap className="w-4 h-4 text-gold" />
                <span className="text-gold text-sm font-medium">{t.badge}</span>
              </div>
              <h1 className="text-5xl md:text-6xl xl:text-7xl font-bold leading-tight mb-6">
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
              <div className="mt-6 flex flex-wrap gap-2 max-w-2xl">
                {trustPills.map((pill: string) => (
                  <span key={pill} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-gray-200">
                    <Check className="w-3.5 h-3.5 text-gold" />
                    {pill}
                  </span>
                ))}
              </div>
              <div className="md:hidden mt-6">
                <LanguageSwitcher lang={lang} setLang={(value) => setLang(value as Lang)} />
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-6 rounded-[3rem] bg-gold/20 blur-3xl" />
              <div className="relative rounded-[2.25rem] border border-white/15 bg-white/10 p-3 shadow-2xl shadow-black/40 backdrop-blur">
                <div className="rounded-[1.75rem] bg-white text-navy overflow-hidden">
                  <div className="bg-gradient-to-br from-navy via-slate-900 to-slate-800 p-5 text-white">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.22em] text-gold">{mock.title}</p>
                        <h3 className="text-2xl font-black mt-1">{mock.business}</h3>
                      </div>
                      <span className="rounded-full bg-white/10 border border-white/10 px-3 py-1 text-xs font-bold">{mock.period}</span>
                    </div>
                    <div className="mt-5 flex gap-2 overflow-hidden">
                      {mock.tabs.map((tab: string, i: number) => (
                        <span key={tab} className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-bold ${i === 0 ? 'bg-gold text-navy' : 'bg-white/10 text-white/70'}`}>
                          {tab}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="p-5 bg-stone-50">
                    <div className="grid grid-cols-2 gap-3">
                      {mock.metrics.map(([value, label]: string[], i: number) => (
                        <div key={label} className="rounded-2xl bg-white border border-stone-100 p-4 shadow-sm">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-2xl font-black text-navy">{value}</p>
                            <span className={`w-8 h-8 rounded-xl flex items-center justify-center ${i === 2 ? 'bg-gold/20 text-gold' : 'bg-navy/5 text-navy'}`}>
                              {i === 2 ? <MessageCircle className="w-4 h-4" /> : <BarChart3 className="w-4 h-4" />}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">{label}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 rounded-2xl bg-navy text-white p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-gold" />
                        <p className="text-sm font-black">{mock.action}</p>
                      </div>
                      <p className="text-sm text-white/70 leading-relaxed">{mock.actionText}</p>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-white border border-stone-100 p-4">
                        <p className="text-xs font-black uppercase tracking-wider text-gray-400 mb-3">{mock.leads}</p>
                        {['Maria S.', 'João P.', 'Ana C.'].map((lead) => (
                          <div key={lead} className="flex items-center justify-between gap-2 py-1.5 text-sm font-bold">
                            <span>{lead}</span>
                            <span className="w-2 h-2 rounded-full bg-gold" />
                          </div>
                        ))}
                      </div>
                      <div className="rounded-2xl bg-white border border-stone-100 p-4">
                        <p className="text-xs font-black uppercase tracking-wider text-gray-400 mb-3">{mock.channels}</p>
                        {['Instagram', 'Google', 'QR Code'].map((channel, i) => (
                          <div key={channel} className="mb-2 last:mb-0">
                            <div className="flex justify-between text-[11px] font-bold mb-1">
                              <span>{channel}</span>
                              <span>{i === 0 ? '52%' : i === 1 ? '31%' : '17%'}</span>
                            </div>
                            <div className="h-2 rounded-full bg-stone-100 overflow-hidden">
                              <div className="h-full rounded-full bg-gold" style={{ width: i === 0 ? '52%' : i === 1 ? '31%' : '17%' }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-5">
            {landingPreviews.map((item) => (
              <div key={item.label} className="group rounded-[2rem] border border-white/10 bg-white/10 p-3 backdrop-blur shadow-2xl shadow-black/20 hover:-translate-y-2 hover:border-gold/40 transition-all overflow-hidden">
                <div className="rounded-[1.5rem] overflow-hidden bg-white text-navy">
                  <div className="relative h-52 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.image} alt={item.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute left-4 right-4 bottom-4 text-white">
                      <span className="inline-flex rounded-full bg-gold text-navy px-2.5 py-1 text-[10px] font-black uppercase tracking-wider">{item.label}</span>
                      <h3 className="text-2xl font-black mt-2">{item.title}</h3>
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="text-sm text-gray-500 leading-relaxed mb-4">{item.subtitle}</p>
                    <div className="space-y-2 mb-5">
                      {item.details.map((detail) => (
                        <div key={detail} className="flex items-center gap-2 text-sm font-bold text-navy">
                          <Check className="w-4 h-4 text-gold" />
                          {detail}
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-black">
                      <span className="rounded-xl bg-navy text-white px-3 py-2 text-center">{item.cta}</span>
                      <span className="rounded-xl bg-stone-100 text-navy px-3 py-2 text-center">{item.meta}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust, leads and growth */}
      <section className="py-20 px-4 bg-gradient-to-br from-[#fffaf0] via-white to-stone-50 text-navy border-y border-stone-100">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-10 items-center">
          <div>
            <span className="inline-flex items-center gap-2 text-gold font-semibold text-sm uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              {credibility.eyebrow}
            </span>
            <h2 className="text-4xl md:text-5xl font-black mt-3 mb-5">{credibility.title}</h2>
            <p className="text-gray-500 text-lg leading-relaxed mb-6">{credibility.text}</p>
            <div className="grid grid-cols-3 gap-3 max-w-lg">
              {trustStats.map(([value, label]) => (
                <div key={label} className="rounded-2xl bg-white border border-gold/20 p-4 shadow-sm">
                  <p className="text-2xl font-black text-navy">{value}</p>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {credibility.cards.map(([title, desc]: string[], i: number) => {
              const Icon = i === 0 ? Star : i === 1 ? Store : QrCode
              return (
                <div key={title} className="rounded-[1.75rem] bg-white border border-stone-100 p-6 shadow-xl shadow-stone-200/60 hover:-translate-y-1 hover:border-gold/40 transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-navy text-gold flex items-center justify-center mb-5">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-black text-lg mb-2">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Plan limits */}
      <section id="plans" className="py-24 px-4 bg-stone-50 text-navy border-y border-stone-100">
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
                badge: planBadges.starter,
                highlighted: false,
              },
              {
                name: 'Pro',
                pages: '3 pages',
                desc: t.proDesc,
                features: proFeatures,
                cta: t.choosePro,
                badge: planBadges.pro,
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
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black mb-3 ${plan.highlighted ? 'bg-navy/10 text-navy' : 'bg-gold/10 text-gold'}`}>
                    <BarChart3 className="w-3.5 h-3.5" />
                    {plan.badge}
                  </span>
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
            <Link href="/dashboard" className="text-gray-500 hover:text-gold text-sm transition-colors">{t.footerDashboard}</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
