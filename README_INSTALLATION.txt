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
  Start_BodyMorpher.cmd --restore <backup-folder-name> --yes

BodyWeight kg examples from local testing:

  BodyWeight 0.0 = about 46 kg
  BodyWeight 0.5 = about 52.5 kg
  BodyWeight 1.0 = about 59 kg

The game was observed to clamp BodyWeight and ChestSize back to 0..1 when
saving. Morph values above 1.0 can survive an in-game save, but extreme values
can look distorted. BodyMorpher does not limit your input.

Use this tool at your own risk. There is no warranty, no support obligation,
and no guarantee of compatibility with future game versions.
