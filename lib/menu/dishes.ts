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

export const defaultCategories: string[] = [
  'Горячие блюда',
  'Напитки',
  'Супы',
  'Салаты',
  'Выпечка',
  'Десерты',
];

let localCategoriesStore: string[] = [...defaultCategories];

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

let inMemoryDishesStore: Dish[] = [...defaultDishes];

function getStoredDishes(): Dish[] {
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem('daymohk_dishes');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {}
    }
  }
  return inMemoryDishesStore;
}

function saveStoredDishes(dishes: Dish[]) {
  inMemoryDishesStore = dishes;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('daymohk_dishes', JSON.stringify(dishes));
    } catch (e) {}
  }
}

/**
 * Realtime Event Listener broadcast for zero-page-refresh update on Storefront
 */
export function notifyMenuUpdated() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('daymohk_menu_updated'));
  }
}

export function subscribeToMenuUpdates(callback: () => void) {
  if (typeof window !== 'undefined') {
    window.addEventListener('daymohk_menu_updated', callback);
    window.addEventListener('storage', callback);
    return () => {
      window.removeEventListener('daymohk_menu_updated', callback);
      window.removeEventListener('storage', callback);
    };
  }
  return () => {};
}

/**
 * Получить список категорий
 */
export function fetchCategories(): string[] {
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem('daymohk_categories');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          localCategoriesStore = parsed;
        }
      } catch (e) {}
    }
  }
  return localCategoriesStore;
}

export function addCategory(newCategory: string): string[] {
  const trimmed = newCategory.trim();
  if (trimmed && !localCategoriesStore.includes(trimmed)) {
    localCategoriesStore.push(trimmed);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('daymohk_categories', JSON.stringify(localCategoriesStore));
      } catch (e) {}
    }
    notifyMenuUpdated();
  }
  return localCategoriesStore;
}

export function removeCategory(categoryToRemove: string): string[] {
  localCategoriesStore = localCategoriesStore.filter((c) => c !== categoryToRemove);
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('daymohk_categories', JSON.stringify(localCategoriesStore));
    } catch (e) {}
  }
  notifyMenuUpdated();
  return localCategoriesStore;
}

/**
 * Compress and read image file from local computer drive as optimized base64 Data URL (Max 800x800, JPEG 75%)
 * Prevents Supabase text column overflow and HTTP 413 Payload Too Large errors!
 */
export function readImageFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const resultStr = e.target?.result as string;
      if (!resultStr) {
        reject(new Error('Empty file content'));
        return;
      }

      // Create image element for Canvas compression
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxWidth = 800;
        const maxHeight = 800;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(resultStr);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Compress to JPEG 75% quality (~40-70KB payload for Supabase DB)
        const compressed = canvas.toDataURL('image/jpeg', 0.75);
        resolve(compressed);
      };

      img.onerror = () => {
        // Fallback to original string if canvas fail
        resolve(resultStr);
      };

      img.src = resultStr;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

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

    if (!error && data && data.length > 0) {
      const fetched = data.map((row: any) => ({
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
      saveStoredDishes(fetched);
      return fetched;
    }
  } catch (err) {
    // ignore
  }
  return getStoredDishes();
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

    if (!error && data && data.length > 0) {
      const fetched = data.map((row: any) => ({
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
      return fetched;
    }
  } catch (err) {
    // ignore
  }

  const stored = getStoredDishes();
  return stored.filter((d) => d.isAvailable);
}

/**
 * Создать новый слот блюда Администратором с отправкой в Supabase и подстраховкой
 */
export async function addNewDishInSupabase(
  newDish: Omit<Dish, 'id'>
): Promise<Dish | null> {
  const createdDish: Dish = {
    id: `dish-${Date.now()}`,
    ...newDish,
  };

  // 1. Обновляем локальные категории
  if (!localCategoriesStore.includes(newDish.category)) {
    localCategoriesStore.push(newDish.category);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('daymohk_categories', JSON.stringify(localCategoriesStore));
      } catch (e) {}
    }
  }

  // 2. Включаем блюдо в текущий стор
  const currentDishes = getStoredDishes();
  currentDishes.unshift(createdDish);
  saveStoredDishes(currentDishes);

  // 3. Отправляем ПРЯМОЙ INSERT запрос в базу данных Supabase
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

    if (!error && data) {
      createdDish.id = data.id;
    }
  } catch (err) {
    // Supabase fallback
  }

  // Оповещаем витрину об обновлении БЕЗ перезагрузки
  notifyMenuUpdated();
  return createdDish;
}

/**
 * Изменить доступность блюда (Стоп-лист) Администратором
 */
export async function toggleDishAvailabilityInSupabase(
  dishId: string,
  newAvailable: boolean
): Promise<boolean> {
  const currentDishes = getStoredDishes();
  const local = currentDishes.find((d) => d.id === dishId);
  if (local) {
    local.isAvailable = newAvailable;
    saveStoredDishes(currentDishes);
  }

  try {
    const supabase = createClient();
    await supabase
      .from('dishes')
      .update({ is_available: newAvailable })
      .eq('id', dishId);
  } catch (err) {
    // ignore
  }

  notifyMenuUpdated();
  return true;
}
