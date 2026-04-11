// Localização para o componente Localizacao
export const localizacaoLocales = {
  pt: {
    labels: {
      venhaVisitar: "VENHA NOS VISITAR",
      ondeEstamos: "ONDE ESTAMOS",
      endereco: "Endereço",
      horariosDosCultos: "Horários dos Cultos",
      comoChegar: "COMO CHEGAR",
    },
    endereco: {
      rua: "Rua Osni João Vieira",
      cidade: "São José — SC",
      completo: "Rua Osni João Vieira, São José - SC",
    },
    cultos: [
      { dia: "Domingo", horario: "19:00" },
    ],
    accessibility: {
      mapTitle: "Localização da Igreja Eu Sou",
    },
  },
  en: {
    labels: {
      venhaVisitar: "VISIT US",
      ondeEstamos: "WHERE WE ARE",
      endereco: "Address",
      horariosDosCultos: "Service Times",
      comoChegar: "GET DIRECTIONS",
    },
    endereco: {
      rua: "Rua Osni João Vieira",
      cidade: "São José — SC",
      completo: "Rua Osni João Vieira, São José - SC",
    },
    cultos: [
      { dia: "Sunday", horario: "19:00" },
    ],
    accessibility: {
      mapTitle: "Location of Eu Sou Church",
    },
  },
  es: {
    labels: {
      venhaVisitar: "VISÍTANOS",
      ondeEstamos: "DÓNDE ESTAMOS",
      endereco: "Dirección",
      horariosDosCultos: "Horarios de Servicios",
      comoChegar: "CÓMO LLEGAR",
    },
    endereco: {
      rua: "Rua Osni João Vieira",
      cidade: "São José — SC",
      completo: "Rua Osni João Vieira, São José - SC",
    },
    cultos: [
      { dia: "Domingo", horario: "19:00" },
    ],
    accessibility: {
      mapTitle: "Ubicación de la Iglesia Eu Sou",
    },
  },
};

// Tipo para as localizações
export type LocalizacaoLocale = typeof localizacaoLocales.pt;

// Função auxiliar para obter localização com fallback
export function getLocalizacaoLocale(lang: string = "pt"): LocalizacaoLocale {
  return localizacaoLocales[lang as keyof typeof localizacaoLocales] || localizacaoLocales.pt;
}
