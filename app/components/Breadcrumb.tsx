import * as React from 'react';
import {Link} from 'react-router';

export type BreadcrumbItem = {
  /** טקסט להצגה */
  label: React.ReactNode;
  /**
   * נתיב לניווט. אם לא מועבר (או רק בפריט האחרון) — מוצג כטקסט בלבד (עמוד נוכחי).
   */
  to?: string;
};

export type BreadcrumbsProps = {
  items: BreadcrumbItem[];
  /** class ל־`<nav>` */
  className?: string;
  /** class ל־`<ol>` */
  listClassName?: string;
  /** מפריד בין פריטים (ברירת מחדל: /) */
  separator?: React.ReactNode;
  /** תווית נגישות ל־nav */
  ariaLabel?: string;
};

/**
 * Breadcrumbs גנריים עם microdata לפי schema.org/BreadcrumbList.
 *
 * @example
 * ```tsx
 * <Breadcrumbs
 *   items={[
 *     { label: 'בית', to: '/' },
 *     { label: 'מוצרים', to: '/collections/all' },
 *     { label: 'פריט נוכחי' },
 *   ]}
 * />
 * ```
 */
export function Breadcrumbs({
  items,
  className = '',
  listClassName = '',
  separator = '/',
  ariaLabel = 'Breadcrumb',
}: BreadcrumbsProps) {
  if (!items.length) return null;

  const navClass = [
    'mb-4 flex justify-center text-sm',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const olClass = [
    'inline-flex flex-wrap items-center gap-x-1 gap-y-1 rtl:space-x-reverse',
    listClassName,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <nav
      className={navClass}
      aria-label={ariaLabel}
      itemScope
      itemType="https://schema.org/BreadcrumbList"
    >
      <ol className={olClass}>
        {items.map((item, index) => {
          const position = index + 1;
          const isLast = index === items.length - 1;
          const isLink = Boolean(item.to) && !isLast;
          const key =
            item.to != null && item.to !== ''
              ? `${item.to}-${index}`
              : `crumb-${index}`;

          return (
            <li
              key={key}
              className="inline-flex items-center "
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
            >
              {index > 0 ? (
                <span className="mx-1 " aria-hidden="true">
                  {separator}
                </span>
              ) : null}

              {isLink ? (
                <Link
                  to={item.to!}
                  className="inline-flex items-center"
                  itemProp="item"
                >
                  <span itemProp="name">{item.label}</span>
                </Link>
              ) : (
                <span
                  className={isLast ? 'font-medium ' : undefined}
                  itemProp="name"
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}

              <meta itemProp="position" content={String(position)} />
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** alias — אותה קומפוננטה */
export {Breadcrumbs as Breadcrumb};
