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
        <p><strong><span class="attribute-name">${game.i18n.localize("COGSYNDICATE.Roll2d12")} ${attrLabel}:</span> <span class="attribute-value">${baseEffectiveAttrValue}</span></strong></p>
      </div>
      <div class="form-group position-group">
        <strong><span class="position-label">${game.i18n.localize("COGSYNDICATE.Position")}:</span></strong>
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
      <div class="form-group trauma-group">
        <label>
          <input type="checkbox" name="applyTrauma" />
          ${game.i18n.format("COGSYNDICATE.ApplyTraumaLabel", { traumaValue: traumaValue })}
        </label>
      </div>
      <div class="form-group modifier-group">
        <strong><span class="modifier-label">${game.i18n.localize("COGSYNDICATE.RollModifier")}:</span></strong>
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
    new Dialog({
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
            const position = html.find('[name="position"]').val();
            const useStressDie = html.find('[name="stressDie"]').is(":checked");
            const useSteamDie = html.find('[name="steamDie"]').is(":checked");
            const applyTrauma = html.find('[name="applyTrauma"]').is(":checked");
            const rollModifier = parseInt(html.find('[name="rollModifier"]').val(), 10) || 0;
            const positionModifiers = { desperate: -3, risky: 0, controlled: 3 };
            const positionModifier = positionModifiers[position];
            const positionLabel = {
              desperate: game.i18n.localize("COGSYNDICATE.PositionDesperate"),
              risky: game.i18n.localize("COGSYNDICATE.PositionRisky"),
              controlled: game.i18n.localize("COGSYNDICATE.PositionControlled")
            }[position];

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

            let diceCount = 2;
            if (useStressDie) diceCount += 1;
            if (useSteamDie) diceCount += 1;

            const rollFormula = `${diceCount}d12 + @attrMod + @positionMod + @rollMod`;
            const roll = new Roll(rollFormula, {
              attrMod: effectiveAttrValue,
              positionMod: positionModifier,
              rollMod: rollModifier
            });
            await roll.evaluate();

            const diceResults = roll.terms[0].results.map(r => r.result);
            const [die1, die2, stressDie, steamDie] = diceCount === 4 ? diceResults : 
              diceCount === 3 ? (useStressDie ? [diceResults[0], diceResults[1], diceResults[2], null] : [diceResults[0], diceResults[1], null, diceResults[2]]) : 
              [diceResults[0], diceResults[1], null, null];
            let total = roll.total;
            let nemesisPoints = 0;
            let steamPoints = 0;
            let result;

            const counts = {};
            diceResults.forEach(die => counts[die] = (counts[die] || 0) + 1);

            if (counts[11] >= 2) {
              result = `<span style='color: red; font-weight: bold'>${game.i18n.localize("COGSYNDICATE.AutoCriticalFailure")}</span>`;
              nemesisPoints += Math.min(counts[11], 4); // Naliczamy punkty proporcjonalnie do liczby 11 (max 4)
            } else if (counts[12] >= 2) {
              result = `<span style='color: green; font-weight: bold'>${game.i18n.localize("COGSYNDICATE.AutoCriticalSuccess")}</span>`;
              steamPoints += Math.min(counts[12], 4); // Naliczamy punkty proporcjonalnie do liczby 12 (max 4)
            } else {
              diceResults.forEach(die => {
                if (die === 11) nemesisPoints += 1;
                if (die === 12) steamPoints += 1;
              });

              if (total <= 12) {
                result = `<span style='color: red; font-weight: bold'>${game.i18n.localize("COGSYNDICATE.FailureWithConsequence")}</span>`;
                nemesisPoints += 1; // Dodajemy 1 Punkt Nemezis za porażkę z konsekwencją
              } else if (total <= 18) {
                result = `<span style='color: blue; font-weight: bold'>${game.i18n.localize("COGSYNDICATE.SuccessWithCost")}</span>`;
              } else {
                result = `<span style='color: green; font-weight: bold'>${game.i18n.localize("COGSYNDICATE.FullSuccess")}</span>`;
                steamPoints += 1; // Dodajemy 1 Punkt Pary za pełny sukces
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

            let chatContent = `
              <div class="roll-message">
                <div class="chat-header">
                  <img src="${actor.img}" alt="${actor.name}" class="chat-avatar" />
                  <h3>${game.i18n.format("COGSYNDICATE.Agent", { agentName: actor.name })}</h3>
                </div>
                <hr>
                <p><strong style='color: brown;'>${game.i18n.localize("COGSYNDICATE.Position")}: ${positionLabel}</strong></p>
                <hr>
                <p><strong style='color: black;'>${game.i18n.format("COGSYNDICATE.RolledOn", { attrLabel, total })}</strong></p>
                <hr>
                <p>${result}</p>
                ${useStressDie ? `<p>${game.i18n.format("COGSYNDICATE.StressDieUsed", { agentName: actor.name })}</p>` : ""}
                ${useSteamDie ? steamDialogMessage : ""}
                ${traumaDialogMessage}
                ${applyTrauma && traumaModifier !== 0 ? `<p>${game.i18n.format("COGSYNDICATE.TraumaApplied", { traumaValue: Math.abs(traumaModifier) })}</p>` : ""}
                ${nemesisPoints > 0 ? `<p><span style='color: purple; font-weight: bold'>${game.i18n.format("COGSYNDICATE.AddedNemesisPoint", { amount: nemesisPoints })}</span></p>` : ""}
                ${steamPoints > 0 ? `<p><span style='color: orange; font-weight: bold'>${game.i18n.format("COGSYNDICATE.AddedSteamPoint", { amount: steamPoints })}</span></p>` : ""}
                <hr>
                <p>${game.i18n.localize("COGSYNDICATE.Roll")}: ${diceCount}d12 (${die1}+${die2}${useStressDie ? `+${stressDie}` : ""}${useSteamDie ? `+${steamDie}` : ""}) + ${effectiveAttrValue} (${attrLabel})${traumaModifier !== 0 ? ` ${traumaModifier} (${game.i18n.localize("COGSYNDICATE.Trauma")})` : ""} + ${positionModifier} (${game.i18n.localize("COGSYNDICATE.Position")})${rollModifier !== 0 ? ` ${rollModifier > 0 ? '+' : ''}${rollModifier} (${game.i18n.localize("COGSYNDICATE.RollModifier")})` : ""}</p>
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
      width: 450
    }).render(true);
  });
}