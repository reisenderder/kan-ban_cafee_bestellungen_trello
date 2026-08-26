-- Таблица переписки клиента и менеджера по заказу + включение Supabase Realtime,
-- чтобы сообщения доходили без перезагрузки страницы в обе стороны.

CREATE TABLE IF NOT EXISTS public.order_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('CLIENT', 'MANAGER')),
  text TEXT NOT NULL,
  is_read_by_manager BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_chat_messages_order_id ON public.order_chat_messages(order_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'order_chat_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.order_chat_messages;
  END IF;
END $$;
