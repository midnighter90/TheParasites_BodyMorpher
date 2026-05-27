# Development Log - The Parasites BodyMorpher

Status date: 2026-05-25

This file documents the relevant research, trial-and-error work,
implementation decisions, packaging steps, and release checks that led to the
BodyMorpher v1.0.0 release.

## Starting Point

BodyMorpher began as an offline save editor for character body values in The
Parasites. The immediate goal was to correct body state after character
creation or later gameplay changes, because the tested game build did not
provide an in-game correction path for every relevant value.

The scope later expanded to include:

- direct body values
- morph map values
- character skill values
- Totem/parasite skill levels
- Entity currency

## Save Research

1. Save slot layout was inspected.
   - Save slots are stored below the standard The Parasites local save folder.
   - The relevant files for this tool are:
     - `Player.sav`
     - `TPS_BaseSaveGame.sav`

2. Save compression was analyzed.
   - The Parasites uses Unreal/Oodle-Kraken compressed save chunks.
   - The same portable decode/encode approach used by the companion save tools
     was reused here:
     - chunk magic `0x9e2a83c1`
     - header marker `0x22222222`
     - header size 49 bytes
     - Oodle/Kraken compression
     - chunk size up to `0x20000`

3. The Unreal property layout in `Player.sav` was inspected.
   - Many body, morph, and progress values are stored as `DoubleProperty`.
   - Some true level values are stored as `IntProperty`.
   - Property names and map keys are stored as Unreal-style strings.

4. The morph map was located.
   - Relevant morph values are stored in an `OldFatMorpth`-style map.
   - Observed morph names include:
     - `SS Belly Shape Fat 1`
     - `SS Thigh Inflate`
     - `SS_Thigh_Inflate`
     - `SS Hip Size 1`
     - `SS Arm Size`
     - `SS Glute Size 3`
     - `SS Calf Type 1`
     - `BC Breast Size`
     - `BC Breast Sag1`

## Body Value Trials

1. Existing saves were read first.
   - `BodyWeight` and `ChestSize` were found as direct `DoubleProperty`
     values.
   - Morph values were found separately in the morph map.

2. The body weight scale was tested.
   - A visible in-game weight near 56 kg was used as the first reference.
   - `BodyWeight = 0.95` resulted in roughly 58 kg.
   - `BodyWeight = 1.5` was saved back by the game at roughly 59 kg.
   - The working estimate became:

```text
BodyWeight 0.0 ~= 46 kg
BodyWeight 1.0 ~= 59 kg
kg ~= 46 + BodyWeight * 13
```

3. Game-side clamp behavior was observed.
   - The game was observed to clamp `BodyWeight` and `ChestSize` back into the
     `0..1` range when saving.
   - Morph values behaved differently.

4. Morph values were stress-tested.
   - Known morph values were set to `1.0`.
   - Then they were set to `0`.
   - Then they were set to `2.0`.
   - Values that did not reset were then tested at `5.0`.
   - Result:
     - `2.0` survived an in-game save.
     - `5.0` also survived, but produced extremely distorted results.
   - This led to recommendations rather than hard limits for morph values.

## Body Editor Implementation

The main implementation lives in:

```text
app/BodyMorpher.mjs
```

Important implementation pieces:

- Oodle/Kraken decode and encode
- save slot listing for `savegame_*`
- `Player.sav` analysis
- reading and writing:
  - `BodyWeight`
  - `ChestSize`
  - known morph values
- `--set-all`
- `--set-morphs`
- `--set` for individual values
- interactive menu
- automatic backup before every write
- restore command
- post-write verification by decoding the written file again

`BodyWeight` is displayed with an estimated kg value in:

- `--analyze`
- the interactive individual-value editor
- the planned-change summary before writing

## Skill Research

After the body editor worked, saves were inspected for character skill values.

Observed `Player.sav` fields:

- Run:
  - `RunLevel`
  - `CurrentR_48_E44DEDF2481BFE30D93608AF0829FB89`
  - `ExponentiallyR_46_F285A159483D01385436A2B48DC384F5`
  - `RunPower_44_7FF736B54F69EDF04D2F579469713BEE`
