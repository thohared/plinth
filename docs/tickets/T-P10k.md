# T-P10k: početno učitavanje na telefonu

Autor/izvođač: Codex (GPT-6), 2026-10-27. Research: [T-P10k-research.md](T-P10k-research.md), F1–F8.
Odredbe: §2/§4.1–4.6/§4.8–4.9/§6–§7, P-5/P-6/P-7/P-13/P-14/P-19/P-20.

## Isporuka

- Jedan PMREM generator priprema sva četiri neizmenjena proceduralna okruženja,
  uz odvojeno vlasništvo izlaza i sigurno oslobađanje privremenih resursa (F2).
  Dozvoliti prepuštanje browser-u između pripremnih zadataka pre ready; sve
  shader varijante i slike ostaju pripremljene pre prvog korisnikovog izbora.
- Isti mobilni brand i akcije postoje u početnom HTML-u. `createPanel` povezuje
  iste čvorove, komande ostaju disabled do spremnosti. Bez lažnog prikaza,
  promene završnog rasporeda ili promene PNG/render kvaliteta (F3).
- Dve postojeće demo slike učitati paralelno; pri bilo kom neuspehu zatvoriti
  sve uspešno dekodirane bitmape bez delimičnog transfera vlasništva (F4).
- Mali `src/startup.ts` postavlja postojeći režim i odmah pokreće import studija;
  shell ima rezervisano mesto za footer, bez pomeranja praznog canvas-a (F7/F8).
- Meriti uporediv mobilni load baseline/candidate tri puta naizmenično; sačuvati
  sirove rezultate, okruženje, identitet build-a i ograničenja. Ne obećavati
  fiksni PageSpeed skor niti predstavljati simulaciju kao fizički gate (F1/F5).

## Write set

`src/scene/environment.ts`, `src/scene/studio.ts`, povezani unit testovi;
`src/screen/demo.ts` i testovi; `index.html`, usko `src/main.ts`,
`src/startup.ts`, `src/ui/panel.ts`/`panel.css`; novi `guards/startup.test.ts`; ovaj ticket/research,
`reports/T-P10k-*` i sažetak u `docs/PERFORMANCE-TESTING.md`.
Bez spec/fixture/pin/workflow izmena, novih paketa, mrežnih izuzetaka ili
ugašene shader dijagnostike. Postojeći source image, DPR, AA i izlazne dimenzije ostaju.

## Prihvatanje

1. Cleanup uspeha/neuspeha i oporavka; prvi gotov kadar sa istom demo slikom.
2. Novi browser guard proverava ranu mobilnu strukturu, disabled stanje pre
   spremnosti, identitet čvorova posle i stvarni upload/PNG tok; seeded
   povreda mora pasti. Postojeće unit/guards assertions ostaju netaknute.
3. Linux `npm run ci` i normalni build; finalni CI/PG/PNG. Nema promene
   baseline-a ili tolerancija; uporediti i pregledati stvarne slike.
4. Tri naizmenična Lighthouse para i izveštaj stvarnog poboljšanja/ograničenja.
5. Fresh-context nezavisan review objavljen na PR-u; merge odobrava vlasnik.

`TODO(spec): none` u ovom obuhvatu. Bing sitemap i društvene mreže nisu deo rada.

## Lokalni rezultat, 2026-10-27

`npm run ci`: 122/122 guards (1070.59 s), typecheck i 272/272 unit (9.35 s),
exit 0. Chromium 153.0.8010.0/SwiftShader, Node 24.22.1, Linux.
Novi guard zasebno PASS; `missing-action` seed očekivano pada na count 0≠1.
Nezavisni reviewer ponovio oba rezultata. Posle CI normalni build i svi
source/build hash-evi ponovo odgovaraju finalnom Lighthouse manifestu.
Tri naizmenična para, range/CoV i ograničenja su u
[`reports/T-P10k-lab`](../../reports/T-P10k-lab/README.md).
Pet poređenja rendera ima 0 promenjenih RGBA kanala. Desktop/mobile slike
pregledane. Finalni GitHub CI/PG/PNG i review beleže se na PR-u.
