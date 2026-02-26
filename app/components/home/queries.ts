import {graphql} from 'graphql';

export const HOMEPAGE_QUERY = `#graphql
  query Homepage($language: LanguageCode, $country: CountryCode)
  @inContext(language: $language, country: $country) {
    metaobject(handle: {type: "homepage", handle: "homepage-slides"}) {
      fields {
        key
        references(first: 10) {
          nodes {
            ... on Metaobject {
              id
              fields {
                key
                value
                reference {
                  ... on MediaImage {
                    image {
                      url
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
