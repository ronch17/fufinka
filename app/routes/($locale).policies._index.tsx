import {useLoaderData, Link} from 'react-router';
import {ChevronLeft} from 'lucide-react';
import type {Route} from './+types/policies._index';
import type {PoliciesQuery, PolicyItemFragment} from 'storefrontapi.generated';
import {Breadcrumbs} from '~/components/Breadcrumb';
import policiesBg from '~/assets/policies.jpeg';

export const meta: Route.MetaFunction = () => {
  return [{title: 'Fufinka | מסמכים משפטיים'}];
};

export async function loader({context}: Route.LoaderArgs) {
  const data: PoliciesQuery = await context.storefront.query(POLICIES_QUERY);

  const shopPolicies = data.shop;
  const policies: PolicyItemFragment[] = [
    shopPolicies?.privacyPolicy,
    shopPolicies?.shippingPolicy,
    shopPolicies?.termsOfService,
    shopPolicies?.refundPolicy,
    shopPolicies?.subscriptionPolicy,
  ].filter((policy): policy is PolicyItemFragment => policy != null);

  if (!policies.length) {
    throw new Response('No policies found', {status: 404});
  }

  return {policies};
}

export default function Policies() {
  const {policies} = useLoaderData<typeof loader>();

  return (
    <main className="policies-index bg-[var(--color-primary)]/10 min-h-[60vh]">
      <div
        className="relative flex h-64 flex-col items-center justify-center overflow-hidden text-black"
        style={{
          backgroundImage: `url(${policiesBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-white/55 backdrop-blur-[1px]" aria-hidden />
        <h1 className="relative z-1 mb-5 text-4xl font-medium md:text-5xl">
          מסמכים משפטיים
        </h1>
        <Breadcrumbs
          className="relative z-1 mb-0! justify-start text-[15px] md:text-base"
          listClassName="flex-wrap gap-y-1 text-right"
          items={[
            {label: 'בית', to: '/'},
            {label: 'מסמכים משפטיים'},
          ]}
        />
      </div>

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:max-w-4xl lg:px-8 lg:py-14">
        <p className="mb-6 text-center text-base text-gray-600 sm:text-right">
          בחרו נושא כדי לקרוא את המסמך המלא.
        </p>

        <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <ul className="divide-y divide-gray-100">
            {policies.map((policy) => (
              <li key={policy.id}>
                <Link
                  to={`/policies/${policy.handle}`}
                  prefetch="intent"
                  className="flex items-center justify-between gap-4 px-5 py-4 text-right text-gray-900 transition-colors hover:bg-[var(--color-primary)]/15 sm:px-8 sm:py-5"
                >
                  <span className="min-w-0 flex-1 text-base font-medium leading-snug md:text-lg">
                    {policy.title}
                  </span>
                  <ChevronLeft
                    className="h-5 w-5 shrink-0 text-gray-400"
                    aria-hidden
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}

const POLICIES_QUERY = `#graphql
  fragment PolicyItem on ShopPolicy {
    id
    title
    handle
  }
  query Policies ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    shop {
      privacyPolicy {
        ...PolicyItem
      }
      shippingPolicy {
        ...PolicyItem
      }
      termsOfService {
        ...PolicyItem
      }
      refundPolicy {
        ...PolicyItem
      }
      subscriptionPolicy {
        id
        title
        handle
      }
    }
  }
` as const;
