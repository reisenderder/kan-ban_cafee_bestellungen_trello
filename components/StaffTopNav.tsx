'use client';

/**
 * Блок 2, пункт 5 — тонкая полоска служебной навигации.
 *
 * Набор ссылок формируется по роли ВОШЕДШЕГО (а не по текущей странице): менеджер,
 * открывший экран кухни, всё равно видит свою полоску с возвратом в CRM; повар на том
 * же экране переходов не видит. Таблица ролей — в `lib/auth/staffSession.ts`
 * (`screensForRole`), спека `Feature_Admin_Control.md` §17 п.7.
 *
 * Группа D (пункт 8): роль берётся из НАСТОЯЩЕЙ сессии Supabase Auth
 * (`app_metadata.role`), а не из временного маркера localStorage. Guard страниц —
 * `middleware.ts`: без сессии на служебную страницу не попасть, поэтому «гостевого»
 * состояния здесь больше нет. Кнопка «Выход» снимает сессию Supabase.
 */

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  StaffScreenKey,
  StaffRole,
  getStaffRole,
  signOutStaff,
  screensForRole,
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

  useEffect(() => {
    let cancelled = false;
    getStaffRole().then((r) => {
      if (!cancelled) setRole(r);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  const handleLogout = async () => {
    await signOutStaff();
    router.replace('/login');
    router.refresh();
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
        {role && <span className="staff-topnav__role">{ROLE_LABEL[role]}</span>}
        <button type="button" onClick={handleLogout} className="staff-topnav__logout">
          Выход
        </button>
      </div>
    </nav>
  );
}
