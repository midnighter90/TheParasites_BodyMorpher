# Changelog

## v1.0.0 - 2026-05-25

Initial public portable release.

### Added

- Offline BodyMorpher save editor for The Parasites.
- Savegame slot listing and analysis for `savegame_*` folders.
- `Player.sav` Unreal/Oodle-Kraken decode and encode support.
- Editing for existing `BodyWeight`, `ChestSize`, and known `OldFatMorpth`
  body morph values.
- Skill analysis and editing for discovered character skills in `Player.sav`,
  Entities, and the saved Totem/parasite skill-level map.
- CLI commands for all values, morph-only values, and individual values.
- CLI commands for all known skill level or level-like values and individual
  skill values.
- Totem skill max levels based on the wiki `Cost` column, including one-time
  unlocks capped to level 1.
- Interactive menu.
- Full slot backups before write and restore operations.
- Restore command for BodyMorpher-created backups.
- Value guidance based on local testing, including rough kg examples for
  `BodyWeight`.
