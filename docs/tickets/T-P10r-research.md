# T-P10r: neuspešno pokretanje studija

Codex (GPT-6), 2026-10-30. Baza: 45b5439c401620b90a5197dee311a39f580d482e.

1. Odredbe: §2.2–2.7, §4.1/4.9, §7, P-10(1), P-13(2), P-14(5), P-19.
   Jasna greška i ručni reload dopunjuju postojeći lokalni PNG tok.
2. Površine i nalazi:
   - F1: src/startup.ts catch prijavljuje neuspešan import samo tekstom.
     src/main.ts boot catch prikazuje sirovu poruku renderer-a.
   - F2: kontrolisana proba na identičnom main tree-u, 390/1280 × 844,
     blokiran main chunk ili getContext bez WebGL-a: greška je vidljiva,
     ali nema Reload dugmeta. Na telefonu je vodič nedostupan jer je panel
     skriven, a Settings onemogućen. Nema tvrdnje o kvaru stvarnog uređaja.
   - F3: index.html isporučuje postojeći #plinth-guide pre JavaScript-a.
     Može se premestiti u skrolabilan failure prikaz bez dupliranja teksta.
     Sakriti nedovršene kontrole i ukloniti readiness oznaku pri neuspehu.
   - F4: src/export/recovery.ts i panel.ts već rešavaju gubitak konteksta
     posle pokretanja. Njihov ugovor ostaje; novi prikaz važi samo za boot.
   - F5: guards/startup.test.ts pokriva uspešno učitavanje/upload/PNG,
     ali ne neuspešan import ili kreiranje konteksta. Dodati zaseban guard
     za oba uzroka, oba viewport-a, uputstvo, tastaturu i stvarni reload.
3. Nedostaje korisnički oporavak početne greške; nema nove domenske funkcije.
   TODO(spec): none. Nema storage-a, mrežnog servisa, novih zavisnosti,
   promene slike, renderer kvaliteta, performance budžeta ili baseline-a.
