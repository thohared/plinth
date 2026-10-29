# T-P10n: trenutna adresa izabranog pogleda

Autor: Codex (GPT-6), 2026-10-30. Baza: `4a2a22e9ff7c93a53204554ce8c3bd7ea3af463b`.
Vlasnik traži da se novi URL pojavi odmah pri izboru drugog pogleda, npr.
Dark studio, umesto da prethodna adresa ostane vidljiva približno sekundu.
Zajednički handoff je proveren na `c518ec35d8d500d1edf05f3a2dfcc8b433bbd347`.

## Nalazi

- F1: P-14(4)/P-21(5) određuju 250 ms idle upis. `src/state/navigation.ts:39`
  odlaže svaku promenu; `src/main.ts:309` ponovo sinhronizuje završetak poze.
  Zato izbor nije odmah vidljiv u adresi.
- F2: `src/main.ts:286` koristi isti snapshot za automatsku adresu i Copy link.
  P-14(2) zahteva prikazanu custom pozu tokom prelaza. Sama zamena timeout-a
  trenutnim upisom prikazala bi dugačak privremeni custom URL, pa drugi URL na
  kraju prelaza. Vlasnikov zahtev traži konačan link izabranog pogleda odmah.
- F3: `src/settings.ts:64` prihvata atomsku promenu pre obaveštavanja subscriber-a;
  pose ID već označava cilj, a custom sadrži trenutni prikaz. Uski signal pri
  prihvaćenom izboru device/scene/pose ili composition omogućava trenutni upis
  bez promene rendera, prekidanja animacije ili promene panel callback-a.
- F4: Za automatsku adresu može se projektovati imenovana ciljna poza preko
  postojećeg `snapshotState(state,false)`. Custom pogled i puna preciznost ostaju.
  Copy link mora zasebno zadržati snapshot stvarno prikazane poze i trenutni
  upis; isto važi za PNG. Drag/sliders ostaju coalesced, bez history spam-a.
- F5: `guards/readable-links.test.ts` čeka konačni URL pa ne razlikuje trenutni
  upis od kašnjenja. Novi guard treba da zabeleži adresu u istom stvarnom UI
  događaju, proveri literalni ciljni link dok animacija još traje, stabilnost
  do završetka i reload. Seedovi odloženog upisa i privremene custom poze moraju
  pasti. Postojeći interrupted-copy/privacy/recovery guardovi ostaju neizmenjeni.
- F6: Potrebna je prethodna uska planska dopuna P-22 za razliku automatske
  adrese i eksplicitnog Copy link-a. Zahtev odobrava implementaciju te razlike;
  nije merge, bless ili performance/Safari potvrda. Nema razloga za promenu
  kodiranja, geometrije, CSS-a, fixture-a, zavisnosti ili workflow-a.
