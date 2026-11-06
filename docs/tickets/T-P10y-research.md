# T-P10y: Plinth ekstenzija, istraživanje pre implementacije

Datum: 2026-11-06. Autor: Codex (GPT-6), planska sesija.
Inspected main: 0a1936d0e963d73aefa6aa2d8752ae155ac4c1ca.
Zajedničko znanje: thohared/astra-runner @ a8f055fe81a602cab1481804ae10853bf07ce2a4;
handoff README/INDEX/SOURCE-POLICY pročitani u ovom razgovoru, SHA ponovo potvrđen.
Ovo je plansko istraživanje, bez runtime izmena, test PASS-a ili objave.

## 1. Koje klauzule dotiče zadatak?

§1: screenshot-to-PNG obećanje. §2.1: generički uređaji; §2.2–2.3:
mreža, slika u tabu i skladištenje; §2.4–2.7: licenca, zaseban spec commit,
nezavisan review i istraživanje. §3: isti Vite/TypeScript/Three.js izvor.
§4.1: novi ulaz slike; §4.6: postojeći PNG; §4.8: javni scene link;
§4.9: postojeći editor. P-9: dekodiranje/cap; P-13: boja/alpha/izvoz;
P-14/P-21/P-22: adresa/share; P-19: PNG obim; P-20: analitika;
P-23: history reset posle prihvaćenog unosa; P-24 samo kada bude implementiran.
§6/§7 ostaju bez promene. Predlog nove dopune je P-28.

## 2. Koji file:symbol to danas implementira?

- src/main.ts:238–252, loadSelectedImage / setImage: dekodiranje, mount,
  render, prepareUpload i history.clear. To je put koji adapter treba da koristi.
- src/main.ts:505–516, select i change/drop/paste listeneri: postojeći ulazi.
- src/screen/load.ts:15, imageBlob; :29, validateFormat; :42, loadImage:
  lokalna slika, provera formata, native decode, cap i downscale.
- src/screen/load.ts:66–84, latestImageLoader: superseded decode se odbacuje;
  Promise<void> ne razlikuje prihvaćen i superseded zahtev.
- src/settings.ts:108, prepareUpload: Fill screen kada je fillUploads omogućen.
- src/main.ts:360–372, navigation/sharing povezivanje, i src/state/share.ts:
  Copy link i rezultat clipboard operacije; postojeći web URL ostaje web-origin.
- src/analytics.ts:7–19, analyticsAllowed: production root allowlist;
  extension origin nije odobren za analitiku.
- package.json:10–19: web build, ci, PG i PNG skripte.
- Rekurzivno stablo na inspected main nema extension manifest ili extension
  adapter. Nema captureVisibleTab/transport ugovora u specifikaciji.
- AGENTS.md: gap -> TODO(spec) i stop implementacije; P-5 određuje
  da dopuna specifikacije mora biti poseban commit.

## 3. Šta nedostaje ili nije pokriveno specifikacijom?

F1. Novi capture ulaz i između-kontekstni prenos nisu dozvoljeni postojećim
§4.1/§2.3. Potreban je uski P-28 pre koda. Nema pronađenog extension koda
van specifikacije; ovo je zahtev za novu površinu.

F2. Upakovani postojeći editor iz istog izvora izbegava host permissions,
content scripts i zavisnost od trenutno objavljenog web adaptera. Web i
extension build moraju koristiti iste module, bez druge renderer kopije.
Build mora potvrditi lokalne putanje asseta, CSP i odsustvo analitike;
postojeći web build nije dokaz da extension build radi.

F3. Capture se radi samo na eksplicitni klik, za HTTP(S) aktivni tab
u njegovom prozoru, pre otvaranja editora. Promena taba/navigacija tokom
capture-a zahteva odbacivanje; proveriti događaje i identitet pre/posle.
Ovo je naša uža produktna politika, ne tvrdnja da Chrome API ne ume
da snimi druge vrste stranica.

F4. MV3 worker može biti prekinut. Predlog: najviše jedan privremeni pending
capture u storage.session, dostupan samo trusted extension kontekstima,
vezan za tačan editor tab i jednokratni zahtev. Ukupan serialized record
najviše 8 MiB; bez silent downscale-a radi kvote. TTL za preuzimanje 120 s.
Čišćenje na ACK/error/close i alarmom; rok se uvek proverava pri potrošnji.
Alarm može kasniti, pa ne obećavati fizičko brisanje u tačnoj sekundi.
Nema storage.local/sync, baze slika, source URL/title ili plaćenog API-ja.

F5. latestImageLoader Promise<void> nije dokaz mount-a konkretnog zahteva.
Implementacija mora dati request-bound accepted/superseded/error rezultat,
bez promene postojećeg latest-wins ponašanja. Korisnikov noviji file/paste
u otvorenom editoru ima prednost nad zakasnelim capture-om.

F6. Extension URL nije prenosiv scene link. P-14(4) traži uski izuzetak:
Copy link u upakovanoj verziji koristi canonical web root i postojeći v2
encoder bez slike/tokena. Automatski extension URL ostaje lokalni scene URL.
Web/preview Copy link ostaje na svom origin-u.

F7. Privacy copy mora razlikovati privremeni lokalni prenos source tab ->
extension session -> editor od post-mount slike koja ostaje u editoru.
P-20 nije dozvola za extension analytics. Nema novih događaja praćenja.

F8. Pristup GitHub connector-u radi; običan GitHub Git transport ne daje
upotrebljiv rezultat u ovom okruženju, a gateway traži lokalne kredencijale.
Nije potvrđen npm/Chromium build environment i nema tvrdnje da je gate prošao.
Planski PR je docs/spec-only. Implementacija zahteva nov environment preflight,
real loaded-extension capture test i nezavisan review. Nema automatskog merge-a.

## Primarni izvori, pregledani 2026-11-06

- https://developer.chrome.com/docs/extensions/reference/api/tabs
  captureVisibleTab i create; većina tabs operacija ne traži tabs permission.
- https://developer.chrome.com/docs/extensions/develop/concepts/activeTab
  privremena dozvola posle korisničke akcije.
- https://developer.chrome.com/docs/extensions/reference/api/storage
  session je memorijski, briše se pri restartu/reload-u; 10 MB novija kvota.
- https://developer.chrome.com/docs/extensions/reference/api/alarms
  alarm može kasniti; potvrđivati expiry nezavisno od callback-a.
- https://developer.chrome.com/docs/extensions/reference/manifest/content-security-policy
  upakovani skriptovi, bez remote/inline izvršnog koda.

Market research iz prethodnog razgovora nije test ni dokaz CWS volume-a.
Radni listing naziv: Plinth - Screenshot to 3D Mockup.
