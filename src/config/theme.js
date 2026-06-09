// ─── Дизайн-система ──────────────────────────────────────────────────────────

export const COLORS = {
  // Бренд
  primary:       '#1565C0',   // Основной синий
  primaryDark:   '#003c8f',
  primaryLight:  '#5e92f3',
  accent:        '#FF8F00',   // Янтарный (акцент)
  accentLight:   '#ffc046',

  // Фон и поверхности
  background:    '#F0F4F8',
  card:          '#FFFFFF',
  cardAlt:       '#F8FAFC',

  // Текст
  text:          '#0D1B2A',
  textSecondary: '#546E7A',
  textLight:     '#90A4AE',
  textInverse:   '#FFFFFF',

  // Статусы
  success:       '#2E7D32',
  successBg:     '#E8F5E9',
  warning:       '#E65100',
  warningBg:     '#FFF3E0',
  error:         '#C62828',
  errorBg:       '#FFEBEE',
  info:          '#0277BD',
  infoBg:        '#E1F5FE',
  pending:       '#F57F17',
  pendingBg:     '#FFF8E1',

  // UI
  border:        '#CFD8DC',
  divider:       '#ECEFF1',
  shadow:        'rgba(21, 101, 192, 0.12)',
  overlay:       'rgba(0, 0, 0, 0.5)',
  inputBg:       '#F5F9FF',
};

export const SPACING = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
};

export const RADIUS = {
  sm:    8,
  md:   12,
  lg:   16,
  xl:   24,
  pill: 999,
};

export const SHADOW = {
  card: {
    shadowColor:   COLORS.shadow,
    shadowOffset:  { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius:  8,
    elevation:     3,
  },
  strong: {
    shadowColor:   COLORS.primary,
    shadowOffset:  { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius:  12,
    elevation:     6,
  },
};