- Jump:
  - `CurrentJ_39_94D3C41E4B72767B054707ABAD91EDD2`
  - `JumpHeight_42_3A76B27848DF699A715929986FA4A3D4`
  - `ExponentiallyJ_40_E1F3667C4D3CAA88B508CFB5A7DE0E76`
- Unarmed:
  - `CurrentUA_35_A9C1EE354C2568D006E0C59DEA7FE304`
  - `ExponentiallyUA_34_6BABD40748C06C5DD28E649AC625F9E8`
  - `DamageUA_36_C74A12734E8F1F2132613DA21049E950`
- Axes:
  - `CurrentAxe_57_DF69A36F480CCD396B01739F9D28FD08`
  - `ExponentiallyAxe_56_0EE9A8B640428E46720B4EB9D34F29B6`
  - `DamageAxe_55_355AE3574379005F33ED3196F43B028C`
- Bows:
  - `LevelBow_70_5BB2DAE64F0E7B2713C401B56A36648A`
  - `CurrentBow_66_745E110344F826BC9FEEA1B855065D7B`
  - `ExponentiallyBow_65_94ED206948F150B46DF4739489A5D90F`
- Pickaxes:
  - `CurrentPickaxe_80_7C3D4BDF4B7C299B74F61C95984E8073`
  - `ExponentiallyPickaxe_79_4E70EE0B434987BF12D3DEAC406235EF`
  - `DamagePickaxe_78_6E18BE334EBF475948643CB1B7D075B5`
- Wood Cutting:
  - `CurrentWC_37_EE93AEA54AF3000E4C3642A6224308EC`
  - `ExponentiallyWC_38_8AEF62F341EB8EEB428F54932D5FE98B`
  - `ChoppingStrength_25_D1725348456D1BE1130DA6892717D852`
- Build:
  - `LevelBuild_85_C5CC534B4DE8ACD0DFB400919501337B`
  - `CurrentBuild_90_6D9646C141AE3D15E132B883BABFAFF7`
  - `ExponentiallyBuild_91_9ECB053549AB51E61FF1E4A510071DB8`
- Control:
  - `Control_TP_LVL_94_32D83B9A4AD65A3513193AB60757A446`
  - `Current_C_TP_LVL_99_CED1D88F4D52152DAFC762A94D5BD318`
  - `Exponentially_C_TP_LVL_97_EDCD4BC04F00359A7BD4A7A60838A153`
- Merger:
  - `Merger_TP_LVL_102_555521D94CFCE4BF23C19E9AFF29CE0B`
  - `Current_M_TP_LVL_106_57F84FAF489866A9AAF4C79BEE70DABC`
  - `Exponentially_M_TP_LVL_104_FF9B807D4692F5C712165683D57BBE79`
- Entities:
  - `Entities_12_2513650B4E423EB94AA00DAA64EA9B8F`

Not observed in the tested saves:

- no separate `JumpLevel` integer field
- no persistent `Small Arms` save value

## Totem Research

The following public wiki pages were used for domain checks:

- `https://theparasites.wiki.gg/wiki/Skills`
- `https://theparasites.wiki.gg/wiki/Totem`

The following map was found in `TPS_BaseSaveGame.sav`:

```text
Save_Current_Skill_Level_6_640A898B47AF4D2A8749C89B4E7EA387
```

The map contains Totem/parasite skill keys, for example:

- `SharpVision`
- `Regeneration`
- `ThickBlood`
- `OakLeather`
- `StrongBones`
- `TitaniumBack`
- `Absorption`
- `RadiationRemoval`
- `RadiationResistance`
- `SlowMetabolism`
- `Camel`
- `Owl`
- `FrostResistance`
- `HeatResistance`
- `StoneSkin`
- `StrongImmunity`
- `Telekenesis`
- `Wings`
- `intuition`
- `Mentality`
- `StaminaWings`
- `Possession`

