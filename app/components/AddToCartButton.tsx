import {CartForm} from '@shopify/hydrogen';
import {Button} from './Button';
import {useCartFormRoute} from '~/hooks/use-cart-form-route';

export function AddToCartButton({
  analytics,
  children,
  disabled,
  lines,
  onClick,
  variant = 'artistic',
}) {
  const cartRoute = useCartFormRoute();

  return (
    <CartForm
      route={cartRoute}
      inputs={{lines}} 
      action={CartForm.ACTIONS.LinesAdd}
    >
      {(fetcher) => (
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
            disabled={disabled || fetcher.state !== 'idle'}
          >
            {fetcher.state !== 'idle' ? 'מוסיף...' : children}
          </Button>
        </>
      )}
    </CartForm>
  );
}