import { SearchFormPredictive } from "./SearchFormPredictive";
import { SearchResultsPredictive } from "./SearchResultsPredictive";
import { Aside } from "./Aside";
import { useFetcher } from "react-router";
import type { PredictiveSearchReturn } from "~/lib/search";
import { useId } from "react";
import {Loader2 } from 'lucide-react';
import { useEffect } from "react";

export function SearchAside() {
  const fetcher = useFetcher<PredictiveSearchReturn>(); 
  const queriesDatalistId = useId();

  useEffect(() => {
  console.log('FETCHER DATA:', fetcher.data);
}, [fetcher.data]);
  return (
    <Aside type="search" heading="SEARCH">
      <div className="predictive-search">

        <SearchFormPredictive fetcher={fetcher}>
          {({fetchResults, goToSearch, inputRef}) => (
            <>
              <input
                name="q"
                type="search"
                onChange={fetchResults}
                onFocus={fetchResults}
                ref={inputRef}
              />
              <button onClick={goToSearch}>Search</button>
            </>
          )}
        </SearchFormPredictive>

       <SearchResultsPredictive fetcher={fetcher}>
  {({items, total, term, state, closeSearch}) => {
    const {products} = items;

    if (state === 'loading' && term.current) {
      return <div><Loader2 className="w-4 h-4" /> Loading...</div>;
    }

    if (!products.length && term.current) {
      return <p>No results for "{term.current}"</p>;
    }

    return (
      <div className="predictive-results">
        {products.map((product) => (
          <div key={product.id} className="item">
            <a
              href={`/products/${product.handle}`}
              onClick={closeSearch}
            >
              <p>{product.title}</p>
            </a>
          </div>
        ))}
      </div>
    );
  }}
</SearchResultsPredictive>

      </div>
    </Aside>
  );
}