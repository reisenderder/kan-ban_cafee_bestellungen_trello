'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { fetchAvailableDishes, Dish, defaultDishes, fetchCategories, subscribeToMenuUpdates, subscribeToDishesRealtime } from '../lib/menu/dishes';

export default function HomePage() {
  const { items, addItem, updateQuantity } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<string>('Все');
  const [dishes, setDishes] = useState<Dish[]>(defaultDishes.filter((d) => d.isAvailable));
  const [categories, setCategories] = useState<string[]>(['Все', ...fetchCategories()]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedDishForModal, setSelectedDishForModal] = useState<Dish | null>(null);

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
    <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
      {/* Hero Banner */}
      <section style={{
        background: 'linear-gradient(135deg, var(--color-deep-forest) 0%, #2A523D 100%)',
        borderRadius: 'var(--radius-lg)',
        padding: '60px 40px',
        color: 'var(--color-vanilla-cream)',
        marginBottom: '50px',
        boxShadow: 'var(--shadow-lg)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ maxWidth: '600px', position: 'relative', zIndex: 2 }}>
          <span className="badge badge-marigold" style={{ marginBottom: '16px' }}>Кавказское кафе в Каире</span>
          <h1 style={{ color: 'var(--color-vanilla-cream)', fontSize: '3rem', lineHeight: '1.15', marginBottom: '16px' }}>
            DAYMOHKCOFEE
          </h1>
          <p style={{ color: 'rgba(249, 245, 236, 0.85)', fontSize: '1.1rem', marginBottom: '28px' }}>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>Публичное Меню</h2>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              Кликните на любое блюдо для просмотра подробного состава ингредиентов | Живое обновление онлайн
            </p>
          </div>
        </div>

        {/* Dynamic Category Filter */}
        <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '32px' }}>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '10px 20px',
                  borderRadius: 'var(--radius-full)',
                  border: isSelected ? 'none' : '1px solid var(--color-border)',
                  backgroundColor: isSelected ? 'var(--color-deep-forest)' : 'var(--color-surface)',
                  color: isSelected ? 'var(--color-vanilla-cream)' : 'var(--color-text-primary)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'var(--transition-fast)'
                }}
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
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '24px'
          }}>
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
                    onClick={() => setSelectedDishForModal(dish)}
                    style={{ position: 'relative', height: '180px', cursor: 'pointer', backgroundColor: '#E2E8F0' }}
                  >
                    <img
                      src={dish.imageUrl || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80'}
                      alt={dish.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
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
                  <div style={{ padding: '20px', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div onClick={() => setSelectedDishForModal(dish)} style={{ cursor: 'pointer' }}>
                      <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', fontWeight: 800 }}>{dish.title}</h3>
                      <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', marginBottom: '16px', lineHeight: 1.4, minHeight: '50px' }}>
                        {dish.description}
                      </p>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '14px', borderTop: '1px solid var(--color-border)' }}>
                      <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.3rem', color: 'var(--color-deep-forest)' }}>
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

      {/* DETAILED DISH INSPECTION MODAL */}
      {selectedDishForModal && (
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
              maxHeight: '90vh',
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
        </div>
      )}
    </div>
  );
}
