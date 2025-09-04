/**
 * Shared Equipment Functions for Actor Sheets
 * Handles equipment operations (add/edit/delete) with customizable behavior per sheet version
 */
export class ActorEquipmentFunctions {
  
  /**
   * Add equipment to actor with customizable validation and callbacks
   * @param {Actor} actor - The actor to add equipment to
   * @param {ActorSheet} sheet - The actor sheet instance
   * @param {Object} options - Customization options
   * @returns {Promise<boolean>} - Success status
   */
  static async handleAddEquipment(actor, sheet, options = {}) {
    const config = {
      // Validation functions
      validateInput: options.validateInput || this._defaultValidateInput,
      validateCost: options.validateCost || this._defaultValidateCost,
      
      // Error handling
      showValidationError: options.showValidationError || this._defaultShowValidationError,
      
      // Data processing  
      processEquipmentData: options.processEquipmentData || this._defaultProcessEquipmentData,
      
      // Success callbacks
      onSuccess: options.onSuccess || this._defaultOnSuccess,
      onError: options.onError || this._defaultOnError,
      
      // Equipment defaults
      equipmentDefaults: options.equipmentDefaults || {
        name: "", type: "weapon", cost: "1", usage: "Single", 
        action: "", used: false, droppedDamaged: false, destroyed: false
      },
      
      ...options
    };

    try {
      const templateData = { equipment: config.equipmentDefaults };
      const dialogContent = await renderTemplate(
        "systems/cogwheel-syndicate/src/templates/equipment-dialog.hbs", 
        templateData
      );

      return new Promise((resolve) => {
        new Dialog({
          title: game.i18n.localize("COGSYNDICATE.AddEquipment"),
          content: dialogContent,
          buttons: {
            cancel: {
              label: game.i18n.localize("COGSYNDICATE.Cancel"),
              callback: () => resolve(false)
            },
            add: {
              label: game.i18n.localize("COGSYNDICATE.Confirm"),
              callback: async (html) => {
                try {
                  // Extract form data
                  const formData = {
                    name: html.find('[name="name"]').val(),
                    type: html.find('[name="type"]').val(),
                    cost: parseInt(html.find('[name="cost"]').val(), 10),
                    usage: html.find('[name="usage"]').val(),
                    action: html.find('[name="action"]').val()
                  };

                  // Validate input
                  const inputValidation = config.validateInput(formData, html, config);
                  if (!inputValidation.valid) {
                    config.showValidationError(html, inputValidation.message);
                    return;
                  }

                  // Validate cost
                  const currentEquipmentPoints = actor.system.equipmentPoints.value || 0;
                  const costValidation = config.validateCost(
                    formData.cost, 
                    currentEquipmentPoints, 
                    actor, 
                    config
                  );
                  if (!costValidation.valid) {
                    config.showValidationError(html, costValidation.message);
                    return;
                  }

                  // Process equipment data
                  const newEquipment = config.processEquipmentData(formData, config);

                  // Add equipment to actor
                  const currentEquipments = foundry.utils.deepClone(actor.system.equipments) || [];
                  currentEquipments.push(newEquipment);
                  
                  const newEquipmentPoints = currentEquipmentPoints - formData.cost;
                  
                  await actor.update({
                    "system.equipments": currentEquipments,
                    "system.equipmentPoints.value": newEquipmentPoints
                  });

                  // Success callback
                  await config.onSuccess(newEquipment, actor, sheet, config);
                  resolve(true);

                } catch (error) {
                  await config.onError(error, actor, sheet, config);
                  resolve(false);
                }
              }
            }
          },
          default: "add"
        }).render(true);
      });

    } catch (error) {
      await config.onError(error, actor, sheet, config);
      return false;
    }
  }

