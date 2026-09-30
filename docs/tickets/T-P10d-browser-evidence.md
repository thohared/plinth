# PR #42 focused browser evidence

This branch exists only to obtain the missing seeded-browser proof requested by
review 5370764437. Do not merge this branch. PR #42 remains unchanged at
91fa2f67b2581c352b4796db78093115936ce011 (tree
a8db74c3142b738bf0d6fda6583fab8facbf171d).

Local browser installation was attempted on Linux but the browser CDN returned
195 bytes of HTML titled Site Unavailable instead of the pinned archive. The
successful full CI, PG and PNG runs already installed that pinned browser on a
GitHub Linux runner. Reuse their results; run only this missing focused probe.

The evidence-only workflow checks out the immutable reviewed source, asserts
its SHA/tree, installs its pinned dependencies/browser, and runs the exact
existing upload guard with PLINTH_LIVE_SEED=upload. It requires exit 1 and the
specific Cover/Contain assertion at guards/live-feedback.test.ts:77; an install,
launch, route-setup or other assertion failure cannot satisfy the check. It
then runs the same focused guard without the seed and requires exit 0 and clean
source. Raw logs, exit codes and source/environment identity are uploaded.

The eight unrelated cases in that file are filtered by the specified test name;
no guard file is edited or skipped in source. No full CI/PG/PNG rerun, additional
PR, production/source/spec/fixture change, paid API or physical-device claim.
Builder supplies evidence only; the independent reviewer owns the verdict.
