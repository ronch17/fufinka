import {useLoaderData} from 'react-router';
import type {Route} from './+types/about';

/* =========================
   GraphQL Query
========================= */
const ABOUT_QUERY = `#graphql
  query AboutPage($handle: String!) {
    page(handle: $handle) {
      title
      metafield(namespace: "custom", key: "sections") {
        references(first: 20) {
          nodes {
            ... on Metaobject {
              id
              type
              fields {
                key
                value
              }
            }
          }
        }
      }
    }
  }
`;

/* =========================
   Loader
========================= */
export async function loader({context}: Route.LoaderArgs) {
  const {storefront} = context;

  const data = await storefront.query(ABOUT_QUERY, {
    variables: {
      handle: 'about',
    },
  });

  return data;
}

/* =========================
   Helpers
========================= */
function mapFields(fields: any[]) {
  return Object.fromEntries(
    fields.map((f) => [f.key, f.value])
  );
}

/* =========================
   Components Mapping
========================= */
const COMPONENTS: Record<string, any> = {
  hero_section: HeroSection,
  text_block: TextBlock,
  image_with_text: ImageWithText,
};

/* =========================
   Page Component
========================= */
export default function About() {
  const data = useLoaderData();

  const sections =
    data?.page?.metafield?.references?.nodes || [];

  return (
    <div className="max-w-5xl mx-auto px-6 py-16 space-y-20">

      {sections.map((section: any) => {
        const content = mapFields(section.fields);

        const Component = COMPONENTS[section.type];

        if (!Component) return null;

        return <Component key={section.id} {...content} />;
      })}

    </div>
  );
}

/* =========================
   Sections
========================= */

function HeroSection({title, subtitle}: any) {
  return (
    <section className="text-center space-y-6">
      <h1 className="text-4xl md:text-5xl font-bold">
        {title}
      </h1>

      <p className="text-lg text-gray-600 max-w-2xl mx-auto">
        {subtitle}
      </p>
    </section>
  );
}

function TextBlock({title, content}: any) {
  return (
    <section className="space-y-4 max-w-3xl mx-auto">
      {title && (
        <h2 className="text-2xl font-semibold">
          {title}
        </h2>
      )}

      <div
        className="text-gray-700 leading-relaxed"
        dangerouslySetInnerHTML={{__html: content}}
      />
    </section>
  );
}

function ImageWithText({title, content, image}: any) {
  return (
    <section className="grid md:grid-cols-2 gap-10 items-center">

      {image && (
        <img
          src={image}
          alt={title}
          className="w-full h-auto object-cover rounded-xl"
        />
      )}

      <div className="space-y-4">
        {title && (
          <h2 className="text-2xl font-semibold">
            {title}
          </h2>
        )}

        <div
          className="text-gray-700"
          dangerouslySetInnerHTML={{__html: content}}
        />
      </div>

    </section>
  );
}