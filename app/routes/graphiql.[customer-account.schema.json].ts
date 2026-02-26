import customerAccountSchema from '@shopify/hydrogen/customer-account.schema.json';

/**
 * Serves the Customer Account API schema for GraphiQL.
 * This route ensures the schema is available when the GraphiQL loader fetches it,
 * preventing "Unexpected token '<'" errors when the Vite middleware doesn't serve it.
 */
export async function loader() {
  return new Response(JSON.stringify(customerAccountSchema), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