The first implementation treated Totem values as freely scalable levels. That
was corrected after checking the wiki's `Cost` column:

- one `Cost` entry means a one-time unlock with max level 1
- multiple `Cost` entries mean that many levels
- direct inputs above the known max level are rejected
- bulk `--set-all-skills 10` caps each known Totem skill to its own maximum

Examples:

```text
--sharp-vision 1
--regeneration 4
--owl 6
```

## Skill and Totem Editor Implementation

Added CLI commands include:

```text
Start_BodyMorpher.cmd --analyze-skills savegame_5
Start_BodyMorpher.cmd --set-all-skills savegame_5 10 --yes
Start_BodyMorpher.cmd --set-skills savegame_5 --run-level 10 --jump-level 10 --build-level 10 --yes
Start_BodyMorpher.cmd --set-skills savegame_5 --control-level 10 --merger-level 10 --entities 5000 --yes
Start_BodyMorpher.cmd --set-skills savegame_5 --sharp-vision 1 --owl 6 --yes
```

Important behavior decisions:

- The editor only writes fields that already exist in the save.
- It does not insert new morph names or new Totem skill names into maps.
- Missing skills are skipped instead of being synthesized.
- Character skill-like values are not hard-capped because many are stored as
  current/progress `DoubleProperty` values.
- Totem skills are capped according to the known wiki level counts.

## Documentation and Repository Layout

The public package was prepared with:

- `README.md`
- `README.txt`
- `README_INSTALLATION.txt`
- `CHANGELOG.md`
- `CHANGELOG.txt`
- `RELEASE_NOTES_v1.0.0.md`
- `VERSION.txt`
- `PUBLISHING.md`
- `LICENSE.md`
- `COPYRIGHT_AND_TERMS.txt`
- `THIRD_PARTY_NOTICES.md`
- `THIRD_PARTY_NOTICES.txt`
- `MANIFEST_SHA256.txt`
- portable `runtime`
- CMD launcher

No personal local paths, save contents, or private machine-specific locations
are required by the public package.

## License and Copyright Work

The release uses the same custom restricted source-available terms as the other
companion tools:

- source is available for inspection
- personal, non-commercial use is allowed
- personal, non-commercial modification is allowed
- rehosting, mirroring, reposting, repackaging, and hosting on other websites
  are prohibited
- commercial use is prohibited
- no warranty
- no support obligation
- no future compatibility guarantee

The Oodle notice was aligned with the companion tools and with the
WorkingRobot/OodleUE EULA notice wording.

## GitHub and Release Work

Release preparation steps:

1. Create the repository.
2. Add the portable runtime.
3. Build the initial v1.0.0 release ZIP.
4. Add the skill editor.
5. Add the Totem/wiki level mapping.
6. Correct Totem level caps.
7. Add prompts that show current values and estimated kg for `BodyWeight`.
8. Rebuild `MANIFEST_SHA256.txt` after package changes.
9. Rebuild the release ZIP after relevant changes.
10. Push `main`.
11. Move the `v1.0.0` tag to the final release commit.
12. Add a GitHub release with the tested ZIP asset.
13. Add README guidance that users should download the release ZIP, not the
    automatically generated source archive.

## Verification

Checks performed during release preparation included:

- `node --check app/BodyMorpher.mjs`
- `--help`
- `--recommendations`
- `--analyze`
- `--analyze-skills`
- write tests on temporary save copies
- negative test: `--sharp-vision 10` must fail
- bulk test: `--set-all-skills 10` must cap Totem skills
- BodyWeight test with kg output
- manifest verification
- ZIP extraction
- manifest verification against the extracted ZIP
- check that `.git`, backup folders, and duplicate runtime package copies are
  not included in the ZIP
- Git status, remote branch, and release tag checks

## Result

BodyMorpher is a portable offline save editor for The Parasites. It can edit
existing body values, morph values, discovered character skill values, Entities,
and existing Totem/parasite skills. The tool creates backups, writes only
existing save fields, verifies written files by decoding them again, and shows
`BodyWeight` with an estimated kg value.
