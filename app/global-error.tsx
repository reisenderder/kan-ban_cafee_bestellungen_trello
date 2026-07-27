'use client';

import React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ru">
      <body style={{ backgroundColor: '#F9F5EC', color: '#17241C', fontFamily: 'sans-serif' }}>
        <div style={{ maxWidth: '600px', margin: '80px auto', padding: '32px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '12px' }}>Глобальный сбой приложения</h2>
          <p style={{ color: '#57655B', marginBottom: '24px' }}>{error.message}</p>
          <button
            onClick={() => reset()}
            style={{
              padding: '12px 24px',
              backgroundColor: '#C85A32',
              color: '#FFF',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            Перезагрузить приложение
          </button>
        </div>
      </body>
    </html>
  );
}
