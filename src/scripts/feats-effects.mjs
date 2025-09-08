/**
 * Feats Effects System for Cogwheel Syndicate
 * Handles special effects when specific feats (atuty) are dragged onto agents
 * based on their archetype and other conditions.
 */

export class FeatsEffects {
  /**
   * Apply effects when a feat is added to an actor
   * @param {Actor} actor - The actor receiving the feat
   * @param {Item} feat - The feat item being added
   * @returns {Promise<boolean>} - Whether any effect was applied
   */
  static async applyFeatEffects(actor, feat) {
    if (!actor || !feat || feat.type !== 'feat') {
      return false;
    }

    const archetypeName = actor.system.archetype?.name?.toLowerCase() || '';
    const featName = feat.name?.toLowerCase() || '';

    console.log(`FeatsEffects: Checking effects for feat "${feat.name}" on actor "${actor.name}" with archetype "${actor.system.archetype?.name}"`);

    // Steam Commando + Steam Augmentation effect
    if (archetypeName.includes('parowy komandos') && featName.includes('parowa augmentacja')) {
      return await this._applySteamAugmentationEffect(actor, feat);
    }

    // Tech Genius + Tinkerer effect
    if (archetypeName.includes('geniusz techniki') && featName.includes('majsterkowicz')) {
      return await this._applyTinkererEffect(actor, feat);
    }

    // Shadowmantle + Intrigant effect
    if (archetypeName.includes('płaszcz cienia') && featName.includes('intrygant')) {
      return await this._applyIntrigantEffect(actor, feat);
    }

    // Tech Genius + Steam Booster effect
    if (archetypeName.includes('geniusz techniki') && featName.includes('dopalacz pary')) {
      return await this._applySteamBoosterFeatEffect(actor, feat);
    }

    // Steam Agent + Organization Training effect
    if (archetypeName.includes('agent pary') && featName.includes('szkolenie organizacji')) {
      return await this._applyOrganizationTrainingEffect(actor, feat);
    }

    // Steam Agent + Support effect  
    if (archetypeName.includes('agent pary') && featName.includes('wsparcie')) {
      const result = await this._applySupportEffect(actor, feat);
      this.updateSteamPointsForSupportEffects();
      return result;
    }

    // Add more archetype-feat combinations here as needed
    // Example structure:
    // if (archetypeName.includes('other archetype') && featName.includes('other feat')) {
    //   return await this._applyOtherEffect(actor, feat);
    // }

    return false;
  }

  /**
   * Apply Steam Augmentation effect to Steam Commando
   * Increases base Steel (Stal) attribute by 1 (max 6)
   * @param {Actor} actor - The Steam Commando actor
   * @param {Item} feat - The Steam Augmentation feat
   * @returns {Promise<boolean>} - Whether the effect was applied
   */
  static async _applySteamAugmentationEffect(actor, feat) {
    const currentStalBase = actor.system.attributes.machine.base || 1;
    const maxStalBase = 6;

    // Check if Steel can be increased
    if (currentStalBase >= maxStalBase) {
      ui.notifications.warn(
        game.i18n.format("COGSYNDICATE.SteamAugmentationMaxReached", {
          agentName: actor.name,
          maxValue: maxStalBase
        })
      );
      return false;
    }

    const newStalBase = Math.min(currentStalBase + 1, maxStalBase);
    const increase = newStalBase - currentStalBase;

    // Apply the attribute increase
    const updates = {
      "system.attributes.machine.base": newStalBase,
      "system.attributes.machine.value": newStalBase // Also update current value
    };

    await actor.update(updates);

    // Show notification
    ui.notifications.info(
      game.i18n.format("COGSYNDICATE.SteamAugmentationIncreased", {
        agentName: actor.name,
        increase: increase,
        oldValue: currentStalBase,
        newValue: newStalBase
      })
    );

    // Log to chat
    await ChatMessage.create({
      content: `
        <div class="feat-effect-message">
          <h3><i class="fas fa-cog"></i> ${game.i18n.localize("COGSYNDICATE.FeatEffectAppliedTitle")}</h3>
          <p><strong>${actor.name}</strong> otrzymał <strong>${feat.name}</strong></p>
          <p><strong>Efekt:</strong> Bazowa wartość <strong>Stali</strong> wzrosła o ${increase} (z ${currentStalBase} na ${newStalBase})</p>
          <hr>
          <p><em>Archetyp: ${actor.system.archetype.name}</em></p>
        </div>
      `,
      speaker: { actor: actor.id }
    });

    return true;
  }

  /**
   * Apply Tinkerer effect to Tech Genius
   * Increases base Engineering (Maszyna) attribute by 1 (max 6)
   * @param {Actor} actor - The Tech Genius actor
   * @param {Item} feat - The Tinkerer feat
   * @returns {Promise<boolean>} - Whether the effect was applied
   */
  static async _applyTinkererEffect(actor, feat) {
    const currentMaszynaBase = actor.system.attributes.engineering.base || 1;
    const maxMaszynaBase = 6;

    // Check if Engineering can be increased
    if (currentMaszynaBase >= maxMaszynaBase) {
      ui.notifications.warn(
        `${actor.name}: Atrybut Maszyna już osiągnął maksymalną wartość bazową (${maxMaszynaBase}). Efekt Majsterkowicza nie może być zastosowany.`
      );
      return false;
    }

    const newMaszynaBase = Math.min(currentMaszynaBase + 1, maxMaszynaBase);
    const increase = newMaszynaBase - currentMaszynaBase;

    // Apply the attribute increase
    const updates = {
      "system.attributes.engineering.base": newMaszynaBase,
      "system.attributes.engineering.value": newMaszynaBase // Also update current value
    };

    await actor.update(updates);

    // Show notification
    ui.notifications.info(
      `${actor.name}: Majsterkowicz zwiększył bazową wartość Maszyny o ${increase} (z ${currentMaszynaBase} na ${newMaszynaBase}).`
    );

    // Log to chat
    await ChatMessage.create({
      content: `
        <div class="feat-effect-message">
          <h3><i class="fas fa-wrench"></i> Efekt Atutu</h3>
          <p><strong>${actor.name}</strong> otrzymał <strong>${feat.name}</strong></p>
          <p><strong>Efekt:</strong> Bazowa wartość <strong>Maszyny</strong> wzrosła o ${increase} (z ${currentMaszynaBase} na ${newMaszynaBase})</p>
          <hr>
          <p><em>Archetyp: ${actor.system.archetype.name}</em></p>
        </div>
      `,
      speaker: { actor: actor.id }
    });

    return true;
  }

