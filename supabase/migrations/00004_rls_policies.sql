-- Migration 00004: RLS Policies for DAYMOHKCOFEE Platform
-- Target: Supabase PostgreSQL

-- Helper function to extract user role from JWT app_metadata
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql STABLE
AS $$
  SELECT coalesce(
    auth.jwt() -> 'app_metadata' ->> 'role',
    ''
  );
$$;

-- Helper function to check if employee status is ACTIVE
CREATE OR REPLACE FUNCTION public.is_active_employee()
RETURNS boolean
LANGUAGE sql STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM private.employee_profiles
    WHERE id = auth.uid()
      AND status = 'ACTIVE'
  );
$$;

-- ========================================================
-- MENU ITEMS POLICIES
-- ========================================================
-- Public (anon & authenticated) can view available menu items
CREATE POLICY menu_items_public_select ON public.menu_items
  FOR SELECT TO anon, authenticated
  USING (true);

-- Admin can manage menu items
CREATE POLICY menu_items_admin_all ON public.menu_items
  FOR ALL TO authenticated
  USING (
    public.get_current_user_role() = 'ADMIN'
    AND public.is_active_employee()
  );

-- Manager can toggle menu item availability
CREATE POLICY menu_items_manager_update ON public.menu_items
  FOR UPDATE TO authenticated
  USING (
    public.get_current_user_role() = 'MANAGER'
    AND public.is_active_employee()
  );

-- ========================================================
-- ORDERS POLICIES
-- ========================================================
-- Manager has full SELECT/UPDATE access to orders
CREATE POLICY orders_manager_select ON public.orders
  FOR SELECT TO authenticated
  USING (
    public.get_current_user_role() = 'MANAGER'
    AND public.is_active_employee()
  );

CREATE POLICY orders_manager_update ON public.orders
  FOR UPDATE TO authenticated
  USING (
    public.get_current_user_role() = 'MANAGER'
    AND public.is_active_employee()
  );

-- Admin has full access to orders
CREATE POLICY orders_admin_all ON public.orders
  FOR ALL TO authenticated
  USING (
    public.get_current_user_role() = 'ADMIN'
    AND public.is_active_employee()
  );

-- Courier can view orders assigned to them
CREATE POLICY orders_courier_select ON public.orders
  FOR SELECT TO authenticated
  USING (
    public.get_current_user_role() = 'COURIER'
    AND public.is_active_employee()
    AND courier_id = auth.uid()
  );

-- Resolution Officer can view orders involved in resolution cases
CREATE POLICY orders_resolution_officer_select ON public.orders
  FOR SELECT TO authenticated
  USING (
    public.get_current_user_role() = 'RESOLUTION_OFFICER'
    AND public.is_active_employee()
  );

-- ========================================================
-- DELIVERY ASSIGNMENTS POLICIES
-- ========================================================
CREATE POLICY delivery_assignments_courier_select ON public.delivery_assignments
  FOR SELECT TO authenticated
  USING (
    public.get_current_user_role() = 'COURIER'
    AND public.is_active_employee()
    AND courier_id = auth.uid()
  );

CREATE POLICY delivery_assignments_courier_update ON public.delivery_assignments
  FOR UPDATE TO authenticated
  USING (
    public.get_current_user_role() = 'COURIER'
    AND public.is_active_employee()
    AND courier_id = auth.uid()
  );

CREATE POLICY delivery_assignments_manager_all ON public.delivery_assignments
  FOR ALL TO authenticated
  USING (
    public.get_current_user_role() IN ('MANAGER', 'ADMIN')
    AND public.is_active_employee()
  );

-- ========================================================
-- KITCHEN TICKETS POLICIES
-- ========================================================
CREATE POLICY kitchen_tickets_manager_all ON public.kitchen_tickets
  FOR ALL TO authenticated
  USING (
    public.get_current_user_role() IN ('MANAGER', 'ADMIN')
    AND public.is_active_employee()
  );

-- ========================================================
-- CHAT MESSAGES POLICIES
-- ========================================================
CREATE POLICY chat_messages_manager_all ON public.chat_messages
  FOR ALL TO authenticated
  USING (
    public.get_current_user_role() IN ('MANAGER', 'ADMIN')
    AND public.is_active_employee()
  );

-- ========================================================
-- COMPLAINTS POLICIES
-- ========================================================
CREATE POLICY complaints_admin_all ON public.complaints
  FOR ALL TO authenticated
  USING (
    public.get_current_user_role() = 'ADMIN'
    AND public.is_active_employee()
  );
