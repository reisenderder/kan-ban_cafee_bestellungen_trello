# Roadmap: данные

Этот журнал хранит хронологию завершенных работ, связанных с моделями данных, хранением, схемами, миграциями, API-контрактами данных, доступом к данным и журналированием.

Правила ведения и формат записей описаны в `README.md`.

## Хронология

### 2026-07-26 — Реализация моделей данных и токенов MVP (Work_Plan_MVP_Order_Flow)
* **Результат**: Реализовано хэширование токенов, одноразовые тонеры и структуры заказов.
* **Ключевые элементы**:
  - Токены OTP и QR: SHA-256 хэширование в `crypto.ts` и `qr-token.ts` с одноразовым гашением.
  - Повторная продажа со скидкой (`DiscountResaleModal.tsx`): создание отдельного связанного `Order` с `isDiscountOrder = true` и `sourceReturnedOrderId` без смешивания клиентских данных.
  - Урегулирование и риски: обработка кейсов с маркером `FORMAT_NOT_SPECIFIED`, 60-дневный порог жёлтого списка риска и ручное снятие красных ограничений.

### 2026-07-26 — Модель данных Supabase PostgreSQL (Группы 4-5 Work_Plan_Code_Readiness)
* **Результат**: Зафиксирована полная модель данных Supabase SQL (`specs/04_technical_specs/Technical_Order_Data_Model.md`).
* **Ключевые элементы**:
  - Последовательность миграций: `00001_enum_types.sql` -> `00002_core_tables.sql` -> `00003_enable_rls.sql` -> `00004_rls_policies.sql` -> `00005_indexes_and_triggers.sql`.
  - Сущности: Order, OrderItem, CustomerContact, DeliveryInfo, OrderStatusHistory, PaymentRecord, DeliveryAssignment, KitchenTicket, ClientOrderAccess, AuditLog, ResolutionCase, Complaint, RiskRecord.
  - Правило атомарности: BEGIN...COMMIT, SELECT FOR UPDATE, одноразовое гашение QR-токена.
