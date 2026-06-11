'use client'
import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ThumbsUp, Plus, Trash2, Upload, ArrowRight, Check, CalendarDays, Wrench, Utensils, Globe2, Info, Sparkles, Lock, MessageCircle, Mail, Link2, ShieldCheck, CreditCard, X, QrCode, Monitor, Smartphone, Eye, ChevronDown } from 'lucide-react'
import { CATEGORY_LABELS_PT, DEFAULT_SERVICE_PRESETS, getCategoriesByTemplate, inferBusinessTemplate, type BusinessTemplate } from '@/lib/business-categories'
import AiLandingRenderer, { type AiBusinessData } from '@/components/AiLandingRenderer'
import { LANDING_THEME_OPTIONS, getLandingTheme, type LandingThemeId } from '@/lib/landing-themes'
import type { Language } from '@/lib/translations'

interface Service {
  name: string
  price: string
  description?: string
  photo?: string
}

type SetupLang = 'pt' | 'en' | 'es' | 'fr'
type ContactMethod = 'whatsapp' | 'booking' | 'email'

const AI_PREVIEW_STORAGE_KEY = 'vitrine_ai_page_config'
const BUSINESS_DRAFT_STORAGE_KEY = 'vitrine_business_data'
const TEMPLATE_DRAFT_STORAGE_KEY = 'vitrine_business_template_drafts'
const AI_PREVIEW_HINTS = {
  pt: ['Categoria e posicionamento', 'Descricao e servicos', 'Fotos principais e galeria'],
  en: ['Category and positioning', 'Description and services', 'Hero and gallery photos'],
  es: ['Categoria y posicionamiento', 'Descripcion y servicios', 'Fotos hero y galeria'],
  fr: ['Categorie et positionnement', 'Description et services', 'Photos hero et galerie'],
} as const

const LANGUAGE_OPTIONS: { code: SetupLang; label: string }[] = [
  { code: 'pt', label: 'Português' },
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
]

const setupCopy = {
  pt: {
    home: 'Página inicial', stepLabels: ['Negócio', 'Serviços', 'Fotos', 'Prévia'], back: 'Voltar', continue: 'Continuar',
    welcome: 'Setup guiado', headerHint: 'Idioma da página e do setup',
    step0Title: 'Vamos montar sua Vitrine', step0Text: 'Preencha o essencial. A Vitrine organiza a landing, CTAs, horários, fotos e prévia com marca d’água enquanto estiver em teste.',
    infoTitle: 'Comece simples. Ajuste depois.', infoText: 'Escolha o idioma inicial no topo. Ele traduz este setup e define o primeiro idioma que o cliente vê na página pública.',
    businessName: 'Nome do negócio *', businessNamePlaceholder: 'Ex.: Divino Café', nameRequired: 'O nome do negócio é obrigatório.',
    category: 'Categoria *', shortDescription: 'Descrição curta', descriptionPlaceholder: 'Explique o que torna o negócio especial, quem atende e por que o cliente deve escolher você.',
    address: 'Morada', addressPlaceholder: 'Rua, cidade, país', phone: 'Telefone', email: 'Email',
    actionEyebrow: 'Forma de contacto', actionTitle: 'Escolha como os clientes podem contactar o negócio', actionText: 'Selecione apenas os canais que fazem sentido. A landing mostra só os botões escolhidos e mantém a experiência limpa.',
    whatsapp: 'WhatsApp', whatsappHint: 'Número para receber pedidos, reservas ou dúvidas diretamente no WhatsApp.', booking: 'Link', bookingHint: 'Plataforma usada para agendamentos, reservas, menu, orçamento ou mais informações.', emailContact: 'Email', emailHint: 'Email público do estabelecimento para clientes entrarem em contato.', whatsappMessage: 'Mensagem pronta do WhatsApp', whatsappMessageInfo: 'Quando o visitante toca no botão de WhatsApp, a conversa já começa com esta mensagem preenchida. Isso facilita o pedido e reduz fricção.',
    menuEyebrow: 'Menu completo', menuTitle: 'Link ou imagem do cardápio', menuText: 'Deixe a landing limpa com os destaques e adicione aqui o menu completo. Também serve para QR Code de menu.', uploadMenu: 'Enviar imagem do menu', removeMenu: 'Remover imagem do menu',
    plan: 'Plano', planNote: 'Pode testar sem publicar: a prévia sempre mostra marca d’água até escolher/publicar o plano final.',
    servicesTitle: 'Serviços e horários', foodServicesTitle: 'Destaques do menu e horários', servicesText: 'Adicione o que o cliente precisa ver antes de chamar ou agendar.', foodServicesText: 'Adicione os pratos principais. Eles aparecem como destaques na landing de restauração.', technicalServicesText: 'Adicione serviços, orçamento ou opções rápidas que o cliente pode pedir.',
    menuHighlights: 'Destaques do menu', services: 'Serviços', addMenuItem: 'Adicionar item', addService: 'Adicionar serviço', serviceName: 'Nome do serviço', menuItemName: 'Nome do prato/item', price: 'Preço', serviceDescription: 'Detalhe curto para o cliente', foodDescription: 'Ingredientes, estilo ou por que as pessoas gostam', dishPhoto: 'Foto do prato', dishHint: 'Esta foto aparece ao lado do prato. Use fotos claras e próximas.',
    hours: 'Horários', closed: 'Fechado',
    photosTitle: 'Fotos', foodPhotosTitle: 'Fotos do espaço e do menu', photosText: 'Cada foto entra em uma área específica da landing. Boas fotos aumentam confiança.', foodPhotosText: 'Adicione ambiente, menu e pratos. Fotos de prato da etapa anterior aparecem nos cards do menu.',
    heroPhoto: 'Foto principal', foodHeroPhoto: 'Foto principal do restaurante', heroBadge: 'Fundo principal', heroHint: 'Primeira imagem que o cliente vê. Use foto larga do espaço, equipe ou melhor trabalho.', foodHeroHint: 'Primeira impressão: sala, balcão, food truck, vitrine ou mesa com pratos.', uploadHero: 'Enviar foto principal',
    aboutPhoto: 'Foto sobre o negócio', foodAboutPhoto: 'Foto de menu ou prato assinatura', aboutBadge: 'Seção sobre', foodAboutBadge: 'Destaque do menu', aboutHint: 'Aparece junto da descrição. Use retrato, equipe ou interior.', foodAboutHint: 'Aparece no bloco do menu. Use prato principal, menu impresso ou mesa montada.', uploadAbout: 'Enviar foto sobre', uploadFoodAbout: 'Enviar foto de menu/prato',
    gallery: 'Galeria', foodGallery: 'Galeria de comida e ambiente', galleryBadge: 'Grid visual', foodGalleryBadge: 'Pratos, bebidas, espaço', galleryHint: 'Mostre seus melhores trabalhos. Quanto mais prova visual, melhor.', foodGalleryHint: 'Adicione pratos, bebidas, equipe, mesas, balcão e imagens do menu.', dragMore: 'Arraste ou clique para adicionar mais', dragGallery: 'Arraste ou clique para enviar fotos da galeria', dragFood: 'Arraste fotos de comida, menu ou ambiente', fileTypes: 'JPG, PNG, WEBP', change: 'Trocar', remove: 'Remover',
    previewTitle: 'Sua Vitrine está pronta para prévia', previewText: 'A IA cruza categoria, texto, serviços e até 7 fotos para montar uma landing com a sua marca d’água antes da publicação.', pageUrl: 'URL da sua página', previewPage: 'Prévia com marca d’água', generate: 'Publicar minha página', generating: 'Publicando...',
    successTitle: 'Página publicada com sucesso!', successText: 'Sua página está online e pronta para compartilhar.', liveAt: 'Sua página está online em:', viewPage: 'Ver página', copyLink: 'Copiar link', copied: 'Copiado!', dashboard: 'Seu dashboard privado:', saveDashboard: 'Guarde este link — ele dá acesso a leads e estatísticas.', shareHint: 'Compartilhe no Instagram, WhatsApp ou Google para receber mais clientes.',
  },
  en: {
    home: 'Home', stepLabels: ['Business', 'Services', 'Photos', 'Preview'], back: 'Back', continue: 'Continue', welcome: 'Guided setup', headerHint: 'Page and setup language',
    step0Title: 'Let’s build your Vitrine', step0Text: 'Add the essentials. Vitrine organizes the landing page, CTAs, hours, photos and a watermarked preview while you are testing.', infoTitle: 'Start simple. Adjust later.', infoText: 'Choose the initial language in the header. It translates this setup and defines the first language customers see.',
    businessName: 'Business name *', businessNamePlaceholder: 'e.g. Divino Café', nameRequired: 'Business name is required.', category: 'Category *', shortDescription: 'Short description', descriptionPlaceholder: 'Describe what makes your business special, who you serve and why customers should choose you.', address: 'Address', addressPlaceholder: 'Street, city, country', phone: 'Phone', email: 'Email',
    actionEyebrow: 'Contact options', actionTitle: 'Choose how customers can contact the business', actionText: 'Select only the channels that make sense. The landing page shows only the chosen buttons and stays clean.', whatsapp: 'WhatsApp', whatsappHint: 'Number for requests, bookings or questions directly on WhatsApp.', booking: 'Link', bookingHint: 'Platform used for scheduling, booking, menu, quote requests or more information.', emailContact: 'Email', emailHint: 'Public business email for customer contact.', whatsappMessage: 'Pre-filled WhatsApp message', whatsappMessageInfo: 'When a visitor taps the WhatsApp button, the conversation starts with this message already filled in. This makes the request easier.',
    menuEyebrow: 'Full menu', menuTitle: 'Complete menu link or image', menuText: 'Keep the landing clean with highlights and add the full menu here. It also powers a menu QR Code.', uploadMenu: 'Upload menu image', removeMenu: 'Remove menu image', plan: 'Plan', planNote: 'You can test without publishing: the preview always shows a watermark until the final plan/page is published.',
    servicesTitle: 'Services & hours', foodServicesTitle: 'Menu highlights & hours', servicesText: 'Add what customers need to see before contacting or booking.', foodServicesText: 'Add your main dishes. They appear as highlights in the food landing page.', technicalServicesText: 'Add services, quote options or quick requests customers can make.', menuHighlights: 'Menu highlights', services: 'Services', addMenuItem: 'Add item', addService: 'Add service', serviceName: 'Service name', menuItemName: 'Menu item name', price: 'Price', serviceDescription: 'Short detail customers should know', foodDescription: 'Ingredients, style or why people love it', dishPhoto: 'Dish photo', dishHint: 'This photo appears beside the dish. Use bright, close photos.', hours: 'Opening hours', closed: 'Closed',
    photosTitle: 'Photos', foodPhotosTitle: 'Food business photos & menu visuals', photosText: 'Each photo goes into a specific section. Good photos build trust.', foodPhotosText: 'Add atmosphere, menu and dish photos. Dish photos from the previous step appear in menu cards.', heroPhoto: 'Hero photo', foodHeroPhoto: 'Food business hero photo', heroBadge: 'Main background', heroHint: 'First image customers see. Use a wide photo of your space, team or best work.', foodHeroHint: 'First impression: dining room, counter, food truck, display or signature table.', uploadHero: 'Upload hero photo', aboutPhoto: 'About photo', foodAboutPhoto: 'Menu or signature dish photo', aboutBadge: 'About section', foodAboutBadge: 'Menu feature', aboutHint: 'Shown next to your description. Use a portrait, team or interior photo.', foodAboutHint: 'Shown in the menu block. Use a main dish, printed menu or table spread.', uploadAbout: 'Upload about photo', uploadFoodAbout: 'Upload menu or dish photo', gallery: 'Gallery', foodGallery: 'Food & ambience gallery', galleryBadge: 'Visual grid', foodGalleryBadge: 'Dishes, drinks, space', galleryHint: 'Show your best work. More visual proof helps.', foodGalleryHint: 'Add dishes, drinks, team, tables, counter and menu images.', dragMore: 'Drag & drop or click to add more', dragGallery: 'Drag & drop or click to add gallery photos', dragFood: 'Drag & drop food, menu or ambience photos', fileTypes: 'JPG, PNG, WEBP', change: 'Change', remove: 'Remove',
    previewTitle: 'Your Vitrine is ready to preview', previewText: 'AI combines category, setup text, services and up to 7 photos to assemble a branded landing preview before publishing.', pageUrl: 'Your page URL', previewPage: 'Watermarked preview', generate: 'Publish my page', generating: 'Publishing...', successTitle: 'Page published successfully!', successText: 'Your page is live and ready to share.', liveAt: 'Your page is live at:', viewPage: 'View page', copyLink: 'Copy link', copied: 'Copied!', dashboard: 'Your private dashboard:', saveDashboard: 'Log in later with email and password.', shareHint: 'Share on Instagram, WhatsApp or Google to get more customers!',
  },
  es: {
    home: 'Inicio', stepLabels: ['Negocio', 'Servicios', 'Fotos', 'Vista previa'], back: 'Volver', continue: 'Continuar', welcome: 'Setup guiado', headerHint: 'Idioma de la página y setup', step0Title: 'Vamos a montar tu Vitrine', step0Text: 'Completa lo esencial. Vitrine organiza la landing, CTAs, horarios, fotos y una vista previa con marca de agua mientras pruebas.', infoTitle: 'Empieza simple. Ajusta después.', infoText: 'Elige el idioma inicial arriba. Traduce este setup y define el primer idioma que verá el cliente.', businessName: 'Nombre del negocio *', businessNamePlaceholder: 'Ej.: Divino Café', nameRequired: 'El nombre del negocio es obligatorio.', category: 'Categoría *', shortDescription: 'Descripción corta', descriptionPlaceholder: 'Explica qué hace especial tu negocio, a quién atiendes y por qué elegirte.', address: 'Dirección', addressPlaceholder: 'Calle, ciudad, país', phone: 'Teléfono', email: 'Email', actionEyebrow: 'Opciones de contacto', actionTitle: 'Elige cómo los clientes pueden contactar el negocio', actionText: 'Selecciona solo los canales necesarios. La landing muestra solo los botones elegidos y se mantiene limpia.', whatsapp: 'WhatsApp', whatsappHint: 'Número para recibir pedidos, reservas o dudas directamente por WhatsApp.', booking: 'Link', bookingHint: 'Plataforma usada para reservas, agenda, menú, presupuesto o más información.', emailContact: 'Email', emailHint: 'Email público del negocio para contacto con clientes.', whatsappMessage: 'Mensaje listo de WhatsApp', whatsappMessageInfo: 'Cuando el visitante toca el botón de WhatsApp, la conversación empieza con este mensaje ya escrito.', menuEyebrow: 'Menú completo', menuTitle: 'Link o imagen del menú', menuText: 'Mantén la landing limpia con destacados y agrega aquí el menú completo. También sirve para QR.', uploadMenu: 'Subir imagen del menú', removeMenu: 'Quitar imagen del menú', plan: 'Plan', planNote: 'Puedes probar sin publicar: la vista previa siempre muestra marca de agua hasta publicar el plan final.', servicesTitle: 'Servicios y horarios', foodServicesTitle: 'Destacados del menú y horarios', servicesText: 'Agrega lo que el cliente necesita ver antes de contactar o reservar.', foodServicesText: 'Agrega tus platos principales. Aparecen como destacados en la landing de comida.', technicalServicesText: 'Agrega servicios, presupuestos u opciones rápidas.', menuHighlights: 'Destacados del menú', services: 'Servicios', addMenuItem: 'Agregar item', addService: 'Agregar servicio', serviceName: 'Nombre del servicio', menuItemName: 'Nombre del plato/item', price: 'Precio', serviceDescription: 'Detalle corto para el cliente', foodDescription: 'Ingredientes, estilo o por qué gusta', dishPhoto: 'Foto del plato', dishHint: 'Esta foto aparece junto al plato. Usa fotos claras y cercanas.', hours: 'Horarios', closed: 'Cerrado', photosTitle: 'Fotos', foodPhotosTitle: 'Fotos del espacio y menú', photosText: 'Cada foto entra en una sección específica. Buenas fotos generan confianza.', foodPhotosText: 'Agrega ambiente, menú y platos. Las fotos del paso anterior aparecen en los cards.', heroPhoto: 'Foto principal', foodHeroPhoto: 'Foto principal del restaurante', heroBadge: 'Fondo principal', heroHint: 'Primera imagen que ve el cliente. Usa una foto amplia.', foodHeroHint: 'Primera impresión: sala, barra, food truck, vitrina o mesa.', uploadHero: 'Subir foto principal', aboutPhoto: 'Foto sobre el negocio', foodAboutPhoto: 'Foto de menú o plato firma', aboutBadge: 'Sección sobre', foodAboutBadge: 'Destacado del menú', aboutHint: 'Aparece junto a la descripción. Usa retrato, equipo o interior.', foodAboutHint: 'Aparece en el bloque del menú. Usa plato principal o menú.', uploadAbout: 'Subir foto sobre', uploadFoodAbout: 'Subir foto de menú/plato', gallery: 'Galería', foodGallery: 'Galería de comida y ambiente', galleryBadge: 'Grid visual', foodGalleryBadge: 'Platos, bebidas, espacio', galleryHint: 'Muestra tus mejores trabajos.', foodGalleryHint: 'Agrega platos, bebidas, equipo, mesas y menú.', dragMore: 'Arrastra o haz clic para agregar más', dragGallery: 'Arrastra o haz clic para subir fotos', dragFood: 'Arrastra fotos de comida, menú o ambiente', fileTypes: 'JPG, PNG, WEBP', change: 'Cambiar', remove: 'Quitar', previewTitle: 'Tu Vitrine está lista para vista previa', previewText: 'Mira cómo queda antes de publicar. La vista previa tiene marca de agua porque aún es una prueba.', pageUrl: 'URL de tu página', previewPage: 'Vista previa con marca de agua', generate: 'Publicar mi página', generating: 'Publicando...', successTitle: '¡Página publicada con éxito!', successText: 'Tu página está online y lista para compartir.', liveAt: 'Tu página está online en:', viewPage: 'Ver página', copyLink: 'Copiar link', copied: '¡Copiado!', dashboard: 'Tu dashboard privado:', saveDashboard: 'Entra después con email y contraseña.', shareHint: 'Comparte en Instagram, WhatsApp o Google para conseguir más clientes.',
  },
  fr: {
    home: 'Accueil', stepLabels: ['Entreprise', 'Services', 'Photos', 'Aperçu'], back: 'Retour', continue: 'Continuer', welcome: 'Setup guidé', headerHint: 'Langue page et setup', step0Title: 'Créons votre Vitrine', step0Text: 'Ajoutez l’essentiel. Vitrine organise la landing, CTAs, horaires, photos et un aperçu filigrané pendant le test.', infoTitle: 'Commencez simple. Ajustez ensuite.', infoText: 'Choisissez la langue initiale en haut. Elle traduit ce setup et définit la première langue vue par le client.', businessName: 'Nom de l’entreprise *', businessNamePlaceholder: 'Ex. Divino Café', nameRequired: 'Le nom est obligatoire.', category: 'Catégorie *', shortDescription: 'Description courte', descriptionPlaceholder: 'Expliquez ce qui rend votre entreprise spéciale et pourquoi vous choisir.', address: 'Adresse', addressPlaceholder: 'Rue, ville, pays', phone: 'Téléphone', email: 'Email', actionEyebrow: 'Options de contact', actionTitle: 'Choisissez comment les clients peuvent contacter l’entreprise', actionText: 'Sélectionnez seulement les canaux utiles. La landing affiche uniquement les boutons choisis et reste claire.', whatsapp: 'WhatsApp', whatsappHint: 'Numéro pour recevoir demandes, réservations ou questions directement sur WhatsApp.', booking: 'Lien', bookingHint: 'Plateforme utilisée pour réservation, agenda, menu, devis ou plus d’informations.', emailContact: 'Email', emailHint: 'Email public de l’entreprise pour le contact client.', whatsappMessage: 'Message WhatsApp prérempli', whatsappMessageInfo: 'Quand un visiteur touche le bouton WhatsApp, la conversation commence avec ce message déjà écrit.', menuEyebrow: 'Menu complet', menuTitle: 'Lien ou image du menu', menuText: 'Gardez la landing claire avec les highlights et ajoutez ici le menu complet. Sert aussi au QR.', uploadMenu: 'Envoyer image du menu', removeMenu: 'Supprimer image du menu', plan: 'Plan', planNote: 'Vous pouvez tester sans publier : l’aperçu affiche un filigrane jusqu’à publication finale.', servicesTitle: 'Services et horaires', foodServicesTitle: 'Highlights menu et horaires', servicesText: 'Ajoutez ce que le client doit voir avant de contacter ou réserver.', foodServicesText: 'Ajoutez vos plats principaux. Ils apparaissent comme highlights.', technicalServicesText: 'Ajoutez services, devis ou demandes rapides.', menuHighlights: 'Highlights du menu', services: 'Services', addMenuItem: 'Ajouter item', addService: 'Ajouter service', serviceName: 'Nom du service', menuItemName: 'Nom du plat/item', price: 'Prix', serviceDescription: 'Détail court pour le client', foodDescription: 'Ingrédients, style ou pourquoi il plaît', dishPhoto: 'Photo du plat', dishHint: 'Cette photo apparaît près du plat. Utilisez des photos claires.', hours: 'Horaires', closed: 'Fermé', photosTitle: 'Photos', foodPhotosTitle: 'Photos espace et menu', photosText: 'Chaque photo entre dans une section précise. Les bonnes photos créent la confiance.', foodPhotosText: 'Ajoutez ambiance, menu et plats. Les photos du pas précédent apparaissent dans les cartes.', heroPhoto: 'Photo principale', foodHeroPhoto: 'Photo principale restaurant', heroBadge: 'Fond principal', heroHint: 'Première image vue par le client. Utilisez une photo large.', foodHeroHint: 'Première impression : salle, comptoir, food truck, vitrine ou table.', uploadHero: 'Envoyer photo principale', aboutPhoto: 'Photo à propos', foodAboutPhoto: 'Photo menu ou plat signature', aboutBadge: 'Section à propos', foodAboutBadge: 'Highlight menu', aboutHint: 'Affichée près de la description. Portrait, équipe ou intérieur.', foodAboutHint: 'Affichée dans le bloc menu. Plat principal ou menu.', uploadAbout: 'Envoyer photo à propos', uploadFoodAbout: 'Envoyer photo menu/plat', gallery: 'Galerie', foodGallery: 'Galerie plats et ambiance', galleryBadge: 'Grille visuelle', foodGalleryBadge: 'Plats, boissons, espace', galleryHint: 'Montrez vos meilleurs travaux.', foodGalleryHint: 'Ajoutez plats, boissons, équipe, tables et menu.', dragMore: 'Glissez ou cliquez pour ajouter plus', dragGallery: 'Glissez ou cliquez pour envoyer des photos', dragFood: 'Glissez photos de plats, menu ou ambiance', fileTypes: 'JPG, PNG, WEBP', change: 'Changer', remove: 'Supprimer', previewTitle: 'Votre Vitrine est prête pour aperçu', previewText: 'Voyez le résultat avant publication. L’aperçu a un filigrane car c’est encore un test.', pageUrl: 'URL de votre page', previewPage: 'Aperçu avec filigrane', generate: 'Publier ma page', generating: 'Publication...', successTitle: 'Page publiée avec succès !', successText: 'Votre page est en ligne et prête à partager.', liveAt: 'Votre page est en ligne sur :', viewPage: 'Voir page', copyLink: 'Copier lien', copied: 'Copié !', dashboard: 'Votre dashboard privé :', saveDashboard: 'Connectez-vous ensuite avec email et mot de passe.', shareHint: 'Partagez sur Instagram, WhatsApp ou Google pour obtenir plus de clients.',
  },
} as const

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const PLANS = [
  { id: 'starter', name: 'Starter', pages: '1 page', price: '€10', period: '/month', description: 'Best for one business page' },
  { id: 'pro', name: 'Pro', pages: '3 pages', price: '€15', period: '/month', description: 'For multiple services or locations' },
]

