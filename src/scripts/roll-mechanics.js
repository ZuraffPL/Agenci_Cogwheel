// System śledzenia aktualnych przycisków podnoszenia sukcesu i przerzutu dla każdego agenta
window.cogwheelSyndicate = window.cogwheelSyndicate || {};
window.cogwheelSyndicate.currentUpgradeButtons = window.cogwheelSyndicate.currentUpgradeButtons || {};
window.cogwheelSyndicate.currentRerollButtons = window.cogwheelSyndicate.currentRerollButtons || {};
window.cogwheelSyndicate.lastRollTimestamp = window.cogwheelSyndicate.lastRollTimestamp || {};
window.cogwheelSyndicate.rollData = window.cogwheelSyndicate.rollData || {};

// Import FeatsEffects directly
import { FeatsEffects } from './feats-effects.mjs';
import { calculateConsequenceCount, createConsequenceButton } from './consequences.mjs';

// Funkcja sprawdzająca czy użytkownik ma uprawnienia do kliknięcia przycisku czatu
function canUserInteractWithButton(authorUserId) {
  const currentUser = game.user;
  
  // GM zawsze może kliknąć
  if (currentUser.isGM) {
    return true;
  }
  
  // Autor rzutu może kliknąć swój przycisk
  if (currentUser.id === authorUserId) {
    return true;
  }
  
  // Inni użytkownicy nie mogą
  return false;
}

// Funkcja do wyłączania wszystkich starszych przycisków dla danego agenta
function disableAllUpgradeButtonsForActor(actorId) {
  // Znajdź wszystkie przyciski podnoszenia sukcesu dla tego agenta i wyłącz je
  document.querySelectorAll('.success-upgrade-button').forEach(function(button) {
    const buttonActorId = button.dataset.actorId;
    if (buttonActorId === actorId) {
      button.disabled = true;
      button.classList.remove('success-upgrade-button');
      button.classList.add('success-upgrade-button-outdated');
      button.textContent = game.i18n.localize("COGSYNDICATE.UpgradeSuccessButton") + " (Przestarzałe)";
    }
  });

  // Znajdź wszystkie przyciski przerzutu dla tego agenta i wyłącz je
  document.querySelectorAll('.test-reroll-button').forEach(function(button) {
    const buttonActorId = button.dataset.actorId;
    if (buttonActorId === actorId) {
      button.disabled = true;
      button.classList.remove('test-reroll-button');
      button.classList.add('test-reroll-button-outdated');
      button.textContent = game.i18n.localize("COGSYNDICATE.RerollTestButton") + " (Przestarzałe)";
    }
  });
}

// Funkcja pomocnicza do podnoszenia poziomu sukcesu
async function upgradeSuccessLevel(actor, currentResult, testedAttribute, position, oldConsequenceButtonId) {
  const currentSteamPoints = game.cogwheelSyndicate.steamPoints || 0;
  
  if (currentSteamPoints < 2) {
    // Wyświetlenie komunikatu o braku punktów pary
    const errorMessage = `<p><strong style="color: red; font-weight: bold;">${game.i18n.localize("COGSYNDICATE.InsufficientSteamPoints")}</strong></p>`;
    await ChatMessage.create({
      content: errorMessage,
      speaker: { actor: actor.id }
    });
    return;
  }

  // Określenie nowego poziomu sukcesu
  let newResult;
  if (currentResult === "FailureWithConsequence") {
    newResult = "SuccessWithCost";
  } else if (currentResult === "SuccessWithCost") {
    newResult = "FullSuccess";
  }

  // Wydanie punktów pary
  game.cogwheelSyndicate.steamPoints = Math.max(currentSteamPoints - 2, 0);
  game.socket.emit("system.cogwheel-syndicate", {
    type: "updateMetaCurrencies",
    nemesisPoints: game.cogwheelSyndicate.nemesisPoints,
    steamPoints: game.cogwheelSyndicate.steamPoints
  });
  Hooks.call("cogwheelSyndicateMetaCurrenciesUpdated");

  // Określenie kolorów dla poziomów sukcesu
  const colorMap = {
    "FailureWithConsequence": "red",
    "SuccessWithCost": "blue", 
    "FullSuccess": "green"
  };

  // Utworzenie komunikatu o podniesieniu sukcesu z odpowiednimi kolorami
  const fromLevelText = `<span style='color: ${colorMap[currentResult]}; font-weight: bold'>${game.i18n.localize(`COGSYNDICATE.${currentResult}`)}</span>`;
  const toLevelText = `<span style='color: ${colorMap[newResult]}; font-weight: bold'>${game.i18n.localize(`COGSYNDICATE.${newResult}`)}</span>`;
  
  // Określenie nazwy atrybutu z odpowiednim formatowaniem
  const attrLabel = {
    machine: game.i18n.localize("COGSYNDICATE.Machine"),
    engineering: game.i18n.localize("COGSYNDICATE.Engineering"),
    intrigue: game.i18n.localize("COGSYNDICATE.Intrigue")
  }[testedAttribute] || testedAttribute;
  
  const testedAttributeText = `<span style='color: purple; font-weight: bold'>${attrLabel}</span>`;
  
  const upgradeMessage = game.i18n.format("COGSYNDICATE.UpgradeSuccessConfirm", {
    agentName: actor.name,
    fromLevel: fromLevelText,
    toLevel: toLevelText,
    testedAttribute: testedAttributeText
  });

  // Oblicz nową liczbę konsekwencji dla nowego poziomu sukcesu
  const newConsequenceCount = calculateConsequenceCount(position, newResult);
  
  // Wygeneruj nowy przycisk konsekwencji jeśli nadal są konsekwencje
  let newConsequenceButton = "";
  if (newConsequenceCount > 0) {
    const buttonData = createConsequenceButton(actor, newConsequenceCount, oldConsequenceButtonId);
    newConsequenceButton = buttonData.html;
  }

  const upgradeContent = `
    <div class="roll-message">
      <div class="chat-header">
        <img src="${actor.img}" alt="${actor.name}" class="chat-avatar" />
        <h3>${game.i18n.format("COGSYNDICATE.Agent", { agentName: actor.name })}</h3>
      </div>
      <hr>
      <p><strong style='color: black;'>${upgradeMessage}</strong></p>
      <p><span style='color: orange; font-weight: bold'>${game.i18n.localize("COGSYNDICATE.SpentSteamPoints")}</span></p>
      ${newConsequenceButton}
    </div>
  `;

  await ChatMessage.create({
    content: upgradeContent,
    speaker: { actor: actor.id }
  });
}

