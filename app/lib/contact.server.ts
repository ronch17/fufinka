import {Resend} from 'resend';

/** משתני סביבה לטופס יצירת קשר — יש להגדיר ב-Oxygen / .env */
export type ContactEnv = {
  RESEND_API_KEY?: string;
  /** כתובת שולח מאומתת ב-Resend, לדוגמה: Onboarding <onboarding@resend.dev> */
  RESEND_FROM_EMAIL?: string;
  /** תיבת בעל האתר שתקבל העתק פנייה */
  CONTACT_OWNER_EMAIL?: string;
  RECAPTCHA_SECRET_KEY?: string;
  PUBLIC_RECAPTCHA_SITE_KEY?: string;
  SHOPIFY_ADMIN_ACCESS_TOKEN?: string;
  PUBLIC_STORE_DOMAIN?: string;
  SHOPIFY_ADMIN_API_VERSION?: string;
};

const MAX_NAME = 120;
const MAX_MESSAGE = 5000;

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function normalizeShopHost(domain: string | undefined): string | null {
  if (!domain) return null;
  return domain.replace(/^https?:\/\//, '').split('/')[0]?.toLowerCase() ?? null;
}

export type ParsedContact = {
  name: string;
  email: string;
  message: string;
  honeypot: string;
  recaptchaToken: string;
};

export function parseContactFormData(formData: FormData): ParsedContact {
  return {
    name: String(formData.get('name') ?? '').trim(),
    email: String(formData.get('email') ?? '').trim(),
    message: String(formData.get('message') ?? '').trim(),
    honeypot: String(formData.get('company') ?? '').trim(),
    recaptchaToken: String(formData.get('recaptchaToken') ?? '').trim(),
  };
}

function isValidEmail(email: string): boolean {
  if (email.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export type ValidateResult =
  | {ok: true; data: ParsedContact}
  | {ok: false; message: string};

export function validateContactInput(parsed: ParsedContact): ValidateResult {
  if (parsed.honeypot.length > 0) {
    return {ok: false, message: 'בקשה לא תקינה.'};
  }

  if (!parsed.name || parsed.name.length > MAX_NAME) {
    return {
      ok: false,
      message: `נא למלא שם (עד ${MAX_NAME} תווים).`,
    };
  }

  if (!parsed.email || !isValidEmail(parsed.email)) {
    return {ok: false, message: 'נא להזין כתובת אימייל תקינה.'};
  }

  if (parsed.message.length > MAX_MESSAGE) {
    return {
      ok: false,
      message: `ההודעה ארוכה מדי (מקסימום ${MAX_MESSAGE} תווים).`,
    };
  }

  return {ok: true, data: parsed};
}

/** reCAPTCHA v3 — אימות בצד השרת */
export async function verifyRecaptcha(
  secret: string,
  token: string,
  remoteip?: string | null,
): Promise<{ok: boolean; score?: number}> {
  const body = new URLSearchParams();
  body.set('secret', secret);
  body.set('response', token);
  if (remoteip) body.set('remoteip', remoteip);

  const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body,
  });

  const json = (await res.json()) as {
    success?: boolean;
    score?: number;
    'error-codes'?: string[];
  };

  if (!json.success) {
    return {ok: false};
  }

  const score = json.score;
  if (typeof score === 'number' && score < 0.35) {
    return {ok: false, score};
  }

  return {ok: true, score};
}

async function syncLeadToShopifyAdmin(
  env: ContactEnv,
  input: {name: string; email: string; message: string},
): Promise<void> {
  const token = env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  const host = normalizeShopHost(env.PUBLIC_STORE_DOMAIN);
  if (!token || !host?.endsWith('.myshopify.com')) {
    return;
  }

  const version = env.SHOPIFY_ADMIN_API_VERSION ?? '2024-10';
  const parts = input.name.split(/\s+/);
  const firstName = parts[0] ?? input.name;
  const lastName = parts.length > 1 ? parts.slice(1).join(' ') : '';

  const url = `https://${host}/admin/api/${version}/customers.json`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token,
    },
    body: JSON.stringify({
      customer: {
        email: input.email,
        first_name: firstName,
        last_name: lastName,
        tags: 'contact-form-lead',
        note: `פנייה מטופס יצירת קשר באתר:\n\n${input.message}`,
      },
    }),
  });

  if (!response.ok && response.status !== 422) {
    const text = await response.text().catch(() => '');
    console.error('[contact] Shopify Admin customer sync failed', response.status, text);
  }
}

type SendEmailsArgs = {
  env: ContactEnv;
  input: {name: string; email: string; message: string};
};