const TEMPLATE_DETAILS = {
  service: {
    title: 'Services & appointments page',
    description: 'Best for salons, clinics, beauty, fitness and other appointment-based businesses.',
    badge: 'Booking focused',
  },
  food: {
    title: 'Food, menu & orders page',
    description: 'Best for any food business with a menu: restaurants, cafés, bars, bakeries, food trucks and takeaways.',
    badge: 'Menu focused',
  },
  technical: {
    title: 'Professional trust page',
    description: 'Best for clinics, offices, vets, consultants and practical services where customers need trust before contact.',
    badge: 'Trust focused',
  },
}

const TEMPLATE_COPY: Record<SetupLang, Record<'service' | 'food' | 'technical', { title: string; description: string; badge: string }>> = {
  pt: {
    service: { title: 'Página de serviços e agendamentos', description: 'Ideal para salões, clínicas, beleza, fitness e negócios com marcação.', badge: 'Foco em reservas' },
    food: { title: 'Página de restauração, menu e pedidos', description: 'Ideal para restaurantes, cafés, bares, padarias, food trucks e take-away.', badge: 'Foco em menu' },
    technical: { title: 'Página profissional de confiança', description: 'Ideal para clínicas, escritórios, veterinários, consultores e serviços que precisam gerar confiança antes do contacto.', badge: 'Foco em confiança' },
  },
  en: TEMPLATE_DETAILS,
  es: {
    service: { title: 'Página de servicios y reservas', description: 'Ideal para salones, clínicas, belleza, fitness y negocios con cita.', badge: 'Foco en reservas' },
    food: { title: 'Página de comida, menú y pedidos', description: 'Ideal para restaurantes, cafés, bares, panaderías, food trucks y take-away.', badge: 'Foco en menú' },
    technical: { title: 'Página profesional de confianza', description: 'Ideal para clínicas, oficinas, veterinarios, consultores y servicios que necesitan confianza antes del contacto.', badge: 'Foco en confianza' },
  },
  fr: {
    service: { title: 'Page services et réservations', description: 'Idéal pour salons, cliniques, beauté, fitness et activités sur rendez-vous.', badge: 'Focalisé réservation' },
    food: { title: 'Page restauration, menu et commandes', description: 'Idéal pour restaurants, cafés, bars, boulangeries, food trucks et take-away.', badge: 'Focalisé menu' },
    technical: { title: 'Page professionnelle de confiance', description: 'Idéal pour cliniques, bureaux, vétérinaires, consultants et services qui doivent inspirer confiance.', badge: 'Focalisé confiance' },
  },
}

const CATEGORY_GROUPS: { template: BusinessTemplate; title: string }[] = [
  { template: 'service', title: 'Services & appointments' },
  { template: 'food', title: 'Food, menu & orders' },
  { template: 'technical', title: 'Trust & professional services' },
]

function isDefaultServiceList(items: Service[]) {
  const names = items.map((item) => item.name).join('|')
  return Object.values(DEFAULT_SERVICE_PRESETS).some((list) => list.map((item) => item.name).join('|') === names)
}

const GENERATION_DURATION_MS = 2000
const COPY_SUCCESS_DURATION_MS = 2000
const MAX_IMAGE_PX = 1000
const TARGET_IMAGE_BYTES = 200_000
const AI_PHOTO_LIMIT = 7

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
        const mimeType = 'image/webp'
        let quality = 0.82
        let dataUrl = canvas.toDataURL(mimeType, quality)
        while (dataUrl.length * 0.75 > TARGET_IMAGE_BYTES && quality > 0.42) {
          quality -= 0.08
          dataUrl = canvas.toDataURL(mimeType, quality)
        }
        resolve(dataUrl)
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  })
}

async function uploadCompressedImage(dataUrl: string, filename = 'photo.jpg'): Promise<string> {
  try {
    const blob = await fetch(dataUrl).then((res) => res.blob())
    const formData = new FormData()
    const safeName = filename.replace(/\.[^.]+$/, '') || 'photo'
    formData.append('file', new File([blob], `${safeName}.webp`, { type: blob.type || 'image/webp' }))
    const res = await fetch('/api/upload-image', { method: 'POST', body: formData })
    if (!res.ok) return dataUrl
    const json = await res.json()
    return json.url || dataUrl
  } catch {
    return dataUrl
  }
}

function generateSlug(name: string): string {
  const slug = (name || 'my-business')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  return slug || 'my-business'
}