  /**
   * Apply Intrigant effect to Shadowmantle
   * Increases base Intrigue (Intryga) attribute by 1 (max 6)
   * @param {Actor} actor - The Shadowmantle actor
   * @param {Item} feat - The Intrigant feat
   * @returns {Promise<boolean>} - Whether the effect was applied
   */
  static async _applyIntrigantEffect(actor, feat) {
    const currentIntrigaBase = actor.system.attributes.intrigue.base || 1;
    const maxIntrigaBase = 6;

    // Check if Intrigue can be increased
    if (currentIntrigaBase >= maxIntrigaBase) {
      ui.notifications.warn(
        `${actor.name}: Atrybut Intryga już osiągnął maksymalną wartość bazową (${maxIntrigaBase}). Efekt Intryganta nie może być zastosowany.`
      );
      return false;
    }

    const newIntrigaBase = Math.min(currentIntrigaBase + 1, maxIntrigaBase);
    const increase = newIntrigaBase - currentIntrigaBase;

    // Apply the attribute increase
    const updates = {
      "system.attributes.intrigue.base": newIntrigaBase,
      "system.attributes.intrigue.value": newIntrigaBase // Also update current value
    };

    await actor.update(updates);

    // Show notification
    ui.notifications.info(
      game.i18n.format("COGSYNDICATE.IntrigantIncreased", {
        agentName: actor.name,
        increase: increase,
        oldValue: currentIntrigaBase,
        newValue: newIntrigaBase
      })
    );

    // Log to chat
    await ChatMessage.create({
      content: `
        <div class="feat-effect-message">
          <h3><i class="fas fa-mask"></i> ${game.i18n.localize("COGSYNDICATE.FeatEffectAppliedTitle")}</h3>
          <p><strong>${actor.name}</strong> otrzymał <strong>${feat.name}</strong></p>
          <p><strong>Efekt:</strong> Bazowa wartość <strong>Intrygi</strong> wzrosła o ${increase} (z ${currentIntrigaBase} na ${newIntrigaBase})</p>
          <hr>
          <p><em>Archetyp: ${actor.system.archetype.name}</em></p>
        </div>
      `,
      speaker: { actor: actor.id }
    });

    return true;
  }

  /**
   * Apply Steam Booster feat effect to Tech Genius
   * This is a passive effect that doesn't modify attributes but shows notification
   * @param {Actor} actor - The Tech Genius actor
   * @param {Item} feat - The Steam Booster feat
   * @returns {Promise<boolean>} - Whether the effect was applied
   */
  static async _applySteamBoosterFeatEffect(actor, feat) {
    // Show notification
    ui.notifications.info(
      `${actor.name}: Dopalacz Pary aktywowany - punkty Pary będą podwajane podczas testów atrybutów głównych.`
    );

    // Log to chat
    await ChatMessage.create({
      content: `
        <div class="feat-effect-message">
          <h3><i class="fas fa-tachometer-alt"></i> Efekt Atutu</h3>
          <p><strong>${actor.name}</strong> otrzymał <strong>${feat.name}</strong></p>
          <p><strong>Efekt:</strong> Punkty Pary będą <strong>podwajane</strong> podczas testów atrybutów głównych</p>
          <hr>
          <p><em>Archetyp: ${actor.system.archetype.name}</em></p>
        </div>
      `,
      speaker: { actor: actor.id }
    });

    return true;
  }

  /**
   * Remove effects when a feat is removed from an actor
   * @param {Actor} actor - The actor losing the feat
   * @param {Item} feat - The feat item being removed
   * @returns {Promise<boolean>} - Whether any effect was removed
   */
  static async removeFeatEffects(actor, feat) {
    if (!actor || !feat || feat.type !== 'feat') {
      return false;
    }

    const archetypeName = actor.system.archetype?.name?.toLowerCase() || '';
    const featName = feat.name?.toLowerCase() || '';

    console.log(`FeatsEffects: Checking removal effects for feat "${feat.name}" on actor "${actor.name}"`);

    // Steam Commando + Steam Augmentation removal
    if (archetypeName.includes('parowy komandos') && featName.includes('parowa augmentacja')) {
      return await this._removeSteamAugmentationEffect(actor, feat);
    }

    // Tech Genius + Tinkerer removal
    if (archetypeName.includes('geniusz techniki') && featName.includes('majsterkowicz')) {
      return await this._removeTinkererEffect(actor, feat);
    }

    // Shadowmantle + Intrigant removal
    if (archetypeName.includes('płaszcz cienia') && featName.includes('intrygant')) {
      return await this._removeIntrigantEffect(actor, feat);
    }

    // Tech Genius + Steam Booster removal
    if (archetypeName.includes('geniusz techniki') && featName.includes('dopalacz pary')) {
      return await this._removeSteamBoosterFeatEffect(actor, feat);
    }

    // Steam Agent + Organization Training removal
    if (archetypeName.includes('agent pary') && featName.includes('szkolenie organizacji')) {
      return await this._removeOrganizationTrainingEffect(actor, feat);
    }

    // Steam Agent + Support removal
    if (archetypeName.includes('agent pary') && featName.includes('wsparcie')) {
      const result = await this._removeSupportEffect(actor, feat);
      this.updateSteamPointsForSupportEffects();
      return result;
    }

    // Add more removal effects here as needed

    return false;
  }

