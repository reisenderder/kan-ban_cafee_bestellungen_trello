'use client';

import React, { useState } from 'react';

interface DeliveryConfirmationModalProps {
  isOpen: boolean;
  orderNumber: string;
  amount: number;
  paymentStatus: 'UNCONFIRMED' | 'CONFIRMED';
  onConfirmSuccess: (fallbackUsed: boolean, fallbackReason?: string) => void;
  onClose: () => void;
}

export function DeliveryConfirmationModal({
  isOpen,
  orderNumber,
  amount,
  paymentStatus,
  onConfirmSuccess,
  onClose,
}: DeliveryConfirmationModalProps) {
  const [mode, setMode] = useState<'QR' | 'FALLBACK'>('QR');
  const [fallbackReason, setFallbackReason] = useState('');
  const [fallbackError, setFallbackError] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  if (!isOpen) return null;

  const handleSimulateQrScan = () => {
    setIsConfirming(true);
    setTimeout(() => {
      setIsConfirming(false);
      onConfirmSuccess(false);
    }, 800);
  };

  const handleFallbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fallbackReason.trim().length < 10) {
      setFallbackError('Причина должна быть содержательной (минимум 10 символов)');
      return;
    }

    setFallbackError(null);
    setIsConfirming(true);
    setTimeout(() => {
      setIsConfirming(false);
      onConfirmSuccess(true, fallbackReason.trim());
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
          maxWidth: '420px',
          width: '100%',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--color-border)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.3rem', marginBottom: '4px' }}>Подтверждение доставки</h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
            Заказ: <strong>{orderNumber}</strong> | Сумма к оплате: <strong>{amount} EGP</strong>
          </p>
        </div>

        {/* Tab Selector */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <button
            onClick={() => setMode('QR')}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: 'var(--radius-sm)',
              border: mode === 'QR' ? 'none' : '1px solid var(--color-border)',
              backgroundColor: mode === 'QR' ? 'var(--color-deep-forest)' : 'var(--color-surface)',
              color: mode === 'QR' ? 'var(--color-vanilla-cream)' : 'var(--color-text-primary)',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
          >
            📱 QR-код клиентов
          </button>
          <button
            onClick={() => setMode('FALLBACK')}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: 'var(--radius-sm)',
              border: mode === 'FALLBACK' ? 'none' : '1px solid var(--color-border)',
              backgroundColor: mode === 'FALLBACK' ? 'var(--color-deep-forest)' : 'var(--color-surface)',
              color: mode === 'FALLBACK' ? 'var(--color-vanilla-cream)' : 'var(--color-text-primary)',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
          >
            ⚠️ Резервный Fallback
          </button>
        </div>

        {mode === 'QR' ? (
          <div style={{ textAlign: 'center' }}>
            {/* Simulated QR Code Box */}
            <div
              style={{
                width: '180px',
                height: '180px',
                backgroundColor: '#FFF',
                border: '2px solid var(--color-deep-forest)',
                borderRadius: 'var(--radius-md)',
                margin: '0 auto 16px auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '3rem', display: 'block' }}>🏁</span>
                <span style={{ fontSize: '0.7rem', color: '#555', fontFamily: 'monospace' }}>
                  QR-TOKEN-{orderNumber.slice(-4)}
                </span>
              </div>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
              Попросите клиента показать QR-код на экране его устройства для сканирования.
            </p>

            <button
              className="btn-primary"
              onClick={handleSimulateQrScan}
              disabled={isConfirming}
              style={{ width: '100%', padding: '12px' }}
            >
              {isConfirming ? 'Гашение токена...' : '✓ Подтвердить (Сканировать QR)'}
            </button>
          </div>
        ) : (
          /* FALLBACK MODE FORM */
          <form onSubmit={handleFallbackSubmit}>
            <div
              style={{
                backgroundColor: 'rgba(200, 90, 50, 0.1)',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                color: 'var(--color-warm-terracotta)',
                marginBottom: '16px',
              }}
            >
              Запись о ручном подтверждении без QR-кода фиксируется в неотменяемом AuditLog.
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px' }}>
                Причина резервного подтверждения * (мин. 10 символов)
              </label>
              <textarea
                value={fallbackReason}
                onChange={(e) => setFallbackReason(e.target.value)}
                required
                rows={3}
                placeholder="Например: У клиента разряжен телефон, передача подтверждена лично"
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.85rem',
                }}
              />
              {fallbackError && (
                <p style={{ color: 'var(--color-error)', fontSize: '0.8rem', marginTop: '4px' }}>
                  {fallbackError}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={isConfirming || fallbackReason.trim().length < 10}
              style={{ width: '100%', padding: '12px' }}
            >
              {isConfirming ? 'Сохранение...' : 'Зафиксировать Fallback-доставку'}
            </button>
          </form>
        )}

        <button
          onClick={onClose}
          style={{
            width: '100%',
            background: 'none',
            border: 'none',
            color: 'var(--color-text-secondary)',
            marginTop: '16px',
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
