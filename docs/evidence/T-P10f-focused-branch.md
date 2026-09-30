# Evidence only, do not merge

This branch adds only the focused workflow and this notice. The workflow explicitly
checks out application head 569a9aeabd4b332ecb0fdf74518b0afdc505883c, tree cd551e15acb7cb2d07b14417e3af197cf3482439.
It runs two positive and three negative instances of one guard only, retaining
raw JSON, logs, source identity and exit codes. It does not rerun full CI/PG/PNG.
The application PR is #44; this branch is not an application change.
