export type LandingThemeId =
  | 'golden-hour'
  | 'rose-studio'
  | 'coastal-sky'
  | 'mint-light'
  | 'terracotta-glow'
  | 'champagne-night'
  | 'slate-luxe'

export interface LandingThemeOption {
  id: LandingThemeId
  label: string
  tip: string
  primaryColor: string
  accentColor: string
  pageBackground: string
  heroBackground: string
  softSectionBackground: string
  cardBackground: string
  accentSoft: string
  accentStrong: string
}

export const LANDING_THEME_OPTIONS: LandingThemeOption[] = [
  {
    id: 'golden-hour',
    label: 'Golden Hour',
    tip: 'Luz quente e premium.',
    primaryColor: '#111827',
    accentColor: '#F0B429',
    pageBackground: 'linear-gradient(180deg, #fff8eb 0%, #fffdf8 44%, #f6ead1 100%)',
    heroBackground: 'radial-gradient(circle at top left, rgba(240,180,41,0.26), transparent 34%), linear-gradient(135deg, #fff1d1 0%, #fff9ec 44%, #e9d2a1 100%)',
    softSectionBackground: 'linear-gradient(180deg, rgba(255,244,218,0.96) 0%, rgba(255,252,244,0.98) 100%)',
    cardBackground: '#fffdf8',
    accentSoft: 'rgba(240,180,41,0.18)',
    accentStrong: '#8A5A00',
  },
  {
    id: 'rose-studio',
    label: 'Rose Studio',
    tip: 'Claro, delicado e elegante.',
    primaryColor: '#1F2937',
    accentColor: '#F04F83',
    pageBackground: 'linear-gradient(180deg, #fff0f5 0%, #fff8fb 44%, #f9dce6 100%)',
    heroBackground: 'radial-gradient(circle at top left, rgba(240,79,131,0.24), transparent 34%), linear-gradient(135deg, #ffe3ec 0%, #fff7fa 42%, #f5c7d8 100%)',
    softSectionBackground: 'linear-gradient(180deg, rgba(255,235,242,0.95) 0%, rgba(255,249,251,0.98) 100%)',
    cardBackground: '#fffafc',
    accentSoft: 'rgba(240,79,131,0.18)',
    accentStrong: '#B61F56',
  },
  {
    id: 'coastal-sky',
    label: 'Coastal Sky',
    tip: 'Ar limpo com confiança leve.',
    primaryColor: '#0F172A',
    accentColor: '#0EA5E9',
    pageBackground: 'linear-gradient(180deg, #edf7ff 0%, #f9fcff 44%, #d9eeff 100%)',
    heroBackground: 'radial-gradient(circle at top left, rgba(14,165,233,0.24), transparent 34%), linear-gradient(135deg, #dff4ff 0%, #f5fbff 42%, #c4e4fb 100%)',
    softSectionBackground: 'linear-gradient(180deg, rgba(226,244,255,0.95) 0%, rgba(249,252,255,0.98) 100%)',
    cardBackground: '#fdfefe',
    accentSoft: 'rgba(14,165,233,0.18)',
    accentStrong: '#0369A1',
  },
  {
    id: 'mint-light',
    label: 'Mint Light',
    tip: 'Fresco, natural e acolhedor.',
    primaryColor: '#0F172A',
    accentColor: '#10B981',
    pageBackground: 'linear-gradient(180deg, #effdf6 0%, #fbfffd 46%, #d7f4e7 100%)',
    heroBackground: 'radial-gradient(circle at top left, rgba(16,185,129,0.24), transparent 34%), linear-gradient(135deg, #dbf7ea 0%, #f9fffc 42%, #bfe8d5 100%)',
    softSectionBackground: 'linear-gradient(180deg, rgba(227,250,239,0.95) 0%, rgba(251,255,253,0.98) 100%)',
    cardBackground: '#fcfffd',
    accentSoft: 'rgba(16,185,129,0.18)',
    accentStrong: '#047857',
  },
  {
    id: 'terracotta-glow',
    label: 'Terracotta Glow',
    tip: 'Mais humano e artesanal.',
    primaryColor: '#1C1917',
    accentColor: '#E76F51',
    pageBackground: 'linear-gradient(180deg, #fff3ee 0%, #fffaf7 44%, #f3d1c5 100%)',
    heroBackground: 'radial-gradient(circle at top left, rgba(231,111,81,0.24), transparent 34%), linear-gradient(135deg, #ffe4da 0%, #fff8f4 42%, #ebb4a2 100%)',
    softSectionBackground: 'linear-gradient(180deg, rgba(255,234,227,0.95) 0%, rgba(255,249,246,0.98) 100%)',
    cardBackground: '#fffaf8',
    accentSoft: 'rgba(231,111,81,0.18)',
    accentStrong: '#B4472A',
  },
  {
    id: 'champagne-night',
    label: 'Champagne Night',
    tip: 'Luxo claro com contraste suave.',
    primaryColor: '#0F172A',
    accentColor: '#D6A756',
    pageBackground: 'linear-gradient(180deg, #f5efe3 0%, #fbf7ef 42%, #e4d0aa 100%)',
    heroBackground: 'radial-gradient(circle at top left, rgba(214,167,86,0.22), transparent 34%), linear-gradient(135deg, #efe0bf 0%, #faf4e8 40%, #b9a077 100%)',
    softSectionBackground: 'linear-gradient(180deg, rgba(246,236,214,0.94) 0%, rgba(252,247,238,0.97) 100%)',
    cardBackground: '#fffdf8',
    accentSoft: 'rgba(214,167,86,0.2)',
    accentStrong: '#8B5E1A',
  },
  {
    id: 'slate-luxe',
    label: 'Slate Luxe',
    tip: 'Mais sério, limpo e sofisticado.',
    primaryColor: '#0F172A',
    accentColor: '#475569',
    pageBackground: 'linear-gradient(180deg, #e9eef5 0%, #f6f8fb 42%, #cdd7e4 100%)',
    heroBackground: 'radial-gradient(circle at top left, rgba(71,85,105,0.24), transparent 34%), linear-gradient(135deg, #d9e1ea 0%, #f4f7fb 40%, #a9b7c8 100%)',
    softSectionBackground: 'linear-gradient(180deg, rgba(230,237,245,0.95) 0%, rgba(247,249,252,0.98) 100%)',
    cardBackground: '#fbfcfe',
    accentSoft: 'rgba(71,85,105,0.18)',
    accentStrong: '#1E293B',
  },
]

export function getLandingTheme(themeId?: string | null) {
  return LANDING_THEME_OPTIONS.find((theme) => theme.id === themeId) ?? LANDING_THEME_OPTIONS[0]
}
