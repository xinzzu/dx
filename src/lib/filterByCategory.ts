// src/lib/filterByCategory.ts

/**
 * Filter array of items by category_id
 * @param items - Array of items with category_id property
 * @param categoryId - The category id to filter by
 * @returns Filtered array
 */
export function filterByCategory<T extends { category_id: string }>(
  items: T[],
  categoryId: string
): T[] {
  return items.filter((item) => item.category_id === categoryId);
}
