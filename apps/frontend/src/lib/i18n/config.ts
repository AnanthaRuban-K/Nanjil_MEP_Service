// lib/i18n/config.ts (Fixed)
export const i18n = {
  defaultLocale: 'tamil' as const,
  locales: ['tamil', 'english'] as const,
} as const;

export type Locale = typeof i18n.locales[number];