function buildAddressMapUrl(address: string) {
  const trimmedAddress = address.trim()
  if (!trimmedAddress) return null
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trimmedAddress)}`
}

export default function DashboardPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [businessName, setBusinessName] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [category, setCategory] = useState('Hair Salon')
  const [description, setDescription] = useState('')
  const [address, setAddress] = useState('')
  const [email, setEmail] = useState('')
  const [accountEmail, setAccountEmail] = useState('')
  const [authLoading, setAuthLoading] = useState(true)
  const [sessionAvailable, setSessionAvailable] = useState(false)
  const [phone, setPhone] = useState('')
  const [contactMethods, setContactMethods] = useState<ContactMethod[]>(['whatsapp'])
  const [bookingUrl, setBookingUrl] = useState('')
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [whatsappMessage, setWhatsappMessage] = useState('')
  const [menuUrl, setMenuUrl] = useState('')
  const [menuImageUrl, setMenuImageUrl] = useState('')
  const [plan, setPlan] = useState('starter')
  const [lang, setLang] = useState<SetupLang>('pt')
  const [themeId, setThemeId] = useState<LandingThemeId>('golden-hour')
  const [previewViewport, setPreviewViewport] = useState<'desktop' | 'mobile'>('desktop')
  const [previewFocusSection, setPreviewFocusSection] = useState<string | null>('hero')
  const [previewFocusLabel, setPreviewFocusLabel] = useState<string>('Hero')
  const [previewSpotlightOpen, setPreviewSpotlightOpen] = useState(false)
  const [nameError, setNameError] = useState('')
  const [generateError, setGenerateError] = useState('')
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
  const [copySuccess, setCopySuccess] = useState(false)
  const [dashboardToken, setDashboardToken] = useState('')
  const [publicPageUrl, setPublicPageUrl] = useState('')
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [billingLoadingPlan, setBillingLoadingPlan] = useState('')
  const [billingError, setBillingError] = useState('')
  const [aiPreviewLoading, setAiPreviewLoading] = useState(false)
  const [aiPreviewError, setAiPreviewError] = useState('')
  const [themePickerOpen, setThemePickerOpen] = useState(false)
  const generateTimeoutRef = useRef<NodeJS.Timeout>()
  const copySuccessTimeoutRef = useRef<NodeJS.Timeout>()
  const categoryRef = useRef(category)
  categoryRef.current = category
  const draftRestoredRef = useRef(false)
  const heroInputRef = useRef<HTMLInputElement>(null)
  const aboutInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const menuImageInputRef = useRef<HTMLInputElement>(null)
  const previewScrollRef = useRef<HTMLDivElement>(null)

  const pageSlug = useMemo(() => generateSlug(businessName), [businessName])
  const selectedTemplate = inferBusinessTemplate(category)
  const selectedTheme = useMemo(() => getLandingTheme(themeId), [themeId])
  const t = setupCopy[lang]
  const steps = t.stepLabels
  const categoryLabel = (value: string) => (lang === 'pt' ? CATEGORY_LABELS_PT[value] ?? value : value)
  const categoryGroupTitle = (template: BusinessTemplate) => (
    lang === 'pt'
      ? template === 'service'
        ? 'Serviços e marcações'
        : template === 'food'
          ? 'Restauração, menu e pedidos'
          : 'Serviços profissionais e confiança'
      : lang === 'es'
        ? template === 'service'
          ? 'Servicios y reservas'
          : template === 'food'
            ? 'Comida, menú y pedidos'
            : 'Servicios profesionales y confianza'
        : lang === 'fr'
          ? template === 'service'
            ? 'Services et réservations'
            : template === 'food'
              ? 'Restauration, menu et commandes'
              : 'Services professionnels et confiance'
          : CATEGORY_GROUPS.find((group) => group.template === template)?.title ?? template
  )
  const serviceTypeOptions = selectedTemplate === 'food'
    ? [
        { name: lang === 'pt' ? 'Prato principal' : 'Main dish', description: lang === 'pt' ? 'Item forte para aparecer primeiro no menu.' : 'Strong item to feature first in the menu.' },
        { name: lang === 'pt' ? 'Bebida' : 'Drink', description: lang === 'pt' ? 'Café, sumo, cocktail ou bebida assinatura.' : 'Coffee, juice, cocktail or signature drink.' },
        { name: lang === 'pt' ? 'Sobremesa' : 'Dessert', description: lang === 'pt' ? 'Final doce para aumentar o ticket.' : 'Sweet finish to increase the order value.' },
        { name: lang === 'pt' ? 'Combo' : 'Combo', description: lang === 'pt' ? 'Oferta pronta para almoço, jantar ou take-away.' : 'Ready offer for lunch, dinner or takeaway.' },
      ]
    : selectedTemplate === 'technical'
      ? [
          { name: lang === 'pt' ? 'Orçamento' : 'Quote request', description: lang === 'pt' ? 'Pedido rápido para avaliar preço e disponibilidade.' : 'Quick request to evaluate price and availability.' },
          { name: lang === 'pt' ? 'Reparação' : 'Repair', description: lang === 'pt' ? 'Serviço prático com chamada direta.' : 'Practical service with direct contact.' },
          { name: lang === 'pt' ? 'Instalação' : 'Installation', description: lang === 'pt' ? 'Trabalho técnico com explicação simples.' : 'Technical work with a simple explanation.' },
        ]
      : [
          { name: lang === 'pt' ? 'Serviço principal' : 'Main service', description: lang === 'pt' ? 'O serviço mais vendido ou mais importante.' : 'The most important or most requested service.' },
          { name: lang === 'pt' ? 'Pacote' : 'Package', description: lang === 'pt' ? 'Oferta combinada para facilitar a decisão.' : 'Bundled offer to make decisions easier.' },
          { name: lang === 'pt' ? 'Consulta' : 'Consultation', description: lang === 'pt' ? 'Primeiro contacto, avaliação ou marcação.' : 'First contact, evaluation or appointment.' },
        ]
  const contactMethodSelected = useCallback((method: ContactMethod) => contactMethods.includes(method), [contactMethods])
  const toggleContactMethod = (method: ContactMethod) => {
    setContactMethods((items) => {
      if (items.includes(method)) return items.length === 1 ? items : items.filter((item) => item !== method)
      return [...items, method]
    })
  }

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (generateTimeoutRef.current) {
        clearTimeout(generateTimeoutRef.current)
      }
      if (copySuccessTimeoutRef.current) {
        clearTimeout(copySuccessTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    let active = true
    fetch('/api/account/session')
      .then(async (res) => {
        if (!active) return
        if (!res.ok) {
          setSessionAvailable(false)
          return
        }
        const json = await res.json()
        if (json.email) {
          setAccountEmail(json.email)
          setSessionAvailable(true)
        }
      })
      .catch(() => {
        if (active) setSessionAvailable(false)
      })
      .finally(() => {
        if (active) setAuthLoading(false)
      })
    return () => { active = false }
  }, [router])

  const applyDraftData = useCallback((data: any, forcedCategory?: string) => {
    if (!data || typeof data !== 'object') return

    const nextCategory = forcedCategory ?? data.category
    const nextTemplate = inferBusinessTemplate(typeof nextCategory === 'string' && nextCategory ? nextCategory : categoryRef.current)
    if (typeof data.businessName === 'string') setBusinessName(data.businessName)
    if (typeof data.subtitle === 'string') setSubtitle(data.subtitle)
    if (typeof nextCategory === 'string' && nextCategory) setCategory(nextCategory)
    if (typeof data.description === 'string') setDescription(data.description)
    if (typeof data.address === 'string') setAddress(data.address)
    if (typeof data.email === 'string') setEmail(data.email)
    if (Array.isArray(data.contactMethods) && data.contactMethods.length) {
      setContactMethods(data.contactMethods.filter((item: string) => ['whatsapp', 'booking', 'email'].includes(item)) as ContactMethod[])
    } else {
      setContactMethods(['whatsapp'])
    }
    setPhone(typeof data.phone === 'string' ? data.phone : '')
    setBookingUrl(typeof data.bookingUrl === 'string' ? data.bookingUrl : '')
    setWhatsappNumber(typeof data.whatsappNumber === 'string' ? data.whatsappNumber : '')
    setWhatsappMessage(typeof data.whatsappMessage === 'string' ? data.whatsappMessage : '')
    setMenuUrl(typeof data.menuUrl === 'string' ? data.menuUrl : '')
    setMenuImageUrl(typeof data.menuImageUrl === 'string' ? data.menuImageUrl : '')
    setPlan(typeof data.plan === 'string' ? data.plan : 'starter')
    if (data.lang && ['pt', 'en', 'es', 'fr'].includes(data.lang)) setLang(data.lang as SetupLang)
    if (data.themeId && LANDING_THEME_OPTIONS.some((theme) => theme.id === data.themeId)) setThemeId(data.themeId as LandingThemeId)
    else setThemeId('golden-hour')
    if (Array.isArray(data.services) && data.services.length) setServices(data.services)
    else setServices(DEFAULT_SERVICE_PRESETS[nextTemplate])
    if (Array.isArray(data.hours) && data.hours.length) setHours(data.hours)
    else setHours(DAYS.map((day) => ({ day, open: day !== 'Sunday', from: '09:00', to: '20:00' })))
    if (Array.isArray(data.photos)) {
      const nextPhotos = (data.photos as string[]).filter(Boolean)
      setHeroPhoto(nextPhotos[0] || '')
      if (nextTemplate === 'food') {
        setAboutPhoto('')
        setGalleryPhotos(nextPhotos.slice(1))
      } else {
        setAboutPhoto(nextPhotos[1] || '')
        setGalleryPhotos(nextPhotos.slice(2))
      }
    } else {
      setHeroPhoto('')
      setAboutPhoto('')
      setGalleryPhotos([])
    }
  }, [])

  // Restore previously saved data
  useEffect(() => {
    if (draftRestoredRef.current) return
    draftRestoredRef.current = true
    try {
      const params = new URLSearchParams(window.location.search)
      const startBlank = params.get('new') === '1'
      const saved = startBlank ? null : localStorage.getItem(BUSINESS_DRAFT_STORAGE_KEY)
      if (startBlank) {
        localStorage.removeItem(BUSINESS_DRAFT_STORAGE_KEY)
        localStorage.removeItem(TEMPLATE_DRAFT_STORAGE_KEY)
      }
      if (saved) {
        applyDraftData(JSON.parse(saved))
      }

      const ownerEmail = params.get('ownerEmail')
      const requestedPlan = params.get('plan')
      if (ownerEmail) setEmail(ownerEmail)
      if (requestedPlan && PLANS.some((p) => p.id === requestedPlan)) setPlan(requestedPlan)
    } catch {
      // ignore corrupt saved data
    }
  }, [applyDraftData])

  const addService = () => setServices([...services, selectedTemplate === 'food'
    ? { name: '', price: '', description: '', photo: '' }
    : { name: '', price: '', description: '' }])
  const removeService = (i: number) => setServices(services.filter((_, idx) => idx !== i))
  const updateService = (i: number, field: keyof Service, val: string) => {
    setServices(services.map((s, idx) => (idx === i ? { ...s, [field]: val } : s)))
  }
  const handleCategoryChange = (nextCategory: string) => {
    const template = inferBusinessTemplate(nextCategory)
    try {
      const currentDraft = {
        businessName,
        subtitle,
        category,
        description,
        address,
        email,
        phone,
        bookingUrl,
        whatsappNumber,
        whatsappMessage,
        contactMethods,
        menuUrl,
        menuImageUrl,
        plan,
        lang,
        themeId,
        services,
        hours,
        photos: setupPhotos,
      }
      const storedDrafts = JSON.parse(localStorage.getItem(TEMPLATE_DRAFT_STORAGE_KEY) || '{}')
      storedDrafts[selectedTemplate] = currentDraft
      localStorage.setItem(TEMPLATE_DRAFT_STORAGE_KEY, JSON.stringify(storedDrafts))

      if (storedDrafts[template]) {
        applyDraftData({ ...storedDrafts[template], category: nextCategory }, nextCategory)
        return
      }
    } catch {
      // ignore draft restore issues and continue with a normal switch
    }

    setCategory(nextCategory)
    setServices(DEFAULT_SERVICE_PRESETS[template])
    setMenuUrl('')
    setMenuImageUrl('')
    setHeroPhoto('')
    setAboutPhoto('')
    setGalleryPhotos([])
  }
  const toggleDay = (i: number) => {
    setHours(hours.map((h, idx) => (idx === i ? { ...h, open: !h.open } : h)))
  }

  const handleSlotFile = (file: File, setter: (v: string) => void) => {
    if (!file.type.startsWith('image/')) return
    compressImage(file)
      .then((dataUrl) => uploadCompressedImage(dataUrl, file.name))
      .then((dataUrl) => {
        if (dataUrl && dataUrl.startsWith('data:image/')) setter(dataUrl)
        else if (dataUrl && dataUrl.startsWith('http')) setter(dataUrl)
      })
      .catch(() => undefined)
  }

  const handleServicePhoto = (index: number, file: File | null) => {
    if (!file || !file.type.startsWith('image/')) return
    compressImage(file)
      .then((dataUrl) => uploadCompressedImage(dataUrl, file.name))
      .then((dataUrl) => {
        if (dataUrl && (dataUrl.startsWith('data:image/') || dataUrl.startsWith('http'))) {
          setServices((items) => items.map((item, idx) => (idx === index ? { ...item, photo: dataUrl } : item)))
        }
      })
      .catch(() => undefined)
  }

  const handleGalleryFiles = (files: FileList | null) => {
    if (!files) return
    const reservedSlots = selectedTemplate === 'food' ? 1 : 2
    const availableSlots = Math.max(0, AI_PHOTO_LIMIT - reservedSlots - galleryPhotos.length)
    Array.from(files).slice(0, availableSlots).forEach((file) => {
      if (!file.type.startsWith('image/')) return
      compressImage(file)
        .then((dataUrl) => uploadCompressedImage(dataUrl, file.name))
        .then((dataUrl) => {
          if (dataUrl && dataUrl.startsWith('data:image/')) {
            setGalleryPhotos((prev) => [...prev, dataUrl])
          } else if (dataUrl && dataUrl.startsWith('http')) {
            setGalleryPhotos((prev) => [...prev, dataUrl])
          }
        })
        .catch(() => undefined)
    })
  }

  const setupPhotos = useMemo(
    () => (selectedTemplate === 'food' ? [heroPhoto, ...galleryPhotos] : [heroPhoto, aboutPhoto, ...galleryPhotos]).filter(Boolean).slice(0, AI_PHOTO_LIMIT),
    [aboutPhoto, galleryPhotos, heroPhoto, selectedTemplate],
  )

  const saveBusinessData = useCallback((): boolean => {
    const photos = setupPhotos
    const data = {
      businessName,
      subtitle,
      category,
      description,
      address,
      email,
      phone,
      bookingUrl,
      whatsappNumber,
      whatsappMessage,
      contactMethods,
      menuUrl,
      menuImageUrl,
      plan,
      lang,
      themeId,
      services,
      hours,
      photos,
      mapUrl: buildAddressMapUrl(address),
    }
    try {
      localStorage.setItem(BUSINESS_DRAFT_STORAGE_KEY, JSON.stringify(data))
      const storedDrafts = JSON.parse(localStorage.getItem(TEMPLATE_DRAFT_STORAGE_KEY) || '{}')
      storedDrafts[selectedTemplate] = data
      localStorage.setItem(TEMPLATE_DRAFT_STORAGE_KEY, JSON.stringify(storedDrafts))
      return true
    } catch {
      // Quota exceeded — retry without photos so at least the text data is saved
      try {
        const liteDraft = { ...data, photos: [] }
        localStorage.setItem(BUSINESS_DRAFT_STORAGE_KEY, JSON.stringify(liteDraft))
        const storedDrafts = JSON.parse(localStorage.getItem(TEMPLATE_DRAFT_STORAGE_KEY) || '{}')
        storedDrafts[selectedTemplate] = liteDraft
        localStorage.setItem(TEMPLATE_DRAFT_STORAGE_KEY, JSON.stringify(storedDrafts))
      } catch {
        // localStorage unavailable — ignore
      }
      return false
    }
  }, [address, bookingUrl, businessName, category, contactMethods, description, email, hours, lang, menuImageUrl, menuUrl, phone, plan, selectedTemplate, services, setupPhotos, subtitle, themeId, whatsappMessage, whatsappNumber])

  useEffect(() => {
    saveBusinessData()
  }, [saveBusinessData])

  const handleNext = () => {
    if (step === 0) {
      if (!businessName.trim()) {
        setNameError(t.nameRequired)
        return
      }
      setNameError('')
    }
    setStep(step + 1)
  }

  const handleGeneratePage = async () => {
    saveBusinessData()
    setIsGenerating(true)
    setGenerateError('')
    if (!accountEmail) {
      setGenerateError('Please log in before publishing your page.')
      setIsGenerating(false)
      return
    }
    try {
      const aiPageConfig = (() => {
        try {
          const saved = localStorage.getItem(AI_PREVIEW_STORAGE_KEY)
          return saved ? JSON.parse(saved) : buildAiPreviewConfig()
        } catch {
          return buildAiPreviewConfig()
        }
      })()
      const res = await fetch('/api/businesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName,
          subtitle,
          slug: pageSlug,
          category,
          description,
          address,
          mapUrl: buildAddressMapUrl(address),
          email: contactMethodSelected('email') ? email.trim() || null : null,
          phone,
          whatsappNumber: contactMethodSelected('whatsapp') ? whatsappNumber.trim() || null : null,
          whatsappMessage: contactMethodSelected('whatsapp') ? whatsappMessage.trim() || null : null,
          bookingUrl: contactMethodSelected('booking') ? bookingUrl.trim() || null : null,
          menuUrl: menuUrl.trim() || null,
          menuImageUrl: menuImageUrl.trim() || null,
          socialLinks: { contactMethods },
          plan,
          lang,
          themeId,
          services,
          hours,
          photos: setupPhotos,
          aiPageConfig,
        }),
      })
      if (res.ok) {
        const json = await res.json()
        if (json.token) {
          setDashboardToken(json.token)
          // Persist the token to localStorage so the user can recover it
          // from the same browser even if they lose the email.
          try {
            localStorage.setItem('vitrine_dashboard_token', json.token)
            localStorage.setItem('vitrine_dashboard_slug', pageSlug)
          } catch {
            // localStorage unavailable — ignore
          }
        }
      } else {
        const json = await res.json().catch(() => null)
        setGenerateError(json?.error ?? 'Could not create this page. Please check your details and try again.')
        setIsGenerating(false)
        return
      }
    } catch {
      setGenerateError('Could not reach the server. Please try again in a moment.')
      setIsGenerating(false)
      return
    }
    // Compute the real public URL using the current origin (not a hardcoded domain).
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    setPublicPageUrl(`${origin}/p/${pageSlug}`)
    generateTimeoutRef.current = setTimeout(() => {
      setIsGenerating(false)
      setIsGenerated(true)
      setShowPlanModal(true)
    }, GENERATION_DURATION_MS)
  }

  const startCheckout = async (selectedPlan: string) => {
    setPlan(selectedPlan)
    setBillingError('')
    setBillingLoadingPlan(selectedPlan)
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selectedPlan, email: accountEmail }),
      })
      const json = await res.json().catch(() => null)
      if (!res.ok || !json?.url) {
        throw new Error(json?.error ?? 'Could not open the secure checkout yet.')
      }
      window.location.href = json.url
    } catch (err) {
      setBillingError(err instanceof Error ? err.message : 'Could not open the secure checkout yet.')
      setBillingLoadingPlan('')
    }
  }

  const handleCopyLink = async () => {
    const fullUrl = publicPageUrl || (typeof window !== 'undefined' ? `${window.location.origin}/p/${pageSlug}` : `/p/${pageSlug}`)
    try {
      await navigator.clipboard.writeText(fullUrl)
      setCopySuccess(true)
      copySuccessTimeoutRef.current = setTimeout(() => setCopySuccess(false), COPY_SUCCESS_DURATION_MS)
    } catch (err) {
      // Fallback for browsers that don't support clipboard API
      console.error('Failed to copy:', err)
      alert(`Failed to copy link. Please copy manually:\n\n${fullUrl}`)
    }
  }

  const buildAiPreviewConfig = useCallback(() => {
    const template = selectedTemplate
    const photos = setupPhotos
    const hasMenu = template === 'food' && Boolean(menuUrl || menuImageUrl || services.length)
    const hasBooking = contactMethodSelected('booking') && Boolean(bookingUrl)
    const hasWhatsapp = contactMethodSelected('whatsapp') && Boolean(whatsappNumber)
    const primaryCta = hasBooking ? 'Book now' : hasWhatsapp ? 'Message on WhatsApp' : 'Contact us'
    const secondaryCta = hasMenu ? 'View menu' : 'View services'
    const headline = businessName.trim() || (template === 'food' ? 'Your restaurant' : 'Your business')
    const subheadline = subtitle.trim()
      ? subtitle.trim().slice(0, 120)
      : ''

    return {
      generatedAt: new Date().toISOString(),
      source: 'setup_and_photos_preview',
      template,
      imageCount: photos.length,
      style: {
        primaryColor: selectedTheme.primaryColor,
        accentColor: selectedTheme.accentColor,
        mood: selectedTheme.id,
        themeId: selectedTheme.id,
      },
      sections: template === 'food'
        ? ['hero', 'menu', 'gallery', 'contact']
        : ['hero', 'about', 'benefits', 'services', 'gallery', 'hours', 'contact'],
      copy: {
        headline,
        subheadline,
        primaryCta,
        secondaryCta,
      },
      photoRoles: template === 'food'
        ? {
            hero: photos[0] ? 'photo_1' : null,
            about: null,
            gallery: photos.slice(1).map((_, index) => `photo_${index + 2}`),
          }
        : {
            hero: photos[0] ? 'photo_1' : null,
            about: photos[1] ? 'photo_2' : null,
            gallery: photos.slice(2).map((_, index) => `photo_${index + 3}`),
          },
      recommendations: [
        photos.length >= 3 ? 'Use the strongest photo as the hero and keep the rest as visual proof.' : 'Add more real photos to make the landing feel more trustworthy.',
        hasWhatsapp ? 'Keep WhatsApp visible as the fastest conversion action.' : 'Add WhatsApp if you want faster customer conversations.',
        hasMenu ? 'Show menu highlights before the gallery so customers decide faster.' : 'Keep services clear and easy to scan before the contact section.',
      ],
    }
  }, [bookingUrl, businessName, contactMethodSelected, menuImageUrl, menuUrl, selectedTemplate, selectedTheme, services, setupPhotos, subtitle, whatsappNumber])

  const handleAiPreview = async () => {
    saveBusinessData()
    setAiPreviewLoading(true)
    setAiPreviewError('')
    const localFallback = buildAiPreviewConfig()
    try {
      const res = await fetch('/api/ai/generate-page-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName,
          subtitle,
          category,
          description,
          address,
          mapUrl: buildAddressMapUrl(address),
          lang,
          themeId,
          contactMethods,
          bookingUrl: contactMethodSelected('booking') ? bookingUrl.trim() || null : null,
          whatsappNumber: contactMethodSelected('whatsapp') ? whatsappNumber.trim() || null : null,
          menuUrl: menuUrl.trim() || null,
          services,
          hours,
          photos: setupPhotos,
          generationType: 'initial_preview',
        }),
      })
      const json = await res.json().catch(() => null)
      const config = res.ok && json?.config ? json.config : localFallback
      localStorage.setItem(AI_PREVIEW_STORAGE_KEY, JSON.stringify(config))
      router.push('/preview')
    } catch (err) {
      try {
        localStorage.setItem(AI_PREVIEW_STORAGE_KEY, JSON.stringify({ ...localFallback, source: 'local_preview_fallback' }))
        router.push('/preview')
      } catch {
        setAiPreviewError(err instanceof Error ? err.message : 'Could not prepare AI preview.')
      }
    } finally {
      setAiPreviewLoading(false)
    }
  }

  const activatePreviewFocus = useCallback((section: string, label: string) => {
    setPreviewFocusSection(section)
    setPreviewFocusLabel(label)
  }, [])
  const openPreviewSpotlight = useCallback((section: string, label: string) => {
    setPreviewFocusSection(section)
    setPreviewFocusLabel(label)
    setPreviewSpotlightOpen(true)
  }, [])
  const bindPreviewFocus = useCallback((section: string, label: string) => ({
    onFocus: () => activatePreviewFocus(section, label),
    onClick: () => activatePreviewFocus(section, label),
  }), [activatePreviewFocus])
  const previewJumpLabel = lang === 'pt' ? 'Mostrar' : lang === 'es' ? 'Mostrar' : lang === 'fr' ? 'Montrer' : 'Show'

  const openFullLivePreview = () => {
    saveBusinessData()
    localStorage.setItem(AI_PREVIEW_STORAGE_KEY, JSON.stringify({ ...buildAiPreviewConfig(), source: 'dashboard_live_preview' }))
    router.push('/preview')
  }

  const fullPreviewConfig = useMemo(() => buildAiPreviewConfig(), [buildAiPreviewConfig])
  const livePreviewSections = useMemo(() => (
    step === 0
      ? (selectedTemplate === 'food' ? ['hero', 'menu', 'contact'] : ['hero', 'about', 'contact'])
      : step === 1
        ? ['hero', selectedTemplate === 'food' ? 'menu' : 'services', 'contact']
        : step === 2
          ? (selectedTemplate === 'food' ? ['hero', 'menu', 'gallery', 'contact'] : ['hero', 'about', 'gallery'])
          : fullPreviewConfig.sections
  ), [fullPreviewConfig.sections, selectedTemplate, step])
  const livePreviewConfig = useMemo(() => ({
    ...fullPreviewConfig,
    sections: livePreviewSections,
    focusSection: previewFocusSection,
    focusLabel: previewFocusLabel,
  }), [fullPreviewConfig, livePreviewSections, previewFocusLabel, previewFocusSection])
  const spotlightPreviewConfig = useMemo(() => ({
    ...fullPreviewConfig,
    sections: fullPreviewConfig.sections,
    focusSection: previewFocusSection,
    focusLabel: previewFocusLabel,
  }), [fullPreviewConfig, previewFocusLabel, previewFocusSection])
  const previewShowsEmail = contactMethods.includes('email')
  const previewShowsBooking = contactMethods.includes('booking')
  const previewShowsWhatsapp = contactMethods.includes('whatsapp')
  const previewPhotos = (step === 2 || step === 3)
    ? setupPhotos
    : (selectedTemplate === 'food' ? [heroPhoto].filter(Boolean) : [heroPhoto, aboutPhoto].filter(Boolean))

  const livePreviewBusiness = useMemo<AiBusinessData>(() => ({
    businessName: businessName.trim() || (lang === 'pt' ? 'Seu negócio' : lang === 'es' ? 'Tu negocio' : lang === 'fr' ? 'Votre entreprise' : 'Your business'),
    subtitle: subtitle.trim(),
    category,
    description: description.trim(),
    address,
    mapUrl: buildAddressMapUrl(address),
    email: previewShowsEmail ? email : undefined,
    phone,
    bookingUrl: previewShowsBooking ? bookingUrl : undefined,
    whatsappNumber: previewShowsWhatsapp ? whatsappNumber : undefined,
    whatsappMessage: previewShowsWhatsapp ? whatsappMessage : undefined,
    contactMethods,
    menuUrl,
    menuImageUrl,
    lang,
    themeId,
    services,
    hours,
    photos: previewPhotos,
  }), [
    businessName,
    subtitle,
    category,
    description,
    address,
    email,
    phone,
    bookingUrl,
    whatsappNumber,
    whatsappMessage,
    contactMethods,
    previewShowsEmail,
    previewShowsBooking,
    previewShowsWhatsapp,
    menuUrl,
    menuImageUrl,
    lang,
    themeId,
    services,
    hours,
    previewPhotos,
  ])

  useEffect(() => {
    if (!previewFocusSection) return

    const previewEl = previewScrollRef.current
    if (!previewEl) return

    const target = previewEl.querySelector<HTMLElement>(`[data-preview-section="${previewFocusSection}"]`)
    if (!target) return

    const previewRect = previewEl.getBoundingClientRect()
    const targetRect = target.getBoundingClientRect()
    const offset = targetRect.top - previewRect.top + previewEl.scrollTop - 28

    previewEl.scrollTo({ top: Math.max(0, offset), behavior: 'smooth' })
  }, [previewFocusSection, previewSpotlightOpen, previewViewport, step])

  useEffect(() => {
    const defaults = step === 0
      ? { section: selectedTemplate === 'food' ? 'menu' : 'hero', label: selectedTemplate === 'food' ? (lang === 'pt' ? 'Hero e cardápio' : 'Hero and menu') : (lang === 'pt' ? 'Hero e identidade' : 'Hero and identity') }
      : step === 1
        ? { section: selectedTemplate === 'food' ? 'menu' : 'services', label: selectedTemplate === 'food' ? (lang === 'pt' ? 'Menu e destaques' : 'Menu and highlights') : (lang === 'pt' ? 'Serviços em destaque' : 'Featured services') }
        : step === 2
          ? { section: selectedTemplate === 'food' ? 'menu' : 'gallery', label: selectedTemplate === 'food' ? (lang === 'pt' ? 'Fotos do hero, cardápio e galeria' : 'Hero, menu and gallery photos') : (lang === 'pt' ? 'Fotos e galeria' : 'Photos and gallery') }
          : { section: 'contact', label: lang === 'pt' ? 'Prévia final' : 'Final preview' }

    setPreviewFocusSection(defaults.section)
    setPreviewFocusLabel(defaults.label)
  }, [lang, selectedTemplate, step])

  const livePreviewStage = step === 0
    ? (lang === 'pt' ? 'Identidade, proposta e contacto começam a aparecer.' : lang === 'es' ? 'La identidad, propuesta y contacto ya empiezan a aparecer.' : lang === 'fr' ? 'L’identité, la proposition et le contact commencent déjà à apparaître.' : 'Identity, positioning and contact already start to appear.')
    : step === 1
    ? (lang === 'pt' ? 'Agora a oferta ganha cards, preço e ordem de leitura.' : lang === 'es' ? 'Ahora la oferta gana cards, precio y orden de lectura.' : lang === 'fr' ? 'L’offre gagne maintenant des cartes, un prix et un ordre de lecture.' : 'Now the offer gains cards, pricing and reading order.')
    : step === 2
    ? (lang === 'pt' ? 'As fotos entram nos blocos certos e mudam completamente a percepção.' : lang === 'es' ? 'Las fotos entran en los bloques correctos y cambian por completo la percepción.' : lang === 'fr' ? 'Les photos entrent dans les bons blocs et changent complètement la perception.' : 'Photos flow into the right blocks and completely change the feel.')
    : (lang === 'pt' ? 'Aqui o cliente sente a landing quase pronta antes de publicar.' : lang === 'es' ? 'Aquí el cliente siente la landing casi lista antes de publicar.' : lang === 'fr' ? 'Ici le client ressent la landing presque prête avant publication.' : 'Here the client feels the landing nearly finished before publishing.')

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-gold/5 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl border border-stone-100 shadow-xl p-8 text-center max-w-sm">
          <div className="w-12 h-12 border-4 border-gold/30 border-t-gold rounded-full animate-spin mx-auto mb-4" />
          <h1 className="text-xl font-black text-navy">Preparing your secure setup</h1>
          <p className="text-sm text-gray-500 mt-2">Checking your account before opening the page builder.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-gold/5">
      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-navy/95 border-b border-white/10 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gold rounded-full flex items-center justify-center">
              <ThumbsUp className="w-3.5 h-3.5 text-navy" />
            </div>
            <div>
              <span className="text-white font-bold leading-none">Vitrine</span>
              <p className="hidden sm:block text-[10px] text-gray-400 font-bold uppercase tracking-wider">{t.headerHint}</p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1">
              {LANGUAGE_OPTIONS.map((option) => (
                <button
                  key={option.code}
                  type="button"
                  onClick={() => setLang(option.code)}
                  title={option.label}
                  className={`h-8 min-w-8 rounded-full px-2 text-xs font-black uppercase transition-all ${
                    lang === option.code
                      ? 'bg-gold text-navy shadow-lg shadow-gold/20'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {option.code}
                </button>
              ))}
            </div>
            <Link href="/" className="text-gray-400 hover:text-white text-sm transition-colors">
              {t.home} →
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1800px] px-4 py-8">
        <div className="sm:hidden mb-5 flex items-center justify-between rounded-2xl border border-stone-200 bg-white p-2 shadow-sm">
          <span className="pl-2 text-xs font-black text-navy uppercase tracking-wider">{t.headerHint}</span>
          <div className="flex items-center gap-1">
            {LANGUAGE_OPTIONS.map((option) => (
              <button
                key={option.code}
                type="button"
                onClick={() => setLang(option.code)}
                title={option.label}
                className={`h-8 min-w-8 rounded-full px-2 text-xs font-black uppercase transition-all ${lang === option.code ? 'bg-gold text-navy' : 'bg-stone-100 text-gray-500'}`}
              >
                {option.code}
              </button>
            ))}
          </div>
        </div>
        {/* Progress steps */}
        <div className="mb-10">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 -z-10" />
            <div
              className="absolute top-4 left-0 h-0.5 bg-gold -z-10 transition-all duration-500"
              style={{ width: `${(step / (steps.length - 1)) * 100}%` }}
            />
            {steps.map((s, i) => (
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

        <div className="mx-auto max-w-5xl">
            {/* Step content */}
            <div className="bg-white rounded-[2rem] shadow-xl shadow-stone-200/60 border border-stone-100 p-6 sm:p-8">
              <div className="mb-6 flex flex-col gap-4 rounded-[1.5rem] border border-stone-200 bg-[radial-gradient(circle_at_top_left,_rgba(212,175,55,0.18),_transparent_45%),linear-gradient(180deg,_#fffdf8_0%,_#ffffff_100%)] p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-gold">{lang === 'pt' ? 'Fluxo guiado por bloco' : lang === 'es' ? 'Flujo guiado por bloque' : lang === 'fr' ? 'Flux guidé par bloc' : 'Block-by-block flow'}</p>
                  <p className="mt-1 text-sm text-gray-500">{lang === 'pt' ? 'Agora o setup fica limpo: um bloco de cada vez, com botão Mostrar para abrir a landing protagonista só quando fizer sentido.' : lang === 'es' ? 'Ahora el setup queda más limpio: un bloque por vez, con botón Mostrar para abrir la landing protagonista solo cuando haga sentido.' : lang === 'fr' ? 'Le setup reste maintenant plus clair : un bloc à la fois, avec un bouton Montrer pour ouvrir la landing en mode protagoniste seulement quand nécessaire.' : 'The setup now stays cleaner: one block at a time, with a Show button that opens the landing as the protagonist only when it matters.'}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-white px-3 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-navy">
                    <Eye className="h-3.5 w-3.5 text-gold" />
                    {lang === 'pt' ? `Bloco ativo: ${previewFocusLabel}` : lang === 'es' ? `Bloque activo: ${previewFocusLabel}` : lang === 'fr' ? `Bloc actif : ${previewFocusLabel}` : `Active block: ${previewFocusLabel}`}
                  </span>
                  <button
                    type="button"
                    onClick={() => openPreviewSpotlight(previewFocusSection ?? 'hero', previewFocusLabel)}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-navy px-4 py-2 text-sm font-black text-white hover:bg-navy/90 transition-colors"
                  >
                    {lang === 'pt' ? 'Abrir landing protagonista' : lang === 'es' ? 'Abrir landing protagonista' : lang === 'fr' ? 'Ouvrir la landing protagoniste' : 'Open hero preview'}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {step === 0 && (
            <div className="space-y-6">
                <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-navy via-slate-900 to-slate-800 p-6 text-white shadow-2xl shadow-navy/15">
                  <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-gold/20 blur-3xl" />
                  <div className="relative">
                    <div className="inline-flex items-center gap-2 rounded-full border border-gold/20 bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-gold">
                      <Sparkles className="h-3.5 w-3.5" />
                      {t.welcome}
                    </div>
                    <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">{t.step0Title}</h2>
                    <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-300">{t.step0Text}</p>
                    <div className="mt-6 grid gap-3 sm:grid-cols-3">
                      {[
                        lang === 'pt' ? '1. Nome e categoria definem o hero da landing' : lang === 'es' ? '1. Nombre y categoría definen el hero de la landing' : lang === 'fr' ? '1. Le nom et la catégorie définissent le hero de la landing' : '1. Name and category define the landing hero',
                        lang === 'pt' ? '2. Descrição organiza a proposta e o bloco sobre' : lang === 'es' ? '2. La descripción organiza la propuesta y el bloque sobre' : lang === 'fr' ? '2. La description organise la proposition et le bloc à propos' : '2. Description shapes the value proposition and about block',
                        lang === 'pt' ? '3. Contacto entra depois, já com intenção clara de ação' : lang === 'es' ? '3. El contacto entra después, ya con intención clara de acción' : lang === 'fr' ? '3. Le contact vient ensuite, avec une intention d’action claire' : '3. Contact comes after that, with a clearer action intent',
                      ].map((item) => (
                        <div key={item} className="rounded-2xl border border-white/10 bg-white/10 p-4 text-sm text-slate-200">
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div onFocusCapture={() => activatePreviewFocus('hero', lang === 'pt' ? 'Nome e categoria' : 'Name and category')} className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-xl shadow-stone-200/50">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-gold">{lang === 'pt' ? 'Base da landing' : lang === 'es' ? 'Base de la landing' : lang === 'fr' ? 'Base de la landing' : 'Landing foundation'}</p>
                      <h3 className="mt-2 text-2xl font-black text-navy">{lang === 'pt' ? 'Primeiro: nome e categoria' : lang === 'es' ? 'Primero: nombre y categoría' : lang === 'fr' ? 'D’abord : nom et catégorie' : 'First: name and category'}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-gray-500">{lang === 'pt' ? 'Este bloco define o topo da landing, o tom da página e o template que será usado.' : lang === 'es' ? 'Este bloque define la parte superior de la landing, el tono de la página y el template que se usará.' : lang === 'fr' ? 'Ce bloc définit le haut de la landing, le ton de la page et le template utilisé.' : 'This block defines the top of the landing, the page tone and the template that will be used.'}</p>
                    </div>
                    <button type="button" onClick={() => openPreviewSpotlight('hero', lang === 'pt' ? 'Nome e categoria' : 'Name and category')} className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-2 text-[11px] font-black text-navy hover:bg-gold/20 transition-colors">{previewJumpLabel}</button>
                  </div>

                  <div className="mt-5">
                    <div className="space-y-4">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">{t.businessName}</label>
                        <p className="mb-2 text-xs text-gray-500">{lang === 'pt' ? 'Vai para o hero, navegação e assinatura final da landing.' : lang === 'es' ? 'Va al hero, navegación y firma final de la landing.' : lang === 'fr' ? 'Va dans le hero, la navigation et la signature finale de la landing.' : 'Shows in the hero, navigation and final signature.'}</p>
                        <input
                          type="text"
                          value={businessName}
                          onChange={(e) => {
                            setBusinessName(e.target.value)
                            if (nameError) setNameError('')
                          }}
                          {...bindPreviewFocus('hero', lang === 'pt' ? 'Nome do negócio' : 'Business name')}
                          placeholder={t.businessNamePlaceholder}
                          className={`w-full rounded-2xl border px-4 py-3.5 focus:outline-none focus:border-gold transition-colors ${nameError ? 'border-red-300 bg-red-50/40' : 'border-gray-200'}`}
                        />
                        {nameError ? <p className="mt-2 text-xs font-semibold text-red-500">{nameError}</p> : null}
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">{lang === 'pt' ? 'Subtítulo rápido' : lang === 'es' ? 'Subtítulo rápido' : lang === 'fr' ? 'Sous-titre rapide' : 'Quick subtitle'}</label>
                        <p className="mb-2 text-xs text-gray-500">{lang === 'pt' ? 'Pequena linha logo abaixo do nome. Ex.: especialidade, zona ou promessa curta.' : lang === 'es' ? 'Pequeña línea justo debajo del nombre. Ej.: especialidad, zona o promesa corta.' : lang === 'fr' ? 'Petite ligne juste sous le nom. Ex. : spécialité, quartier ou promesse courte.' : 'Short line below the name. Example: specialty, neighborhood or quick promise.'}</p>
                        <input
                          type="text"
                          value={subtitle}
                          onChange={(e) => setSubtitle(e.target.value)}
                          {...bindPreviewFocus('hero', lang === 'pt' ? 'Subtítulo do hero' : 'Hero subtitle')}
                          maxLength={90}
                          placeholder={lang === 'pt' ? 'Ex.: Coloração premium no centro do Porto' : lang === 'es' ? 'Ej.: Coloración premium en el centro' : lang === 'fr' ? 'Ex. : Coloration premium au centre-ville' : 'e.g. Premium studio in downtown'}
                          className="w-full rounded-2xl border border-gray-200 px-4 py-3.5 focus:outline-none focus:border-gold transition-colors"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">{t.category}</label>
                        <p className="mb-2 text-xs text-gray-500">{lang === 'pt' ? 'A categoria escolhe a estrutura principal da landing antes de montar os próximos blocos.' : lang === 'es' ? 'La categoría elige la estructura principal de la landing antes de montar los siguientes bloques.' : lang === 'fr' ? 'La catégorie choisit la structure principale de la landing avant les prochains blocs.' : 'The category chooses the main landing structure before the next blocks are built.'}</p>
                        <select
                          value={category}
                          onChange={(e) => handleCategoryChange(e.target.value)}
                          {...bindPreviewFocus('hero', lang === 'pt' ? 'Categoria da landing' : 'Landing category')}
                          className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 focus:outline-none focus:border-gold transition-colors"
                        >
                          {CATEGORY_GROUPS.map((group) => (
                            <optgroup key={group.template} label={categoryGroupTitle(group.template)}>
                              {getCategoriesByTemplate(group.template).map((option) => (
                                <option key={`${group.template}-${option.value}`} value={option.value}>{categoryLabel(option.value)}</option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div onFocusCapture={() => activatePreviewFocus('about', lang === 'pt' ? 'Proposta e descrição' : 'Positioning and description')} className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-xl shadow-stone-200/50">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-gold">{lang === 'pt' ? 'Bloco sobre o negócio' : lang === 'es' ? 'Bloque sobre el negocio' : lang === 'fr' ? 'Bloc à propos de l’entreprise' : 'About block'}</p>
                      <h3 className="mt-2 text-2xl font-black text-navy">{lang === 'pt' ? 'Depois: proposta e contexto' : lang === 'es' ? 'Después: propuesta y contexto' : lang === 'fr' ? 'Ensuite : proposition et contexte' : 'Then: positioning and context'}</h3>
                    </div>
                    <button type="button" onClick={() => openPreviewSpotlight('about', lang === 'pt' ? 'Proposta e descrição' : 'Positioning and description')} className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-2 text-[11px] font-black text-navy hover:bg-gold/20 transition-colors">{previewJumpLabel}</button>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-gray-500">{lang === 'pt' ? 'Aqui o cliente entende o que você faz, para quem é e por que vale a pena continuar lendo.' : lang === 'es' ? 'Aquí el cliente entiende qué haces, para quién es y por qué vale la pena seguir leyendo.' : lang === 'fr' ? 'Ici le client comprend ce que vous faites, pour qui et pourquoi il vaut la peine de continuer.' : 'Here customers understand what you do, who it is for and why it is worth reading on.'}</p>

                  <div className="mt-5">
                    <label className="mb-1 block text-sm font-medium text-gray-700">{t.shortDescription}</label>
                    <p className="mb-2 text-xs text-gray-500">{lang === 'pt' ? 'Este texto aparece logo depois do hero, no bloco que sustenta a proposta da landing.' : lang === 'es' ? 'Este texto aparece justo después del hero, en el bloque que sostiene la propuesta de la landing.' : lang === 'fr' ? 'Ce texte apparaît juste après le hero, dans le bloc qui soutient la proposition de la landing.' : 'This text appears right after the hero, in the block that supports the landing proposition.'}</p>
                    <textarea
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      {...bindPreviewFocus('about', lang === 'pt' ? 'Descrição da landing' : 'Landing description')}
                      placeholder={t.descriptionPlaceholder}
                      className="w-full rounded-2xl border border-gray-200 px-4 py-3.5 focus:outline-none focus:border-gold transition-colors"
                    />
                  </div>
                </div>

                <div onFocusCapture={() => activatePreviewFocus('contact', lang === 'pt' ? 'Contacto e decisão' : 'Contact and decision')} className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-xl shadow-stone-200/50">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-gold">{lang === 'pt' ? 'Decisão e contacto' : lang === 'es' ? 'Decisión y contacto' : lang === 'fr' ? 'Décision et contact' : 'Decision and contact'}</p>
                      <h3 className="mt-2 text-2xl font-black text-navy">{lang === 'pt' ? 'Como o cliente vai agir no fim da página' : lang === 'es' ? 'Cómo actuará el cliente al final de la página' : lang === 'fr' ? 'Comment le client agira en fin de page' : 'How customers act at the end of the page'}</h3>
                    </div>
                    <button type="button" onClick={() => openPreviewSpotlight('contact', lang === 'pt' ? 'Contacto e decisão' : 'Contact and decision')} className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-2 text-[11px] font-black text-navy hover:bg-gold/20 transition-colors">{previewJumpLabel}</button>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-gray-500">{t.actionText}</p>

                  <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">{t.address}</label>
                      <p className="mb-2 text-xs text-gray-500">{lang === 'pt' ? 'Vai para a área de contacto e localização da landing.' : lang === 'es' ? 'Va al área de contacto y ubicación de la landing.' : lang === 'fr' ? 'Va dans la zone contact et localisation de la landing.' : 'Shows in the contact and location area.'}</p>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        {...bindPreviewFocus('contact', lang === 'pt' ? 'Morada e contacto' : 'Address and contact')}
                        placeholder={t.addressPlaceholder}
                        className="w-full rounded-2xl border border-gray-200 px-4 py-3.5 focus:outline-none focus:border-gold transition-colors"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">{t.phone}</label>
                      <p className="mb-2 text-xs text-gray-500">{lang === 'pt' ? 'Reforça confiança e pode aparecer no rodapé ou contacto final.' : lang === 'es' ? 'Refuerza confianza y puede aparecer en el pie o contacto final.' : lang === 'fr' ? 'Renforce la confiance et peut apparaître dans le footer ou le contact final.' : 'Adds trust and may appear in the footer or final contact area.'}</p>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        {...bindPreviewFocus('contact', lang === 'pt' ? 'Telefone e contacto' : 'Phone and contact')}
                        placeholder="+351 912 345 678"
                        className="w-full rounded-2xl border border-gray-200 px-4 py-3.5 focus:outline-none focus:border-gold transition-colors"
                      />
                    </div>
                  </div>

                  <div className="mt-6 rounded-[1.75rem] border border-gold/30 bg-gradient-to-br from-[#fffaf0] to-white p-5 shadow-sm">
                    <p className="text-xs font-black text-gold uppercase tracking-wider mb-2">{t.actionEyebrow}</p>
                    <h3 className="text-xl font-black text-navy mb-2">{t.actionTitle}</h3>
                    <p className="mb-5 text-sm leading-relaxed text-gray-500">{t.actionText}</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
                      {[
                        { id: 'whatsapp' as ContactMethod, icon: MessageCircle, title: t.whatsapp, hint: t.whatsappHint },
                        { id: 'booking' as ContactMethod, icon: Link2, title: t.booking, hint: t.bookingHint },
                        { id: 'email' as ContactMethod, icon: Mail, title: t.emailContact, hint: t.emailHint },
                      ].map((method) => {
                        const Icon = method.icon
                        const selected = contactMethodSelected(method.id)
                        return (
                          <button
                            key={method.id}
                            type="button"
                            onClick={() => { activatePreviewFocus('contact', lang === 'pt' ? 'Contacto e botões' : 'Contact and actions'); toggleContactMethod(method.id) }}
                            className={`group rounded-2xl border p-4 text-left transition-all ${selected ? 'border-gold bg-gold/10 ring-2 ring-gold/20 shadow-lg shadow-gold/10' : 'border-stone-200 bg-white hover:border-gold/40 hover:-translate-y-0.5'}`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${selected ? 'bg-gold text-navy' : 'bg-navy/5 text-navy group-hover:bg-gold/10'}`}>
                                <Icon className="w-5 h-5" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="font-black text-navy">{method.title}</p>
                                  {selected ? <Check className="w-4 h-4 text-gold" /> : null}
                                </div>
                                <div className="mt-2 flex items-start gap-1.5 text-xs leading-relaxed text-gray-500">
                                  <Info className="w-3.5 h-3.5 text-gold flex-shrink-0 mt-0.5" />
                                  <span>{method.hint}</span>
                                </div>
                              </div>
                            </div>
                          </button>
                        )
                      })}
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {contactMethodSelected('whatsapp') ? (
                        <div className="rounded-2xl border border-stone-200 bg-white p-4">
                          <label className="block text-sm font-bold text-gray-700 mb-1">{t.whatsapp}</label>
                          <p className="mb-2 text-xs text-gray-500">{lang === 'pt' ? 'Botão direto na hero, secção de contacto e CTA final.' : lang === 'es' ? 'Botón directo en el hero, contacto y CTA final.' : lang === 'fr' ? 'Bouton direct dans le hero, le contact et le CTA final.' : 'Direct button in the hero, contact section and final CTA.'}</p>
                          <input
                            type="tel"
                            value={whatsappNumber}
                            onChange={(e) => setWhatsappNumber(e.target.value)}
                            {...bindPreviewFocus('contact', lang === 'pt' ? 'WhatsApp na landing' : 'WhatsApp on landing')}
                            placeholder="+351 912 345 678"
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:border-gold transition-colors bg-white"
                          />
                          <div className="mt-4 rounded-2xl bg-navy/5 p-4">
                            <div className="mb-2 flex items-start gap-2">
                              <Info className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                              <p className="text-sm leading-relaxed text-gray-600">{t.whatsappMessageInfo}</p>
                            </div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">{t.whatsappMessage}</label>
                            <textarea
                              rows={2}
                              maxLength={500}
                              value={whatsappMessage}
                              onChange={(e) => setWhatsappMessage(e.target.value)}
                              {...bindPreviewFocus('contact', lang === 'pt' ? 'Mensagem do WhatsApp' : 'WhatsApp message')}
                              placeholder="Olá! Vim pela página e gostaria de saber mais."
                              className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:border-gold transition-colors bg-white"
                            />
                            <p className="mt-1 text-right text-xs text-gray-400">{whatsappMessage.length}/500</p>
                          </div>
                        </div>
                      ) : null}

                      {contactMethodSelected('booking') ? (
                        <div className="rounded-2xl border border-stone-200 bg-white p-4">
                          <label className="block text-sm font-bold text-gray-700 mb-1">{t.booking}</label>
                          <p className="mb-2 text-xs text-gray-500">{lang === 'pt' ? 'Vira o CTA principal quando o objetivo é reserva, agendamento ou orçamento.' : lang === 'es' ? 'Se convierte en el CTA principal cuando el objetivo es reserva, cita o presupuesto.' : lang === 'fr' ? 'Devient le CTA principal quand l’objectif est une réservation, un rendez-vous ou un devis.' : 'Becomes the main CTA when the goal is booking, scheduling or requesting a quote.'}</p>
                          <input
                            type="text"
                            value={bookingUrl}
                            onChange={(e) => setBookingUrl(e.target.value)}
                            {...bindPreviewFocus('contact', lang === 'pt' ? 'Botão principal de reserva' : 'Primary booking button')}
                            placeholder="https://calendly.com/yourname"
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:border-gold transition-colors bg-white"
                          />
                        </div>
                      ) : null}

                      {contactMethodSelected('email') ? (
                        <div className="rounded-2xl border border-stone-200 bg-white p-4">
                          <label className="block text-sm font-bold text-gray-700 mb-1">{t.emailContact}</label>
                          <p className="mb-2 text-xs text-gray-500">{lang === 'pt' ? 'Aparece como alternativa mais formal para quem não quer WhatsApp nem booking imediato.' : lang === 'es' ? 'Aparece como alternativa más formal para quien no quiere WhatsApp ni reserva inmediata.' : lang === 'fr' ? 'Apparaît comme alternative plus formelle pour ceux qui ne veulent ni WhatsApp ni réservation immédiate.' : 'Appears as a more formal alternative for customers who do not want WhatsApp or instant booking.'}</p>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            {...bindPreviewFocus('contact', lang === 'pt' ? 'Email público' : 'Public email')}
                            placeholder="hello@yourbusiness.com"
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:border-gold transition-colors bg-white"
                          />
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>

                {selectedTemplate === 'food' ? (
                  <div onFocusCapture={() => activatePreviewFocus('menu', lang === 'pt' ? 'Menu completo' : 'Full menu')} className="rounded-[2rem] border border-orange-200 bg-orange-50/60 p-6 shadow-xl shadow-orange-100/40">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-gold">{t.menuEyebrow}</p>
                    <h3 className="mt-2 text-2xl font-black text-navy">{t.menuTitle}</h3>
                    <p className="mt-2 text-sm text-gray-500">{t.menuText}</p>
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-start">
                      <input
                        type="text"
                        value={menuUrl}
                        onChange={(e) => setMenuUrl(e.target.value)}
                        {...bindPreviewFocus('menu', lang === 'pt' ? 'Link do menu' : 'Menu link')}
                        placeholder="https://your-business.com/menu or delivery menu link"
                        className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 focus:outline-none focus:border-gold transition-colors"
                      />
                      <button
                        type="button"
                        onFocus={() => activatePreviewFocus('menu', lang === 'pt' ? 'Imagem do menu' : 'Menu image')}
                        onClick={() => {
                          activatePreviewFocus('menu', lang === 'pt' ? 'Imagem do menu' : 'Menu image')
                          menuImageInputRef.current?.click()
                        }}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gold/30 bg-white px-4 py-3.5 font-bold text-navy hover:bg-gold/10 transition-colors"
                      >
                        <Upload className="w-4 h-4 text-gold" />
                        {t.uploadMenu}
                      </button>
                    </div>
                    <input ref={menuImageInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleSlotFile(e.target.files[0], setMenuImageUrl)} />
                    {menuImageUrl ? (
                      <div className="mt-4 max-w-xs rounded-2xl overflow-hidden border border-orange-100 bg-white p-2">
                        <div className="relative h-40 w-full overflow-hidden rounded-xl">
                          <Image src={menuImageUrl} alt="Full menu preview" fill className="object-cover" unoptimized={menuImageUrl.startsWith('data:')} sizes="320px" />
                        </div>
                        <button type="button" onClick={() => setMenuImageUrl('')} className="mt-2 text-xs font-bold text-red-500 hover:underline">{t.removeMenu}</button>
                      </div>
                    ) : null}
                  </div>
                ) : null}

            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
                <div onFocusCapture={() => activatePreviewFocus(selectedTemplate === 'food' ? 'menu' : 'services', selectedTemplate === 'food' ? (lang === 'pt' ? 'Menu e destaque' : 'Menu and highlight') : (lang === 'pt' ? 'Serviços e oferta' : 'Services and offer'))} className="rounded-[2rem] bg-gradient-to-br from-navy via-slate-900 to-slate-800 p-6 text-white shadow-2xl shadow-navy/15">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-gold">{selectedTemplate === 'food' ? t.foodServicesTitle : t.servicesTitle}</p>
                      <h2 className="mt-2 text-3xl font-black tracking-tight">{lang === 'pt' ? 'Monte a oferta que o cliente vai comparar' : lang === 'es' ? 'Monta la oferta que el cliente va a comparar' : lang === 'fr' ? 'Construisez l’offre que le client va comparer' : 'Build the offer customers will compare'}</h2>
                    </div>
                    <button type="button" onClick={() => openPreviewSpotlight(selectedTemplate === 'food' ? 'menu' : 'services', selectedTemplate === 'food' ? 'Menu' : 'Services')} className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-white/10 px-3 py-2 text-[11px] font-black text-white hover:bg-white/15 transition-colors">{previewJumpLabel}</button>
                  </div>
                  <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-300">
                    {selectedTemplate === 'food'
                      ? (lang === 'pt' ? 'Aqui você organiza os pratos ou itens que aparecem logo depois do hero. Nome, preço, descrição e foto precisam fazer sentido juntos.' : t.foodServicesText)
                      : selectedTemplate === 'technical'
                      ? t.technicalServicesText
                      : t.servicesText}
                  </p>
                </div>

                <div onFocusCapture={() => activatePreviewFocus(selectedTemplate === 'food' ? 'menu' : 'services', selectedTemplate === 'food' ? (lang === 'pt' ? 'Cards do menu' : 'Menu cards') : (lang === 'pt' ? 'Cards de serviços' : 'Service cards'))} className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-xl shadow-stone-200/50">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-gold">{lang === 'pt' ? 'Cards da landing' : lang === 'es' ? 'Cards de la landing' : lang === 'fr' ? 'Cartes de la landing' : 'Landing cards'}</p>
                      <h3 className="mt-1 text-2xl font-black text-navy">{selectedTemplate === 'food' ? t.menuHighlights : t.services}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                    <button type="button" onClick={() => openPreviewSpotlight(selectedTemplate === 'food' ? 'menu' : 'services', selectedTemplate === 'food' ? 'Menu' : 'Services')} className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-2 text-[11px] font-black text-navy hover:bg-gold/20 transition-colors">{previewJumpLabel}</button>
                    <button onClick={() => { activatePreviewFocus(selectedTemplate === 'food' ? 'menu' : 'services', selectedTemplate === 'food' ? (lang === 'pt' ? 'Novo item do menu' : 'New menu item') : (lang === 'pt' ? 'Novo serviço' : 'New service')); addService() }} className="inline-flex items-center gap-1 rounded-full border border-gold/30 bg-gold/10 px-4 py-2 text-sm font-black text-navy hover:bg-gold/20 transition-colors">
                      <Plus className="w-4 h-4" />
                      {selectedTemplate === 'food' ? t.addMenuItem : t.addService}
                    </button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {services.map((svc, i) => (
                      <div key={i} className="rounded-[1.5rem] border border-gray-200 bg-gradient-to-br from-white via-white to-stone-50/80 p-5 transition-colors hover:border-gold/40">
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <p className="text-xs font-black uppercase tracking-[0.16em] text-gray-400">{lang === 'pt' ? `Item ${i + 1}` : lang === 'es' ? `Item ${i + 1}` : lang === 'fr' ? `Élément ${i + 1}` : `Item ${i + 1}`}</p>
                          <button onClick={() => removeService(i)} className="rounded-full p-2 text-gray-300 hover:text-red-400 transition-colors" aria-label="Remove item">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[112px_1fr] lg:items-start">
                          <div>
                            {svc.photo ? (
                              <div className="relative h-28 w-28 overflow-hidden rounded-2xl bg-stone-100">
                                <Image src={svc.photo} alt={svc.name || 'Service photo'} fill className="object-cover" unoptimized={svc.photo.startsWith('data:')} sizes="112px" />
                                <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/0 opacity-0 transition-all hover:bg-black/35 hover:opacity-100">
                                  <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-navy">Change</span>
                                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleServicePhoto(i, e.target.files?.[0] ?? null)} />
                                </label>
                              </div>
                            ) : (
                              <label className="flex h-28 w-28 cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-gold/30 bg-gold/5 px-2 text-center transition-colors hover:bg-gold/10">
                                <Upload className="w-5 h-5 text-gold" />
                                <span className="text-[11px] font-bold leading-tight text-gold">{selectedTemplate === 'food' ? t.dishPhoto : (lang === 'pt' ? 'Foto do serviço' : lang === 'es' ? 'Foto del servicio' : lang === 'fr' ? 'Photo du service' : 'Service photo')}</span>
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleServicePhoto(i, e.target.files?.[0] ?? null)} />
                              </label>
                            )}
                          </div>

                          <div className="space-y-3">
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_140px]">
                              <input
                                type="text"
                                value={svc.name}
                                onChange={(e) => updateService(i, 'name', e.target.value)}
                                {...bindPreviewFocus(selectedTemplate === 'food' ? 'menu' : 'services', lang === 'pt' ? `Card ${i + 1}` : `Card ${i + 1}`)}
                                placeholder={selectedTemplate === 'food' ? t.menuItemName : t.serviceName}
                                className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-gold transition-colors"
                              />
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">€</span>
                                <input
                                  type="number"
                                  value={svc.price}
                                  onChange={(e) => updateService(i, 'price', e.target.value)}
                                  {...bindPreviewFocus(selectedTemplate === 'food' ? 'menu' : 'services', lang === 'pt' ? `Preço do item ${i + 1}` : `Item ${i + 1} price`)}
                                  placeholder="0"
                                  aria-label={t.price}
                                  className="w-full rounded-xl border border-gray-200 pl-7 pr-3 py-2.5 text-sm focus:outline-none focus:border-gold transition-colors"
                                />
                              </div>
                            </div>
                            <textarea
                              rows={2}
                              value={svc.description ?? ''}
                              onChange={(e) => updateService(i, 'description', e.target.value)}
                              {...bindPreviewFocus(selectedTemplate === 'food' ? 'menu' : 'services', lang === 'pt' ? `Descrição do item ${i + 1}` : `Item ${i + 1} description`)}
                              placeholder={selectedTemplate === 'food' ? t.foodDescription : t.serviceDescription}
                              className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm leading-relaxed focus:outline-none focus:border-gold transition-colors"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div onFocusCapture={() => activatePreviewFocus('contact', lang === 'pt' ? 'Horários e contacto' : 'Hours and contact')} className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-xl shadow-stone-200/50">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-gold">{lang === 'pt' ? 'Horários públicos' : lang === 'es' ? 'Horarios públicos' : lang === 'fr' ? 'Horaires publics' : 'Public hours'}</p>
                  <h3 className="mt-1 text-2xl font-black text-navy">{lang === 'pt' ? 'O cliente também decide pelo horário' : lang === 'es' ? 'El cliente también decide por el horario' : lang === 'fr' ? 'Le client décide aussi selon les horaires' : 'Customers also decide based on opening hours'}</h3>
                  <div className="mt-5 space-y-3">
                    {hours.map((h, i) => (
                      <div key={i} className="flex flex-col gap-3 rounded-2xl border border-stone-100 bg-stone-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                          <button onClick={() => toggleDay(i)} className={`flex h-6 w-6 items-center justify-center rounded-md border-2 transition-all ${h.open ? 'border-gold bg-gold' : 'border-gray-300 bg-white'}`}>
                            {h.open ? <Check className="h-3 w-3 text-navy" /> : null}
                          </button>
                          <span className="w-28 text-sm font-medium text-gray-700">{h.day}</span>
                        </div>
                        {h.open ? (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <input
                              type="time"
                              value={h.from}
                              onChange={(e) => setHours(hours.map((hh, idx) => (idx === i ? { ...hh, from: e.target.value } : hh)))}
                              {...bindPreviewFocus('contact', lang === 'pt' ? `Horário de ${h.day}` : `${h.day} hours`)}
                              className="rounded-lg border border-gray-200 px-2 py-1 text-sm focus:outline-none focus:border-gold"
                            />
                            <span>–</span>
                            <input
                              type="time"
                              value={h.to}
                              onChange={(e) => setHours(hours.map((hh, idx) => (idx === i ? { ...hh, to: e.target.value } : hh)))}
                              {...bindPreviewFocus('contact', lang === 'pt' ? `Horário de ${h.day}` : `${h.day} hours`)}
                              className="rounded-lg border border-gray-200 px-2 py-1 text-sm focus:outline-none focus:border-gold"
                            />
                          </div>
                        ) : (
                          <span className="text-sm text-red-400">{t.closed}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
            </div>
          )}

          {step === 2 && (
            <div>
                <div className="mb-2 flex items-start justify-between gap-4">
                  <h2 className="text-2xl font-bold text-navy">
                    {selectedTemplate === 'food' ? t.foodPhotosTitle : t.photosTitle}
                  </h2>
                  <button type="button" onClick={() => openPreviewSpotlight('gallery', lang === 'pt' ? 'Fotos e galeria' : 'Photos and gallery')} className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-2 text-[11px] font-black text-navy hover:bg-gold/20 transition-colors">{previewJumpLabel}</button>
                </div>
                <p className="text-gray-400 text-sm mb-8">
                  {selectedTemplate === 'food' ? t.foodPhotosText : t.photosText}
                </p>

                {/* Hidden file inputs — one per slot */}
                <input ref={heroInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleSlotFile(e.target.files[0], setHeroPhoto)} />
                <input ref={aboutInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleSlotFile(e.target.files[0], setAboutPhoto)} />
                <input ref={galleryInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleGalleryFiles(e.target.files)} />

                <div className="space-y-5">
                {/* ── Slot 1: Hero Photo ── */}
                <div onFocusCapture={() => activatePreviewFocus('hero', lang === 'pt' ? 'Foto principal' : 'Hero photo')} className="border border-gray-200 rounded-2xl p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-gold font-black text-sm">1</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center flex-wrap gap-2 mb-1">
                        <h3 className="font-bold text-navy">{selectedTemplate === 'food' ? t.foodHeroPhoto : t.heroPhoto}</h3>
                        <span className="bg-gold text-navy text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {t.heroBadge}
                        </span>
                      </div>
                      <p className="text-gray-400 text-xs mb-4">
                        {selectedTemplate === 'food'
                          ? t.foodHeroHint
                          : t.heroHint}
                      </p>
                      {heroPhoto ? (
                        <div className="relative w-full h-36 rounded-xl overflow-hidden group">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={heroPhoto} alt="Hero photo" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button onClick={() => heroInputRef.current?.click()} className="bg-white text-navy text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-gold transition-colors">
                              {t.change}
                            </button>
                            <button onClick={() => setHeroPhoto('')} className="bg-red-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-red-600 transition-colors">
                              {t.remove}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => heroInputRef.current?.click()}
                          className="flex items-center gap-3 border-2 border-dashed border-gray-200 rounded-xl px-5 py-4 w-full hover:border-gold/50 hover:bg-gray-50 transition-all text-left"
                        >
                          <Upload className="w-5 h-5 text-gray-300 flex-shrink-0" />
                          <span className="text-gray-400 text-sm">{t.uploadHero}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {selectedTemplate !== 'food' ? (
                <div onFocusCapture={() => activatePreviewFocus('about', lang === 'pt' ? 'Foto da secção sobre' : 'About photo')} className="border border-gray-200 rounded-2xl p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-navy/5 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-navy font-black text-sm">2</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center flex-wrap gap-2 mb-1">
                        <h3 className="font-bold text-navy">{t.aboutPhoto}</h3>
                        <span className="bg-navy text-gold text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {t.aboutBadge}
                        </span>
                      </div>
                      <p className="text-gray-400 text-xs mb-4">{t.aboutHint}</p>
                      {aboutPhoto ? (
                        <div className="relative w-full h-36 rounded-xl overflow-hidden group">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={aboutPhoto} alt="About photo" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button onClick={() => aboutInputRef.current?.click()} className="bg-white text-navy text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-gold transition-colors">
                              {t.change}
                            </button>
                            <button onClick={() => setAboutPhoto('')} className="bg-red-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-red-600 transition-colors">
                              {t.remove}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => aboutInputRef.current?.click()}
                          className="flex items-center gap-3 border-2 border-dashed border-gray-200 rounded-xl px-5 py-4 w-full hover:border-gold/50 hover:bg-gray-50 transition-all text-left"
                        >
                          <Upload className="w-5 h-5 text-gray-300 flex-shrink-0" />
                          <span className="text-gray-400 text-sm">{t.uploadAbout}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                ) : null}

                {/* ── Slot 3+: Gallery Photos ── */}
                <div onFocusCapture={() => activatePreviewFocus('gallery', lang === 'pt' ? 'Galeria ao vivo' : 'Live gallery')} className="border border-gray-200 rounded-2xl p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-gray-500 font-black text-xs">{selectedTemplate === 'food' ? '2+' : '3+'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center flex-wrap gap-2 mb-1">
                        <h3 className="font-bold text-navy">{selectedTemplate === 'food' ? t.foodGallery : t.gallery}</h3>
                        <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {selectedTemplate === 'food' ? t.foodGalleryBadge : t.galleryBadge}
                        </span>
                      </div>
                      <p className="text-gray-400 text-xs mb-4">
                        {selectedTemplate === 'food'
                          ? t.foodGalleryHint
                          : t.galleryHint}
                      </p>
                      {galleryPhotos.length > 0 && (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
                          {galleryPhotos.map((src, i) => (
                            <div key={i} className="relative group">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={src.startsWith('data:image/') || src.startsWith('https://') ? src : ''}
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
                          {galleryPhotos.length > 0 ? t.dragMore : selectedTemplate === 'food' ? t.dragFood : t.dragGallery}
                        </p>
                        <p className="text-gray-300 text-xs mt-1">{t.fileTypes}</p>
                      </div>
                    </div>
                  </div>
                </div>
                </div>
            </div>
          )}

          {step === 3 && (
            <div className="py-8">
              {!isGenerated ? (
                <div className="mx-auto max-w-3xl text-center xl:text-left">
                  <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center mx-auto xl:mx-0 mb-6">
                    <Sparkles className="w-10 h-10 text-gold" />
                  </div>
                  <h2 className="text-2xl font-bold text-navy mb-3">
                    {t.previewTitle}
                  </h2>
                  <p className="text-gray-500 mb-8">
                    {t.previewText}
                  </p>
                  <div className="mb-8 rounded-[2rem] border border-stone-200 bg-white p-6 shadow-xl shadow-stone-200/40 text-left">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-gold">{lang === 'pt' ? 'Publicação e retenção' : lang === 'es' ? 'Publicación y retención' : lang === 'fr' ? 'Publication et rétention' : 'Publishing and retention'}</p>
                        <h3 className="mt-2 text-2xl font-black text-navy">{lang === 'pt' ? 'Plano e prévia protegida' : lang === 'es' ? 'Plan y vista previa protegida' : lang === 'fr' ? 'Plan et aperçu protégé' : 'Plan and protected preview'}</h3>
                      </div>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-navy/5 px-3 py-1 text-[11px] font-black text-navy">
                        <Lock className="w-3 h-3" />
                        {lang === 'pt' ? 'Prévia protegida' : lang === 'es' ? 'Vista previa protegida' : lang === 'fr' ? 'Aperçu protégé' : 'Protected preview'}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {PLANS.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setPlan(p.id)}
                          className={`rounded-2xl border p-4 text-left transition-all ${plan === p.id ? 'border-gold bg-gold/10 ring-2 ring-gold/20' : 'border-gray-200 hover:border-gold/40'}`}
                        >
                          <p className="font-bold text-navy">{p.name}</p>
                          <p className="mt-1 text-sm font-semibold text-gold">{p.pages}</p>
                          <p className="mt-1 text-xs text-gray-400">{p.description}</p>
                        </button>
                      ))}
                    </div>
                    <div className="mt-3 rounded-2xl border border-dashed border-gold/40 bg-gold/5 p-4 flex items-start gap-3">
                      <Info className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                      <p className="text-sm leading-relaxed text-gray-500">{t.planNote}</p>
                    </div>
                  </div>
                  {generateError && (
                    <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 mb-6 text-sm max-w-md mx-auto">
                      {generateError}
                    </div>
                  )}
                  {aiPreviewError && (
                    <div className="bg-amber-50 border border-amber-200 text-amber-700 rounded-xl p-4 mb-6 text-sm max-w-md mx-auto">
                      {aiPreviewError}
                    </div>
                  )}
                  <div className="bg-gray-50 rounded-xl p-4 mb-8 text-left max-w-sm mx-auto">
                    <p className="text-xs text-gray-400 mb-1">{t.pageUrl}</p>
                    <p className="text-navy font-mono text-sm break-all">
                      /p/{pageSlug}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={openFullLivePreview}
                      className="flex items-center gap-2 justify-center bg-navy text-white px-8 py-3 rounded-full font-semibold hover:bg-navy/90 transition-colors"
                    >
                      {lang === 'pt' ? 'Ver página completa' : lang === 'es' ? 'Ver página completa' : lang === 'fr' ? 'Voir la page complète' : 'View full page'}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleAiPreview}
                      disabled={aiPreviewLoading}
                      className="flex items-center gap-2 justify-center border border-navy/10 bg-white px-8 py-3 rounded-full font-semibold text-navy hover:bg-stone-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {aiPreviewLoading ? (
                        <>
                          <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          {lang === 'pt' ? 'Analisando fotos...' : lang === 'es' ? 'Analizando fotos...' : lang === 'fr' ? 'Analyse des photos...' : 'Analyzing photos...'}
                        </>
                      ) : (
                        <>
                          {lang === 'pt' ? 'Prévia IA com fotos' : lang === 'es' ? 'Vista previa IA con fotos' : lang === 'fr' ? 'Aperçu IA avec photos' : 'AI preview from photos'}
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                    <button 
                      onClick={handleGeneratePage}
                      disabled={isGenerating}
                      className="bg-gold text-navy px-8 py-3 rounded-full font-bold hover:bg-yellow-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 justify-center"
                    >
                      {isGenerating ? (
                        <>
                          <span className="inline-block w-4 h-4 border-2 border-navy border-t-transparent rounded-full animate-spin" />
                          {t.generating}
                        </>
                      ) : (
                        <>{t.generate} 🚀</>
                      )}
                    </button>
                  </div>
                  {!sessionAvailable && (
                    <p className="mx-auto mt-4 max-w-xl text-xs leading-relaxed text-gray-500">
                      {lang === 'pt'
                        ? 'A prévia IA abre sem trocar de tela para login. Para publicar de verdade, entre na conta e clique em publicar.'
                        : lang === 'es'
                        ? 'La vista previa IA abre sin enviarte al login. Para publicar, entra en tu cuenta y pulsa publicar.'
                        : lang === 'fr'
                        ? 'L’aperçu IA s’ouvre sans vous renvoyer au login. Pour publier, connectez-vous puis publiez.'
                        : 'AI preview opens without sending you to login. To publish live, log in and publish.'}
                    </p>
                  )}
                </div>
              ) : (
                <>
                  <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check className="w-10 h-10 text-green-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-navy mb-3">
                    🎉 {t.successTitle}
                  </h2>
                  <p className="text-gray-500 mb-6">
                    {t.successText}
                  </p>
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-8 text-left max-w-sm mx-auto">
                    <p className="text-xs text-green-600 font-medium mb-2">✓ {t.liveAt}</p>
                    <p className="text-navy font-mono text-sm break-all">
                      {publicPageUrl || `/p/${pageSlug}`}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                      href={`/p/${pageSlug}`}
                      onClick={saveBusinessData}
                      className="flex items-center gap-2 justify-center bg-gold text-navy px-8 py-3 rounded-full font-bold hover:bg-yellow-400 transition-colors"
                    >
                      {t.viewPage}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <button 
                      onClick={handleCopyLink}
                      className="bg-navy text-white px-8 py-3 rounded-full font-semibold hover:bg-navy/90 transition-colors"
                    >
                      {copySuccess ? `✓ ${t.copied}` : t.copyLink}
                    </button>
                  </div>
                  {dashboardToken && (
                    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4 max-w-sm mx-auto text-left">
                      <p className="text-xs text-blue-600 font-medium mb-2">📊 {t.dashboard}</p>
                      <Link
                        href={`/dashboard/${dashboardToken}`}
                        className="inline-flex items-center justify-center rounded-full bg-navy text-white px-5 py-2.5 text-sm font-black hover:bg-navy/90 transition-colors"
                      >
                        Open private dashboard
                      </Link>
                      <p className="text-xs text-blue-500 mt-2">
                        Login later with your email and password. Do not share this private dashboard URL publicly.
                      </p>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => { setBillingError(''); setShowPlanModal(true) }}
                    className="mt-6 inline-flex items-center justify-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-6 py-3 text-sm font-black text-navy hover:bg-gold/20 transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4 text-gold" />
                    Choose plan and secure payment
                  </button>
                  <p className="text-sm text-gray-400 mt-6">
                    {t.shareHint}
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
                  {t.back}
                </button>
                {step < steps.length - 1 ? (
                  <button
                    onClick={handleNext}
                    className="px-6 py-2.5 bg-navy text-white rounded-xl font-medium hover:bg-navy/90 transition-colors flex items-center gap-2"
                  >
                    {t.continue}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : null}
              </div>
            </div>
          </div>

      {step !== 3 ? (
        <div className="mx-auto mt-6 max-w-5xl px-4">
          <div className="rounded-[2rem] border border-stone-200 bg-gradient-to-br from-[#f8f4eb] via-white to-[#f3ede2] p-5 shadow-lg shadow-stone-200/40">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-gold">{lang === 'pt' ? 'Prévia sob demanda' : lang === 'es' ? 'Vista previa bajo demanda' : lang === 'fr' ? 'Aperçu à la demande' : 'On-demand preview'}</p>
                <h3 className="mt-2 text-xl font-black text-navy">{lang === 'pt' ? 'Sem disputar espaço com o setup' : lang === 'es' ? 'Sin disputar espacio con el setup' : lang === 'fr' ? 'Sans partager l’espace avec le setup' : 'Without competing with the setup'}</h3>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-500">{livePreviewStage}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-white bg-white px-3 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-navy">{lang === 'pt' ? `Agora: ${previewFocusLabel}` : lang === 'es' ? `Ahora: ${previewFocusLabel}` : lang === 'fr' ? `Maintenant : ${previewFocusLabel}` : `Now: ${previewFocusLabel}`}</span>
                <button
                  type="button"
                  onClick={() => openPreviewSpotlight(previewFocusSection ?? 'hero', previewFocusLabel)}
                  className="inline-flex items-center gap-2 rounded-full bg-navy px-4 py-2 text-sm font-black text-white hover:bg-navy/90 transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  {lang === 'pt' ? 'Mostrar este bloco' : lang === 'es' ? 'Mostrar este bloque' : lang === 'fr' ? 'Montrer ce bloc' : 'Show this block'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      </div>

      {previewSpotlightOpen ? (
        <div className="fixed inset-0 z-[85] bg-[#f6f1e8]/96 backdrop-blur-md">
          <div className="absolute inset-x-0 top-0 border-b border-stone-200 bg-white/90 backdrop-blur-xl">
            <div className="mx-auto flex max-w-[1700px] items-center justify-between gap-4 px-4 py-4 sm:px-6">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-gold">{lang === 'pt' ? 'Modo mostrar' : lang === 'es' ? 'Modo mostrar' : lang === 'fr' ? 'Mode montrer' : 'Show mode'}</p>
                <h3 className="mt-1 text-2xl font-black text-navy">{previewFocusLabel}</h3>
                <p className="mt-1 text-sm text-stone-500">{lang === 'pt' ? 'A landing abre grande, já no bloco clicado, mas continua completa para o cliente poder rolar e revisar tudo.' : lang === 'es' ? 'La landing se abre grande, ya en el bloque pulsado, pero sigue completa para que el cliente pueda desplazarse y revisar todo.' : lang === 'fr' ? 'La landing s’ouvre en grand, déjà sur le bloc cliqué, mais reste complète pour pouvoir faire défiler et tout vérifier.' : 'The landing opens large on the clicked block, but stays complete so the user can scroll and review everything.'}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewViewport((current) => current === 'desktop' ? 'mobile' : 'desktop')}
                  className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-xs font-black text-navy hover:bg-stone-50 transition-colors"
                >
                  {previewViewport === 'desktop' ? <Smartphone className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
                  {previewViewport === 'desktop' ? 'Mobile' : 'Desk'}
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewSpotlightOpen(false)}
                  className="inline-flex items-center gap-2 rounded-full bg-navy px-4 py-2 text-xs font-black text-white hover:bg-navy/90 transition-colors"
                >
                  <X className="h-4 w-4" />
                  {lang === 'pt' ? 'Voltar ao setup' : lang === 'es' ? 'Volver al setup' : lang === 'fr' ? 'Retour au setup' : 'Back to setup'}
                </button>
              </div>
            </div>
          </div>

          <div className="mx-auto flex h-full max-w-[1700px] items-stretch gap-6 px-4 pb-6 pt-28 sm:px-6">
            <div className="hidden xl:flex xl:w-[280px] xl:flex-col xl:justify-between rounded-[2rem] border border-stone-200 bg-white/80 p-6 shadow-xl shadow-stone-200/40">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-gold">{lang === 'pt' ? 'Bloco em edição' : lang === 'es' ? 'Bloque en edición' : lang === 'fr' ? 'Bloc en édition' : 'Editing block'}</p>
                <h4 className="mt-3 text-2xl font-black text-navy">{previewFocusLabel}</h4>
                <p className="mt-3 text-sm leading-relaxed text-stone-500">{lang === 'pt' ? 'O clique em Mostrar posiciona a landing no trecho certo, mas o scroll continua livre para inspecionar hero, serviços, fotos e contacto como uma página real.' : lang === 'es' ? 'El clic en Mostrar posiciona la landing en el tramo correcto, pero el scroll sigue libre para revisar hero, servicios, fotos y contacto como una página real.' : lang === 'fr' ? 'Le clic sur Montrer place la landing au bon endroit, mais le défilement reste libre pour vérifier hero, services, photos et contact comme une vraie page.' : 'Clicking Show positions the landing at the right block, but scrolling stays free so users can inspect hero, services, photos and contact like a real page.'}</p>
              </div>
              <div className="space-y-3">
                <div className="rounded-[1.5rem] border border-gold/20 bg-gold/10 p-4 text-sm leading-relaxed text-navy">
                  {lang === 'pt' ? 'Dica: em serviços e fotos, clique em Mostrar para cair direto no bloco certo; depois role livremente para ver a landing inteira se formando.' : lang === 'es' ? 'Consejo: en servicios y fotos, haz clic en Mostrar para caer directo en el bloque correcto; luego desplázate libremente para ver la landing completa.' : lang === 'fr' ? 'Astuce : dans services et photos, cliquez sur Montrer pour arriver directement au bon bloc ; ensuite faites défiler librement toute la landing.' : 'Tip: in services and photos, click Show to land on the right block first, then scroll freely through the full landing.'}
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewSpotlightOpen(false)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-3 text-sm font-black text-navy hover:bg-stone-50 transition-colors"
                >
                  <ArrowRight className="h-4 w-4 rotate-180" />
                  {lang === 'pt' ? 'Voltar e continuar preenchendo' : lang === 'es' ? 'Volver y seguir completando' : lang === 'fr' ? 'Revenir et continuer le setup' : 'Go back and keep editing'}
                </button>
              </div>
            </div>

            <div className="min-w-0 flex-1 overflow-hidden rounded-[2.25rem] border border-stone-200 bg-[#f8f4ec] shadow-[0_30px_120px_rgba(28,25,23,0.18)]">
              <div ref={previewScrollRef} className="h-full overflow-auto p-4 sm:p-5">
                <div className={`mx-auto transition-all duration-300 ${previewViewport === 'mobile' ? 'max-w-[430px]' : 'max-w-[1240px]'}`}>
                  <div className="relative overflow-hidden rounded-[2rem] bg-white shadow-[0_24px_90px_rgba(15,23,42,0.16)]">
                    <div className="absolute right-4 top-4 z-20">
                      <div className="overflow-hidden rounded-[1.5rem] border border-stone-200 bg-white/92 shadow-xl backdrop-blur">
                        <button
                          type="button"
                          onClick={() => setThemePickerOpen((current) => !current)}
                          className="flex items-center gap-2 px-3 py-2 text-xs font-black text-navy transition-colors hover:bg-stone-50"
                        >
                          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-200" style={{ backgroundImage: selectedTheme.heroBackground }}>
                            <Sparkles className="h-3.5 w-3.5 text-navy" />
                          </span>
                          <span className="hidden sm:block">{lang === 'pt' ? 'Tema da landing' : lang === 'es' ? 'Tema de la landing' : lang === 'fr' ? 'Thème de la landing' : 'Landing theme'}</span>
                          <ChevronDown className={`h-4 w-4 transition-transform ${themePickerOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {themePickerOpen ? (
                          <div className="border-t border-stone-200 bg-white p-2">
                            <div className="grid gap-2 sm:min-w-[280px]">
                              {LANDING_THEME_OPTIONS.map((theme) => {
                                const isActive = theme.id === themeId
                                return (
                                  <button
                                    key={theme.id}
                                    type="button"
                                    onClick={() => {
                                      setThemeId(theme.id)
                                      activatePreviewFocus('hero', lang === 'pt' ? 'Tema visual' : 'Visual theme')
                                    }}
                                    className={`rounded-2xl border px-3 py-2 text-left transition-all ${isActive ? 'border-gold bg-gold/10 shadow-sm' : 'border-stone-200 bg-white hover:border-gold/40 hover:bg-stone-50'}`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <span className="h-9 w-9 rounded-xl border border-stone-200" style={{ backgroundImage: theme.heroBackground }} />
                                      <div className="min-w-0">
                                        <p className="text-sm font-black text-navy">{theme.label}</p>
                                        <p className="text-xs text-stone-500">{theme.tip}</p>
                                      </div>
                                    </div>
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <AiLandingRenderer
                      business={livePreviewBusiness}
                      aiConfig={spotlightPreviewConfig}
                      lang={lang as Language}
                      setLang={(nextLang) => setLang(nextLang as SetupLang)}
                      previewMode={false}
                      showWatermark={false}
                      via="dashboard-live-preview"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {showPlanModal && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-navy/70 px-4 py-6 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl overflow-hidden rounded-[2rem] border border-white/20 bg-white shadow-2xl">
            <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-gold/20 blur-3xl" />
            <button
              type="button"
              onClick={() => setShowPlanModal(false)}
              className="absolute right-4 top-4 z-10 rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200 hover:text-navy transition-colors"
              aria-label="Close plan checkout"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr]">
              <div className="bg-navy p-6 sm:p-8 text-white">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-gold">
                  <ShieldCheck className="w-4 h-4" />
                  Secure publishing
                </div>
                <h2 className="text-3xl font-black leading-tight sm:text-4xl">
                  Your Vitrine is ready. Publish it professionally.
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-slate-300">
                  The page is saved as a safe trial while you test it. Choose a plan to unlock the production flow, reports and a clean client-ready experience.
                </p>
                <div className="mt-6 space-y-3 rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-slate-200">
                  <p className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-gold" /> Payment runs on Stripe Checkout.</p>
                  <p className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-gold" /> Vitrine never stores card number, CVC or bank data.</p>
                  <p className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-gold" /> Reports are sent according to the selected plan.</p>
                </div>
              </div>

              <div className="p-6 sm:p-8">
                <p className="text-xs font-black uppercase tracking-wider text-gold">Choose your plan</p>
                <h3 className="mt-1 text-2xl font-black text-navy">Simple, secure and ready to scale</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  Use the same login email: <span className="font-bold text-navy">{accountEmail}</span>
                </p>

                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {PLANS.map((p) => {
                    const isPro = p.id === 'pro'
                    const features = isPro
                      ? ['Up to 3 pages', 'Weekly performance reports', 'Tracked QR/campaign links', 'Best for growth']
                      : ['1 business page', 'Biweekly performance reports', 'Lead dashboard', 'Best to start']
                    return (
                      <div
                        key={p.id}
                        className={`rounded-3xl border p-5 transition-all ${plan === p.id ? 'border-gold bg-gold/10 ring-2 ring-gold/20' : 'border-slate-200 bg-white'}`}
                      >
                        <div className="mb-4 flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xl font-black text-navy">{p.name}</p>
                            <div className="mt-1 flex items-end gap-1">
                              <span className="text-3xl font-black text-navy">{p.price}</span>
                              <span className="pb-1 text-xs font-black text-slate-400">{p.period}</span>
                            </div>
                            <p className="text-sm font-bold text-gold">{p.pages}</p>
                          </div>
                          <div className={`rounded-2xl p-2 ${isPro ? 'bg-navy text-gold' : 'bg-gold/20 text-gold'}`}>
                            <CreditCard className="h-5 w-5" />
                          </div>
                        </div>
                        <p className="mb-4 text-sm text-slate-500">{p.description}</p>
                        <ul className="mb-5 space-y-2 text-sm text-slate-600">
                          {features.map((feature) => (
                            <li key={feature} className="flex items-start gap-2">
                              <Check className="mt-0.5 h-4 w-4 text-gold" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                        <button
                          type="button"
                          onClick={() => startCheckout(p.id)}
                          disabled={Boolean(billingLoadingPlan)}
                          className={`w-full rounded-full px-4 py-3 text-sm font-black transition-all disabled:cursor-not-allowed disabled:opacity-60 ${isPro ? 'bg-navy text-gold hover:bg-navy/90' : 'bg-gold text-navy hover:bg-yellow-400'}`}
                        >
                          {billingLoadingPlan === p.id ? 'Opening secure checkout...' : `Continue with ${p.name}`}
                        </button>
                      </div>
                    )
                  })}
                </div>

                {billingError && (
                  <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                    <p className="font-black">Checkout is not ready yet.</p>
                    <p className="mt-1">{billingError}</p>
                    <p className="mt-2 text-xs">Configure Stripe keys in Vercel, then redeploy. Your page data is already safe.</p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setShowPlanModal(false)}
                  className="mt-5 w-full rounded-full border border-slate-200 px-4 py-3 text-sm font-bold text-slate-500 hover:border-gold/50 hover:text-navy transition-colors"
                >
                  I will finish payment later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