export async function performAttributeRoll(actor, attribute) {
  
  const attrValue = actor.system.attributes[attribute].value;
  const secondaryMap = {
    machine: "endurance",
    engineering: "control",
    intrigue: "determination"
  };
  const secondaryAttr = secondaryMap[attribute];
  const secondaryValue = parseInt(actor.system.secondaryAttributes[secondaryAttr].value, 10) || 0;

  const traumaValue = actor.system.resources.trauma.value || 0;
  const baseEffectiveAttrValue = attrValue;

  const attrLabel = {
    machine: game.i18n.localize("COGSYNDICATE.Machine"),
    engineering: game.i18n.localize("COGSYNDICATE.Engineering"),
    intrigue: game.i18n.localize("COGSYNDICATE.Intrigue")
  }[attribute];

  const dialogContent = `
    <form class="roll-dialog">
      <div class="form-group">
        <p><strong><span class="roll-label">${game.i18n.localize("COGSYNDICATE.Roll2d12")}</span> <span class="attribute-name">${attrLabel}</span>: <span class="attribute-value">${baseEffectiveAttrValue}</span></strong></p>
      </div>
      <div class="form-group position-group">
        <strong><span class="position-label">${game.i18n.localize("COGSYNDICATE.Position")}</span>:</strong>
        <select name="position">
          <option value="desperate">${game.i18n.localize("COGSYNDICATE.PositionDesperate")} (-3)</option>
          <option value="risky" selected>${game.i18n.localize("COGSYNDICATE.PositionRisky")} (+0)</option>
          <option value="controlled">${game.i18n.localize("COGSYNDICATE.PositionControlled")} (+3)</option>
        </select>
      </div>
      <div class="form-group stress-die-group">
        <label>
          <input type="checkbox" name="stressDie" />
          ${game.i18n.localize("COGSYNDICATE.StressDieLabel")}
        </label>
      </div>
      <div class="form-group steam-die-group">
        <label>
          <input type="checkbox" name="steamDie" />
          ${game.i18n.localize("COGSYNDICATE.SteamDieLabel")}
        </label>
      </div>
      <div class="form-group devil-die-group">
        <label>
          <input type="checkbox" name="devilDie" />
          ${game.i18n.localize("COGSYNDICATE.DevilDieLabel")}
        </label>
      </div>
      <div class="form-group trauma-group">
        <label>
          <input type="checkbox" name="applyTrauma" />
          ${game.i18n.format("COGSYNDICATE.ApplyTraumaLabel", { traumaValue: traumaValue })}
        </label>
      </div>
      <div class="form-group modifier-group">
        <strong><span class="modifier-label">${game.i18n.localize("COGSYNDICATE.RollModifier")}</span>:</strong>
        <select name="rollModifier">
          <option value="0" selected>0</option>
          <option value="-5">-5</option>
          <option value="-4">-4</option>
          <option value="-3">-3</option>
          <option value="-2">-2</option>
          <option value="-1">-1</option>
          <option value="1">+1</option>
          <option value="2">+2</option>
          <option value="3">+3</option>
          <option value="4">+4</option>
          <option value="5">+5</option>
        </select>
      </div>
    </form>
  `;

  return new Promise((resolve) => {
    const dialog = new Dialog({
      title: game.i18n.localize("COGSYNDICATE.RollAttribute"),
      content: dialogContent,
      buttons: {
        cancel: {
          label: game.i18n.localize("COGSYNDICATE.Cancel"),
          callback: () => resolve()
        },
        roll: {
          label: game.i18n.localize("COGSYNDICATE.Roll2d12"),
          callback: async (html) => {
            const position = html[0].querySelector('[name="position"]').value;
            const useStressDie = html[0].querySelector('[name="stressDie"]').checked;
            const useSteamDie = html[0].querySelector('[name="steamDie"]').checked;
            const useDevilDie = html[0].querySelector('[name="devilDie"]').checked;
            const applyTrauma = html[0].querySelector('[name="applyTrauma"]').checked;
            const rollModifier = parseInt(html[0].querySelector('[name="rollModifier"]').value, 10) || 0;
            const positionModifiers = { desperate: -3, risky: 0, controlled: 3 };
            const positionModifier = positionModifiers[position];
            const positionLabel = {
              desperate: game.i18n.localize("COGSYNDICATE.PositionDesperate"),
              risky: game.i18n.localize("COGSYNDICATE.PositionRisky"),
              controlled: game.i18n.localize("COGSYNDICATE.PositionControlled")
            }[position];

            // Generate timestamp for this roll (needed for button IDs)
            const currentRollTimestamp = Date.now();

            let effectiveAttrValue = baseEffectiveAttrValue;
            let traumaModifier = 0;
            if (applyTrauma && traumaValue > 0) {
              traumaModifier = -traumaValue;
              effectiveAttrValue = baseEffectiveAttrValue + traumaModifier;
            }

            let stressIncrease = 0;
            let steamIncrease = 0;
            let traumaDialogMessage = "";
            let resetStress = false;
            let steamDialogMessage = "";

            if (useStressDie) {
              const currentStress = actor.system.resources.stress.value || 0;
              const maxStress = actor.system.resources.stress.max || 4;
              stressIncrease = 2;

              if (currentStress + stressIncrease >= maxStress) {
                const traumaDialog = await new Promise((traumaResolve) => {
                  new Dialog({
                    title: game.i18n.localize("COGSYNDICATE.TraumaWarning"),
                    content: `<p>${game.i18n.format("COGSYNDICATE.TraumaMessage", { agentName: actor.name })}</p>`,
                    buttons: {
                      cancel: {
                        label: game.i18n.localize("COGSYNDICATE.Cancel"),
                        callback: () => traumaResolve(false)
                      },
                      confirm: {
                        label: game.i18n.localize("COGSYNDICATE.Confirm"),
                        callback: () => traumaResolve(true)
                      }
                    },
                    default: "confirm"
                  }).render(true);
                });

                if (!traumaDialog) {
                  resolve();
                  return;
                }
                traumaDialogMessage = `<p>${game.i18n.localize("COGSYNDICATE.TraumaReceived")}</p>`;
                const currentTrauma = actor.system.resources.trauma.value || 0;
                const newTrauma = Math.min(currentTrauma + 1, 4);
                await actor.update({
                  "system.resources.stress.value": 0,
                  "system.resources.trauma.value": newTrauma
                });

                if (newTrauma === 4) {
                  const maxTraumaMessage = game.i18n.localize("COGSYNDICATE.MaxTraumaReached");
                  await ChatMessage.create({
                    content: `<p>${maxTraumaMessage}</p>`,
                    speaker: { actor: actor.id }
                  });
                  new Dialog({
                    title: "Maximum Trauma",
                    content: `<p>${maxTraumaMessage}</p>`,
                    buttons: {
                      ok: { label: "OK" }
                    }
                  }).render(true);
                }
                resetStress = true;
              } else {
                await actor.update({
                  "system.resources.stress.value": Math.min(currentStress + stressIncrease, maxStress)
                });
              }
            }

            if (useSteamDie) {
              const steamDialog = await new Promise((steamResolve) => {
                new Dialog({
                  title: game.i18n.localize("COGSYNDICATE.SteamDieConfirmTitle"),
                  content: `<p>${game.i18n.localize("COGSYNDICATE.SteamDieLabel")}</p>`,
                  buttons: {
                    cancel: {
                      label: game.i18n.localize("COGSYNDICATE.Cancel"),
                      callback: () => steamResolve(false)
                    },
                    confirm: {
                      label: game.i18n.localize("COGSYNDICATE.Confirm"),
                      callback: () => steamResolve(true)
                    }
                  },
                  default: "confirm"
                }).render(true);
              });

              if (!steamDialog) {
                resolve();
                return;
              }

              const currentSteamPoints = game.cogwheelSyndicate.steamPoints || 0;
              if (currentSteamPoints < 2) {
                await new Dialog({
                  title: game.i18n.localize("COGSYNDICATE.SteamDieInsufficientTitle"),
                  content: `<p><strong style="color: red; font-size: 1.2em;">${game.i18n.localize("COGSYNDICATE.SteamDieInsufficient")}</strong></p>`,
                  buttons: {
                    ok: { label: "OK" }
                  }
                }).render(true);
                resolve();
                return;
              }

              steamIncrease = 2;
              game.cogwheelSyndicate.steamPoints = Math.max(currentSteamPoints - steamIncrease, 0);
              game.socket.emit("system.cogwheel-syndicate", {
                type: "updateMetaCurrencies",
                nemesisPoints: game.cogwheelSyndicate.nemesisPoints,
                steamPoints: game.cogwheelSyndicate.steamPoints
              });
              Hooks.call("cogwheelSyndicateMetaCurrenciesUpdated");
              steamDialogMessage = `<p>${game.i18n.format("COGSYNDICATE.SteamDieUsed", { agentName: actor.name })}</p>`;
            }

            let devilDialogMessage = "";
            if (useDevilDie) {
              const nemesisIncrease = 2;
              game.cogwheelSyndicate.nemesisPoints = game.cogwheelSyndicate.nemesisPoints || 0;
              game.cogwheelSyndicate.nemesisPoints = Math.clamp(game.cogwheelSyndicate.nemesisPoints + nemesisIncrease, 0, 100);
              
              game.socket.emit("system.cogwheel-syndicate", {
                type: "updateMetaCurrencies",
                nemesisPoints: game.cogwheelSyndicate.nemesisPoints,
                steamPoints: game.cogwheelSyndicate.steamPoints
              });
              Hooks.call("cogwheelSyndicateMetaCurrenciesUpdated");
              devilDialogMessage = `<p>${game.i18n.format("COGSYNDICATE.DevilDieUsed", { agentName: actor.name })}</p>`;
            }

            let diceCount = 2;
            if (useStressDie) diceCount += 1;
            if (useSteamDie) diceCount += 1;
            if (useDevilDie) diceCount += 1;

            // Foundry v13 compatible roll formula
            const rollFormula = `${diceCount}d12 + ${effectiveAttrValue} + ${positionModifier} + ${rollModifier}`;
            console.log("Roll formula:", rollFormula);
            
            const roll = new Roll(rollFormula);
            await roll.evaluate();
            
            console.log("Roll after evaluate:", roll);
            console.log("Roll.class:", roll.constructor.name);
            console.log("Roll properties:", Object.keys(roll));

            const diceResults = roll.terms[0].results.map(r => r.result);
            let die1, die2, stressDie, steamDie, devilDie;
            
            if (diceCount === 5) {
              // 2d12 + stress + steam + devil
              [die1, die2, stressDie, steamDie, devilDie] = diceResults;
            } else if (diceCount === 4) {
              // 2d12 + dwie dodatkowe kości
              if (useStressDie && useSteamDie) {
                [die1, die2, stressDie, steamDie] = diceResults;
                devilDie = null;
              } else if (useStressDie && useDevilDie) {
                [die1, die2, stressDie, devilDie] = diceResults;
                steamDie = null;
              } else if (useSteamDie && useDevilDie) {
                [die1, die2, steamDie, devilDie] = diceResults;
                stressDie = null;
              }
            } else if (diceCount === 3) {
              // 2d12 + jedna dodatkowa kość
              if (useStressDie) {
                [die1, die2, stressDie] = diceResults;
                steamDie = null;
                devilDie = null;
              } else if (useSteamDie) {
                [die1, die2, steamDie] = diceResults;
                stressDie = null;
                devilDie = null;
              } else if (useDevilDie) {
                [die1, die2, devilDie] = diceResults;
                stressDie = null;
                steamDie = null;
              }
            } else {
              // tylko 2d12
              [die1, die2] = diceResults;
              stressDie = null;
              steamDie = null;
              devilDie = null;
            }
            let total = roll.total;
            let nemesisPoints = 0;
            let steamPoints = 0;
            let result;
            let resultType = ""; // Dodana zmienna do śledzenia typu wyniku

            const counts = {};
            diceResults.forEach(die => counts[die] = (counts[die] || 0) + 1);

            if (counts[11] >= 2) {
              result = `<span style='color: red; font-weight: bold'>${game.i18n.localize("COGSYNDICATE.AutoCriticalFailure")}</span>`;
              resultType = "AutoCriticalFailure";
              nemesisPoints += Math.min(counts[11], 4); // Naliczamy punkty proporcjonalnie do liczby 11 (max 4)
            } else if (counts[12] >= 2) {
              result = `<span style='color: green; font-weight: bold'>${game.i18n.localize("COGSYNDICATE.AutoCriticalSuccess")}</span>`;
              resultType = "AutoCriticalSuccess";
              steamPoints += Math.min(counts[12], 4); // Naliczamy punkty proporcjonalnie do liczby 12 (max 4)
            } else {
              diceResults.forEach(die => {
                if (die === 11) nemesisPoints += 1;
                if (die === 12) steamPoints += 1;
              });

              if (total <= 12) {
                result = `<span style='color: red; font-weight: bold'>${game.i18n.localize("COGSYNDICATE.FailureWithConsequence")}</span>`;
                resultType = "FailureWithConsequence";
                nemesisPoints += 1; // Dodajemy 1 Punkt Nemezis za porażkę z konsekwencją
              } else if (total <= 18) {
                result = `<span style='color: blue; font-weight: bold'>${game.i18n.localize("COGSYNDICATE.SuccessWithCost")}</span>`;
                resultType = "SuccessWithCost";
              } else {
                result = `<span style='color: green; font-weight: bold'>${game.i18n.localize("COGSYNDICATE.FullSuccess")}</span>`;
                resultType = "FullSuccess";
                steamPoints += 1; // Dodajemy 1 Punkt Pary za pełny sukces
              }
            }

            // GENERATE CONSEQUENCES MESSAGE
            let consequencesMessage = "";
            const resultTypeMap = {
              'AutoCriticalFailure': 'criticalFailure',
              'FailureWithConsequence': 'failureWithConsequence',
              'SuccessWithCost': 'successWithCost'
            };
            const mappedResultType = resultTypeMap[resultType];
            
            if (mappedResultType) {
              const consequencesTable = {
                'controlled': { 'successWithCost': 1, 'failureWithConsequence': 2, 'criticalFailure': 3 },
                'risky': { 'successWithCost': 2, 'failureWithConsequence': 3, 'criticalFailure': 4 },
                'desperate': { 'successWithCost': 3, 'failureWithConsequence': 4, 'criticalFailure': 4 }
              };
              const count = consequencesTable[position]?.[mappedResultType];
              if (count) {
                const singular = game.i18n.localize('COGWHEEL.Consequences.Singular');
                const genitive = game.i18n.localize('COGWHEEL.Consequences.Genitive');
                const plural = game.i18n.localize('COGWHEEL.Consequences.Plural');
                
                // Determine form: 1 = singular, 2-4 = genitive, 5+ = plural
                let word;
                if (count === 1) {
                  word = singular;
                } else if (count >= 2 && count <= 4) {
                  word = genitive;
                } else {
                  word = plural;
                }
                
                const trauma = (position === 'desperate' && mappedResultType === 'criticalFailure') ? 
                  ` + <span class="consequence-trauma">1 ${game.i18n.localize('COGWHEEL.Consequences.Trauma')}</span>` : '';
                
                // Generate unique button ID for consequence selection
                const selectBtnId = `select-consequences-${currentRollTimestamp}-${Math.random().toString(36).substr(2, 9)}`;
                
                // Inicjalizuj timer dla przycisku konsekwencji (120 sekund)
                const consequenceTimer = setTimeout(() => {
                  const btn = document.getElementById(selectBtnId);
                  if (btn && !btn.disabled) {
                    btn.disabled = true;
                    btn.classList.add('select-consequences-btn-expired');
                    btn.textContent = game.i18n.localize('COGWHEEL.Consequences.SelectButton') + 
                                     ` (${game.i18n.localize('COGWHEEL.Consequences.Expired')})`;
                  }
                  delete window.cogwheelSyndicate.consequenceButtonTimers[selectBtnId];
                  delete window.cogwheelSyndicate.activeConsequenceButtons[selectBtnId];
                }, 120000);
                
                // Zapisz timer i dane przycisku
                window.cogwheelSyndicate.consequenceButtonTimers[selectBtnId] = consequenceTimer;
                window.cogwheelSyndicate.activeConsequenceButtons[selectBtnId] = {
                  actorId: actor.id,
                  consequenceCount: count,
                  timestamp: currentRollTimestamp
                };
                
                consequencesMessage = `<div class="consequence-message">
                  <i class="fas fa-exclamation-triangle"></i>
                  <span class="consequence-count">${count}</span> ${word}${trauma}
                </div>
                <button class="select-consequences-btn" 
                        id="${selectBtnId}"
                        data-actor-id="${actor.id}" 
                        data-consequence-count="${count}"
                        data-position="${position}"
                        data-message-id="">
                  ${game.i18n.localize('COGWHEEL.Consequences.SelectButton')}
                </button>`;
              }
            }

            // Apply Steam Booster effect if applicable
            let steamBoosterMessage = "";
            if (steamPoints > 0) {
              const steamBoosterResult = FeatsEffects.applySteamBoosterEffect(actor, steamPoints);
              steamPoints = steamBoosterResult.steamPoints;
              if (steamBoosterResult.message) {
                steamBoosterMessage = steamBoosterResult.message;
              }
            }

            if (nemesisPoints > 0 || steamPoints > 0) {
              game.cogwheelSyndicate.nemesisPoints = game.cogwheelSyndicate.nemesisPoints || 0;
              game.cogwheelSyndicate.steamPoints = game.cogwheelSyndicate.steamPoints || 0;

              if (nemesisPoints > 0) {
                game.cogwheelSyndicate.nemesisPoints = Math.clamp(game.cogwheelSyndicate.nemesisPoints + nemesisPoints, 0, 100);
              }
              if (steamPoints > 0) {
                game.cogwheelSyndicate.steamPoints = Math.clamp(game.cogwheelSyndicate.steamPoints + steamPoints, 0, 100);
              }

              game.socket.emit("system.cogwheel-syndicate", {
                type: "updateMetaCurrencies",
                nemesisPoints: game.cogwheelSyndicate.nemesisPoints,
                steamPoints: game.cogwheelSyndicate.steamPoints
              });

              Hooks.call("cogwheelSyndicateMetaCurrenciesUpdated");
            }

            // Wyłączenie wszystkich starszych przycisków dla tego agenta przy każdym nowym rzucie
            disableAllUpgradeButtonsForActor(actor.id);
            
            // Rejestracja timestamp tego rzutu (already defined at start of callback)
            window.cogwheelSyndicate.lastRollTimestamp[actor.id] = currentRollTimestamp;

            // Zapisanie danych rzutu dla możliwego reroll
            const rollDataKey = `${actor.id}-${currentRollTimestamp}`;
            window.cogwheelSyndicate.rollData[rollDataKey] = {
              attribute,
              position,
              useStressDie,
              useSteamDie,
              useDevilDie,
              applyTrauma,
              rollModifier,
              baseEffectiveAttrValue,
              traumaValue
            };

            // Generowanie przycisku podnoszenia sukcesu jeśli to konieczne
            let upgradeButton = "";
            if (resultType === "FailureWithConsequence" || resultType === "SuccessWithCost") {
              const buttonId = `upgrade-${currentRollTimestamp}-${Math.random().toString(36).substr(2, 9)}`;
              
              // Rejestracja nowego przycisku jako aktualnego dla tego agenta
              window.cogwheelSyndicate.currentUpgradeButtons[actor.id] = {
                buttonId: buttonId,
                timestamp: currentRollTimestamp
              };
              
              // Znajdź ID przycisku konsekwencji z tego samego rzutu (jeśli istnieje)
              const consequenceBtnMatch = consequencesMessage.match(/id="(select-consequences-[^"]+)"/);
              const consequenceBtnId = consequenceBtnMatch ? consequenceBtnMatch[1] : "";
              
              upgradeButton = `
                <button class="success-upgrade-button" id="${buttonId}" 
                        data-actor-id="${actor.id}" 
                        data-result-type="${resultType}"
                        data-tested-attribute="${attribute}"
                        data-position="${position}"
                        data-consequence-button-id="${consequenceBtnId}"
                        data-user-id="${game.user.id}">
                  ${game.i18n.localize("COGSYNDICATE.UpgradeSuccessButton")}
                </button>
              `;
            }

            // Przycisk reroll dla wszystkich testów
            const rerollButtonId = `reroll-${currentRollTimestamp}-${Math.random().toString(36).substr(2, 9)}`;
            
            // Rejestracja nowego przycisku reroll jako aktualnego dla tego agenta
            window.cogwheelSyndicate.currentRerollButtons[actor.id] = {
              buttonId: rerollButtonId,
              timestamp: currentRollTimestamp
            };
            
            const rerollButton = `
              <button class="test-reroll-button" id="${rerollButtonId}" 
                      data-actor-id="${actor.id}" 
                      data-roll-data-key="${rollDataKey}"
                      data-user-id="${game.user.id}">
                ${game.i18n.localize("COGSYNDICATE.RerollTestButton")}
              </button>
            `;

            let chatContent = `
              <div class="roll-message">
                <div class="chat-header">
                  <img src="${actor.img}" alt="${actor.name}" class="chat-avatar" />
                  <h3>${game.i18n.format("COGSYNDICATE.Agent", { agentName: actor.name })}</h3>
                </div>
                <hr>
                <p><strong style='color: brown;'>${game.i18n.localize("COGSYNDICATE.Position")}: ${positionLabel}</strong></p>
                <hr>
                <p><strong style='color: black;'>${game.i18n.localize("COGSYNDICATE.RolledOn").replace('{attrLabel}', `<span style='color: #2563eb; font-weight: bold;'>${attrLabel}</span>`).replace('{total}', `<span style='color: red; font-weight: bold;'>${total}</span>`)}</strong></p>
                <hr>
                <p>${result}</p>
                ${consequencesMessage}
                ${useStressDie ? `<p>${game.i18n.format("COGSYNDICATE.StressDieUsed", { agentName: actor.name })}</p>` : ""}
                ${useSteamDie ? steamDialogMessage : ""}
                ${useDevilDie ? devilDialogMessage : ""}
                ${traumaDialogMessage}
                ${applyTrauma && traumaModifier !== 0 ? `<p>${game.i18n.format("COGSYNDICATE.TraumaApplied", { traumaValue: Math.abs(traumaModifier) })}</p>` : ""}
                ${nemesisPoints > 0 ? `<p><span style='color: purple; font-weight: bold'>${game.i18n.format("COGSYNDICATE.AddedNemesisPoint", { amount: nemesisPoints })}</span></p>` : ""}
                ${steamPoints > 0 ? `<p><span style='color: orange; font-weight: bold'>${game.i18n.format("COGSYNDICATE.AddedSteamPoint", { amount: steamPoints })}</span></p>` : ""}
                ${steamBoosterMessage}
                <hr>
                <p>${game.i18n.localize("COGSYNDICATE.Roll")}: ${diceCount}d12 (${die1}+${die2}${useStressDie ? `+${stressDie}` : ""}${useSteamDie ? `+${steamDie}` : ""}${useDevilDie ? `+${devilDie}` : ""}) + ${effectiveAttrValue} (${attrLabel})${traumaModifier !== 0 ? ` ${traumaModifier} (${game.i18n.localize("COGSYNDICATE.Trauma")})` : ""} + ${positionModifier} (${game.i18n.localize("COGSYNDICATE.Position")})${rollModifier !== 0 ? ` ${rollModifier > 0 ? '+' : ''}${rollModifier} (${game.i18n.localize("COGSYNDICATE.RollModifier")})` : ""}</p>
                ${upgradeButton}
                ${rerollButton}
              </div>
            `;

            await ChatMessage.create({
              content: chatContent,
              speaker: { actor: actor.id },
              rolls: [roll],
              flavor: game.i18n.localize("COGSYNDICATE.Roll3D"),
              rollMode: "publicroll"
            });

            resolve();
          }
        }
      },
      default: "roll",
      width: 450,
      render: html => {
        // Dodanie logiki wzajemnego wykluczania się checkboxów
        const steamDieCheckbox = html[0].querySelector('[name="steamDie"]');
        const devilDieCheckbox = html[0].querySelector('[name="devilDie"]');
        const steamDieGroup = html[0].querySelector('.steam-die-group');
        const devilDieGroup = html[0].querySelector('.devil-die-group');
        
        steamDieCheckbox.addEventListener('change', function() {
          if (this.checked) {
            devilDieCheckbox.checked = false;
            devilDieGroup.classList.add('disabled-option');
            steamDieGroup.classList.remove('disabled-option');
          } else {
            devilDieGroup.classList.remove('disabled-option');
          }
        });
        
        devilDieCheckbox.addEventListener('change', function() {
          if (this.checked) {
            steamDieCheckbox.checked = false;
            steamDieGroup.classList.add('disabled-option');
            devilDieGroup.classList.remove('disabled-option');
          } else {
            steamDieGroup.classList.remove('disabled-option');
          }
        });
      }
    }).render(true);
  });
}

