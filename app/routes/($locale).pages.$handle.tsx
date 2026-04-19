import {useLoaderData} from 'react-router';
import type {Route} from './+types/pages.$handle';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import { Breadcrumbs } from '~/components/Breadcrumb';
import { ImageWithText } from '~/components/about/image-with-text/ImageWithText';
import { Video, RichText, Image } from '@shopify/hydrogen';
import { MailIcon, PhoneIcon, Quote, QuoteIcon } from 'lucide-react';
import { ProductItem } from '~/components/ProductItem';
import { Button } from '~/components/Button';
import { AddToCartButton } from '~/components/AddToCartButton';
import { useAside } from '~/components/Aside';
import { Testimonials } from '~/components/Testimonials';
import { ImageCarousel } from '~/components/ImageCarousel';
import { ContactForm } from '~/components/ContactForm';

export const meta: Route.MetaFunction = ({data}) => {
  return [{title: `Fufinka | ${data?.page.title ?? ''}`}];
};

export async function loader(args: Route.LoaderArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context, request, params}: Route.LoaderArgs) {
  if (!params.handle) {
    throw new Error('Missing page handle');
  }

  const [{page}, {products}] = await Promise.all([
    context.storefront.query(PAGE_QUERY, {
      variables: {
        handle: params.handle,
      },
    }),
    context.storefront.query(WORKSHOPS_QUERY, {
      variables: {
        country: context.storefront.country,
        language: context.storefront.language,
      },
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!page) {
    throw new Response('Not Found', {status: 404});
  }

  redirectIfHandleIsLocalized(request, {handle: params.handle, data: page});

  return {
    page,
    products,
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

function mapFields(fields: any[]) {
  return Object.fromEntries(
    fields.map((f) => [
      f.key,
      f.reference?.image?.url || f.value
    ])
  );
}

function AboutPage({page}: any) {
  const imageWithText = page.imageWithText.reference.fields;

  const imageWithTextData = mapFields(imageWithText);


const videoRef = page.video?.reference;
const videoUrl = videoRef?.sources?.find(
  (s) => s.mimeType === 'video/mp4'
)?.url;

const cvTextFields = page.cvText?.reference?.fields || [];

const cvTitleField = cvTextFields.find((f) => f.key === 'title');
const cvTextField = cvTextFields.find((f) => f.key === 'text');

const quoteFields = page.quoteParagraph?.reference?.fields || [];

const quoteData = mapFields(quoteFields);

const imageWithText2Fields = page.imageWithText2?.reference?.fields || [];

const imageWithText2Data = mapFields(imageWithText2Fields);


  return (
    <div className="overflow-hidden">

      <ImageWithText
        className='px-10 '
        image={imageWithTextData.image}
        title={imageWithTextData.title}
        text={ imageWithTextData.text }
        buttonText="אני רוצה להרשם"
        buttonLink="/"
      />

   <section className="relative h-[70vh] overflow-hidden my-20">
<Video
  data={videoRef}
  className="absolute inset-0 w-full h-full object-cover"
  autoPlay
  muted
  loop
  playsInline
/>

  <div className="absolute inset-0 bg-black/40 pointer-events-none" />

</section>

    <section className="max-w-4xl mx-auto px-3 py-16 space-y-6">

      {cvTitleField?.value && (
        <h2 className="text-3xl font-medium">
          {cvTitleField?.value}
        </h2>
      )}

      {cvTextField?.value && (
        <RichText data={cvTextField?.value} />
      )}

    </section>

    <section className="mx-auto px-3 text-center py-16 space-y-6 bg-[#D9A7B1] flex flex-col items-center justify-center overflow-hidden">

      <QuoteIcon className="w-10 h-10 mx-auto text-black bg-white  rounded-full p-2" />
      {quoteData.title && (
        <h2 className="text-3xl font-medium text-white">
          {quoteData.title}
        </h2>
      )}

      {quoteData.text && (
        <RichText data={quoteData.text} className="text-2xl text-white text-right" />
      )}

      {quoteData.author_name && (
        <p className="text-lg font-medium text-black bg-white rounded-full p-5 h-20 w-20 mx-auto flex items-center justify-center">
          {quoteData.author_name}
        </p>
      )}
    </section>

    <section className="mx-auto px-3 py-16 space-y-6">
      <ImageWithText
        image={imageWithText2Data.image}
        title={imageWithText2Data.title}
        text={imageWithText2Data.text}
        buttonText="אני רוצה להרשם"
        buttonLink="/"
        imagePosition="right"
      />
    </section>

    </div>
  );
}

function Workshops({page, products}: any) {
  const {open} = useAside();
  const titleAndTextFields = page.titleAndText?.reference?.fields || [];

  const titleAndTextData = mapFields(titleAndTextFields);

  const imagesFields = page.images?.references?.nodes || [];

  const testimonialsFields = page.testimonials?.references?.nodes || [];

  const imageCarouselFields = page.imageCarousel?.references?.nodes || [];

  return (
    <>
    <section className="mx-auto px-3 py-16 space-y-6 max-w-[960px]">  
        <h2 className="text-3xl font-medium">{titleAndTextData.title}</h2>
        <RichText data={titleAndTextData.text} />
    </section>

    <section className="mx-auto px-3 py-16 space-y-6 flex flex-col items-center justify-center max-w-[1300px]">
      {imagesFields.map((image) => (
        <Image data={image.image} alt={image.image.altText} width={image.image.width} height={image.image.height} key={image.image.id} className="w-full" />
      ))}
    </section>

    <section className="mx-auto px-3 py-16 space-y-6 max-w-[960px]">
       <h2 className="text-3xl font-medium text-center mb-10">בחרו את סוג הסדנה בה תרצו להשתתף
</h2>
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {products?.nodes.map((product: WorkshopProduct) => (
        product.title === 'חיזוק שרירי היצירה' ? <div key={product.id} className="col-span-2 text-center"> <ProductItem key={product.id} product={product} /> <AddToCartButton lines={[
          {
            merchandiseId: product.id,
            quantity: 1,
          },
          ]} variant="artistic" onClick={() => open('cart')}

>מחלום להוויה</AddToCartButton> </div> : <ProductItem key={product.id} product={product} />

      ))}
      </div>
    </section>

      <section className="mx-auto py-16 space-y-6 ">
        <Testimonials testimonials={testimonialsFields} />
      </section>

      <section className="mx-auto px-3 py-16 space-y-6 ">
        <ImageCarousel media={imageCarouselFields} />
      </section>

      <section className="mx-auto px-3 py-16 space-y-6 ">
        <ContactForm />
      </section>
    </>
  )
}

export default function Page() {
  const {page, products} = useLoaderData<typeof loader>();

  return (
    <div className="page">
      <header>
        <div className="h-64 flex flex-col items-center justify-center text-black" style={{backgroundImage: `url(${page.pageTitleBg?.reference?.image?.url})`, backgroundSize: 'cover'}}>
          <h1 className='text-4xl font-medium md:text-5xl mb-5'>{page.title}</h1>

      <Breadcrumbs
          className='text-black text-2xl font-medium'
            items={[
              {label: 'בית', to: '/'},
              {label: page.title},
            ]}
          />
        </div>

      </header>

      {page.handle === 'אודות' && ( 
        <AboutPage page={page} />
      )}

      {page.handle === 'ליווי-יצירתי' && (
       <Workshops page={page} products={products} />
)}

      {page.handle === 'צרו-קשר' && (
        <section className="mx-auto px-3 py-16 space-y-6 ">
          <div className="grid grid-cols-1 md:grid-cols-2 max-md:gap-10 gap-1 justify-center items-center ">
            <div className="text-center flex flex-col items-center justify-center gap-5">
            <h1 className="text-4xl font-medium mb-5">סטודיו פופינקה, תל אביב</h1>
            <div className="flex flex-row gap-2 items-center justify-center w-fit cursor-pointer hover:text-[var(--color-primary)] transition-all duration-300">
            <PhoneIcon className="w-10 h-10 mx-auto text-black bg-[var(--color-primary)] rounded-full p-2 " />
            <a href="tel:0549215445" className="text-2xl font-medium">054-9215445</a>
            </div>
            <div className="flex flex-row gap-2 items-center justify-center w-fit cursor-pointer hover:text-[var(--color-primary)] transition-all duration-300">
            <MailIcon className="w-10 h-10 mx-auto text-black bg-[var(--color-primary)] rounded-full p-2 " />
            <a href="mailto:Dafnalonap@gmail.com" className="text-2xl font-medium">Dafnalonap@gmail.com</a>
            </div>
            
            </div>
            <div>
          <ContactForm />
          </div>
          </div>
          
        </section>
  
      )}

      <main dangerouslySetInnerHTML={{__html: page.body}} />
    </div>
  );
}

const PAGE_QUERY = `#graphql
  query Page(
    $language: LanguageCode,
    $country: CountryCode,
    $handle: String!
  )
  @inContext(language: $language, country: $country) {
    page(handle: $handle) {
      handle
      title
      body

      pageTitleBg: metafield(namespace: "custom", key: "page_title_background") {
        reference {
          ... on MediaImage {
            image {
              url
              altText
            }
          }
        }
      }

      imageWithText: metafield(namespace: "custom", key: "image_with_text") {
        reference {
          ... on Metaobject {
            type
            fields {
              key
              value
              reference {
                ... on MediaImage {
                  image {
                    url
                    altText
                  }
                }
              }
            }
          }
        }
      }

      video: metafield(namespace: "custom", key: "video") {
        reference {
          ... on Video {
                      id
            sources {
              url
              mimeType
            }
            previewImage {
              url
            }
          }
        }
      }

      cvText: metafield(namespace: "custom", key: "cv_text") {
        reference {
          ... on Metaobject {
            fields {
              key
              value
            }
          }
        }
      }
      quoteParagraph: metafield(namespace: "custom", key: "quote_paragraph") {
        reference {
          ... on Metaobject {
            fields {
              key
              value
            }
          }
        }
      }

        imageWithText2: metafield(namespace: "custom", key: "image_with_text2") {
        reference {
          ... on Metaobject {
            type
            fields {
              key
              value
              reference {
                ... on MediaImage {
                  image {
                    url
                    altText
                  }
                }
              }
            }
          }
        }
      }

      titleAndText: metafield(namespace: "custom", key: "title_and_text") {
          reference {
            ... on Metaobject {
              type
              fields {
                key
                value
              }
            }
          }
        }

        images: metafield(namespace: "custom", key: "image") {
        references(first: 10) {
          nodes {
            __typename
            ... on MediaImage {
              image {
                url
                altText
                width
                height
              }
            }
          }
        }
      }
        testimonials: metafield(namespace: "custom", key: "testimonials") {
        references(first: 10) {
          nodes {
            ... on Metaobject {
              id
              type

              fields {
                key
                value
                reference {
                  ... on MediaImage {
                    image {
                      url
                      altText
                      width
                      height
                    }
                  }
                }
              }
            }
          }
        }
      }
        imageCarousel: metafield(namespace: "custom", key: "image_carousel") {
          references(first: 40) {
            nodes {
              __typename
              ... on MediaImage {
                image {
                  url
                  altText
                  width
                  height
                }
              }
            }
          }
        }
    }
  }
`;


const WORKSHOPS_QUERY = `#graphql
query WorkshopsProducts(
  $country: CountryCode
  $language: LanguageCode
) @inContext(country: $country, language: $language) {
  products(first: 10, query: "tag:סדנאות") {
  nodes {
    id
    title
    handle
    availableForSale

    featuredImage {
      url
      altText
    }

    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }

    variants(first: 1) {
      nodes {
        id
      }
    }
  }
}
}`;