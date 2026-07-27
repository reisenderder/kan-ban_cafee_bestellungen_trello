'use client';

import React, { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App Router Error:', error);
  }, [error]);

  return (
    <div style={{ maxWidth: '600px', margin: '80px auto', padding: '32px', textAlign: 'center' }}>
      <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚠️</div>
      <h2 style={{ fontSize: '1.8rem', marginBottom: '12px', color: 'var(--color-deep-forest)' }}>
        Произошла ошибка при загрузке страницы
      </h2>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '24px', fontSize: '0.95rem' }}>
        {error.message || 'Непредвиденная сбойная ситуация.'}
      </p>
      <button
        onClick={() => reset()}
        className="btn-primary"
        style={{ padding: '12px 24px' }}
      >
        Попробовать снова
      </button>
    </div>
  );
}
