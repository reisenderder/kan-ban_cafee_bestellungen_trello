'use client';

import React, { useState } from 'react';
import { useCart } from '../context/CartContext';

export function CartDrawer() {
  const {
    items,
    removeItem,
    updateQuantity,
    totalAmount,
    isCartOpen,
    setIsCartOpen,
    deliveryDetails,
    setDeliveryDetails,
  } = useCart();

  const [step, setStep] = useState<'ITEMS' | 'DELIVERY'>('ITEMS');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  if (!isCartOpen) return null;

  const handleDeliveryChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDeliveryDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliveryDetails.address || !deliveryDetails.contactPhone) {
      alert('Пожалуйста, укажите адрес доставки и контактный телефон.');
      return;
    }

    setIsSubmitting(true);
    // Simulate order submission API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitMessage('Заказ успешно создан! Пожалуйста, подтвердите контактный канал для передачи менеджеру.');
    }, 1000);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        zIndex: 200,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
    >
      <div
        className="animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '480px',
          backgroundColor: 'var(--color-bg)',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-lg)',
          overflowY: 'auto',
        }}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--color-surface)',
          }}
        >
          <h2 style={{ fontSize: '1.4rem' }}>
            {step === 'ITEMS' ? 'Корзина заказа' : 'Оформление доставки'}
          </h2>
          <button
            onClick={() => setIsCartOpen(false)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: 'var(--color-text-secondary)',
            }}
          >
            &times;
          </button>
        </div>

        {/* Drawer Content */}
        <div style={{ flex: 1, padding: '24px' }}>
          {submitMessage ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(46, 125, 50, 0.15)',
                  color: 'var(--color-success)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  margin: '0 auto 20px auto',
                }}
              >
                ✓
              </div>
              <h3 style={{ marginBottom: '12px' }}>Заказ оформлен!</h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', marginBottom: '24px' }}>
                {submitMessage}
              </p>
              <button
                className="btn-primary"
                onClick={() => {
                  setSubmitMessage(null);
                  setIsCartOpen(false);
                  setStep('ITEMS');
                }}
              >
                Понятно
              </button>
            </div>
          ) : step === 'ITEMS' ? (
            <>
              {items.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-text-muted)' }}>
                  <p style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Корзина пока пуста</p>
                  <p style={{ fontSize: '0.9rem' }}>Добавьте пробные блюда из витрины</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {items.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        backgroundColor: 'var(--color-surface)',
                        borderRadius: 'var(--radius-md)',
                        padding: '16px',
                        border: '1px solid var(--color-border)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <h4 style={{ fontSize: '1.05rem', marginBottom: '4px' }}>{item.title}</h4>
                        <span style={{ color: 'var(--color-deep-forest)', fontWeight: 600 }}>
                          {item.price * item.quantity} EGP
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-sm)',
                            overflow: 'hidden',
                          }}
                        >
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            style={{
                              padding: '4px 10px',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              fontWeight: 'bold',
                            }}
                          >
                            -
                          </button>
                          <span style={{ padding: '0 8px', fontWeight: 600, fontSize: '0.9rem' }}>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            style={{
                              padding: '4px 10px',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              fontWeight: 'bold',
                            }}
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--color-error)',
                            cursor: 'pointer',
                            fontSize: '1.2rem',
                          }}
                        >
                          &times;
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            /* DELIVERY STEP FORM */
            <form onSubmit={handleSubmitOrder} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '6px' }}>
                  Имя *
                </label>
                <input
                  type="text"
                  name="contactName"
                  value={deliveryDetails.contactName}
                  onChange={handleDeliveryChange}
                  required
                  placeholder="Ваше имя"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    fontSize: '0.95rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '6px' }}>
                  Телефон доставки *
                </label>
                <input
                  type="tel"
                  name="contactPhone"
                  value={deliveryDetails.contactPhone}
                  onChange={handleDeliveryChange}
                  required
                  placeholder="+20 123 456 7890"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    fontSize: '0.95rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '6px' }}>
                  Адрес в Каире *
                </label>
                <textarea
                  name="address"
                  value={deliveryDetails.address}
                  onChange={handleDeliveryChange}
                  required
                  rows={2}
                  placeholder="Район, улица, дом, квартира"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    fontSize: '0.95rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '6px' }}>
                  Ориентир (Landmark)
                </label>
                <input
                  type="text"
                  name="landmark"
                  value={deliveryDetails.landmark}
                  onChange={handleDeliveryChange}
                  placeholder="Рядом с мечетью / супермаркетом"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    fontSize: '0.95rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '6px' }}>
                  Способ подтверждения заказа *
                </label>
                <select
                  name="verificationChannel"
                  value={deliveryDetails.verificationChannel}
                  onChange={handleDeliveryChange}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    fontSize: '0.95rem',
                  }}
                >
                  <option value="TELEGRAM">Telegram Bot (Код подтверждения)</option>
                  <option value="EMAIL">Email (Код подтверждения)</option>
                  <option value="PHONE">Звонок / SMS</option>
                </select>
              </div>

              <div
                style={{
                  backgroundColor: 'var(--color-surface-subtle)',
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  color: 'var(--color-text-secondary)',
                }}
              >
                💵 <strong>Оплата:</strong> Наличными курьеру при получении (EGP).
              </div>
            </form>
          )}
        </div>

        {/* Drawer Footer */}
        {!submitMessage && items.length > 0 && (
          <div
            style={{
              padding: '20px 24px',
              borderTop: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
              }}
            >
              <span style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>Итого:</span>
              <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-deep-forest)' }}>
                {totalAmount} EGP
              </span>
            </div>

            {step === 'ITEMS' ? (
              <button
                className="btn-primary"
                style={{ width: '100%', padding: '14px' }}
                onClick={() => setStep('DELIVERY')}
              >
                Перейти к оформлению
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ flex: 1, padding: '14px' }}
                  onClick={() => setStep('ITEMS')}
                >
                  Назад
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  style={{ flex: 2, padding: '14px' }}
                  onClick={handleSubmitOrder}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Отправка...' : 'Подтвердить заказ'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
