# Матрица трассировки: Global Spec → User Stories

> **Статус**: Готово к проверке
> **Дата создания**: 2026-09-01
> **Дата обновления**: 2026-09-01
> **Версия**: 1.0
> **Источник**: `../01_global_spec/Global_Spec.md`, `../02_functional_map/Functional_Map.md`, `../03_feature_specs/`, `../04_technical_specs/`, `../06_user_stories/`
> **Работа**: эпик K плана `../../work_plans/completed/Work_Plan_User_Stories_Coverage_Alignment.md`

---

## 1. Назначение

Документ связывает воедино весь слой продуктовой документации: от фундаментальных принципов Global Spec через функциональные зоны Functional Map и Feature/Technical Specs до конкретных пользовательских историй.

Матрица отвечает на три вопроса:

1. каждый ли принцип Global Spec доведён до проверяемых User Stories (раздел 2);
2. у каждой ли User Story есть источник верхнего уровня (раздел 3);
3. закрыт ли раздел «User Stories должны проверить» каждого Feature Spec (раздел 4).

На 2026-09-01 в слое **72 пользовательские истории** в **8 рабочих документах** плюс матрица и два check report.

---

## 2. Матрица `принцип → зона → Feature Spec → Technical Spec → User Story`

| Принцип Global Spec (§5) | Функциональная зона (Functional Map) | Feature Spec | Technical Spec | User Stories |
| --- | --- | --- | --- | --- |
| 5.1 Простая веб-витрина | Публичная витрина, корзина, оформление | `Feature_Order_Entry`, `Feature_Menu_Management` | `Technical_Order_Data_Model` | `US-01`, `US-ORDER-01`, `US-ORDER-02`, `US-ORDER-03`, `US-MENU-03`, `US-MENU-04`, `US-MENU-07`, `US-MENU-08` |
| 5.2 Подтверждённая доступность клиента | OTP-верификация Telegram/Email, доверенный канал, неподтверждённая попытка | `Feature_Contact_Confirmation` | `Technical_Client_Verification`, `Technical_Order_Data_Model` | `US-02`, `US-VERIFY-01`, `US-VERIFY-02`, `US-RES-01` |
| 5.3 Управляемое меню | Меню, цены, доступность блюд, аналитика интереса | `Feature_Menu_Management`, `Feature_Admin_Control` | `Technical_Access_Audit`, `Technical_Order_Data_Model` | `US-MENU-01…10` |
| 5.4 Централизованная обработка заказов | CRM менеджера, статусы заказа, назначение курьера | `Feature_Order_CRM`, `Feature_Order_Statuses` | `Technical_Order_CRM_Workflow` | `US-03`, `US-04`, `US-05` |
| 5.5 Минимизация доступа к клиентским данным | Роли, права, маскирование, журнал раскрытия | `Feature_Admin_Control` | `Technical_Access_Audit` | `US-ADM-04`, `US-ADM-07`, `US-ADM-08`, `US-06` (курьер), `US-KDS-02` (кухня) |
| 5.6 Контекстное раскрытие данных для доставки | Кабинет курьера, доступ по назначенной доставке | `Feature_Courier_Delivery` | `Technical_Access_Audit`, `Technical_Payment_Delivery` | `US-06`, `US-07` |
| 5.7 Кухня с обязательным бумажным fallback | Кухонный чек и электронная кухня KDS | `Feature_Kitchen_Ticket` | `Technical_Order_CRM_Workflow` | `US-04` (бумага), `US-KDS-01…06` |
| 5.8 Контроль операционных отклонений | Доставка, QR, закрытие оплаты, недоступный клиент, возврат | `Feature_Courier_Delivery`, `Feature_Payment_Flow`, `Feature_Order_Statuses`, `Feature_Resolution_Department` | `Technical_Payment_Delivery`, `Technical_Order_CRM_Workflow` | `US-07`, `US-08`, `US-09`, `US-10` |
| 5.9 Ручная эскалация менеджером | Отдел урегулирования, операционный кейс | `Feature_Resolution_Department` | `Technical_Risk_Resolution` | `US-13`, `US-RES-01…05` |
| 5.10 Отдельный путь для жалоб клиента | Жалобы и доказательства | `Feature_Complaints`, `Feature_Admin_Control` | `Technical_Admin_Complaints` | `US-12`, `US-COMP-01…04`, `US-ADM-05`, `US-ADM-06` |
| 5.11 Учёт локальной коммуникационной этики | Маршрутизация урегулирования по формату обращения | `Feature_Resolution_Department`, `Feature_Order_Entry` | `Technical_Risk_Resolution` | `US-RES-05`, `US-ORDER-01` (сбор формата обращения) |
| 5.12 Гибкая доставка | Обычная и попутная доставка, маршрут | `Feature_Courier_Delivery`, `Feature_Route_Batching` | `Technical_Order_CRM_Workflow`, `Technical_Payment_Delivery` | `US-05` (назначение и маршрут), `US-06`, `US-07` |