  /**
   * Remove Steam Augmentation effect from Steam Commando
   * Decreases base Steel (Stal) attribute by 1 (min archetype base)
   * @param {Actor} actor - The Steam Commando actor
   * @param {Item} feat - The Steam Augmentation feat
   * @returns {Promise<boolean>} - Whether the effect was removed
   */
  static async _removeSteamAugmentationEffect(actor, feat) {
    const currentStalBase = actor.system.attributes.machine.base || 1;
    const archetypeId = actor.system.archetype.id;
    
    // Get archetype's base Steel value
    let archetypeStalBase = 5; // Default for Steam Commando
    if (archetypeId) {
      const archetypeItem = game.items.get(archetypeId);
      if (archetypeItem?.system?.attributes?.machine) {
        archetypeStalBase = archetypeItem.system.attributes.machine;
      }
    }

    // Check if Steel can be decreased (shouldn't go below archetype base)
    if (currentStalBase <= archetypeStalBase) {
      ui.notifications.warn(
        `${actor.name}: Atrybut Stal już ma wartość bazową archetypu (${archetypeStalBase}). Nie można usunąć efektu Parowej Augmentacji.`
      );
      return false;
    }

    const newStalBase = Math.max(currentStalBase - 1, archetypeStalBase);
    const decrease = currentStalBase - newStalBase;

    // Apply the attribute decrease
    const updates = {
      "system.attributes.machine.base": newStalBase,
      "system.attributes.machine.value": newStalBase // Also update current value
    };

    await actor.update(updates);

    // Show notification
    ui.notifications.info(
      `${actor.name}: Usunięcie Parowej Augmentacji zmniejszyło bazową wartość Stali o ${decrease} (z ${currentStalBase} na ${newStalBase}).`
    );

    // Log to chat
    await ChatMessage.create({
      content: `
        <div class="feat-effect-message">
          <h3><i class="fas fa-cog"></i> Usunięcie Efektu Atutu</h3>
          <p><strong>${actor.name}</strong> stracił <strong>${feat.name}</strong></p>
          <p><strong>Efekt:</strong> Bazowa wartość <strong>Stali</strong> zmniejszyła się o ${decrease} (z ${currentStalBase} na ${newStalBase})</p>
          <hr>
          <p><em>Archetyp: ${actor.system.archetype.name}</em></p>
        </div>
      `,
      speaker: { actor: actor.id }
    });

    return true;
  }

  /**
   * Remove Tinkerer effect from Tech Genius
   * Decreases base Engineering (Maszyna) attribute by 1 (min archetype base)
   * @param {Actor} actor - The Tech Genius actor
   * @param {Item} feat - The Tinkerer feat
   * @returns {Promise<boolean>} - Whether the effect was removed
   */
  static async _removeTinkererEffect(actor, feat) {
    const currentMaszynaBase = actor.system.attributes.engineering.base || 1;
    const archetypeId = actor.system.archetype.id;
    
    // Get archetype's base Engineering value
    let archetypeMaszynaBase = 1; // Default base value
    if (archetypeId) {
      const archetypeItem = game.items.get(archetypeId);
      if (archetypeItem?.system?.attributes?.engineering) {
        archetypeMaszynaBase = archetypeItem.system.attributes.engineering;
      }
    }

    // Check if Engineering can be decreased (shouldn't go below archetype base)
    if (currentMaszynaBase <= archetypeMaszynaBase) {
      ui.notifications.warn(
        `${actor.name}: Atrybut Maszyna już ma wartość bazową archetypu (${archetypeMaszynaBase}). Nie można usunąć efektu Majsterkowicza.`
      );
      return false;
    }

    const newMaszynaBase = Math.max(currentMaszynaBase - 1, archetypeMaszynaBase);
    const decrease = currentMaszynaBase - newMaszynaBase;

    // Apply the attribute decrease
    const updates = {
      "system.attributes.engineering.base": newMaszynaBase,
      "system.attributes.engineering.value": newMaszynaBase // Also update current value
    };

    await actor.update(updates);

    // Show notification
    ui.notifications.info(
      `${actor.name}: Usunięcie Majsterkowicza zmniejszyło bazową wartość Maszyny o ${decrease} (z ${currentMaszynaBase} na ${newMaszynaBase}).`
    );

    // Log to chat
    await ChatMessage.create({
      content: `
        <div class="feat-effect-message">
          <h3><i class="fas fa-wrench"></i> Usunięcie Efektu Atutu</h3>
          <p><strong>${actor.name}</strong> stracił <strong>${feat.name}</strong></p>
          <p><strong>Efekt:</strong> Bazowa wartość <strong>Maszyny</strong> zmniejszyła się o ${decrease} (z ${currentMaszynaBase} na ${newMaszynaBase})</p>
          <hr>
          <p><em>Archetyp: ${actor.system.archetype.name}</em></p>
        </div>
      `,
      speaker: { actor: actor.id }
    });

    return true;
  }

