-- Migration 00005: Indexes, Unique Constraints and Triggers
-- Target: Supabase PostgreSQL

-- ========================================================
-- INDEXES FOR FAST QUERY PERFORMANCE
-- ========================================================

-- Orders indexes
CREATE INDEX idx_orders_current_status ON public.orders(current_status);
CREATE INDEX idx_orders_order_number ON public.orders(order_number);
CREATE INDEX idx_orders_customer_contact ON public.orders(customer_contact_id);
CREATE INDEX idx_orders_manager ON public.orders(manager_id) WHERE manager_id IS NOT NULL;
CREATE INDEX idx_orders_courier ON public.orders(courier_id) WHERE courier_id IS NOT NULL;
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);

-- Order Items index
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id) WHERE order_id IS NOT NULL;
CREATE INDEX idx_order_items_draft_id ON public.order_items(draft_id) WHERE draft_id IS NOT NULL;

-- Customer Contacts normalized indexes
CREATE INDEX idx_customer_contacts_phone ON public.customer_contacts(normalized_phone_e164);
CREATE INDEX idx_customer_contacts_telegram ON public.customer_contacts(normalized_telegram_username) WHERE normalized_telegram_username IS NOT NULL;

-- Delivery Assignments index
CREATE INDEX idx_delivery_assignments_courier ON public.delivery_assignments(courier_id, status);

-- Client Order Access index
CREATE INDEX idx_client_order_access_hash ON public.client_order_access(device_token_hash);
CREATE INDEX idx_client_order_access_order ON public.client_order_access(order_id);

-- Chat Messages index
CREATE INDEX idx_chat_messages_order_created ON public.chat_messages(order_id, created_at ASC);

-- Private Audit Logs index
CREATE INDEX idx_audit_logs_event ON private.audit_logs(event_name);
CREATE INDEX idx_audit_logs_resource ON private.audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created ON private.audit_logs(created_at DESC);

-- Private Verification Requests index
CREATE INDEX idx_verification_requests_target ON private.verification_requests(target_address, is_verified);

-- Private Risk Records index
CREATE INDEX idx_risk_records_hash ON private.risk_records(entity_value_hash, risk_level);

-- ========================================================
-- APPEND-ONLY TRIGGER FOR AUDIT LOGS
-- ========================================================

CREATE OR REPLACE FUNCTION private.prevent_audit_log_modification()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'Audit Log entries are append-only and cannot be modified or deleted.';
END;
$$;

CREATE TRIGGER trg_audit_logs_append_only
  BEFORE UPDATE OR DELETE ON private.audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION private.prevent_audit_log_modification();