export async function sendContactEmails({env, input}: SendEmailsArgs): Promise<void> {
  const apiKey = env.RESEND_API_KEY;
  const from = env.RESEND_FROM_EMAIL;
  const owner = env.CONTACT_OWNER_EMAIL;

  if (!apiKey || !from) {
    throw new Error('RESEND_API_KEY או RESEND_FROM_EMAIL לא מוגדרים.');
  }

  const resend = new Resend(apiKey);
  const safeName = escapeHtml(input.name);
  const safeEmail = escapeHtml(input.email);
  const safeMessage = escapeHtml(input.message).replace(/\n/g, '<br/>');

  const customerHtml = `
    <!DOCTYPE html>
    <html lang="he" dir="rtl">
    <head><meta charset="utf-8"/></head>
    <body style="font-family: system-ui, sans-serif; line-height: 1.65; color: #1c1917;">
      <p style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">ההרשמה בוצעה בהצלחה</p>
      <p>שלום ${safeName},</p>
      <p>פנייתך נקלטה במערכת. קיבלנו את הפרטים שמילאת — נחזור אליך בהקדם האפשרי.</p>
      ${
        input.message.trim()
          ? `<div style="margin: 20px 0; padding: 14px 16px; border-radius: 8px; border: 1px solid #e7e5e4; background: #fafaf9;">
        <p style="margin: 0 0 8px; font-size: 13px; color: #57534e;">עותק מההודעה ששלחת:</p>
        <div style="margin: 0;">${safeMessage}</div>
      </div>`
          : ''
      }
      <p style="color: #57534e; font-size: 14px; margin-top: 24px;">זוהי הודעה אוטומטית לאישור קבלה — אין צורך להשיב אליה.</p>
    </body>
    </html>
  `;

  const customerText = [
    'ההרשמה בוצעה בהצלחה',
    '',
    `שלום ${input.name},`,
    '',
    'פנייתך נקלטה במערכת. קיבלנו את הפרטים שמילאת — נחזור אליך בהקדם האפשרי.',
    input.message.trim() ? `\nעותק מההודעה:\n${input.message}` : '',
    '',
    'זוהי הודעה אוטומטית לאישור קבלה.',
  ]
    .filter(Boolean)
    .join('\n');

  await resend.emails.send({
    from,
    to: input.email,
    subject: 'אישור: פנייתך נרשמה בהצלחה',
    html: customerHtml,
    text: customerText,
  });

  if (owner) {
    const adminHtml = `
      <!DOCTYPE html>
      <html lang="he" dir="rtl">
      <head><meta charset="utf-8"/></head>
      <body style="font-family: system-ui, sans-serif; line-height: 1.6; color: #1c1917;">
        <h2 style="margin-top:0;">פנייה חדשה מהאתר</h2>
        <p><strong>שם:</strong> ${safeName}</p>
        <p><strong>אימייל:</strong> <a href="mailto:${safeEmail}">${safeEmail}</a></p>
        <p><strong>הודעה:</strong></p>
        <div style="border:1px solid #e7e5e4; padding:12px; border-radius:8px; background:#fafaf9;">
          ${safeMessage}
        </div>
      </body>
      </html>
    `;

    await resend.emails.send({
      from,
      to: owner,
      subject: `פנייה מ${safeName} (${safeEmail})`,
      html: adminHtml,
      replyTo: input.email,
    });
  }
}

export type ProcessContactResult =
  | {ok: true}
  | {ok: false; message: string; status: number};

export async function processContactSubmission(
  env: ContactEnv,
  parsed: ParsedContact,
  request: Request,
): Promise<ProcessContactResult> {
  const validated = validateContactInput(parsed);
  if (!validated.ok) {
    return {ok: false, message: validated.message, status: 400};
  }

  const data = validated.data;
  const captchaRequired = Boolean(env.RECAPTCHA_SECRET_KEY);

  if (captchaRequired) {
    if (!data.recaptchaToken) {
      return {
        ok: false,
        message: 'אימות אבטחה נכשל. רעננו את הדף ונסו שוב.',
        status: 400,
      };
    }
    const forwarded = request.headers.get('x-forwarded-for');
    const clientIp =
      request.headers.get('CF-Connecting-IP') ??
      (forwarded ? forwarded.split(',')[0]?.trim() : null);

    const verified = await verifyRecaptcha(
      env.RECAPTCHA_SECRET_KEY!,
      data.recaptchaToken,
      clientIp,
    );
    if (!verified.ok) {
      return {
        ok: false,
        message: 'אימות האבטחה נכשל. נסו שוב.',
        status: 400,
      };
    }
  }

  try {
    await sendContactEmails({
      env,
      input: {
        name: data.name,
        email: data.email,
        message: data.message,
      },
    });
  } catch (e) {
    console.error('[contact] Resend', e);
    return {
      ok: false,
      message: 'לא הצלחנו לשלוח את ההודעה כרגע. נסו שוב מאוחר יותר.',
      status: 503,
    };
  }

  try {
    await syncLeadToShopifyAdmin(env, {
      name: data.name,
      email: data.email,
      message: data.message,
    });
  } catch (e) {
    console.error('[contact] Shopify', e);
  }

  return {ok: true};
}
