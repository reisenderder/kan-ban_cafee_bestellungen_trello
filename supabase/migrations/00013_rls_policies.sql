-- Migration 00013: восстановление RLS на боевых таблицах (Блок 2, группа D, пункт 8)
-- Target: Supabase PostgreSQL. Порядок применения: 00010 → 00011 → 00012 → 00013.
-- Требует РУЧНОГО применения на Production Supabase ДО деплоя Vercel.
--
-- Принцип: default deny (Technical_Access_Audit.md §17, §18 п.10).
--   dishes               — меню читают все; изменяет только ADMIN.
--   orders               — витрина только создаёт; читают/меняют MANAGER и ADMIN.
--                          Клиент возвращается к заказу через RPC get_order_by_access
--                          (SECURITY DEFINER, обходит RLS) — не открытым SELECT.
--   order_chat_messages   — ОСОЗНАННЫЙ КОМПРОМИСС Блока 2 (решение заказчика):
--                          чат клиента по заказу пока НЕ закрывается, потому что клиент
--                          не залогинен (только «номер заказа + код»). SELECT/INSERT
--                          открыты для anon, чтобы сохранить живой Realtime. Полная
--                          изоляция «одна переписка — своя комната» вынесена в отдельную
--                          будущую задачу и записана долгом в docs/CHANGELOG.md.

-- ========================================================
-- DISHES
-- ========================================================
ALTER TABLE public.dishes ENABLE ROW LEVEL SECURITY;

CREATE POLICY dishes_public_select ON public.dishes
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY dishes_admin_all ON public.dishes
  FOR ALL TO authenticated
  USING (public.get_current_user_role() = 'ADMIN' AND public.is_active_employee())
  WITH CHECK (public.get_current_user_role() = 'ADMIN' AND public.is_active_employee());

-- ========================================================
-- ORDERS
-- ========================================================
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Витрина создаёт заказ анонимным ключом (после OTP на стороне приложения).
CREATE POLICY orders_anon_insert ON public.orders
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY orders_staff_select ON public.orders
  FOR SELECT TO authenticated
  USING (public.get_current_user_role() IN ('MANAGER', 'ADMIN') AND public.is_active_employee());

CREATE POLICY orders_staff_update ON public.orders
  FOR UPDATE TO authenticated
  USING (public.get_current_user_role() IN ('MANAGER', 'ADMIN') AND public.is_active_employee())
  WITH CHECK (public.get_current_user_role() IN ('MANAGER', 'ADMIN') AND public.is_active_employee());

-- ========================================================
-- ORDER_CHAT_MESSAGES  (компромисс — см. шапку файла)
-- ========================================================
ALTER TABLE public.order_chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY order_chat_public_select ON public.order_chat_messages
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY order_chat_public_insert ON public.order_chat_messages
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Отметку «прочитано менеджером» ставит только персонал.
CREATE POLICY order_chat_staff_update ON public.order_chat_messages
  FOR UPDATE TO authenticated
  USING (public.get_current_user_role() IN ('MANAGER', 'ADMIN') AND public.is_active_employee())
  WITH CHECK (public.get_current_user_role() IN ('MANAGER', 'ADMIN') AND public.is_active_employee());
