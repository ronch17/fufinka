import * as React from 'react';
import {Facebook, Linkedin, Link2, MessageCircle} from 'lucide-react';

export type ProductSocialShareProps = {
  /** URL מלא לשיתוף (כולל דומיין ו-locale אם רלוונטי) */
  url: string;
  title: string;
  className?: string;
};

/**
 * כפתורי שיתוף בסיסיים: פייסבוק, X, וואטסאפ, לינקדאין, העתקת קישור.
 */
export function ProductSocialShare({
  url,
  title,
  className = '',
}: ProductSocialShareProps) {
  const [copied, setCopied] = React.useState(false);

  const encodedUrl = encodeURIComponent(url);
  const text = encodeURIComponent(title);

  const links = [
    {
      name: 'Facebook',
      label: 'פייסבוק',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: Facebook,
    },
    {
      name: 'X',
      label: 'X',
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${text}`,
      icon: null,
    },
    {
      name: 'WhatsApp',
      label: 'וואטסאפ',
      href: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
      icon: MessageCircle,
    },
    {
      name: 'LinkedIn',
      label: 'לינקדאין',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      icon: Linkedin,
    },
  ] as const;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <section
      className={`mt-8 border-t border-gray-200 pt-6 ${className}`}
      aria-labelledby="product-share-heading"
    >
      <h2
        id="product-share-heading"
        className="mb-3 text-lg font-semibold text-gray-900"
      >
        שיתוף
      </h2>
      <div className="flex flex-wrap items-center gap-2">
        {links.map(({name, label, href, icon: Icon}) => (
          <a
            key={name}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
          >
            {Icon ? (
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
            ) : (
              <span className="w-4 text-center text-xs font-bold" aria-hidden>
                X
              </span>
            )}
            <span>{label}</span>
          </a>
        ))}
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
        >
          <Link2 className="h-4 w-4 shrink-0" aria-hidden />
          {copied ? 'הקישור הועתק' : 'העתק קישור'}
        </button>
      </div>
    </section>
  );
}
