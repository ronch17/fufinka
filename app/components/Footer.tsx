import {Suspense} from 'react';
import {Await, NavLink, Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import type {
  FooterContactQuery,
  FooterQuery,
  HeaderQuery,
} from 'storefrontapi.generated';
import { FacebookIcon, InstagramIcon, YoutubeIcon } from 'lucide-react';
import { Whatsapp } from './Whatsapp';

interface FooterProps {
  footer: Promise<FooterQuery | null>;
  footerContact: Promise<FooterContactQuery | null>;
  header: HeaderQuery;
  publicStoreDomain: string;
  /** טלפון ליצירת קשר (אופציונלי) */
  phone?: string;
  /** אימייל ליצירת קשר (אופציונלי) */
  email?: string;
  /** קישורי רשתות חברתיות (אופציונלי) */
  socialLinks?: Array<{url: string; label: string}>;
}

function formatUrl(
  itemUrl: string,
  primaryDomainUrl: string,
  publicStoreDomain: string
) {
  if (
    itemUrl.includes('myshopify.com') ||
    itemUrl.includes(publicStoreDomain) ||
    itemUrl.includes(primaryDomainUrl)
  ) {
    return new URL(itemUrl).pathname;
  }
  return itemUrl;
}


export function Footer({
  footer: footerPromise,
  footerContact: footerContactPromise,
  header,
  publicStoreDomain,
  phone: phoneProp,
  email: emailProp,
  socialLinks: _socialLinks = [],
}: FooterProps) {
  const primaryDomainUrl = header.shop.primaryDomain?.url ?? '';

  return (
    <Suspense>
      <Await resolve={footerPromise}>
        {(footer: FooterQuery | null) => (
          <Await resolve={footerContactPromise}>
            {(contact: FooterContactQuery | null) => {
              const fields = contact?.metaobject?.fields ?? [];

              const contactData = Object.fromEntries(
                fields.map((field) => [field.key, field.value]),
              );

              const displayEmail = contactData.email ?? emailProp ?? '';
              const displayPhone = contactData.phone ?? phoneProp ?? '';
              const displayName = contactData.name ?? '';

              const socialIconLinks = [
                {key: 'facebook', label: 'Facebook', icon: <FacebookIcon />},
                {
                  key: 'instagram',
                  label: 'Instagram',
                  icon: <InstagramIcon />,
                },
                {key: 'youtube', label: 'YouTube', icon: <YoutubeIcon />},
              ].filter((item) => contactData[item.key]);

              return (
                <footer className="footer bg-[#f5f5f5] text-black pt-2 md:pt-16 md:pb-6">
            <div className="footer-columns">
              {/* עמודה 1: תמונה, טלפון, אימייל, סושיאל מדיה */}
              <div className="footer-column">
                <div className="footer-brand">
                  {header.shop.brand?.logo?.image && (
                    <Link to="/" prefetch="intent">
                      <Image
                        data={header.shop.brand.logo.image}
                        alt={header.shop.name}
                        width={70}
                        height="auto"
                        className="mix-blend-multiply"
                      />
       
                    </Link>
                  )}
                  {displayName && (
                    <h4 className="footer-heading">{displayName}</h4>
                  )}
                </div>
                {displayPhone && (
                  <a href={`tel:${displayPhone}`} className="footer-contact">
                    {displayPhone}
                  </a>
                )}
                {displayEmail && (
                  <a
                    href={`mailto:${displayEmail}`}
                    className="footer-contact footer-contact-email border-b border-[rgb(249,212,189)] w-fit transition-all duration-300"
                  >
                    {displayEmail}
                  </a>
                )}
                {socialIconLinks.length > 0 && (
                  <div className="footer-social flex gap-2 max-md:justify-center">
                    {socialIconLinks.map((link) => (
                      <a
                        key={link.key}
                        href={contactData[link.key] ?? '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="footer-social-link hover:scale-110 transition-all duration-300"
                      >
                        {link.icon}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* עמודה 2: מפת האתר (כמו nav bar) */}
              <div className="footer-column">
                <h4 className="footer-heading">מפת האתר</h4>
                <nav className="footer-nav" role="navigation">
                  {(header.menu || FALLBACK_HEADER_MENU).items.map((item) => {
                    if (!item.url) return null;
                    const url = formatUrl(
                      item.url,
                      primaryDomainUrl,
                      publicStoreDomain
                    );
                    const isExternal = !url.startsWith('/');
                    return isExternal ? (
                      <a
                        href={url}
                        key={item.id}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        {item.title}
                      </a>
                    ) : (
                      <NavLink
                        end
                        key={item.id}
                        prefetch="intent"
                        to={url}
                      >
                        {item.title}
                      </NavLink>
                    );
                  })}
                </nav>
              </div>

              {/* עמודה 3: קטגוריות מוצרים */}
              <div className="footer-column">
                <h4 className="footer-heading">קטגוריות</h4>
                <nav className="footer-nav" role="navigation">
                  {footer?.collections?.nodes?.length ? (
                    footer.collections.nodes.map((collection) => (
                      <Link
                        key={collection.id}
                        to={`/collections/${collection.handle}`}
                        prefetch="intent"
                      >
                        {collection.title}
                      </Link>
                    ))
                  ) : (
                    <Link to="/collections" prefetch="intent">
                      כל הקטגוריות
                    </Link>
                  )}
                </nav>
              </div>

              {/* עמודה 4: תנאי שימוש ומדיניות פרטיות */}
              <div className="footer-column">
                <h4 className="footer-heading">משפטי</h4>
                <nav className="footer-nav" role="navigation">
                  <NavLink to="/policies/terms-of-service" prefetch="intent">
                    תנאי שימוש
                  </NavLink>
                  <NavLink to="/policies/privacy-policy" prefetch="intent">
                    מדיניות פרטיות
                  </NavLink>
                  {/* <NavLink to="/policies/refund-policy" prefetch="intent">
                    מדיניות החזרות
                  </NavLink>
                  <NavLink to="/policies/shipping-policy" prefetch="intent">
                    מדיניות משלוחים
                  </NavLink> */}
                </nav>
              </div>
            </div>

            {/* שורת זכויות */}
            <div className="footer-bottom flex justify-center">
              <p>{new Date().getFullYear()} {header.shop.name}. כל הזכויות שמורות. ©</p>
              <Whatsapp />
            </div>
              </footer>
              );
            }}
          </Await>
        )}
      </Await>
    </Suspense>
  );
}

const FALLBACK_HEADER_MENU = {
  id: 'gid://shopify/Menu/199655587896',
  items: [
    {id: '1', resourceId: null, tags: [], title: 'Collections', type: 'HTTP', url: '/collections', items: []},
    {id: '2', resourceId: null, tags: [], title: 'Blog', type: 'HTTP', url: '/blogs/journal', items: []},
    {id: '3', resourceId: null, tags: [], title: 'Policies', type: 'HTTP', url: '/policies', items: []},
    {id: '4', resourceId: null, tags: [], title: 'About', type: 'PAGE', url: '/pages/about', items: []},
  ],
};

