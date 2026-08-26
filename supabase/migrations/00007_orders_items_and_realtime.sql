-- Добавление состава заказа и включение Supabase Realtime для таблицы orders,
-- чтобы новые заказы клиента моментально появлялись в CRM менеджера без перезагрузки.

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS items JSONB NOT NULL DEFAULT '[]'::jsonb;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  END IF;
END $$;
