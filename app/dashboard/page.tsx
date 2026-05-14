'use client'
import { useState, useMemo, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ThumbsUp, Plus, Trash2, Upload, ArrowRight, Check, CalendarDays, Wrench, Utensils, Globe2, Info, Sparkles, Lock, MessageCircle, Mail, Link2, ShieldCheck, CreditCard, X } from 'lucide-react'

interface Service {
  name: string
  price: string
  description?: string
  photo?: string
}

type SetupLang = 'pt' | 'en' | 'es' | 'fr'
type ContactMethod = 'whatsapp' | 'booking' | 'email'

const AI_PREVIEW_STORAGE_KEY = 'vitrine_ai_page_config'
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

const CATEGORIES = [
  'Hair Salon', 'Barber Shop', 'Nail Salon', 'Spa & Wellness', 'Beauty Clinic',
  'Tattoo Studio', 'Massage Therapy', 'Makeup Artist', 'Personal Trainer',
  'Restaurant', 'Café', 'Bar', 'Food Truck', 'Bakery', 'Home Cleaning',
  'Auto Detailing', 'Mechanic', 'Pet Grooming', 'Veterinary Clinic', 'Dental Clinic',
  'Law Office', 'Consulting Office', 'Accounting Office', 'Yoga Studio', 'Other',
]

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const PLANS = [
  { id: 'starter', name: 'Starter', pages: '1 page', price: '€10', period: '/month', description: 'Best for one business page' },
  { id: 'pro', name: 'Pro', pages: '3 pages', price: '€15', period: '/month', description: 'For multiple services or locations' },
]

const DEFAULT_SERVICES: Record<string, Service[]> = {
  food: [
    { name: 'Chef special', price: '14', description: 'Signature dish with your best ingredients' },
    { name: 'Lunch menu', price: '12', description: 'Daily option for quick decisions' },
    { name: 'House dessert', price: '6', description: 'Sweet finish customers remember' },
  ],
  technical: [
    { name: 'Initial consultation', price: 'consultation', description: 'First conversation with clear next steps' },
    { name: 'Case or needs review', price: 'quote', description: 'Objective analysis before booking or hiring' },
    { name: 'Ongoing support', price: 'monthly', description: 'Professional follow-up for recurring clients' },
  ],
  service: [
    { name: 'Haircut', price: '25', description: 'Clean, professional finish' },
    { name: 'Color', price: '65', description: 'Personalized color service' },
  ],
}

function getTemplateForCategory(category: string): 'service' | 'food' | 'technical' {
  const value = category.toLowerCase()
  if (['restaurant', 'café', 'cafe', 'bar', 'food truck', 'bakery'].some((item) => value.includes(item))) return 'food'
  if (['clinic', 'dental', 'veterinary', 'law', 'consulting', 'accounting', 'office', 'cleaning', 'auto', 'mechanic', 'detailing', 'repair'].some((item) => value.includes(item))) return 'technical'
  return 'service'
}

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

const CATEGORY_LABELS_PT: Record<string, string> = {
  'Hair Salon': 'Salão de cabelo',
  'Barber Shop': 'Barbearia',
  'Nail Salon': 'Unhas',
  'Spa & Wellness': 'Spa e bem-estar',
  'Beauty Clinic': 'Clínica de estética',
  'Tattoo Studio': 'Estúdio de tatuagem',
  'Massage Therapy': 'Massagem terapêutica',
  'Makeup Artist': 'Maquiagem',
  'Personal Trainer': 'Personal trainer',
  Restaurant: 'Restaurante',
  'Café': 'Café',
  Bar: 'Bar',
  'Food Truck': 'Food truck',
  Bakery: 'Padaria',
  'Home Cleaning': 'Limpeza doméstica',
  'Auto Detailing': 'Detalhamento automóvel',
  Mechanic: 'Mecânico',
  'Pet Grooming': 'Banho e tosa',
  'Veterinary Clinic': 'Clínica veterinária',
  'Dental Clinic': 'Clínica dentária',
  'Law Office': 'Escritório de advocacia',
  'Consulting Office': 'Consultoria',
  'Accounting Office': 'Contabilidade',
  'Yoga Studio': 'Estúdio de yoga',
  Other: 'Outro',
}

