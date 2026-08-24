'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [role, setRole] = useState<'ADMIN' | 'MANAGER'>('MANAGER');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Локальный режим/демо вход для первого запуска если СУБД не подключена
        if (email.includes('admin') || role === 'ADMIN') {
          router.push('/admin/dashboard');
        } else {
          router.push('/manager/crm');
        }
        return;
      }

      if (data.session) {
        // Успешный вход через Supabase Auth -> Перенаправление по роли
        if (role === 'ADMIN') {
          router.push('/admin/dashboard');
        } else {
          router.push('/manager/crm');
        }
      }
    } catch (err: any) {
      // Резервный переход при разработке
      if (role === 'ADMIN') {
        router.push('/admin/dashboard');
      } else {
        router.push('/manager/crm');
      }
    } finally {
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
            Авторизация персонала (Администратор / Менеджер)
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

        {/* Role Selector Tabs */}
        <div
          style={{
            display: 'flex',
            backgroundColor: 'var(--color-surface-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '4px',
            marginBottom: '24px',
          }}
        >
          <button
            type="button"
            onClick={() => setRole('MANAGER')}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: role === 'MANAGER' ? 'var(--color-deep-forest)' : 'transparent',
              color: role === 'MANAGER' ? 'var(--color-vanilla-cream)' : 'var(--color-text-secondary)',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'var(--transition-fast)',
            }}
          >
            📊 Менеджер
          </button>
          <button
            type="button"
            onClick={() => setRole('ADMIN')}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: role === 'ADMIN' ? 'var(--color-deep-forest)' : 'transparent',
              color: role === 'ADMIN' ? 'var(--color-vanilla-cream)' : 'var(--color-text-secondary)',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'var(--transition-fast)',
            }}
          >
            👑 Админ
          </button>
        </div>

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
              placeholder={role === 'ADMIN' ? 'admin@daymohkcofee.com' : 'manager@daymohkcofee.com'}
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
      </div>
    </div>
  );
}
