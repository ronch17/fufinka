import {useCallback, useEffect, useState} from 'react';
import {useRouteLoaderData} from 'react-router';
import {useNonce} from '@shopify/hydrogen';
import {Button} from '~/components/Button';

const fieldClassName =
  'w-full rounded-md border border-neutral-200 bg-white px-4 py-3.5 text-neutral-900 ' +
  'shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-300 ' +
  'placeholder:text-neutral-400 ' +
  'focus:border-neutral-800/45 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#eb7025]/20';

const labelClassName =
  'mb-1.5 block text-sm font-medium tracking-wide text-neutral-700';

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, opts: {action: string}) => Promise<string>;
    };
  }
}

export function ContactForm() {
  const nonce = useNonce();
  const root = useRouteLoaderData('root') as
    | {recaptchaSiteKey?: string | null}
    | undefined;
  const siteKey = root?.recaptchaSiteKey ?? null;

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!siteKey) return;
    const scriptId = 'recaptcha-v3-script';
    if (document.getElementById(scriptId)) return;

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`;
    script.async = true;
    if (nonce) script.setAttribute('nonce', nonce);
    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, [siteKey, nonce]);

  const getRecaptchaToken = useCallback(async (): Promise<string> => {
    if (!siteKey) return '';
    const g = window.grecaptcha;
    if (!g) return '';
    return new Promise((resolve) => {
      g.ready(() => {
        void g
          .execute(siteKey, {action: 'contact'})
          .then((t) => resolve(t))
          .catch(() => resolve(''));
      });
    });
  }, [siteKey]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const token = await getRecaptchaToken();
    formData.set('recaptchaToken', token);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        body: formData,
      });

      const json = (await res.json().catch(() => null)) as {
        ok?: boolean;
        message?: string;
      } | null;

      if (!res.ok || !json?.ok) {
        setError(json?.message ?? 'משהו השתבש — נסו שוב בעוד רגע.');
        return;
      }
      console.log(json);

      setSuccess(true);
      e.currentTarget.reset();
    } catch {
      setError('משהו השתבש — נסו שוב בעוד רגע.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl" dir="rtl">
      <form
        onSubmit={(ev) => {
          void handleSubmit(ev);
        }}
        className={
          'relative overflow-hidden rounded-lg border border-neutral-900/80 ' +
          'bg-linear-to-b from-stone-50/90 to-white p-8 shadow-[6px_6px_0_0_rgba(23,23,23,0.07)] ' +
          'md:p-10'
        }
        noValidate
      >
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#eb7025]/6"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-12 -left-10 h-32 w-32 rounded-full bg-[#b4c780]/12"
          aria-hidden
        />

        <div className="relative space-y-8">
          <header className="space-y-3 text-center">
            <div className="mx-auto h-px w-14 bg-[#b4c780]" />
            <h2 className="text-2xl font-semibold tracking-wide text-neutral-900 md:text-3xl">
              יצירת קשר
            </h2>
            <p className="text-sm leading-relaxed text-neutral-600">
              השאירו פרטים — נחזור אליכם בהקדם.
            </p>
          </header>

          {/* honeypot — בוטים ממלאים; שרת דוחה אם לא ריק */}
          <input
            type="text"
            name="company"
            tabIndex={-1}
            autoComplete="off"
            className="pointer-events-none absolute left-0 top-0 h-px w-px opacity-0"
            aria-hidden
          />

          <div className="space-y-5">
            <div>
              <label htmlFor="contact-name" className={labelClassName}>
                שם
              </label>
              <input
                id="contact-name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="השם שלכם"
                required
                maxLength={120}
                className={fieldClassName}
              />
            </div>

            <div>
              <label htmlFor="contact-email" className={labelClassName}>
                אימייל
              </label>
              <input
                id="contact-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
                maxLength={254}
                className={fieldClassName}
                dir="rtl"
              />
            </div>

            <div>
              <label htmlFor="contact-message" className={labelClassName}>
                הודעה
              </label>
              <textarea
                id="contact-message"
                name="message"
                placeholder="מה תרצו לשתף?"
                rows={5}
                maxLength={5000}
                className={`${fieldClassName} min-h-34 resize-y`}
              />
            </div>
          </div>

          <div className="pt-1">
            <Button
              type="submit"
              variant="artistic"
              size="lg"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'שולחים…' : 'שליחת הודעה'}
            </Button>
          </div>

          <div className="space-y-2 text-center text-sm" aria-live="polite">
            {success && (
              <p className="rounded-md border border-emerald-200/80 bg-emerald-50/90 py-3 text-emerald-900">
                ההודעה נשלחה — תודה שפניתם אלינו.
              </p>
            )}
            {error && (
              <p className="rounded-md border border-red-200/90 bg-red-50/90 py-3 text-red-900">
                {error}
              </p>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
