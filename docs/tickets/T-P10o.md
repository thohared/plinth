# T-P10o: jasni odgovori i opis Plintha za pretragu

Autor/izvođač: Codex (GPT-6), 2026-10-30. Research F1–F7:
[T-P10o-research.md](T-P10o-research.md), prethodni zasebni commit.
Cites: §1/§2/§4.1–4.2/§4.5–4.6/§4.8–4.9/§7–§8,
P-2/P-5/P-10(1)/P-13/P-14/P-19/P-20.

## Isporuka

1. Proširiti postojeći statički vodič: sažet pregled mogućnosti, izbor modela,
   Fill screen/Fit image, tabela svih pet 1× dimenzija, objašnjenje 2×/3×,
   ograničenje GPU-a, deljenje bez slike i JS/WebGL 2 uslov (F1–F3/F6).
2. Dopuniti postojeći WebApplication JSON-LD stabilnim id-em i činjenicama
   koje čitalac vidi. Bez FAQ schema, rating-a ili novih marketinških tvrdnji (F4).
3. Opcioni `llms.txt` sadrži isti činjenični pregled i javne izvore; dokumentacija
   jasno razlikuje predlog formata od garantovane podrške ili SEO efekta (F2/F5).
4. Sačuvati canonical, robots, sitemap, početni H1, raniji FAQ/primere,
   upload/PNG tok, utility kontrole i privatnost. Bez društvenih mreža u vodiču,
   Bing sitemap ponavljanja, naloga ili novih merenja posetilaca (F6/F7).

Write set: `index.html`, usko `src/ui/panel.css`, novi `public/llms.txt`,
novi `guards/discovery.test.ts`, `docs/SEO.md`, ovaj ticket/research.
Bez izmene postojećih guardova, spec-a, fixture-a, workflow-a, zavisnosti,
renderera ili aplikacionog state-a. `TODO(spec): none` u ovom obuhvatu.

## Prihvatanje

- Literalne P-13 dimenzije, javne činjenice dostupne bez JS-a, featureList
  jednak vidljivom pregledu; llms činjenično usklađen sa HTML-om i canonical-om.
- Namerno pogrešna dimenzija, JSON-LD tvrdnja, llms tvrdnja i llms H2 format u privremenom
  buildu obaraju odgovarajući novi test; restore i pozitivan prolaz.
- Postojeći SEO guardovi ostaju i prolaze; novi pregled/tabela ostaju čitljivi
  bez horizontalnog overflow-a u desktop/mobile, light/dark prikazu.
- Proveriti stvarni upload → PNG download nakon čitanja vodiča, dimenzije PNG-a,
  dostupnost završnih utility komandi i pregled slika. Bez izmene baseline-a.
- Lokalni focused guardovi, typecheck, unit i build; puni Linux `npm run ci`
  u postojećem CI-u, PG i PNG za konačni PR head, pregled stvarnih artefakata.
  Nezavisan fresh-context review sa a–d izveštajem objavljenim na PR-u.
  Fizičke performance/Safari provere i stvarni search rezultati nisu ovaj test.

Vlasnik je odobrio implementaciju; merge ostaje posebna odluka.
