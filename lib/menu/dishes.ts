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
  imageUrl?: string | null;
}

export const defaultDishes: Dish[] = [
  {
    id: 'dish-1',
    title: 'Люля-кебаб из баранины',
    description: 'Традиционный кавказский люля-кебаб из сочной баранины со специями, луком и свежей зеленью. Подается с соусом.',
    price: 150,
    category: 'Горячие блюда',
    isAvailable: true,
    estimatedCookingTimeMinutes: 15,
    badge: 'Популярное',
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'dish-2',
    title: 'Шашлык из курицы',
    description: 'Нежные кусочки куриного филе в фирменном маринаде, приготовленные на мангале. Сочный и ароматный.',
    price: 200,
    category: 'Горячие блюда',
    isAvailable: true,
    estimatedCookingTimeMinutes: 15,
    badge: 'Шеф-выбор',
    imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'dish-3',
    title: 'Домашний Лимонад с мятой',
    description: 'Освежающий цитрусовый лимонад из свежевыжатого лимона, мяты и минеральной воды.',
    price: 180,
    category: 'Напитки',
    isAvailable: true,
    estimatedCookingTimeMinutes: 5,
    badge: null,
    imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'dish-4',
    title: 'Суп Дня на мясном бульоне',
    description: 'Наваристый суп с говядиной, свежими овощами и душистыми травяными специями.',
    price: 250,
    category: 'Супы',
    isAvailable: false,
    estimatedCookingTimeMinutes: 20,
    badge: null,
    imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'dish-5',
    title: 'Свежий салат с зеленью',
    description: 'Хрустящие огурцы, спелые томаты, сладкий перец и свежая зелень с заправкой из оливкового масла.',
    price: 120,
    category: 'Салаты',
    isAvailable: true,
    estimatedCookingTimeMinutes: 10,
    badge: null,
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'dish-6',
    title: 'Хачапури по-аджарски',
    description: 'Традиционная лодочка с тягучим сыром сулугуни, сливочным маслом и желтом яйца.',
    price: 300,
    category: 'Выпечка',
    isAvailable: true,
    estimatedCookingTimeMinutes: 18,
    badge: 'Новинка',
    imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80',
  },
];

/**
 * Получить все блюда (для панели Администратора)
 */
export async function fetchAllDishes(): Promise<Dish[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('dishes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return defaultDishes;
    }

    return data.map((row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description || '',
      price: Number(row.price),
      category: row.category,
      isAvailable: row.is_available,
      estimatedCookingTimeMinutes: row.estimated_cooking_time_minutes || 15,
      badge: row.badge || null,
      imageUrl: row.image_url || null,
    }));
  } catch (err) {
    return defaultDishes;
  }
}

/**
 * Получить только доступные блюда для Витрины из Supabase DB
 */
export async function fetchAvailableDishes(): Promise<Dish[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('dishes')
      .select('*')
      .eq('is_available', true);

    if (error || !data || data.length === 0) {
      return defaultDishes.filter((d) => d.isAvailable);
    }

    return data.map((row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description || '',
      price: Number(row.price),
      category: row.category,
      isAvailable: row.is_available,
      estimatedCookingTimeMinutes: row.estimated_cooking_time_minutes || 15,
      badge: row.badge || null,
      imageUrl: row.image_url || null,
    }));
  } catch (err) {
    return defaultDishes.filter((d) => d.isAvailable);
  }
}

/**
 * Создать новый слот блюда Администратором
 */
export async function addNewDishInSupabase(
  newDish: Omit<Dish, 'id'>
): Promise<Dish | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('dishes')
      .insert({
        title: newDish.title,
        description: newDish.description,
        price: newDish.price,
        category: newDish.category,
        is_available: newDish.isAvailable,
        estimated_cooking_time_minutes: newDish.estimatedCookingTimeMinutes || 15,
        badge: newDish.badge || null,
        image_url: newDish.imageUrl || null,
      })
      .select()
      .single();

    if (error || !data) {
      // Резервное добавление в локальный список при отсутствии БД
      const createdDish: Dish = {
        id: `dish-${Date.now()}`,
        ...newDish,
      };
      defaultDishes.unshift(createdDish);
      return createdDish;
    }

    return {
      id: data.id,
      title: data.title,
      description: data.description || '',
      price: Number(data.price),
      category: data.category,
      isAvailable: data.is_available,
      estimatedCookingTimeMinutes: data.estimated_cooking_time_minutes || 15,
      badge: data.badge || null,
      imageUrl: data.image_url || null,
    };
  } catch (err) {
    const createdDish: Dish = {
      id: `dish-${Date.now()}`,
      ...newDish,
    };
    defaultDishes.unshift(createdDish);
    return createdDish;
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

    // Обновляем локальный массив для демо
    const local = defaultDishes.find((d) => d.id === dishId);
    if (local) {
      local.isAvailable = newAvailable;
    }

    return !error;
  } catch (err) {
    return false;
  }
}
