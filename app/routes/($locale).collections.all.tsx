import type {Route} from './+types/collections.all';
import {Form, useLoaderData, useSearchParams} from 'react-router';
import {getPaginationVariables} from '@shopify/hydrogen';
import {Breadcrumbs} from '~/components/Breadcrumb';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {ProductItem} from '~/components/ProductItem';
import type {CollectionItemFragment} from 'storefrontapi.generated';

import productsBg from '~/assets/products-background.jpeg';

/** Page size for catalog pagination — keep in sync with getPaginationVariables below. */
const CATALOG_PAGE_SIZE = 8;

export const meta: Route.MetaFunction = () => {
  return [{title: `Fufinka | מוצרים`}];
};



export async function loader(args: Route.LoaderArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

type PriceBoundsQueryResult = {
  cheapest?: {
    nodes: Array<{
      priceRange?: {minVariantPrice?: {amount: string} | null} | null;
    }>;
  } | null;
  priciest?: {
    nodes: Array<{
      priceRange?: {minVariantPrice?: {amount: string} | null} | null;
    }>;
  } | null;
};

function pricesFromNodes(
  nodes: Array<{priceRange?: {minVariantPrice?: {amount: string} | null} | null}>,
) {
  return nodes
    .map((p) => Number(p.priceRange?.minVariantPrice?.amount))
    .filter((n) => Number.isFinite(n));
}

type ProductNodeForPrice = {
  priceRange?: {minVariantPrice?: {amount: string} | null} | null;
};

/** Global catalog floor for sliders (fallback: current page only). */
function resolveCatalogPriceMin(
  products: {nodes: ProductNodeForPrice[]},
  bounds: PriceBoundsQueryResult | null,
) {
  const fromBounds = bounds?.cheapest?.nodes?.[0]?.priceRange?.minVariantPrice
    ?.amount;
  if (fromBounds != null && fromBounds !== '') {
    return Math.floor(Number(fromBounds));
  }
  const prices = pricesFromNodes(products.nodes);
  return prices.length ? Math.floor(Math.min(...prices)) : 0;
}

/** Global catalog ceiling for sliders (fallback: current page only). */
function resolveCatalogPriceMax(
  products: {nodes: ProductNodeForPrice[]},
  bounds: PriceBoundsQueryResult | null,
) {
  const fromBounds = bounds?.priciest?.nodes?.[0]?.priceRange?.minVariantPrice
    ?.amount;
  if (fromBounds != null && fromBounds !== '') {
    return Math.ceil(Number(fromBounds));
  }
  const prices = pricesFromNodes(products.nodes);
  return prices.length ? Math.ceil(Math.max(...prices)) : 100;
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context, request}: Route.LoaderArgs) {
  const {storefront} = context;
  const url = new URL(request.url);

  const selectedTags = url.searchParams.getAll('tag');
  const sortParam = url.searchParams.get('sort');
  const {sortKey, reverse} = getProductSortFromParam(sortParam);

  const paginationVariables = getPaginationVariables(request, {
    pageBy: CATALOG_PAGE_SIZE,
  });

  const [{products}, totalInCatalog, priceBounds, tagsData] = await Promise.all([
    storefront.query(CATALOG_QUERY, {
      variables: {
        ...paginationVariables,
        sortKey,
        reverse,
      },
    }),
    storefront
      .query(PRODUCT_CATALOG_TOTAL_QUERY)
      .then(
        (r: {catalogSearch?: {totalCount: number} | null}) =>
          r.catalogSearch?.totalCount ?? null,
      )
      .catch(() => null as number | null),
    storefront
      .query(CATALOG_PRICE_BOUNDS_QUERY)
      .catch(() => null as PriceBoundsQueryResult | null),
    storefront
      .query(PRODUCT_TAGS_QUERY)
      .then((r: {productTags?: {nodes: string[]} | null}) => r)
      .catch(() => ({productTags: {nodes: [] as string[]}})),
  ]);

  /**
   * Slider bounds must reflect the whole catalog, not only the current page.
   * After "load more", `products.nodes` is just one page — using it for min/max
   * shrinks the range inputs and breaks dragging the price filters.
   */
  let priceMin = resolveCatalogPriceMin(products, priceBounds);
  let priceMax = resolveCatalogPriceMax(products, priceBounds);
  if (priceMin > priceMax) {
    [priceMin, priceMax] = [priceMax, priceMin];
  }

  const minPriceParamRaw = url.searchParams.has('minPrice')
    ? Number(url.searchParams.get('minPrice'))
    : priceMin;
  const maxPriceParamRaw = url.searchParams.has('maxPrice')
    ? Number(url.searchParams.get('maxPrice'))
    : priceMax;
  let minPriceParam = Number.isFinite(minPriceParamRaw)
    ? Math.min(Math.max(minPriceParamRaw, priceMin), priceMax)
    : priceMin;
  let maxPriceParam = Number.isFinite(maxPriceParamRaw)
    ? Math.max(Math.min(maxPriceParamRaw, priceMax), priceMin)
    : priceMax;
  if (minPriceParam > maxPriceParam) {
    [minPriceParam, maxPriceParam] = [maxPriceParam, minPriceParam];
  }

  /**
   * Tags must come from the whole catalog (`productTags`), not `products.nodes` —
   * after "load more", the current page may include zero products that carry a tag,
   * so checkbox lists built only from the page would disappear.
   */
  const tagNodes = tagsData?.productTags?.nodes?.filter(Boolean) ?? [];
  const allTags: string[] =
    tagNodes.length > 0
      ? [...tagNodes].sort((a, b) => a.localeCompare(b, 'he'))
      : Array.from(
          new Set<string>(
            products.nodes.flatMap((p: {tags?: string[] | null}) =>
              p.tags ? p.tags : [],
            ),
          ),
        ).sort((a, b) => a.localeCompare(b, 'he'));

  const filteredProducts = {
    ...products,
    nodes: products.nodes.filter((p) => {
      const price = Number(p.priceRange.minVariantPrice.amount);
      const inPriceRange = price >= minPriceParam && price <= maxPriceParam;
      const hasSelectedTag =
        selectedTags.length === 0 ||
        p.tags?.some((tag: string) => selectedTags.includes(tag));
      return inPriceRange && hasSelectedTag;
    }),
  };

  return {
    products: filteredProducts,
    priceMin,
    priceMax,
    minPriceParam,
    maxPriceParam,
    allTags,
    selectedTags,
    sortParam: sortParam ?? 'best-selling',
    totalInCatalog,
    visibleOnPage: filteredProducts.nodes.length,
    pageSize: CATALOG_PAGE_SIZE,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: Route.LoaderArgs) {
  return {};
}

/** Maps URL `sort` param → Storefront API `products(sortKey:, reverse:)`. */
function getProductSortFromParam(sortParam: string | null) {
  switch (sortParam) {
    case 'price-asc':
      return {sortKey: 'PRICE' as const, reverse: false};
    case 'price-desc':
      return {sortKey: 'PRICE' as const, reverse: true};
    case 'updated':
      return {sortKey: 'UPDATED_AT' as const, reverse: true};
    case 'best-selling':
      return {sortKey: 'BEST_SELLING' as const, reverse: false};
    default:
      return {sortKey: 'BEST_SELLING' as const, reverse: false};
  }
}

export default function Collection() {
  const {
    products,
    priceMin,
    priceMax,
    minPriceParam,
    maxPriceParam,
    allTags,
    selectedTags,
    sortParam,
    totalInCatalog,
    visibleOnPage,
    pageSize,
  } = useLoaderData<typeof loader>();

  const [searchParams, setSearchParams] = useSearchParams();

  /** Remount filter form when filters/sort change (not when only pagination cursor changes). */
  const filterFormKey = [
    searchParams.get('minPrice') ?? '',
    searchParams.get('maxPrice') ?? '',
    [...searchParams.getAll('tag')].sort().join(','),
    searchParams.get('sort') ?? '',
  ].join('|');

  function debounce<T extends unknown[]>(
    fn: (...args: T) => void,
    delay: number,
  ) {
    let timer: ReturnType<typeof setTimeout>;
    return (...args: T) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  }

  /**
   * Rebuilds URL from filter form only and drops pagination cursors (`cursor` / `direction`).
   * Merging the old URL with a GET submit kept stale cursors and broke results after "load more".
   */
  const applyFiltersFromForm = debounce((form: HTMLFormElement) => {
    const fd = new FormData(form);
    const next = new URLSearchParams();

    const minP = fd.get('minPrice');
    const maxP = fd.get('maxPrice');
    if (minP != null && minP !== '') next.set('minPrice', String(minP));
    if (maxP != null && maxP !== '') next.set('maxPrice', String(maxP));

    for (const tag of fd.getAll('tag')) {
      if (tag) next.append('tag', String(tag));
    }

    const sort = fd.get('sort');
    if (sort) next.set('sort', String(sort));

    setSearchParams(next);
  }, 400);

  return (
    <>

         <header>
        <div className="h-64 flex flex-col items-center justify-center text-black" style={{backgroundImage: `url(${productsBg})`, backgroundSize: 'cover', backgroundPosition: 'center'}}>
          <h1 className='text-4xl font-medium md:text-5xl mb-5'>גלריית עבודות</h1>

      <Breadcrumbs
          className='text-black text-2xl font-medium'
            items={[
              {label: 'בית', to: '/'},
              {label: 'גלריית עבודות'},
            ]}
          />
        </div>

      </header>
    


      <div className="collection flex mt-20 px-10 gap-4 mb-5 max-md:flex-col">

        <Form
          key={filterFormKey}
          method="get"
          className="flex flex-col gap-4 w-64 md:border-l-1 border-gray-200 pl-4 max-md:w-full"
        >
          <input type="hidden" name="sort" value={sortParam} />

          <div className="flex flex-col gap-2">
            <label className="font-medium">סינון לפי קטגוריות</label>
            <div className="flex flex-col gap-1 max-h-64 overflow-auto">
              {allTags.map((tag: string) => (
                <label
                  key={tag}
                  className="flex items-center gap-2 text-sm cursor-pointer"
                >
                  <input
                    type="checkbox"
                    name="tag"
                    value={tag}
                    defaultChecked={selectedTags.includes(tag)}
                    className="checkbox checkbox-sm"
                    onChange={(e) =>
                      applyFiltersFromForm(e.currentTarget.form!)
                    }
                  />
                  <span>{tag}</span>
                </label>
              ))}
            </div>
          </div>

          <label className="font-medium">סינון מחיר</label>

          <div className="relative my-4">

            {/* MIN */}
            <input
              type="range"
              name="minPrice"
              min={priceMin}
              max={priceMax}
              defaultValue={minPriceParam}
              className="range range-secondary absolute w-full z-1"
              onChange={(e) =>
                applyFiltersFromForm(e.currentTarget.form!)
              }
            />

            {/* MAX */}
            <input
              type="range"
              name="maxPrice"
              min={priceMin}
              max={priceMax}
              defaultValue={maxPriceParam}
              className="range  absolute z-2 text-[var(--color-primary)]"
              onChange={(e) =>
                applyFiltersFromForm(e.currentTarget.form!)
              }
            />
            

          </div>

          <span>
            ₪{minPriceParam} - ₪{maxPriceParam}
          </span>

        </Form>

        <PaginatedResourceSection<CollectionItemFragment>
          connection={products}
          resourcesClassName="products-grid"
          showPreviousLink={false}
          toolbar={
            <div className="flex flex-col gap-3">
              <p
                className="text-sm text-gray-600"
                role="status"
                aria-live="polite"
              >
                {totalInCatalog != null && (
                  <>
                    <span className="font-medium text-gray-800">
                      {totalInCatalog.toLocaleString('he-IL')}
                    </span>
                    {' מוצרים בחנות'}
                    <span className="mx-1 text-gray-400" aria-hidden="true">
                      ·
                    </span>
                  </>
                )}
                מציג{' '}
                <span className="font-medium text-gray-800">
                  {visibleOnPage.toLocaleString('he-IL')}
                </span>
                {' מוצרים בעמוד הזה'}
                <span className="mx-1 text-gray-400" aria-hidden="true">
                  ·
                </span>
                עד {pageSize.toLocaleString('he-IL')} מוצרים לעמוד
              </p>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-end">
              <label
                htmlFor="catalog-sort"
                className="text-sm font-medium text-gray-700"
              >
                מיון
              </label>
              <select
                id="catalog-sort"
                name="sort"
                className="select select-bordered select-sm w-full max-w-xs"
                value={sortParam}
                onChange={(e) => {
                  setSearchParams((prev) => {
                    const next = new URLSearchParams(prev);
                    next.set('sort', e.target.value);
                    next.delete('cursor');
                    next.delete('direction');
                    return next;
                  });
                }}
              >
                <option value="price-asc">מהזול ליקר</option>
                <option value="price-desc">מהיקר לזול</option>
                <option value="updated">המעודכן ביותר</option>
                <option value="best-selling">פופולריות</option>
              </select>
              </div>
            </div>
          }
        >
          {({node: product, index}) => (
            <ProductItem
              key={product.id}
              product={product}
              loading={index < CATALOG_PAGE_SIZE ? 'eager' : undefined}
            />
          )}
        </PaginatedResourceSection>

      </div>
    </>
  );
}

const COLLECTION_ITEM_FRAGMENT = `#graphql
  fragment MoneyCollectionItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment CollectionItem on Product {
    id
    handle
    title
    availableForSale
    tags
    featuredImage {
      id
      altText
      url
      width
      height
    }
    priceRange {
      minVariantPrice {
        ...MoneyCollectionItem
      }
      maxVariantPrice {
        ...MoneyCollectionItem
      }
    }
  }
` as const;

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/product
const CATALOG_QUERY = `#graphql
  query Catalog(
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
    $sortKey: ProductSortKeys
    $reverse: Boolean
  ) @inContext(country: $country, language: $language) {
    products(
      first: $first
      last: $last
      before: $startCursor
      after: $endCursor
      sortKey: $sortKey
      reverse: $reverse
    ) {
      nodes {
        ...CollectionItem
      }
      pageInfo {
        hasPreviousPage
        hasNextPage
        startCursor
        endCursor
      }
    }
  }
  ${COLLECTION_ITEM_FRAGMENT}
` as const;

/** Total published products (Storefront search index) — used for catalog counter only. */
const PRODUCT_CATALOG_TOTAL_QUERY = `#graphql
  query ProductCatalogTotal(
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    catalogSearch: search(
      first: 1
      query: "*"
      types: [PRODUCT]
      unavailableProducts: HIDE
    ) {
      totalCount
    }
  }
` as const;

/** Min/max variant price across the whole catalog (not the current page). */
const CATALOG_PRICE_BOUNDS_QUERY = `#graphql
  query CatalogPriceBounds(
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    cheapest: products(first: 1, sortKey: PRICE, reverse: false) {
      nodes {
        priceRange {
          minVariantPrice {
            amount
          }
        }
      }
    }
    priciest: products(first: 1, sortKey: PRICE, reverse: true) {
      nodes {
        priceRange {
          minVariantPrice {
            amount
          }
        }
      }
    }
  }
` as const;

/** All product tags in the shop (not tied to the current catalog page). */
const PRODUCT_TAGS_QUERY = `#graphql
  query CatalogProductTags(
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    productTags(first: 250) {
      nodes
    }
  }
` as const;
