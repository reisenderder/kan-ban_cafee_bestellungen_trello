'use client';

import React, { useState } from 'react';

interface EmployeeItem {
  id: string;
  name: string;
  role: 'ADMIN' | 'MANAGER' | 'COURIER' | 'RESOLUTION_OFFICER';
  status: 'ACTIVE' | 'DISABLED' | 'ARCHIVED';
  isLastAdmin?: boolean;
}

interface MenuItemData {
  id: string;
  title: string;
  category: string;
  price: number;
  isAvailable: boolean;
}

interface ComplaintItem {
  id: string;
  complaintNumber: string;
  category: string;
  contactInfo: string;
  text: string;
  status: 'NEW' | 'IN_REVIEW' | 'RESOLVED' | 'REJECTED';
  createdAt: string;
}

const initialEmployees: EmployeeItem[] = [
  { id: 'emp-1', name: 'Владелец (Администратор)', role: 'ADMIN', status: 'ACTIVE', isLastAdmin: true },
  { id: 'emp-2', name: 'Менеджер Каира', role: 'MANAGER', status: 'ACTIVE' },
  { id: 'emp-3', name: 'Курьер 1', role: 'COURIER', status: 'ACTIVE' },
  { id: 'emp-4', name: 'Офицер Урегулирования', role: 'RESOLUTION_OFFICER', status: 'ACTIVE' },
];

const initialMenuItems: MenuItemData[] = [
  { id: 'm-1', title: 'Блюдо 1', category: 'Категория 1', price: 150, isAvailable: true },
  { id: 'm-2', title: 'Блюдо 2', category: 'Категория 1', price: 200, isAvailable: true },
  { id: 'm-3', title: 'Блюдо 3', category: 'Категория 2', price: 180, isAvailable: true },
  { id: 'm-4', title: 'Блюдо 4', category: 'Категория 2', price: 250, isAvailable: false },
  { id: 'm-5', title: 'Блюдо 5', category: 'Категория 3', price: 120, isAvailable: true },
  { id: 'm-6', title: 'Блюдо 6', category: 'Категория 4', price: 300, isAvailable: true },
];

