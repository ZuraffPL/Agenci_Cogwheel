#!/bin/bash
cd "d:\Foundry\Data\systems\cogwheel-syndicate"
export GIT_EDITOR=true
git config core.editor true
git commit --no-edit -m "Merge from main"
git add .
git commit -m "feat: Zaktualizowano archetypy w compendium pack v0.6.1

- Zastąpiono stare archetypy nowymi, bardziej zbalansowanymi
- Parowy Komandos: Maszyna 5, Inżynieria 1, Intryga 3 (walka + technologia)  
- Geniusz Techniki: Maszyna 3, Inżynieria 5, Intryga 1 (wynalazki + konstrukcje)
- Płaszcz Cienia: Maszyna 1, Inżynieria 3, Intryga 5 (szpiegostwo + manipulacja)
- Agent Pary: Maszyna 3, Inżynieria 3, Intryga 3 (wszechstronny agent)
- Zaktualizowano packs/archetypes.json i archetypes.db
- Dodano szczegółowe opisy dla każdego archetypu w j. polskim
- Zaktualizowano CHANGELOG.md z informacjami o nowych archetypach"
rm git_fix.ps1 git_push.ps1 remove_arch.ps1
git add .
git commit -m "chore: Usunięto tymczasowe skrypty PowerShell"
git push origin main