function isDefaultServiceList(items: Service[]) {
  const names = items.map((item) => item.name).join('|')
  return Object.values(DEFAULT_SERVICES).some((list) => list.map((item) => item.name).join('|') === names)
}

// Configuration
const GENERATION_DURATION_MS = 2000 // Simulated page generation time
const COPY_SUCCESS_DURATION_MS = 2000 // How long to show "Copied!" message
const MAX_IMAGE_PX = 1000 // Max width/height for compressed photos
const TARGET_IMAGE_BYTES = 200_000 // Target size for AI/web previews
const AI_PHOTO_LIMIT = 7

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

export default function DashboardPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [businessName, setBusinessName] = useState('')
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
  const generateTimeoutRef = useRef<NodeJS.Timeout>()
  const copySuccessTimeoutRef = useRef<NodeJS.Timeout>()
  const heroInputRef = useRef<HTMLInputElement>(null)
  const aboutInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const menuImageInputRef = useRef<HTMLInputElement>(null)

  // Generate page URL slug
  const pageSlug = useMemo(() => generateSlug(businessName), [businessName])
  const selectedTemplate = getTemplateForCategory(category)
  const t = setupCopy[lang]
  const steps = t.stepLabels
  const selectedTemplateDetails = TEMPLATE_COPY[lang][selectedTemplate]
  const categoryLabel = (value: string) => (lang === 'pt' ? CATEGORY_LABELS_PT[value] ?? value : value)
  const contactMethodSelected = (method: ContactMethod) => contactMethods.includes(method)
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

  // Restore previously saved data
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      const startBlank = params.get('new') === '1'
      const saved = startBlank ? null : localStorage.getItem('vitrine_business_data')
      if (startBlank) {
        localStorage.removeItem('vitrine_business_data')
      }
      if (saved) {
        const data = JSON.parse(saved)
        if (data.businessName) setBusinessName(data.businessName)
        if (data.category) setCategory(data.category)
        if (data.description) setDescription(data.description)
        if (data.address) setAddress(data.address)
        if (data.email) setEmail(data.email)
        if (Array.isArray(data.contactMethods) && data.contactMethods.length) setContactMethods(data.contactMethods.filter((item: string) => ['whatsapp', 'booking', 'email'].includes(item)) as ContactMethod[])
        if (data.phone) setPhone(data.phone)
        if (data.bookingUrl) setBookingUrl(data.bookingUrl)
        if (data.whatsappNumber) setWhatsappNumber(data.whatsappNumber)
        if (data.whatsappMessage) setWhatsappMessage(data.whatsappMessage)
        if (data.menuUrl) setMenuUrl(data.menuUrl)
        if (data.menuImageUrl) setMenuImageUrl(data.menuImageUrl)
        if (data.plan) setPlan(data.plan)
        if (data.lang && ['pt', 'en', 'es', 'fr'].includes(data.lang)) setLang(data.lang as SetupLang)
        if (Array.isArray(data.services) && data.services.length) setServices(data.services)
        if (Array.isArray(data.hours) && data.hours.length) setHours(data.hours)
        if (Array.isArray(data.photos) && data.photos.length) {
          setHeroPhoto((data.photos as string[])[0] || '')
          setAboutPhoto((data.photos as string[])[1] || '')
          setGalleryPhotos((data.photos as string[]).slice(2).filter(Boolean))
        }
      }

      const ownerEmail = params.get('ownerEmail')
      const requestedPlan = params.get('plan')
      if (ownerEmail) setEmail(ownerEmail)
      if (requestedPlan && PLANS.some((p) => p.id === requestedPlan)) setPlan(requestedPlan)
    } catch {
      // ignore corrupt saved data
    }
  }, [])

  const addService = () => setServices([...services, selectedTemplate === 'food'
    ? { name: '', price: '', description: '', photo: '' }
    : { name: '', price: '', description: '' }])
  const removeService = (i: number) => setServices(services.filter((_, idx) => idx !== i))
  const updateService = (i: number, field: keyof Service, val: string) => {
    setServices(services.map((s, idx) => (idx === i ? { ...s, [field]: val } : s)))
  }
  const handleCategoryChange = (nextCategory: string) => {
    setCategory(nextCategory)
    const template = getTemplateForCategory(nextCategory)
    if (services.length === 0 || isDefaultServiceList(services)) {
      setServices(DEFAULT_SERVICES[template])
    }
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
    const availableSlots = Math.max(0, AI_PHOTO_LIMIT - 2 - galleryPhotos.length)
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

  const saveBusinessData = (): boolean => {
    const photos = [heroPhoto, aboutPhoto, ...galleryPhotos].slice(0, AI_PHOTO_LIMIT)
    const data = {
      businessName,
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
      services,
      hours,
      photos,
    }
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
          slug: pageSlug,
          category,
          description,
          address,
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
          services,
          hours,
          photos: [heroPhoto, aboutPhoto, ...galleryPhotos],
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

  const buildAiPreviewConfig = () => {
    const template = selectedTemplate
    const photos = [heroPhoto, aboutPhoto, ...galleryPhotos].filter(Boolean).slice(0, AI_PHOTO_LIMIT)
    const hasMenu = template === 'food' && Boolean(menuUrl || menuImageUrl || services.length)
    const hasBooking = contactMethodSelected('booking') && Boolean(bookingUrl)
    const hasWhatsapp = contactMethodSelected('whatsapp') && Boolean(whatsappNumber)
    const primaryCta = hasBooking ? 'Book now' : hasWhatsapp ? 'Message on WhatsApp' : 'Contact us'
    const secondaryCta = hasMenu ? 'View menu' : 'View services'
    const headline = template === 'food'
      ? `${businessName || 'Your restaurant'} — menu, atmosphere and easy ordering`
      : template === 'technical'
      ? `${businessName || 'Your business'} — trust, clarity and direct contact`
      : `${businessName || 'Your business'} — services, photos and booking in one page`
    const subheadline = description.trim()
      ? description.trim().slice(0, 220)
      : template === 'food'
      ? 'A warm, visual landing page built from your photos to help customers choose, order or reserve faster.'
      : 'A professional landing page built from your setup and photos to turn visitors into real contacts.'

    return {
      generatedAt: new Date().toISOString(),
      source: 'setup_and_photos_preview',
      template,
      imageCount: photos.length,
      style: template === 'food'
        ? { primaryColor: '#1F2937', accentColor: '#D4AF37', mood: 'warm_premium' }
        : template === 'technical'
        ? { primaryColor: '#0F172A', accentColor: '#38BDF8', mood: 'clean_trust' }
        : { primaryColor: '#0F172A', accentColor: '#D4AF37', mood: 'modern_local' },
      sections: template === 'food'
        ? ['hero', 'about', 'menu', 'gallery', 'hours', 'location', 'contact']
        : ['hero', 'about', 'benefits', 'services', 'gallery', 'hours', 'contact'],
      copy: {
        headline,
        subheadline,
        primaryCta,
        secondaryCta,
      },
      photoRoles: {
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
  }

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
          category,
          description,
          address,
          lang,
          contactMethods,
          bookingUrl: contactMethodSelected('booking') ? bookingUrl.trim() || null : null,
          whatsappNumber: contactMethodSelected('whatsapp') ? whatsappNumber.trim() || null : null,
          menuUrl: menuUrl.trim() || null,
          services,
          hours,
          photos: [heroPhoto, aboutPhoto, ...galleryPhotos].filter(Boolean).slice(0, AI_PHOTO_LIMIT),
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

      <div className="max-w-5xl mx-auto px-4 py-8">
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

        {/* Step content */}
        <div className="bg-white rounded-[2rem] shadow-xl shadow-stone-200/60 border border-stone-100 p-6 sm:p-8">
          {step === 0 && (
            <div>
              <div className="rounded-[1.75rem] bg-gradient-to-br from-navy via-slate-900 to-slate-800 p-6 text-white mb-6 overflow-hidden relative">
                <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-gold/20 blur-3xl" />
                <div className="relative flex flex-col md:flex-row md:items-center gap-5 justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gold text-navy flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-gold uppercase tracking-wider mb-1">{t.welcome}</p>
                      <h2 className="text-2xl sm:text-3xl font-black mb-2">{t.step0Title}</h2>
                      <p className="text-sm text-gray-300 max-w-2xl leading-relaxed">{t.step0Text}</p>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/10 p-4 min-w-[210px]">
                    <div className="flex items-center gap-2 text-gold text-xs font-black uppercase tracking-wider mb-2">
                      <Globe2 className="w-4 h-4" />
                      {t.headerHint}
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed">{t.infoText}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-5">
                <div className="rounded-2xl border border-gold/20 bg-gold/5 p-4 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gold text-navy flex items-center justify-center flex-shrink-0">
                    <Info className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-black text-navy">{t.infoTitle}</p>
                    <p className="text-sm text-gray-500 mt-1 leading-relaxed">{t.infoText}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.businessName}</label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => { setBusinessName(e.target.value); if (e.target.value.trim()) setNameError('') }}
                    placeholder={t.businessNamePlaceholder}
                    className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:border-gold transition-colors ${nameError ? 'border-red-400' : 'border-gray-200'}`}
                  />
                  {nameError && <p className="text-red-500 text-xs mt-1">{nameError}</p>}
                </div>
                <div className="rounded-[1.75rem] border border-green-200 bg-green-50 p-5 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-green-600 text-white flex items-center justify-center flex-shrink-0">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-navy">Secure account connected</h3>
                    <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                      You are creating this page from {accountEmail}. Your dashboard stays protected by your login password.
                    </p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.category}</label>
                  <select
                    value={category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-gold transition-colors bg-white"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{categoryLabel(c)}</option>
                    ))}
                  </select>
                  <div className="mt-3 rounded-2xl border border-gold/30 bg-gradient-to-br from-gold/10 to-white p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-navy text-gold flex items-center justify-center flex-shrink-0">
                        {selectedTemplate === 'food' ? <Utensils className="w-5 h-5" /> : selectedTemplate === 'technical' ? <Wrench className="w-5 h-5" /> : <CalendarDays className="w-5 h-5" />}
                      </div>
                      <div>
                        <span className="inline-flex rounded-full bg-gold/20 text-gold px-2.5 py-1 text-[10px] font-black uppercase tracking-wider mb-2">
                          {selectedTemplateDetails.badge}
                        </span>
                        <p className="font-black text-navy">{selectedTemplateDetails.title}</p>
                        <p className="text-sm text-gray-500 mt-1">{selectedTemplateDetails.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.shortDescription}</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    placeholder={t.descriptionPlaceholder}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-gold transition-colors resize-none"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.address}</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder={t.addressPlaceholder}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-gold transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.phone}</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+351 912 345 678"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-gold transition-colors"
                    />
                  </div>
                </div>
                <div className="rounded-[1.75rem] border border-gold/30 bg-gradient-to-br from-[#fffaf0] to-white p-5 shadow-sm">
                  <p className="text-xs font-black text-gold uppercase tracking-wider mb-2">
                    {t.actionEyebrow}
                  </p>
                  <h3 className="font-black text-navy text-xl mb-2">{t.actionTitle}</h3>
                  <p className="text-sm text-gray-500 mb-5 leading-relaxed">
                    {t.actionText}
                  </p>

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
                          onClick={() => toggleContactMethod(method.id)}
                          className={`group text-left rounded-2xl border p-4 transition-all ${
                            selected
                              ? 'border-gold bg-gold/10 ring-2 ring-gold/20 shadow-lg shadow-gold/10'
                              : 'border-stone-200 bg-white hover:border-gold/40 hover:-translate-y-0.5'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${selected ? 'bg-gold text-navy' : 'bg-navy/5 text-navy group-hover:bg-gold/10'}`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-black text-navy">{method.title}</p>
                                {selected && <Check className="w-4 h-4 text-gold" />}
                              </div>
                              <div className="flex items-start gap-1.5 mt-2 text-xs text-gray-500 leading-relaxed">
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
                    {contactMethodSelected('whatsapp') && (
                      <div className="rounded-2xl border border-stone-200 bg-white p-4">
                        <label className="block text-sm font-bold text-gray-700 mb-1">{t.whatsapp}</label>
                        <input
                          type="tel"
                          value={whatsappNumber}
                          onChange={(e) => setWhatsappNumber(e.target.value)}
                          placeholder="+351 912 345 678"
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-gold transition-colors bg-white"
                        />
                        <div className="mt-4 rounded-2xl bg-navy/5 p-4">
                          <div className="flex items-start gap-2 mb-2">
                            <Info className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-gray-600 leading-relaxed">{t.whatsappMessageInfo}</p>
                          </div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">{t.whatsappMessage}</label>
                          <textarea
                            rows={2}
                            maxLength={500}
                            value={whatsappMessage}
                            onChange={(e) => setWhatsappMessage(e.target.value)}
                            placeholder="Olá! Vim pela página e gostaria de saber mais."
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-gold transition-colors bg-white resize-none"
                          />
                          <p className="text-right text-xs text-gray-400 mt-1">{whatsappMessage.length}/500</p>
                        </div>
                      </div>
                    )}

                    {contactMethodSelected('booking') && (
                      <div className="rounded-2xl border border-stone-200 bg-white p-4">
                        <label className="block text-sm font-bold text-gray-700 mb-1">{t.booking}</label>
                        <input
                          type="text"
                          value={bookingUrl}
                          onChange={(e) => setBookingUrl(e.target.value)}
                          placeholder="https://calendly.com/yourname"
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-gold transition-colors bg-white"
                        />
                      </div>
                    )}

                    {contactMethodSelected('email') && (
                      <div className="rounded-2xl border border-stone-200 bg-white p-4">
                        <label className="block text-sm font-bold text-gray-700 mb-1">{t.emailContact}</label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="hello@yourbusiness.com"
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-gold transition-colors bg-white"
                        />
                      </div>
                    )}
                  </div>
                </div>
                {selectedTemplate === 'food' && (
                  <div className="rounded-2xl border border-orange-200 bg-orange-50/60 p-5">
                    <p className="text-xs font-bold text-gold uppercase tracking-wider mb-2">{t.menuEyebrow}</p>
                    <h3 className="font-bold text-navy mb-2">{t.menuTitle}</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      {t.menuText}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-start">
                      <input
                        type="text"
                        value={menuUrl}
                        onChange={(e) => setMenuUrl(e.target.value)}
                        placeholder="https://your-business.com/menu or delivery menu link"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-gold transition-colors bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => menuImageInputRef.current?.click()}
                        className="inline-flex items-center justify-center gap-2 bg-white border border-gold/30 text-navy px-4 py-3 rounded-xl font-bold hover:bg-gold/10 transition-colors"
                      >
                        <Upload className="w-4 h-4 text-gold" />
                        {t.uploadMenu}
                      </button>
                    </div>
                    <input ref={menuImageInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleSlotFile(e.target.files[0], setMenuImageUrl)} />
                    {menuImageUrl && (
                      <div className="mt-4 rounded-2xl overflow-hidden border border-orange-100 bg-white p-2 max-w-xs">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={menuImageUrl} alt="Full menu preview" className="w-full h-40 object-cover rounded-xl" />
                        <button type="button" onClick={() => setMenuImageUrl('')} className="mt-2 text-xs text-red-500 font-bold hover:underline">{t.removeMenu}</button>
                      </div>
                    )}
                  </div>
                )}
                <div>
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <label className="block text-sm font-medium text-gray-700">{t.plan}</label>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-navy/5 text-navy px-3 py-1 text-[11px] font-black">
                      <Lock className="w-3 h-3" />
                      {lang === 'pt' ? 'Prévia protegida' : lang === 'es' ? 'Vista previa protegida' : lang === 'fr' ? 'Aperçu protégé' : 'Protected preview'}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {PLANS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPlan(p.id)}
                        className={`text-left rounded-2xl border p-4 transition-all ${
                          plan === p.id
                            ? 'border-gold bg-gold/10 ring-2 ring-gold/20'
                            : 'border-gray-200 hover:border-gold/40'
                        }`}
                      >
                        <p className="font-bold text-navy">{p.name}</p>
                        <p className="text-sm font-semibold text-gold mt-1">{p.pages}</p>
                        <p className="text-xs text-gray-400 mt-1">{p.description}</p>
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 rounded-2xl border border-dashed border-gold/40 bg-gold/5 p-4 flex items-start gap-3">
                    <Info className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-500 leading-relaxed">{t.planNote}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-navy mb-2">
                {selectedTemplate === 'food' ? t.foodServicesTitle : t.servicesTitle}
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                {selectedTemplate === 'food'
                  ? t.foodServicesText
                  : selectedTemplate === 'technical'
                  ? t.technicalServicesText
                  : t.servicesText}
              </p>

              {/* Services */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800">{selectedTemplate === 'food' ? t.menuHighlights : t.services}</h3>
                  <button
                    onClick={addService}
                    className="flex items-center gap-1 text-gold text-sm font-medium hover:text-yellow-600 transition-colors"
                  >
                    <Plus className="w-4 h-4" /> {selectedTemplate === 'food' ? t.addMenuItem : t.addService}
                  </button>
                </div>
                <div className="space-y-4">
                  {services.map((svc, i) => (
                    <div key={i} className="rounded-2xl border border-gray-200 p-4 hover:border-gold/40 transition-colors bg-white">
                      <div className="grid grid-cols-1 lg:grid-cols-[96px_1fr_auto] gap-4 items-start">
                        {selectedTemplate === 'food' && (
                          <div>
                            {svc.photo ? (
                              <div className="relative w-24 h-24 rounded-2xl overflow-hidden group bg-stone-100">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={svc.photo} alt={svc.name || 'Menu item'} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <label className="bg-white text-navy text-[11px] font-bold px-2.5 py-1 rounded-full cursor-pointer hover:bg-gold transition-colors">
                                    Change
                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleServicePhoto(i, e.target.files?.[0] ?? null)} />
                                  </label>
                                </div>
                              </div>
                            ) : (
                              <label className="w-24 h-24 rounded-2xl border-2 border-dashed border-gold/30 bg-gold/5 hover:bg-gold/10 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors text-center">
                                <Upload className="w-5 h-5 text-gold" />
                                <span className="text-[11px] text-gold font-bold leading-tight">{t.dishPhoto}</span>
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleServicePhoto(i, e.target.files?.[0] ?? null)} />
                              </label>
                            )}
                          </div>
                        )}

                        <div className="space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-[1fr_120px] gap-3">
                            <input
                              type="text"
                              value={svc.name}
                              onChange={(e) => updateService(i, 'name', e.target.value)}
                              placeholder={selectedTemplate === 'food' ? t.menuItemName : t.serviceName}
                              className="border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-gold transition-colors text-sm"
                            />
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
                              <input
                                type="number"
                                value={svc.price}
                                onChange={(e) => updateService(i, 'price', e.target.value)}
                                placeholder="0"
                                aria-label={t.price}
                                className="w-full border border-gray-200 rounded-xl pl-7 pr-3 py-2.5 focus:outline-none focus:border-gold transition-colors text-sm"
                              />
                            </div>
                          </div>
                          <input
                            type="text"
                            value={svc.description ?? ''}
                            onChange={(e) => updateService(i, 'description', e.target.value)}
                            placeholder={selectedTemplate === 'food' ? t.foodDescription : t.serviceDescription}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-gold transition-colors text-sm"
                          />
                          {selectedTemplate === 'food' && (
                            <p className="text-xs text-gray-400">{t.dishHint}</p>
                          )}
                        </div>

                        <button
                          onClick={() => removeService(i)}
                          className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0 p-2"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hours */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-4">{t.hours}</h3>
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
              <h2 className="text-2xl font-bold text-navy mb-2">
                {selectedTemplate === 'food' ? t.foodPhotosTitle : t.photosTitle}
              </h2>
              <p className="text-gray-400 text-sm mb-8">
                {selectedTemplate === 'food'
                  ? t.foodPhotosText
                  : t.photosText}
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

                {/* ── Slot 2: About Photo ── */}
                <div className="border border-gray-200 rounded-2xl p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-navy/5 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-navy font-black text-sm">2</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center flex-wrap gap-2 mb-1">
                        <h3 className="font-bold text-navy">{selectedTemplate === 'food' ? t.foodAboutPhoto : t.aboutPhoto}</h3>
                        <span className="bg-navy text-gold text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {selectedTemplate === 'food' ? t.foodAboutBadge : t.aboutBadge}
                        </span>
                      </div>
                      <p className="text-gray-400 text-xs mb-4">
                        {selectedTemplate === 'food'
                          ? t.foodAboutHint
                          : t.aboutHint}
                      </p>
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
                          <span className="text-gray-400 text-sm">{selectedTemplate === 'food' ? t.uploadFoodAbout : t.uploadAbout}</span>
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
            <div className="text-center py-8">
              {!isGenerated ? (
                <>
                  <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Sparkles className="w-10 h-10 text-gold" />
                  </div>
                  <h2 className="text-2xl font-bold text-navy mb-3">
                    {t.previewTitle}
                  </h2>
                  <p className="text-gray-500 mb-8">
                    {t.previewText}
                  </p>
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
                  <div className="mx-auto mb-8 max-w-2xl rounded-[1.75rem] border border-gold/20 bg-gradient-to-br from-gold/10 via-white to-stone-50 p-5 text-left shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-navy text-gold">
                        <Sparkles className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase tracking-wider text-gold">{lang === 'pt' ? 'Motor da prévia IA' : lang === 'es' ? 'Motor de vista previa IA' : lang === 'fr' ? 'Moteur d’aperçu IA' : 'AI preview engine'}</p>
                        <h3 className="mt-1 text-lg font-black text-navy">{lang === 'pt' ? 'A landing nasce do setup e das fotos' : lang === 'es' ? 'La landing nace del setup y de las fotos' : lang === 'fr' ? 'La landing nait du setup et des photos' : 'The landing is built from setup and photos'}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-gray-500">
                          {lang === 'pt'
                            ? 'Quando você clica em prévia IA, o sistema escolhe o estilo da landing, distribui hero, sobre e galeria e ajusta a mensagem principal antes da publicação.'
                            : lang === 'es'
                            ? 'Cuando haces clic en vista previa IA, el sistema elige el estilo de la landing, distribuye hero, about y galería y ajusta el mensaje principal antes de publicar.'
                            : lang === 'fr'
                            ? 'Quand vous cliquez sur aperçu IA, le système choisit le style de la landing, répartit hero, about et galerie et ajuste le message principal avant publication.'
                            : 'When you click AI preview, the system chooses the landing style, distributes hero/about/gallery roles and adjusts the main message before publishing.'}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {AI_PREVIEW_HINTS[lang].map((item) => (
                            <span key={item} className="rounded-full border border-navy/10 bg-white px-3 py-1 text-xs font-bold text-navy">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={handleAiPreview}
                      disabled={aiPreviewLoading}
                      className="flex items-center gap-2 justify-center bg-navy text-white px-8 py-3 rounded-full font-semibold hover:bg-navy/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
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
                </>
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