  /**
   * Remove Intrigant effect from Shadowmantle
   * Decreases base Intrigue (Intryga) attribute by 1 (min archetype base)
   * @param {Actor} actor - The Shadowmantle actor
   * @param {Item} feat - The Intrigant feat
   * @returns {Promise<boolean>} - Whether the effect was removed
   */
  static async _removeIntrigantEffect(actor, feat) {
    const currentIntrigaBase = actor.system.attributes.intrigue.base || 1;
    const archetypeId = actor.system.archetype.id;
    
    // Get archetype's base Intrigue value (default for Shadowmantle is 5)
    let archetypeIntrigaBase = 5; // Default for Shadowmantle
    if (archetypeId) {
      const archetypeItem = game.items.get(archetypeId);
      if (archetypeItem?.system?.attributes?.intrigue) {
        archetypeIntrigaBase = archetypeItem.system.attributes.intrigue;
      }
    }

    // Check if Intrigue can be decreased (shouldn't go below archetype base)
    if (currentIntrigaBase <= archetypeIntrigaBase) {
      ui.notifications.warn(
        `${actor.name}: Atrybut Intryga już ma wartość bazową archetypu (${archetypeIntrigaBase}). Nie można usunąć efektu Intryganta.`
      );
      return false;
    }

    const newIntrigaBase = Math.max(currentIntrigaBase - 1, archetypeIntrigaBase);
    const decrease = currentIntrigaBase - newIntrigaBase;

    // Apply the attribute decrease
    const updates = {
      "system.attributes.intrigue.base": newIntrigaBase,
      "system.attributes.intrigue.value": newIntrigaBase // Also update current value
    };

    await actor.update(updates);

    // Show notification
    ui.notifications.info(
      game.i18n.format("COGSYNDICATE.IntrigantRemoved", {
        agentName: actor.name,
        decrease: decrease,
        oldValue: currentIntrigaBase,
        newValue: newIntrigaBase
      })
    );

    // Log to chat
    await ChatMessage.create({
      content: `
        <div class="feat-effect-message">
          <h3><i class="fas fa-mask"></i> ${game.i18n.localize("COGSYNDICATE.FeatEffectRemovedTitle")}</h3>
          <p><strong>${actor.name}</strong> stracił <strong>${feat.name}</strong></p>
          <p><strong>Efekt:</strong> Bazowa wartość <strong>Intrygi</strong> zmniejszyła się o ${decrease} (z ${currentIntrigaBase} na ${newIntrigaBase})</p>
          <hr>
          <p><em>Archetyp: ${actor.system.archetype.name}</em></p>
        </div>
      `,
      speaker: { actor: actor.id }
    });

    return true;
  }

  /**
   * Remove Steam Booster feat effect from Tech Genius
   * This is a passive effect removal that shows notification
   * @param {Actor} actor - The Tech Genius actor
   * @param {Item} feat - The Steam Booster feat
   * @returns {Promise<boolean>} - Whether the effect was removed
   */
  static async _removeSteamBoosterFeatEffect(actor, feat) {
    // Show notification
    ui.notifications.info(
      game.i18n.format("COGSYNDICATE.SteamBoosterRemoved", { agentName: actor.name })
    );

    // Log to chat
    await ChatMessage.create({
      content: `
        <div class="feat-effect-message">
          <h3><i class="fas fa-tachometer-alt"></i> ${game.i18n.localize("COGSYNDICATE.FeatEffectRemovedTitle")}</h3>
          <p><strong>${actor.name}</strong> stracił <strong>${feat.name}</strong></p>
          <p><strong>Efekt:</strong> Punkty Pary nie będą już <strong>podwajane</strong> podczas testów atrybutów głównych</p>
          <hr>
          <p><em>Archetyp: ${actor.system.archetype.name}</em></p>
        </div>
      `,
      speaker: { actor: actor.id }
    });

    return true;
  }

