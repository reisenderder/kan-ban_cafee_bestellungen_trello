-- Пункт 3 Блока 2: живое обновление витрины между устройствами.
-- Включаем Supabase Realtime для таблицы dishes, чтобы публикация / скрытие /
-- изменение цены и фото / жёсткое удаление блюда моментально отражались на
-- публичной витрине у всех открытых устройств без перезагрузки (F5).
-- Требует ручного применения на Production Supabase (до публикации деплоя Vercel).

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'dishes'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.dishes;
  END IF;
END $$;
