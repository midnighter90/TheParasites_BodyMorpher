The Parasites BodyMorpher v1.0.0
Portable body value save editor and usage

What this tool does
-------------------
BodyMorpher is an offline save tool for savegame_* slots.

It edits existing character body values in Player.sav and skill values in
Player.sav plus TPS_BaseSaveGame.sav. The tool creates a full backup before
every write, repacks the save as an Unreal/Oodle-Kraken chunk file, and
verifies the written file by decoding it again.

The tool only edits values that already exist in the save. It does not add new
morph names to the map.

Important warning
-----------------
Use this tool at your own risk. Back up your saves before using any save tool.

This package is provided as-is. There is no warranty, no support obligation, no
liability, and no guarantee that this tool will keep working with future
versions of The Parasites.

Read COPYRIGHT_AND_TERMS.txt before publishing, mirroring, sharing, modifying,
hosting, or using this package.

Tested target
-------------
This release was prepared for the Windows version of:

  The Parasites TP_Alpha_v_0.1.5.0.0

No compatibility is promised for other versions.

Default save folder
-------------------
BodyMorpher lists detected savegame_* slots from:

  %LOCALAPPDATA%\TheParasites\Saved\SaveGames

Command-line usage
------------------
List slots:

  Start_BodyMorpher.cmd --list

Analyze a slot:

  Start_BodyMorpher.cmd --analyze savegame_5

Set all known values:

  Start_BodyMorpher.cmd --set-all savegame_5 1.0 --yes

Set only morph values:

  Start_BodyMorpher.cmd --set-morphs savegame_5 2.0 --yes

Set individual values:

  Start_BodyMorpher.cmd --set savegame_5 --body-weight 0.5 --breast-size 1.2 --hip-size 0.8 --yes

Analyze skills:

  Start_BodyMorpher.cmd --analyze-skills savegame_5

Set all known integer skill levels:

  Start_BodyMorpher.cmd --set-all-skills savegame_5 10 --yes

Set individual skills:

  Start_BodyMorpher.cmd --set-skills savegame_5 --run-level 10 --build-level 10 --sharp-vision 10 --yes
  Start_BodyMorpher.cmd --set-skills savegame_5 --jump-height 450 --jump-progress 10 --yes

Restore a backup:

  Start_BodyMorpher.cmd --restore <backup-folder-name> --yes

Editable direct values
----------------------
  --body-weight       BodyWeight
  --chest-size        ChestSize

Editable morph values
---------------------
  --belly-fat         SS Belly Shape Fat 1
  --thigh-inflate     SS Thigh Inflate
  --thigh-inflate-alt SS_Thigh_Inflate
  --hip-size          SS Hip Size 1
  --arm-size          SS Arm Size
  --glute-size        SS Glute Size 3
  --calf-size         SS Calf Type 1
  --breast-size       BC Breast Size
  --breast-sag        BC Breast Sag1

Value guidance
--------------
BodyMorpher does not clamp your input. Any finite number is accepted.

Observed BodyWeight behavior from local testing:

  BodyWeight 0.0 = about 46 kg in-game
  BodyWeight 1.0 = about 59 kg in-game
  kg ~= 46 + BodyWeight * 13

Rough examples:

  BodyWeight 0.25 = about 49.25 kg
  BodyWeight 0.50 = about 52.5 kg
  BodyWeight 0.75 = about 55.75 kg
  BodyWeight 1.00 = about 59 kg

The game was observed to clamp BodyWeight and ChestSize back to 0..1 when
saving.

Morph values behaved differently in local testing:

  0.0 to 1.0  = normal-looking test range
  1.0 to 2.0  = strong/extreme test range
  2.0         = survived an in-game save
  5.0         = survived an in-game save, but looked absurd

These are examples and recommendations only. BodyMorpher intentionally does not
block higher or lower values because this is a testing tool.

Skill guidance
--------------
RunLevel, build level, bow level, and parasite skill levels are saved as
integers. Local saves show many skill levels in the 1..9 range. Level 10 is a
plausible cap, but BodyMorpher does not enforce it.

No explicit JumpLevel integer was found in the tested saves. Jump is exposed as:

  --jump-height
  --jump-progress
  --jump-threshold

Useful skill examples:

  Start_BodyMorpher.cmd --set-all-skills savegame_5 10 --yes
  Start_BodyMorpher.cmd --set-skills savegame_5 --run-level 10 --build-level 10 --bow-level 10 --yes
  Start_BodyMorpher.cmd --set-skills savegame_5 --sharp-vision 10 --regeneration 10 --yes

Custom save path
----------------
Open Command Prompt in this package folder and run:

  set TP_SAVE_ROOT=D:\Backup\TheParasites\Saved\SaveGames
  Start_BodyMorpher.cmd

Custom backup path
------------------
Open Command Prompt in this package folder and run:

  set TP_BODY_MORPHER_BACKUP_ROOT=D:\Backup\BodyMorpher
  Start_BodyMorpher.cmd

Portable dependencies
---------------------
This package includes:

  runtime\node.exe
  runtime\node_modules\oodle.js
  runtime\node_modules\koffi
  runtime\node_modules\node-stream-zip

No Python, Node, npm, or package installation is required.