  /**
   * Edit equipment with customizable behavior
   * @param {Actor} actor - The actor
   * @param {ActorSheet} sheet - The actor sheet
   * @param {number} equipmentIndex - Index of equipment to edit
   * @param {Object} options - Customization options
   * @returns {Promise<boolean>} - Success status
   */
  static async handleEditEquipment(actor, sheet, equipmentIndex, options = {}) {
    const config = {
      validateInput: options.validateInput || this._defaultValidateInput,
      validateCost: options.validateCost || this._defaultValidateCost,
      showValidationError: options.showValidationError || this._defaultShowValidationError,
      processEquipmentData: options.processEquipmentData || this._defaultProcessEquipmentData,
      onSuccess: options.onSuccess || this._defaultOnEditSuccess,
      onError: options.onError || this._defaultOnError,
      ...options
    };

    try {
      const currentEquipments = foundry.utils.deepClone(actor.system.equipments) || [];
      const equipment = currentEquipments[equipmentIndex];
      
      if (!equipment) {
        throw new Error(`Equipment not found at index ${equipmentIndex}`);
      }

      const templateData = { equipment };
      const dialogContent = await renderTemplate(
        "systems/cogwheel-syndicate/src/templates/equipment-dialog.hbs", 
        templateData
      );

      return new Promise((resolve) => {
        new Dialog({
          title: game.i18n.localize("COGSYNDICATE.EditEquipment"),
          content: dialogContent,
          buttons: {
            cancel: {
              label: game.i18n.localize("COGSYNDICATE.Cancel"),
              callback: () => resolve(false)
            },
            save: {
              label: game.i18n.localize("COGSYNDICATE.Confirm"),
              callback: async (html) => {
                try {
                  const formData = {
                    name: html.find('[name="name"]').val(),
                    type: html.find('[name="type"]').val(),
                    cost: parseInt(html.find('[name="cost"]').val(), 10),
                    usage: html.find('[name="usage"]').val(),
                    action: html.find('[name="action"]').val()
                  };

                  // Validate input
                  const inputValidation = config.validateInput(formData, html, config);
                  if (!inputValidation.valid) {
                    config.showValidationError(html, inputValidation.message);
                    return;
                  }

                  // Calculate cost difference
                  const oldCost = equipment.cost || 0;
                  const costDifference = formData.cost - oldCost;
                  const currentEquipmentPoints = actor.system.equipmentPoints.value || 0;

                  // Validate cost if increased
                  if (costDifference > 0) {
                    const costValidation = config.validateCost(
                      costDifference, 
                      currentEquipmentPoints, 
                      actor, 
                      config
                    );
                    if (!costValidation.valid) {
                      config.showValidationError(html, costValidation.message);
                      return;
                    }
                  }

                  // Process and update equipment
                  const updatedEquipment = {
                    ...equipment,
                    ...config.processEquipmentData(formData, config)
                  };
                  
                  currentEquipments[equipmentIndex] = updatedEquipment;
                  const newEquipmentPoints = currentEquipmentPoints - costDifference;
                  
                  await actor.update({
                    "system.equipments": currentEquipments,
                    "system.equipmentPoints.value": newEquipmentPoints
                  });

                  await config.onSuccess(updatedEquipment, equipment, actor, sheet, config);
                  resolve(true);

                } catch (error) {
                  await config.onError(error, actor, sheet, config);
                  resolve(false);
                }
              }
            }
          },
          default: "save"
        }).render(true);
      });

    } catch (error) {
      await config.onError(error, actor, sheet, config);
      return false;
    }
  }

