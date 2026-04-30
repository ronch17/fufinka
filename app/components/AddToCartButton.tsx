import {type FetcherWithComponents, useRevalidator} from 'react-router';
import {CartForm} from '@shopify/hydrogen';
import {useEffect} from 'react';
import { Button } from './Button';

export function AddToCartButton({
  analytics,
  children,
  disabled,
  lines,
  onClick,
  variant = 'artistic',
}) {
  const revalidator = useRevalidator();

  return (
    <CartForm fetcherKey="cart" route="/cart" inputs={{lines}} action={CartForm.ACTIONS.LinesAdd}>
      {(fetcher: FetcherWithComponents<any>) => {
        
        // 👇 זה הקסם
        useEffect(() => {
          if (fetcher.state === 'idle' && fetcher.data) {
            revalidator.revalidate();
          }
        }, [fetcher.state]);

        return (
          <>
            <input
              name="analytics"
              type="hidden"
              value={JSON.stringify(analytics)}
            />
            <Button
              variant={variant}
              size="lg"
              type="submit"
              onClick={onClick}
              disabled={disabled ?? fetcher.state !== 'idle'}
            >
              {children}
            </Button>
          </>
        );
      }}
    </CartForm>
  );
}