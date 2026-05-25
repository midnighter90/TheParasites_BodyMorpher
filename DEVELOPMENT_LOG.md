# Development Log - The Parasites BodyMorpher

Stand: 2026-05-25

Diese Datei dokumentiert die relevanten Schritte, mit denen BodyMorpher
entwickelt, getestet, erweitert, verpackt und fuer die Veroeffentlichung
vorbereitet wurde.

## Ausgangspunkt

BodyMorpher entstand aus der Frage, ob Charakterwerte im Savegame nachtraeglich
angepasst werden koennen. Der erste konkrete Anwendungsfall war die Korrektur
von Koerperformen und Gewicht, weil The Parasites im Spiel selbst keine einfache
nachtraegliche Korrektur fuer bestimmte Charakterwerte anbietet.

Spaeter wurde der Scope erweitert:

- Koerperwerte.
- Morphwerte.
- Charakter-Skills.
- Totem-/Parasiten-Skills.
- Entity-Waehrung.

## Recherche

1. Savegame-Orte untersucht:
   - Slots liegen unter `%LOCALAPPDATA%\TheParasites\Saved\SaveGames`.
   - relevante Dateien:
     - `Player.sav`
     - `TPS_BaseSaveGame.sav`

2. Save-Kompression analysiert:
   - The Parasites nutzt Unreal/Oodle-Kraken-komprimierte Save-Chunks.
   - Das gleiche portable Decode-/Encode-Prinzip wie bei CorpseReaper wurde
     verwendet:
     - Chunk-Magic `0x9e2a83c1`.
     - Header-Marker `0x22222222`.
     - Headergroesse 49 Bytes.
     - Oodle/Kraken Algorithmus.
     - Chunkgroesse bis `0x20000`.

3. Unreal-Property-Struktur in `Player.sav` untersucht:
   - `DoubleProperty` fuer viele Koerper-, Morph- und Fortschrittswerte.
   - `IntProperty` fuer einige echte Levelwerte.
   - FStrings fuer Property-Namen und Map-Schluessel.

4. Morph-Map gesucht:
   - relevante Morphwerte stehen in einer `OldFatMorpth`-artigen Map.
   - Die Map enthaelt Namen wie:
     - `SS Belly Shape Fat 1`
     - `SS Thigh Inflate`
     - `SS_Thigh_Inflate`
     - `SS Hip Size 1`
     - `SS Arm Size`
     - `SS Glute Size 3`
     - `SS Calf Type 1`
     - `BC Breast Size`
     - `BC Breast Sag1`

## Trial and Error - Koerperwerte

1. Werte in bestehenden Saves gelesen.
   - `BodyWeight` und `ChestSize` wurden als direkte `DoubleProperty`-Werte
     gefunden.
   - Morphwerte wurden separat in der Morph-Map gefunden.

2. Gewichtsskala getestet.
   - Ingame wurde ein Gewicht von ca. 56 kg beobachtet.
   - `BodyWeight = 0.95` ergab ca. 58 kg.
   - `BodyWeight = 1.5` ergab nach Ingame-Speichern ca. 59 kg.
   - daraus wurde abgeleitet:

```text
BodyWeight 0.0 ~= 46 kg
BodyWeight 1.0 ~= 59 kg
kg ~= 46 + BodyWeight * 13
```

3. Clamp-Verhalten beobachtet.
   - `BodyWeight` und `ChestSize` wurden vom Spiel beim Speichern auf den
     Bereich `0..1` zurueckgeklemmt.
   - Morphwerte verhielten sich anders.

4. Morphwerte getestet.
   - alle bekannten Morphwerte auf `1.0` gesetzt.
   - danach alle auf `0`.
   - danach alle auf `2.0`.
   - danach alle nicht zurueckgesetzten Werte auf `5`.
   - Ergebnis:
     - `2.0` ueberlebte das Ingame-Speichern.
     - `5.0` ueberlebte ebenfalls, sah aber sichtbar absurd/extrem aus.
   - Daraus entstanden Empfehlungen, aber keine harte Begrenzung fuer Morphs.

## Finaler Code - Koerpereditor

Der Koerperteil des Editors liegt in:

```text
app/BodyMorpher.mjs
```

Wichtige Bestandteile:

- Oodle/Kraken Decode und Encode.
- Slot-Listing fuer `savegame_*`.
- Analyse von `Player.sav`.
- Lesen und Schreiben von:
  - `BodyWeight`
  - `ChestSize`
  - bekannten Morphwerten.
- `--set-all`
- `--set-morphs`
- `--set` fuer einzelne Werte.
- interaktives Menue.
- automatische Backups vor jedem Write.
- Restore-Funktion.
- Verifikation nach dem Schreiben durch erneutes Decoden.

`BodyWeight` wird ueberall mit geschaetztem kg-Wert angezeigt:

- in `--analyze`.
- in der interaktiven Einzelwert-Eingabe.
- in der geplanten Aenderung vor dem Schreiben.

## Recherche - Skills

Nach dem Koerpereditor wurde untersucht, ob Skillwerte ebenfalls im Save liegen.

Gefunden in `Player.sav`:

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

Nicht gefunden:

- kein explizites `JumpLevel` als eigener Integer.
- kein persistenter `Small Arms`-Savewert in den getesteten Saves.

