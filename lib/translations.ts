export type Language = 'pt' | 'es' | 'en' | 'fr'

export const translations = {
  pt: {
    nav: {
      about: 'Sobre',
      services: 'Serviços',
      gallery: 'Galeria',
      hours: 'Horários',
      contact: 'Contacto',
      bookNow: 'Reservar',
    },
    hero: {
      tagline: 'Onde o estilo encontra a perfeição',
      bookNow: 'Reservar Agora',
      seeServices: 'Ver Serviços',
    },
    about: {
      title: 'Sobre Nós',
      description: 'No Studio Elegance acreditamos que cada cliente merece um tratamento único e personalizado. A nossa equipa de profissionais especializados combina técnicas modernas com um serviço caloroso e acolhedor. Situado no coração de Madrid, o nosso salão é um refúgio de beleza e bem-estar.',
    },
    services: {
      title: 'Os Nossos Serviços',
      subtitle: 'Cuidados de beleza premium para cada ocasião',
      items: [
        { name: 'Corte de Cabelo', price: '25€', description: 'Corte de precisão adaptado ao formato do seu rosto e preferências de estilo' },
        { name: 'Coloração', price: '65€', description: 'Coloração total, mechas, balayage — tudo com produtos premium' },
        { name: 'Tratamento', price: '45€', description: 'Tratamentos de hidratação profunda e reparação para um cabelo saudável e brilhante' },
        { name: 'Brushing', price: '30€', description: 'Brushing profissional para volume, suavidade e estilo duradouro' },
      ],
    },
    gallery: {
      title: 'Galeria',
      subtitle: 'Conheça o nosso trabalho',
    },
    hours: {
      title: 'Horários de Funcionamento',
      days: {
        monday: 'Segunda-feira',
        tuesday: 'Terça-feira',
        wednesday: 'Quarta-feira',
        thursday: 'Quinta-feira',
        friday: 'Sexta-feira',
        saturday: 'Sábado',
        sunday: 'Domingo',
      },
      closed: 'Fechado',
    },
    contact: {
      title: 'Contacte-nos',
      subtitle: 'Estamos aqui para ajudar',
      name: 'Nome',
      email: 'Email',
      message: 'Mensagem',
      send: 'Enviar Mensagem',
      success: 'Mensagem enviada com sucesso! Entraremos em contacto em breve.',
      namePlaceholder: 'O seu nome',
      emailPlaceholder: 'o.seu@email.com',
      messagePlaceholder: 'Como podemos ajudar?',
    },
    footer: {
      rights: 'Todos os direitos reservados',
      poweredBy: 'Criado com Vitrine',
    },
    booking: {
      title: 'Agende a sua consulta',
      subtitle: 'Escolha o melhor horário para si',
      cta: 'Agendar Agora',
    },
    whatsapp: {
      label: 'Fale pelo WhatsApp',
    },
    chatbot: {
      greeting: 'Olá! Bem-vindo ao Studio Elegance 👋 Como posso ajudar?',
      placeholder: 'Escreva a sua mensagem...',
      responses: {
        booking: 'Para reservar uma marcação, ligue para +34 91 234 5678 ou visite-nos em Calle Gran Vía 45, Madrid.',
        price: 'Os nossos preços são: Corte de Cabelo — 25€, Coloração — 65€, Tratamento — 45€, Brushing — 30€.',
        hours: 'Estamos abertos de Segunda a Sábado das 9:00 às 20:00. Domingo fechado.',
        default: 'Obrigado pela sua mensagem! Um membro da nossa equipa irá responder em breve. Para urgências, ligue +34 91 234 5678.',
      },
    },
  },
  es: {
    nav: {
      about: 'Sobre Nosotros',
      services: 'Servicios',
      gallery: 'Galería',
      hours: 'Horarios',
      contact: 'Contacto',
      bookNow: 'Reservar',
    },
    hero: {
      tagline: 'Donde el estilo se encuentra con la perfección',
      bookNow: 'Reservar Ahora',
      seeServices: 'Ver Servicios',
    },
    about: {
      title: 'Sobre Nosotros',
      description: 'En Studio Elegance creemos que cada cliente merece un trato único y personalizado. Nuestro equipo de profesionales especializados combina técnicas modernas con un servicio cálido y acogedor. Ubicados en el corazón de Madrid, nuestro salón es un refugio de belleza y bienestar.',
    },
    services: {
      title: 'Nuestros Servicios',
      subtitle: 'Cuidados de belleza premium para cada ocasión',
      items: [
        { name: 'Corte de Cabello', price: '25€', description: 'Corte de precisión adaptado a la forma de tu cara y preferencias de estilo' },
        { name: 'Coloración', price: '65€', description: 'Color completo, mechas, balayage — todo con productos premium' },
        { name: 'Tratamiento', price: '45€', description: 'Tratamientos de acondicionamiento profundo y reparación para un cabello sano y brillante' },
        { name: 'Brushing', price: '30€', description: 'Brushing profesional para volumen, suavidad y estilo duradero' },
      ],
    },
    gallery: {
      title: 'Galería',
      subtitle: 'Conoce nuestro trabajo',
    },
    hours: {
      title: 'Horario de Atención',
      days: {
        monday: 'Lunes',
        tuesday: 'Martes',
        wednesday: 'Miércoles',
        thursday: 'Jueves',
        friday: 'Viernes',
        saturday: 'Sábado',
        sunday: 'Domingo',
      },
      closed: 'Cerrado',
    },
    contact: {
      title: 'Contáctanos',
      subtitle: 'Estamos aquí para ayudarte',
      name: 'Nombre',
      email: 'Email',
      message: 'Mensaje',
      send: 'Enviar Mensaje',
      success: '¡Mensaje enviado con éxito! Te contactaremos pronto.',
      namePlaceholder: 'Tu nombre',
      emailPlaceholder: 'tu@email.com',
      messagePlaceholder: '¿Cómo podemos ayudarte?',
    },
    footer: {
      rights: 'Todos los derechos reservados',
      poweredBy: 'Creado con Vitrine',
    },
    booking: {
      title: 'Agenda tu cita',
      subtitle: 'Elige el mejor horario para ti',
      cta: 'Agendar Ahora',
    },
    whatsapp: {
      label: 'Hablar por WhatsApp',
    },
    chatbot: {
      greeting: '¡Hola! Bienvenido a Studio Elegance 👋 ¿Cómo puedo ayudarte?',
      placeholder: 'Escribe tu mensaje...',
      responses: {
        booking: 'Para reservar una cita, llama al +34 91 234 5678 o visítanos en Calle Gran Vía 45, Madrid.',
        price: 'Nuestros precios son: Corte de Cabello — 25€, Coloración — 65€, Tratamiento — 45€, Brushing — 30€.',
        hours: 'Estamos abiertos de Lunes a Sábado de 9:00 a 20:00. Domingo cerrado.',
        default: '¡Gracias por tu mensaje! Un miembro de nuestro equipo responderá pronto. Para urgencias, llama al +34 91 234 5678.',
      },
    },
  },
  en: {
    nav: {
      about: 'About',
      services: 'Services',
      gallery: 'Gallery',
      hours: 'Hours',
      contact: 'Contact',
      bookNow: 'Book Now',
    },
    hero: {
      tagline: 'Where style meets perfection',
      bookNow: 'Book Now',
      seeServices: 'See Services',
    },
    about: {
      title: 'About Us',
      description: 'At Studio Elegance we believe every client deserves a unique and personalized experience. Our team of specialized professionals combines modern techniques with warm, welcoming service. Located in the heart of Madrid, our salon is a sanctuary of beauty and wellbeing.',
    },
    services: {
      title: 'Our Services',
      subtitle: 'Premium beauty care for every occasion',
      items: [
        { name: 'Haircut', price: '25€', description: 'Precision cut tailored to your face shape and style preferences' },
        { name: 'Color', price: '65€', description: 'Full color, highlights, balayage — all with premium products' },
        { name: 'Treatment', price: '45€', description: 'Deep conditioning and repair treatments for healthy, shiny hair' },
        { name: 'Blowout', price: '30€', description: 'Professional blowout for volume, smoothness, and lasting style' },
      ],
    },
    gallery: {
      title: 'Gallery',
      subtitle: 'Discover our work',
    },
    hours: {
      title: 'Opening Hours',
      days: {
        monday: 'Monday',
        tuesday: 'Tuesday',
        wednesday: 'Wednesday',
        thursday: 'Thursday',
        friday: 'Friday',
        saturday: 'Saturday',
        sunday: 'Sunday',
      },
      closed: 'Closed',
    },
    contact: {
      title: 'Contact Us',
      subtitle: 'We are here to help',
      name: 'Name',
      email: 'Email',
      message: 'Message',
      send: 'Send Message',
      success: 'Message sent successfully! We will get back to you soon.',
      namePlaceholder: 'Your name',
      emailPlaceholder: 'your@email.com',
      messagePlaceholder: 'How can we help you?',
    },
    footer: {
      rights: 'All rights reserved',
      poweredBy: 'Built with Vitrine',
    },
    booking: {
      title: 'Schedule your appointment',
      subtitle: 'Pick the best time for you',
      cta: 'Book Now',
    },
    whatsapp: {
      label: 'Chat on WhatsApp',
    },
    chatbot: {
      greeting: 'Hello! Welcome to Studio Elegance 👋 How can I help you?',
      placeholder: 'Type your message...',
      responses: {
        booking: 'To book an appointment, call +34 91 234 5678 or visit us at Calle Gran Vía 45, Madrid.',
        price: 'Our prices: Haircut — 25€, Color — 65€, Treatment — 45€, Blowout — 30€.',
        hours: 'We are open Monday to Saturday from 9:00 to 20:00. Sunday closed.',
        default: 'Thank you for your message! A team member will respond shortly. For urgent inquiries, call +34 91 234 5678.',
      },
    },
  },
  fr: {
    nav: {
      about: 'À propos',
      services: 'Services',
      gallery: 'Galerie',
      hours: 'Horaires',
      contact: 'Contact',
      bookNow: 'Réserver',
    },
    hero: {
      tagline: 'Là où le style rencontre la perfection',
      bookNow: 'Réserver maintenant',
      seeServices: 'Voir les services',
    },
    about: {
      title: 'À propos de nous',
      description: 'Chez Studio Elegance, nous pensons que chaque client mérite une expérience unique et personnalisée. Notre équipe de professionnels combine des techniques modernes avec un accueil chaleureux. Situé au cœur de Madrid, notre salon est un espace dédié à la beauté et au bien-être.',
    },
    services: {
      title: 'Nos services',
      subtitle: 'Des soins premium pour chaque occasion',
      items: [
        { name: 'Coupe', price: '25€', description: 'Coupe précise adaptée à votre visage et à votre style' },
        { name: 'Coloration', price: '65€', description: 'Coloration complète, mèches, balayage avec des produits premium' },
        { name: 'Soin', price: '45€', description: 'Soins hydratants et réparateurs pour des cheveux sains et brillants' },
        { name: 'Brushing', price: '30€', description: 'Brushing professionnel pour volume, douceur et tenue longue durée' },
      ],
    },
    gallery: {
      title: 'Galerie',
      subtitle: 'Découvrez notre travail',
    },
    hours: {
      title: 'Horaires d’ouverture',
      days: {
        monday: 'Lundi',
        tuesday: 'Mardi',
        wednesday: 'Mercredi',
        thursday: 'Jeudi',
        friday: 'Vendredi',
        saturday: 'Samedi',
        sunday: 'Dimanche',
      },
      closed: 'Fermé',
    },
    contact: {
      title: 'Contactez-nous',
      subtitle: 'Nous sommes là pour vous aider',
      name: 'Nom',
      email: 'Email',
      message: 'Message',
      send: 'Envoyer le message',
      success: 'Message envoyé avec succès ! Nous vous contacterons bientôt.',
      namePlaceholder: 'Votre nom',
      emailPlaceholder: 'votre@email.com',
      messagePlaceholder: 'Comment pouvons-nous vous aider ?',
    },
    footer: {
      rights: 'Tous droits réservés',
      poweredBy: 'Créé avec Vitrine',
    },
    booking: {
      title: 'Planifiez votre rendez-vous',
      subtitle: 'Choisissez le meilleur créneau pour vous',
      cta: 'Réserver',
    },
    whatsapp: {
      label: 'Discuter sur WhatsApp',
    },
    chatbot: {
      greeting: 'Bonjour ! Bienvenue chez Studio Elegance 👋 Comment puis-je vous aider ?',
      placeholder: 'Écrivez votre message...',
      responses: {
        booking: 'Pour réserver un rendez-vous, appelez le +34 91 234 5678 ou visitez-nous à Calle Gran Vía 45, Madrid.',
        price: 'Nos prix : Coupe — 25€, Coloration — 65€, Soin — 45€, Brushing — 30€.',
        hours: 'Nous sommes ouverts du lundi au samedi de 9h00 à 20h00. Fermé le dimanche.',
        default: 'Merci pour votre message ! Un membre de notre équipe vous répondra bientôt. Pour une demande urgente, appelez le +34 91 234 5678.',
      },
    },
  },
}

export type Translations = typeof translations.en
