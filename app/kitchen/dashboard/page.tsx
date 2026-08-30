'use client';

import React, { useState, useEffect } from 'react';
import { StaffTopNav } from '../../../components/StaffTopNav';

export interface KitchenItem {
  name: string;
  quantity: number;
  notes?: string;
}

export interface KitchenOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  orderType: 'DELIVERY' | 'TAKEOUT' | 'DINE_IN';
  items: KitchenItem[];
  status: 'COOKING' | 'COOKED';
  startedAt: string; // ISO string
  completedAt?: string;
  targetMinutes: number;
  actualMinutes?: number;
  isOverdue?: boolean;
}

const initialKitchenOrders: KitchenOrder[] = [
  {
    id: 'k-101',
    orderNumber: 'ORD-2026-081',
    customerName: 'Ахмед (Маади)',
    orderType: 'DELIVERY',
    items: [
      { name: 'Блюдо 1 (Люля-кебаб)', quantity: 2, notes: 'Соус отдельно' },
      { name: 'Блюдо 3 (Лимонад)', quantity: 2 },
    ],
    status: 'COOKING',
    startedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 мин назад
    targetMinutes: 15,
  },
  {
    id: 'k-102',
    orderNumber: 'ORD-2026-082',
    customerName: 'Фатима',
    orderType: 'TAKEOUT',
    items: [
      { name: 'Блюдо 2 (Шашлык из курицы)', quantity: 1, notes: 'Без лука' },
      { name: 'Блюдо 5 (Суп дня)', quantity: 1 },
    ],
    status: 'COOKING',
    startedAt: new Date(Date.now() - 17 * 60 * 1000).toISOString(), // 17 мин назад (просрочен на 2 мин)
    targetMinutes: 15,
  },
  {
    id: 'k-103',
    orderNumber: 'ORD-2026-080',
    customerName: 'Ибрагим',
    orderType: 'DELIVERY',
    items: [
      { name: 'Блюдо 6 (Хачапури по-аджарски)', quantity: 1 },
    ],
    status: 'COOKED',
    startedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    targetMinutes: 15,
    actualMinutes: 15,
    isOverdue: false,
  },
];

