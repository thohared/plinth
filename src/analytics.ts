/// <reference types="vite/client" />
import { inject, type BeforeSendEvent } from '@vercel/analytics';

const SITE = 'https://plinth-phi.vercel.app';

/** P-20: only ordinary production visits; QA and shared state stay local. */
export function analyticsAllowed(production: boolean, href: string, referrer: string): boolean {
  if (!production) return false;
  try {
    const url = new URL(href);
    if (url.origin !== SITE || url.pathname !== '/' || url.search || url.username || url.password) return false;
    if (referrer) {
      const source = new URL(referrer);
      if (!['http:', 'https:'].includes(source.protocol) || source.pathname !== '/' ||
          source.search || source.hash || source.username || source.password) return false;
    }
    return true;
  } catch { return false; }
}

/** Reconstruct the allowed event; never spread unknown properties or scene URLs. */
export function scrubPageview(event: BeforeSendEvent): BeforeSendEvent | null {
  if (event.type !== 'pageview') return null;
  try {
    const url = new URL(event.url);
    if (url.origin !== SITE || url.pathname !== '/' || url.username || url.password) return null;
    return { type: 'pageview', url: SITE + '/' };
  } catch { return null; }
}

export function initAnalytics(): void {
  if (!analyticsAllowed(import.meta.env.PROD, window.location.href, document.referrer)) return;
  try {
    inject({ mode: 'production', scriptSrc: '/_vercel/insights/script.js', beforeSend: scrubPageview });
  } catch {
    // Optional visit statistics must never block the studio.
  }
}
