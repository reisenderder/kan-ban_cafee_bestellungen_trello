'use client';

import React, { useState } from 'react';
import { DiscountResaleModal } from '../../../components/DiscountResaleModal';

interface ResolutionCaseItem {
  id: string;
  caseNumber: string;
  type: 'UNCONFIRMED_ORDER' | 'CUSTOMER_UNAVAILABLE' | 'RETURNED_ORDER' | 'CUSTOMER_COMPLAINT';
  status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  orderNumber?: string;
  originalAmount?: number;
  contactFormatMarker?: string;
  notes: string;
  createdAt: string;
}

interface RiskEntry {
  id: string;
  entityType: 'PHONE' | 'TELEGRAM' | 'EMAIL' | 'ADDRESS';
  valueMasked: string;
  riskLevel: 'YELLOW' | 'RED';
  incidentCount: number;
  expiresInfo: string;
}

const initialCases: ResolutionCaseItem[] = [
  {
    id: 'case-001',
    caseNumber: 'RC-2026-001',
    type: 'UNCONFIRMED_ORDER',
    status: 'NEW',
    contactFormatMarker: 'FORMAT_NOT_SPECIFIED',
    notes: 'Неподтверждённая попытка OTP через Telegram. Истёк 10-минутный лимит.',
    createdAt: '10:00',
  },
  {
    id: 'case-002',
    caseNumber: 'RC-2026-002',
    type: 'RETURNED_ORDER',
    status: 'IN_PROGRESS',
    orderNumber: '20260726-0005',
    originalAmount: 450,
    notes: 'Клиент отказался при доставке. Заказ возвращён в кафе, блюдо годно для повторной продажи.',
    createdAt: '09:30',
  },
  {
    id: 'case-003',
    caseNumber: 'RC-2026-003',
    type: 'CUSTOMER_UNAVAILABLE',
    status: 'NEW',
    orderNumber: '20260726-0004',
    originalAmount: 320,
    notes: 'Курьер прибыл по адресу, клиент не отвечает на звонки и сообщения 15 минут.',
    createdAt: '09:15',
  },
];

const initialRiskEntries: RiskEntry[] = [
  {
    id: 'risk-1',
    entityType: 'PHONE',
    valueMasked: '+20 12* *** *999',
    riskLevel: 'YELLOW',
    incidentCount: 4,
    expiresInfo: 'Снятие через 45 дней (60 дней порог)',
  },
  {
    id: 'risk-2',
    entityType: 'TELEGRAM',
    valueMasked: '@user_******',
    riskLevel: 'RED',
    incidentCount: 6,
    expiresInfo: 'Только ручное снятие офицером',
  },
];

