# T-P10n: adresa odmah prati izabrani pogled

Autor/izvođač: Codex (GPT-6), 2026-10-30. Baza: `4a2a22e9ff7c93a53204554ce8c3bd7ea3af463b`.
Research F1–F6 i zasebni P-22 planski commit prethode ovom ticketu.

## Isporuka

Primeniti P-22 uz §2.2–2.3, §4.8, §7, P-14/P-18/P-20/P-21.
Posle prihvaćenog izbora look/device/scene/pose/reset odmah upisati konačnu
adresu izabranog pogleda. Automatski URL koristi named cilj dok animacija
traje; Copy link zadržava tačan prikazani kadar. Ne menjati animaciju ili PNG.
Drag i ostale učestale promene zadržavaju odlaganje i preciznost.

Write set: `src/settings.ts`, `src/state/navigation.ts`,
`src/state/navigation.test.ts`, uska integracija `src/main.ts`, novi
`guards/immediate-address.test.ts`, README i ovaj ticket/research.
P-22 je prethodni zaseban spec-only commit. Bez izmena postojećih guardova,
fixture-a, renderera, CSS-a, dependency-ja ili workflow-a. `TODO(spec): none`.

## Dokaz

- Same-event browser zapis stvarnih look/device/scene/pose/reset akcija na
  desktop/mobile viewport-u. Literalna nova adresa pre rAF/timera, bez čekanja
  da se URL popravi; named cilj tokom aktivne animacije, stabilnost i reload.
- Negativni seed vraćenog odlaganja i prikazane custom poze u automatskom
  linku moraju pasti na odgovarajućim asercijama. Izvorni kod ostaje netaknut.
- Additive unit testovi trenutnog upisa, otkazivanja timer-a i granica
  navigacije/recovery/disposal/History failure-a; postojeći state-share paket
  dokazuje neizmenjen Copy link tokom prelaza, privatnost i očuvanje slike.
- Lokalni focused browser/unit testovi, typecheck i build; zatim puni Linux
  CI i postojeći PG/PNG workflow-i jednom na konačnom PR head-u. Pregledati
  stvarne artefakte. Nezavisan fresh-context review pre spremnosti za merge.
  Postojeće fizičke performance/Safari obaveze ostaju odvojene.

Vlasnikov zahtev odobrava ispravku; merge ostaje posebna odluka.
