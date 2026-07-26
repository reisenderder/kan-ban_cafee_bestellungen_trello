# Work Plan: MVP-поток заказа

> **Статус**: Завершён — все группы успешно реализованы кодом и проверены
> **Дата создания**: 2026-07-22
> **Дата обновления**: 2026-07-26
> **Версия**: 1.0
> **Источник**: `../../specs/01_global_spec/Global_Spec.md`, `../../specs/02_functional_map/Functional_Map.md`, `../../specs/03_feature_specs/`, `../../specs/04_technical_specs/`, `../../specs/05_visual_rules_skills/UI_UX_Design_System.md`, `../../specs/06_user_stories/User_Stories_MVP_Order_Flow.md`
> **Технические решения перед кодом**: `../../specs/04_technical_specs/Technical_MVP_Implementation_Decisions.md`
> **Дизайн-система и UI/UX**: `../../specs/05_visual_rules_skills/UI_UX_Design_System.md`
> **Readiness gate**: `Work_Plan_Code_Readiness.md`

---

## 1. Назначение

Этот документ фиксирует порядок реализации и проверки сквозного MVP-потока заказа DAYMOHKCOFEE:

`витрина -> корзина -> подтверждение клиента -> заказ в CRM -> кухня -> курьер -> доставка -> оплата -> закрытие`

Все 6 функциональных групп разработки MVP успешно реализованы, скомпилированы и проверены на ветках от `main`.

---

## 2. Цель MVP (Достигнута)

Минимальный рабочий контур полностью реализован:

1. клиент выбирает доступные блюда и собирает корзину (`CartContext.tsx`);
2. обязательные данные доставки (имя, телефон, адрес в Каире, ориентир, канал подтверждения);
3. подтверждение верификационного OTP-кода по стандарту SHA-256 (`OtpVerificationModal.tsx`);
4. операционный канбан-контур CRM менеджера в стиле Sunsama (`app/manager/crm/page.tsx`);
5. генерация и печать бумажного кухонного чека (`KitchenTicketPrint.tsx`);
6. назначенная доставка в мобильном экране курьера (`app/courier/dashboard/page.tsx`);
7. одноразовый QR-токен доставки SHA-256 и регламентированный fallback-сценарий (`DeliveryConfirmationModal.tsx`);
8. отдел урегулирования кейсов и жёлтый/красный списки риска (`app/resolution/cases/page.tsx`);
9. повторная продажа возвращённого товара со скидкой (`DiscountResaleModal.tsx`);
10. панель администратора, жизненный цикл сотрудников `ACTIVE` -> `DISABLED` -> `ARCHIVED` и официальная форма претензий (`app/admin/dashboard/page.tsx`, `ComplaintFormModal.tsx`).

---

## 3. Фактически реализованные группы

| № | Группа | Ветка | Статус |
|---|--------|-------|--------|
| 1 | Публичная витрина и корзина | `feat/public-showcase-cart` | Завершена (PR #40) |
| 2 | Верификация OTP и адаптеры | `feat/client-verification-otp` | Завершена (PR #41) |
| 3 | CRM Менеджера и Печать кухонного чека | `feat/manager-crm-workflow` | Завершена (PR #42) |
| 4 | Экран курьера, QR и Fallback | `feat/courier-delivery-confirmation` | Завершена (PR #43) |
| 5 | Отдел урегулирования, риски и Скидочная продажа | `feat/resolution-risk-management` | Завершена (PR #44) |
| 6 | Панель Администратора, Сотрудники и Жалобы | `feat/admin-menu-complaints` | Завершена (PR #45) |

---

## 4. Регламент и завершение

Данный план объявляется полностью завершённым и перемещается в директорию `completed/`. Дальнейшее развитие функционала и администрирование ведутся в рамках последующих специализированных планов (`Work_Plan_Admin_Access_Menu.md` и др.).
