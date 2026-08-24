'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { fetchAvailableDishes, Dish, defaultDishes } from '../lib/menu/dishes';

export default function HomePage() {
  const { items, addItem, updateQuantity } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<string>('Все');
  const [dishes, setDishes] = useState<Dish[]>(defaultDishes.filter((d) => d.isAvailable));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch Available Dishes from Supabase DB on mount
  useEffect(() => {
    async function loadDishes() {
      setIsLoading(true);
      const data = await fetchAvailableDishes();
      setDishes(data);
      setIsLoading(false);
    }
    loadDishes();
  }, []);

  const sampleCategories = ['Все', 'Категория 1', 'Категория 2', 'Категория 3', 'Категория 4'];

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
            Интерактивный каркас витрины и корзины заказа. Данные блюд автоматически синхронизируются с базой данных Supabase.
          </p>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <a href="#menu" className="btn-primary" style={{ padding: '14px 32px', fontSize: '1rem' }}>
              Перейти к витрине
            </a>
          </div>
        </div>
      </section>

      {/* Menu Categories */}
      <section id="menu" style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>Публичная витрина</h2>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              Фильтрация по категориям | Доступность блюд контролируется в панеле Администратора
            </p>
          </div>
        </div>

        {/* Dynamic Category Filter */}
        <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '32px' }}>
          {sampleCategories.map((cat) => {
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
            ⏳ Загрузка витрины из базы данных Supabase...
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '24px'
          }}>
            {filteredDishes.map((dish) => {
              const cartItem = items.find((i) => i.id === dish.id);
              const quantityInCart = cartItem ? cartItem.quantity : 0;

              return (
                <div key={dish.id} className="card-menu">
                  <div>
                    {dish.badge && (
                      <span className="badge badge-marigold" style={{ marginBottom: '12px' }}>
                        {dish.badge}
                      </span>
                    )}
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>{dish.title}</h3>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '16px', minHeight: '60px' }}>
                      {dish.description}
                    </p>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
                    <span style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1.25rem', color: 'var(--color-deep-forest)' }}>
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
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
