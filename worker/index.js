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
*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;padding:24px;background:#111212;color:#f4f4ef;font-family:system-ui,-apple-system,"Segoe UI",sans-serif}
form{width:min(380px,100%);display:grid;gap:14px;padding:32px;border:1px solid #333535;border-radius:20px;background:#1a1b1b}
h1{margin:0;font-size:28px}p{margin:0;color:#a2a6a3;line-height:1.5;font-size:15px}
input{width:100%;padding:14px 16px;border-radius:10px;border:1px solid #505748;background:#11140f;color:#fff;font-size:16px}
input:focus{outline:2px solid #bcf65c;outline-offset:2px}
button{min-height:48px;border:0;border-radius:999px;background:#bcf65c;color:#10130c;font-weight:700;font-size:15px;cursor:pointer}
.err{color:#ff8f7f}
</style></head><body>
<form method="post" action="/__unlock">
<h1>GYM82</h1><p>Lapa vēl tiek gatavota. Ievadi paroli, lai to apskatītu.</p>
<input type="password" name="password" autocomplete="current-password" aria-label="Parole" placeholder="Parole" required autofocus>
<input type="hidden" name="next" value="${next.replace(/"/g, '&quot;')}">
${failed ? '<p class="err" role="alert">Nepareiza parole.</p>' : ''}
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
