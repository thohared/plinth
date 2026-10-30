# T-P10q: opis koji korisnik može da sklopi

Autor/izvođač: Codex (GPT-6), 2026-10-30.
Research: [T-P10q-research.md](T-P10q-research.md), F1–F5, prethodni research commit-i.
Odredbe: §2.2–2.3/§2.5–2.7/§4.9/§7, P-5/P-10(1)/P-14/P-19/P-20.

## Isporuka

- Nativni otvoreni details oko postojećeg `#about-plinth`, sa naslovom
  About Plinth i jasnim Hide/Show oznakama. Ceo opis može da se sklopi i vrati.
- Sačuvati isti wrapper/čvor pri inicijalizaciji panela i promene njegovog
  otvorenog stanja. Ostale postavke alata ne otvaraju vodič ponovo.
- Desktop/mobile, svetla/tamna tema, tastatura i no-JS; summary najmanje 44 px.
- Postojeći tekst i strukturirani podaci ostaju identični; nema storage-a.
- Četiri postojeća Advanced settings klika u guardovima adresiraju postojeći
  `aria-controls="advanced-controls"`; sve asercije i slučajevi ostaju isti (F5).

Write set: `index.html`, `src/ui/panel.ts`, usko `src/ui/panel.css`, ovaj
ticket/research i samo četiri lokatora u `guards/panel.test.ts`,
`guards/shortcuts.test.ts`, `guards/png-access.test.ts`. Ne menjati spec,
fixture-e, dependency-je, guard asercije, slučajeve, pragove ili seed-ove.

## Prihvatanje

Postojeći SEO/discovery/startup testovi, typecheck/build i redovni Linux CI/PG/PNG.
Lokalno ponoviti panel/shortcuts/png-access suite posle ispravke lokatora iz F5.
Praktična provera Hide/Show tapom i tastaturom, zatvaranja pre spremnosti,
očuvanja stanja kroz Settings/izbor izgleda i dostupnosti utility/export komandi.
Pregled mobilnih/desktop slika u obe teme. Nema novog performance obećanja.
Nezavisan fresh-context a–d review na PR-u; merge odobrava vlasnik zasebno.
`TODO(spec): none`. Novi guard nije potreban za nativni HTML mehanizam;
postojeće sadržaj/input/export asercije ostaju nepromenjene.
