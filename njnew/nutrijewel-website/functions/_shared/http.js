/*
 * Small helpers shared by every endpoint under functions/api/.
 *
 * These run on Cloudflare Pages Functions (the Workers runtime), which is not
 * Node: there is no fs, no Buffer, no process.env. Configuration arrives as
 * `env` on the request context, and secrets live in Cloudflare's encrypted
 * environment variables, never in the repo.
 */

const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  // These endpoints are same-origin only. No CORS headers on purpose: the site
  // and the API share a domain, so nothing legitimate needs cross-origin access.
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
};

export function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...JSON_HEADERS, ...extraHeaders },
  });
}

/* A customer-safe failure. `errors` is an array of sentences fit to show on the
   page; nothing here should ever carry a stack trace or an internal id. */
export function fail(errors, status = 400) {
  const list = Array.isArray(errors) ? errors : [String(errors)];
  return json({ ok: false, errors: list }, status);
}

export function methodNotAllowed(allowed) {
  return json({ ok: false, errors: ['Method not allowed.'] }, 405, { Allow: allowed });
}

/* Read a JSON body without letting a huge or malformed one become our problem.
   Returns { ok, body } or { ok: false, response } ready to return. */
export async function readJson(request, { maxBytes = 32 * 1024 } = {}) {
  const type = request.headers.get('content-type') || '';
  if (!type.includes('application/json')) {
    return { ok: false, response: fail('Expected a JSON body.', 415) };
  }
  const declared = Number(request.headers.get('content-length') || 0);
  if (declared && declared > maxBytes) {
    return { ok: false, response: fail('Request too large.', 413) };
  }
  let text;
  try {
    text = await request.text();
  } catch (_) {
    return { ok: false, response: fail('Could not read the request.', 400) };
  }
  if (text.length > maxBytes) {
    return { ok: false, response: fail('Request too large.', 413) };
  }
  try {
    return { ok: true, body: JSON.parse(text) };
  } catch (_) {
    return { ok: false, response: fail('Malformed JSON.', 400) };
  }
}

/* Paise to a rupee string for display. The server owns this so the page never
   has to do money arithmetic of its own. */
export function formatPaise(paise) {
  const n = Number.isFinite(paise) ? paise : 0;
  return `₹${(n / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}