export default function KitchenDashboardPage() {
  const [orders, setOrders] = useState<KitchenOrder[]>(initialKitchenOrders);
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'COMPLETED'>('ACTIVE');
  const [currentTime, setCurrentTime] = useState<number>(Date.now());
  const [notification, setNotification] = useState<string | null>(null);

  // Live timer tick every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate elapsed time in seconds
  const getElapsedSeconds = (startedAt: string) => {
    const start = new Date(startedAt).getTime();
    return Math.max(0, Math.floor((currentTime - start) / 1000));
  };

  // Format seconds into MM:SS
  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Mark Order as Cooked (No delay popup survey required per explicit user rule)
  const handleMarkCooked = (id: string) => {
    const now = new Date();
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === id) {
          const startTime = new Date(ord.startedAt).getTime();
          const elapsedMin = Math.round((now.getTime() - startTime) / (60 * 1000));
          const overdue = elapsedMin > ord.targetMinutes;

          setNotification(
            `Заказ ${ord.orderNumber} готов! Приготовление заняло ${elapsedMin} мин. (Норма: ${ord.targetMinutes} мин)`
          );

          return {
            ...ord,
            status: 'COOKED',
            completedAt: now.toISOString(),
            actualMinutes: elapsedMin,
            isOverdue: overdue,
          };
        }
        return ord;
      })
    );
  };

  const activeOrders = orders.filter((o) => o.status === 'COOKING');
  const completedOrders = orders.filter((o) => o.status === 'COOKED');

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px 16px', minHeight: '100vh' }}>
      <StaffTopNav current="kitchen" />

      {/* Top Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '16px',
          backgroundColor: 'var(--color-surface)',
          padding: '20px 24px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="badge badge-forest">Экран Повара (KDS)</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
              ● Supabase Realtime Active
            </span>
          </div>
          <h1 style={{ fontSize: '2rem', margin: '6px 0 0 0', fontWeight: 800 }}>
            🍳 Электронная Кухня DAYMOHKCOFEE
          </h1>
        </div>

        {/* Tab Controls & Counters */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setActiveTab('ACTIVE')}
            style={{
              padding: '12px 24px',
              borderRadius: 'var(--radius-full)',
              border: activeTab === 'ACTIVE' ? 'none' : '1px solid var(--color-border)',
              backgroundColor: activeTab === 'ACTIVE' ? 'var(--color-deep-forest)' : 'var(--color-surface)',
              color: activeTab === 'ACTIVE' ? 'var(--color-vanilla-cream)' : 'var(--color-text-primary)',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            🔥 В готовке ({activeOrders.length})
          </button>

          <button
            onClick={() => setActiveTab('COMPLETED')}
            style={{
              padding: '12px 24px',
              borderRadius: 'var(--radius-full)',
              border: activeTab === 'COMPLETED' ? 'none' : '1px solid var(--color-border)',
              backgroundColor: activeTab === 'COMPLETED' ? 'var(--color-deep-forest)' : 'var(--color-surface)',
              color: activeTab === 'COMPLETED' ? 'var(--color-vanilla-cream)' : 'var(--color-text-primary)',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            ✅ Готовые ({completedOrders.length})
          </button>
        </div>
      </div>

      {/* Notification banner */}
      {notification && (
        <div
          className="animate-fade-in"
          style={{
            backgroundColor: 'rgba(46, 125, 50, 0.15)',
            border: '1px solid var(--color-success)',
            color: 'var(--color-success)',
            padding: '14px 20px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '24px',
            fontWeight: 600,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>✓ {notification}</span>
          <button
            onClick={() => setNotification(null)}
            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '1.2rem' }}
          >
            &times;
          </button>
        </div>
      )}

      {/* ACTIVE ORDERS GRID */}
      {activeTab === 'ACTIVE' && (
        <div>
          {activeOrders.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '60px 20px',
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--radius-lg)',
                border: '2px dashed var(--color-border)',
                color: 'var(--color-text-muted)',
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>👨‍🍳</div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '8px', color: 'var(--color-text-primary)' }}>
                На кухне пока нет активных заказов
              </h2>
              <p style={{ margin: 0 }}>Как только менеджер отправит заказ в готовку, он появится здесь.</p>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(340px, 100%), 1fr))',
                gap: '20px',
              }}
            >
              {activeOrders.map((ord) => {
                const elapsedSec = getElapsedSeconds(ord.startedAt);
                const elapsedMin = Math.floor(elapsedSec / 60);
                const isOverdue = elapsedMin >= ord.targetMinutes;
                const isWarning = !isOverdue && elapsedMin >= ord.targetMinutes - 3;

                // Color themes based on time status
                let borderColor = 'var(--color-border)';
                let timerBg = 'rgba(30, 58, 43, 0.1)';
                let timerColor = 'var(--color-deep-forest)';

                if (isOverdue) {
                  borderColor = 'var(--color-warm-terracotta)';
                  timerBg = 'rgba(200, 90, 50, 0.2)';
                  timerColor = 'var(--color-warm-terracotta)';
                } else if (isWarning) {
                  borderColor = 'var(--color-marigold)';
                  timerBg = 'rgba(234, 168, 0, 0.2)';
                  timerColor = '#B88200';
                }

                return (
                  <div
                    key={ord.id}
                    className="animate-fade-in"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      borderRadius: 'var(--radius-lg)',
                      border: `3px solid ${borderColor}`,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: 'var(--shadow-md)',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Header of Order Card */}
                    <div
                      style={{
                        padding: '16px 20px',
                        backgroundColor: 'var(--color-surface-subtle)',
                        borderBottom: '1px solid var(--color-border)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-deep-forest)' }}>
                          {ord.orderNumber}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                          Клиент: {ord.customerName}
                        </div>
                      </div>

                      {/* Timer Display */}
                      <div
                        style={{
                          textAlign: 'right',
                          padding: '8px 14px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: timerBg,
                          color: timerColor,
                          fontWeight: 800,
                        }}
                      >
                        <div style={{ fontSize: '1.4rem', fontFamily: 'monospace', lineHeight: 1 }}>
                          {formatTime(elapsedSec)}
                        </div>
                        <div style={{ fontSize: '0.7rem', marginTop: '4px', textTransform: 'uppercase' }}>
                          {isOverdue ? '⚠️ Превышение!' : `Норма: ${ord.targetMinutes} мин`}
                        </div>
                      </div>
                    </div>

                    {/* Items List */}
                    <div style={{ padding: '20px', flexGrow: 1 }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '12px', textTransform: 'uppercase' }}>
                        Состав заказа:
                      </div>

                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '10px' }}>
                        {ord.items.map((item, idx) => (
                          <li
                            key={idx}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'flex-start',
                              paddingBottom: '8px',
                              borderBottom: idx === ord.items.length - 1 ? 'none' : '1px dashed var(--color-border)',
                            }}
                          >
                            <div>
                              <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-text-primary)' }}>
                                {item.name}
                              </span>
                              {item.notes && (
                                <div style={{ fontSize: '0.85rem', color: 'var(--color-warm-terracotta)', fontWeight: 600, marginTop: '2px' }}>
                                  📝 Примечание: {item.notes}
                                </div>
                              )}
                            </div>
                            <span
                              style={{
                                backgroundColor: 'var(--color-deep-forest)',
                                color: 'var(--color-vanilla-cream)',
                                padding: '4px 10px',
                                borderRadius: 'var(--radius-full)',
                                fontWeight: 800,
                                fontSize: '1rem',
                                marginLeft: '12px',
                              }}
                            >
                              x{item.quantity}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Action Button: Mark Cooked */}
                    <div style={{ padding: '16px 20px', backgroundColor: 'var(--color-surface-subtle)', borderTop: '1px solid var(--color-border)' }}>
                      <button
                        onClick={() => handleMarkCooked(ord.id)}
                        className="btn-primary"
                        style={{
                          width: '100%',
                          padding: '16px',
                          fontSize: '1.1rem',
                          fontWeight: 800,
                          borderRadius: 'var(--radius-md)',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          gap: '8px',
                          boxShadow: 'var(--shadow-sm)',
                        }}
                      >
                        ✅ ГОТОВО (Передать Менеджеру)
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* COMPLETED ORDERS TAB */}
      {activeTab === 'COMPLETED' && (
        <div style={{ display: 'grid', gap: '16px' }}>
          {completedOrders.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '40px 20px',
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--radius-lg)',
                border: '1px dashed var(--color-border)',
                color: 'var(--color-text-muted)',
              }}
            >
              История готовых заказов пока пуста.
            </div>
          ) : (
            completedOrders.map((ord) => (
              <div
                key={ord.id}
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderRadius: 'var(--radius-md)',
                  padding: '20px',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '16px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--color-deep-forest)' }}>
                      {ord.orderNumber}
                    </span>
                    <span className="badge badge-forest">{ord.customerName}</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                      ({ord.orderType})
                    </span>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                    Блюда: {ord.items.map((i) => `${i.name} (${i.quantity}x)`).join(', ')}
                  </div>
                </div>

                {/* Timing Analysis Summary */}
                <div style={{ textAlign: 'right' }}>
                  <div
                    style={{
                      fontSize: '1.1rem',
                      fontWeight: 800,
                      color: ord.isOverdue ? 'var(--color-warm-terracotta)' : 'var(--color-success)',
                    }}
                  >
                    ⏱️ Приготовлено за {ord.actualMinutes} мин.
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                    Норматив: {ord.targetMinutes} мин. | {ord.isOverdue ? '⚠️ Была задержка' : '✓ В рамках нормы'}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
