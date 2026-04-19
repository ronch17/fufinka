import {data, type ActionFunctionArgs} from 'react-router';
import {parseContactFormData, processContactSubmission} from '~/lib/contact.server';
import type {ContactEnv} from '~/lib/contact.server';

export function loader() {
  return data({message: 'השתמשו ב-POST לשליחת טופס יצירת קשר.'}, {status: 405});
}

export async function action({request, context}: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return data({ok: false as const, message: 'Method not allowed'}, {status: 405});
  }

  const contentType = request.headers.get('Content-Type') ?? '';
  let formData: FormData;

  if (contentType.includes('multipart/form-data')) {
    formData = await request.formData();
  } else if (contentType.includes('application/x-www-form-urlencoded')) {
    formData = await request.formData();
  } else {
    return data(
      {ok: false as const, message: 'סוג תוכן לא נתמך.'},
      {status: 415},
    );
  }

  const parsed = parseContactFormData(formData);
  const env = context.env as ContactEnv;

  const result = await processContactSubmission(env, parsed, request);

  if (!result.ok) {
    return data({ok: false as const, message: result.message}, {status: result.status});
  }

  return data({ok: true as const});
}
