'use client';

/**
 * Блок 2, пункт 5 — тонкая полоска служебной навигации.
 *
 * Набор ссылок формируется по роли ВОШЕДШЕГО (а не по текущей странице): менеджер,
 * открывший экран кухни, всё равно видит свою полоску с возвратом в CRM; повар на том
 * же экране переходов не видит. Таблица ролей — в `lib/auth/staffSession.ts`
 * (`screensForRole`), спека `Feature_Admin_Control.md` §17 п.7.
 *
 * В Блоке 2 реально активны только роли ADMIN и MANAGER (учётки KITCHEN / COURIER /
 * RESOLUTION_OFFICER не выдаются — пункт 8). Компонент написан сразу с полной
 * таблицей, чтобы будущие блоки его не переписывали.
 *
 * Кнопка «← Назад» присутствует всегда. Роль сейчас берётся из временного маркера
 * localStorage; в группе D — из сессии Supabase Auth.
 */

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  StaffScreenKey,
  StaffRole,
  getStaffSession,
  clearStaffSession,
  screensForRole,
  FALLBACK_NAV_ROLE,
} from '../lib/auth/staffSession';

interface StaffTopNavProps {
  /** Ключ текущего экрана — он показывается как активный и не является ссылкой. */
  current: StaffScreenKey;
}

const ROLE_LABEL: Record<StaffRole, string> = {
  ADMIN: 'Администратор',
  MANAGER: 'Менеджер',
  KITCHEN: 'Кухня',
  COURIER: 'Курьер',
  RESOLUTION_OFFICER: 'Отдел урегулирования',
};

export function StaffTopNav({ current }: StaffTopNavProps) {
  const router = useRouter();
  // Роль читаем на клиенте после монтирования, чтобы не разошёлся SSR-рендер.
  const [role, setRole] = useState<StaffRole | null>(null);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    const session = getStaffSession();
    setRole(session?.role ?? FALLBACK_NAV_ROLE);
    setHasSession(!!session);
  }, []);

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  const handleLogout = () => {
    clearStaffSession();
    router.push('/login');
  };

  const screens = role ? screensForRole(role) : [];
  const otherScreens = screens.filter((s) => s.key !== current);

  return (
    <nav className="staff-topnav" aria-label="Служебная навигация">
      <button type="button" onClick={handleBack} className="staff-topnav__back">
        ← Назад
      </button>

      <div className="staff-topnav__links">
        {otherScreens.map((screen) => (
          <a key={screen.key} href={screen.href} className="staff-topnav__link">
            {screen.label}
            {!screen.ready && <span className="staff-topnav__wip"> (на разработке)</span>}
          </a>
        ))}
      </div>

      <div className="staff-topnav__meta">
        {role && (
          <span className="staff-topnav__role" title={hasSession ? undefined : 'Маркер сессии не найден — показан полный набор экранов'}>
            {hasSession ? ROLE_LABEL[role] : 'Гость'}
          </span>
        )}
        <button type="button" onClick={handleLogout} className="staff-topnav__logout">
          Выход
        </button>
      </div>
    </nav>
  );
}
