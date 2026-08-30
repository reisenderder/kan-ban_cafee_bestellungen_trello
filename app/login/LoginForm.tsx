'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';
import { isStaffRole, homeScreenForRole } from '../../lib/auth/staffSession';

/**
 * Блок 2, группа D (пункт 8) — настоящий вход персонала через Supabase Auth.
 *
 * Только email + пароль → `signInWithPassword`. Роль берётся из `app_metadata.role`
 * учётной записи (её нельзя выбрать в форме — она задаётся при заведении аккаунта
 * service-role ключом). Учётки заводит владелец в панели Supabase или скриптом
 * `scripts/create-staff-users.mjs`. Восстановление пароля — из панели Supabase
 * (Authentication → Users); отдельной страницы «Забыли пароль?» в Блоке 2 нет.
 *
 * Путь оставлен `/login`, но страница скрыта из индексации (`app/login/layout.tsx`,
 * `robots noindex`) и на неё нет ссылок с витрины (`Technical_Access_Audit.md` §18 п.9).
 */

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(errorFromQuery(searchParams.get('error')));
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error || !data.session || !data.user) {
        setErrorMsg('Неверный email или пароль. Проверьте данные и попробуйте ещё раз.');
        setIsLoading(false);
        return;
      }

      const role = (data.user.app_metadata as Record<string, unknown> | undefined)?.role;
      if (!isStaffRole(role)) {
        await supabase.auth.signOut();
        setErrorMsg('У этой учётной записи не назначена служебная роль. Обратитесь к администратору.');
        setIsLoading(false);
        return;
      }

      const redirectTo = safeRedirect(searchParams.get('redirectTo'));
      router.replace(redirectTo || homeScreenForRole(role));
      router.refresh();
    } catch {
      setErrorMsg('Не удалось связаться с сервером авторизации. Попробуйте позже.');
      setIsLoading(false);
    }
  };

  return (
    <div
      className="animate-fade-in"
      style={{
        minHeight: '85vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          padding: '40px 32px',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        {/* Brand Logo & Title */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              backgroundColor: 'var(--color-deep-forest)',
              color: '#FFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              fontWeight: 800,
              fontSize: '1.5rem',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            D
          </div>
          <span className="badge badge-forest" style={{ marginBottom: '8px' }}>
            Служебный вход
          </span>
          <h1 style={{ fontSize: '1.75rem', margin: '4px 0 0 0', fontWeight: 800 }}>
            DAYMOHKCOFEE
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginTop: '6px' }}>
            Авторизация персонала (администратор / менеджер)
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div
            style={{
              backgroundColor: 'rgba(198, 40, 40, 0.1)',
              border: '1px solid var(--color-error)',
              color: 'var(--color-error)',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              marginBottom: '20px',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}
          >
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} style={{ display: 'grid', gap: '20px' }}>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                marginBottom: '8px',
              }}
            >
              Email сотрудника
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text-primary)',
                fontSize: '0.95rem',
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                marginBottom: '8px',
              }}
            >
              Пароль
            </label>
            <input
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text-primary)',
                fontSize: '0.95rem',
                outline: 'none',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '1rem',
              fontWeight: 700,
              marginTop: '8px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              backgroundColor: 'var(--color-warm-terracotta)',
            }}
          >
            {isLoading ? '⏳ Авторизация...' : 'Войти в кабинет'}
          </button>
        </form>

        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '20px', textAlign: 'center' }}>
          Забыли пароль? Обратитесь к администратору — сброс выполняется вручную.
        </p>
      </div>
    </div>
  );
}

function errorFromQuery(code: string | null): string | null {
  switch (code) {
    case 'suspended':
      return 'Доступ этой учётной записи приостановлен. Обратитесь к администратору.';
    case 'norole':
      return 'У учётной записи не назначена служебная роль. Обратитесь к администратору.';
    default:
      return null;
  }
}

/** Разрешаем редирект только на внутренние служебные пути (защита от open redirect). */
function safeRedirect(value: string | null): string | null {
  if (!value) return null;
  if (!value.startsWith('/') || value.startsWith('//')) return null;
  const allowed = ['/admin', '/manager', '/kitchen', '/courier', '/resolution'];
  return allowed.some((p) => value === p || value.startsWith(p + '/')) ? value : null;
}
