export interface CommercialDemo {
  slug: 'restauracao' | 'salao' | 'clinica' | 'escritorio'
  variant?: 'standard' | 'food' | 'professional' | 'clinic'
  businessName: string
  category: string
  headline: string
  subheadline: string
  whatsappNumber: string
  whatsappMessage: string
  address: string
  email: string
  phone: string
  theme: {
    badge: string
    primary: string
    accent: string
  }
  photos: string[]
  services: { name: string; price: string; description: string; photo?: string }[]
  benefits: string[]
  testimonials: { name: string; text: string; rating: number; photo: string }[]
  faqs: { question: string; answer: string }[]
  hours: { day: string; open: boolean; from: string; to: string }[]
}

const defaultHours = [
  { day: 'Monday', open: true, from: '09:00', to: '19:00' },
  { day: 'Tuesday', open: true, from: '09:00', to: '19:00' },
  { day: 'Wednesday', open: true, from: '09:00', to: '19:00' },
  { day: 'Thursday', open: true, from: '09:00', to: '19:00' },
  { day: 'Friday', open: true, from: '09:00', to: '20:00' },
  { day: 'Saturday', open: true, from: '09:00', to: '16:00' },
  { day: 'Sunday', open: false, from: '00:00', to: '00:00' },
]

export const commercialDemos: CommercialDemo[] = [
  {
    slug: 'restauracao',
    variant: 'food',
    businessName: 'Mesa Viva Kitchen',
    category: 'Restauração: restaurantes, bares e cafés',
    headline: 'Uma landing elegante para mostrar pratos, ambiente e receber reservas sem depender de preços.',
    subheadline: 'Uma estrutura feita para restaurantes: fotos que despertam desejo, destaques do menu, reserva rápida, WhatsApp, localização e QR para mesas ou flyers.',
    whatsappNumber: '+351 915 678 901',
    whatsappMessage: 'Olá! Vi o menu da Mesa Viva e quero fazer um pedido.',
    address: 'Rua das Flores 55, Porto, Portugal',
    email: 'menu@mesaviva.pt',
    phone: '+351 915 678 901',
    theme: { badge: 'Menu + QR experience', primary: 'bg-orange-950', accent: 'text-orange-200' },
    photos: [
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1544148103-0773bf10d330?q=80&w=1200&auto=format&fit=crop',
    ],
    services: [
      { name: 'Prato assinatura', price: '', description: 'Criação da casa com ingredientes frescos e apresentação elegante.', photo: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1200&auto=format&fit=crop' },
      { name: 'Entrada para partilhar', price: '', description: 'Uma seleção leve para começar a mesa com conversa e sabor.', photo: 'https://images.unsplash.com/photo-1543352634-a1c51d9f1fa7?q=80&w=1200&auto=format&fit=crop' },
      { name: 'Bowl fresco', price: '', description: 'Opção colorida, equilibrada e perfeita para almoço.', photo: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1200&auto=format&fit=crop' },
      { name: 'Sobremesa da casa', price: '', description: 'Final doce para uma experiência memorável.', photo: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=1200&auto=format&fit=crop' },
    ],
    benefits: ['QR Code para mesas e flyers', 'Menu completo separado da landing', 'Pedido direto pelo WhatsApp', 'Fotos de pratos em destaque'],
    testimonials: [
      { name: 'Laura M.', text: 'Abri o QR na mesa, vi o menu e pedi sem esperar.', rating: 5, photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop' },
      { name: 'Pedro N.', text: 'As fotos ajudaram muito na escolha. Tudo simples e rápido.', rating: 5, photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop' },
      { name: 'Sofia R.', text: 'Muito melhor que PDF perdido no Instagram.', rating: 5, photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop' },
    ],
    faqs: [
      { question: 'O QR pode ir na mesa?', answer: 'Sim. A ideia é levar clientes direto para o menu completo e rastrear visitas.' },
      { question: 'Posso usar link de delivery?', answer: 'Sim, pode ser um link externo ou uma imagem do menu completo.' },
      { question: 'Dá para destacar pratos?', answer: 'Sim, a landing mostra destaques e o menu completo fica em uma página separada.' },
      { question: 'Funciona para café, bar e food truck?', answer: 'Sim, foi pensado para qualquer negócio de comida com cardápio.' },
    ],
    hours: defaultHours,
  },
  {
    slug: 'escritorio',
    variant: 'professional',
    businessName: 'Almeida & Rocha Advocacia',
    category: 'Clínicas & escritórios: consultas, confiança e autoridade',
    headline: 'Página premium para serviços que precisam gerar confiança antes da consulta.',
    subheadline: 'Uma estrutura direta para clínicas, advocacia, consultoria, terapeutas e freelancers: autoridade, áreas de atuação, processo claro e contacto qualificado.',
    whatsappNumber: '+351 916 789 012',
    whatsappMessage: 'Olá! Vi a página da Almeida & Rocha e quero agendar uma consulta.',
    address: 'Avenida da Liberdade 210, Lisboa, Portugal',
    email: 'consulta@almeidarocha.pt',
    phone: '+351 916 789 012',
    theme: { badge: 'Professional trust', primary: 'bg-slate-950', accent: 'text-blue-200' },
    photos: [
      'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1505664194779-8beaceb93744?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1521791055366-0d553872125f?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=1200&auto=format&fit=crop',
    ],
    services: [
      { name: 'Direito empresarial', price: 'consulta', description: 'Contratos, sociedades e proteção do negócio.' },
      { name: 'Direito imobiliário', price: 'consulta', description: 'Arrendamento, compra, venda e litígios.' },
      { name: 'Consultoria preventiva', price: 'mensal', description: 'Acompanhamento recorrente para empresas.' },
      { name: 'Análise contratual', price: 'sob orçamento', description: 'Revisão clara antes da assinatura.' },
    ],
    benefits: ['Imagem premium e confiável', 'Contato qualificado por WhatsApp', 'Áreas de atuação claras', 'FAQ para reduzir dúvidas'],
    testimonials: [
      { name: 'Ricardo P.', text: 'A página explicou o processo e marquei consulta com segurança.', rating: 5, photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop' },
      { name: 'Helena C.', text: 'Profissional, objetiva e fácil de contactar.', rating: 5, photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop' },
      { name: 'Bruno A.', text: 'Gostei de ver áreas de atuação e perguntas antes da chamada.', rating: 4, photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop' },
    ],
    faqs: [
      { question: 'A primeira conversa é online?', answer: 'Pode ser online ou presencial, conforme disponibilidade e tipo de caso.' },
      { question: 'Posso enviar documentos antes?', answer: 'Sim, o contato pelo WhatsApp ajuda a orientar os próximos passos.' },
      { question: 'Atendem empresas?', answer: 'Sim, há consultoria pontual e acompanhamento recorrente.' },
      { question: 'A página serve para freelancers?', answer: 'Sim, a estrutura funciona para consultores, contabilistas, designers e prestadores profissionais.' },
    ],
    hours: defaultHours,
  },
  {
    slug: 'salao',
    businessName: 'Studio Aurora Salon',
    category: 'Salão: beleza, barbearia e estética leve',
    headline: 'Agenda cheia com uma página elegante para beleza e autocuidado.',
    subheadline: 'Estrutura ideal para salão, barbearia, manicure, estética leve e profissionais de beleza que querem reservas rápidas.',
    whatsappNumber: '+351 912 345 678',
    whatsappMessage: 'Olá! Vi a página do Studio Aurora e quero agendar um horário.',
    address: 'Rua Augusta 120, Lisboa, Portugal',
    email: 'agenda@studioaurora.pt',
    phone: '+351 912 345 678',
    theme: { badge: 'Beauty booking', primary: 'bg-rose-950', accent: 'text-rose-100' },
    photos: [
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=1200&auto=format&fit=crop',
    ],
    services: [
      { name: 'Corte & styling', price: '35€', description: 'Acabamento profissional para valorizar o visual.' },
      { name: 'Coloração', price: '65€', description: 'Cor personalizada com cuidado e orientação.' },
      { name: 'Manicure premium', price: '28€', description: 'Detalhe, higiene e acabamento elegante.' },
      { name: 'Tratamento facial', price: '45€', description: 'Sessão leve para hidratação e brilho.' },
    ],
    benefits: ['Reservas rápidas pelo WhatsApp', 'Visual premium para beleza', 'Serviços claros com preço visível', 'Ideal para clientes recorrentes'],
    testimonials: [
      { name: 'Mariana R.', text: 'Marquei pelo WhatsApp e já fui com o serviço escolhido.', rating: 5, photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop' },
      { name: 'Beatriz S.', text: 'A página passa cuidado e confiança antes de agendar.', rating: 5, photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop' },
      { name: 'Sofia P.', text: 'Consegui ver preços, fotos e horários em poucos segundos.', rating: 5, photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=200&auto=format&fit=crop' },
    ],
    faqs: [
      { question: 'Preciso marcar horário?', answer: 'Sim. O ideal é enviar mensagem pelo WhatsApp para garantir disponibilidade.' },
      { question: 'Serve para salão e barbearia?', answer: 'Sim, a estrutura funciona para cabelo, barba, unhas, estética leve e beleza.' },
      { question: 'Posso mostrar fotos dos serviços?', answer: 'Sim, a galeria ajuda clientes a confiar antes de agendar.' },
      { question: 'Atendem sem marcação?', answer: 'Quando há vaga sim, mas marcação pelo WhatsApp é recomendada.' },
    ],
    hours: defaultHours,
  },
  {
    slug: 'clinica',
    variant: 'clinic',
    businessName: 'Clínica Bella Pele',
    category: 'Clínicas: estética, saúde e serviços especializados',
    headline: 'Tratamentos e consultas com uma experiência digital que passa confiança.',
    subheadline: 'Estrutura indicada para clínicas, personal trainers, terapeutas, estética avançada e serviços que precisam explicar valor antes da marcação.',
    whatsappNumber: '+351 914 567 890',
    whatsappMessage: 'Olá! Vi a página da Clínica Bella Pele e quero marcar uma avaliação.',
    address: 'Rua do Salitre 45, Lisboa, Portugal',
    email: 'contacto@bellapele.pt',
    phone: '+351 914 567 890',
    theme: { badge: 'Beauty clinic', primary: 'bg-rose-950', accent: 'text-rose-200' },
    photos: [
      'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?q=80&w=1200&auto=format&fit=crop',
    ],
    services: [
      { name: 'Limpeza de pele', price: '55€', description: 'Tratamento facial para renovar e hidratar.' },
      { name: 'Depilação laser', price: 'desde 35€', description: 'Sessões por zona com avaliação inicial.' },
      { name: 'Massagem modeladora', price: '45€', description: 'Sessões focadas em bem-estar e contorno.' },
      { name: 'Avaliação estética', price: 'gratuita', description: 'Conversa inicial para indicar o melhor tratamento.' },
    ],
    benefits: ['Avaliação antes do tratamento', 'Ambiente limpo e acolhedor', 'Explicação clara dos cuidados', 'Marcação simples pelo WhatsApp'],
    testimonials: [
      { name: 'Inês F.', text: 'A página me passou confiança e marquei avaliação em poucos minutos.', rating: 5, photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop' },
      { name: 'Beatriz C.', text: 'Atendimento calmo, profissional e muito cuidadoso.', rating: 5, photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop' },
      { name: 'Mariana T.', text: 'Gostei de ver serviços e dúvidas respondidas antes de contactar.', rating: 4, photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=200&auto=format&fit=crop' },
    ],
    faqs: [
      { question: 'Preciso fazer avaliação?', answer: 'Sim, a avaliação ajuda a indicar o tratamento mais adequado para cada pessoa.' },
      { question: 'Os tratamentos têm contraindicações?', answer: 'Alguns podem ter. A equipa explica todos os cuidados antes de iniciar.' },
      { question: 'Posso marcar pelo WhatsApp?', answer: 'Sim, envie uma mensagem e confirme o melhor horário disponível.' },
      { question: 'Quanto tempo dura uma sessão?', answer: 'Depende do tratamento, geralmente entre 30 e 60 minutos.' },
    ],
    hours: defaultHours,
  },
]

export function getCommercialDemo(slug: string) {
  const aliases: Record<string, CommercialDemo['slug']> = {
    comida: 'restauracao',
    restaurante: 'restauracao',
    barbearia: 'salao',
    estetica: 'escritorio',
    clinica: 'escritorio',
    advocacia: 'escritorio',
  }
  const normalizedSlug = aliases[slug] ?? slug
  return commercialDemos.find((demo) => demo.slug === normalizedSlug)
}
