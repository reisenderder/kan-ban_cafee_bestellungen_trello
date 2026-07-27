import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ maxWidth: '600px', margin: '80px auto', padding: '32px', textAlign: 'center' }}>
      <div style={{ fontSize: '3rem', marginBottom: '16px' }}>404</div>
      <h2 style={{ fontSize: '1.8rem', marginBottom: '12px', color: 'var(--color-deep-forest)' }}>
        Страница не найдена
      </h2>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '24px', fontSize: '0.95rem' }}>
        Запрошенный раздел не существует или был перемещён.
      </p>
      <Link href="/" className="btn-primary" style={{ padding: '12px 24px' }}>
        Вернуться на главную витрину
      </Link>
    </div>
  );
}
