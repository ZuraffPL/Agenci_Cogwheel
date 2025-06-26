@echo off
cd /d "d:\Foundry\Data\systems\cogwheel-syndicate"
set GIT_EDITOR=true
git config --global core.editor "true"
git config --local core.editor "true"
echo Attempting to complete merge...
git commit --no-edit -m "Merge branch main"
if %ERRORLEVEL% EQU 0 (
    echo Merge completed successfully
    git add .
    git commit -m "feat: Zaktualizowano archetypy v0.6.1 - Parowy Komandos, Geniusz Techniki, Plaszcz Cienia, Agent Pary"
    git push origin main
    echo Push completed!
) else (
    echo Merge failed or already completed
    git status
)
pause
