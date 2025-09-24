/**
 * Shared Gear Functions for Actor Sheets
 * 
 * This module provides common gear-related functionality that can be shared
 * between different actor sheet versions while maintaining flexibility for
 * version-specific customizations.
 */

export class ActorGearFunctions {
  
  /**
   * Handle spending gear points with flexible customization options
   * @param {Actor} actor - The actor spending gear
   * @param {ActorSheet} sheet - The actor sheet instance
   * @param {Object} options - Customization options
   * @param {Function} options.onSuccess - Custom success callback
   * @param {Function} options.onError - Custom error callback
   * @param {Function} options.validateGearCost - Custom validation for gear costs
   * @param {Function} options.formatMessage - Custom message formatting
   */
  static async handleSpendGear(actor, sheet, options = {}) {
    const {
      onSuccess = null,
      onError = null,
      validateGearCost = null,
      formatMessage = null
    } = options;

    try {
      const templateData = {
        currentGear: actor.system.resources.gear.value || 0,
        currentSteam: game.cogwheelSyndicate?.steamPoints || 0
      };

      const dialogContent = await foundry.applications.handlebars.renderTemplate(
        "systems/cogwheel-syndicate/src/templates/spend-gear-dialog.hbs", 
        templateData
      );

      const dialog = new Dialog({
        title: game.i18n.localize("COGSYNDICATE.SpendGearTitle"),
        content: dialogContent,
        buttons: {
          cancel: {
            label: game.i18n.localize("COGSYNDICATE.Cancel"),
            callback: () => {}
          },
          confirm: {
            label: game.i18n.localize("COGSYNDICATE.Confirm"),
            callback: async (html) => {
              return await ActorGearFunctions._processGearSpending(
                actor, sheet, html, { validateGearCost, formatMessage, onSuccess, onError }
              );
            }
          }
        },
        default: "confirm",
        width: 400,
        classes: ["cogsyndicate", "dialog", "spend-gear-dialog"],
        close: () => {}
      });

      dialog.render(true);

    } catch (error) {
      console.error("Error in handleSpendGear:", error);
      if (onError) {
        onError(error);
      } else {
        ui.notifications.error(game.i18n.localize("COGSYNDICATE.ErrorGeneral"));
      }
    }
  }

