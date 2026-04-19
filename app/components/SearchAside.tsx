import { SearchFormPredictive } from "./SearchFormPredictive";
import { SearchResultsPredictive } from "./SearchResultsPredictive";
import { Aside } from "./Aside";
import { useFetcher } from "react-router";
import type { PredictiveSearchReturn } from "~/lib/search";
import { useId } from "react";

function SearchAside() {
  const fetcher = useFetcher<PredictiveSearchReturn>(); // 👈 כאן
  const queriesDatalistId = useId();

  return (
    <Aside type="search" heading="SEARCH">
      <div className="predictive-search">

        <SearchFormPredictive fetcher={fetcher}>
          {({fetchResults, goToSearch, inputRef}) => (
            <>
              <input
                name="q"
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
      return <div>Loading...</div>;
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