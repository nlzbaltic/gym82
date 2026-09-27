// Password gate for the preview site. Every request (pages, images, scripts)
// passes through here before the static files in ./out are served.
const COOKIE = 'gym82_access';
// SHA-256 of the preview password. Change the password by replacing this hash
// (printf 'newpassword' | sha256sum) or by setting a SITE_PASSWORD secret.
const PASSWORD_HASH = '295c6b619a68fabd48d5dcf5db447305cf3adf2ca23a6344a99d0f8f0f6bfae3';

const sha256 = async text => {
 const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
 return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('');
};

const safePath = value => {
 const v = String(value || '/');
 return v.startsWith('/') && !v.startsWith('//') ? v : '/';
};

const page = (next, failed) => new Response(`<!doctype html>
<html lang="lv"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex">
<title>GYM82</title>
<style>
*{box-sizing:border-box}html,body{height:100%}body{margin:0;display:grid;place-items:center;padding:24px;background:#111212;font-family:system-ui,-apple-system,"Segoe UI",sans-serif}
form{width:min(320px,100%)}
input{width:100%;padding:15px 18px;border-radius:999px;border:1px solid ${failed ? '#ff8f7f' : '#3a3d3a'};background:#1a1b1b;color:#fff;font-size:16px;text-align:center;letter-spacing:.08em}
input:focus{outline:2px solid #bcf65c;outline-offset:3px}
${failed ? 'form{animation:shake .35s}@keyframes shake{25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}' : ''}
button{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);border:0;padding:0}
</style></head><body>
<form method="post" action="/__unlock">
<input type="password" name="password" autocomplete="current-password" aria-label="Parole" ${failed ? 'aria-invalid="true"' : ''} required autofocus>
<input type="hidden" name="next" value="${next.replace(/"/g, '&quot;')}">
<button>Ieiet</button>
</form></body></html>`, { status: 401, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex' } });

export default {
 async fetch(request, env) {
  const url = new URL(request.url);
  const expected = env.SITE_PASSWORD ? await sha256(env.SITE_PASSWORD) : PASSWORD_HASH;
  const token = await sha256(`${expected}:gym82-preview`);
  const cookies = (request.headers.get('cookie') || '').split(/;\s*/);

  if (cookies.includes(`${COOKIE}=${token}`)) {
   const response = await env.ASSETS.fetch(request);
   const headers = new Headers(response.headers);
   headers.set('x-robots-tag', 'noindex');
   return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
  }

  if (url.pathname === '/__unlock' && request.method === 'POST') {
   const form = await request.formData();
   const next = safePath(form.get('next'));
   const password = String(form.get('password') || '').trim();
   if (await sha256(password) === expected) {
    return new Response(null, { status: 303, headers: { location: next, 'set-cookie': `${COOKIE}=${token}; Path=/; Max-Age=2592000; HttpOnly; Secure; SameSite=Lax`, 'cache-control': 'no-store' } });
   }
   return page(next, true);
  }

  return page(url.pathname + url.search, false);
 },
};