const initialComplaints: ComplaintItem[] = [
  {
    id: 'cmp-1',
    complaintNumber: 'CMP-2026-001',
    category: 'DELIVERY',
    contactInfo: '+20 12* *** *555',
    text: 'Задержка курьера на 20 минут в районе Маади.',
    status: 'NEW',
    createdAt: '09:40',
  },
  {
    id: 'cmp-2',
    complaintNumber: 'CMP-2026-002',
    category: 'FOOD_QUALITY',
    contactInfo: 'email@example.com',
    text: 'Уточнение по степени остроты блюда.',
    status: 'RESOLVED',
    createdAt: '08:15',
  },
];

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'EMPLOYEES' | 'MENU' | 'COMPLAINTS'>('EMPLOYEES');
  const [employees, setEmployees] = useState<EmployeeItem[]>(initialEmployees);
  const [menuItems, setMenuItems] = useState<MenuItemData[]>(initialMenuItems);
  const [complaints, setComplaints] = useState<ComplaintItem[]>(initialComplaints);
  const [notification, setNotification] = useState<string | null>(null);

  // Employee Lifecycle: ACTIVE -> DISABLED -> ARCHIVED (No hard delete)
  const handleEmployeeStatusChange = (id: string, newStatus: EmployeeItem['status']) => {
    const emp = employees.find((e) => e.id === id);
    if (emp?.isLastAdmin && newStatus !== 'ACTIVE') {
      alert('Нельзя отключить или архивировать последнего администратора системы!');
      return;
    }

    setEmployees((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: newStatus } : e))
    );
    setNotification(`Статус сотрудника "${emp?.name}" изменён на ${newStatus}.`);
  };

  // Toggle Menu Availability
  const handleToggleMenuAvailability = (id: string) => {
    setMenuItems((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const updated = !m.isAvailable;
          setNotification(`Доступность слота "${m.title}" изменена: ${updated ? 'Доступен' : 'Отключён'}`);
          return { ...m, isAvailable: updated };
        }
        return m;
      })
    );
  };

  // Resolve Complaint
  const handleComplaintStatusChange = (id: string, newStatus: ComplaintItem['status']) => {
    setComplaints((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
    );
    setNotification(`Статус жалобы ${id} изменён на ${newStatus}.`);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <span className="badge badge-forest" style={{ marginBottom: '4px' }}>Панель Администратора</span>
          <h1 style={{ fontSize: '2rem', margin: 0 }}>Администрирование DAYMOHKCOFEE</h1>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('EMPLOYEES')}
            style={{
              padding: '10px 18px',
              borderRadius: 'var(--radius-full)',
              border: activeTab === 'EMPLOYEES' ? 'none' : '1px solid var(--color-border)',
              backgroundColor: activeTab === 'EMPLOYEES' ? 'var(--color-deep-forest)' : 'var(--color-surface)',
              color: activeTab === 'EMPLOYEES' ? 'var(--color-vanilla-cream)' : 'var(--color-text-primary)',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            👥 Сотрудники ({employees.length})
          </button>
          <button
            onClick={() => setActiveTab('MENU')}
            style={{
              padding: '10px 18px',
              borderRadius: 'var(--radius-full)',
              border: activeTab === 'MENU' ? 'none' : '1px solid var(--color-border)',
              backgroundColor: activeTab === 'MENU' ? 'var(--color-deep-forest)' : 'var(--color-surface)',
              color: activeTab === 'MENU' ? 'var(--color-vanilla-cream)' : 'var(--color-text-primary)',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            🍽️ Меню и Слоты ({menuItems.length})
          </button>
          <button
            onClick={() => setActiveTab('COMPLAINTS')}
            style={{
              padding: '10px 18px',
              borderRadius: 'var(--radius-full)',
              border: activeTab === 'COMPLAINTS' ? 'none' : '1px solid var(--color-border)',
              backgroundColor: activeTab === 'COMPLAINTS' ? 'var(--color-deep-forest)' : 'var(--color-surface)',
              color: activeTab === 'COMPLAINTS' ? 'var(--color-vanilla-cream)' : 'var(--color-text-primary)',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            📨 Жалобы ({complaints.filter((c) => c.status === 'NEW').length})
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

      {/* TAB 1: EMPLOYEES LIFECYCLE */}
      {activeTab === 'EMPLOYEES' && (
        <div style={{ display: 'grid', gap: '16px' }}>
          <div
            style={{
              backgroundColor: 'var(--color-surface-subtle)',
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              color: 'var(--color-text-secondary)',
            }}
          >
            ℹ️ Жизненный цикл сотрудников: <strong>Активен → Отключён → Архив</strong>. Физическое удаление (Hard Delete) и отключение последнего администратора запрещены для защиты целостности AuditLog.
          </div>

          {employees.map((emp) => (
            <div
              key={emp.id}
              style={{
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--radius-md)',
                padding: '18px 20px',
                border: '1px solid var(--color-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>{emp.name}</span>
                  <span className="badge badge-forest">{emp.role}</span>
                  {emp.isLastAdmin && (
                    <span className="badge badge-marigold" style={{ fontSize: '0.7rem' }}>
                      Главный Админ
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                  Статус доступа: <strong>{emp.status}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                {emp.status === 'ACTIVE' && (
                  <button
                    onClick={() => handleEmployeeStatusChange(emp.id, 'DISABLED')}
                    disabled={emp.isLastAdmin}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-surface)',
                      color: emp.isLastAdmin ? 'var(--color-text-muted)' : 'var(--color-warm-terracotta)',
                      cursor: emp.isLastAdmin ? 'not-allowed' : 'pointer',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                    }}
                  >
                    Отключить
                  </button>
                )}

                {emp.status === 'DISABLED' && (
                  <>
                    <button
                      onClick={() => handleEmployeeStatusChange(emp.id, 'ACTIVE')}
                      className="btn-primary"
                      style={{ padding: '8px 14px', fontSize: '0.85rem' }}
                    >
                      Восстановить
                    </button>
                    <button
                      onClick={() => handleEmployeeStatusChange(emp.id, 'ARCHIVED')}
                      style={{
                        padding: '8px 14px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--color-border)',
                        backgroundColor: 'var(--color-surface)',
                        color: 'var(--color-text-secondary)',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                      }}
                    >
                      В архив
                    </button>
                  </>
                )}

                {emp.status === 'ARCHIVED' && (
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                    В архиве (Доступ заблокирован)
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: MENU & SLOTS */}
      {activeTab === 'MENU' && (
        <div style={{ display: 'grid', gap: '16px' }}>
          <div
            style={{
              backgroundColor: 'var(--color-surface-subtle)',
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              color: 'var(--color-text-secondary)',
            }}
          >
            🍽️ Администратор управляет составом витринных мест и кнопками временного отключения позиций.
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '16px',
            }}
          >
            {menuItems.map((item) => (
              <div
                key={item.id}
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  opacity: item.isAvailable ? 1 : 0.65,
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{item.title}</span>
                    <span className="badge badge-forest">{item.category}</span>
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-deep-forest)', marginBottom: '12px' }}>
                    {item.price} EGP
                  </div>
                </div>

                <button
                  onClick={() => handleToggleMenuAvailability(item.id)}
                  style={{
                    padding: '8px',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    backgroundColor: item.isAvailable ? 'rgba(198, 40, 40, 0.1)' : 'rgba(46, 125, 50, 0.15)',
                    color: item.isAvailable ? 'var(--color-error)' : 'var(--color-success)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                  }}
                >
                  {item.isAvailable ? 'Отключить заказ' : 'Включить заказ'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: COMPLAINTS */}
      {activeTab === 'COMPLAINTS' && (
        <div style={{ display: 'grid', gap: '16px' }}>
          {complaints.map((c) => (
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
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>{c.complaintNumber}</span>
                  <span className="badge badge-marigold">{c.category}</span>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: c.status === 'RESOLVED' ? 'var(--color-success)' : 'var(--color-warm-terracotta)',
                    }}
                  >
                    [{c.status}]
                  </span>
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '10px' }}>
                  {c.text}
                </p>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                  Контакт: {c.contactInfo} | Время: {c.createdAt}
                </div>
              </div>

              {c.status === 'NEW' && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="btn-primary"
                    style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                    onClick={() => handleComplaintStatusChange(c.id, 'RESOLVED')}
                  >
                    ✓ Решено
                  </button>
                  <button
                    className="btn-secondary"
                    style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                    onClick={() => handleComplaintStatusChange(c.id, 'REJECTED')}
                  >
                    Отклонить
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
