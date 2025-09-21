/**
 * Shared Stress Functions for Actor Sheets
 * 
 * This module provides common stress-related functionality that can be shared
 * between different actor sheet versions while maintaining flexibility for
 * version-specific customizations.
 */

export class ActorStressFunctions {
  
  /**
   * Handle spending stress points with flexible customization options
   * @param {Actor} actor - The actor spending stress
   * @param {ActorSheet} sheet - The actor sheet instance
   * @param {Object} options - Customization options
   * @param {Function} options.onSuccess - Custom success callback
   * @param {Function} options.onError - Custom error callback
   * @param {Function} options.validateStressCost - Custom validation for stress costs
   * @param {Function} options.formatMessage - Custom message formatting
   * @param {Function} options.onTraumaWarning - Custom trauma warning handler
   */
  static async handleSpendStress(actor, sheet, options = {}) {
    const {
      onSuccess = null,
      onError = null,
      validateStressCost = null,
      formatMessage = null,
      onTraumaWarning = null
    } = options;

    try {
      const templateData = {
        currentStress: actor.system.resources.stress.value || 0,
        maxStress: actor.system.resources.stress.max || 12,
        currentSteam: game.cogwheelSyndicate?.steamPoints || 0
      };

      const dialogContent = await renderTemplate(
        "systems/cogwheel-syndicate/src/templates/spend-stress-dialog.hbs", 
        templateData
      );

      const dialog = new Dialog({
        title: game.i18n.localize("COGSYNDICATE.SpendStressTitle"),
        content: dialogContent,
        buttons: {
          cancel: {
            label: game.i18n.localize("COGSYNDICATE.Cancel"),
            callback: () => {}
          },
          confirm: {
            label: game.i18n.localize("COGSYNDICATE.Confirm"),
            callback: async (html) => {
              return await ActorStressFunctions._processStressSpending(
                actor, sheet, html, dialog, { validateStressCost, formatMessage, onSuccess, onError, onTraumaWarning }
              );
            }
          }
        },
        default: "confirm",
        width: 450,
        classes: ["cogsyndicate", "dialog", "spend-stress-dialog"],
        close: () => {}
      });

      dialog.render(true);

    } catch (error) {
      console.error("Error in handleSpendStress:", error);
      if (onError) {
        onError(error);
      } else {
        ui.notifications.error(game.i18n.localize("COGSYNDICATE.ErrorGeneral"));
      }
    }
  }

  /**
   * Internal method to process stress spending
   * @private
   */
  static async _processStressSpending(actor, sheet, html, parentDialog, options = {}) {
    const { validateStressCost, formatMessage, onSuccess, onError, onTraumaWarning } = options;
    
    const selectedOption = html[0].querySelector('input[name="stressAction"]:checked');
    
    if (!selectedOption) {
      ActorStressFunctions._showErrorDialog(
        game.i18n.localize("COGSYNDICATE.ErrorNoStressSelected")
      );
      return false;
    }

    const stressAction = selectedOption.value;
    const stressCost = parseInt(selectedOption.dataset.cost, 10);
    const steamBonus = parseInt(selectedOption.data('steam') || 0, 10);
    
    const currentStress = actor.system.resources.stress.value || 0;
    const maxStress = actor.system.resources.stress.max || 12;
    const currentSteam = game.cogwheelSyndicate?.steamPoints || 0;

    // Custom validation if provided
    if (validateStressCost) {
      const validationResult = validateStressCost(stressAction, stressCost, steamBonus, currentStress, maxStress, currentSteam);
      if (!validationResult.valid) {
        ActorStressFunctions._showErrorDialog(validationResult.message);
        return false;
      }
    }

    // Check if stress spending will cause trauma
    const newStressValue = currentStress + stressCost;
    const willCauseTrauma = newStressValue > maxStress;
    
    if (willCauseTrauma) {
      // Custom trauma warning handler or default
      if (onTraumaWarning) {
        const traumaResult = await onTraumaWarning(actor, currentStress, stressCost, maxStress);
        if (!traumaResult.proceed) {
          return false;
        }
      } else {
        const traumaConfirmed = await ActorStressFunctions._showTraumaWarning(actor);
        if (!traumaConfirmed) {
          return false;
        }
      }
      
      // Execute stress action with trauma
      await ActorStressFunctions._executeStressAction(
        actor, sheet, stressAction, stressCost, steamBonus, maxStress, true, { formatMessage, onSuccess }
      );
      parentDialog.close();
      return true;
    }

    // Execute normal stress action
    await ActorStressFunctions._executeStressAction(
      actor, sheet, stressAction, stressCost, steamBonus, maxStress, false, { formatMessage, onSuccess }
    );
    parentDialog.close();
    return true;
  }

