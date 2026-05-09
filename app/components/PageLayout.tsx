import {Link, useFetcher} from 'react-router';
import {useEffect, useId} from 'react';
import type {
  CartApiQueryFragment,
  FooterQuery,
  HeaderQuery,
} from 'storefrontapi.generated';
import {Aside} from '~/components/Aside';
import {Footer} from '~/components/Footer';
import {Header, HeaderMenu} from '~/components/Header'; 
import {CartMain} from '~/components/CartMain';
import {
  SEARCH_ENDPOINT,
  SearchFormPredictive,
} from '~/components/SearchFormPredictive';
import {SearchResultsPredictive} from '~/components/SearchResultsPredictive';
import type {PredictiveSearchReturn} from '~/lib/search';
import {Button} from './Button';
import { Loader2 } from 'lucide-react';



interface PageLayoutProps {
  cart: CartApiQueryFragment | null;
  footer: Promise<FooterQuery | null>;
  header: HeaderQuery;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
  footerContact: Promise<any>;
  children?: React.ReactNode;
}

export function PageLayout({
  cart,
  children = null,
  footer,
  header,
  isLoggedIn,
  publicStoreDomain,
  footerContact,
}: PageLayoutProps) {
  return (
    <Aside.Provider>
      <CartAside cart={cart} />
      <SearchAside />
      <MobileMenuAside header={header} publicStoreDomain={publicStoreDomain} />
      {header && (
        <Header
          header={header}
          isLoggedIn={isLoggedIn}
          publicStoreDomain={publicStoreDomain}
        />
      )}
      <main>{children}</main>
      <Footer
        footer={footer}
        footerContact={footerContact}
        header={header}
        publicStoreDomain={publicStoreDomain}
      />
    </Aside.Provider>
  );
}

function CartAside({cart}: {cart: PageLayoutProps['cart']}) {
  return (
    <Aside type="cart" heading="עגלת קניות">
      <CartMain cart={cart} layout="aside" />
    </Aside>
  );
}

function SearchAside() {
  const fetcher = useFetcher<PredictiveSearchReturn>({key: 'predictive-search'});
  const queriesDatalistId = useId();
  // useEffect(() => {
  //   console.log('fetcher:', fetcher);
  // }, [fetcher]);

  return (
    <Aside type="search" heading="חיפוש">
      <div className="predictive-search" >
        <SearchFormPredictive className=' mb-8' fetcher={fetcher}>
          {({fetchResults, goToSearch, inputRef}) => (
            <>
                          <label className="input input-primary" htmlFor="search">
  <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <g
      strokeLinejoin="round"
      strokeLinecap="round"
      strokeWidth="2.5"
      fill="none"
      stroke="currentColor"
    >
      <circle cx="11" cy="11" r="8"></circle>
      <path d="m21 21-4.3-4.3"></path>
    </g>
  </svg>
              <input
                name="q"
                onChange={fetchResults}
                onFocus={fetchResults}
                ref={inputRef}
                type="search"
                placeholder="חפשו מוצר..."
                list={queriesDatalistId}
              
              />
              </label>


              {/* <button onClick={goToSearch}>חיפוש</button> */}


            </>

          )}
        </SearchFormPredictive>

        <SearchResultsPredictive fetcher={fetcher}>
          {({items, total, term, state, closeSearch}) => {
            const {articles, collections, pages, products, queries} = items;

            if (state === 'loading' && term.current) {
              return <div className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin text-primary text-2xl " /> טוען תוצאות...</div>;
            }

            if (!total) {
              return <SearchResultsPredictive.Empty term={term} />;
            }

            return (
              <>
                <SearchResultsPredictive.Queries
                  queries={queries}
                  queriesDatalistId={queriesDatalistId}
                />
                <SearchResultsPredictive.Products
                  products={products}
                  closeSearch={closeSearch}
                  term={term}
                />
                <SearchResultsPredictive.Collections
                  collections={collections}
                  closeSearch={closeSearch}
                  term={term}
                />
                <SearchResultsPredictive.Pages
                  pages={pages}
                  closeSearch={closeSearch}
                  term={term}
                />
                <SearchResultsPredictive.Articles
                  articles={articles}
                  closeSearch={closeSearch}
                  term={term}
                />
                {term.current && total ? (
                  <Link
                    onClick={closeSearch}
                    to={`${SEARCH_ENDPOINT}?q=${term.current}`}
                  >
                    <Button variant="artistic">
                      הצג את כל התוצאות עבור <q>{term.current}</q>
                    </Button>
                  </Link>
                ) : null}
              </>
            );
          }}
        </SearchResultsPredictive>
      </div>
    </Aside>
  );
}

function MobileMenuAside({
  header,
  publicStoreDomain,
}: {
  header: PageLayoutProps['header'];
  publicStoreDomain: PageLayoutProps['publicStoreDomain'];
}) {
  return (
    header.menu &&
    header.shop.primaryDomain?.url && (
      <Aside type="mobile" heading="תפריט">
        <HeaderMenu
          menu={header.menu}
          viewport="mobile"
          primaryDomainUrl={header.shop.primaryDomain.url}
          publicStoreDomain={publicStoreDomain}
        />
      </Aside>
    )
  );
}
