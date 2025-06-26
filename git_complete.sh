#!/bin/bash
cd "/d/Foundry/Data/systems/cogwheel-syndicate"
export GIT_EDITOR=true
git config core.editor true
echo "Completing merge..."
git commit --no-edit -m "Merge branch main"
echo "Adding changes..."
git add .
echo "Committing archetype updates..."
git commit -m "feat: Zaktualizowano archetypy v0.6.1

- Parowy Komandos: Maszyna 5, Inżynieria 1, Intryga 3 (specjalista walki)
- Geniusz Techniki: Maszyna 3, Inżynieria 5, Intryga 1 (mistrz wynalazków)  
- Płaszcz Cienia: Maszyna 1, Inżynieria 3, Intryga 5 (ekspert szpiegowstwa)
- Agent Pary: Maszyna 3, Inżynieria 3, Intryga 3 (wszechstronny agent)
- Zaktualizowano packs/archetypes.json i archetypes.db
- Dodano szczegółowe opisy w języku polskim
- Zaktualizowano CHANGELOG.md z informacjami o v0.6.1"

echo "Pushing to GitHub..."
git push origin main
echo "Operacja zakończona!"
