'use client';

import React, { useState } from 'react';

interface DiscountResaleModalProps {
  isOpen: boolean;
  sourceOrderId: string;
  sourceOrderNumber: string;
  originalAmount: number;
  onResaleCreated: (newOrderNumber: string, discountPrice: number) => void;
  onClose: () => void;
}

export function DiscountResaleModal({
  isOpen,
  sourceOrderId,
  sourceOrderNumber,
  originalAmount,
  onResaleCreated,
  onClose,
}: DiscountResaleModalProps) {
  const [discountPercent, setDiscountPercent] = useState<number>(30); // Default 30% discount
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newCustomerAddress, setNewCustomerAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const discountAmount = Math.round(originalAmount * (1 - discountPercent / 100));

  const handleSubmitResale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName || !newCustomerPhone || !newCustomerAddress) {
      alert('Укажите имя, телефон и адрес нового покупателя.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const newOrderNumber = `${sourceOrderNumber}-DISCOUNT`;
      onResaleCreated(newOrderNumber, discountAmount);
    }, 800);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        className="animate-fade-in"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          padding: '28px',
          maxWidth: '460px',
          width: '100%',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--color-border)',
        }}
      >
        <div style={{ marginBottom: '20px' }}>
          <span className="badge badge-marigold" style={{ marginBottom: '8px' }}>
            Повторная продажа со скидкой
          </span>
          <h3 style={{ fontSize: '1.3rem', marginBottom: '4px' }}>
            Возврат заказа {sourceOrderNumber}
          </h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
            Исходная сумма: <strong>{originalAmount} EGP</strong>. Товар уже приготовлен, начальный статус нового заказа будет <code>Готов к доставке</code>.
          </p>
        </div>

        <form onSubmit={handleSubmitResale} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px' }}>
              Размер скидки (%)
            </label>
            <select
              value={discountPercent}
              onChange={(e) => setDiscountPercent(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                fontSize: '0.9rem',
                fontWeight: 600,
              }}
            >
              <option value={20}>Скидка 20%</option>
              <option value={30}>Скидка 30% (Стандарт)</option>
              <option value={40}>Скидка 40%</option>
              <option value={50}>Скидка 50% (Максимум)</option>
            </select>
          </div>

          <div
            style={{
              backgroundColor: 'var(--color-surface-subtle)',
              padding: '12px',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Новая цена со скидкой:</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-deep-forest)' }}>
              {discountAmount} EGP
            </span>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '4px' }}>
              Имя нового покупателя *
            </label>
            <input
              type="text"
              value={newCustomerName}
              onChange={(e) => setNewCustomerName(e.target.value)}
              required
              placeholder="Имя клиента"
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                fontSize: '0.85rem',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '4px' }}>
              Телефон нового покупателя *
            </label>
            <input
              type="tel"
              value={newCustomerPhone}
              onChange={(e) => setNewCustomerPhone(e.target.value)}
              required
              placeholder="+20 1xx xxx xxxx"
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                fontSize: '0.85rem',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '4px' }}>
              Новый адрес доставки *
            </label>
            <input
              type="text"
              value={newCustomerAddress}
              onChange={(e) => setNewCustomerAddress(e.target.value)}
              required
              placeholder="Адрес доставки в Каире"
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                fontSize: '0.85rem',
              }}
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={isSubmitting}
            style={{ width: '100%', padding: '12px', marginTop: '6px' }}
          >
            {isSubmitting ? 'Создание скидочного заказа...' : 'Создать скидочный заказ'}
          </button>
        </form>

        <button
          onClick={onClose}
          style={{
            width: '100%',
            background: 'none',
            border: 'none',
            color: 'var(--color-text-secondary)',
            marginTop: '12px',
            fontSize: '0.85rem',
            cursor: 'pointer',
          }}
        >
          Отмена
        </button>
      </div>
    </div>
  );
}
