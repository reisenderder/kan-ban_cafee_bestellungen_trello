-- Migration 00002: Core Tables for DAYMOHKCOFEE Platform
-- Target: Supabase PostgreSQL (public & private schemas)

CREATE SCHEMA IF NOT EXISTS private;

-- ========================================================
-- PUBLIC SCHEMA TABLES
-- ========================================================

-- 1. Customer Contacts (Attached to individual order)
CREATE TABLE public.customer_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  normalized_phone_e164 TEXT NOT NULL,
  telegram TEXT,
  normalized_telegram_username TEXT,
  email TEXT,
  optional_message TEXT,
  optional_whatsapp TEXT,
  gender_or_contact_format TEXT,
  trusted_channel_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Delivery Info (Address, landmark, geolocation)
CREATE TABLE public.delivery_infos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  address TEXT NOT NULL,
  landmark TEXT,
  geo_location JSONB, -- { lat: number, lng: number }
  google_maps_link TEXT,
  delivery_notes TEXT,
  location_precision TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Payment Records (Method and status independent of order status)
CREATE TABLE public.payment_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID,
  payment_method public.payment_method NOT NULL DEFAULT 'CASH_ON_DELIVERY',
  payment_status public.payment_status NOT NULL DEFAULT 'UNCONFIRMED',
  amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
  confirmed_by UUID,
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Menu Items
CREATE TABLE public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_ru TEXT NOT NULL,
  title_ar TEXT,
  description_ru TEXT,
  category TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  is_available BOOLEAN NOT NULL DEFAULT true,
  image_url TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Orders (Working Order)
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  current_status public.order_status NOT NULL DEFAULT 'NEW',
  customer_contact_id UUID NOT NULL REFERENCES public.customer_contacts(id),
  delivery_info_id UUID NOT NULL REFERENCES public.delivery_infos(id),
  payment_record_id UUID REFERENCES public.payment_records(id),
  source TEXT NOT NULL DEFAULT 'WEBSITE',
  manager_id UUID,
  courier_id UUID,
  total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
  currency TEXT NOT NULL DEFAULT 'EGP',
  is_discount_order BOOLEAN NOT NULL DEFAULT false,
  source_returned_order_id UUID REFERENCES public.orders(id),
  risk_warning_level public.risk_level,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at TIMESTAMPTZ
);

-- Circular FK for payment_records -> order_id
ALTER TABLE public.payment_records
  ADD CONSTRAINT fk_payment_records_order
  FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;

-- 6. Order Drafts (Cart & Unconfirmed Attempts)
CREATE TABLE public.order_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status public.order_draft_status NOT NULL DEFAULT 'DRAFT',
  customer_contact_id UUID REFERENCES public.customer_contacts(id),
  delivery_info_id UUID REFERENCES public.delivery_infos(id),
  verification_request_id UUID,
  converted_order_id UUID REFERENCES public.orders(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Order Items (Snapshot of price & name)
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  draft_id UUID REFERENCES public.order_drafts(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES public.menu_items(id),
  name_snapshot TEXT NOT NULL,
  price_snapshot NUMERIC(10, 2) NOT NULL CHECK (price_snapshot >= 0),
  final_price NUMERIC(10, 2) NOT NULL CHECK (final_price >= 0),
  quantity INT NOT NULL CHECK (quantity > 0),
  modifiers JSONB,
  customer_comment TEXT,
  availability_status_at_submit BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT check_order_or_draft CHECK (
    (order_id IS NOT NULL AND draft_id IS NULL) OR
    (order_id IS NULL AND draft_id IS NOT NULL)
  )
);

-- 8. Delivery Assignments
CREATE TABLE public.delivery_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  courier_id UUID NOT NULL,
  status public.delivery_assignment_status NOT NULL DEFAULT 'ASSIGNED',
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  picked_up_at TIMESTAMPTZ,
  arrived_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancel_reason TEXT,
  confirmation_token_hash TEXT,
  confirmation_token_used BOOLEAN NOT NULL DEFAULT false,
  fallback_used BOOLEAN NOT NULL DEFAULT false,
  fallback_reason TEXT,
  route_group_id UUID
);

-- 9. Kitchen Tickets
CREATE TABLE public.kitchen_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  ticket_number SERIAL NOT NULL,
  printed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  printed_by UUID NOT NULL,
  status public.kitchen_ticket_status NOT NULL DEFAULT 'PRINTED',
  marked_ready_at TIMESTAMPTZ,
  marked_ready_by UUID
);

-- 10. Client Order Access (Device Local Storage Token Hash)
CREATE TABLE public.client_order_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  device_token_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  last_accessed_at TIMESTAMPTZ
);

-- 11. Chat Messages
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  sender_type public.chat_sender_type NOT NULL,
  sender_id UUID,
  message_text TEXT NOT NULL CHECK (char_length(message_text) <= 2000),
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. Complaints
CREATE TABLE public.complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_number SERIAL NOT NULL,
  order_id UUID REFERENCES public.orders(id),
  customer_contact_id UUID REFERENCES public.customer_contacts(id),
  contact_channel public.complaint_channel NOT NULL,
  category public.complaint_category NOT NULL,
  complaint_text TEXT NOT NULL,
  status public.complaint_status NOT NULL DEFAULT 'NEW',
  assigned_admin_id UUID,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
);

-- ========================================================
-- PRIVATE SCHEMA TABLES (Server-Only Access)
-- ========================================================

-- 13. Employee Profiles
CREATE TABLE private.employee_profiles (
  id UUID PRIMARY KEY, -- FK to auth.users.id
  full_name TEXT NOT NULL,
  role public.user_role NOT NULL,
  status public.employee_status NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 14. Verification Requests (OTP)
CREATE TABLE private.verification_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_draft_id UUID REFERENCES public.order_drafts(id),
  channel TEXT NOT NULL, -- TELEGRAM or EMAIL
  target_address TEXT NOT NULL,
  otp_code_hash TEXT NOT NULL,
  attempt_count INT NOT NULL DEFAULT 0,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMPTZ NOT NULL,
  unconfirmed_handled_at TIMESTAMPTZ,
  resolution_case_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 15. Trusted Channels (1-year trust)
CREATE TABLE private.trusted_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_type TEXT NOT NULL,
  normalized_identifier TEXT NOT NULL UNIQUE,
  verified_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '1 year')
);

-- 16. Audit Logs (Append-Only System Log)
CREATE TABLE private.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL,
  actor_id UUID,
  actor_role TEXT,
  ip_address TEXT,
  user_agent TEXT,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 17. Resolution Cases
CREATE TABLE private.resolution_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_number SERIAL NOT NULL,
  case_type public.resolution_case_type NOT NULL,
  status public.resolution_case_status NOT NULL DEFAULT 'NEW',
  order_id UUID REFERENCES public.orders(id),
  order_draft_id UUID REFERENCES public.order_drafts(id),
  assigned_officer_id UUID,
  contact_format_marker TEXT DEFAULT 'FORMAT_NOT_SPECIFIED',
  notes TEXT,
  resolution_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at TIMESTAMPTZ
);

-- 18. Risk Records (Yellow / Red lists)
CREATE TABLE private.risk_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type public.risk_entity_type NOT NULL,
  entity_value_hash TEXT NOT NULL,
  risk_level public.risk_level NOT NULL,
  incident_count INT NOT NULL DEFAULT 1,
  first_incident_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_incident_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ, -- null for RED
  resolution_case_id UUID REFERENCES private.resolution_cases(id),
  removed_at TIMESTAMPTZ,
  removed_by UUID,
  remove_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
