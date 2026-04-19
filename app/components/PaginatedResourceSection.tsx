import * as React from 'react';
import {Pagination} from '@shopify/hydrogen';
import { Button } from './Button';

/**
 * <PaginatedResourceSection > is a component that encapsulate how the previous and next behaviors throughout your application.
 */
export function PaginatedResourceSection<NodesType>({
  connection,
  children,
  resourcesClassName,
  /** Renders above the product grid (e.g. sort / view controls). */
  toolbar,
  /** When false, hides “load previous” (forward-only pagination). Default true. */
  showPreviousLink = true,
}: {
  connection: React.ComponentProps<typeof Pagination<NodesType>>['connection'];
  children: React.FunctionComponent<{node: NodesType; index: number}>;
  resourcesClassName?: string;
  toolbar?: React.ReactNode;
  showPreviousLink?: boolean;
}) {
  return (
    <Pagination connection={connection}>
      {({nodes, isLoading, PreviousLink, NextLink}) => {
        const resourcesMarkup = nodes.map((node, index) =>
          children({node, index}),
        );

        return (
          <div className="flex flex-[80%] flex-col gap-4">
            {showPreviousLink ? (
              <PreviousLink>
                {isLoading ? 'Loading...' : <span>↑ Load previous</span>}
              </PreviousLink>
            ) : null}
            {toolbar}
            {resourcesClassName ? (
              <div className={resourcesClassName}>{resourcesMarkup}</div>
            ) : (
              resourcesMarkup
            )}
            <NextLink className="flex justify-center">
              {isLoading ? 'Loading...' : <Button variant="artistic" size="lg">עוד מוצרים</Button>}
            </NextLink>
          </div>
        );
      }}
    </Pagination>
  );
}
