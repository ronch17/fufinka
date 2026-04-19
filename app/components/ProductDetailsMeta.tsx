import {Link} from 'react-router';

export type ProductDetailsMetaProps = {
  product: {
    productType: string;
    tags: string[];
    vendor: string;
    publishedAt: string;
    category?: {
      name: string;
      ancestors: Array<{name: string}>;
    } | null;
    collections: {
      nodes: Array<{id: string; title: string; handle: string}>;
    };
  };
  selectedVariant?: {sku?: string | null} | null;
};

/**
 * פרטי מטא-דאטה של המוצר: קטגוריה (טקסונומיה), סוג מוצר, מותג, אוספים, תגיות, SKU, תאריך פרסום.
 */
export function ProductDetailsMeta({
  product,
  selectedVariant,
}: ProductDetailsMetaProps) {
  const {productType, tags, vendor, publishedAt, category, collections} =
    product;

  const categoryPath =
    category &&
    [...category.ancestors.map((a) => a.name), category.name].filter(Boolean);

  const published = publishedAt
    ? new Date(publishedAt).toLocaleDateString('he-IL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  const hasAny =
    categoryPath?.length ||
    productType ||
    vendor ||
    collections.nodes.length > 0 ||
    tags.length > 0 ||
    selectedVariant?.sku ||
    published;

  if (!hasAny) return null;

  return (
    <section
      className="mt-8 border-t border-gray-200 pt-6 text-sm"
      aria-labelledby="product-details-heading"
    >
      <h2
        id="product-details-heading"
        className="mb-4 text-lg font-semibold text-gray-900"
      >
        פרטי מוצר
      </h2>
      <dl className="grid gap-3 sm:grid-cols-2">
        {categoryPath && categoryPath.length > 0 ? (
          <div>
            <dt className="text-gray-500">קטגוריה</dt>
            <dd className="font-medium text-gray-800">{categoryPath.join(' › ')}</dd>
          </div>
        ) : null}

        {productType ? (
          <div>
            <dt className="text-gray-500">סוג מוצר</dt>
            <dd className="font-medium text-gray-800">{productType}</dd>
          </div>
        ) : null}

        {vendor ? (
          <div>
            <dt className="text-gray-500">מותג / ספק</dt>
            <dd className="font-medium text-gray-800">{vendor}</dd>
          </div>
        ) : null}

        {published ? (
          <div>
            <dt className="text-gray-500">תאריך פרסום</dt>
            <dd className="font-medium text-gray-800">{published}</dd>
          </div>
        ) : null}

        {selectedVariant?.sku ? (
          <div>
            <dt className="text-gray-500">מק״ט (SKU)</dt>
            <dd className="font-medium text-gray-800">{selectedVariant.sku}</dd>
          </div>
        ) : null}

        {collections.nodes.length > 0 ? (
          <div className="sm:col-span-2">
            <dt className="text-gray-500">אוספים</dt>
            <dd className="mt-1 flex flex-wrap gap-2">
              {collections.nodes.map((c) => (
                <Link
                  key={c.id}
                  to={`/collections/${c.handle}`}
                  className="rounded-full bg-gray-100 px-3 py-1 text-gray-800 transition hover:bg-gray-200"
                >
                  {c.title}
                </Link>
              ))}
            </dd>
          </div>
        ) : null}

        {tags.length > 0 ? (
          <div className="sm:col-span-2">
            <dt className="text-gray-500">תגיות</dt>
            <dd className="mt-1 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded border border-gray-200 px-2 py-0.5 text-gray-700"
                >
                  {tag}
                </span>
              ))}
            </dd>
          </div>
        ) : null}
      </dl>
    </section>
  );
}
