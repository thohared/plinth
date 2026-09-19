# T-P9e — owner-approved final references

PG-3(b): Novak approved the final Plinth images and asked to resolve the pending
PRs: “Odobravam one slike. Treba da se rese isto ono pr-ovi” (2026-09-18).
This follows his earlier acceptance, “To je to. Odobravam ovako. Ako nadjem u
buducnosti nesto dsto treba da se popravi, javljam”. The images reviewed in
`Plinth-PR29-CI-pregled.html` were the unmodified CI candidates linked below.
Codex performs the mechanical transfer on the owner's instruction; it does not
select new images, rerender, sharpen, resize, or change a comparison threshold.

## Exact source

- [PG #121 / run 35291033788](https://github.com/thohared/plinth/actions/runs/35291033788).
- [pg-candidates artifact 10527036418](https://github.com/thohared/plinth/actions/runs/35291033788/artifacts/10527036418).
- Artifact ZIP SHA256: `0406c635ce77c4d297a7c0c95ed65e9a74d3743d5a04dfba15764cfe28db7424`.
- Source PR #29 head: `c2bfbe5c8f988db53795d46ef535272eb51f0df9`.
- CI merge: `e83b7062bba1bea6588b9c45fbe546dcb47724ef`.
- Both source and CI merge tree: `23eced7bca92df1f48e8597b4b3b87de75575923`.
- Source result: **FAILURE**, 60 captures, zero missing baselines, 20 differences
  against the previous T-P5 references. This approval does not relabel that run
  as PASS. New CI comparison results must be reported separately.

## Scope and acceptance

The 45 existing PNG references are replaced byte-for-byte from that artifact.
The 20 device × scene files remain the automatic PG comparison set at
1280×800/DPR1. The other 20 pose + five aspect files remain approved visual
references; the capture script does not automatically diff them. The additional
15 panel/composition/background/share/help captures stay in the original CI
artifact. Diff images and the contact sheet are not baselines.

This standalone commit changes only `fixtures/pg/`. Application code, source
images, thumbnails, specification, workflows, capture cases, guards and test
thresholds are unchanged. The approval is for the final cumulative PR #29
result, which includes the commits from #25 → #27 → #28. It is not a separate
approval of their superseded intermediate renderings. The earlier T-P5 receipt
and hashes remain available in Git history at baseline commit `30122fa`.

The independent code reviews below reported no remaining code fixups on their
respective heads; their overall verdicts remained FIXUP for owner baseline
approval and/or dependency acceptance. They are prior evidence, not approval of
this new commit or a self-authored MERGE verdict:

- [#25 review 5223201087](https://github.com/thohared/plinth/pull/25#pullrequestreview-5223201087), head `209841ddd8a2272a3b4b6b1f299de0df4b41b00d`.
- [#27 review 5223320815](https://github.com/thohared/plinth/pull/27#pullrequestreview-5223320815), head `edfe4ea86da2ac2a3881ad70ece3d185bcaf2cc5`.
- [#28 review 5220953563](https://github.com/thohared/plinth/pull/28#pullrequestreview-5220953563), head `0914fa5b2a30be62523c2e705dc3cb7c3cac49bc`.
- [#29 review 5243237578](https://github.com/thohared/plinth/pull/29#pullrequestreview-5243237578), head `c2bfbe5c8f988db53795d46ef535272eb51f0df9`.

PR #29's source-head CI #134 (35291033887) passed 92 guards, typecheck and
207 units; PNG #18 (35291033782) passed 15 sizes and 400 combinations.
A fresh independent acceptance review and the required checks remain merge
conditions under §7. Physical Safari validation and the §6 performance/release
gates remain separate obligations. No new resolution, touchpad or other product
fix is claimed by this baseline transfer.

## SHA256 of each transferred PNG

| File | SHA256 |
|---|---|
| aspect-browser-16x9.png | `ca8ba5a3acfb7e4b531ab32f27e31eb7476b5bcdacb99d5618bd5a939dbe9705` |
| aspect-card-3x1.png | `539374bd870d6c2739c5f08374433b27bc20edbb3f2d0002947db1f0127c6919` |
| aspect-laptop-9x16.png | `4400dc2a3ee6263927fbc572b78982703aa2f7fc01349202ca2e5941e60a0d81` |
| aspect-phone-square.png | `812786e8d9f53e736777f435f048fec3646543f0b9beb7bb1fe1e474ad5be871` |
| aspect-tablet-4x5.png | `15cc6b4870c271e66a18e51629a052ed0431a0d713a7faaa7f03e2702a4aecdb` |
| browser-clean-white.png | `d83457c1ab93a21f090a1cc58c0c3c9c2652d9742a11fdf45a2cd93d11fc5364` |
| browser-dark-glass.png | `751ae8be9bcbfa9dd119a53d5752bf91de1237519bda28c83780a11ecd953d70` |
| browser-soft-studio.png | `8e12560dca288bb5f4a891996716d694fec9400570c4c6102edec2017fdf58c9` |
| browser-warm-sunset.png | `d921d13e79087e43192a656251ec9d74516b95797eb694811ac85f3ebeeff9c0` |
| card-clean-white.png | `4cea3ec96c998b7f69332fc1a370538e69e4f12b16c8dc833044977892a699e1` |
| card-dark-glass.png | `8ddd0e354881bb3d3e123a6f15c48636a198656662794702836144968ae85751` |
| card-soft-studio.png | `be6ef2c6611302548484cc1314d72faac7a77d7ece54531fc5b6e79a1ecf78c2` |
| card-warm-sunset.png | `92d5e664aea779e7df78241cbb854b31bfdccd1fb41698b357329c7d41047cf3` |
| laptop-clean-white.png | `a44600459e7059152ef460ffacb91ace27d0bdba0c24c985431c0166d9563542` |
| laptop-dark-glass.png | `9a659696fdaf44924ba42db729d75fd2ca12fab181e1b7e49ed8c07e992eebb9` |
| laptop-soft-studio.png | `b52fe8aff598354be65ad81da64d5afccffd4007718cd04b103c37d6eb63eb69` |
| laptop-warm-sunset.png | `e24c3787b93046af0165f1a9bbdb56f057650728eff6019d0f733d486f138851` |
| phone-clean-white.png | `f6734d3a29ff1d302054090a36b5c026d3ba7c4547cd25c175d0e74a5c47ff00` |
| phone-dark-glass.png | `80d8ae22d4ce2d2c6062897f62e4bb93b5d484bba78a93dbee588adfacf97351` |
| phone-soft-studio.png | `df1756b40dcdeb7f6b3e57d30408649e00c84a866ccb4b3b2448ef80b871bf08` |
| phone-warm-sunset.png | `f34fd329e852d00236fb257d861df791af6f26d78260f4e1f5d99081fcf18f4d` |
| pose-browser-front-reference.png | `1dc9a047bbafebfa4ab6b6f4d866a529cdf5cdb1d872c06f06e7af75a1007a9c` |
| pose-browser-hero-reference.png | `8e12560dca288bb5f4a891996716d694fec9400570c4c6102edec2017fdf58c9` |
| pose-browser-lean-reference.png | `2901b8e966b4f18bfdac5d172df26a8aa187c360b2b926af778e677d8c4a6d68` |
| pose-browser-top-reference.png | `431af7f75b368267fae8947a2c1d60c6bdf0a034c2aacd0f33d882c376f2782f` |
| pose-card-front-reference.png | `01d65fdd8251bee140b4fad688809e5c573937c7604598aefbc2030f215126c0` |
| pose-card-hero-reference.png | `be6ef2c6611302548484cc1314d72faac7a77d7ece54531fc5b6e79a1ecf78c2` |
| pose-card-lean-reference.png | `cb8504a01ff0aa51f10bc1554ddf34912ad1a5f90ebca1835c957fd330d0ed0a` |
| pose-card-top-reference.png | `91fbe0c5f11dd5c87183810575a7c7b3cadfd2725df63b45f54f85b5ccd4470c` |
| pose-laptop-front-reference.png | `9b721da90cd19386ca083081bd993a6551926c9bab2bc87132fc5f1944913fca` |
| pose-laptop-hero-reference.png | `b52fe8aff598354be65ad81da64d5afccffd4007718cd04b103c37d6eb63eb69` |
| pose-laptop-lean-reference.png | `267e43794fdc5ed31bb9d62cfea4ab632a03c3b65119542b9100b7298161ea19` |
| pose-laptop-top-reference.png | `00e48af92eefa12c38886cb890dc97d9d543c5d29295e2b2b19c0ab589e92cbc` |
| pose-phone-front-reference.png | `c08998745229ae60cbbb1ed9d091f316b46021031a76e7f55653c4f895e56295` |
| pose-phone-hero-reference.png | `df1756b40dcdeb7f6b3e57d30408649e00c84a866ccb4b3b2448ef80b871bf08` |
| pose-phone-lean-reference.png | `981655f4d2c1e765a439fb137ea8997e63062a59bfe997de3c72050342dc82b5` |
| pose-phone-top-reference.png | `14304eb50911a004246a2ec7f0a05f777e9f50cc2b25a3886dead4e69c2011bf` |
| pose-tablet-front-reference.png | `147f299c50db29e966b7b2ce5f249e5f1ef137f0a94b41fefe56f6f67f725e40` |
| pose-tablet-hero-reference.png | `e78f2aed30d2b1b4f5f84b0aa55eb160f713d50811d815982b3d531232f39ae4` |
| pose-tablet-lean-reference.png | `12138cc334546ba6c11f9b660eb72bde1da902e6f9ed1987fe616cb25416810c` |
| pose-tablet-top-reference.png | `a92eab8ac5ac5779cf86de379dd24799144f66fb4de692a3c8c6d04962a82102` |
| tablet-clean-white.png | `d0b28b4f42afd2692af790bba0b67bc4c7043dd5b7c9a502ab5b59a89a0693e3` |
| tablet-dark-glass.png | `cd59d3572d293fc17a209b4448833186d2f3e531e6cc919a6743db238303e178` |
| tablet-soft-studio.png | `e78f2aed30d2b1b4f5f84b0aa55eb160f713d50811d815982b3d531232f39ae4` |
| tablet-warm-sunset.png | `45396adb4e7c510dde0b354caca1b2bf48d3a7299008f4756cf20a69d376ecf2` |