  /**
   * Apply Organization Training effect to Steam Agent
   * Shows dialog for attribute selection and increases chosen attribute by 1 (max 6)
   * @param {Actor} actor - The Steam Agent actor
   * @param {Item} feat - The Organization Training feat
   * @returns {Promise<boolean>} - Whether the effect was applied
   */
  static async _applyOrganizationTrainingEffect(actor, feat) {
    // Check if all base attributes are at their starting value (3) for Steam Agent
    const attributes = {
      machine: { key: 'machine', name: 'Stal', current: actor.system.attributes.machine.base || 1 },
      engineering: { key: 'engineering', name: 'Maszyna', current: actor.system.attributes.engineering.base || 1 },
      intrigue: { key: 'intrigue', name: 'Intryga', current: actor.system.attributes.intrigue.base || 1 }
    };

    // Get attributes that can be increased (not at maximum 6)
    const availableAttributes = Object.entries(attributes).filter(([key, attr]) => attr.current < 6);

    if (availableAttributes.length === 0) {
      ui.notifications.warn(
        game.i18n.format("COGSYNDICATE.OrganizationTrainingMaxAttributesWarning", { agentName: actor.name })
      );
      return false;
    }

    // Create attribute selection dialog
    const firstAttributeKey = availableAttributes[0][0];
    const attributeOptions = availableAttributes.map(([key, attr], index) => 
      `<option value="${key}">${attr.name} (${attr.current} → ${Math.min(attr.current + 1, 6)})</option>`
    ).join('');

    const dialogContent = `
      <div class="organization-training-dialog">
        <h3><i class="fas fa-graduation-cap"></i> ${game.i18n.localize("COGSYNDICATE.OrganizationTrainingTitle")}</h3>
        <p><strong>${game.i18n.format("COGSYNDICATE.OrganizationTrainingReceives", { agentName: actor.name })}</strong></p>
        <p>${game.i18n.localize("COGSYNDICATE.OrganizationTrainingSelect")}</p>
        <div class="form-group">
          <label for="chosen-attribute"><strong>${game.i18n.localize("COGSYNDICATE.OrganizationTrainingMainAttribute")}</strong></label>
          <select id="chosen-attribute" name="chosenAttribute" style="width: 100%;">
            <option value="${firstAttributeKey}" selected>${availableAttributes[0][1].name} (${availableAttributes[0][1].current} → ${Math.min(availableAttributes[0][1].current + 1, 6)})</option>
            ${availableAttributes.slice(1).map(([key, attr]) => 
              `<option value="${key}">${attr.name} (${attr.current} → ${Math.min(attr.current + 1, 6)})</option>`
            ).join('')}
          </select>
        </div>
        <p><em>${game.i18n.localize("COGSYNDICATE.OrganizationTrainingBonus")}</em></p>
      </div>
    `;

    return new Promise((resolve) => {
      new Dialog({
        title: game.i18n.localize("COGSYNDICATE.OrganizationTrainingTitle") || "Szkolenie Organizacji",
        content: dialogContent,
        buttons: {
          cancel: {
            label: game.i18n.localize("COGSYNDICATE.Cancel") || "Anuluj",
            callback: () => resolve(false)
          },
          confirm: {
            label: game.i18n.localize("COGSYNDICATE.Confirm") || "Zatwierdź",
            callback: async (html) => {
              const chosenAttribute = html.find('[name="chosenAttribute"]').val();
              const attributeData = attributes[chosenAttribute];
              
              if (!attributeData) {
                ui.notifications.error(game.i18n.localize("COGSYNDICATE.AttributeCannotBeFound"));
                resolve(false);
                return;
              }

              const newValue = Math.min(attributeData.current + 1, 6);
              const updateKey = `system.attributes.${chosenAttribute}.base`;

              try {
                await actor.update({ [updateKey]: newValue });

                // Show success notification
                ui.notifications.info(
                  game.i18n.format("COGSYNDICATE.OrganizationTrainingIncreased", {
                    agentName: actor.name,
                    attributeName: attributeData.name,
                    oldValue: attributeData.current,
                    newValue: newValue
                  })
                );

                // Log to chat with steampunk styling
                await ChatMessage.create({
                  content: `
                    <div class="feat-effect-message">
                      <h3><i class="fas fa-graduation-cap"></i> ${game.i18n.localize("COGSYNDICATE.FeatEffectAppliedTitle")}</h3>
                      <p><strong>${actor.name}</strong> otrzymał <strong>${feat.name}</strong></p>
                      <p><strong>Efekt:</strong> Bazowa wartość <strong>${attributeData.name}</strong> zwiększona z <span style="color: #8b4513;">${attributeData.current}</span> na <span style="color: #cd7f32; font-weight: bold;">${newValue}</span></p>
                      <hr>
                      <p><em>Archetyp: ${actor.system.archetype.name}</em></p>
                    </div>
                  `,
                  speaker: { actor: actor.id }
                });

                resolve(true);
              } catch (error) {
                console.error('Error applying Organization Training effect:', error);
                ui.notifications.error(game.i18n.format("COGSYNDICATE.ApplyEffectError", { error: error.message }));
                resolve(false);
              }
            }
          }
        },
        default: "confirm",
        width: 400,
        classes: ["cogsyndicate", "dialog", "organization-training-dialog"],
        close: () => resolve(false)
      }).render(true);
    });
  }