  /**
   * Execute the stress action
   * @private
   */
  static async _executeStressAction(actor, sheet, stressAction, stressCost, steamBonus, maxStress, withTrauma, options = {}) {
    const { formatMessage, onSuccess } = options;
    
    try {
      let finalStressValue;
      let traumaOccurred = false;
      
      const currentStress = actor.system.resources.stress.value || 0;
      const currentSteam = game.cogwheelSyndicate?.steamPoints || 0;

      if (withTrauma) {
        // Calculate final stress value with trauma
        const excessStress = (currentStress + stressCost) - maxStress;
        finalStressValue = excessStress;
        traumaOccurred = true;
        
        // Increase trauma
        const traumaValue = actor.system.resources.trauma.value || 0;
        const newTraumaValue = Math.min(traumaValue + 1, actor.system.resources.trauma.max);
        
        await actor.update({
          "system.resources.stress.value": finalStressValue,
          "system.resources.trauma.value": newTraumaValue
        });
      } else {
        // Normal stress spending
        finalStressValue = currentStress + stressCost;
        await actor.update({
          "system.resources.stress.value": finalStressValue
        });
      }

      // Update steam points if needed
      if (steamBonus > 0) {
        const newSteamValue = currentSteam + steamBonus;
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
        message = formatMessage(stressAction, stressCost, steamBonus, actor.name, traumaOccurred);
      } else {
        message = ActorStressFunctions._formatDefaultStressMessage(stressAction, actor.name, traumaOccurred);
      }

      // Send chat message
      await ChatMessage.create({
        content: `
          <div class="feat-effect-message">
            <h3><i class="fas fa-exclamation-triangle"></i> ${message}</h3>
          </div>
        `,
        speaker: { actor: actor.id },
        style: CONST.CHAT_MESSAGE_STYLES.OTHER
      });

      sheet.render();
      
      // Custom success callback
      if (onSuccess) {
        onSuccess(stressAction, stressCost, steamBonus, finalStressValue, traumaOccurred);
      }

      return true;

    } catch (error) {
      console.error("Error during stress spending:", error);
      ActorStressFunctions._showErrorDialog(
        game.i18n.format("COGSYNDICATE.ErrorGeneral", { error: error.message })
      );
      return false;
    }
  }

  /**
   * Show trauma warning dialog
   * @private
   */
  static async _showTraumaWarning(actor) {
    return new Promise((resolve) => {
      new Dialog({
        title: game.i18n.localize("COGSYNDICATE.TraumaWarning"),
        content: `<p style="text-align: center; font-size: 16px; margin-bottom: 15px;">${game.i18n.format("COGSYNDICATE.TraumaMessage", {agentName: actor.name})}</p>`,
        buttons: {
          cancel: {
            label: game.i18n.localize("COGSYNDICATE.Cancel"),
            callback: () => resolve(false)
          },
          confirm: {
            label: game.i18n.localize("COGSYNDICATE.Confirm"),
            callback: () => resolve(true)
          }
        },
        default: "confirm"
      }).render(true);
    });
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
   * Format default stress spending message
   * @private
   */
  static _formatDefaultStressMessage(stressAction, actorName, traumaOccurred) {
    let message;
    
    switch(stressAction) {
      case 'controlled':
        message = game.i18n.format("COGSYNDICATE.StressSpentControlled", {agentName: actorName});
        break;
      case 'risky':
        message = game.i18n.format("COGSYNDICATE.StressSpentRisky", {agentName: actorName});
        break;
      case 'desperate':
        message = game.i18n.format("COGSYNDICATE.StressSpentDesperate", {agentName: actorName});
        break;
      case 'steam':
        message = game.i18n.format("COGSYNDICATE.StressSpentSteam", {agentName: actorName});
        break;
      case 'help':
        message = game.i18n.format("COGSYNDICATE.StressSpentHelp", {agentName: actorName});
        break;
      default:
        message = `Agent ${actorName} wydał punkty stresu.`;
    }

    if (traumaOccurred) {
      message += `<br><strong>${game.i18n.localize("COGSYNDICATE.TraumaReceived")}</strong>`;
    }

    return message;
  }
}
