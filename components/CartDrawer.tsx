'use client';

import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { OtpVerificationModal } from './OtpVerificationModal';
import { ClientOrderChatModal } from './ClientOrderChatModal';
import { createOrderInSupabase, Order } from '../lib/orders/orders';

export function CartDrawer() {
  const {
    items,
    removeItem,
    updateQuantity,
    totalAmount,
    isCartOpen,
    setIsCartOpen,
    deliveryDetails,
    setDeliveryDetails,
    clearCart,
  } = useCart();

  const [step, setStep] = useState<'ITEMS' | 'DELIVERY'>('ITEMS');
  const [isOtpOpen, setIsOtpOpen] = useState(false);
  const [isClientChatOpen, setIsClientChatOpen] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  if (!isCartOpen) return null;

  const handleDeliveryChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDeliveryDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleChannelSelect = (channel: 'TELEGRAM' | 'EMAIL') => {
    setDeliveryDetails((prev) => ({
      ...prev,
      verificationChannel: channel,
      verificationTarget: channel === 'TELEGRAM' ? prev.verificationTarget || '' : prev.verificationTarget || '',
    }));
  };

  const handleStartVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliveryDetails.contactName || !deliveryDetails.address || !deliveryDetails.contactPhone) {
      alert('Пожалуйста, заполните имя, телефон и адрес доставки.');
      return;
    }

    if (!deliveryDetails.verificationTarget || !deliveryDetails.verificationTarget.trim()) {
      const channelName = deliveryDetails.verificationChannel === 'TELEGRAM' ? 'Telegram username / телефон' : 'Email';
      alert(`Пожалуйста, введите ваш ${channelName} для получения 6-значного OTP-кода!`);
      return;
    }

    setIsOtpOpen(true);
  };

  const handleOtpVerified = async () => {
    setIsOtpOpen(false);
    setIsCreatingOrder(true);

    const order = await createOrderInSupabase({
      customerName: deliveryDetails.contactName,
      customerPhone: deliveryDetails.contactPhone,
      address: deliveryDetails.address,
      items: items.map((item) => ({
        title: item.title,
        price: item.price,
        quantity: item.quantity,
      })),
      totalAmount,
    });

    setCreatedOrder(order);
    setIsCreatingOrder(false);
    setSubmitMessage(`Канал успешно верифицирован! 6-значный OTP код подтверждён. Заказ №${order.orderNumber} передан менеджеру DAYMOHKCOFEE.`);
    clearCart();
  };

  return (
    <>
      <div
        onClick={() => setIsCartOpen(false)}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          zIndex: 200,
          display: 'flex',
          justifyContent: 'flex-end',
          cursor: 'pointer',
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="animate-fade-in"
          style={{
            width: '100%',
            maxWidth: '480px',
            backgroundColor: 'var(--color-bg)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: 'var(--shadow-lg)',
            overflowY: 'auto',
            cursor: 'default',
          }}
        >
          {/* Drawer Header */}
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
            <h2 style={{ fontSize: '1.4rem' }}>
              {step === 'ITEMS' ? 'Корзина заказа' : 'Оформление и OTP-авторизация'}
            </h2>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {items.length > 0 && step === 'ITEMS' && (
                <button
                  onClick={() => {
                    if (confirm('Вы действительно хотите очистить всю корзину?')) {
                      clearCart();
                    }
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-error)',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                  title="Очистить все позиции из корзины"
                >
                  🗑️ Очистить
                </button>
              )}
              <button
                onClick={() => setIsCartOpen(false)}
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
          </div>

          {/* Drawer Content */}
          <div style={{ flex: 1, padding: '24px' }}>
            {isCreatingOrder ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-text-secondary)' }}>
                <p style={{ fontSize: '1rem' }}>Оформляем ваш заказ...</p>
              </div>
            ) : submitMessage ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(46, 125, 50, 0.15)',
                    color: 'var(--color-success)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem',
                    margin: '0 auto 20px auto',
                  }}
                >
                  ✓
                </div>
                <h3 style={{ marginBottom: '12px' }}>Заказ успешно верифицирован!</h3>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', marginBottom: '24px' }}>
                  {submitMessage}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <button
                    className="btn-primary"
                    style={{ padding: '14px', backgroundColor: 'var(--color-deep-forest)' }}
                    onClick={() => setIsClientChatOpen(true)}
                  >
                    💬 Написать менеджеру по заказу
                  </button>

                  <button
                    className="btn-secondary"
                    onClick={() => {
                      setSubmitMessage(null);
                      setIsCartOpen(false);
                      setStep('ITEMS');
                    }}
                  >
                    Закрыть
                  </button>
                </div>
              </div>
            ) : step === 'ITEMS' ? (
              <>
                {items.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-text-muted)' }}>
                    <p style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Корзина пока пуста</p>
                    <p style={{ fontSize: '0.9rem' }}>Добавьте блюда из меню</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {items.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          backgroundColor: 'var(--color-surface)',
                          borderRadius: 'var(--radius-md)',
                          padding: '16px',
                          border: '1px solid var(--color-border)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <h4 style={{ fontSize: '1.05rem', marginBottom: '4px' }}>{item.title}</h4>
                          <span style={{ color: 'var(--color-deep-forest)', fontWeight: 600 }}>
                            {item.price * item.quantity} EGP
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              border: '1px solid var(--color-border)',
                              borderRadius: 'var(--radius-sm)',
                              overflow: 'hidden',
                            }}
                          >
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              style={{
                                padding: '4px 10px',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                              }}
                            >
                              -
                            </button>
                            <span style={{ padding: '0 8px', fontWeight: 600, fontSize: '0.9rem' }}>
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              style={{
                                padding: '4px 10px',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                              }}
                            >
                              +
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--color-error)',
                              cursor: 'pointer',
                              fontSize: '1.2rem',
                            }}
                          >
                            &times;
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              /* DELIVERY STEP FORM WITH OTP CHANNEL SELECTOR */
              <form onSubmit={handleStartVerification} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: '6px' }}>
                    Имя получателя *
                  </label>
                  <input
                    type="text"
                    name="contactName"
                    value={deliveryDetails.contactName}
                    onChange={handleDeliveryChange}
                    required
                    placeholder="Ахмед / Фатима"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-border)',
                      fontSize: '0.95rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: '6px' }}>
                    Телефон доставки в Каире *
                  </label>
                  <input
                    type="tel"
                    name="contactPhone"
                    value={deliveryDetails.contactPhone}
                    onChange={handleDeliveryChange}
                    required
                    placeholder="+20 123 456 7890"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-border)',
                      fontSize: '0.95rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: '6px' }}>
                    Адрес доставки (Район, улица) *
                  </label>
                  <textarea
                    name="address"
                    value={deliveryDetails.address}
                    onChange={handleDeliveryChange}
                    required
                    rows={2}
                    placeholder="Каир, район Наср-Сити, улица 15, дом 4"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-border)',
                      fontSize: '0.95rem',
                    }}
                  />
                </div>

                {/* OTP CHANNEL SELECTION BOX */}
                <div
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderRadius: 'var(--radius-md)',
                    padding: '16px',
                    border: '1px solid var(--color-border)',
                    marginTop: '8px',
                  }}
                >
                  <label style={{ display: 'block', fontWeight: 800, fontSize: '0.95rem', marginBottom: '10px', color: 'var(--color-deep-forest)' }}>
                    🔒 Канал получения 6-значного OTP-кода *
                  </label>
                  
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
                    <button
                      type="button"
                      onClick={() => handleChannelSelect('TELEGRAM')}
                      style={{
                        flex: 1,
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-sm)',
                        border: deliveryDetails.verificationChannel === 'TELEGRAM' ? '2px solid var(--color-deep-forest)' : '1px solid var(--color-border)',
                        backgroundColor: deliveryDetails.verificationChannel === 'TELEGRAM' ? 'rgba(30, 58, 43, 0.1)' : 'var(--color-surface)',
                        color: 'var(--color-deep-forest)',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                    >
                      ✈️ В Telegram
                    </button>

                    <button
                      type="button"
                      onClick={() => handleChannelSelect('EMAIL')}
                      style={{
                        flex: 1,
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-sm)',
                        border: deliveryDetails.verificationChannel === 'EMAIL' ? '2px solid var(--color-deep-forest)' : '1px solid var(--color-border)',
                        backgroundColor: deliveryDetails.verificationChannel === 'EMAIL' ? 'rgba(30, 58, 43, 0.1)' : 'var(--color-surface)',
                        color: 'var(--color-deep-forest)',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                    >
                      📧 На Email
                    </button>
                  </div>

                  {deliveryDetails.verificationChannel === 'TELEGRAM' ? (
                    <div>
                      <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '4px' }}>
                        Укажите ваш @username в Telegram или номер телефона *
                      </label>
                      <input
                        type="text"
                        name="verificationTarget"
                        value={deliveryDetails.verificationTarget}
                        onChange={handleDeliveryChange}
                        required
                        placeholder="@username или +20123456789"
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--color-border)',
                          fontSize: '0.9rem',
                        }}
                      />
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block', marginTop: '4px' }}>
                        Сюда прийдет 6-значный одноразовый OTP-код для подтверждения заказа.
                      </span>
                    </div>
                  ) : (
                    <div>
                      <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '4px' }}>
                        Укажите ваш Email адрес *
                      </label>
                      <input
                        type="email"
                        name="verificationTarget"
                        value={deliveryDetails.verificationTarget}
                        onChange={handleDeliveryChange}
                        required
                        placeholder="yourname@example.com"
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--color-border)',
                          fontSize: '0.9rem',
                        }}
                      />
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block', marginTop: '4px' }}>
                        Сюда прийдет 6-значный одноразовый OTP-код для подтверждения заказа.
                      </span>
                    </div>
                  )}
                </div>

                <div
                  style={{
                    backgroundColor: 'var(--color-surface-subtle)',
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.85rem',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  💵 <strong>Способ оплаты:</strong> Наличными курьеру при получении (EGP).
                </div>
              </form>
            )}
          </div>

          {/* Drawer Footer */}
          {!submitMessage && items.length > 0 && (
            <div
              style={{
                padding: '20px 24px',
                borderTop: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px',
                }}
              >
                <span style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>Итого:</span>
                <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-deep-forest)' }}>
                  {totalAmount} EGP
                </span>
              </div>

              {step === 'ITEMS' ? (
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{
                      padding: '14px',
                      color: 'var(--color-error)',
                      borderColor: 'rgba(198, 40, 40, 0.3)',
                      fontWeight: 700,
                    }}
                    onClick={() => {
                      if (confirm('Вы действительно хотите очистить всю корзину?')) {
                        clearCart();
                      }
                    }}
                    title="Очистить все позиции из корзины"
                  >
                    🗑️ Очистить
                  </button>

                  <button
                    className="btn-primary"
                    style={{ flex: 1, padding: '14px' }}
                    onClick={() => setStep('DELIVERY')}
                  >
                    Перейти к оформлению
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ flex: 1, padding: '14px' }}
                    onClick={() => setStep('ITEMS')}
                  >
                    Назад
                  </button>
                  <button
                    type="button"
                    className="btn-primary"
                    style={{ flex: 2, padding: '14px', backgroundColor: 'var(--color-warm-terracotta)' }}
                    onClick={handleStartVerification}
                  >
                    Получить OTP-код 🔒
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <OtpVerificationModal
        isOpen={isOtpOpen}
        channel={deliveryDetails.verificationChannel}
        target={deliveryDetails.verificationTarget || deliveryDetails.contactPhone}
        onVerifySuccess={handleOtpVerified}
        onCancel={() => setIsOtpOpen(false)}
      />

      <ClientOrderChatModal
        isOpen={isClientChatOpen}
        orderNumber={createdOrder?.orderNumber || ''}
        onClose={() => setIsClientChatOpen(false)}
      />
    </>
  );
}
