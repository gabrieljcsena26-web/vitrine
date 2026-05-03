export interface CommercialDemo {
  slug: 'barbearia' | 'limpeza' | 'estetica' | 'comida' | 'advocacia'
  variant?: 'standard' | 'food' | 'professional'
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
  services: { name: string; price: string; description: string }[]
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
    slug: 'comida',
    variant: 'food',
    businessName: 'Mesa Viva Kitchen',
    category: 'Comida & cardápio QR',
    headline: 'Cardápio bonito, pedido rápido e QR Code direto para o menu.',
    subheadline: 'Uma estrutura feita para negócios de comida: destaques visuais, menu completo, WhatsApp, QR de mesa e fotos que dão vontade de pedir.',
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
      { name: 'Menu executivo', price: '12€', description: 'Prato do dia, bebida e sobremesa em decisão rápida.' },
      { name: 'Burger artesanal', price: '14€', description: 'Carne premium, pão brioche e molho da casa.' },
      { name: 'Bowl fresco', price: '11€', description: 'Opção leve, colorida e perfeita para almoço.' },
      { name: 'Sobremesa da casa', price: '6€', description: 'Final doce para aumentar o ticket médio.' },
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
    slug: 'advocacia',
    variant: 'professional',
    businessName: 'Almeida & Rocha Advocacia',
    category: 'Advocacia & consultoria',
    headline: 'Página profissional para gerar confiança antes da primeira consulta.',
    subheadline: 'Uma estrutura mais sóbria para advogados, consultores e freelancers: áreas de atuação, processo claro, prova de autoridade e contacto qualificado.',
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
    benefits: ['Imagem sóbria e confiável', 'Contato qualificado por WhatsApp', 'Áreas de atuação claras', 'FAQ para reduzir dúvidas'],
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
    slug: 'barbearia',
    businessName: 'Barbearia Dom Corte',
    category: 'Barbearia premium',
    headline: 'Corte, barba e estilo com marcação rápida pelo WhatsApp.',
    subheadline: 'Uma landing page pensada para transformar visitas do Instagram e Google em agendamentos reais.',
    whatsappNumber: '+351 912 345 678',
    whatsappMessage: 'Olá! Vi a página da Barbearia Dom Corte e quero agendar um corte.',
    address: 'Rua Augusta 120, Lisboa, Portugal',
    email: 'agenda@domcorte.pt',
    phone: '+351 912 345 678',
    theme: { badge: 'Premium grooming', primary: 'bg-stone-950', accent: 'text-amber-400' },
    photos: [
      'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=1200&auto=format&fit=crop',
    ],
    services: [
      { name: 'Corte masculino', price: '25€', description: 'Corte personalizado com acabamento profissional.' },
      { name: 'Barba completa', price: '18€', description: 'Toalha quente, navalha e hidratação.' },
      { name: 'Corte + barba', price: '38€', description: 'Pacote completo para sair pronto.' },
      { name: 'Sobrancelha', price: '8€', description: 'Detalhe rápido para completar o visual.' },
    ],
    benefits: ['Marcação rápida pelo WhatsApp', 'Ambiente premium e pontual', 'Serviços claros com preço visível', 'Ideal para clientes recorrentes'],
    testimonials: [
      { name: 'Miguel R.', text: 'Marquei pelo WhatsApp e fui atendido no horário. Corte impecável.', rating: 5, photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop' },
      { name: 'André S.', text: 'A página é simples, bonita e consegui ver preços antes de ir.', rating: 4, photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop' },
      { name: 'João P.', text: 'Barba muito bem feita e atendimento profissional.', rating: 5, photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop' },
    ],
    faqs: [
      { question: 'Preciso marcar horário?', answer: 'Sim. O ideal é enviar mensagem pelo WhatsApp para garantir disponibilidade.' },
      { question: 'Aceitam pagamento por cartão?', answer: 'Sim, pagamentos por cartão e dinheiro podem ser confirmados diretamente com a barbearia.' },
      { question: 'Quanto tempo demora corte e barba?', answer: 'Em média 45 a 60 minutos, dependendo do serviço escolhido.' },
      { question: 'Atendem sem marcação?', answer: 'Quando há vaga sim, mas marcação pelo WhatsApp é recomendada.' },
    ],
    hours: defaultHours,
  },
  {
    slug: 'limpeza',
    businessName: 'Brilho Total Limpezas',
    category: 'Empresa de limpeza',
    headline: 'Limpeza residencial, escritórios e pós-obra com orçamento rápido.',
    subheadline: 'Uma página direta para receber pedidos de orçamento, mostrar confiança e captar contactos qualificados.',
    whatsappNumber: '+351 913 456 789',
    whatsappMessage: 'Olá! Vi a página da Brilho Total e quero pedir um orçamento de limpeza.',
    address: 'Avenida da República 88, Porto, Portugal',
    email: 'orcamentos@brilhototal.pt',
    phone: '+351 913 456 789',
    theme: { badge: 'Trusted cleaning', primary: 'bg-sky-950', accent: 'text-cyan-300' },
    photos: [
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1585421514738-01798e348b17?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1563453392212-326f5e854473?q=80&w=1200&auto=format&fit=crop',
    ],
    services: [
      { name: 'Limpeza residencial', price: 'desde 49€', description: 'Casas e apartamentos com equipa profissional.' },
      { name: 'Limpeza pós-obra', price: 'sob orçamento', description: 'Remoção de pó, resíduos e limpeza profunda.' },
      { name: 'Escritórios', price: 'mensal', description: 'Planos recorrentes para empresas locais.' },
      { name: 'Alojamento local', price: 'por visita', description: 'Preparação rápida para novos hóspedes.' },
    ],
    benefits: ['Orçamento rápido pelo WhatsApp', 'Equipa treinada e confiável', 'Produtos e materiais organizados', 'Planos únicos ou recorrentes'],
    testimonials: [
      { name: 'Carla M.', text: 'Pedi orçamento pela página e responderam muito rápido.', rating: 5, photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop' },
      { name: 'Rui A.', text: 'Excelente para o nosso escritório. Serviço consistente.', rating: 4, photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop' },
      { name: 'Sofia L.', text: 'Contratei pós-obra e ficou tudo pronto no prazo.', rating: 5, photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop' },
    ],
    faqs: [
      { question: 'Como peço orçamento?', answer: 'Clique no WhatsApp e envie morada, tipo de limpeza e tamanho aproximado do espaço.' },
      { question: 'Levam produtos de limpeza?', answer: 'Sim, pode ser combinado de acordo com o serviço contratado.' },
      { question: 'Fazem limpeza recorrente?', answer: 'Sim, existem planos semanais, quinzenais e mensais.' },
      { question: 'Atendem empresas?', answer: 'Sim, escritórios, lojas, clínicas e alojamentos locais.' },
    ],
    hours: defaultHours,
  },
  {
    slug: 'estetica',
    businessName: 'Clínica Bella Pele',
    category: 'Clínica de estética',
    headline: 'Tratamentos estéticos com avaliação rápida e atendimento cuidadoso.',
    subheadline: 'Uma landing page elegante para gerar confiança, mostrar tratamentos e receber marcações qualificadas.',
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
  return commercialDemos.find((demo) => demo.slug === slug)
}