// Funkcja pomocnicza do przerzucania testu za 3PP
async function rerollTest(actor, rollDataKey) {
  const currentSteamPoints = game.cogwheelSyndicate.steamPoints || 0;
  
  if (currentSteamPoints < 3) {
    // Wyświetlenie komunikatu o braku punktów pary
    const errorMessage = `<p><strong style="color: red; font-weight: bold;">${game.i18n.localize("COGSYNDICATE.InsufficientSteamPointsReroll")}</strong></p>`;
    await ChatMessage.create({
      content: errorMessage,
      speaker: { actor: actor.id }
    });
    return;
  }

  // Pobranie danych oryginalnego rzutu
  const rollData = window.cogwheelSyndicate.rollData[rollDataKey];
  if (!rollData) {
    ui.notifications.error("Nie można znaleźć danych oryginalnego rzutu");
    return;
  }

  // Wydanie punktów pary
  game.cogwheelSyndicate.steamPoints = Math.max(currentSteamPoints - 3, 0);
  game.socket.emit("system.cogwheel-syndicate", {
    type: "updateMetaCurrencies",
    nemesisPoints: game.cogwheelSyndicate.nemesisPoints,
    steamPoints: game.cogwheelSyndicate.steamPoints
  });
  Hooks.call("cogwheelSyndicateMetaCurrenciesUpdated");

  // Wykonanie nowego rzutu z identycznymi parametrami ale bez dodatkowych kosztów
  await executeRollWithData(actor, rollData, true);
  
  // Komunikat o przerzucie
  const attrLabel = {
    machine: game.i18n.localize("COGSYNDICATE.Machine"),
    engineering: game.i18n.localize("COGSYNDICATE.Engineering"),
    intrigue: game.i18n.localize("COGSYNDICATE.Intrigue")
  }[rollData.attribute] || rollData.attribute;
  
  const testedAttributeText = `<span style='color: purple; font-weight: bold'>${attrLabel}</span>`;
  
  const rerollMessage = game.i18n.format("COGSYNDICATE.RerollTestConfirm", {
    agentName: actor.name,
    testedAttribute: testedAttributeText
  });

  const rerollContent = `
    <div class="roll-message">
      <div class="chat-header">
        <img src="${actor.img}" alt="${actor.name}" class="chat-avatar" />
        <h3>${game.i18n.format("COGSYNDICATE.Agent", { agentName: actor.name })}</h3>
      </div>
      <hr>
      <p><strong style='color: black;'>${rerollMessage}</strong></p>
      <p><span style='color: orange; font-weight: bold'>${game.i18n.localize("COGSYNDICATE.SpentSteamPointsReroll")}</span></p>
    </div>
  `;

  await ChatMessage.create({
    content: rerollContent,
    speaker: { actor: actor.id }
  });
}

