'use client';

import { useEffect } from 'react';

/**
 * Блокирует прокрутку страницы под модальным окном / drawer, пока он открыт.
 *
 * Без этого на iOS Safari фон скроллится «сквозь» фиксированный оверлей
 * (scroll-chaining), и панель начинает дрейфовать — особенно когда
 * открывается экранная клавиатура на шаге оформления заказа.
 *
 * Ширина полосы прокрутки компенсируется отступом справа, чтобы на
 * десктопе контент не дёргался в момент открытия.
 */
export function useBodyScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;

    const { overflow, paddingRight } = document.body.style;
    const scrollBarGap = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = 'hidden';
    if (scrollBarGap > 0) {
      document.body.style.paddingRight = `${scrollBarGap}px`;
    }

    return () => {
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
    };
  }, [active]);
}
