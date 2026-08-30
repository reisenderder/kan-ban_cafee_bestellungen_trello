-- Migration 00014: создание заказа клиента через RPC (Блок 2 — фикс после RLS)
-- Target: Supabase PostgreSQL. Требует ручного применения на Production Supabase.
--
-- Причина: после включения RLS (00013) у анонимного ключа нет политики SELECT на
-- `orders` (и не должно быть — заказы читают только менеджер/админ). Прежний код
-- делал `INSERT ... RETURNING` (`.select()` в supabase-js), PostgREST не мог
-- вернуть строку и ОТКАТЫВАЛ всю вставку — заказ не долетал до базы.
--
-- Решение: витрина создаёт заказ строго через эту функцию (`SECURITY DEFINER`,
-- обходит RLS), функция возвращает настоящий UUID заказа. Прямая анонимная вставка
-- в `orders` больше не нужна — политика orders_anon_insert удаляется.

CREATE OR REPLACE FUNCTION public.create_client_order(
  p_order_number TEXT,
  p_customer_name TEXT,
  p_customer_phone TEXT,
  p_address TEXT,
  p_items JSONB,
  p_total_amount NUMERIC,
  p_chat_access_code_hash TEXT
)
RETURNS TABLE (id UUID, order_number TEXT, status public.order_status, created_at TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  INSERT INTO public.orders (
    order_number, customer_name, customer_phone, address,
    status, items, total_amount, chat_access_code_hash
  ) VALUES (
    p_order_number, p_customer_name, p_customer_phone, p_address,
    'NEW', coalesce(p_items, '[]'::jsonb), p_total_amount, p_chat_access_code_hash
  )
  RETURNING orders.id, orders.order_number, orders.status, orders.created_at;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_client_order(TEXT, TEXT, TEXT, TEXT, JSONB, NUMERIC, TEXT)
  TO anon, authenticated;

-- Прямая анонимная вставка больше не используется — заказ создаётся только через RPC выше.
DROP POLICY IF EXISTS orders_anon_insert ON public.orders;
