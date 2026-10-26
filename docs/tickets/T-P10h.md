# T-P10h: SEO osnova za Plinth

Autor/izvođač: Codex (GPT-6), 2026-10-26. Research: [T-P10h-research.md](T-P10h-research.md), F1–F7.
Cites: §1/§2/§4.1–4.2/§4.4–4.6/§4.8–4.9/§7/§8 T-P10,
P-2/P-5/P-10(1)/P-14/P-19/P-20. Zahtev vlasnika: bolji SEO za postojeći studio.

## Isporuka

1. Opisni title i usklađeni description/OG/Twitter metapodaci za besplatni 3D
   mockup generator. Canonical je tačno `https://plinth-phi.vercel.app/` (F1/F6).
2. Statički robots.txt dozvoljava crawl javnih resursa i upućuje na sitemap.xml.
   Sitemap navodi samo kanonski root, bez demo/QA/query/hash URL-ova, izmišljenog
   lastmod-a ili učestalosti promene (F2/F6).
3. Kratak engleski opis i stvarni upload → uređaj/izgled → PNG tok nalaze se u
   početnom HTML-u i ostaju čitljivi pri dnu panela posle inicijalizacije,
   pre završnih Share scene/Keyboard shortcuts komandi, koje ostaju poslednje.
   Isti tekst dobija svaki posetilac; bez bot detekcije, skrivenog keyword teksta
   ili uvodne stranice koja blokira rad. Bez JS-a jasno navesti zahtev za JS/WebGL
   i omogućiti čitanje teksta (F3/F4).
4. Statički JSON-LD WebApplication sa potvrđenim besplatnim PNG mogućnostima,
   bez rating-a, lažnih recenzija ili obećanja video izvoza (F5).
5. Dokumentovati šta se proverava posle objave i kako se odvojeno prate Bing/
   Google impresije, klikovi i CTR. Ne tvrditi da su nalozi verifikovani ili
   sitemap poslat bez potvrde iz odgovarajućeg servisa (F7).

## Write set i granice

`index.html`, `public/robots.txt`, `public/sitemap.xml`,
usko `src/ui/panel.ts`/`src/ui/panel.css`, novi `guards/seo.test.ts`,
ovaj ticket, istraživanje i `docs/SEO.md`.
Bez novih paketa, promene workflow-a, analitike, scene/izvoza, specifikacije ili
fixtures. Sačuvati postojeći naslov u samom interfejsu i pristup kontrolama.

## Provere

- Linux `npm run ci` i build; postojeći cloud CI/PG/PNG za konačni head.
- SEO guard testira produkcioni build: canonical/OG/schema/sitemap slaganje,
  odsustvo noindex-a i scene podataka, upotrebljiv tekst bez JS-a i isti tekst
  posle inicijalizacije, na desktopu i mobilnom sheet-u, kao i format robots/XML.
- Nezavisna očekivanja su literalni produkcioni URL i potvrđene mogućnosti,
  ne konstante uvezene iz implementacije. Seed-ovi za pogrešan canonical,
  sitemap sa hash-om i gubitak teksta posle inicijalizacije moraju pasti.
- Inspekcija stvarnih desktop/mobile slika. Softverski GPU nije fizički phone
  performance ili Safari PASS. Baselines ostaju netaknuti.
- Nezavisan svež review po `docs/tickets/REVIEW.md`; builder ne daje svoj MERGE.
  Spajanje ostaje odluka vlasnika. SEO ne garantuje rast saobraćaja.

`TODO(spec): none` u navedenom obuhvatu.
