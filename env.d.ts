/// <reference types="vite/client" />
/// <reference types="react-router" />
/// <reference types="@shopify/oxygen-workers-types" />
/// <reference types="@shopify/hydrogen/react-router-types" />

// Enhance TypeScript's built-in typings.
import '@total-typescript/ts-reset';

/** משתני סביבה נוספים לטופס יצירת קשר (Resend, reCAPTCHA, Shopify Admin) */
declare global {
  interface Env {
    RESEND_API_KEY?: string;
    RESEND_FROM_EMAIL?: string;
    CONTACT_OWNER_EMAIL?: string;
    RECAPTCHA_SECRET_KEY?: string;
    PUBLIC_RECAPTCHA_SITE_KEY?: string;
    SHOPIFY_ADMIN_ACCESS_TOKEN?: string;
    SHOPIFY_ADMIN_API_VERSION?: string;
  }
}
