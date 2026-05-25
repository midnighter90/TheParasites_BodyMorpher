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
morph names to the map.

Skill editing uses:

- `Player.sav` for run/build/bow and jump-related values.
- `TPS_BaseSaveGame.sav` for the saved parasite skill-level map.

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

Set all known integer skill levels:

```text
Start_BodyMorpher.cmd --set-all-skills savegame_5 10 --yes
```

Set individual skills and skill-like stats:

```text
Start_BodyMorpher.cmd --set-skills savegame_5 --run-level 10 --build-level 10 --sharp-vision 10 --yes
Start_BodyMorpher.cmd --set-skills savegame_5 --jump-height 450 --jump-progress 10 --yes
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

BodyMorpher does not clamp your input. Any finite number is accepted.

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
RunLevel, build level, bow level, and parasite skill levels are integers.
Local saves show many skill levels in the 1..9 range.
Level 10 is a plausible cap, but BodyMorpher does not enforce it.
```

No explicit `JumpLevel` integer was found in the tested saves. Jump is exposed
as `JumpHeight`, `jump-progress`, and `jump-threshold` instead.

## Skill Editing

Player skill/stat values:

```text
--run-level          RunLevel
--build-level        LevelBuild_85_C5CC534B4DE8ACD0DFB400919501337B
--bow-level          LevelBow_70_5BB2DAE64F0E7B2713C401B56A36648A
--jump-height        JumpHeight_42_3A76B27848DF699A715929986FA4A3D4
--jump-progress      CurrentJ_39_94D3C41E4B72767B054707ABAD91EDD2
--jump-threshold     ExponentiallyJ_40_E1F3667C4D3CAA88B508CFB5A7DE0E76
--run-power          RunPower_44_7FF736B54F69EDF04D2F579469713BEE
--build-progress     CurrentBuild_90_6D9646C141AE3D15E132B883BABFAFF7
--build-threshold    ExponentiallyBuild_91_9ECB053549AB51E61FF1E4A510071DB8
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
