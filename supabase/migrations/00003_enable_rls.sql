-- Migration 00003: Enable Row Level Security (RLS)
-- Target: Supabase PostgreSQL (Default Deny Model)

-- 1. Public Schema Tables RLS Enable
ALTER TABLE public.customer_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_infos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kitchen_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_order_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

-- 2. Private Schema Tables RLS Enable
ALTER TABLE private.employee_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.trusted_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.resolution_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.risk_records ENABLE ROW LEVEL SECURITY;

-- Deny all direct access to private schema for anon and authenticated by default
REVOKE ALL ON ALL TABLES IN SCHEMA private FROM anon, authenticated;
