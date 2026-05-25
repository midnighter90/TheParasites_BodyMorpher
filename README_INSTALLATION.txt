The Parasites BodyMorpher v1.0.0
Installation and usage

1. Close The Parasites completely.
2. Back up your saves.
3. Extract this package anywhere.
4. Run:

   Start_BodyMorpher.cmd

5. Choose a savegame slot or use command-line options.
6. Load the edited slot in-game and check the result.
7. Save normally once in-game if the result is acceptable.

Default save folder:

  %LOCALAPPDATA%\TheParasites\Saved\SaveGames

Useful commands:

  Start_BodyMorpher.cmd --list
  Start_BodyMorpher.cmd --analyze savegame_5
  Start_BodyMorpher.cmd --set-all savegame_5 1.0 --yes
  Start_BodyMorpher.cmd --set-morphs savegame_5 2.0 --yes
  Start_BodyMorpher.cmd --set savegame_5 --body-weight 0.5 --breast-size 1.2 --yes
  Start_BodyMorpher.cmd --analyze-skills savegame_5
  Start_BodyMorpher.cmd --set-all-skills savegame_5 10 --yes
  Start_BodyMorpher.cmd --set-skills savegame_5 --run-level 10 --jump-level 10 --build-level 10 --yes
  Start_BodyMorpher.cmd --set-skills savegame_5 --control-level 10 --merger-level 10 --entities 5000 --yes
  Start_BodyMorpher.cmd --set-skills savegame_5 --sharp-vision 10 --owl 10 --yes
  Start_BodyMorpher.cmd --restore <backup-folder-name> --yes

BodyWeight kg examples from local testing:

  BodyWeight 0.0 = about 46 kg
  BodyWeight 0.5 = about 52.5 kg
  BodyWeight 1.0 = about 59 kg

The game was observed to clamp BodyWeight and ChestSize back to 0..1 when
saving. Morph values above 1.0 can survive an in-game save, but extreme values
can look distorted. BodyMorpher does not limit your input.

Skill values are also editable. Local saves show Run, Jump, Unarmed, Axes,
Bows, Pickaxes, Wood Cutting, Build, Control, Merger, Entities, and saved
Totem/parasite skill values. Some are true integer levels and some are
double precision current/progress values. Local saves show many skill values in
the 1..9 range. Level 10 is a plausible cap, but BodyMorpher does not limit
your input. No explicit Small Arms value was found. No explicit JumpLevel
integer was found; jump is exposed as jump-level/current, jump height, and jump
threshold values.

Use this tool at your own risk. There is no warranty, no support obligation,
and no guarantee of compatibility with future game versions.
