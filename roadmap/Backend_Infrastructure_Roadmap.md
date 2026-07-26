# Roadmap: backend и инфраструктура

Этот журнал хранит хронологию завершенных работ, связанных с backend, Auth, API и RPC, инфраструктурой, окружениями, deployment, CI/CD, наблюдаемостью и эксплуатационными механизмами.

Правила ведения и формат записей описаны в `README.md`.

## Хронология

### 2026-07-26 — Базовая архитектура, Auth, Безопасность и CI/CD (Группы 1-6 Work_Plan_Code_Readiness)
* **Результат**: Зафиксированы архитектурные решения и инфраструктура MVP (`specs/04_technical_specs/ Technical_MVP_Implementation_Decisions.md`).
* **Ключевые элементы**:
  - Стек: Next.js App Router + Vercel + Supabase (PostgreSQL, Auth, RLS, Storage, Realtime).
  - Безопасность: Default-deny RLS, 4 роли сотрудников (`ADMIN`, `MANAGER`, `COURIER`, `RESOLUTION_OFFICER`), маскирование данных.
  - Интеграции: Telegram Bot API + Resend SMTP (Email), OTP ttl 10 мин, SHA-256 хэширование токенов.
  - CI/CD: 5 блокирующих CI-ворот (lint, typecheck, unit, rls, build), строго DB migrations ДО Vercel build.
  - Cron Jobs: `cleanup-expired-tokens` (ежечасно), `archive-chats` (ежедневно 01:00 UTC).
