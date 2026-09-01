# Check Report: Все User Stories

> **Статус**: Проверено и актуализировано (эпик K)
> **Дата проверки**: 2026-09-01
> **Предыдущая проверка**: 2026-07-25 (Группа 2 плана `Work_Plan_Code_Readiness.md`)
> **Проверяемый раздел**: `specs/06_user_stories/`
> **Цель проверки**: сверить весь слой User Stories с Feature Specs, Technical Specs и правилами `specs/RULES.md` по итогам эпиков A–J плана `../../work_plans/completed/Work_Plan_User_Stories_Coverage_Alignment.md`.

---

## 1. Проверенные документы

Рабочие документы User Stories (8):

1. `User_Stories_MVP_Order_Flow.md` — 13 сквозных историй потока заказа (`US-01…US-13`).
2. `User_Stories_Order_And_Client_Access.md` — оформление заказа и доступ клиента (`US-ORDER-01…03`, `US-VERIFY-01…02`, `US-ACCESS-01…04`).
3. `User_Stories_Kitchen_KDS.md` — электронная кухня (`US-KDS-01…06`).
4. `User_Stories_Admin_Access_Menu.md` — администрирование, роли, сессии, жалобы, журналы (`US-ADM-01…10`).
5. `User_Stories_Menu_Availability.md` — меню, цены, доступность блюд (`US-MENU-01…10`).
6. `User_Stories_Discount_Admin.md` — скидочные товары и права (`US-DISC-01…08`).
7. `User_Stories_Resolution_And_Risk.md` — операционный кейс урегулирования и жизненный цикл риска (`US-RES-01…05`, `US-RISK-01…05`).
8. `User_Stories_Complaints.md` — путь жалобы клиента (`US-COMP-01…04`).

Сопутствующие документы раздела:

* `User_Stories_Traceability_Matrix.md` — матрица `Global принцип → зона → Feature → Technical → User Story`;
* `User_Stories_MVP_Order_Flow_Check_Report.md` — отчёт проверки MVP-потока;
* `README.md` — индекс раздела.

---

## 2. Структурная проверка

* всего рабочих документов User Stories: **8**;
* всего пользовательских историй: **72**;
* незакрытых `TODO`, `TBD`, `FIXME` и рабочих пометок в разделе не найдено;
* все рабочие документы указаны в `README.md`;
* документы не выбирают фреймворк, базу данных, API или инфраструктуру;
* документы написаны на русском языке.

Изменение с прошлой проверки: было 38 историй в 4 документах, стало 72 в 8. Рост дал вынос перегруженных `US-02` и `US-13` в отдельные эпики, добавление электронной кухни, ролей и сессий, доступа клиента, самостоятельного цикла риска и полного пути жалобы.

---

## 3. Покрытие Feature Specs

Слой User Stories покрывает все 15 утверждённых Feature Specs. Полная таблица `Feature Spec → покрывающие истории` — в `User_Stories_Traceability_Matrix.md` §4.

Распределение по документам:

* сквозной поток заказа, доставка, оплата, возврат — `User_Stories_MVP_Order_Flow.md`;
* оформление и доступ клиента — `User_Stories_Order_And_Client_Access.md`;
* электронная кухня — `User_Stories_Kitchen_KDS.md`;
* администрирование, роли, сессии — `User_Stories_Admin_Access_Menu.md`;
* меню и доступность — `User_Stories_Menu_Availability.md`;
* скидочные товары — `User_Stories_Discount_Admin.md`;
* урегулирование и риск — `User_Stories_Resolution_And_Risk.md`;
* жалобы — `User_Stories_Complaints.md`.

---

## 4. Покрытие Technical Specs

Слой User Stories учитывает ключевые технические решения из 9 Technical Specs на наблюдаемом уровне, без переписывания SQL:

* OTP действует 10 минут; повторная отправка не раньше 60 секунд; блокировка после 3 ошибок; защитная блокировка при превышении лимитов;
* доверенный Telegram/Email действует 1 год;
* финальная отправка заказа идемпотентна (`Technical_Order_Data_Model`);
* возврат клиента к заказу — по паре «номер заказа + код доступа», rate limiting, срок = сроку чата (`Technical_Client_Page_Chat`, `Technical_Order_Data_Model`);
* переход в `Закрыт` — только при подтверждённой доставке и подтверждённой оплате, в одной атомарной операции; повторное закрытие идемпотентно (`Technical_Order_CRM_Workflow`, `Technical_Payment_Delivery`);
* QR-токен доставки одноразовый, привязан к заказу, курьеру и назначению; fallback требует причину (`Technical_Payment_Delivery`);
* готовность через CRM и KDS — одна идемпотентная операция (`Technical_Order_CRM_Workflow`);
* маршрутизация урегулирования: два дежурных офицера; при неуказанном формате — очередь мужского направления с маркером «Формат не указан», без присвоения пола (`Technical_Risk_Resolution`);
* жёлтая запись — 4+ нормализованных категории без весов, срок 60 дней; красная — только после подтверждённого повторения, снимается только вручную (`Technical_Risk_Resolution`, `Technical_Access_Audit`);
* жалобы хранятся 1 год, soft delete без hard delete; enum категорий и статусов следуют Feature Spec (`Technical_Admin_Complaints`);
* Supabase Storage в MVP — только фото блюд меню; вложения по жалобам и возвратам — post-MVP (`Technical_MVP_Implementation_Decisions` §12 п. 11);
* экспорт клиентских данных и журналов на первом этапе запрещён.

---

## 5. Противоречия и дубли

Критических противоречий с Global Spec, Functional Map, Feature Specs и Technical Specs не найдено.

Устранено в ходе эпиков A–K:

* маршрутизация урегулирования «формат не указан» — старая формулировка «в мужское направление по умолчанию» приведена к Functional Map v1.7 (эпик F);
* обещание Supabase Storage для вложений по жалобам и возвратам без поддержки Feature Spec — снято, зафиксировано как post-MVP (эпик J);
* enum `complaint_category` / `complaint_status` в `Technical_Admin_Complaints` приведены к спискам `Feature_Complaints` §7/§14 (эпик K).

Осознанные пересечения (не дефект) перечислены в `User_Stories_Traceability_Matrix.md` §5.

---

## 6. Расхождения реализации с User Stories

Список расхождений текущего кода с утверждёнными User Stories и предложение следующего Work Plan исправлений — в `../../work_plans/active/Implementation_Alignment_Proposal.md`. Этот план не создан и не запущен; он требует отдельного подтверждения пользователя.

---

## 7. Оставшиеся границы MVP (post-MVP)

Явно вынесено за пределы текущего релиза; каждый пункт зафиксирован в верхнем документе:

1. **Вложения и фото-доказательства к жалобе и возврату** — `Feature_Complaints` §3.2/§18 п. 8, `Technical_MVP_Implementation_Decisions` §12 п. 11.
2. **Веса признаков риска** — только порог 4+ категорий, веса не применяются (`Feature_Resolution_Department` §18 п. 1, `Technical_Risk_Resolution` §8 п. 2).
3. **Автоматический выбор маршрута курьера** — маршрут остаётся ручным решением менеджера (`Feature_Courier_Delivery` §8, `Technical_MVP_Implementation_Decisions` §12 п. 9).
4. **Автоматическое управление складом** и **сложная аналитика** — `Technical_MVP_Implementation_Decisions` §12 пп. 6, 10.
5. **Полноценная платёжная интеграция** — платёжную ссылку менеджер отправляет и подтверждает вручную (`Feature_Payment_Flow`, `Technical_MVP_Implementation_Decisions` §12 п. 1).
6. **Экспорт клиентских данных и журналов** — запрещён на первом этапе (`Feature_Admin_Control`, `User_Stories_Admin_Access_Menu` закрытые решения).
7. **Самостоятельный сброс пароля персонала из приложения** и **управление сотрудниками из UI администратора** — post-Block-2 (`Feature_Admin_Control` §6; зафиксировано в `docs/CHANGELOG.md` группа D).
8. **Полная изоляция чата заказа по «комнате» (только клиент + менеджер)** — осознанный компромисс Block 2 (`Technical_Access_Audit` §18 п. 10).
9. **Отдельная мобильная версия статуса задержки кухни** — не нужна, задержки объясняются через чат (`User_Stories_MVP_Order_Flow` §4 п. 7).

Скрытых открытых вопросов не осталось.

---

## 8. Готовность слоя

Слой User Stories полон и внутренне непротиворечив по всем контурам MVP: витрина и оформление, OTP, доступ клиента, CRM, кухня (бумага + KDS), доставка и QR, оплата и закрытие, возврат и скидочная продажа, урегулирование и риск, жалобы, администрирование и роли, меню.

Следующий шаг — не расширение слоя, а сверка реализации с ним (см. §6).