  /**
   * Remove Organization Training effect from Steam Agent
   * Shows dialog for attribute selection and decreases chosen attribute by 1 (min archetype base)
   * @param {Actor} actor - The Steam Agent actor
   * @param {Item} feat - The Organization Training feat
   * @returns {Promise<boolean>} - Whether the effect was removed
   */
  static async _removeOrganizationTrainingEffect(actor, feat) {
    const attributes = {
      machine: { key: 'machine', name: 'Stal', current: actor.system.attributes.machine.base || 1, base: 3 },
      engineering: { key: 'engineering', name: 'Maszyna', current: actor.system.attributes.engineering.base || 1, base: 3 },
      intrigue: { key: 'intrigue', name: 'Intryga', current: actor.system.attributes.intrigue.base || 1, base: 3 }
    };

    // Get attributes that can be decreased (above archetype base of 3)
    const availableAttributes = Object.entries(attributes).filter(([key, attr]) => attr.current > attr.base);

    if (availableAttributes.length === 0) {
      ui.notifications.warn(
        game.i18n.format("COGSYNDICATE.OrganizationTrainingRemovalNoAttributes", { agentName: actor.name })
      );
      
      // Still log removal message
      await ChatMessage.create({
        content: `
          <div class="feat-effect-message">
            <h3><i class="fas fa-graduation-cap"></i> ${game.i18n.localize("COGSYNDICATE.FeatEffectRemovedTitle")}</h3>
            <p><strong>${actor.name}</strong> stracił <strong>${feat.name}</strong></p>
            <p><strong>Efekt:</strong> Brak atrybutów do zmniejszenia (wszystkie na poziomie bazowym archetypu)</p>
            <hr>
            <p><em>Archetyp: ${actor.system.archetype.name}</em></p>
          </div>
        `,
        speaker: { actor: actor.id }
      });
      
      return true;
    }

    // Create attribute selection dialog for removal
    const firstAttributeKey = availableAttributes[0][0];
    const attributeOptions = availableAttributes.map(([key, attr], index) => 
      `<option value="${key}">${attr.name} (${attr.current} → ${Math.max(attr.current - 1, attr.base)})</option>`
    ).join('');

    const dialogContent = `
      <div class="organization-training-dialog">
        <h3><i class="fas fa-graduation-cap"></i> ${game.i18n.localize("COGSYNDICATE.OrganizationTrainingRemoval")}</h3>
        <p><strong>${game.i18n.format("COGSYNDICATE.OrganizationTrainingRemovalLoses", { agentName: actor.name })}</strong></p>
        <p>${game.i18n.localize("COGSYNDICATE.OrganizationTrainingRemovalSelect")}</p>
        <div class="form-group">
          <label for="chosen-attribute"><strong>${game.i18n.localize("COGSYNDICATE.OrganizationTrainingRemovalAttribute")}</strong></label>
          <select id="chosen-attribute" name="chosenAttribute" style="width: 100%;">
            <option value="${firstAttributeKey}" selected>${availableAttributes[0][1].name} (${availableAttributes[0][1].current} → ${Math.max(availableAttributes[0][1].current - 1, availableAttributes[0][1].base)})</option>
            ${availableAttributes.slice(1).map(([key, attr]) => 
              `<option value="${key}">${attr.name} (${attr.current} → ${Math.max(attr.current - 1, attr.base)})</option>`
            ).join('')}
          </select>
        </div>
        <p><em>${game.i18n.localize("COGSYNDICATE.OrganizationTrainingRemovalPenalty")}</em></p>
      </div>
    `;

    return new Promise((resolve) => {
      new Dialog({
        title: game.i18n.localize("COGSYNDICATE.OrganizationTrainingRemoval") || "Usunięcie: Szkolenie Organizacji",
        content: dialogContent,
        buttons: {
          cancel: {
            label: game.i18n.localize("COGSYNDICATE.Cancel") || "Anuluj",
            callback: () => resolve(false)
          },
          confirm: {
            label: game.i18n.localize("COGSYNDICATE.Confirm") || "Zatwierdź",
            callback: async (html) => {
              const chosenAttribute = html.find('[name="chosenAttribute"]').val();
              const attributeData = attributes[chosenAttribute];
              
              if (!attributeData) {
                ui.notifications.error(game.i18n.localize("COGSYNDICATE.AttributeCannotBeFound"));
                resolve(false);
                return;
              }

              const newValue = Math.max(attributeData.current - 1, attributeData.base);
              const updateKey = `system.attributes.${chosenAttribute}.base`;

              try {
                await actor.update({ [updateKey]: newValue });

                // Show success notification
                ui.notifications.info(
                  game.i18n.format("COGSYNDICATE.OrganizationTrainingRemovalDecreased", {
                    agentName: actor.name,
                    attributeName: attributeData.name,
                    oldValue: attributeData.current,
                    newValue: newValue
                  })
                );

                // Log to chat
                await ChatMessage.create({
                  content: `
                    <div class="feat-effect-message">
                      <h3><i class="fas fa-graduation-cap"></i> ${game.i18n.localize("COGSYNDICATE.FeatEffectRemovedTitle")}</h3>
                      <p><strong>${actor.name}</strong> stracił <strong>${feat.name}</strong></p>
                      <p><strong>Efekt:</strong> Bazowa wartość <strong>${attributeData.name}</strong> obniżona z <span style="color: #cd7f32;">${attributeData.current}</span> na <span style="color: #8b4513; font-weight: bold;">${newValue}</span></p>
                      <hr>
                      <p><em>Archetyp: ${actor.system.archetype.name}</em></p>
                    </div>
                  `,
                  speaker: { actor: actor.id }
                });

                resolve(true);
              } catch (error) {
                console.error('Error removing Organization Training effect:', error);
                ui.notifications.error(game.i18n.format("COGSYNDICATE.RemoveEffectError", { error: error.message }));
                resolve(false);
              }
            }
          }
        },
        default: "confirm",
        width: 400,
        classes: ["cogsyndicate", "dialog", "organization-training-dialog"],
        close: () => resolve(false)
      }).render(true);
    });
  }

  /**
   * Check if a feat has special effects for the given actor
   * @param {Actor} actor - The actor to check
   * @param {Item} feat - The feat to check
   * @returns {boolean} - Whether the feat has special effects
   */
  static hasFeatEffects(actor, feat) {
    if (!actor || !feat || feat.type !== 'feat') {
      return false;
    }

    const archetypeName = actor.system.archetype?.name?.toLowerCase() || '';
    const featName = feat.name?.toLowerCase() || '';

    // Steam Commando + Steam Augmentation
    if (archetypeName.includes('parowy komandos') && featName.includes('parowa augmentacja')) {
      return true;
    }

    // Tech Genius + Tinkerer
    if (archetypeName.includes('geniusz techniki') && featName.includes('majsterkowicz')) {
      return true;
    }

    // Shadowmantle + Intrigant
    if (archetypeName.includes('płaszcz cienia') && featName.includes('intrygant')) {
      return true;
    }

    // Tech Genius + Steam Booster
    if (archetypeName.includes('geniusz techniki') && featName.includes('dopalacz pary')) {
      return true;
    }

    // Steam Agent + Organization Training
    if (archetypeName.includes('agent pary') && featName.includes('szkolenie organizacji')) {
      return true;
    }

    // Add more checks here as needed

    return false;
  }

