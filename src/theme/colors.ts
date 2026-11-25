/** Brand palette taken from the Specialty365 designs. */
export const colors = {
  primary: '#4B4FE6',
  primaryPressed: '#3B3FCC',
  primarySoft: '#ECEBFD',
  primaryMuted: '#A5A7F0',

  headerGradient: ['#23247F', '#3D3FC4', '#5559EA'] as const,

  background: '#F7F8FB',
  surface: '#FFFFFF',
  surfaceMuted: '#F2F3F7',
  border: '#E5E7EE',

  text: '#1D2030',
  textSecondary: '#5F6577',
  textMuted: '#A1A6B4',
  textOnPrimary: '#FFFFFF',

  info: '#3B82F6',
  success: '#2E9E5B',
  danger: '#D64545',
  unreadDot: '#3B82F6',
} as const;

export const radius = { sm: 6, md: 10, lg: 14, pill: 999 } as const;
