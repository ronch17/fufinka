import type {I18nLocale} from '~/lib/i18n';

/**
 * נתיב ה-action של CartForm — עם pathPrefix סטורפונטאי (למשל `/HE-IL/cart`).
 * שליחת POST לנתיב `/cart` בעוד המשתמש ב־`/{locale}/...` משאירה את הבקשות מול route שלא מתעדכן כמו שה-header מציג.
 */
export function getCartFormRoute(locale: Pick<I18nLocale, 'pathPrefix'>): string {
  const prefix = locale.pathPrefix ?? '';
  return `${prefix}/cart`;
}
