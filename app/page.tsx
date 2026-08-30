'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useCart } from '../context/CartContext';
import { fetchAvailableDishes, Dish, defaultDishes, fetchCategories, subscribeToMenuUpdates, subscribeToDishesRealtime } from '../lib/menu/dishes';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

export default function HomePage() {
  const { items, addItem, updateQuantity } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<string>('Все');
  const [dishes, setDishes] = useState<Dish[]>(defaultDishes.filter((d) => d.isAvailable));
  const [categories, setCategories] = useState<string[]>(['Все', ...fetchCategories()]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedDishForModal, setSelectedDishForModal] = useState<Dish | null>(null);

  useBodyScrollLock(!!selectedDishForModal);

  const reloadMenuData = async () => {
    setIsLoading(true);
    const data = await fetchAvailableDishes();
    setDishes(data);
    const cats = fetchCategories();
    // Build unique categories dynamically from current dishes and store
    const dishCategories = Array.from(new Set(data.map((d) => d.category)));
    const allUniqueCats = Array.from(new Set([...cats, ...dishCategories]));
    setCategories(['Все', ...allUniqueCats]);
    setIsLoading(false);
  };

  // Fetch Available Dishes from Supabase DB & subscribe to Realtime Updates
  useEffect(() => {
    reloadMenuData();

    // Same-browser / same-device live update (localStorage + custom event)
    const unsubscribeLocal = subscribeToMenuUpdates(() => {
      reloadMenuData();
    });

    // Cross-device live update via Supabase Realtime on the `dishes` table (пункт 3)
    const unsubscribeRealtime = subscribeToDishesRealtime(() => {
      reloadMenuData();
    });

    return () => {
      unsubscribeLocal();
      unsubscribeRealtime();
    };
  }, []);

  const filteredDishes = selectedCategory === 'Все'
    ? dishes
    : dishes.filter((d) => d.category === selectedCategory);

  return (
    <div className="animate-fade-in storefront">
      {/* Hero Banner */}
      <section className="storefront__hero">
        <div style={{ position: 'relative', zIndex: 2 }}>
          <span className="badge badge-marigold" style={{ marginBottom: '16px', display: 'inline-block' }}>Кавказское кафе в Каире</span>
          <h1>DAYMOHKCOFEE</h1>
          <p>
            Традиционные блюда со свежими ингредиентами и быстрой доставкой по Каиру. Все новинки обновляются в режиме онлайн.
          </p>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <a href="#menu" className="btn-primary" style={{ padding: '14px 32px', fontSize: '1rem' }}>
              Перейти к меню ({dishes.length} блюд)
            </a>
          </div>
        </div>
      </section>

      {/* Menu Categories */}
      <section id="menu" style={{ marginBottom: '40px' }}>
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', marginBottom: '8px' }}>Публичное Меню</h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
            Кликните на любое блюдо для просмотра подробного состава ингредиентов | Живое обновление онлайн
          </p>
        </div>

        {/* Dynamic Category Filter */}
        <div className="menu-cats">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`menu-cats__chip${isSelected ? ' menu-cats__chip--active' : ''}`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Loading Indicator or Dishes Grid */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-muted)' }}>
            ⏳ Синхронизация меню с базой данных Supabase...
          </div>
        ) : (
          <div className="menu-grid">
            {filteredDishes.map((dish) => {
              const cartItem = items.find((i) => i.id === dish.id);
              const quantityInCart = cartItem ? cartItem.quantity : 0;

              return (
                <div
                  key={dish.id}
                  className="card-menu"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    overflow: 'hidden',
                    padding: 0,
                  }}
                >
                  {/* Dish Photo Banner */}
                  <div
                    className="menu-grid__photo"
                    onClick={() => setSelectedDishForModal(dish)}
                  >
                    <img
                      src={dish.imageUrl || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80'}
                      alt={dish.title}
                    />
                    {dish.badge && (
                      <span
                        style={{
                          position: 'absolute',
                          top: '12px',
                          left: '12px',
                          backgroundColor: 'var(--color-marigold-zest)',
                          color: 'var(--color-deep-forest)',
                          padding: '4px 12px',
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
                        bottom: '12px',
                        right: '12px',
                        backgroundColor: 'rgba(0,0,0,0.75)',
                        color: '#FFF',
                        padding: '3px 10px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                      }}
                    >
                      🔍 Подробнее
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="menu-grid__body" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div onClick={() => setSelectedDishForModal(dish)} style={{ cursor: 'pointer' }}>
                      <h3 className="menu-grid__title">{dish.title}</h3>
                      <p className="menu-grid__desc">{dish.description}</p>
                    </div>

                    <div className="menu-grid__buy">
                      <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.25rem', color: 'var(--color-deep-forest)' }}>
                        {dish.price} EGP
                      </span>

                      {quantityInCart > 0 ? (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            backgroundColor: 'var(--color-deep-forest)',
                            borderRadius: 'var(--radius-md)',
                            padding: '4px 6px',
                            gap: '8px',
                          }}
                        >
                          <button
                            onClick={() => updateQuantity(dish.id, -1)}
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: 'var(--radius-sm)',
                              border: 'none',
                              backgroundColor: 'rgba(255, 255, 255, 0.2)',
                              color: '#FFF',
                              fontWeight: 'bold',
                              fontSize: '1rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                            title="Уменьшить количество"
                          >
                            -
                          </button>
                          <span
                            style={{
                              color: '#FFF',
                              fontWeight: 700,
                              fontSize: '0.95rem',
                              minWidth: '20px',
                              textAlign: 'center',
                            }}
                          >
                            {quantityInCart}
                          </span>
                          <button
                            onClick={() => updateQuantity(dish.id, 1)}
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: 'var(--radius-sm)',
                              border: 'none',
                              backgroundColor: 'rgba(255, 255, 255, 0.2)',
                              color: '#FFF',
                              fontWeight: 'bold',
                              fontSize: '1rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                            title="Увеличить количество"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          className="btn-primary"
                          style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                          onClick={() =>
                            addItem({
                              id: dish.id,
                              title: dish.title,
                              price: dish.price,
                              category: dish.category,
                            })
                          }
                        >
                          В корзину
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* DETAILED DISH INSPECTION MODAL — рендерим порталом в <body>.
          На корне страницы висит .animate-fade-in с постоянным transform
          (animation-fill-mode: forwards), а любой transform у предка
          превращает position: fixed в позиционирование относительно этого
          предка. Без портала окно «уезжало» в середину списка вместо
          центра экрана — особенно заметно при прокрутке на телефоне. */}
      {selectedDishForModal && typeof document !== 'undefined' && createPortal(
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            overflowY: 'auto',
            overscrollBehavior: 'contain',
          }}
        >
          <div
            className="animate-fade-in"
            style={{
              width: '100%',
              maxWidth: '540px',
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-lg)',
              maxHeight: 'calc(100dvh - 40px)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Modal Image Header */}
            <div style={{ position: 'relative', height: '240px', backgroundColor: '#E2E8F0' }}>
              <img
                src={selectedDishForModal.imageUrl || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80'}
                alt={selectedDishForModal.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <button
                onClick={() => setSelectedDishForModal(null)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  color: '#FFF',
                  border: 'none',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  fontSize: '1.4rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                &times;
              </button>
              {selectedDishForModal.badge && (
                <span
                  style={{
                    position: 'absolute',
                    top: '16px',
                    left: '16px',
                    backgroundColor: 'var(--color-marigold-zest)',
                    color: 'var(--color-deep-forest)',
                    padding: '4px 14px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.85rem',
                    fontWeight: 800,
                  }}
                >
                  {selectedDishForModal.badge}
                </span>
              )}
            </div>

            {/* Modal Body Info */}
            <div style={{ padding: '24px', flexGrow: 1, overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className="badge badge-forest">{selectedDishForModal.category}</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                  ⏱️ Время готовки: ~{selectedDishForModal.estimatedCookingTimeMinutes || 15} мин
                </span>
              </div>

              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '12px' }}>
                {selectedDishForModal.title}
              </h2>

              <div style={{ backgroundColor: 'var(--color-surface-subtle)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-deep-forest)' }}>
                  📖 Подробное описание и состав блюда:
                </h4>
                <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--color-text-primary)', lineHeight: 1.5 }}>
                  {selectedDishForModal.description}
                </p>
              </div>

              {/* Price & Add Action Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'block' }}>Цена за порцию</span>
                  <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.6rem', color: 'var(--color-deep-forest)' }}>
                    {selectedDishForModal.price} EGP
                  </span>
                </div>

                <button
                  className="btn-primary"
                  style={{ padding: '12px 28px', fontSize: '1rem', backgroundColor: 'var(--color-warm-terracotta)' }}
                  onClick={() => {
                    addItem({
                      id: selectedDishForModal.id,
                      title: selectedDishForModal.title,
                      price: selectedDishForModal.price,
                      category: selectedDishForModal.category,
                    });
                    setSelectedDishForModal(null);
                  }}
                >
                  🛒 Добавить в корзину
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
