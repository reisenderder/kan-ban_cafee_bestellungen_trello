import type { Metadata } from 'next';

/**
 * Блок 2, группа D (пункт 8) — страница служебного входа скрыта из поисковой
 * индексации. Непубличность пути — удобство против случайных заходов, а не мера
 * безопасности (`Technical_Access_Audit.md` §18 п.9).
 */
export const metadata: Metadata = {
  title: 'Служебный вход | DAYMOHKCOFEE',
  robots: { index: false, follow: false },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
