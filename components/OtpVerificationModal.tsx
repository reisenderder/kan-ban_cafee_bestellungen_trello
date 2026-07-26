'use client';

import React, { useState, useEffect } from 'react';

interface OtpVerificationModalProps {
  isOpen: boolean;
  channel: 'TELEGRAM' | 'EMAIL' | 'PHONE';
  target: string;
  onVerifySuccess: () => void;
  onCancel: () => void;
}

export function OtpVerificationModal({
  isOpen,
  channel,
  target,
  onVerifySuccess,
  onCancel,
}: OtpVerificationModalProps) {
  const [otpCode, setOtpCode] = useState('');
  const [resendCooldown, setResendCooldown] = useState(60);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // 60-second resend cooldown timer
  useEffect(() => {
    if (!isOpen) return;
    setResendCooldown(60);
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.trim().length !== 6) {
      setError('Введите 6-значный код');
      return;
    }

    setError(null);
    setIsVerifying(true);

    // Simulate OTP verification API call
    setTimeout(() => {
      setIsVerifying(false);
      // Demo validation: 123456 or any 6 digits for testing
      if (otpCode.trim().length === 6) {
        onVerifySuccess();
      } else {
        setError('Неверный код подтверждения. Попробуйте еще раз.');
      }
    }, 800);
  };

  const handleResend = () => {
    if (resendCooldown > 0) return;
    setResendCooldown(60);
    setError(null);
    alert(`Новый код отправлен в ${channel === 'TELEGRAM' ? 'Telegram' : 'Email'}`);
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
        padding: '24px',
      }}
    >
      <div
        className="animate-fade-in"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          padding: '32px',
          maxWidth: '420px',
          width: '100%',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--color-border)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              backgroundColor: 'rgba(30, 58, 43, 0.1)',
              color: 'var(--color-deep-forest)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              margin: '0 auto 12px auto',
            }}
          >
            🔒
          </div>
          <h3 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Подтверждение канала</h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            Мы отправили 6-значный код в <strong>{channel === 'TELEGRAM' ? 'Telegram' : channel === 'EMAIL' ? 'Email' : 'SMS'}</strong> на {target || 'указанные данные'}.
          </p>
        </div>

        <form onSubmit={handleVerify}>
          <div style={{ marginBottom: '20px' }}>
            <input
              type="text"
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              style={{
                width: '100%',
                textAlign: 'center',
                letterSpacing: '0.4em',
                fontSize: '1.6rem',
                fontWeight: 700,
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                border: '2px solid var(--color-border)',
                fontFamily: 'monospace',
              }}
            />
            {error && (
              <p style={{ color: 'var(--color-error)', fontSize: '0.85rem', marginTop: '8px', textAlign: 'center' }}>
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={isVerifying || otpCode.length !== 6}
            style={{ width: '100%', padding: '14px', marginBottom: '16px' }}
          >
            {isVerifying ? 'Проверка кода...' : 'Подтвердить код'}
          </button>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
            <button
              type="button"
              onClick={handleResend}
              disabled={resendCooldown > 0}
              style={{
                background: 'none',
                border: 'none',
                color: resendCooldown > 0 ? 'var(--color-text-muted)' : 'var(--color-warm-terracotta)',
                cursor: resendCooldown > 0 ? 'default' : 'pointer',
                fontWeight: 600,
              }}
            >
              {resendCooldown > 0 ? `Повтор через ${resendCooldown} сек` : 'Отправить код повторно'}
            </button>

            <button
              type="button"
              onClick={onCancel}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-text-secondary)',
                cursor: 'pointer',
              }}
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
