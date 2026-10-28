# T-P10m: čitljivi linkovi u celom editoru

Autor/izvođač: Codex (GPT-6), 2026-10-28. Research F1–F6 je zasebno
commitovan pre P-21 i ovog ticketa. Osnova: `55812329bc4838f57f6bd7a1f5b7308756d6604b`.
Vlasnik je zatražio promenu adresa; merge ostaje posebna odluka.

## Isporuka

Primeniti P-21 uz §2.2–2.3, §4.8, P-14/P-18/P-20: jedan v2 encoder za
adresnu traku i Copy link, strogi decoder koji čuva sve v1 linkove,
zamrznute transportne osnove i migracija tek uspešno učitanog starog linka.
Ne menjati izgled, render, slike, PNG dimenzije, pose precision ili privatnost.

Write set: `src/state/readable.ts`, `readable.test.ts`, `codec.ts`,
`navigation.ts`, `navigation.test.ts`, usko povezivanje u `src/main.ts`;
transportne pretpostavke u `guards/state-share.test.ts`, `analytics.test.ts`,
`demo-edges.test.ts`, `device-details.test.ts`, `live-feedback.test.ts`,
`review-polish.test.ts`; novi `guards/readable-links.test.ts`; README i
ovaj ticket/research. P-21 je prethodni zaseban spec-only planski commit.
Bez novih dependency/workflow/fixture izmena. `TODO(spec): none` posle P-21.

## Dokaz

Nezavisni literalni v2 ulazi za svih pet uređaja, sve grupe polja i precizne
custom poze; malformed/oversize/duplicate/prototype/future-version provere.
Sačuvati stare literalne v1 testove i iste semantičke browser asercije.
Novi browser guard: UI izmena daje čitljiv URL, Copy link i reload obnavljaju
isti scene/demo, stari link migrira, neispravan novi čuva upload/stanje/hash.
Seedovi moraju dokazati pad kod vraćenog base64 izlaza i izostale validacije.
Prikaz proveriti na desktop/mobile viewport-u. Lokalni focused tests/build,
zatim ceo Linux CI, postojeći PG/PNG workflow-i na tačnom PR head-u.
Stvarne artefakte pregledati; fizički Safari/performance ostaju ranije
otvorena release evidencija. Fresh-context reviewer objavljuje pun nalaz.
