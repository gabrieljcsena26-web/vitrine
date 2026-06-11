// Vitrine - Sistema de Landing Pages para Negócios Locais

export type VitrineCategory = 'beauty' | 'food' | 'professional'

export interface VitrineContact {
  phone: string
  whatsapp: string
  email?: string
  address: string
  googleMapsUrl?: string
}

export interface VitrineSocial {
  instagram?: string
  facebook?: string
  tiktok?: string
  linkedin?: string
}

export interface VitrineHours {
  day: string
  hours: string
  closed?: boolean
}

export interface VitrineService {
  id: string
  name: string
  description?: string
  price?: string
  duration?: string
  image?: string
  category?: string
}

export interface VitrineTestimonial {
  id: string
  name: string
  text: string
  rating: number
  avatar?: string
  date?: string
}

export interface VitrineGalleryImage {
  id: string
  src: string
  alt: string
  category?: string
}

export interface BeautyTeamMember {
  id: string
  name: string
  role: string
  image?: string
  specialties?: string[]
}

export interface FoodMenuItem {
  id: string
  name: string
  description: string
  price: string
  image?: string
  category: string
  tags?: string[]
  allergens?: string[]
  featured?: boolean
}

export interface FoodMenuCategory {
  id: string
  name: string
  description?: string
  items: FoodMenuItem[]
}

export interface ProfessionalCredential {
  title: string
  institution?: string
  year?: string
}

export interface ProfessionalTeamMember {
  id: string
  name: string
  title: string
  image?: string
  credentials: ProfessionalCredential[]
  specialties: string[]
  bio?: string
}

export interface VitrineConfig {
  category: VitrineCategory
  businessName: string
  tagline: string
  logo?: string
  heroImage: string
  heroImages?: string[]
  accentColor: string
  contact: VitrineContact
  social?: VitrineSocial
  hours: VitrineHours[]
  services: VitrineService[]
  testimonials: VitrineTestimonial[]
  gallery?: VitrineGalleryImage[]
}

export interface BeautyConfig extends VitrineConfig {
  category: 'beauty'
  team?: BeautyTeamMember[]
  bookingUrl?: string
  ambiance?: string
}

export interface FoodConfig extends VitrineConfig {
  category: 'food'
  menu: FoodMenuCategory[]
  reservationUrl?: string
  deliveryUrl?: string
  cuisineType?: string
}

export interface ProfessionalConfig extends VitrineConfig {
  category: 'professional'
  team: ProfessionalTeamMember[]
  consultationUrl?: string
  areas?: string[]
}