# AppFinder: potvrda vlasništva

Vlasnik je 2026-11-10 dostavio AppFinder ekran za plinth-phi.vercel.app.
Izabrana opcija 2: javni plain-text fajl na /.well-known/appfinder-verification.txt.
Sadržaj mora biti samo dostavljeni token; rok sa ekrana je 2026-11-24.

## Obuhvat i provera

Dodaje se public/.well-known/appfinder-verification.txt. Vite koristi podrazumevani publicDir, pa fajl ulazi u dist/.well-known/ bez promene aplikacije. Ovo je javni dokaz kontrole domena, ne privatni API ključ.
Veza sa specifikacijom: P-2 Vercel objava iz main; §2.2–2.3 bez novih runtime poziva, backend-a ili naloga u Plinthu. Nema promene prikaza, renderera ili export-a. Trivijalan statički dodatak; nema novog istraživačkog ili performance zahteva.

Acceptance: tačan token i putanja; postojeći CI/build; nezavisni pregled tačnog head-a. Posle vlasnikovog merge-a proveriti produkcioni HTTPS odgovor i koristiti AppFinder Check file. Sam PR nije dokaz objave ili uspešne verifikacije.
