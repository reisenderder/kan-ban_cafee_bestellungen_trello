'use client';

import React from 'react';

export interface KitchenTicketItem {
  name: string;
  quantity: number;
  modifiers?: string;
  customerComment?: string;
}

export interface KitchenTicketData {
  ticketNumber: number;
  orderNumber: string;
  printedAt: string;
  items: KitchenTicketItem[];
  kitchenNotes?: string;
}

interface KitchenTicketPrintProps {
  ticket: KitchenTicketData | null;
  onClose: () => void;
}

export function KitchenTicketPrint({ ticket, onClose }: KitchenTicketPrintProps) {
  if (!ticket) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 400,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        className="animate-fade-in"
        style={{
          backgroundColor: '#FFFFFF',
          color: '#000000',
          borderRadius: 'var(--radius-md)',
          padding: '24px',
          maxWidth: '360px',
          width: '100%',
          boxShadow: 'var(--shadow-lg)',
          fontFamily: 'monospace',
        }}
      >
        {/* Printable Ticket Template */}
        <div id="printable-kitchen-ticket" style={{ borderBottom: '2px dashed #000', paddingBottom: '16px', marginBottom: '16px' }}>
          <div style={{ textAlign: 'center', marginBottom: '12px' }}>
            <h2 style={{ fontSize: '1.4rem', color: '#000', margin: 0 }}>DAYMOHKCOFEE</h2>
            <p style={{ fontSize: '0.85rem', margin: '4px 0' }}>КУХОННЫЙ ЧЕК №{ticket.ticketNumber}</p>
            <p style={{ fontSize: '0.8rem', margin: 0 }}>Заказ: <strong>{ticket.orderNumber}</strong></p>
            <p style={{ fontSize: '0.75rem', color: '#555', margin: '4px 0' }}>{ticket.printedAt}</p>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', marginBottom: '12px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #000', textAlign: 'left' }}>
                <th style={{ padding: '4px 0' }}>Блюдо</th>
                <th style={{ padding: '4px 0', textAlign: 'right' }}>Кол-во</th>
              </tr>
            </thead>
            <tbody>
              {ticket.items.map((item, index) => (
                <tr key={index} style={{ borderBottom: '1px sm dashed #ccc' }}>
                  <td style={{ padding: '6px 0' }}>
                    <strong>{item.name}</strong>
                    {item.modifiers && <div style={{ fontSize: '0.75rem', color: '#444' }}>+ {item.modifiers}</div>}
                    {item.customerComment && <div style={{ fontSize: '0.75rem', fontStyle: 'italic', color: '#222' }}>Коммент: {item.customerComment}</div>}
                  </td>
                  <td style={{ padding: '6px 0', textAlign: 'right', fontWeight: 'bold', fontSize: '1.1rem' }}>
                    x{item.quantity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {ticket.kitchenNotes && (
            <div style={{ fontSize: '0.8rem', borderTop: '1px dashed #000', paddingTop: '8px' }}>
              <strong>Заметка для кухни:</strong> {ticket.kitchenNotes}
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handlePrint}
            className="btn-primary"
            style={{ flex: 2, padding: '10px' }}
          >
            🖨️ Печать чека
          </button>
          <button
            onClick={onClose}
            className="btn-secondary"
            style={{ flex: 1, padding: '10px' }}
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}
