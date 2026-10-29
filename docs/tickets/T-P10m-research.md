# T-P10m: čitljive adrese scena

Autor: Codex (GPT-6), 2026-10-28. Baza:
`55812329bc4838f57f6bd7a1f5b7308756d6604b`.
Vlasnik je uz snimak adresne trake zatražio da adrese budu čitljivije
na celom sajtu. Ovo nije zahtev za promenu tipografije editora.
Zajednički handoff pročitan na `c518ec35d8d500d1edf05f3a2dfcc8b433bbd347`.

## Nalazi pre implementacije

- F1: §4.8/P-14(1,4) trenutno izričito određuju base64url JSON.
  `src/state/codec.ts:encodeHash` ispisuje svako polje, uključujući standardnu
  geometriju. `src/state/navigation.ts:write` upisuje ga u adresnu traku za
  svaku dovršenu promenu. To je uzrok prijavljenog dugog nečitljivog koda.
- F2: `decodeHash` i `decodeV1` već odvajaju transport od validiranog stanja.
  Čitljiv fragment sa nazivom uređaja i samo izmenjenim vrednostima može
  obnoviti potpuno isti DTO bez promene rendera, slike ili PNG-a. Podrazumevane
  vrednosti transporta moraju biti zamrznute po verziji, odvojeno od budućih
  promena UI preseta. Preciznost brojeva se ne smanjuje.
- F3: P-14(2,3) zahteva trenutnu prikazanu pozu, stare linkove, navigaciju,
  oporavak i očuvanje neispravnog ulaza. Postojeći navigation modul poseduje
  replaceState i 250 ms odlaganje. Validan stari link može preći u čitljiv
  oblik tek nakon uspešnog učitavanja. Neispravan/noviji format se ne briše.
- F4: `src/state/share.ts:createShare` koristi isti encoder preko snapshot-a.
  Nova adresa zato mora važiti i za Copy link, ručni fallback i reload.
  §2.2–2.3/P-20 privatnost ostaje: bez slike, query tokena, servera, storage-a,
  skraćivača ili novih zavisnosti. Analytics i canonical ostaju bez fragmenta.
- F5: Postojeći browser guardovi proveravaju vraćanje slike, poze i podešavanja,
  ali na nekoliko mesta ručno dekodiraju base64 izlaz. Te provere treba
  prilagoditi novom transportu uz iste semantičke asercije i postojeće literalne
  v1 ulaze. Dodatni literalni v2 testovi i seeded kvarovi moraju nezavisno
  dokazati čitljivost, strogu validaciju i kompatibilnost.
- F6: Ovo zahteva usku plansku dopunu P-21 pre implementacije. Korisnikov zahtev
  odobrava izmenu adresa; ne predstavlja merge, test PASS ili fixture bless.
  Nema drugih novih normativnih odluka. Render/export, UI izgled, pragovi,
  workflow-i i PG fixture-i ostaju van obima.

## Primarni tehnički izvori

- WHATWG URL, URLSearchParams: https://url.spec.whatwg.org/#interface-urlsearchparams
- WHATWG HTML, History.replaceState:
  https://html.spec.whatwg.org/multipage/nav-history-apis.html#dom-history-replacestate

Pročitano 2026-10-28. Koriste se ugrađeni browser API-ji, bez biblioteke.
