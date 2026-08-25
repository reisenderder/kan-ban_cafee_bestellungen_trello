'use client';

import React, { useState } from 'react';

interface ChatMessage {
  id: string;
  sender: 'CLIENT' | 'MANAGER';
  text: string;
  timestamp: string;
}

interface ClientOrderChatModalProps {
  isOpen: boolean;
  orderNumber: string;
  onClose: () => void;
}

const initialDemoMessages: ChatMessage[] = [
  {
    id: 'msg-1',
    sender: 'MANAGER',
    text: 'Здравствуйте! Заказ получен кафе DAYMOHKCOFEE и передается на кухню. Если у вас есть пожелания к заказу, напишите нам сюда.',
    timestamp: '11:30',
  },
];

export function ClientOrderChatModal({
  isOpen,
  orderNumber,
  onClose,
}: ClientOrderChatModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialDemoMessages);
  const [inputText, setInputText] = useState('');

  if (!isOpen) return null;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'CLIENT',
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');

    // Simulate auto manager reply after 2.5 seconds for demo
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-reply-${Date.now()}`,
          sender: 'MANAGER',
          text: 'Спасибо за сообщение! Менеджер ознакомился с вашим комментарием к заказу.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 2500);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        className="animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '440px',
          height: '520px',
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid var(--color-border)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            backgroundColor: 'var(--color-deep-forest)',
            color: 'var(--color-vanilla-cream)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <span style={{ fontSize: '0.8rem', opacity: 0.85, display: 'block' }}>Чат с менеджером</span>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Заказ #{orderNumber || 'ORD-2026-101'}</h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#FFF',
              fontSize: '1.5rem',
              cursor: 'pointer',
            }}
          >
            &times;
          </button>
        </div>

        {/* Message Log */}
        <div
          style={{
            flex: 1,
            padding: '16px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            backgroundColor: 'var(--color-bg)',
          }}
        >
          {messages.map((msg) => {
            const isClient = msg.sender === 'CLIENT';
            return (
              <div
                key={msg.id}
                style={{
                  alignSelf: isClient ? 'flex-end' : 'flex-start',
                  maxWidth: '82%',
                  backgroundColor: isClient ? 'var(--color-deep-forest)' : 'var(--color-surface)',
                  color: isClient ? 'var(--color-vanilla-cream)' : 'var(--color-text-primary)',
                  padding: '10px 14px',
                  borderRadius: '16px',
                  borderBottomRightRadius: isClient ? '4px' : '16px',
                  borderBottomLeftRadius: isClient ? '16px' : '4px',
                  border: isClient ? 'none' : '1px solid var(--color-border)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div style={{ fontSize: '0.9rem', lineHeight: 1.4 }}>{msg.text}</div>
                <div
                  style={{
                    fontSize: '0.7rem',
                    opacity: 0.7,
                    marginTop: '4px',
                    textAlign: 'right',
                  }}
                >
                  {msg.timestamp}
                </div>
              </div>
            );
          })}
        </div>

        {/* Input Footer */}
        <form
          onSubmit={handleSendMessage}
          style={{
            padding: '12px 16px',
            backgroundColor: 'var(--color-surface)',
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            gap: '8px',
          }}
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Напишите уточнение по заказу..."
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--color-border)',
              fontSize: '0.9rem',
            }}
          />
          <button
            type="submit"
            className="btn-primary"
            style={{
              borderRadius: 'var(--radius-full)',
              padding: '10px 18px',
              backgroundColor: 'var(--color-warm-terracotta)',
              fontSize: '0.9rem',
              fontWeight: 700,
            }}
          >
            Отправить
          </button>
        </form>
      </div>
    </div>
  );
}
