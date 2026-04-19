export const FEATURED_COLLECTIONS_GALLERY_QUERY = `#graphql
  fragment GalleryProduct on Product {
    id
    handle
    title
    featuredImage {
      id
      url
      altText
      width
      height
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    selectedOrFirstAvailableVariant {
      id
      availableForSale
    }
  }
  fragment GalleryCollection on Collection {
    id
    title
    handle
    products(first: 5) {
      nodes {
        ...GalleryProduct
      }
    }
  }
  query FeaturedCollectionsGallery($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 10, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...GalleryCollection
      }
    }
  }
`;

export const HOMEPAGE_QUERY = `#graphql
  query Homepage($language: LanguageCode, $country: CountryCode)
  @inContext(language: $language, country: $country) {
    metaobject(handle: {type: "homepage", handle: "homepage-slides"}) {
      id
      type
      fields {
        key
        value

        reference {
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

        references(first: 20) {
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
    }
  }
`;
