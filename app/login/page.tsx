import React, { Suspense } from 'react';
import { LoginForm } from './LoginForm';

/**
 * Блок 2, группа D (пункт 8). Серверная обёртка: `LoginForm` использует
 * `useSearchParams`, поэтому обязана быть внутри Suspense-границы.
 * Метаданные `robots noindex` — в `app/login/layout.tsx`.
 */
export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '85vh' }} />}>
      <LoginForm />
    </Suspense>
  );
}
