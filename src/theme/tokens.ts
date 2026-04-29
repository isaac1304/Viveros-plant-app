// Design tokens — Verdor (default brand)
// Tenant white-label override of primaryColor lands in Phase 4.
// Source paleta: design_handoff_vivero_zamorano (verde Zamorano, base por ahora).

export const colors = {
  // Brand greens
  brand: {
    900: '#0F3D2E',
    700: '#1F6B3A',
    500: '#3DA35D',
    300: '#7FC096',
    100: '#E6F4EA',
    50: '#F2FAF5',
  },
  // Warm accents
  accent: {
    warm: '#C97B5A',       // Terracota — alertas warm, badges secundarios
    sun: '#F2C94C',        // Amarillo — guías de cámara, scanline, CTA Club
    earth: '#6B4423',      // Marrón — texto sobre fondo arena
    // Aliases for backwards compat
    terracotta: '#C97B5A',
  },
  // Semantic
  semantic: {
    error: '#D64545',
    warning: '#F2994A',
    success: '#27AE60',
    info: '#2D9CDB',
  },
  // Surfaces
  surface: {
    base: '#FAF7F2',
    raised: '#FFFFFF',
    sunken: '#F0EBE0',
  },
  // Text
  text: {
    primary: '#1A1F1B',
    secondary: '#5C6660',
    tertiary: '#8C9690',
    inverse: '#FFFFFF',
  },
  // Borders
  border: {
    subtle: '#E8E4DC',
    strong: '#C9C2B6',
  },
  // Severity
  severity: {
    info: '#3DA35D',
    warning: '#F2994A',
    danger: '#D64545',
  },
  // Special
  whatsapp: '#25D366',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
  '4xl': 64,
} as const;

// Density scale — handoff: cardPad 16 / cardGap 12 / cardRadius 22 / sectionGap 28
export const density = {
  cardPad: 16,
  cardGap: 12,
  cardRadius: 22,
  sectionGap: 28,
  listPad: 16,
} as const;

export const radius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 22,
  '2xl': 28,
  full: 999,
} as const;

// Shadow scale — matches handoff README
export const shadows = {
  // 0 2px 10px rgba(15,61,46,0.06) — card resting
  card: {
    shadowColor: '#0F3D2E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  // 0 8px 22px rgba(15,61,46,0.22) — CTA
  cta: {
    shadowColor: '#0F3D2E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 22,
    elevation: 8,
  },
  // 0 12px 28px rgba(15,61,46,0.28) — FAB, hero
  fab: {
    shadowColor: '#0F3D2E',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.28,
    shadowRadius: 28,
    elevation: 12,
  },
  // 0 16px 36px rgba(15,61,46,0.30) — hero imagery
  hero: {
    shadowColor: '#0F3D2E',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.3,
    shadowRadius: 36,
    elevation: 16,
  },
  // 0 24px 60px rgba(15,61,46,0.22) — onboarding circles
  onboarding: {
    shadowColor: '#0F3D2E',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.22,
    shadowRadius: 60,
    elevation: 18,
  },
  // Aliased
  raised: {
    shadowColor: '#0F3D2E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  floating: {
    shadowColor: '#0F3D2E',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },
} as const;