  /**
   * Get description of effects for a feat on a specific actor
   * @param {Actor} actor - The actor to check
   * @param {Item} feat - The feat to check
   * @returns {string|null} - Description of effects or null if no effects
   */
  static getFeatEffectDescription(actor, feat) {
    if (!actor || !feat || feat.type !== 'feat') {
      return null;
    }

    const archetypeName = actor.system.archetype?.name?.toLowerCase() || '';
    const featName = feat.name?.toLowerCase() || '';

    // Steam Commando + Steam Augmentation
    if (archetypeName.includes('parowy komandos') && featName.includes('parowa augmentacja')) {
      const currentStal = actor.system.attributes.machine.base || 1;
      const canIncrease = currentStal < 6;
      return canIncrease 
        ? `Zwiększy bazową wartość Stali z ${currentStal} na ${Math.min(currentStal + 1, 6)}`
        : `Stal już ma maksymalną wartość bazową (6) - efekt nie zostanie zastosowany`;
    }

    // Tech Genius + Tinkerer
    if (archetypeName.includes('geniusz techniki') && featName.includes('majsterkowicz')) {
      const currentMaszyna = actor.system.attributes.engineering.base || 1;
      const canIncrease = currentMaszyna < 6;
      return canIncrease 
        ? `Zwiększy bazową wartość Maszyny z ${currentMaszyna} na ${Math.min(currentMaszyna + 1, 6)}`
        : `Maszyna już ma maksymalną wartość bazową (6) - efekt nie zostanie zastosowany`;
    }

    // Shadowmantle + Intrigant
    if (archetypeName.includes('płaszcz cienia') && featName.includes('intrygant')) {
      const currentIntryga = actor.system.attributes.intrigue.base || 1;
      const canIncrease = currentIntryga < 6;
      return canIncrease 
        ? `Zwiększy bazową wartość Intrygi z ${currentIntryga} na ${Math.min(currentIntryga + 1, 6)}`
        : `Intryga już ma maksymalną wartość bazową (6) - efekt nie zostanie zastosowany`;
    }

    // Tech Genius + Steam Booster
    if (archetypeName.includes('geniusz techniki') && featName.includes('dopalacz pary')) {
      return `Punkty Pary będą podwajane podczas testów atrybutów głównych`;
    }

    // Steam Agent + Organization Training
    if (archetypeName.includes('agent pary') && featName.includes('szkolenie organizacji')) {
      return `Umożliwi wybór głównego atrybutu do wzmocnienia (zwiększenie bazowej wartości o 1)`;
    }

    // Steam Agent + Support
    if (archetypeName.includes('agent pary') && featName.includes('wsparcie')) {
      return game.i18n.localize("COGSYNDICATE.SupportFeatDescription");
    }

    // Add more descriptions here as needed

    return null;
  }

  /**
   * Check if actor has Steam Booster effect active
   * (Tech Genius archetype with Steam Booster feat)
   * @param {Actor} actor - The actor to check
   * @returns {boolean} - Whether Steam Booster effect is active
   */
  static hasSteamBoosterEffect(actor) {
    try {
      if (!actor || !actor.system.archetype?.name) {
        return false;
      }

      const archetypeName = actor.system.archetype.name.toLowerCase();
      
      // Check if actor is Tech Genius
      const isTechGenius = archetypeName.includes('geniusz techniki');
      
      if (!isTechGenius) {
        return false;
      }

      // Use the same method as actor sheets to get feats from system.feats array
      const featIds = actor.system.feats || [];
      
      // Resolve feat IDs to actual items from game.items (same as actor-sheet.js and actor-sheetv2.js)
      const actorFeats = featIds
        .map(id => game.items.get(id))
        .filter(item => item && item.type === "feat");
      
      if (!actorFeats || actorFeats.length === 0) {
        return false;
      }

      const steamBoosterFeat = actorFeats.find(item => {
        const isRightType = item.type === 'feat';
        const hasRightName = item.name.toLowerCase().includes('dopalacz pary');
        return isRightType && hasRightName;
      });

      return !!steamBoosterFeat;
    } catch (error) {
      console.error(`Error in hasSteamBoosterEffect:`, error);
      return false;
    }
  }

  /**
   * Apply Steam Booster effect to steam points generation
   * Doubles steam points for Tech Genius with Steam Booster feat
   * @param {Actor} actor - The actor generating steam points
   * @param {number} originalSteamPoints - Original steam points generated
   * @returns {Object} - {steamPoints: number, message: string|null}
   */
  static applySteamBoosterEffect(actor, originalSteamPoints) {
    if (originalSteamPoints <= 0) {
      return { steamPoints: originalSteamPoints, message: null };
    }
    
    try {
      if (!this.hasSteamBoosterEffect(actor)) {
        return { steamPoints: originalSteamPoints, message: null };
      }

      const doubledSteamPoints = originalSteamPoints * 2;
      
      const message = `
      <div class="steam-booster-effect">
        <p style="color: #cd7f32; font-weight: bold; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">
          <i class="fas fa-tachometer-alt"></i> ${game.i18n.localize("COGSYNDICATE.FeatSteamBoosterEffect")}
        </p>
      </div>
    `;

      return { steamPoints: doubledSteamPoints, message: message };
    } catch (error) {
      console.error(`Error in applySteamBoosterEffect:`, error);
      return { steamPoints: originalSteamPoints, message: null };
    }
  }

