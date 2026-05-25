# The Parasites BodyMorpher

Portable offline body value save editor for the Windows version of **The
Parasites**.

Prepared for:

- The Parasites `TP_Alpha_v_0.1.5.0.0`
- Windows
- Portable Node.js runtime included
- Unreal/Oodle-Kraken save chunk support included

No compatibility is promised for other game versions.

## What It Does

BodyMorpher edits existing character body and skill values in `savegame_*`
slots.

It reads `Player.sav`, shows the currently stored values, creates a full backup
before every write, patches selected existing `DoubleProperty` and
`OldFatMorpth` map values, repacks the save, and verifies the written file by
decoding it again.

The tool only edits values that already exist in the save. It does not add new
morph names or new Totem skill names to save maps.

Skill and Totem editing uses:

- `Player.sav` for character skill values, level-like progress values, and
  Entities.
- `TPS_BaseSaveGame.sav` for the saved Totem/parasite skill-level map.

## Editable Values

Direct body values:

```text
--body-weight       BodyWeight
--chest-size        ChestSize
```

Morph values:

```text
--belly-fat         SS Belly Shape Fat 1
--thigh-inflate     SS Thigh Inflate
--thigh-inflate-alt SS_Thigh_Inflate
--hip-size          SS Hip Size 1
--arm-size          SS Arm Size
--glute-size        SS Glute Size 3
--calf-size         SS Calf Type 1
--breast-size       BC Breast Size
--breast-sag        BC Breast Sag1
```

## Usage

Interactive menu:

```text
Start_BodyMorpher.cmd
```

List slots:

```text
Start_BodyMorpher.cmd --list
```

Analyze a slot:

```text
Start_BodyMorpher.cmd --analyze savegame_5
```

Set all known values:

```text
Start_BodyMorpher.cmd --set-all savegame_5 1.0 --yes
```

Set only morph values:

```text
Start_BodyMorpher.cmd --set-morphs savegame_5 2.0 --yes
```

Set individual values:

```text
Start_BodyMorpher.cmd --set savegame_5 --body-weight 0.5 --breast-size 1.2 --hip-size 0.8 --yes
```

Analyze skills:

```text
Start_BodyMorpher.cmd --analyze-skills savegame_5
```

Set all known skill levels and level-like values:

```text
Start_BodyMorpher.cmd --set-all-skills savegame_5 10 --yes
```

Set individual skills and skill-like stats:

```text
Start_BodyMorpher.cmd --set-skills savegame_5 --run-level 10 --jump-level 10 --build-level 10 --yes
Start_BodyMorpher.cmd --set-skills savegame_5 --control-level 10 --merger-level 10 --entities 5000 --yes
Start_BodyMorpher.cmd --set-skills savegame_5 --sharp-vision 1 --owl 6 --yes
```

Restore a backup:

```text
Start_BodyMorpher.cmd --restore <backup-folder-name> --yes
```

Custom save path:

```text
set TP_SAVE_ROOT=D:\Backup\TheParasites\Saved\SaveGames
Start_BodyMorpher.cmd
```

## Value Guidance

Body and morph values are not capped by BodyMorpher. Known Totem skills are
capped separately in the skill editor.

Observed `BodyWeight` behavior from local testing:

```text
BodyWeight 0.0 = about 46 kg in-game
BodyWeight 1.0 = about 59 kg in-game
kg ~= 46 + BodyWeight * 13
```

Rough examples:

```text
BodyWeight 0.25 = about 49.25 kg
BodyWeight 0.50 = about 52.5 kg
BodyWeight 0.75 = about 55.75 kg
BodyWeight 1.00 = about 59 kg
```

The game was observed to clamp `BodyWeight` and `ChestSize` back to `0..1`
when saving.

Morph values behaved differently in local testing:

```text
0.0 to 1.0  = normal-looking test range
1.0 to 2.0  = strong/extreme test range
2.0         = survived an in-game save
5.0         = survived an in-game save, but looked absurd
```

