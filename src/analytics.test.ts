import { describe, expect, it } from 'vitest';
import { analyticsAllowed, scrubPageview } from './analytics';

describe('P-20 production visit boundary', () => {
  it('allows a production root visit and a shared scene, with an origin-only referrer', () => {
    expect(analyticsAllowed(true, 'https://plinth-phi.vercel.app/', '')).toBe(true);
    expect(analyticsAllowed(true, 'https://plinth-phi.vercel.app/#s=PRIVATE_SCENE', 'https://example.org/')).toBe(true);
  });
  it.each([
    [false, 'https://plinth-phi.vercel.app/', ''],
    [true, 'http://localhost:4173/', ''],
    [true, 'https://plinth-preview.vercel.app/', ''],
    [true, 'https://plinth-phi.vercel.app.evil.example/', ''],
    [true, 'http://plinth-phi.vercel.app/', ''],
    [true, 'https://plinth-phi.vercel.app:444/', ''],
    [true, 'https://user:secret@plinth-phi.vercel.app/', ''],
    [true, 'https://plinth-phi.vercel.app/private.png', ''],
    [true, 'https://plinth-phi.vercel.app/?pg=1', ''],
    [true, 'https://plinth-phi.vercel.app/?pg=0', ''],
    [true, 'https://plinth-phi.vercel.app/?device=phone', ''],
    [true, 'https://plinth-phi.vercel.app/?token=PRIVATE_QUERY#s=PRIVATE_SCENE', ''],
    [true, 'https://plinth-phi.vercel.app/', 'https://example.org/private.png'],
    [true, 'https://plinth-phi.vercel.app/', 'https://example.org/?token=PRIVATE_REFERRER'],
    [true, 'https://plinth-phi.vercel.app/', 'https://example.org/#PRIVATE_REFERRER'],
    [true, 'https://plinth-phi.vercel.app/', 'https://user:secret@example.org/'],
    [true, 'https://plinth-phi.vercel.app/', 'data:text/plain,private'],
    [true, 'https://plinth-phi.vercel.app/', 'not a URL'],
    [true, 'not a URL', ''],
  ] as const)('suppresses analytics for %j, %s, %s', (production, href, referrer) => {
    expect(analyticsAllowed(production, href, referrer)).toBe(false);
  });
  it('returns only a literal root pageview, removing query, hash and unknown properties', () => {
    const input = { type: 'pageview' as const, url: 'https://plinth-phi.vercel.app/?token=PRIVATE_QUERY#s=PRIVATE_SCENE', filename: 'PRIVATE_IMAGE.png', data: 'PRIVATE_BYTES' };
    expect(scrubPageview(input)).toEqual({ type: 'pageview', url: 'https://plinth-phi.vercel.app/' });
    expect(input.url).toContain('PRIVATE_QUERY');
  });
  it.each(['https://other.example/', 'https://plinth-phi.vercel.app/private.png', 'https://user:secret@plinth-phi.vercel.app/', 'data:text/plain,private', 'not a URL'])('drops a malformed or unauthorized pageview %s', url => {
    expect(scrubPageview({ type: 'pageview', url })).toBeNull();
  });
  it('drops custom events even on the canonical origin', () => {
    expect(scrubPageview({ type: 'event', url: 'https://plinth-phi.vercel.app/' })).toBeNull();
  });
});
