-- Migration 00001: ENUM Types for DAYMOHKCOFEE Platform
-- Target: Supabase PostgreSQL (public schema)

-- 1. Employee Roles
CREATE TYPE public.user_role AS ENUM (
  'ADMIN',
  'MANAGER',
  'COURIER',
  'RESOLUTION_OFFICER'
);

-- 2. Employee Lifecycle Statuses
CREATE TYPE public.employee_status AS ENUM (
  'ACTIVE',
  'DISABLED',
  'ARCHIVED'
);

-- 3. Internal Order Statuses (CRM Workflow)
CREATE TYPE public.order_status AS ENUM (
  'NEW',
  'ACCEPTED',
  'SENT_TO_KITCHEN',
  'COOKING',
  'READY_FOR_DELIVERY',
  'COURIER_ASSIGNED',
  'IN_TRANSIT',
  'COURIER_ARRIVED',
  'DELIVERED',
  'CLOSED',
  'PROBLEM',
  'CANCELLED',
  'SOLD_WITH_DISCOUNT'
);

-- 4. Order Draft Statuses
CREATE TYPE public.order_draft_status AS ENUM (
  'DRAFT',
  'AWAITING_VERIFICATION',
  'CHANNEL_VERIFIED',
  'UNCONFIRMED_ATTEMPT',
  'ARCHIVED'
);

-- 5. Payment Methods
CREATE TYPE public.payment_method AS ENUM (
  'CASH_ON_DELIVERY',
  'MANUAL_PAYMENT_LINK'
);

-- 6. Payment Statuses
CREATE TYPE public.payment_status AS ENUM (
  'UNCONFIRMED',
  'CONFIRMED'
);

-- 7. Delivery Assignment Statuses
CREATE TYPE public.delivery_assignment_status AS ENUM (
  'ASSIGNED',
  'IN_TRANSIT',
  'ARRIVED',
  'COMPLETED',
  'CANCELLED'
);

-- 8. Kitchen Ticket Statuses
CREATE TYPE public.kitchen_ticket_status AS ENUM (
  'PRINTED',
  'READY'
);

-- 9. Complaint Channels
CREATE TYPE public.complaint_channel AS ENUM (
  'WEBSITE_FORM',
  'TELEGRAM',
  'EMAIL',
  'PHONE'
);

-- 10. Complaint Categories
CREATE TYPE public.complaint_category AS ENUM (
  'DELIVERY',
  'FOOD_QUALITY',
  'SERVICE',
  'PAYMENT',
  'OTHER'
);

-- 11. Complaint Statuses
CREATE TYPE public.complaint_status AS ENUM (
  'NEW',
  'IN_REVIEW',
  'RESOLVED',
  'REJECTED'
);

-- 12. Risk Entity Types
CREATE TYPE public.risk_entity_type AS ENUM (
  'PHONE',
  'TELEGRAM',
  'EMAIL',
  'ADDRESS',
  'GEOLOCATION'
);

-- 13. Risk Levels
CREATE TYPE public.risk_level AS ENUM (
  'YELLOW',
  'RED'
);

-- 14. Chat Message Sender Types
CREATE TYPE public.chat_sender_type AS ENUM (
  'CLIENT',
  'MANAGER',
  'SYSTEM'
);

-- 15. Resolution Case Types
CREATE TYPE public.resolution_case_type AS ENUM (
  'UNCONFIRMED_ORDER',
  'CUSTOMER_UNAVAILABLE',
  'RETURNED_ORDER',
  'CUSTOMER_COMPLAINT',
  'DELIVERY_PROBLEM',
  'PAYMENT_PROBLEM',
  'OTHER'
);

-- 16. Resolution Case Statuses
CREATE TYPE public.resolution_case_status AS ENUM (
  'NEW',
  'IN_PROGRESS',
  'AWAITING_CLIENT',
  'RESOLVED',
  'CANCELLED',
  'CLOSED'
);
