'use client';

import React, { useState } from 'react';
import { DeliveryConfirmationModal } from '../../../components/DeliveryConfirmationModal';

interface CourierDelivery {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhoneMasked: string;
  address: string;
  landmark: string;
  itemsSummary: string;
  totalAmount: number;
  paymentMethod: 'CASH_ON_DELIVERY' | 'MANUAL_PAYMENT_LINK';
  paymentStatus: 'UNCONFIRMED' | 'CONFIRMED';
  status: 'ASSIGNED' | 'IN_TRANSIT' | 'ARRIVED' | 'COMPLETED';
  fallbackUsed?: boolean;
}

const initialCourierDelivery: CourierDelivery = {
  id: 'del-501',
  orderNumber: '20260726-0002',
  customerName: 'Фатима К.',
  customerPhoneMasked: '+20 10* *** *456',
  address: 'Каир, р-н Нового Каира, Проспект 90, д. 12, кв. 4',
  landmark: 'Рядом с банковским центром',
  itemsSummary: 'Блюдо 3 x1, Блюдо 4 x2',
  totalAmount: 680,
  paymentMethod: 'CASH_ON_DELIVERY',
  paymentStatus: 'UNCONFIRMED',
  status: 'ASSIGNED',
};

export default function CourierDashboardPage() {
  const [delivery, setDelivery] = useState<CourierDelivery | null>(initialCourierDelivery);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!delivery) {
    return (
      <div style={{ maxWidth: '600px', margin: '40px auto', padding: '24px', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '12px' }}>Нет назначенных доставок</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>Ожидайте назначения заказа менеджером кафе.</p>
      </div>
    );
  }

  const handleUpdateStatus = (newStatus: CourierDelivery['status']) => {
    setDelivery((prev) => (prev ? { ...prev, status: newStatus } : null));
  };

  const handleConfirmSuccess = (fallbackUsed: boolean, fallbackReason?: string) => {
    setIsConfirmModalOpen(false);
    setDelivery((prev) =>
      prev
        ? {
            ...prev,
            status: 'COMPLETED',
            paymentStatus: 'CONFIRMED',
            fallbackUsed,
          }
        : null
    );
    setSuccessMessage(
      fallbackUsed
        ? `Доставка зафиксирована через Fallback! Причина записана в AuditLog: "${fallbackReason}"`
        : 'Доставка успешно подтверждена по одноразовому QR-коду!'
    );
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Mobile Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <span className="badge badge-forest" style={{ marginBottom: '4px' }}>Экран курьера</span>
          <h1 style={{ fontSize: '1.8rem', margin: 0 }}>Текущая доставка</h1>
        </div>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-deep-forest)' }}>
          {delivery.orderNumber}
        </div>
      </div>

      {successMessage ? (
        <div className="animate-fade-in" style={{ backgroundColor: 'var(--color-surface)', padding: '32px 24px', borderRadius: 'var(--radius-lg)', textAlign: 'center', border: '1px solid var(--color-border)' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'rgba(46, 125, 50, 0.15)', color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 16px auto' }}>
            ✓
          </div>
          <h3 style={{ marginBottom: '12px' }}>Доставка завершена</h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
            {successMessage}
          </p>
          <button className="btn-primary" onClick={() => setDelivery(null)}>
            Вернуться к списку
          </button>
        </div>
      ) : (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Status Indicator */}
          <div
            style={{
              backgroundColor: 'var(--color-deep-forest)',
              color: 'var(--color-vanilla-cream)',
              padding: '14px 18px',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Статус доставки:</span>
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
              {delivery.status === 'ASSIGNED' && 'Назначен курьеру'}
              {delivery.status === 'IN_TRANSIT' && 'В пути к клиенту'}
              {delivery.status === 'ARRIVED' && 'Прибыл на место'}
              {delivery.status === 'COMPLETED' && 'Доставлен'}
            </span>
          </div>

          {/* Delivery Details Card */}
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-lg)',
              padding: '20px',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <h3 style={{ fontSize: '1.1rem', marginBottom: '12px' }}>Адрес и контакты</h3>

            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Клиент:</div>
              <div style={{ fontWeight: 600 }}>{delivery.customerName} ({delivery.customerPhoneMasked})</div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Адрес доставки в Каире:</div>
              <div style={{ fontWeight: 600 }}>{delivery.address}</div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Ориентир:</div>
              <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>{delivery.landmark}</div>
            </div>

            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>К оплате (Наличные):</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-deep-forest)' }}>
                  {delivery.totalAmount} EGP
                </div>
              </div>
              <span className="badge badge-marigold">
                {delivery.paymentStatus === 'CONFIRMED' ? 'Оплачено' : 'Оплата на месте'}
              </span>
            </div>
          </div>

          {/* Contextual Action Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
            {delivery.status === 'ASSIGNED' && (
              <button
                className="btn-primary"
                style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
                onClick={() => handleUpdateStatus('IN_TRANSIT')}
              >
                🚴 Забрал заказ (В пути)
              </button>
            )}

            {delivery.status === 'IN_TRANSIT' && (
              <button
                className="btn-primary"
                style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
                onClick={() => handleUpdateStatus('ARRIVED')}
              >
                📍 Прибыл к клиенту
              </button>
            )}

            {(delivery.status === 'ARRIVED' || delivery.status === 'IN_TRANSIT') && (
              <button
                className="btn-secondary"
                style={{ width: '100%', padding: '14px', fontSize: '1rem', backgroundColor: 'var(--color-warm-terracotta)' }}
                onClick={() => setIsConfirmModalOpen(true)}
              >
                🏁 Подтвердить доставку (QR / Fallback)
              </button>
            )}
          </div>
        </div>
      )}

      <DeliveryConfirmationModal
        isOpen={isConfirmModalOpen}
        orderNumber={delivery.orderNumber}
        amount={delivery.totalAmount}
        paymentStatus={delivery.paymentStatus}
        onConfirmSuccess={handleConfirmSuccess}
        onClose={() => setIsConfirmModalOpen(false)}
      />
    </div>
  );
}
