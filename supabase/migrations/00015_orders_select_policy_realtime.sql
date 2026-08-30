-- Migration 00015: упрощение SELECT-политики orders под Supabase Realtime
-- Target: Supabase PostgreSQL. Требует ручного применения на Production Supabase.
--
-- Причина: после 00013 новые заказы не появлялись в CRM менеджера через Realtime
-- (только после F5), хотя сообщения чата доходили мгновенно. Realtime
-- (`postgres_changes`) проверяет RLS в упрощённом контексте и плохо работает с
-- политиками, которые дергают SECURITY DEFINER функцию с подзапросом в другую
-- таблицу (`is_active_employee()` читает `employee_profiles`).
--
-- Решение: SELECT по orders проверяем только по роли из JWT — простое выражение,
-- которое Realtime вычисляет корректно. Проверка `status = 'ACTIVE'` для доступа
-- к странице остаётся в `middleware.ts`; для мутаций (UPDATE) политика
-- `orders_staff_update` с `is_active_employee()` не меняется.

DROP POLICY IF EXISTS orders_staff_select ON public.orders;

CREATE POLICY orders_staff_select ON public.orders
  FOR SELECT TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('MANAGER', 'ADMIN'));