These are examples and recommendations only. BodyMorpher intentionally does not
block higher or lower values because this is a testing tool.

Skill values:

```text
Run, Jump, Unarmed, Axes, Bows, Pickaxes, Wood Cutting, Build, Control, and
Merger values were found in tested saves.
Some values are true integer levels, while others are double precision current
or progress values.
Local saves show many skill values in the 1..9 range.
Level 10 is a plausible player-skill test value, but BodyMorpher does not cap
player skill-like values.
```

No explicit `Small Arms` save value was found in the tested saves. No explicit
`JumpLevel` integer was found either; jump is exposed as `jump-level`
(`CurrentJ`), `jump-height`, and `jump-threshold`.

Totem values:

```text
Entities are editable with --entities.
Totem parasite abilities are editable when they already exist in the saved
TPS_BaseSaveGame.sav skill map.
Totem skill max levels follow the wiki `Cost` column. One Cost entry means a
one-time unlock with max level 1; multiple Cost entries mean that many levels.
Bulk commands cap each known Totem skill to its own maximum.
One-shot Totem actions, item purchases, and weather changes were not found as
persistent editable skill values in tested saves.
```

## Skill Editing

Player skill/stat values:

```text
--run-level          RunLevel
--run-progress       CurrentR_48_E44DEDF2481BFE30D93608AF0829FB89
--run-threshold      ExponentiallyR_46_F285A159483D01385436A2B48DC384F5
--run-power          RunPower_44_7FF736B54F69EDF04D2F579469713BEE
--jump-level         CurrentJ_39_94D3C41E4B72767B054707ABAD91EDD2
--jump-height        JumpHeight_42_3A76B27848DF699A715929986FA4A3D4
--jump-threshold     ExponentiallyJ_40_E1F3667C4D3CAA88B508CFB5A7DE0E76
--unarmed-level      CurrentUA_35_A9C1EE354C2568D006E0C59DEA7FE304
--unarmed-threshold  ExponentiallyUA_34_6BABD40748C06C5DD28E649AC625F9E8
--unarmed-damage     DamageUA_36_C74A12734E8F1F2132613DA21049E950
--axe-level          CurrentAxe_57_DF69A36F480CCD396B01739F9D28FD08
--axe-threshold      ExponentiallyAxe_56_0EE9A8B640428E46720B4EB9D34F29B6
--axe-damage         DamageAxe_55_355AE3574379005F33ED3196F43B028C
--bow-level          LevelBow_70_5BB2DAE64F0E7B2713C401B56A36648A
--bow-progress       CurrentBow_66_745E110344F826BC9FEEA1B855065D7B
--bow-threshold      ExponentiallyBow_65_94ED206948F150B46DF4739489A5D90F
--pickaxe-level      CurrentPickaxe_80_7C3D4BDF4B7C299B74F61C95984E8073
--pickaxe-threshold  ExponentiallyPickaxe_79_4E70EE0B434987BF12D3DEAC406235EF
--pickaxe-damage     DamagePickaxe_78_6E18BE334EBF475948643CB1B7D075B5
--wood-cutting-level CurrentWC_37_EE93AEA54AF3000E4C3642A6224308EC
--wood-cutting-threshold ExponentiallyWC_38_8AEF62F341EB8EEB428F54932D5FE98B
--wood-cutting-strength ChoppingStrength_25_D1725348456D1BE1130DA6892717D852
--build-level        LevelBuild_85_C5CC534B4DE8ACD0DFB400919501337B
--build-progress     CurrentBuild_90_6D9646C141AE3D15E132B883BABFAFF7
--build-threshold    ExponentiallyBuild_91_9ECB053549AB51E61FF1E4A510071DB8
--control-level      Control_TP_LVL_94_32D83B9A4AD65A3513193AB60757A446
--control-progress   Current_C_TP_LVL_99_CED1D88F4D52152DAFC762A94D5BD318
--control-threshold  Exponentially_C_TP_LVL_97_EDCD4BC04F00359A7BD4A7A60838A153
--merger-level       Merger_TP_LVL_102_555521D94CFCE4BF23C19E9AFF29CE0B
--merger-progress    Current_M_TP_LVL_106_57F84FAF489866A9AAF4C79BEE70DABC
--merger-threshold   Exponentially_M_TP_LVL_104_FF9B807D4692F5C712165683D57BBE79
--entities           Entities_12_2513650B4E423EB94AA00DAA64EA9B8F
```