export default function ResolutionDashboardPage() {
  const [cases, setCases] = useState<ResolutionCaseItem[]>(initialCases);
  const [riskEntries, setRiskEntries] = useState<RiskEntry[]>(initialRiskEntries);
  const [resaleModalData, setResaleModalData] = useState<{
    orderId: string;
    orderNumber: string;
    amount: number;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<'CASES' | 'RISKS'>('CASES');
  const [notification, setNotification] = useState<string | null>(null);

  const handleResolveCase = (caseId: string) => {
    setCases((prev) =>
      prev.map((c) => (c.id === caseId ? { ...c, status: 'RESOLVED' } : c))
    );
    setNotification(`Кейс ${caseId} успешно закрыт.`);
  };

  const handleRemoveRisk = (riskId: string) => {
    setRiskEntries((prev) => prev.filter((r) => r.id !== riskId));
    setNotification('Запись риска досрочно снята с учёта.');
  };

  const handleResaleSuccess = (newOrderNumber: string, discountPrice: number) => {
    setResaleModalData(null);
    setNotification(
      `Создан новый скидочный заказ ${newOrderNumber} со стоимостью ${discountPrice} EGP! Статус: Готов к доставке.`
    );
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <span className="badge badge-forest" style={{ marginBottom: '4px' }}>Отдел урегулирования</span>
          <h1 style={{ fontSize: '2rem', margin: 0 }}>Управление рисками и претензиями</h1>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('CASES')}
            style={{
              padding: '10px 20px',
              borderRadius: 'var(--radius-full)',
              border: activeTab === 'CASES' ? 'none' : '1px solid var(--color-border)',
              backgroundColor: activeTab === 'CASES' ? 'var(--color-deep-forest)' : 'var(--color-surface)',
              color: activeTab === 'CASES' ? 'var(--color-vanilla-cream)' : 'var(--color-text-primary)',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Кейсы ({cases.filter((c) => c.status !== 'RESOLVED').length})
          </button>
          <button
            onClick={() => setActiveTab('RISKS')}
            style={{
              padding: '10px 20px',
              borderRadius: 'var(--radius-full)',
              border: activeTab === 'RISKS' ? 'none' : '1px solid var(--color-border)',
              backgroundColor: activeTab === 'RISKS' ? 'var(--color-deep-forest)' : 'var(--color-surface)',
              color: activeTab === 'RISKS' ? 'var(--color-vanilla-cream)' : 'var(--color-text-primary)',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Списки риска ({riskEntries.length})
          </button>
        </div>
      </div>

      {notification && (
        <div
          className="animate-fade-in"
          style={{
            backgroundColor: 'rgba(46, 125, 50, 0.15)',
            border: '1px solid var(--color-success)',
            color: 'var(--color-success)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>✓ {notification}</span>
          <button
            onClick={() => setNotification(null)}
            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontWeight: 'bold' }}
          >
            &times;
          </button>
        </div>
      )}

      {/* CASES TAB */}
      {activeTab === 'CASES' ? (
        <div style={{ display: 'grid', gap: '16px' }}>
          {cases.map((c) => (
            <div
              key={c.id}
              style={{
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--radius-md)',
                padding: '20px',
                border: '1px solid var(--color-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}
            >
              <div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>{c.caseNumber}</span>
                  <span
                    className={`badge ${
                      c.type === 'RETURNED_ORDER'
                        ? 'badge-marigold'
                        : c.type === 'UNCONFIRMED_ORDER'
                        ? 'badge-forest'
                        : 'badge-marigold'
                    }`}
                  >
                    {c.type === 'UNCONFIRMED_ORDER' && 'Неподтверждённый OTP'}
                    {c.type === 'RETURNED_ORDER' && 'Возвращённый заказ'}
                    {c.type === 'CUSTOMER_UNAVAILABLE' && 'Недоступный клиент'}
                    {c.type === 'CUSTOMER_COMPLAINT' && 'Жалоба'}
                  </span>
                  {c.contactFormatMarker && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
                      [{c.contactFormatMarker}]
                    </span>
                  )}
                </div>

                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '12px' }}>
                  {c.notes}
                </p>

                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                  Время создания: {c.createdAt}
                  {c.orderNumber && ` | Заказ: ${c.orderNumber}`}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '180px' }}>
                {c.type === 'RETURNED_ORDER' && c.originalAmount && (
                  <button
                    className="btn-primary"
                    style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                    onClick={() =>
                      setResaleModalData({
                        orderId: c.id,
                        orderNumber: c.orderNumber || '20260726-0005',
                        amount: c.originalAmount || 450,
                      })
                    }
                  >
                    🏷️ Продать со скидкой
                  </button>
                )}

                {c.status !== 'RESOLVED' && (
                  <button
                    className="btn-secondary"
                    style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                    onClick={() => handleResolveCase(c.id)}
                  >
                    ✓ Закрыть кейс
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* RISKS TAB */
        <div style={{ display: 'grid', gap: '16px' }}>
          {riskEntries.map((r) => (
            <div
              key={r.id}
              style={{
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--radius-md)',
                padding: '20px',
                border: '1px solid var(--color-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '6px' }}>
                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      backgroundColor: r.riskLevel === 'RED' ? 'rgba(198, 40, 40, 0.15)' : 'rgba(234, 168, 0, 0.15)',
                      color: r.riskLevel === 'RED' ? 'var(--color-error)' : '#9E7000',
                    }}
                  >
                    {r.riskLevel === 'RED' ? '🔴 КРАСНЫЙ СПИСОК' : '🟡 ЖЁЛТЫЙ СПИСОК'}
                  </span>
                  <span style={{ fontWeight: 600, fontSize: '1rem' }}>{r.valueMasked}</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                  Тип: {r.entityType} | Совпадений: {r.incidentCount} | {r.expiresInfo}
                </div>
              </div>

              <button
                onClick={() => handleRemoveRisk(r.id)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text-primary)',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Досрочно снять риск
              </button>
            </div>
          ))}
        </div>
      )}

      {resaleModalData && (
        <DiscountResaleModal
          isOpen={true}
          sourceOrderId={resaleModalData.orderId}
          sourceOrderNumber={resaleModalData.orderNumber}
          originalAmount={resaleModalData.amount}
          onResaleCreated={handleResaleSuccess}
          onClose={() => setResaleModalData(null)}
        />
      )}
    </div>
  );
}
