'use client';

import React, { useState, useEffect } from 'react';
import {
  Dish,
  fetchAllDishes,
  addNewDishInSupabase,
  toggleDishAvailabilityInSupabase,
  fetchCategories,
  addCategory,
  removeCategory,
  readImageFileAsDataUrl,
} from '../../../lib/menu/dishes';

interface EmployeeItem {
  id: string;
  name: string;
  role: 'ADMIN' | 'MANAGER' | 'COURIER' | 'RESOLUTION_OFFICER';
  status: 'ACTIVE' | 'DISABLED' | 'ARCHIVED';
  isLastAdmin?: boolean;
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

const dishFormLabelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.85rem',
  fontWeight: 700,
  marginBottom: '6px',
};

const dishFormInputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border)',
  fontSize: '0.95rem',
};

const dishFormFieldPairStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '12px',
  alignItems: 'end',
};

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'EMPLOYEES' | 'MENU' | 'CATEGORIES' | 'COMPLAINTS'>('MENU');
  const [employees, setEmployees] = useState<EmployeeItem[]>(initialEmployees);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [categories, setCategoriesState] = useState<string[]>([]);
  const [complaints, setComplaints] = useState<ComplaintItem[]>(initialComplaints);
  const [notification, setNotification] = useState<string | null>(null);

  // Category Manager State
  const [newCatName, setNewCatName] = useState<string>('');

  // New Dish Modal State
  const [isAddDishModalOpen, setIsAddDishModalOpen] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newCategory, setNewCategory] = useState<string>('');
  const [customCategoryInput, setCustomCategoryInput] = useState<string>('');
  const [newPrice, setNewPrice] = useState<string>('150');
  const [newDescription, setNewDescription] = useState<string>('');
  const [newImageUrl, setNewImageUrl] = useState<string>('');
  const [newTimeMinutes, setNewTimeMinutes] = useState<string>('15');
  const [newBadge, setNewBadge] = useState<string>('');
  const [isSubmittingDish, setIsSubmittingDish] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      const data = await fetchAllDishes();
      setDishes(data);
      const cats = fetchCategories();
      setCategoriesState(cats);
      if (cats.length > 0) {
        setNewCategory(cats[0]);
      }
    }
    loadData();
  }, []);

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

  // Category Management
  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const updated = addCategory(newCatName.trim());
    setCategoriesState([...updated]);
    setNotification(`✓ Новая категория "${newCatName.trim()}" создана!`);
    setNewCatName('');
  };

  const handleRemoveCategory = (cat: string) => {
    if (confirm(`Вы действительно хотите удалить категорию "${cat}"?`)) {
      const updated = removeCategory(cat);
      setCategoriesState([...updated]);
      setNotification(`Категория "${cat}" удалена.`);
    }
  };

  // Local File Image Selection
  const handleLocalFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const dataUrl = await readImageFileAsDataUrl(file);
        setNewImageUrl(dataUrl);
        setPreviewImage(dataUrl);
      } catch (err) {
        alert('Ошибка при чтении файла изображения.');
      }
    }
  };

  // Toggle Dish Availability
  const handleToggleDish = async (id: string, currentAvailable: boolean) => {
    const nextAvailable = !currentAvailable;
    await toggleDishAvailabilityInSupabase(id, nextAvailable);

    setDishes((prev) =>
      prev.map((d) => (d.id === id ? { ...d, isAvailable: nextAvailable } : d))
    );
    setNotification(`Доступность блюда изменена (${nextAvailable ? 'Включено' : 'Отключено в стоп-лист'}).`);
  };

  // Create New Dish Slot
  const handleCreateNewDish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newPrice.trim()) return;

    const finalCategory = newCategory === 'NEW_CUSTOM' ? customCategoryInput.trim() : newCategory;
    if (!finalCategory) {
      alert('Укажите или выберите категорию блюда!');
      return;
    }

    setIsSubmittingDish(true);
    const created = await addNewDishInSupabase({
      title: newTitle.trim(),
      description: newDescription.trim() || 'Свежее аппетитное блюдо от шеф-повара DAYMOHKCOFEE.',
      price: parseFloat(newPrice) || 100,
      category: finalCategory,
      isAvailable: true,
      estimatedCookingTimeMinutes: parseInt(newTimeMinutes) || 15,
      badge: newBadge.trim() || null,
      imageUrl: newImageUrl.trim() || previewImage || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
    });

    if (created) {
      setDishes((prev) => [created, ...prev]);
      setCategoriesState(fetchCategories());
      setNotification(`✓ Новое блюдо "${created.title}" опубликовано и моментально отображено на витрине!`);
      // Reset Form
      setNewTitle('');
      setNewDescription('');
      setNewImageUrl('');
      setPreviewImage(null);
      setNewBadge('');
      setIsAddDishModalOpen(false);
    }
    setIsSubmittingDish(false);
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span className="badge badge-forest" style={{ marginBottom: '4px' }}>Панель Администратора</span>
          <h1 style={{ fontSize: '2rem', margin: 0, fontWeight: 800 }}>Администрирование DAYMOHKCOFEE</h1>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
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
            🍽️ Меню и Слоты ({dishes.length})
          </button>

          <button
            onClick={() => setActiveTab('CATEGORIES')}
            style={{
              padding: '10px 18px',
              borderRadius: 'var(--radius-full)',
              border: activeTab === 'CATEGORIES' ? 'none' : '1px solid var(--color-border)',
              backgroundColor: activeTab === 'CATEGORIES' ? 'var(--color-deep-forest)' : 'var(--color-surface)',
              color: activeTab === 'CATEGORIES' ? 'var(--color-vanilla-cream)' : 'var(--color-text-primary)',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            🏷️ Категории ({categories.length})
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
            fontWeight: 700,
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

      {/* TAB 2: MENU & SLOTS CREATION */}
      {activeTab === 'MENU' && (
        <div style={{ display: 'grid', gap: '20px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: 'var(--color-surface-subtle)',
              padding: '16px 20px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Управление слотами меню (Неограниченно)</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                Публикуйте новые блюда с загрузкой фото с ПК. Новинки автоматически отображаются у клиентов в режиме онлайн!
              </p>
            </div>
            <button
              onClick={() => setIsAddDishModalOpen(true)}
              className="btn-primary"
              style={{
                backgroundColor: 'var(--color-warm-terracotta)',
                padding: '10px 20px',
                fontWeight: 700,
                fontSize: '0.95rem',
              }}
            >
              + Добавить новое блюдо
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '20px',
            }}
          >
            {dishes.map((dish) => (
              <div
                key={dish.id}
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: 'var(--shadow-sm)',
                  opacity: dish.isAvailable ? 1 : 0.65,
                }}
              >
                {/* Image Preview */}
                <div style={{ position: 'relative', height: '160px', backgroundColor: '#E2E8F0' }}>
                  <img
                    src={dish.imageUrl || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80'}
                    alt={dish.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {dish.badge && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '10px',
                        left: '10px',
                        backgroundColor: 'var(--color-marigold-zest)',
                        color: 'var(--color-deep-forest)',
                        padding: '3px 10px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                      }}
                    >
                      {dish.badge}
                    </span>
                  )}
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '10px',
                      right: '10px',
                      backgroundColor: 'rgba(0,0,0,0.75)',
                      color: '#FFF',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}
                  >
                    ⏱️ {dish.estimatedCookingTimeMinutes || 15} мин
                  </span>
                </div>

                {/* Content */}
                <div style={{ padding: '16px', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>{dish.title}</span>
                      <span className="badge badge-forest" style={{ fontSize: '0.75rem' }}>{dish.category}</span>
                    </div>

                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '12px', lineHeight: 1.4 }}>
                      {dish.description}
                    </p>

                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-deep-forest)', marginBottom: '14px' }}>
                      {dish.price} EGP
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleDish(dish.id, dish.isAvailable)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: 'var(--radius-sm)',
                      border: 'none',
                      backgroundColor: dish.isAvailable ? 'rgba(198, 40, 40, 0.1)' : 'rgba(46, 125, 50, 0.15)',
                      color: dish.isAvailable ? 'var(--color-error)' : 'var(--color-success)',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                    }}
                  >
                    {dish.isAvailable ? '⛔ Скрыть (В стоп-лист)' : '✓ Показать на витрине'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CATEGORIES MANAGEMENT */}
      {activeTab === 'CATEGORIES' && (
        <div style={{ display: 'grid', gap: '20px' }}>
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-md)',
              padding: '24px',
              border: '1px solid var(--color-border)',
            }}
          >
            <h3 style={{ margin: '0 0 12px 0', fontSize: '1.2rem', fontWeight: 800 }}>➕ Добавить новую категорию меню</h3>
            <form onSubmit={handleAddCategorySubmit} style={{ display: 'flex', gap: '12px', maxWidth: '500px' }}>
              <input
                type="text"
                required
                placeholder="Например: Завтраки, Десерты, Соусы..."
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.95rem',
                }}
              />
              <button
                type="submit"
                className="btn-primary"
                style={{ padding: '10px 20px', backgroundColor: 'var(--color-deep-forest)' }}
              >
                + Добавить
              </button>
            </form>
          </div>

          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-md)',
              padding: '24px',
              border: '1px solid var(--color-border)',
            }}
          >
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', fontWeight: 800 }}>🏷️ Активные категории меню ({categories.length})</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              {categories.map((cat) => (
                <div
                  key={cat}
                  style={{
                    backgroundColor: 'var(--color-surface-subtle)',
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                  }}
                >
                  <span>{cat}</span>
                  <button
                    onClick={() => handleRemoveCategory(cat)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-error)',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '1.1rem',
                    }}
                    title="Удалить категорию"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW DISH MODAL FORM WITH LOCAL FILE PHOTO UPLOAD */}
      {isAddDishModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            className="animate-fade-in"
            style={{
              width: '100%',
              maxWidth: '540px',
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-lg)',
              padding: '32px',
              boxShadow: 'var(--shadow-lg)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>➕ Публикация нового блюда</h2>
              <button
                onClick={() => setIsAddDishModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateNewDish} style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label style={dishFormLabelStyle}>Название блюда *</label>
                <input
                  type="text"
                  required
                  placeholder="Например: Люля-кебаб из говядины"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  style={dishFormInputStyle}
                />
              </div>

              <div style={dishFormFieldPairStyle}>
                <div>
                  <label style={dishFormLabelStyle}>Категория *</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    style={{ ...dishFormInputStyle, backgroundColor: 'var(--color-surface)' }}
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                    <option value="NEW_CUSTOM">+ Создать новую категорию...</option>
                  </select>
                </div>

                <div>
                  <label style={dishFormLabelStyle}>Цена (EGP) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="150"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    style={dishFormInputStyle}
                  />
                </div>
              </div>

              {newCategory === 'NEW_CUSTOM' && (
                <div>
                  <label style={dishFormLabelStyle}>Название новой категории *</label>
                  <input
                    type="text"
                    required
                    placeholder="Введите название новой категории"
                    value={customCategoryInput}
                    onChange={(e) => setCustomCategoryInput(e.target.value)}
                    style={dishFormInputStyle}
                  />
                </div>
              )}

              <div>
                <label style={dishFormLabelStyle}>Подробный состав и описание ингредиентов</label>
                <textarea
                  rows={3}
                  placeholder="Опишите состав блюда, специи, вес порции и особенности приготовления..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  style={{ ...dishFormInputStyle, fontSize: '0.9rem', fontFamily: 'inherit' }}
                />
              </div>

              {/* LOCAL FILE PHOTO UPLOAD WITH PREVIEW */}
              <div
                style={{
                  border: '2px dashed var(--color-border)',
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'center',
                  backgroundColor: 'var(--color-surface-subtle)',
                }}
              >
                <label style={{ ...dishFormLabelStyle, cursor: 'pointer' }}>
                  📁 Загрузить фото с компьютера (Локальный носитель)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLocalFileSelect}
                  style={{ fontSize: '0.85rem', marginBottom: '10px' }}
                />

                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
                  или укажите веб-ссылку на изображение:
                </div>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newImageUrl}
                  onChange={(e) => {
                    setNewImageUrl(e.target.value);
                    setPreviewImage(e.target.value);
                  }}
                  style={dishFormInputStyle}
                />

                {previewImage && (
                  <div style={{ marginTop: '12px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                      Предпросмотр загруженного фото:
                    </span>
                    <img
                      src={previewImage}
                      alt="Preview"
                      style={{ height: '120px', borderRadius: 'var(--radius-md)', objectFit: 'cover', border: '1px solid var(--color-border)' }}
                    />
                  </div>
                )}
              </div>

              <div style={dishFormFieldPairStyle}>
                <div>
                  <label style={dishFormLabelStyle}>Время готовки (мин)</label>
                  <input
                    type="number"
                    value={newTimeMinutes}
                    onChange={(e) => setNewTimeMinutes(e.target.value)}
                    style={dishFormInputStyle}
                  />
                </div>
                <div>
                  <label style={dishFormLabelStyle}>Бейдж (необязательно)</label>
                  <input
                    type="text"
                    placeholder="Шеф-выбор, Хит..."
                    value={newBadge}
                    onChange={(e) => setNewBadge(e.target.value)}
                    style={dishFormInputStyle}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsAddDishModalOpen(false)}
                  className="btn-secondary"
                  style={{ flex: 1, padding: '12px' }}
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingDish}
                  className="btn-primary"
                  style={{ flex: 1, padding: '12px', backgroundColor: 'var(--color-warm-terracotta)' }}
                >
                  {isSubmittingDish ? 'Публикация...' : 'Опубликовать блюдо онлайн'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 4: COMPLAINTS */}
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