// Funkcja wykonująca rzut z podanymi parametrami
async function executeRollWithData(actor, data, isReroll = false) {
  const {
    attribute,
    position,
    useStressDie,
    useSteamDie,
    useDevilDie,
    applyTrauma,
    rollModifier,
    baseEffectiveAttrValue,
    traumaValue
  } = data;

  const positionModifiers = { desperate: -3, risky: 0, controlled: 3 };
  const positionModifier = positionModifiers[position];
  const positionLabel = {
    desperate: game.i18n.localize("COGSYNDICATE.PositionDesperate"),
    risky: game.i18n.localize("COGSYNDICATE.PositionRisky"),
    controlled: game.i18n.localize("COGSYNDICATE.PositionControlled")
  }[position];

  const attrLabel = {
    machine: game.i18n.localize("COGSYNDICATE.Machine"),
    engineering: game.i18n.localize("COGSYNDICATE.Engineering"),
    intrigue: game.i18n.localize("COGSYNDICATE.Intrigue")
  }[attribute];

  let effectiveAttrValue = baseEffectiveAttrValue;
  let traumaModifier = 0;
  if (applyTrauma && traumaValue > 0) {
    traumaModifier = -traumaValue;
    effectiveAttrValue = baseEffectiveAttrValue + traumaModifier;
  }

  let stressIncrease = 0;
  let steamIncrease = 0;
  let traumaMessageFromDialog = "";
  let resetStress = false;
  let steamDialogMessage = "";
  let devilDialogMessage = "";
  let stressDieMessage = "";

  // W przypadku reroll, kości stresu i pary są dołączone za darmo
  if (!isReroll) {
    // Normalna logika zarządzania stresem i punktami pary
    if (useStressDie) {
      const currentStress = actor.system.resources.stress.value || 0;
      const maxStress = actor.system.resources.stress.max || 4;
      stressIncrease = 2;

      if (currentStress + stressIncrease >= maxStress) {
        const traumaDialog = await new Promise((traumaResolve) => {
          new Dialog({
            title: game.i18n.localize("COGSYNDICATE.TraumaWarning"),
            content: `<p>${game.i18n.format("COGSYNDICATE.TraumaMessage", { agentName: actor.name })}</p>`,
            buttons: {
              cancel: {
                label: game.i18n.localize("COGSYNDICATE.Cancel"),
                callback: () => traumaResolve(false)
              },
              confirm: {
                label: game.i18n.localize("COGSYNDICATE.Confirm"),
                callback: () => traumaResolve(true)
              }
            },
            default: "confirm"
          }).render(true);
        });

        if (!traumaDialog) {
          return;
        }
        traumaMessageFromDialog = `<p>${game.i18n.localize("COGSYNDICATE.TraumaReceived")}</p>`;
        const currentTrauma = actor.system.resources.trauma.value || 0;
        const newTrauma = Math.min(currentTrauma + 1, 4);
        await actor.update({
          "system.resources.stress.value": 0,
          "system.resources.trauma.value": newTrauma
        });

        if (newTrauma === 4) {
          const maxTraumaMessage = game.i18n.localize("COGSYNDICATE.MaxTraumaReached");
          await ChatMessage.create({
            content: `<p>${maxTraumaMessage}</p>`,
            speaker: { actor: actor.id }
          });
          new Dialog({
            title: "Maximum Trauma",
            content: `<p>${maxTraumaMessage}</p>`,
            buttons: {
              ok: { label: "OK" }
            }
          }).render(true);
        }
        resetStress = true;
      } else {
        await actor.update({
          "system.resources.stress.value": Math.min(currentStress + stressIncrease, maxStress)
        });
      }
      stressDieMessage = `<p>${game.i18n.format("COGSYNDICATE.StressDieUsed", { agentName: actor.name })}</p>`;
    }

    if (useSteamDie) {
      const steamDialog = await new Promise((steamResolve) => {
        new Dialog({
          title: game.i18n.localize("COGSYNDICATE.SteamDieConfirmTitle"),
          content: `<p>${game.i18n.localize("COGSYNDICATE.SteamDieLabel")}</p>`,
          buttons: {
            cancel: {
              label: game.i18n.localize("COGSYNDICATE.Cancel"),
              callback: () => steamResolve(false)
            },
            confirm: {
              label: game.i18n.localize("COGSYNDICATE.Confirm"),
              callback: () => steamResolve(true)
            }
          },
          default: "confirm"
        }).render(true);
      });

      if (!steamDialog) {
        return;
      }

      const currentSteamPoints = game.cogwheelSyndicate.steamPoints || 0;
      if (currentSteamPoints < 2) {
        await new Dialog({
          title: game.i18n.localize("COGSYNDICATE.SteamDieInsufficientTitle"),
          content: `<p><strong style="color: red; font-size: 1.2em;">${game.i18n.localize("COGSYNDICATE.SteamDieInsufficient")}</strong></p>`,
          buttons: {
            ok: { label: "OK" }
          }
        }).render(true);
        return;
      }

      steamIncrease = 2;
      game.cogwheelSyndicate.steamPoints = Math.max(currentSteamPoints - steamIncrease, 0);
      game.socket.emit("system.cogwheel-syndicate", {
        type: "updateMetaCurrencies",
        nemesisPoints: game.cogwheelSyndicate.nemesisPoints,
        steamPoints: game.cogwheelSyndicate.steamPoints
      });
      Hooks.call("cogwheelSyndicateMetaCurrenciesUpdated");
      steamDialogMessage = `<p>${game.i18n.format("COGSYNDICATE.SteamDieUsed", { agentName: actor.name })}</p>`;
    }

    if (useDevilDie) {
      const nemesisIncrease = 2;
      game.cogwheelSyndicate.nemesisPoints = game.cogwheelSyndicate.nemesisPoints || 0;
      game.cogwheelSyndicate.nemesisPoints = Math.clamp(game.cogwheelSyndicate.nemesisPoints + nemesisIncrease, 0, 100);
      
      game.socket.emit("system.cogwheel-syndicate", {
        type: "updateMetaCurrencies",
        nemesisPoints: game.cogwheelSyndicate.nemesisPoints,
        steamPoints: game.cogwheelSyndicate.steamPoints
      });
      Hooks.call("cogwheelSyndicateMetaCurrenciesUpdated");
      devilDialogMessage = `<p>${game.i18n.format("COGSYNDICATE.DevilDieUsed", { agentName: actor.name })}</p>`;
    }
  } else {
    // W przypadku reroll, komunikaty o użyciu kości bez kosztów
    if (useStressDie) {
      stressDieMessage = `<p>${game.i18n.format("COGSYNDICATE.StressDieUsed", { agentName: actor.name })} (${game.i18n.localize("COGSYNDICATE.FreeBonus")})</p>`;
    }
    if (useSteamDie) {
      steamDialogMessage = `<p>${game.i18n.format("COGSYNDICATE.SteamDieUsed", { agentName: actor.name })} (${game.i18n.localize("COGSYNDICATE.FreeBonus")})</p>`;
    }
    if (useDevilDie) {
      devilDialogMessage = `<p>${game.i18n.format("COGSYNDICATE.DevilDieUsed", { agentName: actor.name })} (${game.i18n.localize("COGSYNDICATE.FreeBonus")})</p>`;
    }
  }

  let diceCount = 2;
  if (useStressDie) diceCount += 1;
  if (useSteamDie) diceCount += 1;
  if (useDevilDie) diceCount += 1;

  // Foundry v13 compatible roll formula
  const rollFormula = `${diceCount}d12 + ${effectiveAttrValue} + ${positionModifier} + ${rollModifier}`;
  console.log("Reroll formula:", rollFormula);
  
  const roll = new Roll(rollFormula);
  await roll.evaluate();

  const diceResults = roll.terms[0].results.map(r => r.result);
  let die1, die2, stressDie, steamDie, devilDie;
  
  if (diceCount === 5) {
    // 2d12 + stress + steam + devil
    [die1, die2, stressDie, steamDie, devilDie] = diceResults;
  } else if (diceCount === 4) {
    // 2d12 + dwie dodatkowe kości
    if (useStressDie && useSteamDie) {
      [die1, die2, stressDie, steamDie] = diceResults;
      devilDie = null;
    } else if (useStressDie && useDevilDie) {
      [die1, die2, stressDie, devilDie] = diceResults;
      steamDie = null;
    } else if (useSteamDie && useDevilDie) {
      [die1, die2, steamDie, devilDie] = diceResults;
      stressDie = null;
    }
  } else if (diceCount === 3) {
    // 2d12 + jedna dodatkowa kość
    if (useStressDie) {
      [die1, die2, stressDie] = diceResults;
      steamDie = null;
      devilDie = null;
    } else if (useSteamDie) {
      [die1, die2, steamDie] = diceResults;
      stressDie = null;
      devilDie = null;
    } else if (useDevilDie) {
      [die1, die2, devilDie] = diceResults;
      stressDie = null;
      steamDie = null;
    }
  } else {
    // tylko 2d12
    [die1, die2] = diceResults;
    stressDie = null;
    steamDie = null;
    devilDie = null;
  }
  let total = roll.total;
  let nemesisPoints = 0;
  let steamPoints = 0;
  let result;
  let resultType = "";

  const counts = {};
  diceResults.forEach(die => counts[die] = (counts[die] || 0) + 1);

  if (counts[11] >= 2) {
    result = `<span style='color: red; font-weight: bold'>${game.i18n.localize("COGSYNDICATE.AutoCriticalFailure")}</span>`;
    resultType = "AutoCriticalFailure";
    nemesisPoints += Math.min(counts[11], 4);
  } else if (counts[12] >= 2) {
    result = `<span style='color: green; font-weight: bold'>${game.i18n.localize("COGSYNDICATE.AutoCriticalSuccess")}</span>`;
    resultType = "AutoCriticalSuccess";
    steamPoints += Math.min(counts[12], 4);
  } else {
    diceResults.forEach(die => {
      if (die === 11) nemesisPoints += 1;
      if (die === 12) steamPoints += 1;
    });

    if (total <= 12) {
      result = `<span style='color: red; font-weight: bold'>${game.i18n.localize("COGSYNDICATE.FailureWithConsequence")}</span>`;
      resultType = "FailureWithConsequence";
      nemesisPoints += 1;
    } else if (total <= 18) {
      result = `<span style='color: blue; font-weight: bold'>${game.i18n.localize("COGSYNDICATE.SuccessWithCost")}</span>`;
      resultType = "SuccessWithCost";
    } else {
      result = `<span style='color: green; font-weight: bold'>${game.i18n.localize("COGSYNDICATE.FullSuccess")}</span>`;
      resultType = "FullSuccess";
      steamPoints += 1;
    }
  }
  
  // Generate consequences message if applicable (comment out for now)
  /*
  let consequencesMessage = "";
  
  // Map position strings
  const positionMap = {
    'desperate': 'desperate',
    'risky': 'risky',
    'controlled': 'controlled'
  };
  
  // Map result type strings
  const resultTypeMap = {
    'AutoCriticalFailure': 'criticalFailure',
    'FailureWithConsequence': 'failureWithConsequence',
    'SuccessWithCost': 'successWithCost'
  };
  
  const mappedPosition = positionMap[position];
  const mappedResultType = resultTypeMap[resultType];
  
  console.log('[Consequences Debug] Mapping:', { 
    originalPosition: position, 
    mappedPosition,
    originalResultType: resultType,
    mappedResultType
  });
  
  if (mappedResultType && mappedPosition) {
    // Try to get consequences from global object
    if (game.cogwheelSyndicate?.consequences?.getConsequencesMessage) {
      console.log('[Consequences Debug] Using global consequences object');
      consequencesMessage = game.cogwheelSyndicate.consequences.getConsequencesMessage(mappedPosition, mappedResultType);
      console.log('[Consequences Debug] Generated Message:', consequencesMessage);
    } else {
      console.warn('[Consequences Debug] Consequences system not available in game.cogwheelSyndicate');
      // Fallback: create message manually
      const consequencesTable = {
        'controlled': { 'successWithCost': 1, 'failureWithConsequence': 2, 'criticalFailure': 3 },
        'risky': { 'successWithCost': 2, 'failureWithConsequence': 3, 'criticalFailure': 4 },
        'desperate': { 'successWithCost': 3, 'failureWithConsequence': 4, 'criticalFailure': 4 }
      };
      const count = consequencesTable[mappedPosition]?.[mappedResultType];
      if (count) {
        const word = count === 1 ? game.i18n.localize('COGWHEEL.Consequences.Singular') : game.i18n.localize('COGWHEEL.Consequences.Plural');
        const trauma = (mappedPosition === 'desperate' && mappedResultType === 'criticalFailure') ? 
          ` + <span class="consequence-trauma">1 ${game.i18n.localize('COGWHEEL.Consequences.Trauma')}</span>` : '';
        consequencesMessage = `<div class="consequence-message">
          <i class="fas fa-exclamation-triangle"></i>
          <span class="consequence-count">${count}</span> ${word}${trauma}
        </div>`;
        console.log('[Consequences Debug] Fallback message created:', consequencesMessage);
      }
    }
  }
  */

  // Apply Steam Booster effect if applicable
  let steamBoosterMessage = "";
  if (steamPoints > 0) {
    const steamBoosterResult = FeatsEffects.applySteamBoosterEffect(actor, steamPoints);
    steamPoints = steamBoosterResult.steamPoints;
    if (steamBoosterResult.message) {
      steamBoosterMessage = steamBoosterResult.message;
    }
  }

  if (nemesisPoints > 0 || steamPoints > 0) {
    game.cogwheelSyndicate.nemesisPoints = game.cogwheelSyndicate.nemesisPoints || 0;
    game.cogwheelSyndicate.steamPoints = game.cogwheelSyndicate.steamPoints || 0;

    if (nemesisPoints > 0) {
      game.cogwheelSyndicate.nemesisPoints = Math.clamp(game.cogwheelSyndicate.nemesisPoints + nemesisPoints, 0, 100);
    }
    if (steamPoints > 0) {
      game.cogwheelSyndicate.steamPoints = Math.clamp(game.cogwheelSyndicate.steamPoints + steamPoints, 0, 100);
    }

    game.socket.emit("system.cogwheel-syndicate", {
      type: "updateMetaCurrencies",
      nemesisPoints: game.cogwheelSyndicate.nemesisPoints,
      steamPoints: game.cogwheelSyndicate.steamPoints
    });

    Hooks.call("cogwheelSyndicateMetaCurrenciesUpdated");
  }

  // Wyłączenie wszystkich starszych przycisków dla tego agenta przy każdym nowym rzucie
  disableAllUpgradeButtonsForActor(actor.id);
  
  // Rejestracja timestamp tego rzutu
  const currentRollTimestamp = Date.now();
  window.cogwheelSyndicate.lastRollTimestamp[actor.id] = currentRollTimestamp;

  // Zapisanie danych rzutu dla możliwego reroll (tylko przy oryginalnym rzucie)
  let rollDataKey = null;
  if (!isReroll) {
    rollDataKey = `${actor.id}-${currentRollTimestamp}`;
    window.cogwheelSyndicate.rollData[rollDataKey] = {
      attribute,
      position,
      useStressDie,
      useSteamDie,
      useDevilDie,
      applyTrauma,
      rollModifier,
      baseEffectiveAttrValue,
      traumaValue
    };
  }

  // Generowanie przycisków
  let upgradeButton = "";
  let rerollButton = "";
  
  if (resultType === "FailureWithConsequence" || resultType === "SuccessWithCost") {
    const buttonId = `upgrade-${currentRollTimestamp}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Rejestracja nowego przycisku jako aktualnego dla tego agenta
    window.cogwheelSyndicate.currentUpgradeButtons[actor.id] = {
      buttonId: buttonId,
      timestamp: currentRollTimestamp
    };
    
    upgradeButton = `
      <button class="success-upgrade-button" id="${buttonId}" 
              data-actor-id="${actor.id}" 
              data-result-type="${resultType}"
              data-tested-attribute="${attribute}"
              data-user-id="${game.user.id}">
        ${game.i18n.localize("COGSYNDICATE.UpgradeSuccessButton")}
      </button>
    `;
  }

  // Przycisk reroll tylko dla oryginalnych testów (nie dla rerollów)
  if (!isReroll && rollDataKey) {
    const rerollButtonId = `reroll-${currentRollTimestamp}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Rejestracja nowego przycisku reroll jako aktualnego dla tego agenta
    window.cogwheelSyndicate.currentRerollButtons[actor.id] = {
      buttonId: rerollButtonId,
      timestamp: currentRollTimestamp
    };
    
    rerollButton = `
      <button class="test-reroll-button" id="${rerollButtonId}" 
              data-actor-id="${actor.id}" 
              data-roll-data-key="${rollDataKey}"
              data-user-id="${game.user.id}">
        ${game.i18n.localize("COGSYNDICATE.RerollTestButton")}
      </button>
    `;
  }

  let chatContent = `
    <div class="roll-message">
      <div class="chat-header">
        <img src="${actor.img}" alt="${actor.name}" class="chat-avatar" />
        <h3>${game.i18n.format("COGSYNDICATE.Agent", { agentName: actor.name })}</h3>
      </div>
      <hr>
      <p><strong style='color: brown;'>${game.i18n.localize("COGSYNDICATE.Position")}: ${positionLabel}</strong></p>
      <hr>
      <p><strong style='color: black;'>${game.i18n.localize("COGSYNDICATE.RolledOn").replace('{attrLabel}', `<span style='color: #2563eb; font-weight: bold;'>${attrLabel}</span>`).replace('{total}', `<span style='color: red; font-weight: bold;'>${total}</span>`)}</strong></p>
      <hr>
      <p>${result}</p>
      ${consequencesMessage}
      ${useStressDie ? stressDieMessage : ""}
      ${useSteamDie ? steamDialogMessage : ""}
      ${useDevilDie ? devilDialogMessage : ""}
      ${traumaMessageFromDialog}
      ${applyTrauma && traumaModifier !== 0 ? `<p>${game.i18n.format("COGSYNDICATE.TraumaApplied", { traumaValue: Math.abs(traumaModifier) })}</p>` : ""}
      ${nemesisPoints > 0 ? `<p><span style='color: purple; font-weight: bold'>${game.i18n.format("COGSYNDICATE.AddedNemesisPoint", { amount: nemesisPoints })}</span></p>` : ""}
      ${steamPoints > 0 ? `<p><span style='color: orange; font-weight: bold'>${game.i18n.format("COGSYNDICATE.AddedSteamPoint", { amount: steamPoints })}</span></p>` : ""}
      ${steamBoosterMessage}
      <hr>
      <p>${game.i18n.localize("COGSYNDICATE.Roll")}: ${diceCount}d12 (${die1}+${die2}${useStressDie ? `+${stressDie}` : ""}${useSteamDie ? `+${steamDie}` : ""}${useDevilDie ? `+${devilDie}` : ""}) + ${effectiveAttrValue} (${attrLabel})${traumaModifier !== 0 ? ` ${traumaModifier} (${game.i18n.localize("COGSYNDICATE.Trauma")})` : ""} + ${positionModifier} (${game.i18n.localize("COGSYNDICATE.Position")})${rollModifier !== 0 ? ` ${rollModifier > 0 ? '+' : ''}${rollModifier} (${game.i18n.localize("COGSYNDICATE.RollModifier")})` : ""}</p>
      ${upgradeButton}
      ${rerollButton}
    </div>
  `;

  await ChatMessage.create({
    content: chatContent,
    speaker: { actor: actor.id },
    rolls: [roll],
    flavor: game.i18n.localize("COGSYNDICATE.Roll3D"),
    rollMode: "publicroll"
  });
}

