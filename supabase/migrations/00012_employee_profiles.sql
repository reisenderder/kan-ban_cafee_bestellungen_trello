-- Migration 00012: employee_profiles + JWT-хелперы (Блок 2, группа D, пункт 8)
-- Target: Supabase PostgreSQL (боевая упрощённая схема — см. supabase/full_schema.sql).
--
-- Требует РУЧНОГО применения на Production Supabase ДО деплоя Vercel и ДО миграции
-- 00013. Порядок: 00010 → 00011 → 00012 → 00013.
--
-- В боевой схеме нет схемы `private` и таблиц из миграций 00001–00005, поэтому
-- профиль сотрудника и хелперы создаются в `public` и ссылаются на реальные таблицы.

-- ========================================================
-- Таблица профилей сотрудников
-- ========================================================
-- id = auth.users.id. Роль дублируется здесь и в app_metadata.role (JWT):
-- JWT — быстрый путь для политик и middleware, таблица — источник статуса ACTIVE
-- и будущего UI управления сотрудниками (отдельный блок, Feature_Admin_Control.md §6).
CREATE TABLE IF NOT EXISTS public.employee_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('ADMIN', 'MANAGER', 'KITCHEN', 'COURIER', 'RESOLUTION_OFFICER')),
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.employee_profiles TO authenticated;

-- ========================================================
-- Хелперы для RLS-политик (используются в 00013)
-- ========================================================
-- Роль текущего пользователя из app_metadata JWT ('' если нет сессии/роли).
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql STABLE
AS $$
  SELECT coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '');
$$;

-- Активен ли текущий сотрудник. SECURITY DEFINER — чтобы вызов из других политик
-- не упирался в RLS самой таблицы employee_profiles.
CREATE OR REPLACE FUNCTION public.is_active_employee()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.employee_profiles
    WHERE id = auth.uid()
      AND status = 'ACTIVE'
  );
$$;

-- ========================================================
-- RLS для самой employee_profiles
-- ========================================================
ALTER TABLE public.employee_profiles ENABLE ROW LEVEL SECURITY;

-- Сотрудник читает свою строку (нужно middleware.ts для проверки статуса).
CREATE POLICY employee_profiles_self_select ON public.employee_profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid());

-- Администратор видит все профили.
CREATE POLICY employee_profiles_admin_select ON public.employee_profiles
  FOR SELECT TO authenticated
  USING (public.get_current_user_role() = 'ADMIN');

-- INSERT / UPDATE / DELETE политик нет: профили заводит и меняет только
-- service-role ключ (панель Supabase или scripts/create-staff-users.mjs).
