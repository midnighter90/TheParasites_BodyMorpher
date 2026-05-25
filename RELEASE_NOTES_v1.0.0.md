# The Parasites BodyMorpher v1.0.0

Initial public portable release.

## Download

Use the attached release ZIP:

```text
TheParasites_BodyMorpher_v1.0.0.zip
```

## Usage

1. Close The Parasites completely.
2. Back up your saves.
3. Extract the ZIP.
4. Run `Start_BodyMorpher.cmd`.
5. Choose a slot, for example `savegame_5`.
6. Analyze the values first.
7. Edit selected values.
8. Load the edited slot in-game and check the result.
9. Save normally once in-game if the result is acceptable.

CLI examples:

```text
Start_BodyMorpher.cmd --analyze savegame_5
Start_BodyMorpher.cmd --set-all savegame_5 1.0 --yes
Start_BodyMorpher.cmd --set-morphs savegame_5 2.0 --yes
Start_BodyMorpher.cmd --set savegame_5 --body-weight 0.5 --breast-size 1.2 --hip-size 0.8 --yes
Start_BodyMorpher.cmd --analyze-skills savegame_5
Start_BodyMorpher.cmd --set-all-skills savegame_5 10 --yes
Start_BodyMorpher.cmd --set-skills savegame_5 --run-level 10 --build-level 10 --sharp-vision 10 --yes
```

## Purpose

Edits existing `Player.sav` body values for testing and repairing character
body state when the game does not provide a later in-game correction path.

Also edits discovered skill values in `Player.sav` and the parasite
skill-level map in `TPS_BaseSaveGame.sav`.

## Value Notes

Observed `BodyWeight` examples from local testing:

```text
BodyWeight 0.0 = about 46 kg
BodyWeight 0.5 = about 52.5 kg
BodyWeight 1.0 = about 59 kg
```

The game was observed to clamp `BodyWeight` and `ChestSize` back to `0..1`
when saving. Morph values above `1.0` survived local save/load tests, but
extreme values can look distorted.

Skill values:

```text
RunLevel, build level, bow level, and parasite skills are saved as integers.
Level 10 is a plausible cap based on local testing, but not enforced.
No explicit JumpLevel integer was found; jump is exposed as jump height and
jump progress/threshold stats.
```

## Target Version

Prepared for:

```text
The Parasites TP_Alpha_v_0.1.5.0.0
```

No compatibility is promised for other game versions.

## Terms

Source code is available for inspection, personal non-commercial use, and
personal non-commercial modification.

Personal, non-commercial use only.

No warranty. No support obligation. No future update guarantee. Use at your own
risk.

Reuploading, mirroring, reposting, redistribution, repackaging, paid
distribution, publishing modified versions, hosting this tool or its source code
on other websites, and all commercial use are prohibited without explicit
written permission from the copyright holder.

See `LICENSE.md` and `COPYRIGHT_AND_TERMS.txt`.
