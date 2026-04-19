import type { FeaturedCollectionFragment } from "storefrontapi.generated";
import { Link } from "react-router";
import { Image } from "@shopify/hydrogen";
export function FeaturedCollections({
  collections,
}: {
  collections: FeaturedCollectionFragment[];
}) {
  if (!collections) return null;
  const image = collections?.image;
  return (
<section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 justify-items-center bg-[#D9A7B1] min-h-50 py-10">
  {collections.map((collection) => (
          <Link
            key={collection.id}
            to={`/collections/${collection.handle}`}
            className="group block px-5"
          >
                   <h3 className="mt-4 text-2xl font-semibold text-center mb-4">
              {collection.title}
            </h3>
            {collection.image && (
              <div className="overflow-hidden rounded-lg">
                <Image
                  data={collection.image}
                  sizes="100vw"
                  className="group-hover:scale-105 transition duration-300"
                
                  aspectRatio="1/1"
                />
              </div>
            )}
     
          </Link>
        ))}
</section>
  );
}