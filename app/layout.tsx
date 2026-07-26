import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '../context/CartContext';
import { Navbar } from '../components/Navbar';

export const metadata: Metadata = {
  title: 'DAYMOHKCOFEE | Витрина заказа',
  description: 'Единый сервис онлайн-заказа DAYMOHKCOFEE в Каире. Быстрое оформление, витринные слоты блюд и доставка.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>
        <CartProvider>
          <Navbar />
          <main>{children}</main>
          <footer style={{ backgroundColor: 'var(--color-deep-forest)', color: 'var(--color-vanilla-cream)', padding: '40px 24px', marginTop: '60px' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
              <h3 style={{ color: 'var(--color-vanilla-cream)', marginBottom: '8px' }}>DAYMOHKCOFEE</h3>
              <p style={{ color: 'rgba(249, 245, 236, 0.7)', fontSize: '0.9rem' }}>
                Кавказская кухня в Каире. Каркас онлайн-витрины заказа с подтверждением каналов связи.
              </p>
              <p style={{ marginTop: '20px', fontSize: '0.8rem', color: 'rgba(249, 245, 236, 0.5)' }}>
                &copy; {new Date().getFullYear()} DAYMOHKCOFEE. Все права защищены.
              </p>
            </div>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
