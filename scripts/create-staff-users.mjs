/**
 * Блок 2, группа D (пункт 8) — разовое заведение служебных учёток в Supabase Auth.
 *
 * Запускает ВЛАДЕЛЕЦ проекта ЛОКАЛЬНО. Ни ключи, ни пароли в репозиторий не попадают
 * (передаются через переменные окружения текущей сессии терминала).
 *
 * Что делает:
 *  - создаёт (или обновляет) двух пользователей: ADMIN и MANAGER;
 *  - кладёт роль в app_metadata.role (её нельзя задать анонимным/пользовательским ключом);
 *  - помечает email как подтверждённый (email_confirm: true);
 *  - апсертит строку в public.employee_profiles (id = auth.uid(), role, status = 'ACTIVE').
 *
 * Требуется:
 *  - Node 18+ (или установленный пакет node-fetch); пакет @supabase/supabase-js уже в проекте.
 *
 * Как запустить (пример для PowerShell):
 *   $env:SUPABASE_URL              = "https://<ref>.supabase.co"
 *   $env:SUPABASE_SERVICE_ROLE_KEY = "<service_role key из Project Settings → API>"
 *   $env:ADMIN_EMAIL              = "d.rasul@outlook.de"
 *   $env:ADMIN_PASSWORD          = "<пароль администратора>"
 *   $env:MANAGER_EMAIL           = "djrasul46@gmail.com"
 *   $env:MANAGER_PASSWORD       = "<пароль менеджера>"
 *   node scripts/create-staff-users.mjs
 *
 * Пароль можно сменить позже в панели Supabase (Authentication → Users) — там же
 * выполняется и восстановление пароля (в Блоке 2 отдельной страницы «Забыли пароль?» нет).
 */

import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('❌ Заданы не все переменные: нужны SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const staff = [
  {
    role: 'ADMIN',
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
  },
  {
    role: 'MANAGER',
    email: process.env.MANAGER_EMAIL,
    password: process.env.MANAGER_PASSWORD,
  },
];

for (const person of staff) {
  if (!person.email || !person.password) {
    console.error(`❌ Для роли ${person.role} не заданы ${person.role}_EMAIL / ${person.role}_PASSWORD.`);
    process.exit(1);
  }
  if (person.password.length < 8) {
    console.error(`❌ Пароль для ${person.role} слишком короткий (минимум 8 символов).`);
    process.exit(1);
  }
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function findUserByEmail(email) {
  // Постранично обходим список пользователей (у проекта их немного).
  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const match = data.users.find((u) => (u.email || '').toLowerCase() === email.toLowerCase());
    if (match) return match;
    if (data.users.length < 200) break;
  }
  return null;
}

async function upsertProfile(userId, role) {
  const { error } = await admin
    .from('employee_profiles')
    .upsert({ id: userId, role, status: 'ACTIVE' }, { onConflict: 'id' });
  if (error) throw error;
}

async function run() {
  for (const person of staff) {
    const existing = await findUserByEmail(person.email);

    if (!existing) {
      const { data, error } = await admin.auth.admin.createUser({
        email: person.email,
        password: person.password,
        email_confirm: true,
        app_metadata: { role: person.role },
      });
      if (error) throw error;
      await upsertProfile(data.user.id, person.role);
      console.log(`✅ Создан ${person.role}: ${person.email}`);
    } else {
      const { data, error } = await admin.auth.admin.updateUserById(existing.id, {
        password: person.password,
        email_confirm: true,
        app_metadata: { ...existing.app_metadata, role: person.role },
      });
      if (error) throw error;
      await upsertProfile(data.user.id, person.role);
      console.log(`♻️  Обновлён ${person.role}: ${person.email} (пароль и роль перезаписаны)`);
    }
  }

  console.log('\nГотово. Учётки можно использовать на /login.');
}

run().catch((err) => {
  console.error('❌ Ошибка:', err.message || err);
  process.exit(1);
});