Parasite skill levels:

```text
--sharp-vision
--regeneration
--thick-blood
--oak-leather
--strong-bones
--titanium-back
--absorption
--radiation-removal
--radiation-resistance
--slow-metabolism
--camel
--owl
--frost-resistance
--heat-resistance
--stone-skin
--strong-immunity
--telekinesis
--wings
--intuition
--mentality
--stamina-wings
--possession
```

Known Totem skill maximums:

```text
Sharp Vision 1
Regeneration 4
Thick Blood 4
Oak Leather 4
Strong Bones 4
Titanium Back 5
Absorption 5
Radiation Removal 5
Radiation Resistance 4
Slow Metabolism 6
Camel 6
Owl 6
Frost Resistance 4
Heat Resistance 4
Stone Skin 4
Strong Immunity 4
Telekinesis 1
Wings 1
Intuition 3
Mentality 3
Stamina Wings 3
Possession 1
```

## Backups

Default backup folder:

```text
Backups
```

Optional custom backup root:

```text
set TP_BODY_MORPHER_BACKUP_ROOT=D:\Backup\BodyMorpher
Start_BodyMorpher.cmd
```

## Portable Dependencies

No Python, Node, npm, or package installation is required.

This package includes:

- `runtime\node.exe`
- `runtime\node_modules\oodle.js`
- `runtime\node_modules\koffi`
- `runtime\node_modules\node-stream-zip`

## Safety Notes

Use this tool at your own risk. Back up your saves before using any save tool.

BodyMorpher blocks write and restore operations while The Parasites appears to
be running, but you are still responsible for closing the game completely and
checking the edited save after loading it.

This package is provided as-is. There is no warranty, no support obligation, no
liability, and no guarantee that this tool will keep working with future
versions of The Parasites.

## Terms

The source code is available in this repository for inspection, personal
non-commercial use, and personal non-commercial modification.

Because commercial use and hosting on other websites are prohibited, this is a
custom restricted source-available license, not an OSI-approved open-source
license.

Personal, non-commercial use only. Reuploading, mirroring, reposting,
redistribution, repackaging, publishing modified versions, hosting this tool or
its source code on other websites, paid distribution, and all commercial use are
prohibited without explicit written permission from the copyright holder.

This tool is provided as-is, with no warranty, no support obligation, and no
guarantee of compatibility with future game updates. Use at your own risk.

Read [LICENSE.md](LICENSE.md), [COPYRIGHT_AND_TERMS.txt](COPYRIGHT_AND_TERMS.txt),
and [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) before using or sharing
this package.

## Third-Party Components

This package includes third-party runtime components. See
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) and the files in
[licenses](licenses).

The package includes Oodle DLLs only to read and write existing The Parasites
save chunks offline. The Oodle notice follows the substance of the
[WorkingRobot/OodleUE EULA notice](https://github.com/WorkingRobot/OodleUE#eula-notice):
users are responsible for complying with applicable Unreal Engine/Oodle terms,
this project claims no ownership over Oodle or Epic build artifacts, and if an
authorized rightsholder does not want the DLLs public here, they will be removed
or a viable solution will be worked out.

The Parasites and Unreal Engine belong to their respective owners. This tool is
unofficial and is not affiliated with, endorsed by, sponsored by, or approved by
the developer, publisher, or rightsholder of The Parasites.
