'use client';

import React from 'react';
import { useCart } from '../context/CartContext';
import { CartDrawer } from './CartDrawer';

export function Navbar() {
  const { items, setIsCartOpen } = useCart();
  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
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
            <a href="#menu" style={{ color: 'var(--color-text-primary)', textDecoration: 'none', fontWeight: 500 }}>Витрина</a>
            <button
              onClick={() => setIsCartOpen(true)}
              className="btn-primary"
              style={{ padding: '8px 18px', fontSize: '0.9rem', position: 'relative' }}
            >
              Корзина
              {totalItemsCount > 0 && (
                <span
                  style={{
                    marginLeft: '8px',
                    backgroundColor: 'var(--color-marigold-zest)',
                    color: 'var(--color-deep-forest)',
                    borderRadius: 'var(--radius-full)',
                    padding: '2px 8px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                  }}
                >
                  {totalItemsCount}
                </span>
              )}
            </button>
          </nav>
        </div>
      </header>
      <CartDrawer />
    </>
  );
}
