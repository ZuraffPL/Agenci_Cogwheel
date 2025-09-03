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
        `${actor.name}: Atrybut Stal już osiągnął maksymalną wartość bazową (${maxStalBase}). Efekt Parowej Augmentacji nie może być zastosowany.`
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
      `${actor.name}: Parowa Augmentacja zwiększyła bazową wartość Stali o ${increase} (z ${currentStalBase} na ${newStalBase}).`
    );

    // Log to chat
    await ChatMessage.create({
      content: `
        <div class="feat-effect-message">
          <h3><i class="fas fa-cog"></i> Efekt Atutu</h3>
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
      `${actor.name}: Intrygant zwiększył bazową wartość Intrygi o ${increase} (z ${currentIntrigaBase} na ${newIntrigaBase}).`
    );

    // Log to chat
    await ChatMessage.create({
      content: `
        <div class="feat-effect-message">
          <h3><i class="fas fa-mask"></i> Efekt Atutu</h3>
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
      `${actor.name}: Usunięcie Intryganta zmniejszyło bazową wartość Intrygi o ${decrease} (z ${currentIntrigaBase} na ${newIntrigaBase}).`
    );

    // Log to chat
    await ChatMessage.create({
      content: `
        <div class="feat-effect-message">
          <h3><i class="fas fa-mask"></i> Usunięcie Efektu Atutu</h3>
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
      `${actor.name}: Dopalacz Pary został usunięty - punkty Pary nie będą już podwajane.`
    );

    // Log to chat
    await ChatMessage.create({
      content: `
        <div class="feat-effect-message">
          <h3><i class="fas fa-tachometer-alt"></i> Usunięcie Efektu Atutu</h3>
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
    console.log(`=== Steam Booster Check for ${actor?.name} ===`);
    
    if (!actor || !actor.system.archetype?.name) {
      console.log(`Steam Booster check failed: no actor or archetype`, { actor: !!actor, archetype: actor?.system?.archetype?.name });
      return false;
    }

    const archetypeName = actor.system.archetype.name.toLowerCase();
    console.log(`Archetype name: "${archetypeName}"`);
    
    // Check if actor is Tech Genius
    const isTechGenius = archetypeName.includes('geniusz techniki');
    if (!isTechGenius) {
      console.log(`Steam Booster check failed: not Tech Genius archetype (${archetypeName})`);
      return false;
    }

    // Check if actor has Steam Booster feat active
    console.log(`Actor items:`, actor.items.map(item => ({ name: item.name, type: item.type })));
    
    const steamBoosterFeat = actor.items.find(item => {
      const isRightType = item.type === 'feat';
      const hasRightName = item.name.toLowerCase().includes('dopalacz pary');
      console.log(`Item "${item.name}" (type: ${item.type}): isRightType=${isRightType}, hasRightName=${hasRightName}`);
      return isRightType && hasRightName;
    });

    console.log(`Steam Booster check for ${actor.name}: Tech Genius=${isTechGenius}, has feat=${!!steamBoosterFeat}`);
    console.log(`Steam Booster feat found:`, steamBoosterFeat ? { name: steamBoosterFeat.name, type: steamBoosterFeat.type } : null);

    return !!steamBoosterFeat;
  }

  /**
   * Apply Steam Booster effect to steam points generation
   * Doubles steam points for Tech Genius with Steam Booster feat
   * @param {Actor} actor - The actor generating steam points
   * @param {number} originalSteamPoints - Original steam points generated
   * @returns {Object} - {steamPoints: number, message: string|null}
   */
  static applySteamBoosterEffect(actor, originalSteamPoints) {
    console.log(`=== applySteamBoosterEffect called ===`);
    console.log(`Actor: ${actor?.name}, Original steam points: ${originalSteamPoints}`);
    
    if (originalSteamPoints <= 0) {
      console.log(`No steam points to boost, returning original: ${originalSteamPoints}`);
      return { steamPoints: originalSteamPoints, message: null };
    }
    
    console.log(`About to call hasSteamBoosterEffect...`);
    const hasSteamBooster = this.hasSteamBoosterEffect(actor);
    console.log(`hasSteamBoosterEffect returned: ${hasSteamBooster}`);
    
    if (!hasSteamBooster) {
      console.log(`Steam Booster effect not active, returning original points: ${originalSteamPoints}`);
      return { steamPoints: originalSteamPoints, message: null };
    }

    const doubledSteamPoints = originalSteamPoints * 2;
    console.log(`Steam Booster active! Doubling ${originalSteamPoints} -> ${doubledSteamPoints}`);
    
    const message = `
      <div class="steam-booster-effect">
        <p style="color: #cd7f32; font-weight: bold; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">
          <i class="fas fa-tachometer-alt"></i> ${game.i18n.localize("COGSYNDICATE.FeatSteamBoosterEffect")}
        </p>
      </div>
    `;

    return { steamPoints: doubledSteamPoints, message: message };
  }
}

// Export for use in other modules
window.CogwheelFeatsEffects = FeatsEffects;
