# T-P10j: početni H1, primeri i FAQ

Autor/izvođač: Codex (GPT-6), 2026-10-27. Research: [T-P10j-research.md](T-P10j-research.md), F1–F6.
Cites: §1/§2/§4.1–4.2/§4.5–4.6/§4.8–4.9/§6–§8,
P-2/P-5/P-10(1)/P-14/P-19/P-20. Odobreno u razgovoru, bez društvenih mreža.

## Isporuka

1. Postojeći brand H1 i podnaslov u početnom HTML-u; `createPanel` zadržava
   isti brand čvor. Jedan H1 pre i posle JS-a, isti prihvaćeni izgled (F1).
2. Portfolio i app-presentation primeri koriste dve postojeće originalne slike
   480×300, opisni alt, rezervisan prostor i lazy loading. Kratak FAQ objašnjava
   besplatno korišćenje/bez naloga, lokalnu obradu slike, transparent PNG i
   ograničenje 1×/2×/3× izvoza. Nema društvenih mreža u guide sadržaju (F2).
3. Guide ostaje pre završnih Share scene/Keyboard shortcuts komandi; izvoz i
   mobilne kontrole ostaju dostupni. FAQ je običan čitljiv HTML, bez nove
   skripte, bot-sadržaja, schema recenzija ili novih tracking događaja (F3/F6).
4. Dopuniti SEO guard i dokazati pad na seed-u uklonjenog početnog H1 (F4).
5. Zabeležiti mobilnu laboratorijsku proveru učitavanja sa stvarnim metodom i
   ograničenjima, bez tvrdnje o fizičkom telefonu ili release PASS-u (F5).

## Write set

`index.html`, usko `src/ui/panel.ts`/`src/ui/panel.css`, aditivno
`guards/seo.test.ts`, ovaj ticket/research, `docs/SEO.md`,
`reports/T-P10j-*` za proverljive SEO/performance rezultate.
Bez novih zavisnosti, spec/fixtures/workflow izmena ili promene renderovanja.
Postojeći metapodaci za deljenje ostaju; “bez društvenih mreža” odnosi se na
izbor primera i tekst vodiča, ne uklanjanje postojećih share mogućnosti.

## Prihvatanje

- Linux `npm run ci` i build pre objave, zatim postojeći CI/PG/PNG za finalni head.
- Svi raniji SEO assertions ostaju; jedan H1 bez JS-a i posle inicijalizacije;
  oba primera/FAQ se zadržavaju bez overflow-a na desktopu i telefonu.
- Seed nedostajućeg H1 mora pasti; restore i konačni pozitivni prolaz.
- Stvarni upload → PNG download, prikaz/fokus FAQ i utility kontrola na 390px;
  pregled dark/light i desktop/mobile slika. Ne menjati baseline-e.
- Nezavisan review u novom kontekstu, objavljen na PR-u. Merge traži vlasnika.
- Bing sitemap odložen; praćenje stvarnih search podataka ostaje odvojeno od
  testiranja i od organskog rasta koji nije garantovan.

`TODO(spec): none` u navedenom obuhvatu.
