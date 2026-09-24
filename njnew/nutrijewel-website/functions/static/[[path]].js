/* /static/*   every hashed build file: the app's JavaScript, CSS and media.

   Why this exists. On 2026-09-25 nutrijewel.com went blank right after a
   deploy. For a few seconds after the switch, the new index.html was live at an
   edge before the new main.js had reached it. Pages' single-page-app fallback
   answered the missing file with index.html, _headers stamped it with the
   one-year "immutable" cache meant for real build files, and Cloudflare cached
   that HTML under the JavaScript's URL. Every visitor served by that cache got a
   page whose script was HTML, and nothing rendered.

   So a file under /static is never allowed to come back as HTML. Nothing here is
   ever legitimately HTML. If it does, it is retried briefly (propagation takes
   seconds), and if it is still wrong the answer is a 404 that nobody may cache,
   so the next request tries again instead of inheriting the mistake for a year.

   Real files get their long cache header set here, because _headers rules do
   not apply to responses that pass through a Function. */

const HTML = /text\/html/i;
const RETRIES_MS = [250, 500, 1000];
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const isHtml = (res) => HTML.test(res.headers.get('content-type') || '');

export async function onRequest({ request, env }) {
  let res = await env.ASSETS.fetch(request);

  for (const wait of RETRIES_MS) {
    if (!isHtml(res)) break;
    await sleep(wait);
    res = await env.ASSETS.fetch(request);
  }

  if (isHtml(res)) {
    return new Response('Not found', {
      status: 404,
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  }

  const out = new Response(res.body, res);
  if (res.status === 200) out.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  out.headers.set('X-Content-Type-Options', 'nosniff');
  return out;
}