### Сопутствующие зоны без прямой строки принципа

| Зона | Feature Spec | Technical Spec | User Stories |
| --- | --- | --- | --- |
| Клиентское отслеживание заказа | `Feature_Client_Tracking` | `Technical_Client_Page_Chat` | `US-ACCESS-01…04`, `US-02` (укрупнённые этапы) |
| Чат по заказу | `Feature_Client_Chat` | `Technical_Client_Page_Chat` | `US-ACCESS-02`, `US-ACCESS-04`, `US-08` (авто-сообщения), `US-03` (счётчик непрочитанных) |
| Оплата как отдельное состояние | `Feature_Payment_Flow` | `Technical_Payment_Delivery` | `US-03` (платёжная ссылка), `US-07`, `US-08`, `US-DISC-06` |
| Возврат заказа и повторная продажа со скидкой | `Feature_Returned_Order_Discount` | `Technical_Order_CRM_Workflow` | `US-10`, `US-11`, `US-DISC-01…08` |
| Жёлтый и красный риск | `Feature_Resolution_Department` | `Technical_Risk_Resolution`, `Technical_Access_Audit` | `US-RISK-01…05`, `US-10` (входное событие), `US-03` (предупреждение менеджеру) |
| Вход персонала, роли, сессии | `Feature_Admin_Control` | `Technical_Access_Audit` | `US-ADM-01`, `US-ADM-02`, `US-ADM-03`, `US-ADM-09A`, `US-ADM-09B`, `US-ADM-09C`, `US-ADM-10` |

**Вывод раздела 2.** Все двенадцать принципов §5 Global Spec доведены до проверяемых User Stories. Ни один принцип не остаётся без сценарного покрытия.

---

## 3. Обратная проверка: источник каждой User Story

| Документ | Истории | Верхний источник |
| --- | --- | --- |
| `User_Stories_MVP_Order_Flow.md` | `US-01…US-13` | Global Spec §5.1–5.12; Functional Map §6; Feature Specs витрины, подтверждения, CRM, кухни, доставки, оплаты, статусов, урегулирования, возврата, жалоб |
| `User_Stories_Order_And_Client_Access.md` | `US-ORDER-01…03`, `US-VERIFY-01…02`, `US-ACCESS-01…04` | Global Spec §5.1, §5.2; Functional Map §6.1, §6.3, §6.4; `Feature_Order_Entry`, `Feature_Contact_Confirmation`, `Feature_Client_Tracking`, `Feature_Client_Chat` |
| `User_Stories_Kitchen_KDS.md` | `US-KDS-01…06` | Global Spec §5.7; Functional Map §4 (строка кухни); `Feature_Kitchen_Ticket` |
| `User_Stories_Admin_Access_Menu.md` | `US-ADM-01…08`, `US-ADM-09A/B/C`, `US-ADM-10` | Global Spec §5.3, §5.5; Functional Map §5.6; `Feature_Admin_Control` |
| `User_Stories_Menu_Availability.md` | `US-MENU-01…10` | Global Spec §5.3; Functional Map §9.2; `Feature_Menu_Management` |
| `User_Stories_Discount_Admin.md` | `US-DISC-01…08` | Global Spec §5.8; Functional Map §9.7; `Feature_Returned_Order_Discount`, `Feature_Admin_Control` |
| `User_Stories_Resolution_And_Risk.md` | `US-RES-01…05`, `US-RISK-01…05` | Global Spec §5.9, §5.11; Functional Map §6.7, §9.6; `Feature_Resolution_Department` |
| `User_Stories_Complaints.md` | `US-COMP-01…04` | Global Spec §5.10; Functional Map §6.4; `Feature_Complaints`, `Feature_Admin_Control` |