  /**
   * Delete equipment with customizable behavior
   * @param {Actor} actor - The actor
   * @param {ActorSheet} sheet - The actor sheet
   * @param {number} equipmentIndex - Index of equipment to delete
   * @param {Object} options - Customization options
   * @returns {Promise<boolean>} - Success status
   */
  static async handleDeleteEquipment(actor, sheet, equipmentIndex, options = {}) {
    const config = {
      confirmDelete: options.confirmDelete !== false, // Default true
      onSuccess: options.onSuccess || this._defaultOnDeleteSuccess,
      onError: options.onError || this._defaultOnError,
      calculateRefund: options.calculateRefund || this._defaultCalculateRefund,
      ...options
    };

    try {
      const currentEquipments = foundry.utils.deepClone(actor.system.equipments) || [];
      const equipmentToDelete = currentEquipments[equipmentIndex];
      
      if (!equipmentToDelete) {
        throw new Error(`Equipment not found at index ${equipmentIndex}`);
      }

      // Optional confirmation dialog
      if (config.confirmDelete) {
        const confirmed = await Dialog.confirm({
          title: game.i18n.localize("COGSYNDICATE.DeleteEquipment"),
          content: game.i18n.format("COGSYNDICATE.DeleteEquipmentConfirm", {
            name: equipmentToDelete.name
          }),
          yes: () => true,
          no: () => false,
          defaultYes: false
        });
        
        if (!confirmed) return false;
      }

      // Calculate equipment points refund
      const refund = config.calculateRefund(equipmentToDelete, actor, config);
      const currentEquipmentPoints = actor.system.equipmentPoints.value || 0;
      const maxEquipmentPoints = actor.system.equipmentPoints.max || 6;
      const newEquipmentPoints = Math.min(currentEquipmentPoints + refund, maxEquipmentPoints);

      // Remove equipment
      currentEquipments.splice(equipmentIndex, 1);
      
      await actor.update({
        "system.equipments": currentEquipments,
        "system.equipmentPoints.value": newEquipmentPoints
      });

      await config.onSuccess(equipmentToDelete, refund, actor, sheet, config);
      return true;

    } catch (error) {
      await config.onError(error, actor, sheet, config);
      return false;
    }
  }

  // Default validation functions
  static _defaultValidateInput(formData, html, config) {
    // V1 style validation (stricter)
    if (!formData.name || !formData.name.trim() || !formData.action || !formData.action.trim()) {
      return {
        valid: false,
        message: game.i18n.localize("COGSYNDICATE.EquipmentValidationError")
      };
    }
    return { valid: true };
  }

  static _defaultValidateCost(cost, availablePoints, actor, config) {
    if (cost > availablePoints) {
      return {
        valid: false,
        message: game.i18n.localize("COGSYNDICATE.InsufficientEquipmentPointsMessage")
      };
    }
    return { valid: true };
  }

  static _defaultShowValidationError(html, message) {
    // V1 style - show in dialog
    const errorMessage = html.find('.error-message');
    if (errorMessage.length) {
      errorMessage.text(message).addClass('show');
      setTimeout(() => errorMessage.removeClass('show'), 3000);
    } else {
      // Fallback to notification
      ui.notifications.warn(message);
    }
  }

  static _defaultProcessEquipmentData(formData, config) {
    return {
      name: formData.name.trim ? formData.name.trim() : formData.name,
      type: formData.type,
      cost: formData.cost || 1,
      usage: formData.usage,
      action: formData.action.trim ? formData.action.trim() : formData.action,
      used: false,
      droppedDamaged: false,
      destroyed: false
    };
  }

  static _defaultCalculateRefund(equipment, actor, config) {
    return parseInt(equipment.cost, 10) || 0;
  }

  // Default success callbacks
  static async _defaultOnSuccess(equipment, actor, sheet, config) {
    await ChatMessage.create({
      content: `<p>${game.i18n.format("COGSYNDICATE.EquipmentAdded", { 
        equipmentName: equipment.name, 
        actorName: actor.name 
      })}</p>`,
      speaker: { actor: actor.id }
    });
  }

  static async _defaultOnEditSuccess(newEquipment, oldEquipment, actor, sheet, config) {
    await ChatMessage.create({
      content: `<p>${game.i18n.format("COGSYNDICATE.EquipmentEdited", { 
        equipmentName: newEquipment.name, 
        actorName: actor.name 
      })}</p>`,
      speaker: { actor: actor.id }
    });
  }

  static async _defaultOnDeleteSuccess(equipment, refund, actor, sheet, config) {
    await ChatMessage.create({
      content: `<p>${game.i18n.format("COGSYNDICATE.EquipmentDeleted", { 
        equipmentName: equipment.name, 
        actorName: actor.name,
        refund: refund
      })}</p>`,
      speaker: { actor: actor.id }
    });
  }

  static async _defaultOnError(error, actor, sheet, config) {
    console.error('Equipment operation error:', error);
    ui.notifications.error(
      game.i18n.format("COGSYNDICATE.EquipmentOperationError", { 
        error: error.message 
      })
    );
  }
}