// Hook do obsługi renderowania wiadomości czatu i kliknięć przycisków
Hooks.on("renderChatMessageHTML", (message, html, data) => {
  // html is now an HTMLElement instead of jQuery object
  // Sprawdzenie uprawnień dla przycisków podnoszenia sukcesu
  html.querySelectorAll('.success-upgrade-button').forEach(function(button) {
    const authorUserId = button.dataset.userId;
    
    if (!canUserInteractWithButton(authorUserId)) {
      button.disabled = true;
      button.classList.add('disabled-for-user');
      button.setAttribute('title', game.i18n.localize("COGSYNDICATE.UpgradeButtonNoPermission"));
    }
  });
  
  // Sprawdzenie uprawnień dla przycisków przerzutu
  html.querySelectorAll('.test-reroll-button').forEach(function(button) {
    const authorUserId = button.dataset.userId;
    
    if (!canUserInteractWithButton(authorUserId)) {
      button.disabled = true;
      button.classList.add('disabled-for-user');
      button.setAttribute('title', game.i18n.localize("COGSYNDICATE.RerollButtonNoPermission"));
    }
  });

  // Obsługa przycisków podnoszenia sukcesu
  html.querySelectorAll('.success-upgrade-button').forEach(function(button) {
    button.addEventListener('click', async function(event) {
    event.preventDefault();
    
    const buttonId = this.getAttribute('id');
    const actorId = this.dataset.actorId;
    const resultType = this.dataset.resultType;
    const testedAttribute = this.dataset.testedAttribute;
    const position = this.dataset.position;
    const consequenceButtonId = this.dataset.consequenceButtonId;
    const authorUserId = this.dataset.userId;
    
    // Sprawdzenie uprawnień użytkownika
    if (!canUserInteractWithButton(authorUserId)) {
      ui.notifications.warn(game.i18n.localize("COGSYNDICATE.UpgradeButtonNoPermission"));
      return;
    }
    
    const actor = game.actors.get(actorId);
    if (!actor) {
      ui.notifications.error("Actor nie został znaleziony");
      return;
    }
    
    // Sprawdzenie czy przycisk jest aktualny dla tego agenta
    const currentButtonData = window.cogwheelSyndicate.currentUpgradeButtons[actorId];
    const lastRollTimestamp = window.cogwheelSyndicate.lastRollTimestamp[actorId];
    
    // Sprawdzenie czy przycisk istnieje w rejestrze i czy jego timestamp odpowiada ostatniemu rzutowi
    if (!currentButtonData || 
        buttonId !== currentButtonData.buttonId || 
        currentButtonData.timestamp !== lastRollTimestamp) {
      ui.notifications.warn("Ten przycisk jest nieaktualny. Można podnieść poziom sukcesu tylko dla ostatniego rzutu z możliwością podniesienia.");
      button.prop('disabled', true);
      button.removeClass('success-upgrade-button').addClass('success-upgrade-button-outdated');
      button.text(game.i18n.localize("COGSYNDICATE.UpgradeSuccessButton") + " (Przestarzałe)");
      return;
    }
    
    // Wywołanie funkcji podnoszenia sukcesu z informacją o testowanym atrybucie, pozycji i przycisku konsekwencji
    await upgradeSuccessLevel(actor, resultType, testedAttribute, position, consequenceButtonId);
    
    // Wyłączenie przycisku po użyciu i usunięcie z rejestru aktualnych przycisków
    this.disabled = true;
    this.classList.remove('success-upgrade-button');
    this.classList.add('success-upgrade-button-used');
    this.textContent = game.i18n.localize("COGSYNDICATE.UpgradeSuccessButton") + " (Użyte)";
    
    // Usunięcie z rejestru aktualnych przycisków
    delete window.cogwheelSyndicate.currentUpgradeButtons[actorId];
    });
  });

  // Obsługa przycisków przerzutu testu
  html.querySelectorAll('.test-reroll-button').forEach(function(button) {
    button.addEventListener('click', async function(event) {
    event.preventDefault();
    
    const buttonId = this.getAttribute('id');
    const actorId = this.dataset.actorId;
    const rollDataKey = this.dataset.rollDataKey;
    const authorUserId = this.dataset.userId;
    
    // Sprawdzenie uprawnień użytkownika
    if (!canUserInteractWithButton(authorUserId)) {
      ui.notifications.warn(game.i18n.localize("COGSYNDICATE.RerollButtonNoPermission"));
      return;
    }
    
    const actor = game.actors.get(actorId);
    if (!actor) {
      ui.notifications.error("Actor nie został znaleziony");
      return;
    }
    
    // Sprawdzenie czy przycisk jest aktualny dla tego agenta
    const currentRerollButtonData = window.cogwheelSyndicate.currentRerollButtons[actorId];
    const lastRollTimestamp = window.cogwheelSyndicate.lastRollTimestamp[actorId];
    
    // Sprawdzenie czy przycisk istnieje w rejestrze i czy jego timestamp odpowiada ostatniemu rzutowi
    if (!currentRerollButtonData || 
        buttonId !== currentRerollButtonData.buttonId || 
        currentRerollButtonData.timestamp !== lastRollTimestamp) {
      ui.notifications.warn("Ten przycisk jest nieaktualny. Można przerzucić test tylko dla ostatniego rzutu.");
      this.disabled = true;
      this.classList.remove('test-reroll-button');
      this.classList.add('test-reroll-button-outdated');
      this.textContent = game.i18n.localize("COGSYNDICATE.RerollTestButton") + " (Przestarzałe)";
      return;
    }
    
    // Wywołanie funkcji przerzutu testu
    await rerollTest(actor, rollDataKey);
    
    // Wyłączenie przycisku po użyciu i usunięcie z rejestru aktualnych przycisków
    this.disabled = true;
    this.classList.remove('test-reroll-button');
    this.classList.add('test-reroll-button-used');
    this.textContent = game.i18n.localize("COGSYNDICATE.RerollTestButton") + " (Użyte)";
    
    // Usunięcie z rejestru aktualnych przycisków
    delete window.cogwheelSyndicate.currentRerollButtons[actorId];
    });
  });

  // Obsługa przycisków wyboru konsekwencji
  html.querySelectorAll('.select-consequences-btn').forEach(function(button) {
    // Set message ID in button after chat message is rendered
    button.dataset.messageId = message.id;

    button.addEventListener('click', async function(event) {
      event.preventDefault();
      
      const actorId = this.dataset.actorId;
      const consequenceCount = parseInt(this.dataset.consequenceCount);
      const messageId = this.dataset.messageId;
      
      // Check if button is already disabled
      if (this.disabled) {
        ui.notifications.info(game.i18n.localize('COGWHEEL.Consequences.AlreadySelected'));
        return;
      }
      
      const actor = game.actors.get(actorId);
      if (!actor) {
        ui.notifications.error("Actor nie został znaleziony");
        return;
      }
      
      const position = this.dataset.position || 'risky';
      
      // Open consequence selection dialog (from consequences module)
      await game.cogwheelSyndicate.consequences.showConsequencesSelectionDialog(
        actor, 
        consequenceCount, 
        messageId, 
        this,
        position
      );
    });
  });
});