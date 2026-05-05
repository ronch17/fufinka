import {useRouteLoaderData} from 'react-router';
import type {I18nLocale} from '~/lib/i18n';
import {getCartFormRoute} from '~/lib/cart-route';

/** נתיב CartForm מתואם ל־locale בסשן הנוכחי (כולל pathPrefix מה־loader של root) */
export function useCartFormRoute(): string {
  const root = useRouteLoaderData('root') as {locale?: I18nLocale} | undefined;
  const locale = root?.locale;
  if (locale) return getCartFormRoute(locale);
  return '/cart';
}
