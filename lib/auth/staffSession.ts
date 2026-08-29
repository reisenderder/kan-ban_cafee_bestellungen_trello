/**
 * Блок 2, пункт 5 — источник роли для служебной навигации (`components/StaffTopNav.tsx`).
 *
 * ВРЕМЕННОЕ РЕШЕНИЕ (вариант A плана). Настоящий вход через Supabase Auth появляется
 * в группе D — тогда роль будет читаться из `app_metadata` JWT
 * (`auth.jwt() -> 'app_metadata' ->> 'role'`), а этот модуль либо удаляется, либо
 * оборачивает реальную сессию. Сейчас роль кладёт в localStorage временно
 * доработанный экран входа (`app/login/page.tsx`).
 *
 * Пока настоящей проверки нет, метку можно подставить руками через devtools — это
 * осознанный компромисс: guard страниц (`middleware.ts`) и RLS восстанавливаются
 * в группе D. Навигационный доступ к экрану всё равно не расширяет права на данные —
 * маскирование и контекст на каждом экране сохраняются
 * (specs/04_technical_specs/Technical_Access_Audit.md §4–§5).
 */

export type StaffRole = 'ADMIN' | 'MANAGER' | 'KITCHEN' | 'COURIER' | 'RESOLUTION_OFFICER';

export interface StaffSession {
  role: StaffRole;
  email?: string;
}

const STAFF_SESSION_KEY = 'daymohk_staff_session';

export function getStaffSession(): StaffSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STAFF_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StaffSession>;
    if (parsed && isStaffRole(parsed.role)) {
      return { role: parsed.role, email: typeof parsed.email === 'string' ? parsed.email : undefined };
    }
  } catch {
    /* повреждённое значение — считаем, что сессии нет */
  }
  return null;
}

export function setStaffSession(session: StaffSession): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STAFF_SESSION_KEY, JSON.stringify(session));
  } catch {
    /* приватный режим / переполнение — навигация просто откатится на дефолт */
  }
}

export function clearStaffSession(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STAFF_SESSION_KEY);
  } catch {
    /* no-op */
  }
}

function isStaffRole(value: unknown): value is StaffRole {
  return (
    value === 'ADMIN' ||
    value === 'MANAGER' ||
    value === 'KITCHEN' ||
    value === 'COURIER' ||
    value === 'RESOLUTION_OFFICER'
  );
}

/** Ключ служебного экрана — используется и в навигации, и на самих страницах. */
export type StaffScreenKey = 'crm' | 'kitchen' | 'courier' | 'resolution' | 'admin';

export interface StaffScreen {
  key: StaffScreenKey;
  /** Короткая подпись для полоски навигации. */
  label: string;
  href: string;
  /** false → раздел ещё не работает полноценно, в навигации помечается «(на разработке)». */
  ready: boolean;
}

/**
 * Полный список служебных экранов. Порядок = порядок ссылок в полоске.
 * Курьер и отдел урегулирования в Блоке 2 — только заглушки (`ready: false`).
 */
export const STAFF_SCREENS: StaffScreen[] = [
  { key: 'crm', label: 'CRM менеджера', href: '/manager/crm', ready: true },
  { key: 'kitchen', label: 'Экран кухни', href: '/kitchen/dashboard', ready: true },
  { key: 'courier', label: 'Курьеры', href: '/courier/dashboard', ready: false },
  { key: 'resolution', label: 'Урегулирование', href: '/resolution/cases', ready: false },
  { key: 'admin', label: 'Администрирование', href: '/admin/dashboard', ready: true },
];

/**
 * Какие экраны доступны в навигации по роли вошедшего
 * (specs/03_feature_specs/Feature_Admin_Control.md §17 п.7):
 *  - ADMIN — все, включая админский;
 *  - MANAGER, RESOLUTION_OFFICER — все, кроме админского;
 *  - KITCHEN, COURIER — только свой экран, переходов нет.
 */
export function screensForRole(role: StaffRole): StaffScreen[] {
  switch (role) {
    case 'ADMIN':
      return STAFF_SCREENS;
    case 'MANAGER':
    case 'RESOLUTION_OFFICER':
      return STAFF_SCREENS.filter((s) => s.key !== 'admin');
    case 'KITCHEN':
      return STAFF_SCREENS.filter((s) => s.key === 'kitchen');
    case 'COURIER':
      return STAFF_SCREENS.filter((s) => s.key === 'courier');
    default:
      return [];
  }
}

/**
 * Роль, из которой строится навигация, когда маркера сессии нет (зашли на экран
 * напрямую). По плану — «как для админа + менеджера», то есть самый широкий набор,
 * чтобы никто не застрял без навигации. В группе D это заменяется на редирект
 * неаутентифицированного пользователя на страницу входа.
 */
export const FALLBACK_NAV_ROLE: StaffRole = 'ADMIN';
