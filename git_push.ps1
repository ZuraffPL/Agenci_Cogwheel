$env:GIT_EDITOR = "true"
cd "d:\Foundry\Data\systems\cogwheel-syndicate"
git config core.editor "true"
echo "Attempting to complete merge..."
git commit --no-edit -m "Merge from main"
echo "Git status:"
git status
echo "Adding new archetype changes..."
git add -A
echo "Committing archetype updates..."
git commit -m "feat: Zaktualizowano archetypy w compendium pack

- Zastąpiono stare archetypy (Mechanik, Inżynier, Szpieg) czterema nowymi
- Parowy Komandos: Maszyna 5, Inżynieria 1, Intryga 3
- Geniusz Techniki: Maszyna 3, Inżynieria 5, Intryga 1  
- Płaszcz Cienia: Maszyna 1, Inżynieria 3, Intryga 5
- Agent Pary: Maszyna 3, Inżynieria 3, Intryga 3
- Zaktualizowano packs/archetypes.json i archetypes.db
- Dodano szczegółowe opisy dla każdego archetypu"
echo "Pushing to GitHub..."
git push origin main
echo "Done!"
pause
