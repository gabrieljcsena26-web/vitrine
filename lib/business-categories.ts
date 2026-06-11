export type BusinessTemplate = 'service' | 'food' | 'technical'

export interface CategoryOption {
  value: string
  ptLabel: string
  template: BusinessTemplate
}

export interface ServicePreset {
  name: string
  price: string
  description?: string
  photo?: string
}

export const CATEGORY_OPTIONS: CategoryOption[] = [
  { value: 'Hair Salon', ptLabel: 'Salao de cabelo', template: 'service' },
  { value: 'Barber Shop', ptLabel: 'Barbearia', template: 'service' },
  { value: 'Nail Salon', ptLabel: 'Unhas', template: 'service' },
  { value: 'Spa & Wellness', ptLabel: 'Spa e bem-estar', template: 'service' },
  { value: 'Beauty Clinic', ptLabel: 'Clinica de estetica', template: 'service' },
  { value: 'Tattoo Studio', ptLabel: 'Estudio de tatuagem', template: 'service' },
  { value: 'Massage Therapy', ptLabel: 'Massagem terapeutica', template: 'service' },
  { value: 'Makeup Artist', ptLabel: 'Maquiagem', template: 'service' },
  { value: 'Personal Trainer', ptLabel: 'Personal trainer', template: 'service' },
  { value: 'Yoga Studio', ptLabel: 'Estudio de yoga', template: 'service' },
  { value: 'Pet Grooming', ptLabel: 'Banho e tosa', template: 'service' },
  { value: 'Restaurant', ptLabel: 'Restaurante', template: 'food' },
  { value: 'Café', ptLabel: 'Cafe', template: 'food' },
  { value: 'Bar', ptLabel: 'Bar', template: 'food' },
  { value: 'Food Truck', ptLabel: 'Food truck', template: 'food' },
  { value: 'Bakery', ptLabel: 'Padaria', template: 'food' },
  { value: 'Home Cleaning', ptLabel: 'Limpeza domestica', template: 'technical' },
  { value: 'Auto Detailing', ptLabel: 'Detalhamento automovel', template: 'technical' },
  { value: 'Mechanic', ptLabel: 'Mecanico', template: 'technical' },
  { value: 'Veterinary Clinic', ptLabel: 'Clinica veterinaria', template: 'technical' },
  { value: 'Dental Clinic', ptLabel: 'Clinica dentaria', template: 'technical' },
  { value: 'Law Office', ptLabel: 'Escritorio de advocacia', template: 'technical' },
  { value: 'Consulting Office', ptLabel: 'Consultoria', template: 'technical' },
  { value: 'Accounting Office', ptLabel: 'Contabilidade', template: 'technical' },
  { value: 'Other', ptLabel: 'Outro', template: 'service' },
]

export const CATEGORY_VALUES = CATEGORY_OPTIONS.map((category) => category.value)

export const CATEGORY_LABELS_PT = CATEGORY_OPTIONS.reduce<Record<string, string>>((labels, category) => {
  labels[category.value] = category.ptLabel
  return labels
}, {})

export const DEFAULT_SERVICE_PRESETS: Record<BusinessTemplate, ServicePreset[]> = {
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

const TEMPLATE_KEYWORDS: Record<BusinessTemplate, string[]> = {
  food: ['restaurant', 'restaurante', 'café', 'cafe', 'coffee', 'bar', 'food', 'food truck', 'bakery', 'bistro', 'lanchonete', 'confeitaria', 'padaria', 'menu', 'cardapio', 'cardápio'],
  service: ['hair', 'salon', 'salao', 'salão', 'barber', 'barbearia', 'nail', 'unhas', 'spa', 'wellness', 'beauty', 'estetica', 'estética', 'tattoo', 'tatuagem', 'massage', 'massagem', 'makeup', 'maquiagem', 'lashes', 'sobrancelha'],
  technical: ['clinic', 'clinica', 'clínica', 'dental', 'veterinary', 'veterinaria', 'veterinária', 'law', 'advocacia', 'consulting', 'accounting', 'office', 'cleaning', 'limpeza', 'auto', 'mechanic', 'mecanico', 'mecânico', 'detailing', 'repair', 'reparo'],
}

export function inferBusinessTemplate(category?: string | null, description?: string | null): BusinessTemplate {
  const categoryValue = String(category ?? '').trim()
  const exactMatch = CATEGORY_OPTIONS.find((option) => option.value.toLowerCase() === categoryValue.toLowerCase())
  if (exactMatch) return exactMatch.template

  const value = `${category ?? ''} ${description ?? ''}`.toLowerCase()
  if (TEMPLATE_KEYWORDS.food.some((keyword) => value.includes(keyword))) return 'food'
  if (TEMPLATE_KEYWORDS.service.some((keyword) => value.includes(keyword))) return 'service'
  if (TEMPLATE_KEYWORDS.technical.some((keyword) => value.includes(keyword))) return 'technical'
  return 'service'
}

export function isFoodBusinessCategory(category?: string | null, description?: string | null) {
  return inferBusinessTemplate(category, description) === 'food'
}

export function getCategoriesByTemplate(template: BusinessTemplate) {
  return CATEGORY_OPTIONS.filter((category) => category.template === template)
}