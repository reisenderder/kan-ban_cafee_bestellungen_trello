-- Пункт 7 Блока 2: возврат клиента к заказу и чату с любого устройства.
-- Клиент получает короткий код доступа ПОСЛЕ OTP-подтверждения канала (при создании
-- заказа). В БД хранится только SHA-256 хэш кода. Возврат к заказу выполняется по паре
-- «номер заказа + код» через RPC-функцию get_order_by_access (SECURITY DEFINER), а не
-- открытым SELECT — эта форма работает и сейчас (RLS выключена), и после восстановления
-- строгих RLS-политик в группе D.
-- Требует ручного применения на Production Supabase (до публикации деплоя Vercel).

CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS chat_access_code_hash TEXT;

CREATE OR REPLACE FUNCTION public.get_order_by_access(p_order_number TEXT, p_code TEXT)
RETURNS TABLE (
  id UUID,
  order_number TEXT,
  status public.order_status,
  items JSONB,
  total_amount NUMERIC,
  created_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT o.id, o.order_number, o.status, o.items, o.total_amount, o.created_at
  FROM public.orders o
  WHERE o.order_number = p_order_number
    AND o.chat_access_code_hash IS NOT NULL
    AND o.chat_access_code_hash = encode(digest(p_code, 'sha256'), 'hex')
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_order_by_access(TEXT, TEXT) TO anon, authenticated;
