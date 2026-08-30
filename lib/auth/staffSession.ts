/**
 * Блок 2, группа D (пункт 8) — роль вошедшего сотрудника и таблица служебных экранов.
 *
 * Роль берётся из НАСТОЯЩЕЙ сессии Supabase Auth: `app_metadata.role` в JWT
 * (ставится только service-role ключом — панель Supabase или `scripts/create-staff-users.mjs`).
 * Ранее (группа C) роль лежала во временном маркере localStorage `daymohk_staff_session`,
 * который ставил экран входа; этот маркер и `FALLBACK_NAV_ROLE` удалены.
 *
 * Guard страниц кабинетов — `middleware.ts` (нет сессии или `status != 'ACTIVE'` →
 * редирект на вход). Навигационный доступ к экрану не расширяет прав на данные:
 * маскирование и RLS (`supabase/migrations/00013_rls_policies.sql`) сохраняются
 * (specs/04_technical_specs/Technical_Access_Audit.md §4–§5, §17).
 */

import { createClient } from '../supabase/client';

export type StaffRole = 'ADMIN' | 'MANAGER' | 'KITCHEN' | 'COURIER' | 'RESOLUTION_OFFICER';

export function isStaffRole(value: unknown): value is StaffRole {
  return (
    value === 'ADMIN' ||
    value === 'MANAGER' ||
    value === 'KITCHEN' ||
    value === 'COURIER' ||
    value === 'RESOLUTION_OFFICER'
  );
}

/**
 * Роль текущего вошедшего сотрудника или `null`, если сессии нет.
 * Читается на клиенте из проверенной сессии Supabase (`getUser` сверяет JWT с сервером).
 */
export async function getStaffRole(): Promise<StaffRole | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return null;
    const role = (data.user.app_metadata as Record<string, unknown> | undefined)?.role;
    return isStaffRole(role) ? role : null;
  } catch {
    return null;
  }
}

/** Выход сотрудника: снимает сессию Supabase (куки чистятся автоматически). */
export async function signOutStaff(): Promise<void> {
  try {
    const supabase = createClient();
    await supabase.auth.signOut();
  } catch {
    /* сеть недоступна — сессия всё равно истечёт по сроку JWT */
  }
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

/** Стартовый экран роли после входа. */
export function homeScreenForRole(role: StaffRole): string {
  switch (role) {
    case 'ADMIN':
      return '/admin/dashboard';
    case 'KITCHEN':
      return '/kitchen/dashboard';
    case 'COURIER':
      return '/courier/dashboard';
    case 'RESOLUTION_OFFICER':
      return '/resolution/cases';
    case 'MANAGER':
    default:
      return '/manager/crm';
  }
}
