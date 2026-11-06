# T-P10y: Plan prve Plinth ekstenzije

Status: predlog P-28, bez runtime implementacije.
Autor: Codex (GPT-6). Datum: 2026-11-06.
Osnova: 0a1936d0e963d73aefa6aa2d8752ae155ac4c1ca.
Istraživanje je prvo sačuvano na grani:
c5d2a38ba9fa5d43dc43850cccc28fd5c095de51 / [T-P10y-research.md](T-P10y-research.md).
Normativni ugovor: [PLINTH_SPEC P-28](../../PLINTH_SPEC.md#p-28-lokalna-screenshot-ekstenzija-predlog-2026-11-06).

## Ovaj PR

Jedna planska isporuka: research, zaseban spec-only P-28 commit i ovaj
ticket. Ne menja runtime, dependency, workflow, guard ili fixture.
TODO(spec): F1/F4/F6/F7 zatvaraju se tek usvajanjem P-28.
Review proverava obim, privatnost, izvodljivost i da tekst ne tvrdi test PASS.
Pregledani main trenutno nema otvoren PR; pre narednog rada proveriti ponovo.

## Korisnički rezultat koji sledeći ticket treba da izgradi

Klik na Plinth ikonicu -> vidljivi deo HTTP(S) stranice -> lokalni Plinth
editor sa slikom -> postojeći 3D prikaz i PNG izvoz.
Radni engleski naziv: Plinth - Screenshot to 3D Mockup.
Dugme za ponovno snimanje zahteva novi eksplicitni klik. Greška jasno kaže
šta nije uspelo. Ekstenzija nema aktivne Pro/naplata/account kontrole.

## Nastavak implementacije nakon merge-a plana

Novi ticket T-P10y-impl mora prvo proveriti svež main, AGENTS/spec/handoff,
build environment i izmene koje su u međuvremenu spojene.
Koristi zajednički engine, ne kopiranu dist verziju web sajta.

Predviđen ograničen write set:
- extension/manifest.json, service-worker i njegov test, trusted editor
  adapter i test, lokalna error/help stranica, ikone sa utvrđenim poreklom.
- Posebna extension Vite konfiguracija, scripts/build-extension i package
  skripta, npm skripte; bez promene postojećeg web build rezultata.
- src/main.ts i src/screen/load.ts za request-bound accepted rezultat i
  vezivanje adaptera; postojeći loader testovi ostaju uz additive slučajeve.
- src/state/share.ts ili mali share-base adapter za P-28(7); native web i
  preview ponašanje ne menjati. Novi literalni testovi oba build target-a.
- Additive guards/extension*.test.ts, postojeća analytics/no-network/input
  proširenja i runtime extension e2e harness; nema guard sužavanja.
- README, LICENSES samo kada postoje nove zavisnosti/asset licence,
  extension privacy/support/install dokument, ticket i dokaz validacije.
- Bez PLINTH_SPEC, fixtures, dependency pin promena ili novih CI workflow-a.
  Ako postane potreban širi write set, dokumentovati razlog pre izmene.

## Kriterijumi prihvatanja

1. Pravi loaded MV3 extension: capture kroz korisničku akciju, fixture sa
   poznatim asimetričnim bojama, stvarno dekodirana slika u editoru i PNG
   preuzet kroz postojeći UI. Mock Chrome API test sam nije dovoljan.
2. Manifest sadrži tačno activeTab/storage/alarms. Nema broad host pristupa,
   content script-a, remote skripti ili analitike u extension paketu.
3. Proveriti P-28(2–5) identity/race, single pending, TTL/cleanup i ACK granice,
   uključujući storage zapis preko 8 MiB, worker restart i zakašnjeli alarm.
   Posle timeout-a ne prihvatati podatke ni kada alarm još nije izvršen.
4. Screenshot ne ide u HTTP, log, analytics, shared URL, persistent/sync store;
   sentinel iz slike/source URL-a ostaje odsutan sa tih površina.
5. Uspešan import dobija Fill i praznu history osnovu; noviji ručni upload,
   failed decode, busy/recovery i superseded rezultat nisu successful ACK.
6. Svi postojeći uređaji, PNG skale i share/restoration ostaju; primer
   exported PNG ima sadržaj fixture-a, a javni share link samo scenu/demo.
7. Pokrenuti Linux npm ci, npm run ci i npm run build na base/candidate po
   projektnim pravilima; novi extension build/package/harness zasebno.
   Proveriti pakovan artefakt, lokalne asset putanje, CSP i offline editor.
   Zadržati postojeće cloud CI/PG/PNG rezultate za tačan head bez duplih
   dispatch-a. Svaka neizvršena provera je pending, ne PASS.
8. Negativni seed-ovi: pogrešan sender/tab, replay, lažni ACK za superseded
   request, procurena image data u URL i broad permissions moraju pasti.
9. Nezavisni fresh-context reviewer objavljuje MERGE/FIXUP na PR-u.
   Owner odlučuje merge i kasnije Store objavu. Nema physical GPU/Safari
   ili CWS ranking tvrdnje iz Linux testa.

## Trenutni dokazi i ograničenja

- GitHub connector čitanje/pisanje i pinovano stablo dostupni.
- Lokalni GitHub transport nije potvrđen; gateway traži lokalni credential.
- Dokumenti su pregledani prema aktuelnom izvoru i primarnim Chrome izvorima.
- Runtime/build/PG/PNG nisu pokretani za docs-only plan; nema runtime izmena.
- Unpacked paket, Store nalog/listing/upload i javna objava: još nisu urađeni.
- CWS monthly keyword volume nije utvrđen u istraživanju; nema obećanog ranga.