  /**
   * Apply Support effect to Steam Agent
   * Increases starting Steam Points pool from 1 to 2
   * @param {Actor} actor - The Steam Agent actor
   * @param {Item} feat - The Support feat
   * @returns {Promise<boolean>} - Whether the effect was applied
   */
  static async _applySupportEffect(actor, feat) {
    // Show notification
    ui.notifications.info(
      game.i18n.format("COGSYNDICATE.SupportEffectApplied", { agentName: actor.name })
    );

    // Log to chat
    await ChatMessage.create({
      content: `
        <div class="feat-effect-message">
          <h3><i class="fas fa-hands-helping"></i> ${game.i18n.localize("COGSYNDICATE.FeatEffectAppliedTitle")}</h3>
          <p><strong>${actor.name}</strong> ${game.i18n.localize("COGSYNDICATE.SupportFeatReceived")} <strong>${feat.name}</strong></p>
          <p><strong>${game.i18n.localize("COGSYNDICATE.Effect")}:</strong> ${game.i18n.localize("COGSYNDICATE.SupportFeatEffect")}</p>
          <hr>
          <p><em>${game.i18n.localize("COGSYNDICATE.Archetype")}: ${actor.system.archetype.name}</em></p>
        </div>
      `,
      speaker: { actor: actor.id }
    });

    return true;
  }

  /**
   * Remove Support effect from Steam Agent
   * Returns starting Steam Points pool to 1 from 2
   * @param {Actor} actor - The Steam Agent actor
   * @param {Item} feat - The Support feat
   * @returns {Promise<boolean>} - Whether the effect was removed
   */
  static async _removeSupportEffect(actor, feat) {
    // Show notification
    ui.notifications.info(
      game.i18n.format("COGSYNDICATE.SupportEffectRemoved", { agentName: actor.name })
    );

    // Log to chat
    await ChatMessage.create({
      content: `
        <div class="feat-effect-message">
          <h3><i class="fas fa-hands-helping"></i> ${game.i18n.localize("COGSYNDICATE.FeatEffectRemovedTitle")}</h3>
          <p><strong>${actor.name}</strong> ${game.i18n.localize("COGSYNDICATE.SupportFeatLost")} <strong>${feat.name}</strong></p>
          <p><strong>${game.i18n.localize("COGSYNDICATE.Effect")}:</strong> ${game.i18n.localize("COGSYNDICATE.SupportFeatEffectRemoved")}</p>
          <hr>
          <p><em>${game.i18n.localize("COGSYNDICATE.Archetype")}: ${actor.system.archetype.name}</em></p>
        </div>
      `,
      speaker: { actor: actor.id }
    });

    return true;
  }

  /**
   * Check if actor has Support effect active
   * (Steam Agent archetype with Support feat)
   * @param {Actor} actor - The actor to check
   * @returns {boolean} - Whether Support effect is active
   */
  static hasSupportEffect(actor) {
    try {
      if (!actor || !actor.system.archetype?.name) {
        return false;
      }

      const archetypeName = actor.system.archetype.name.toLowerCase();
      
      // Check archetype
      if (!archetypeName.includes('agent pary')) {
        return false;
      }

      // Check for Support feat (Wsparcie) in feats array
      const feats = actor.system.feats || [];
      return feats.some(feat => feat.name?.toLowerCase().includes('wsparcie'));
    } catch (error) {
      console.error('Error checking Support effect:', error);
      return false;
    }
  }

  /**
   * Update Steam Points based on current Support effects
   * Should be called after feat changes
   */
  static updateSteamPointsForSupportEffects() {
    try {
      // Get all active non-GM users
      const activeUsers = game.users.filter(user => user.active && !user.isGM);
      if (activeUsers.length === 0) {
        return; // No active players
      }

      // Get all Steam Agents with active owners
      const activeSteamAgents = game.actors.filter(actor => {
        // Must be agent type  
        if (!(actor.type === 'agent' || actor.type === 'agentv2')) return false;
        
        // Must be Steam Agent archetype
        if (!actor.system.archetype?.name?.toLowerCase().includes('agent pary')) return false;
        
        // Check if any active user owns this actor
        const hasActiveOwner = activeUsers.some(user => {
          const ownership = actor.ownership[user.id];
          return ownership === CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER;
        });
        
        return hasActiveOwner;
      });

      // Count Steam Agents with Support feat
      const supportCount = activeSteamAgents.filter(agent => {
        const feats = agent.system.feats || [];
        const hasSupport = feats.some(featId => {
          const featItem = game.items.get(featId);
          const itemName = featItem?.name?.toLowerCase() || '';
          return itemName.includes('wsparcie');
        });
        return hasSupport;
      }).length;
      
      const targetSteamPoints = 1 + supportCount;
      
      if (game.cogwheelSyndicate.steamPoints !== targetSteamPoints) {
        const oldValue = game.cogwheelSyndicate.steamPoints;
        game.cogwheelSyndicate.steamPoints = targetSteamPoints;
        
        // Sync with other clients
        if (game.user.isGM) {
          game.socket.emit("system.cogwheel-syndicate", {
            type: "updateMetaCurrencies",
            nemesisPoints: game.cogwheelSyndicate.nemesisPoints,
            steamPoints: game.cogwheelSyndicate.steamPoints
          });
        }
        
        Hooks.call("cogwheelSyndicateMetaCurrenciesUpdated");
        ui.notifications.info(`${game.i18n.localize("COGSYNDICATE.SteamPoints")}: ${oldValue} → ${targetSteamPoints} (${supportCount}x ${game.i18n.localize("COGSYNDICATE.Support")})`);
      }
    } catch (error) {
      console.error('Error updating Steam Points for Support effects:', error);
    }
  }
}

// Export for use in other modules
window.CogwheelFeatsEffects = FeatsEffects;
