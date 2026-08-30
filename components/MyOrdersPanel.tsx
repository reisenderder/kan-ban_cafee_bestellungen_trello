'use client';

import React, { useEffect, useState } from 'react';
import { ClientOrderChatModal } from './ClientOrderChatModal';
import {
  Order,
  MyOrderRef,
  getMyOrders,
  fetchOrderByNumberAndCode,
  clientStageLabel,
} from '../lib/orders/orders';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

interface MyOrdersPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MyOrdersPanel({ isOpen, onClose }: MyOrdersPanelProps) {
  const [myOrders, setMyOrders] = useState<MyOrderRef[]>([]);
  const [numberInput, setNumberInput] = useState('');
  const [codeInput, setCodeInput] = useState('');
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [isLooking, setIsLooking] = useState(false);
  const [foundOrder, setFoundOrder] = useState<Order | null>(null);
  const [chatFor, setChatFor] = useState<{ id: string; orderNumber: string } | null>(null);

  useBodyScrollLock(isOpen);

  useEffect(() => {
    if (isOpen) {
      setMyOrders(getMyOrders());
      setLookupError(null);
      setFoundOrder(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError(null);
    setFoundOrder(null);
    if (!numberInput.trim() || !codeInput.trim()) {
      setLookupError('Введите номер заказа и код доступа.');
      return;
    }
    setIsLooking(true);
    const order = await fetchOrderByNumberAndCode(numberInput, codeInput);
    setIsLooking(false);
    if (!order) {
      setLookupError('Заказ не найден. Проверьте номер и код доступа.');
      return;
    }
    setFoundOrder(order);
  };

  const fieldStyle: React.CSSProperties = {
    width: '100%',
    padding: '11px 14px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--color-border)',
  };

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          height: '100dvh',
          backgroundColor: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          zIndex: 600,
          display: 'flex',
          justifyContent: 'flex-end',
          overscrollBehavior: 'contain',
          cursor: 'pointer',
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="animate-fade-in"
          style={{
            width: '100%',
            maxWidth: '440px',
            backgroundColor: 'var(--color-bg)',
            height: '100dvh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: 'var(--shadow-lg)',
            overflowY: 'auto',
            overscrollBehavior: 'contain',
            WebkitOverflowScrolling: 'touch',
            cursor: 'default',
          }}
        >
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
            <h2 style={{ fontSize: '1.35rem', margin: 0 }}>Мои заказы</h2>
            <button
              onClick={onClose}
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

          <div style={{ flex: 1, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Lookup form */}
            <div>
              <h3 style={{ fontSize: '1rem', margin: '0 0 4px 0' }}>Открыть заказ по номеру и коду</h3>
              <p style={{ fontSize: '0.83rem', color: 'var(--color-text-secondary)', margin: '0 0 12px 0' }}>
                Номер заказа и код доступа выдаются при оформлении. По ним можно вернуться
                к заказу и чату с любого устройства.
              </p>
              <form onSubmit={handleLookup} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input
                  type="text"
                  inputMode="text"
                  placeholder="Номер заказа (например 20260829-123456)"
                  value={numberInput}
                  onChange={(e) => setNumberInput(e.target.value)}
                  style={fieldStyle}
                />
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Код доступа (4 цифры)"
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  style={fieldStyle}
                />
                {lookupError && (
                  <span style={{ fontSize: '0.83rem', color: 'var(--color-error)', fontWeight: 600 }}>
                    {lookupError}
                  </span>
                )}
                <button
                  type="submit"
                  disabled={isLooking}
                  className="btn-primary"
                  style={{ padding: '12px', backgroundColor: 'var(--color-deep-forest)' }}
                >
                  {isLooking ? 'Ищем…' : 'Открыть заказ'}
                </button>
              </form>

              {foundOrder && (
                <div
                  className="animate-fade-in"
                  style={{
                    marginTop: '14px',
                    padding: '14px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface)',
                  }}
                >
                  <div style={{ fontWeight: 800, fontSize: '1rem' }}>Заказ №{foundOrder.orderNumber}</div>
                  <div style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', margin: '4px 0 10px 0' }}>
                    Статус: <strong style={{ color: 'var(--color-deep-forest)' }}>{clientStageLabel(foundOrder.status)}</strong>
                  </div>
                  <button
                    className="btn-primary"
                    style={{ width: '100%', padding: '11px', backgroundColor: 'var(--color-warm-terracotta)' }}
                    onClick={() => setChatFor({ id: foundOrder.id, orderNumber: foundOrder.orderNumber })}
                  >
                    💬 Чат с менеджером
                  </button>
                </div>
              )}
            </div>

            {/* Device order list */}
            {myOrders.length > 0 && (
              <div>
                <h3 style={{ fontSize: '1rem', margin: '0 0 4px 0' }}>Заказы с этого устройства</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: '0 0 12px 0' }}>
                  Сохранены только в этом браузере.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {myOrders.map((o) => (
                    <div
                      key={o.orderNumber}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--color-border)',
                        backgroundColor: 'var(--color-surface)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '10px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <div style={{ fontSize: '0.85rem' }}>
                        <div style={{ fontWeight: 700 }}>№{o.orderNumber}</div>
                        <div style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>
                          {new Date(o.createdAt).toLocaleString([], { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                          {' · код '}
                          {o.chatAccessCode}
                        </div>
                      </div>
                      <button
                        onClick={() => setChatFor({ id: o.id, orderNumber: o.orderNumber })}
                        style={{
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-sm)',
                          border: 'none',
                          backgroundColor: 'var(--color-deep-forest)',
                          color: 'var(--color-vanilla-cream)',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                        }}
                      >
                        💬 Чат
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ClientOrderChatModal
        isOpen={!!chatFor}
        orderId={chatFor?.id || ''}
        orderNumber={chatFor?.orderNumber || ''}
        onClose={() => setChatFor(null)}
      />
    </>
  );
}