## Recherche - Totem und Wiki-Abgleich

Die Wiki-Seiten wurden zur fachlichen Einordnung genutzt:

- `https://theparasites.wiki.gg/wiki/Skills`
- `https://theparasites.wiki.gg/wiki/Totem`

In `TPS_BaseSaveGame.sav` wurde eine Map gefunden:

```text
Save_Current_Skill_Level_6_640A898B47AF4D2A8749C89B4E7EA387
```

Diese Map enthaelt Totem-/Parasiten-Skills, z.B.:

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

Trial-and-error-Korrektur:

- Anfangs wurden Totem-Werte wie freie Level behandelt.
- Das war falsch fuer Skills mit nur einmaliger `Cost` im Totem-Wiki.
- Die `Cost`-Spalte definiert die Stufen:
  - ein Cost-Eintrag = einmaliger Unlock, max 1.
  - mehrere Cost-Eintraege = entsprechend viele Stufen.
- Danach wurden bekannte Totem-Skills mit Max-Leveln versehen.
- Direkte Eingaben ueber dem Max-Level werden abgewiesen.
- Bulk `--set-all-skills 10` kappt Totem-Skills auf ihr jeweiliges Maximum.

Beispiele:

```text
--sharp-vision 1
--regeneration 4
--owl 6
```

## Finaler Code - Skill- und Totemeditor

Ergaenzte CLI-Kommandos:

```text
Start_BodyMorpher.cmd --analyze-skills savegame_5
Start_BodyMorpher.cmd --set-all-skills savegame_5 10 --yes
Start_BodyMorpher.cmd --set-skills savegame_5 --run-level 10 --jump-level 10 --build-level 10 --yes
Start_BodyMorpher.cmd --set-skills savegame_5 --control-level 10 --merger-level 10 --entities 5000 --yes
Start_BodyMorpher.cmd --set-skills savegame_5 --sharp-vision 1 --owl 6 --yes
```

Wichtige Implementierungsentscheidungen:

- Der Editor schreibt nur vorhandene Save-Felder.
- Er fuegt keine neuen Morphnamen und keine neuen Totem-Skillnamen in Maps ein.
- Fehlende Skills werden uebersprungen statt kuenstlich erzeugt.
- Player-Skillwerte werden nicht hart gecappt, weil viele als
  Current-/Progress-DoubleProperty gespeichert sind.
- Totem-Skills werden gemaess Wiki-Stufenzahl gecappt.

## Dokumentation und Repository-Aufbau

BodyMorpher wurde im Stil der anderen The-Parasites-Projekte aufgebaut:

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
- CMD-Launcher

Das Repository:

```text
https://github.com/midnighter90/TheParasites_BodyMorpher
```

## Lizenz- und Copyright-Arbeit

Wie bei den anderen Projekten wurden einheitliche Terms verwendet:

- Quellcode einsehbar.
- persoenliche, nicht-kommerzielle Nutzung erlaubt.
- persoenliche, nicht-kommerzielle Modifikation erlaubt.
- kein Rehosting, Mirroring, Reposting, Repackaging oder Hosting auf anderen
  Websites.
- keine kommerzielle Nutzung.
- keine Garantie, kein Supportversprechen, keine Zukunftskompatibilitaet.

Die Oodle-Notiz wurde an die CorpseReaper-/OodleUE-Formulierung angeglichen.

## GitHub-/Release-Arbeit

Durchgefuehrte Schritte:

1. Repository erstellt und initial befuellt.
2. portable Runtime eingebunden.
3. v1.0.0-Release-ZIP gebaut.
4. Skill-Editor nachtraeglich ergaenzt.
5. Totem-/Wiki-Abgleich ergaenzt.
6. Totem-Level-Caps korrigiert.
7. interaktive Prompts mit aktuellen Werten und kg-Anzeige ergaenzt.
8. `MANIFEST_SHA256.txt` nach jeder Datei-/Runtime-Aenderung neu erzeugt.
9. Release-ZIP nach jeder relevanten Aenderung neu gebaut.
10. `main` gepusht.
11. `v1.0.0` jeweils auf den aktuellen finalen Stand verschoben.

## Verifikation

Durchgefuehrt wurden u.a.:

- `node --check app/BodyMorpher.mjs`.
- `--help`.
- `--recommendations`.
- `--analyze savegame_5`.
- `--analyze-skills savegame_1` bis `savegame_5`.
- Schreibtests auf temporaeren Save-Kopien.
- Negativtest: `--sharp-vision 10` muss fehlschlagen.
- Bulk-Test: `--set-all-skills 10` muss Totem-Skills cappen.
- BodyWeight-Test auf temporaerer Kopie mit kg-Ausgabe.
- Manifest-Pruefung.
- ZIP-Entpackung.
- Manifest-Pruefung im ZIP.
- Git-Status und Remote-Tag-Pruefung.

## Ergebnis

BodyMorpher ist ein portabler Offline-Save-Editor fuer The Parasites. Er kann
Koerperwerte, Morphwerte, gefundene Charakter-Skillwerte, Entities und
vorhandene Totem-/Parasiten-Skills bearbeiten. Das Tool arbeitet mit Backups,
schreibt nur vorhandene Save-Felder, prueft geschriebene Dateien erneut und
zeigt `BodyWeight` immer mit geschaetztem kg-Wert an.
