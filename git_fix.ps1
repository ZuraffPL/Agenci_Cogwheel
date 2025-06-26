cd "d:\Foundry\Data\systems\cogwheel-syndicate"
$env:GIT_EDITOR = "true"
git config --global core.editor "true"
git commit --no-edit -m "Merge main branch"
git push origin main
