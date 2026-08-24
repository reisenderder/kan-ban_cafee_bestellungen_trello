import { createClient } from '../supabase/client';

export interface Dish {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  isAvailable: boolean;
  estimatedCookingTimeMinutes?: number;
  badge?: string | null;
}

export const defaultDishes: Dish[] = [
  {
    id: 'dish-1',
    title: 'Блюдо 1 (Люля-кебаб)',
    description: 'Традиционный кавказский люля-кебаб из парного мяса со специями и зеленью.',
    price: 150,
    category: 'Категория 1',
    isAvailable: true,
    estimatedCookingTimeMinutes: 15,
    badge: 'Популярное',
  },
  {
    id: 'dish-2',
    title: 'Блюдо 2 (Шашлык из курицы)',
    description: 'Сочные кусочки филе в фирменном маринаде на углях.',
    price: 200,
    category: 'Категория 1',
    isAvailable: true,
    estimatedCookingTimeMinutes: 15,
    badge: 'Шеф-выбор',
  },
  {
    id: 'dish-3',
    title: 'Блюдо 3 (Лимонад)',
    description: 'Освежающий домашний лимонад с цитрусом и мятой.',
    price: 180,
    category: 'Категория 2',
    isAvailable: true,
    estimatedCookingTimeMinutes: 5,
    badge: null,
  },
  {
    id: 'dish-4',
    title: 'Блюдо 4 (Суп Дня)',
    description: 'Наваристый густой суп на мясном бульоне.',
    price: 250,
    category: 'Категория 2',
    isAvailable: false, // Временно в стоп-листе
    estimatedCookingTimeMinutes: 20,
    badge: null,
  },
  {
    id: 'dish-5',
    title: 'Блюдо 5 (Салат)',
    description: 'Свежие овощи с зеленью и оливковым маслом.',
    price: 120,
    category: 'Категория 3',
    isAvailable: true,
    estimatedCookingTimeMinutes: 10,
    badge: null,
  },
  {
    id: 'dish-6',
    title: 'Блюдо 6 (Хачапури)',
    description: 'Горячее хачапури с сыром сулугуни и тягучим желтком.',
    price: 300,
    category: 'Категория 4',
    isAvailable: true,
    estimatedCookingTimeMinutes: 18,
    badge: null,
  },
];

/**
 * Получить все доступные блюда для Витрины из Supabase DB
 */
export async function fetchAvailableDishes(): Promise<Dish[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('dishes')
      .select('*')
      .eq('is_available', true);

    if (error || !data || data.length === 0) {
      // Fallback к локальному списку при отсутствии подключенной СУБД
      return defaultDishes.filter((d) => d.isAvailable);
    }

    return data.map((row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description || '',
      price: row.price,
      category: row.category,
      isAvailable: row.is_available,
      estimatedCookingTimeMinutes: row.estimated_cooking_time_minutes || 15,
      badge: row.badge || null,
    }));
  } catch (err) {
    // В локальном окружении возвращаем тестовый список
    return defaultDishes.filter((d) => d.isAvailable);
  }
}

/**
 * Изменить доступность блюда (Стоп-лист) Администратором
 */
export async function toggleDishAvailabilityInSupabase(
  dishId: string,
  newAvailable: boolean
): Promise<boolean> {
  try {
    const supabase = createClient();
    const { error } = await supabase
      .from('dishes')
      .update({ is_available: newAvailable })
      .eq('id', dishId);

    return !error;
  } catch (err) {
    return false;
  }
}
