'use client';

import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { CartDrawer } from './CartDrawer';
import { MyOrdersPanel } from './MyOrdersPanel';

export function Navbar() {
  const { items, isCartOpen, setIsCartOpen, totalAmount } = useCart();
  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const [isMyOrdersOpen, setIsMyOrdersOpen] = useState(false);

  return (
    <>
      <header
        className="glass-header"
        style={{
          position: 'sticky',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 500,
          backgroundColor: 'rgba(249, 245, 236, 0.94)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div className="site-nav__inner">
          {/* Logo & Brand */}
          <a href="/" className="site-nav__brand">
            <div className="site-nav__logo">D</div>
            <span className="site-nav__brand-name">DAYMOHKCOFEE</span>
          </a>

          {/* Разделы + корзина. «Служебный вход» убран с витрины (Блок 2, пункт 8). */}
          <nav className="site-nav__actions">
            <a href="/#menu" className="site-nav__link">
              Витрина
            </a>

            <button
              type="button"
              onClick={() => setIsMyOrdersOpen(true)}
              className="site-nav__link"
            >
              📦 <span>Мои заказы</span>
            </button>

            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="site-nav__cart"
              title="Открыть корзину"
              aria-label={`Корзина${totalItemsCount > 0 ? `, позиций: ${totalItemsCount}` : ''}`}
            >
              <span aria-hidden="true">🛒</span>
              <span className="site-nav__cart-label">Корзина</span>
              {totalItemsCount > 0 && (
                <span key={totalItemsCount} className="site-nav__cart-count animate-fade-in">
                  {totalItemsCount}
                </span>
              )}
            </button>
          </nav>
        </div>
      </header>

      {/* Плавающая нижняя кнопка корзины при непустой корзине */}
      {totalItemsCount > 0 && !isCartOpen && (
        <div
          className="animate-fade-in"
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '24px',
            zIndex: 400,
          }}
        >
          <button
            onClick={() => setIsCartOpen(true)}
            style={{
              backgroundColor: 'var(--color-deep-forest)',
              color: 'var(--color-vanilla-cream)',
              border: 'none',
              padding: '14px 22px',
              borderRadius: 'var(--radius-full)',
              boxShadow: 'var(--shadow-lg)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.95rem',
            }}
          >
            <span
              style={{
                backgroundColor: 'var(--color-marigold-zest)',
                color: 'var(--color-deep-forest)',
                borderRadius: '50%',
                width: '26px',
                height: '26px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.8rem',
              }}
            >
              {totalItemsCount}
            </span>
            <span>Посмотреть корзину</span>
            <span style={{ fontWeight: 700, color: 'var(--color-marigold-zest)' }}>
              {totalAmount} EGP
            </span>
          </button>
        </div>
      )}

      <CartDrawer />
      <MyOrdersPanel isOpen={isMyOrdersOpen} onClose={() => setIsMyOrdersOpen(false)} />
    </>
  );
}
