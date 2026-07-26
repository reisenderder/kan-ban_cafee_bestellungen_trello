import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DAYMOHKCOFEE | Кавказская кухня в Каире',
  description: 'Единый сервис онлайн-заказа кавказской кухни DAYMOHKCOFEE в Каире. Быстрое оформление, подлинный вкус и доставка.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>
        <header className="glass-header">
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'var(--color-deep-forest)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontWeight: 'bold', fontSize: '1.2rem' }}>
                D
              </div>
              <span style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1.4rem', color: 'var(--color-deep-forest)', letterSpacing: '-0.02em' }}>
                DAYMOHKCOFEE
              </span>
            </div>
            <nav style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <a href="#menu" style={{ color: 'var(--color-text-primary)', textDecoration: 'none', fontWeight: 500 }}>Меню</a>
              <a href="#about" style={{ color: 'var(--color-text-primary)', textDecoration: 'none', fontWeight: 500 }}>О нас</a>
              <a href="#cart" className="btn-primary" style={{ padding: '8px 18px', fontSize: '0.9rem' }}>
                Корзина
              </a>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer style={{ backgroundColor: 'var(--color-deep-forest)', color: 'var(--color-vanilla-cream)', padding: '40px 24px', marginTop: '60px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
            <h3 style={{ color: 'var(--color-vanilla-cream)', marginBottom: '8px' }}>DAYMOHKCOFEE</h3>
            <p style={{ color: 'rgba(249, 245, 236, 0.7)', fontSize: '0.9rem' }}>
              Кавказская кухня в Каире. Подлинные рецепты, свежие ингредиенты и забота о каждом клиенте.
            </p>
            <p style={{ marginTop: '20px', fontSize: '0.8rem', color: 'rgba(249, 245, 236, 0.5)' }}>
              &copy; {new Date().getFullYear()} DAYMOHKCOFEE. Все права защищены.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
