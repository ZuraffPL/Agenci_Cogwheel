Remove-Item "d:\Foundry\Data\systems\cogwheel-syndicate\.git\MERGE_MSG" -Force -ErrorAction SilentlyContinue
Remove-Item "d:\Foundry\Data\systems\cogwheel-syndicate\.git\MERGE_HEAD" -Force -ErrorAction SilentlyContinue
cd "d:\Foundry\Data\systems\cogwheel-syndicate"
git reset --hard HEAD
git clean -fd
git pull origin main
git add .
git commit -m "feat: Zaktualizowano archetypy v0.6.1

- Parowy Komandos: Maszyna 5, Inżynieria 1, Intryga 3
- Geniusz Techniki: Maszyna 3, Inżynieria 5, Intryga 1  
- Płaszcz Cienia: Maszyna 1, Inżynieria 3, Intryga 5
- Agent Pary: Maszyna 3, Inżynieria 3, Intryga 3
- Zaktualizowano compendium pack archetypy
- Zaktualizowano CHANGELOG.md"
git push origin main
