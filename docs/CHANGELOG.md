# 📜 Журнал Изменений и Модернизаций (CHANGELOG)
## Платформа Доставки & Управления Кафе DAYMOHKCOFEE

Данный файл фиксирует всю историю правок, доработок, дизайнерских изменений и бизнес-пожеланий заказчика/клиента для обеспечения 100% прозрачности разработки.

---

## 🏷️ Категории изменений

* 🎨 **[DESIGN]** — Дизайн, цвета, шрифты, верстка, отступы, карточки элементов.
* ⚙️ **[FEATURE]** — Бизнес-логика, новые функции, поведение форм и кнопок.
* 🍳 **[KITCHEN/CRM]** — Операционный контур (экран повара, CRM менеджера).
* 🛡️ **[SECURITY]** — Вход персонала, роли, сессии, авторизация.
* 🗄️ **[DATABASE]** — Таблицы Supabase, типы данных, API.

---

## 🚀 История версий

### 📌 Версия v1.0.0 — Боевой запуск Блока 1 (25.08.2026)
* **Статус**: Опубликовано на Vercel + Supabase DB.
* **Описание release**: Запуск базового боевого ядра приема заказов.

#### ⚙️ [FEATURE] & 🎨 [DESIGN]
* Создана главная страница Витрины ([`app/page.tsx`](file:///C:/Users/Bergmann/Desktop/angular/%D0%BF%D1%80%D0%BE%D0%B5%D0%BA%D1%82%D1%8B/kan-ban_cafee_bestellungen_trello/app/page.tsx)) с диначеской загрузкой блюд из Supabase.
* Добавлена выдвижная корзина заказа с анимацией и стилями бренда.
* Добавлено 6-значное верификационное модальное окно OTP.

#### 🍳 [KITCHEN/CRM]
* Создан электронный экран повара ([`app/kitchen/dashboard/page.tsx`](file:///C:/Users/Bergmann/Desktop/angular/%D0%BF%D1%80%D0%BE%D0%B5%D0%BA%D1%82%D1%8B/kan-ban_cafee_bestellungen_trello/app/kitchen/dashboard/page.tsx)) с тикающим таймером и цветом готовности.
* Создана CRM Менеджера ([`app/manager/crm/page.tsx`](file:///C:/Users/Bergmann/Desktop/angular/%D0%BF%D1%80%D0%BE%D0%B5%D0%BA%D1%82%D1%8B/kan-ban_cafee_bestellungen_trello/app/manager/crm/page.tsx)) с кнопкой универсального копирования деталей для курьеров и модальным чатом.

#### 🛡️ [SECURITY]
* Создан служебный экран авторизации персонала ([`app/login/page.tsx`](file:///C:/Users/Bergmann/Desktop/angular/%D0%BF%D1%80%D0%BE%D0%B5%D0%BA%D1%82%D1%8B/kan-ban_cafee_bestellungen_trello/app/login/page.tsx)) с ролью Админа и Менеджера.

---

### 📌 Версия v1.0.1 — Исправление плавающей плашки корзины (25.08.2026)
* **Источник**: Фидбек по результатам тестового показа

#### 🎨 [DESIGN] & ⚙️ [FEATURE]
* **Исправление плавающей панели корзины**: В компоненте [`components/Navbar.tsx`](file:///C:/Users/Bergmann/Desktop/angular/%D0%BF%D1%80%D0%BE%D0%B5%D0%BA%D1%82%D1%8B/kan-ban_cafee_bestellungen_trello/components/Navbar.tsx) добавлено автоматическое скрытие всплывающей нижней плашки *«Посмотреть корзину»* в момент открытия шторки корзины (`isCartOpen === true`), чтобы плашка не перекрывала кнопку *«Оформить заказ»*.
* **Создание слотов блюд в Панели Админа**: В [`app/admin/dashboard/page.tsx`](file:///C:/Users/Bergmann/Desktop/angular/%D0%BF%D1%80%D0%BE%D0%B5%D0%BA%D1%82%D1%8B/kan-ban_cafee_bestellungen_trello/app/admin/dashboard/page.tsx) добавлена форма `➕ Добавить новое блюдо` (создание новых слотов с указанием названия, категории, цены в EGP, подробного описания состава, ссылки на фото и времени готовки).
* **Фото блюд и модальное окно подробного ознакомления**: В [`app/page.tsx`](file:///C:/Users/Bergmann/Desktop/angular/%D0%BF%D1%80%D0%BE%D0%B5%D0%BA%D1%82%D1%8B/kan-ban_cafee_bestellungen_trello/app/page.tsx) добавлены превью-фотографии блюд и полноразмерное модальное окно подробного ознакомления со специями, составом ингредиентов и кнопкой «В корзину».
* **Возврат заказов из отдела урегулирования в CRM**: В [`app/manager/crm/page.tsx`](file:///C:/Users/Bergmann/Desktop/angular/%D0%BF%D1%80%D0%BE%D0%B5%D0%BA%D1%82%D1%8B/kan-ban_cafee_bestellungen_trello/app/manager/crm/page.tsx) для заказов в проблемной колонке добавлена кнопка `↩️ Вернуть заказ в работу`, позволяющая менеджеру мгновенно выводить спорный заказ обратно в статус «Приняты в работу».
* **Канал получения OTP-кода (Telegram / Email)**: В компоненте [`components/CartDrawer.tsx`](file:///C:/Users/Bergmann/Desktop/angular/%D0%BF%D1%80%D0%BE%D0%B5%D0%BA%D1%82%D1%8B/kan-ban_cafee_bestellungen_trello/components/CartDrawer.tsx) внедрен явный переключатель каналов OTP-кода (вкладки Telegram и Email) с отдельными полями ввода `@username` в Telegram или Email-адреса.
* **Двусторонний чат заказа и счётчик непрочитанных у менеджера**: Создан модальный клиентский чат [`components/ClientOrderChatModal.tsx`](file:///C:/Users/Bergmann/Desktop/angular/%D0%BF%D1%80%D0%BE%D0%B5%D0%BA%D1%82%D1%8B/kan-ban_cafee_bestellungen_trello/components/ClientOrderChatModal.tsx), открывающийся клиенту после OTP-верификации. На карточке заказа в CRM Менеджера ([`app/manager/crm/page.tsx`](file:///C:/Users/Bergmann/Desktop/angular/%D0%BF%D1%80%D0%BE%D0%B5%D0%BA%D1%82%D1%8B/kan-ban_cafee_bestellungen_trello/app/manager/crm/page.tsx)) внедрен счётчик непрочитанных входящих сообщений `🔴 (N)`, который автоматически обнуляется при открытии и прочтении диалога менеджером.
* **Кнопка очистки корзины в 1 клик**: В шапку выезжающей корзины [`components/CartDrawer.tsx`](file:///C:/Users/Bergmann/Desktop/angular/%D0%BF%D1%80%D0%BE%D0%B5%D0%BA%D1%82%D1%8B/kan-ban_cafee_bestellungen_trello/components/CartDrawer.tsx) добавлена быстрая кнопка `🗑️ Очистить`, позволяющая сбросить все выбранные позиций за один клик.
* **Загрузка фото блюд с ПК (локального носителя)**: В форме создания нового блюда в [`app/admin/dashboard/page.tsx`](file:///C:/Users/Bergmann/Desktop/angular/%D0%BF%D1%80%D0%BE%D0%B5%D0%BA%D1%82%D1%8B/kan-ban_cafee_bestellungen_trello/app/admin/dashboard/page.tsx) добавлена кнопка `📁 Загрузить фото с компьютера` с мгновенным предпросмотром картинки перед сохранением в базу Supabase.
* **Менеджер Категорий и Выпадающий список**: В панели управления админа добавлен раздел `🏷️ Категории` (создание и удаление категорий), а выбор категории при создании блюда стал удобным выпадающим всплывающим списком (Select Dropdown).
* **Авто-обновление витрины в режиме онлайн БЕЗ перезагрузки**: Реализован механизм `subscribeToMenuUpdates` в [`lib/menu/dishes.ts`](file:///C:/Users/Bergmann/Desktop/angular/%D0%BF%D1%80%D0%BE%D0%B5%D0%BA%D1%82%D1%8B/kan-ban_cafee_bestellungen_trello/lib/menu/dishes.ts) и [`app/page.tsx`](file:///C:/Users/Bergmann/Desktop/angular/%D0%BF%D1%80%D0%BE%D0%B5%D0%BA%D1%82%D1%8B/kan-ban_cafee_bestellungen_trello/app/page.tsx), благодаря которому любое блюдо или категория, созданные админом, моментально отображаются у всех пользователей на витрине без клика F5 или обновления страницы.
* **Canvas-сжатие картинок и гибридная синхронизация Supabase**: В [`lib/menu/dishes.ts`](file:///C:/Users/Bergmann/Desktop/angular/%D0%BF%D1%80%D0%BE%D0%B5%D0%BA%D1%82%D1%8B/kan-ban_cafee_bestellungen_trello/lib/menu/dishes.ts) внедрена компрессия изображений с ПК через HTML5 Canvas (сжатие 10MB картинок до легких 40-70KB JPEG) для безупречной записи в базу Supabase без ошибок переполнения, с подстраховкой локальной памяти при работе в оффлайн-режиме.
* **Выравнивание формы «Публикация нового блюда»**: В [`app/admin/dashboard/page.tsx`](file:///C:/Users/Bergmann/Desktop/angular/%D0%BF%D1%80%D0%BE%D0%B5%D0%BA%D1%82%D1%8B/kan-ban_cafee_bestellungen_trello/app/admin/dashboard/page.tsx) устранён системный баг вёрстки, при котором поле «Категория» смещалось вниз относительно поля «Цена» из-за разной длины текста лейблов. Все лейблы и поля формы переведены на единые переиспользуемые стили (`dishFormLabelStyle`, `dishFormInputStyle`, `dishFormFieldPairStyle` с `alignItems: 'end'`), что делает выравнивание устойчивым к любой длине текста лейблов. Убран лишний текст «(Выпадающий список)» из лейбла категории, а поле «веб-ссылка на изображение» приведено к единому размеру с остальными полями формы.

