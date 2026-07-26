'use client';

import React, { useState } from 'react';

interface ComplaintFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ComplaintFormModal({ isOpen, onClose }: ComplaintFormModalProps) {
  const [category, setCategory] = useState<'DELIVERY' | 'FOOD_QUALITY' | 'SERVICE' | 'PAYMENT' | 'OTHER'>('DELIVERY');
  const [channel, setChannel] = useState<'WEBSITE_FORM' | 'TELEGRAM' | 'EMAIL' | 'PHONE'>('WEBSITE_FORM');
  const [complaintText, setComplaintText] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintText.trim() || !contactInfo.trim()) {
      alert('Пожалуйста, заполните текст обращения и ваш контакт.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
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
        {isSubmitted ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                backgroundColor: 'rgba(46, 125, 50, 0.15)',
                color: 'var(--color-success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                margin: '0 auto 16px auto',
              }}
            >
              ✓
            </div>
            <h3 style={{ marginBottom: '8px' }}>Обращение зарегистрировано</h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', marginBottom: '20px' }}>
              Ваше официальное обращение передано администрации кафе DAYMOHKCOFEE. Мы свяжемся с вами в течение 24 часов.
            </p>
            <button
              className="btn-primary"
              onClick={() => {
                setIsSubmitted(false);
                onClose();
              }}
            >
              Закрыть
            </button>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '20px' }}>
              <span className="badge badge-marigold" style={{ marginBottom: '6px' }}>
                Форма претензий
              </span>
              <h3 style={{ fontSize: '1.3rem', margin: 0 }}>Подать официальную жалобу</h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem', marginTop: '4px' }}>
                Обращения рассматриваются непосредственно администрацией кафе.
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '4px' }}>
                  Категория обращения *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    fontSize: '0.85rem',
                  }}
                >
                  <option value="DELIVERY">Доставка и работы курьера</option>
                  <option value="FOOD_QUALITY">Качество блюд</option>
                  <option value="SERVICE">Обслуживание и сервис</option>
                  <option value="PAYMENT">Оплата и расчёты</option>
                  <option value="OTHER">Другое</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '4px' }}>
                  Предпочтительный канал ответа *
                </label>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value as any)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    fontSize: '0.85rem',
                  }}
                >
                  <option value="WEBSITE_FORM">Веб-форма</option>
                  <option value="TELEGRAM">Telegram</option>
                  <option value="EMAIL">Email</option>
                  <option value="PHONE">Телефонный звонок</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '4px' }}>
                  Ваш контакт (Телефон / Telegram / Email) *
                </label>
                <input
                  type="text"
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  required
                  placeholder="+20 xxx xxx xxxx или @username"
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
                  Текст обращения *
                </label>
                <textarea
                  value={complaintText}
                  onChange={(e) => setComplaintText(e.target.value)}
                  required
                  rows={4}
                  placeholder="Опишите ситуацию..."
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
                style={{ width: '100%', padding: '12px', marginTop: '4px' }}
              >
                {isSubmitting ? 'Отправка...' : 'Отправить обращение'}
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
          </>
        )}
      </div>
    </div>
  );
}