**Вывод раздела 3.** У всех 72 историй есть источник верхнего уровня. Историй без основания в Feature/Functional/Global слое не найдено.

---

## 4. Статус разделов «User Stories должны проверить» в Feature Specs

Все 15 Feature Specs содержат раздел с требованиями к User Stories. Статус покрытия:

| Feature Spec | Покрывающие истории | Статус |
| --- | --- | --- |
| `Feature_Order_Entry` | `US-01`, `US-ORDER-01…03`, `US-MENU-08` | Покрыт |
| `Feature_Contact_Confirmation` | `US-02`, `US-VERIFY-01…02`, `US-RES-01` | Покрыт |
| `Feature_Order_CRM` | `US-03`, `US-04`, `US-05` | Покрыт |
| `Feature_Order_Statuses` | `US-03…US-08`, `US-10`, `US-11` | Покрыт |
| `Feature_Kitchen_Ticket` | `US-04`, `US-KDS-01…06` | Покрыт |
| `Feature_Courier_Delivery` | `US-05`, `US-06`, `US-07`, `US-09` | Покрыт |
| `Feature_Client_Tracking` | `US-02`, `US-ACCESS-01…04` | Покрыт |
| `Feature_Client_Chat` | `US-08`, `US-ACCESS-02`, `US-ACCESS-04`, `US-03` | Покрыт |
| `Feature_Payment_Flow` | `US-03`, `US-07`, `US-08`, `US-DISC-06` | Покрыт |
| `Feature_Resolution_Department` | `US-13`, `US-RES-01…05`, `US-RISK-01…05`, `US-09`, `US-10` | Покрыт |
| `Feature_Returned_Order_Discount` | `US-10`, `US-11`, `US-DISC-01…08` | Покрыт |
| `Feature_Route_Batching` | `US-05` (назначение и попутный маршрут) | Покрыт |
| `Feature_Complaints` | `US-12`, `US-COMP-01…04`, `US-ADM-05`, `US-ADM-06` | Покрыт |
| `Feature_Admin_Control` | `US-ADM-01…10`, `US-DISC-02…03`, `US-MENU-01…02` | Покрыт |
| `Feature_Menu_Management` | `US-MENU-01…10` | Покрыт |

**Вывод раздела 4.** Каждый утверждённый Feature Spec имеет сценарное покрытие User Stories.

---

## 5. Осознанные пересечения и границы

* `US-02`, `US-12`, `US-13` в `User_Stories_MVP_Order_Flow.md` — краткие сквозные истории; детальные сценарии вынесены в отдельные документы (`User_Stories_Order_And_Client_Access.md`, `User_Stories_Complaints.md`, `User_Stories_Resolution_And_Risk.md`). Дублирования нет: сквозная история хранит ключевые правила и ссылку, детальный документ — пошаговый сценарий.
* `US-04` (бумажная кухня) и `US-KDS-06` (fallback KDS) описывают один и тот же бумажный путь с разных сторон и не конфликтуют.
* `US-10` — решение о возврате заказа; риск-критерии из неё вынесены в `US-RISK-*`.
* `US-ADM-05`/`US-ADM-06` и `US-COMP-03`/`US-COMP-04` — административная сторона жалобы; краткие истории со ссылкой на детальный документ.

## 6. Открытые вопросы

Открытых вопросов уровня Global Spec, Functional Map или Feature Spec по итогам аудита не осталось.

Оставшиеся границы MVP явно классифицированы как post-MVP в `User_Stories_All_Check_Report.md` §7.
