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
  cooking_started_at TIMESTAMPTZ,
  cooking_completed_at TIMESTAMPTZ,
  target_cooking_time_minutes INT DEFAULT 15,
  delay_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
