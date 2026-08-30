-- Единая схема и таблицы для СУБД Supabase cafe DAYMOHKCOFEE

-- 1. Создание типов данных (Enum)
CREATE TYPE public.user_role AS ENUM ('ADMIN', 'MANAGER', 'COURIER', 'RESOLUTION_OFFICER');
CREATE TYPE public.order_status AS ENUM ('NEW', 'ACCEPTED', 'COOKING', 'READY_FOR_DELIVERY', 'IN_TRANSIT', 'DELIVERED', 'CLOSED', 'PROBLEM', 'CANCELLED');

-- 2. Таблица блюд меню (Dishes)
CREATE TABLE IF NOT EXISTS public.dishes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  category TEXT NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  estimated_cooking_time_minutes INT DEFAULT 15,
  badge TEXT,
  -- Фото блюда: сжатый Canvas-JPEG в виде data URL (см. lib/menu/dishes.ts).
  -- Без этой колонки публикация блюда с фотографией отклоняется целиком.
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Заполнение начальными блюдами кафе DAYMOHKCOFEE
INSERT INTO public.dishes (title, description, price, category, is_available, estimated_cooking_time_minutes, badge)
VALUES
  ('Люля-кебаб', 'Традиционный кавказский люля-кебаб из парного мяса со специями и зеленью.', 150.00, 'Категория 1', true, 15, 'Популярное'),
  ('Шашлык из курицы', 'Сочные кусочки филе в фирменном маринаде на углях.', 200.00, 'Категория 1', true, 15, 'Шеф-выбор'),
  ('Лимонад', 'Освежающий домашний лимонад с цитрусом и мятой.', 180.00, 'Категория 2', true, 5, NULL),
  ('Суп Дня', 'Наваристый густой суп на мясном бульоне.', 250.00, 'Категория 2', false, 20, NULL),
  ('Салат', 'Свежие овощи с зеленью и оливковым маслом.', 120.00, 'Категория 3', true, 10, NULL),
  ('Хачапури по-аджарски', 'Горячее хачапури с сыром сулугуни и тягучим желтком.', 300.00, 'Категория 4', true, 18, NULL)
ON CONFLICT DO NOTHING;

-- 4. Таблица заказов (Orders)
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  address TEXT NOT NULL,
  status public.order_status NOT NULL DEFAULT 'NEW',
  total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  cooking_started_at TIMESTAMPTZ,
  cooking_completed_at TIMESTAMPTZ,
  target_cooking_time_minutes INT DEFAULT 15,
  delay_reason TEXT,
  -- Блок 2, пункт 7: SHA-256 хэш короткого кода доступа, выданного клиенту после
  -- OTP-подтверждения. Возврат к заказу с любого устройства — по паре
  -- «номер заказа + код» через RPC public.get_order_by_access.
  chat_access_code_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Блок 2, пункт 7: чтение заказа клиентом по паре «номер заказа + код доступа».
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE OR REPLACE FUNCTION public.get_order_by_access(p_order_number TEXT, p_code TEXT)
RETURNS TABLE (
  id UUID, order_number TEXT, status public.order_status,
  items JSONB, total_amount NUMERIC, created_at TIMESTAMPTZ
)
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT o.id, o.order_number, o.status, o.items, o.total_amount, o.created_at
  FROM public.orders o
  WHERE o.order_number = p_order_number
    AND o.chat_access_code_hash IS NOT NULL
    AND o.chat_access_code_hash = encode(digest(p_code, 'sha256'), 'hex')
  LIMIT 1;
$$;
GRANT EXECUTE ON FUNCTION public.get_order_by_access(TEXT, TEXT) TO anon, authenticated;

-- 5. Таблица переписки клиента и менеджера по заказу (Order Chat Messages)
CREATE TABLE IF NOT EXISTS public.order_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('CLIENT', 'MANAGER')),
  text TEXT NOT NULL,
  is_read_by_manager BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5.1 Supabase Realtime
-- В публикацию supabase_realtime включены: orders (00007), dishes (00010, Блок 2 п.3),
-- order_chat_messages (00008). Это даёт живое обновление между устройствами без F5.

-- 6. Профили сотрудников (Блок 2, группа D, миграция 00012)
CREATE TABLE IF NOT EXISTS public.employee_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('ADMIN', 'MANAGER', 'KITCHEN', 'COURIER', 'RESOLUTION_OFFICER')),
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Хелперы для политик (миграция 00012)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text LANGUAGE sql STABLE AS $$
  SELECT coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '');
$$;

CREATE OR REPLACE FUNCTION public.is_active_employee()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.employee_profiles WHERE id = auth.uid() AND status = 'ACTIVE');
$$;

-- 7. Row Level Security (Блок 2, группа D, миграции 00012 + 00013)
-- ВКЛЮЧЕНА со строгими политиками. Принцип default deny (Technical_Access_Audit.md §17).
--
--   employee_profiles   — RLS вкл.: сотрудник читает свою строку, ADMIN — все;
--                         запись только service-role (панель / create-staff-users.mjs).
--   dishes              — RLS вкл.: SELECT всем (anon+authenticated); изменения только ADMIN.
--   orders              — RLS вкл.: INSERT анонимно (витрина после OTP);
--                         SELECT/UPDATE только MANAGER/ADMIN; клиент читает свой заказ
--                         через RPC get_order_by_access (SECURITY DEFINER — обходит RLS).
--   order_chat_messages — RLS вкл., НО SELECT/INSERT открыты anon (осознанный компромисс
--                         Блока 2: клиент не залогинен, только «номер+код»; Realtime
--                         сохраняется). UPDATE (отметка «прочитано») — только персонал.
--
-- ДОЛГ ПО БЕЗОПАСНОСТИ (после Блока 2): изоляция чата клиента по заказу —
-- сейчас переписка читаема анонимным ключом при известном order_id. Полная изоляция
-- «одна переписка — своя комната» вынесена в отдельную будущую задачу.
--
-- Точные политики — в supabase/migrations/00012_employee_profiles.sql и 00013_rls_policies.sql.
