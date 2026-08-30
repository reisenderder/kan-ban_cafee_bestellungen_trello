import { NextResponse, type NextRequest } from 'next/server';
import { updateSession, isSupabaseConfigured } from './lib/supabase/middleware';

/**
 * Блок 2, группа D (пункт 8) — guard служебных страниц.
 *
 * Закрываются все пять служебных разделов (`Feature_Admin_Control.md` §17,
 * `Technical_Access_Audit.md` §18 п.8). Учётки в Блоке 2 — только ADMIN и MANAGER,
 * поэтому на kitchen/courier/resolution фактически заходит только вошедший
 * менеджер или администратор.
 *
 * Правила:
 *  - нет валидной сессии Supabase           → редирект на /login?redirectTo=...
 *  - employee_profiles.status != 'ACTIVE'   → редирект на /login?error=suspended
 *  - в JWT нет роли и нет профиля            → редирект на /login?error=norole
 *  - раздел /admin, а роль не ADMIN          → редирект в кабинет своей роли
 *
 * Если Supabase не сконфигурирован (локальная разработка без .env.local) — guard
 * пропускает всё, чтобы не блокировать разработку и headless-QA. На Production
 * (переменные окружения заданы) guard активен полностью.
 */

const STAFF_PREFIXES = ['/admin', '/manager', '/kitchen', '/courier', '/resolution'];
const ADMIN_ONLY_PREFIXES = ['/admin'];

function matchesPrefix(pathname: string, prefixes: string[]): boolean {
  return prefixes.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

function redirectToLogin(request: NextRequest, params: Record<string, string>): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = '/login';
  url.search = '';
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return NextResponse.redirect(url);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!matchesPrefix(pathname, STAFF_PREFIXES)) {
    return NextResponse.next();
  }

  // Локальная разработка без настоящего Supabase — не мешаем.
  if (!isSupabaseConfigured()) {
    return NextResponse.next();
  }

  const { response, user, supabase } = await updateSession(request);

  if (!user) {
    return redirectToLogin(request, { redirectTo: pathname });
  }

  const jwtRole = (user.app_metadata as Record<string, unknown> | undefined)?.role;

  const { data: profile } = await supabase
    .from('employee_profiles')
    .select('status, role')
    .eq('id', user.id)
    .maybeSingle();

  const status = (profile?.status as string | undefined) ?? null;
  const role = (typeof jwtRole === 'string' ? jwtRole : null) ?? (profile?.role as string | undefined) ?? null;

  if (status !== null && status !== 'ACTIVE') {
    return redirectToLogin(request, { error: 'suspended' });
  }

  if (!role) {
    return redirectToLogin(request, { error: 'norole' });
  }

  if (matchesPrefix(pathname, ADMIN_ONLY_PREFIXES) && role !== 'ADMIN') {
    const url = request.nextUrl.clone();
    url.pathname = '/manager/crm';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/manager/:path*',
    '/kitchen/:path*',
    '/courier/:path*',
    '/resolution/:path*',
  ],
};
