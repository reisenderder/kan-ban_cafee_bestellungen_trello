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
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '14px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Logo & Brand */}
          <a
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              textDecoration: 'none',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: 'var(--color-deep-forest)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFF',
                fontWeight: 'bold',
                fontSize: '1.25rem',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              D
            </div>
            <span
              style={{
                fontFamily: 'Outfit',
                fontWeight: 700,
                fontSize: '1.4rem',
                color: 'var(--color-deep-forest)',
                letterSpacing: '-0.02em',
              }}
            >
              DAYMOHKCOFEE
            </span>
          </a>

          {/* Navigation & Sticky Cart */}
          <nav style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <a
              href="#menu"
              style={{
                color: 'var(--color-text-primary)',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.95rem',
              }}
            >
              Витрина
            </a>

            <button
              onClick={() => setIsMyOrdersOpen(true)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-text-primary)',
                fontWeight: 600,
                fontSize: '0.95rem',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              📦 Мои заказы
            </button>

            {/* Блок 2, пункт 8: «Служебный вход» убран с витрины — вход персонала
                по непубличному пути /login без ссылок отсюда (Technical_Access_Audit.md §18 п.9).
                Клиентская кнопка «Мои заказы» — выше (пункт 7). */}

            <button
              onClick={() => setIsCartOpen(true)}
              className="btn-primary"
              style={{
                padding: '10px 20px',
                fontSize: '0.95rem',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'var(--color-warm-terracotta)',
                boxShadow: 'var(--shadow-sm)',
              }}
              title="Нажмите чтобы открыть корзину"
            >
              🛒 Корзина
              {totalItemsCount > 0 && (
                <span
                  key={totalItemsCount}
                  className="animate-fade-in"
                  style={{
                    backgroundColor: 'var(--color-marigold-zest)',
                    color: 'var(--color-deep-forest)',
                    borderRadius: 'var(--radius-full)',
                    padding: '2px 10px',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                  }}
                >
                  {totalItemsCount}
                </span>
              )}
            </button>
          </nav>
        </div>
      </header>

      {/* Floating Bottom Quick-Cart Bar for mobile/desktop when scrolling - Hidden when Cart is open */}
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
