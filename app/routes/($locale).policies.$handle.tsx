import {useLoaderData} from 'react-router';
import type {Route} from './+types/policies.$handle';
import {type Shop} from '@shopify/hydrogen/storefront-api-types';
import {Breadcrumbs} from '~/components/Breadcrumb';
import policiesBg from '~/assets/policies.jpeg';

type SelectedPolicies = keyof Pick<
  Shop,
  'privacyPolicy' | 'shippingPolicy' | 'termsOfService' | 'refundPolicy'
>;

export const meta: Route.MetaFunction = ({data}) => {
  return [{title: `Fufinka | ${data?.policy.title ?? 'מדיניות'}`}];
};

export async function loader({params, context}: Route.LoaderArgs) {
  if (!params.handle) {
    throw new Response('No handle was passed in', {status: 404});
  }

  const policyName = params.handle.replace(
    /-([a-z])/g,
    (_: unknown, m1: string) => m1.toUpperCase(),
  ) as SelectedPolicies;

  const data = await context.storefront.query(POLICY_CONTENT_QUERY, {
    variables: {
      privacyPolicy: false,
      shippingPolicy: false,
      termsOfService: false,
      refundPolicy: false,
      [policyName]: true,
      language: context.storefront.i18n?.language,
    },
  });

  const policy = data.shop?.[policyName];

  if (!policy) {
    throw new Response('Could not find the policy', {status: 404});
  }

  return {policy};
}

export default function Policy() {
  const {policy} = useLoaderData<typeof loader>();

  return (
    <main className="policy-page bg-[var(--color-primary)]/10 min-h-[60vh]">
 
       
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
            {label: 'מסמכים משפטיים', to: '/policies'},
            {label: policy.title},
          ]}
        />
      </div>
     <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:max-w-4xl lg:px-8 lg:py-14">
      

        <article
          className="policy-html rounded-2xl border border-gray-200/80 bg-white px-5 py-8 shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:px-8 sm:py-10 md:px-12 md:py-12"
          dangerouslySetInnerHTML={{__html: policy.body}}
        />
      </div>
    </main>
  );
}

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/Shop
const POLICY_CONTENT_QUERY = `#graphql
  fragment Policy on ShopPolicy {
    body
    handle
    id
    title
    url
  }
  query Policy(
    $country: CountryCode
    $language: LanguageCode
    $privacyPolicy: Boolean!
    $refundPolicy: Boolean!
    $shippingPolicy: Boolean!
    $termsOfService: Boolean!
  ) @inContext(language: $language, country: $country) {
    shop {
      privacyPolicy @include(if: $privacyPolicy) {
        ...Policy
      }
      shippingPolicy @include(if: $shippingPolicy) {
        ...Policy
      }
      termsOfService @include(if: $termsOfService) {
        ...Policy
      }
      refundPolicy @include(if: $refundPolicy) {
        ...Policy
      }
    }
  }
` as const;