  /**
   * Internal method to process gear spending
   * @private
   */
  static async _processGearSpending(actor, sheet, html, options = {}) {
    const { validateGearCost, formatMessage, onSuccess, onError } = options;
    
    const selectedOption = html[0].querySelector('input[name="gearType"]:checked');

    if (!selectedOption) {
      new Dialog({
        title: game.i18n.localize("COGSYNDICATE.Error"),
        content: `<p style="color: red; font-weight: bold; text-align: center; font-size: 16px;">${game.i18n.localize("COGSYNDICATE.ErrorNoGearSelected")}</p>`,
        buttons: {
          ok: {
            label: game.i18n.localize("COGSYNDICATE.Confirm"),
            callback: () => {}
          }
        },
        default: "ok"
      }).render(true);
      return false;
    }

    const gearType = selectedOption.value;
    const gearCost = parseInt(selectedOption.dataset.cost, 10);
    const steamCost = parseInt(selectedOption.dataset.steam, 10);

    const currentGear = actor.system.resources.gear.value || 0;
    const currentSteam = game.cogwheelSyndicate?.steamPoints || 0;

    // Custom validation if provided
    if (validateGearCost) {
      const validationResult = validateGearCost(gearType, gearCost, steamCost, currentGear, currentSteam);
      if (!validationResult.valid) {
        ActorGearFunctions._showErrorDialog(validationResult.message);
        return false;
      }
    } else {
      // Default validation
      if (currentGear < gearCost) {
        ActorGearFunctions._showErrorDialog(
          game.i18n.format("COGSYNDICATE.ErrorInsufficientGear", {
            required: gearCost, 
            available: currentGear
          })
        );
        return false;
      }

      if (steamCost > 0 && currentSteam < steamCost) {
        ActorGearFunctions._showErrorDialog(
          game.i18n.format("COGSYNDICATE.ErrorInsufficientSteam", {
            required: steamCost, 
            available: currentSteam
          })
        );
        return false;
      }
    }

    try {
      // Update gear points
      const newGearValue = currentGear - gearCost;
      await actor.update({
        "system.resources.gear.value": newGearValue
      });

      // Update steam points if needed
      if (steamCost > 0) {
        const newSteamValue = currentSteam - steamCost;
        game.cogwheelSyndicate.steamPoints = newSteamValue;
        
        game.socket.emit("system.cogwheel-syndicate", {
          type: "updateMetaCurrencies",
          nemesisPoints: game.cogwheelSyndicate.nemesisPoints,
          steamPoints: game.cogwheelSyndicate.steamPoints
        });
        
        Hooks.call("cogwheelSyndicateMetaCurrenciesUpdated");
      }

      // Format message
      let message;
      if (formatMessage) {
        message = formatMessage(gearType, gearCost, steamCost, actor.name);
      } else {
        message = ActorGearFunctions._formatDefaultGearMessage(gearType, gearCost, steamCost, actor.name);
      }

      // Send chat message
      await ChatMessage.create({
        content: `
          <div class="feat-effect-message">
            <h3><i class="fas fa-cog"></i> ${message}</h3>
          </div>
        `,
        speaker: { actor: actor.id },
        style: CONST.CHAT_MESSAGE_STYLES.OTHER
      });

      sheet.render();

      // Custom success callback
      if (onSuccess) {
        onSuccess(gearType, gearCost, steamCost, newGearValue);
      }

      return true;

    } catch (error) {
      console.error("Error during gear spending:", error);
      ActorGearFunctions._showErrorDialog(
        game.i18n.format("COGSYNDICATE.ErrorGeneral", { error: error.message })
      );
      return false;
    }
  }

  /**
   * Show error dialog
   * @private
   */
  static _showErrorDialog(message) {
    new Dialog({
      title: game.i18n.localize("COGSYNDICATE.Error"),
      content: `<p style="color: red; font-weight: bold; text-align: center; font-size: 16px;">${message}</p>`,
      buttons: {
        ok: {
          label: game.i18n.localize("COGSYNDICATE.Confirm"),
          callback: () => {}
        }
      },
      default: "ok"
    }).render(true);
  }

  /**
   * Format default gear spending message
   * @private
   */
  static _formatDefaultGearMessage(gearType, gearCost, steamCost, actorName) {
    const gearTypeLabels = {
      'light': game.i18n.localize("COGSYNDICATE.GearLight"),
      'medium': game.i18n.localize("COGSYNDICATE.GearMedium"), 
      'heavy': game.i18n.localize("COGSYNDICATE.GearHeavy"),
      'very-heavy': game.i18n.localize("COGSYNDICATE.GearVeryHeavy")
    };

    const gearTypeName = gearTypeLabels[gearType] || gearType;
    const gearPointsLabel = gearCost === 1 ? 
      game.i18n.localize("COGSYNDICATE.GearPoint") : 
      game.i18n.localize("COGSYNDICATE.GearPoints");

    if (steamCost > 0) {
      return `Agent <strong>${actorName}</strong> wydał <strong>${gearCost}</strong> ${gearPointsLabel} oraz <strong>1 ${game.i18n.localize("COGSYNDICATE.SteamPoint")}</strong> na <strong><span class='resource-name resource-gear'>${gearTypeName}</span></strong>.`;
    } else {
      return `Agent <strong>${actorName}</strong> wydał <strong>${gearCost}</strong> ${gearPointsLabel} na <strong><span class='resource-name resource-gear'>${gearTypeName}</span></strong>.`;
    }
  }
}
