import { performAttributeRoll } from './roll-mechanics.js';
import { ActorGearFunctions } from './shared/actor-gear-functions.js';
import { ActorStressFunctions } from './shared/actor-stress-functions.js';
import { ActorEquipmentFunctions } from './shared/actor-equipment-functions.js';

class CogwheelActorSheetV2 extends ActorSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      template: "systems/cogwheel-syndicate/src/templates/actor-sheetv2.hbs",
      classes: ["cogwheel", "sheet", "actor", "agentv2"],
      width: 750,
      submitOnChange: true,
      dragDrop: [{ dropSelector: ".archetype-drop, .feats-drop" }],
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-content", initial: "core" }]
    });
  }

  getData() {
    const data = super.getData();
    data.system = data.actor.system;

    // Sprawdź i zainicjalizuj dane jeśli potrzeba
    this._updateData();

    // ARCHETYPE: Load archetype data if ID exists
    if (data.system.archetype && data.system.archetype.id) {
      const archetypeItem = game.items.get(data.system.archetype.id);
      if (archetypeItem && archetypeItem.type === "archetype") {
        // Handle both old (data.attributes) and new (system.attributes) format
        const archetypeAttributes = archetypeItem.system?.attributes || archetypeItem.data?.attributes;
        data.system.archetype = {
          id: archetypeItem.id,
          name: archetypeItem.name,
          img: archetypeItem.img,
          attributes: archetypeAttributes
        };
      }
    }

    // FEATS: Use reference IDs for live sync
    // Store feat IDs in system.feats (array of strings)
    // At render, resolve to actual items from game.items
    const featIds = data.system.feats || [];
    data.feats = featIds
      .map(id => game.items.get(id))
      .filter(item => item && item.type === "feat");

    if (!data.actor.img || data.actor.img === "") {
      data.actor.img = "icons/svg/mystery-man.svg";
    }

    const defaultSecondary = { value: 0 };
    data.system.secondaryAttributes = data.system.secondaryAttributes || {};
    data.system.secondaryAttributes.endurance = { ...defaultSecondary, ...data.system.secondaryAttributes.endurance };
    data.system.secondaryAttributes.control = { ...defaultSecondary, ...data.system.secondaryAttributes.control };
    data.system.secondaryAttributes.determination = { ...defaultSecondary, ...data.system.secondaryAttributes.determination };

    data.system.attributes = data.system.attributes || {};
    data.system.attributes.machine = data.system.attributes.machine || { base: 1, value: 1, damage: 0 };
    data.system.attributes.engineering = data.system.attributes.engineering || { base: 1, value: 1, damage: 0 };
    data.system.attributes.intrigue = data.system.attributes.intrigue || { base: 1, value: 1, damage: 0 };

    data.system.attributes.machine.base = parseInt(data.system.attributes.machine.base, 10) || 1;
    data.system.attributes.engineering.base = parseInt(data.system.attributes.engineering.base, 10) || 1;
    data.system.attributes.intrigue.base = parseInt(data.system.attributes.intrigue.base, 10) || 1;

    data.system.attributes.machine.damage = parseInt(data.system.attributes.machine.damage, 10) || 0;
    data.system.attributes.engineering.damage = parseInt(data.system.attributes.engineering.damage, 10) || 0;
    data.system.attributes.intrigue.damage = parseInt(data.system.attributes.intrigue.damage, 10) || 0;

    data.system.resources = data.system.resources || {};
    data.system.resources.gear = data.system.resources.gear || { value: 0, max: 4, basis: "machine" };
    data.system.resources.stress = data.system.resources.stress || { value: 0, max: 4 };
    data.system.resources.trauma = data.system.resources.trauma || { value: 0, max: 4 };
    data.system.resources.development = data.system.resources.development || { value: 0, max: 12 };

    data.system.equipmentPoints = data.system.equipmentPoints || { value: 6, max: 6 };
    data.system.traumas = data.system.traumas || [];
    data.system.equipments = data.system.equipments || [];
    data.system.notes = data.system.notes || "";

    // Calculate effective attributes based on base value minus damage
    data.effectiveAttributes = {};
    for (const attrName of ['machine', 'engineering', 'intrigue']) {
      const baseValue = data.system.attributes[attrName].base || 1;
      const damageValue = parseInt(data.system.attributes[attrName].damage, 10) || 0;
      data.effectiveAttributes[attrName] = Math.max(0, baseValue - damageValue);
      data.system.attributes[attrName].value = data.effectiveAttributes[attrName];
    }

    const gearBasis = data.system.resources.gear.basis || "machine";
    data.system.resources.gear.max = Math.max(4, 4 + (data.effectiveAttributes[gearBasis] || 0));
    data.system.resources.stress.max = Math.max(4, 4 + (data.effectiveAttributes.intrigue || 0));
    data.system.resources.trauma.max = 4;
    data.system.resources.development.max = 12;

    // Migrate equipment status fields from old format to new format
    this._migrateEquipmentStatus(data);

    // Auto-correct current values if they exceed new maximums due to attribute damage
    const updates = {};
    
    // Check gear resource
    if (data.system.resources.gear.value > data.system.resources.gear.max) {
      updates["system.resources.gear.value"] = data.system.resources.gear.max;
      data.system.resources.gear.value = data.system.resources.gear.max;
    }
    
    // Check stress resource
    if (data.system.resources.stress.value > data.system.resources.stress.max) {
      updates["system.resources.stress.value"] = data.system.resources.stress.max;
      data.system.resources.stress.value = data.system.resources.stress.max;
    }
    
    // Equipment points are always max 6 - no attribute dependency
    data.system.equipmentPoints.max = 6;
    
    // Apply auto-corrections if any were needed
    if (Object.keys(updates).length > 0) {
      console.log("Auto-correcting resource values due to attribute changes:", updates);
      this.actor.update(updates);
    }

    return data;
  }

  activateListeners(html) {
    super.activateListeners(html);
    html.find('.roll-attribute').click(this._onRollAttribute.bind(this));
    html.find('.delete-feat').click(this._onDeleteFeat.bind(this));
    html.find('.feat-toggle-btn').click(this._onToggleFeat.bind(this));
    html.find('.remove-archetype').click(this._onRemoveArchetype.bind(this));
    html.find('.increment').click(this._onIncrementResource.bind(this));
    html.find('.decrement').click(this._onDecrementResource.bind(this));
    html.find('.add-equipment-btn').click(this._onAddEquipment.bind(this));
    html.find('.edit-equipment').click(this._onEditEquipment.bind(this));
    html.find('.delete-equipment').click(this._onDeleteEquipment.bind(this));
    html.find('.equipment-status-checkbox').click(this._onEquipmentStatusChange.bind(this));
    html.find('.add-trauma-btn').click(this._onAddTrauma.bind(this));
    html.find('.edit-trauma').click(this._onEditTrauma.bind(this));
    html.find('.delete-trauma').click(this._onDeleteTrauma.bind(this));
    html.find('.spend-gear-btn').click(this._onSpendGear.bind(this));
    html.find('.spend-stress-btn').click(this._onSpendStress.bind(this));
    this._assignGearBackgrounds(html);
    this._assignEquipmentColors(html);
    this._updateEquipmentPointsDisplay(html);
  }

  _updateEquipmentPointsDisplay(html) {
    const equipmentPointsValue = html.find('.equipment-points-value');
    const currentPoints = this.actor.system.equipmentPoints.value || 0;
    const maxPoints = this.actor.system.equipmentPoints.max || 6;
    
    // Usuń poprzednie klasy
    equipmentPointsValue.removeClass('low medium');
    
    // Dodaj odpowiednią klasę w zależności od poziomu punktów
    if (currentPoints <= 1) {
      equipmentPointsValue.addClass('low');
    } else if (currentPoints <= 3) {
      equipmentPointsValue.addClass('medium');
    }
  }

  async _onEquipmentStatusChange(event) {
    event.preventDefault();
    const index = parseInt(event.currentTarget.dataset.index, 10);
    const status = event.currentTarget.dataset.status;
    const isChecked = event.currentTarget.checked;

    const currentEquipments = foundry.utils.deepClone(this.actor.system.equipments) || [];
    const equipment = currentEquipments[index];
    const equipmentName = equipment.name;
    const actorName = this.actor.name;

    // If unchecking and equipment has this status, restore to normal
    if (!isChecked && equipment[status]) {
      equipment.usedDestroyed = false;
      equipment.droppedDamaged = false;

      await ChatMessage.create({
        content: `<p>${game.i18n.format("COGSYNDICATE.EquipmentRestored", { name: equipmentName, actorName: actorName })}</p>`,
        speaker: { actor: this.actor.id }
      });
    } else {
      // Reset all states first
      equipment.usedDestroyed = false;
      equipment.droppedDamaged = false;

      // If checking, set new status and send appropriate message
      if (isChecked) {
        equipment[status] = true;
        let messageKey;
        if (status === "usedDestroyed") {
          messageKey = "COGSYNDICATE.EquipmentUsedDestroyedMessage";
        } else if (status === "droppedDamaged") {
          messageKey = "COGSYNDICATE.EquipmentDroppedDamagedMessage";
        }

        if (messageKey) {
          await ChatMessage.create({
            content: `<p>${game.i18n.format(messageKey, { name: equipmentName, actorName: actorName })}</p>`,
            speaker: { actor: this.actor.id }
          });
        }
      }
    }

    await this.actor.update({
      "system.equipments": currentEquipments
    });

    this.render();
  }

  async _onAttributeChange(event) {
    const input = event.currentTarget;
    const attrPath = input.name;
    const newValue = parseInt(input.value, 10) || 1;
    await this.actor.update({ [attrPath]: newValue });
  }

  async _onGearBasisChange(event) {
    const select = event.currentTarget;
    const newBasis = select.value;
    await this.actor.update({ "system.resources.gear.basis": newBasis });
  }

  async _onDevelopmentChange(event) {
    const input = event.currentTarget;
    const newValue = parseInt(input.value, 10) || 0;
    const currentValue = this.actor.system.resources.development.value || 0;
    const maxValue = this.actor.system.resources.development.max || 12;
    const clampedValue = Math.max(0, Math.min(newValue, maxValue));

    if (clampedValue !== currentValue) {
      await this.actor.update({ "system.resources.development.value": clampedValue });
    }
  }

  async _onImageUpload(file) {
    const uploadResponse = await FilePicker.upload("data", "", file);
    return uploadResponse.path;
  }

  async _onDrop(event) {
    if (!(event instanceof DragEvent)) {
      return false;
    }

    let data;
    try {
      data = JSON.parse(event.dataTransfer.getData('text/plain'));
    } catch (err) {
      return false;
    }

    if (data.type !== "Item") {
      return false;
    }

    const item = await Item.fromDropData(data);

    let target = 'feat'; // domyślnie feat
    if (event.currentTarget.classList.contains('archetype-drop')) {
      target = 'archetype';
    } else if (event.currentTarget.classList.contains('feats-drop')) {
      target = 'feat';
    }

    if (target === 'archetype' && item.type === "archetype") {
      // Handle both old (data.attributes) and new (system.attributes) format
      const archetypeAttributes = item.system?.attributes || item.data?.attributes;
      const archetypeUpdates = {
        "system.archetype.name": item.name,
        "system.archetype.id": item.id,
        "system.archetype.img": item.img
      };
      
      // Copy archetype attribute values to actor's base attributes
      if (archetypeAttributes) {
        archetypeUpdates["system.attributes.machine.base"] = archetypeAttributes.machine;
        archetypeUpdates["system.attributes.engineering.base"] = archetypeAttributes.engineering;
        archetypeUpdates["system.attributes.intrigue.base"] = archetypeAttributes.intrigue;
      }

      await this.actor.update(archetypeUpdates);
      this.render();
    } else if (target === 'feat' && item.type === "feat") {
      const featIds = Array.isArray(this.actor.system.feats) ? [...this.actor.system.feats] : [];
      if (!featIds.includes(item.id)) {
        featIds.push(item.id);
        await this.actor.update({ "system.feats": featIds });
        
        // Apply feat effects if any exist
        if (window.CogwheelFeatsEffects) {
          await window.CogwheelFeatsEffects.applyFeatEffects(this.actor, item);
        }
        
        this.render();
      }
    }

    return false;
  }

  async _onRollAttribute(event) {
    event.preventDefault();
    const attribute = event.currentTarget.dataset.attribute;
    await performAttributeRoll(this.actor, attribute);
    this.render();
  }

  async _onDeleteFeat(event) {
    const itemId = event.currentTarget.closest('.feat-item').dataset.itemId;
    // Get the feat item before removing it to check for effects
    const featItem = game.items.get(itemId);
    
    // Remove feat ID from system.feats
    const featIds = Array.isArray(this.actor.system.feats) ? [...this.actor.system.feats] : [];
    const idx = featIds.indexOf(itemId);
    if (idx !== -1) {
      featIds.splice(idx, 1);
      await this.actor.update({ "system.feats": featIds });
      
      // Remove feat effects if any exist
      if (window.CogwheelFeatsEffects && featItem) {
        await window.CogwheelFeatsEffects.removeFeatEffects(this.actor, featItem);
      }
    }
    this.render();
  }

  _onToggleFeat(event) {
    const toggleBtn = event.currentTarget;
    const featItem = toggleBtn.closest('.feat-item');
    const featDetails = featItem.querySelector('.feat-details');
    const icon = toggleBtn.querySelector('i');
    
    if (featDetails.style.display === 'none' || featDetails.style.display === '') {
      // Rozwijanie
      featDetails.style.display = 'block';
      icon.className = 'fas fa-minus';
      toggleBtn.classList.add('expanded');
    } else {
      // Zwijanie
      featDetails.style.display = 'none';
      icon.className = 'fas fa-plus';
      toggleBtn.classList.remove('expanded');
    }
  }

  async _onRemoveArchetype(event) {
    await this.actor.update({
      "system.archetype.name": "",
      "system.archetype.id": null,
      "system.archetype.img": null,
      "system.attributes.machine.base": 1,
      "system.attributes.engineering.base": 1,
      "system.attributes.intrigue.base": 1
    });
  }

  async _onIncrementResource(event) {
    event.preventDefault();
    const resource = event.currentTarget.dataset.resource;
    const currentValue = this.actor.system.resources[resource].value || 0;
    const maxValue = this.actor.system.resources[resource].max;

    if (resource === "stress" && currentValue + 1 >= maxValue) {
      const traumaDialog = await new Promise((resolve) => {
        new Dialog({
          title: game.i18n.localize("COGSYNDICATE.TraumaWarning"),
          content: `<p>${game.i18n.format("COGSYNDICATE.TraumaMessage", { agentName: this.actor.name })}</p>`,
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

      if (traumaDialog) {
        const currentTrauma = this.actor.system.resources.trauma.value || 0;
        const newTrauma = Math.min(currentTrauma + 1, 4);
        await this.actor.update({
          "system.resources.stress.value": 0,
          "system.resources.trauma.value": newTrauma
        });

        await ChatMessage.create({
          content: `<p>${game.i18n.localize("COGSYNDICATE.TraumaReceived")}</p>`,
          speaker: { actor: this.actor.id }
        });

        if (newTrauma === 4) {
          const maxTraumaMessage = game.i18n.localize("COGSYNDICATE.MaxTraumaReached");
          await ChatMessage.create({
            content: `<p>${maxTraumaMessage}</p>`,
            speaker: { actor: this.actor.id }
          });
          new Dialog({
            title: "Maximum Trauma",
            content: `<p>${maxTraumaMessage}</p>`,
            buttons: {
              ok: { label: "OK" }
            }
          }).render(true);
        }
      }
    } else if (currentValue < maxValue) {
      const newValue = currentValue + 1;
      await this.actor.update({
        [`system.resources.${resource}.value`]: newValue
      });

      // Add chat messages for gear resource changes
      const actorName = this.actor.name;
      const resourceLabel = game.i18n.localize(`COGSYNDICATE.${resource.charAt(0).toUpperCase() + resource.slice(1)}`);

      if (resource === "gear") {
        await ChatMessage.create({
          content: `
            <div class="feat-effect-message">
              <h3><i class="fas fa-cog"></i> ${game.i18n.format("COGSYNDICATE.ResourceAdded", { actorName, resource: `<span class='resource-name resource-gear'>${resourceLabel}</span>` })}</h3>
            </div>
          `,
          speaker: { actor: this.actor.id }
        });
      } else if (resource === "stress") {
        await ChatMessage.create({
          content: `
            <div class="feat-effect-message">
              <h3><i class="fas fa-exclamation-triangle"></i> ${game.i18n.format("COGSYNDICATE.ResourceAdded", { actorName, resource: `<span class='resource-name resource-stress'>${resourceLabel}</span>` })}</h3>
            </div>
          `,
          speaker: { actor: this.actor.id }
        });
      } else if (resource === "trauma") {
        await ChatMessage.create({
          content: `
            <div class="feat-effect-message">
              <h3><i class="fas fa-skull"></i> ${game.i18n.format("COGSYNDICATE.TraumaIncreased", { actorName: this.actor.name })}</h3>
            </div>
          `,
          speaker: { actor: this.actor.id }
        });

        if (newValue === 4) {
          const maxTraumaMessage = game.i18n.localize("COGSYNDICATE.MaxTraumaReached");
          await ChatMessage.create({
            content: `<p>${maxTraumaMessage}</p>`,
            speaker: { actor: this.actor.id }
          });
          new Dialog({
            title: "Maximum Trauma",
            content: `<p>${maxTraumaMessage}</p>`,
            buttons: {
              ok: { label: "OK" }
            }
          }).render(true);
        }
      }
    }
  }

  async _onDecrementResource(event) {
    event.preventDefault();
    const resource = event.currentTarget.dataset.resource;
    const currentValue = this.actor.system.resources[resource].value || 0;

    if (currentValue > 0) {
      const newValue = currentValue - 1;
      await this.actor.update({
        [`system.resources.${resource}.value`]: newValue
      });

      // Add chat messages for gear resource changes
      const actorName = this.actor.name;
      const resourceLabel = game.i18n.localize(`COGSYNDICATE.${resource.charAt(0).toUpperCase() + resource.slice(1)}`);

      if (resource === "gear") {
        await ChatMessage.create({
          content: `
            <div class="feat-effect-message">
              <h3><i class="fas fa-cog"></i> ${game.i18n.format("COGSYNDICATE.ResourceSpent", { actorName, resource: `<span class='resource-name resource-gear'>${resourceLabel}</span>` })}</h3>
            </div>
          `,
          speaker: { actor: this.actor.id }
        });
      } else if (resource === "stress") {
        await ChatMessage.create({
          content: `
            <div class="feat-effect-message">
              <h3><i class="fas fa-exclamation-triangle"></i> ${game.i18n.format("COGSYNDICATE.StressReduced", { actorName, resource: `<span class='resource-name resource-stress'>${resourceLabel}</span>` })}</h3>
            </div>
          `,
          speaker: { actor: this.actor.id }
        });
      } else if (resource === "trauma") {
        await ChatMessage.create({
          content: `
            <div class="feat-effect-message">
              <h3><i class="fas fa-skull"></i> ${game.i18n.format("COGSYNDICATE.TraumaDecreased", { actorName: actorName })}</h3>
            </div>
          `,
          speaker: { actor: this.actor.id }
        });
      }
    }
  }

  async _updateData() {
    // Sprawdź czy aktor ma wszystkie wymagane pola
    const updates = {};
    
    if (!this.actor.system.attributes?.machine?.base) {
      updates["system.attributes.machine.base"] = 1;
    }
    if (!this.actor.system.attributes?.engineering?.base) {
      updates["system.attributes.engineering.base"] = 1;
    }
    if (!this.actor.system.attributes?.intrigue?.base) {
      updates["system.attributes.intrigue.base"] = 1;
    }

    if (!this.actor.system.feats) {
      updates["system.feats"] = [];
    }

    const gearMax = 4 + (this.actor.system.attributes?.machine?.base || 1);
    
    if (this.actor.system.resources?.gear?.value === undefined || this.actor.system.resources?.gear?.value === null) {
      updates["system.resources.gear.value"] = gearMax;
      updates["system.resources.gear.basis"] = "machine";
    }
    
    if (!this.actor.system.resources?.stress?.value) {
      updates["system.resources.stress.value"] = 0;
    }
    
    if (!this.actor.system.resources?.trauma?.value) {
      updates["system.resources.trauma.value"] = 0;
    }
    
    if (!this.actor.system.resources?.development?.value) {
      updates["system.resources.development.value"] = 0;
    }
    
    if (!this.actor.system.equipmentPoints?.value) {
      updates["system.equipmentPoints.value"] = 6;
    }
    
    if (!this.actor.system.traumas) {
      updates["system.traumas"] = [];
    }
    
    if (!this.actor.system.equipments) {
      updates["system.equipments"] = [];
    }

    if (Object.keys(updates).length > 0) {
      await this.actor.update(updates);
    }
  }

  async _onAddEquipment(event) {
    event.preventDefault();
    await ActorEquipmentFunctions.handleAddEquipment(this.actor, this, {
      // V2 uses simpler validation (no trim, less strict)
      validateInput: (formData, html, config) => {
        // V2: No strict validation like V1
        return { valid: true };
      },
      
      // V2 shows errors as notifications instead of dialog errors
      showValidationError: (html, message) => {
        ui.notifications.warn(message);
      },
      
      // V2 processes data without trimming
      processEquipmentData: (formData, config) => ({
        name: formData.name,
        type: formData.type,
        cost: formData.cost || 1,
        usage: formData.usage,
        action: formData.action,
        used: false,
        droppedDamaged: false,
        destroyed: false
      }),
      
      // V2 style success message
      onSuccess: async (equipment, actor, sheet, config) => {
        await ChatMessage.create({
          content: `
            <div class="equipment-message">
              <h3><i class="fas fa-backpack"></i> ${game.i18n.format("COGSYNDICATE.EquipmentAdded", { 
                actorName: `<strong>${actor.name}</strong>`, 
                equipmentName: `<span class="equipment-name">${equipment.name}</span>`,
                equipmentCost: `<span class="equipment-cost">${equipment.cost}</span>`
              })}</h3>
            </div>
          `,
          speaker: { actor: actor.id }
        });
        sheet.render(); // V2 calls render after success
      }
    });
  }

  async _onEditEquipment(event) {
    event.preventDefault();
    const index = parseInt(event.currentTarget.closest('.equipment-item').dataset.index);
    await ActorEquipmentFunctions.handleEditEquipment(this.actor, this, index, {
      // V2 style - simpler, no trimming
      validateInput: (formData, html, config) => ({ valid: true }),
      showValidationError: (html, message) => {
        ui.notifications.warn(message);
      },
      processEquipmentData: (formData, config) => ({
        name: formData.name,
        type: formData.type,
        cost: formData.cost,
        usage: formData.usage,
        action: formData.action
      }),
      onSuccess: async (newEquipment, oldEquipment, actor, sheet, config) => {
        sheet.render(); // V2 renders after edit
      }
    });
  }

  async _onDeleteEquipment(event) {
    event.preventDefault();
    const index = parseInt(event.currentTarget.closest('.equipment-item').dataset.index);
    await ActorEquipmentFunctions.handleDeleteEquipment(this.actor, this, index, {
      confirmDelete: false, // V2 doesn't confirm delete
      onSuccess: async (equipment, refund, actor, sheet, config) => {
        await ChatMessage.create({
          content: `
            <div class="equipment-message">
              <h3><i class="fas fa-backpack"></i> ${game.i18n.format("COGSYNDICATE.EquipmentDeleted", { 
                equipmentName: `<span class="equipment-name">${equipment.name}</span>`,
                actorName: `<strong>${actor.name}</strong>`
              })}</h3>
            </div>
          `,
          speaker: { actor: actor.id }
        });
        sheet.render(); // V2 renders after delete
      }
    });
  }

  async _onAddTrauma(event) {
    event.preventDefault();

    const templateData = {
      trauma: { name: "", description: "", effect: "", type: "physical" }
    };

    const dialogContent = await renderTemplate("systems/cogwheel-syndicate/src/templates/add-trauma-dialog.hbs", templateData);

    new Dialog({
      title: game.i18n.localize("COGSYNDICATE.AddTrauma"),
      content: dialogContent,
      buttons: {
        cancel: {
          label: game.i18n.localize("COGSYNDICATE.Cancel"),
          callback: () => {}
        },
        add: {
          label: game.i18n.localize("COGSYNDICATE.Confirm"),
          callback: async (html) => {
            const traumaName = html.find('[name="name"]').val();
            const traumaDescription = html.find('[name="description"]').val();
            const traumaEffect = html.find('[name="effect"]').val();
            const traumaType = html.find('[name="type"]').val();

            const newTrauma = {
              name: traumaName,
              description: traumaDescription,
              effect: traumaEffect,
              type: traumaType
            };

            const currentTraumas = foundry.utils.deepClone(this.actor.system.traumas) || [];
            currentTraumas.push(newTrauma);

            await this.actor.update({
              "system.traumas": currentTraumas
            });

            await ChatMessage.create({
              content: `<p>${game.i18n.format("COGSYNDICATE.AddTrauma", { name: traumaName, actorName: this.actor.name })}</p>`,
              speaker: { actor: this.actor.id }
            });

            this.render();
          }
        }
      },
      default: "add",
      width: 400,
      classes: ["cogsyndicate", "dialog", "trauma-dialog"]
    }).render(true);
  }

  async _onEditTrauma(event) {
    event.preventDefault();
    const index = parseInt(event.currentTarget.closest('.trauma-item').dataset.index);
    const currentTraumas = foundry.utils.deepClone(this.actor.system.traumas) || [];
    const trauma = currentTraumas[index];

    const templateData = {
      trauma: trauma
    };

    const dialogContent = await renderTemplate("systems/cogwheel-syndicate/src/templates/add-trauma-dialog.hbs", templateData);

    new Dialog({
      title: game.i18n.localize("COGSYNDICATE.EditTrauma"),
      content: dialogContent,
      buttons: {
        cancel: {
          label: game.i18n.localize("COGSYNDICATE.Cancel"),
          callback: () => {}
        },
        save: {
          label: game.i18n.localize("COGSYNDICATE.Confirm"),
          callback: async (html) => {
            const traumaName = html.find('[name="name"]').val();
            const traumaDescription = html.find('[name="description"]').val();
            const traumaEffect = html.find('[name="effect"]').val();
            const traumaType = html.find('[name="type"]').val();

            currentTraumas[index] = {
              name: traumaName,
              description: traumaDescription,
              effect: traumaEffect,
              type: traumaType
            };

            await this.actor.update({
              "system.traumas": currentTraumas
            });

            this.render();
          }
        }
      },
      default: "save",
      width: 400,
      classes: ["cogsyndicate", "dialog", "trauma-dialog"]
    }).render(true);
  }

  async _onDeleteTrauma(event) {
    event.preventDefault();
    const index = parseInt(event.currentTarget.closest('.trauma-item').dataset.index);
    const currentTraumas = foundry.utils.deepClone(this.actor.system.traumas) || [];
    const deletedTrauma = currentTraumas[index];
    currentTraumas.splice(index, 1);
    await this.actor.update({
      "system.traumas": currentTraumas
    });
    await ChatMessage.create({
      content: `<p>${game.i18n.format("COGSYNDICATE.DeleteTrauma", { name: deletedTrauma.name, actorName: this.actor.name })}</p>`,
      speaker: { actor: this.actor.id }
    });
    this.render();
  }

  _assignGearBackgrounds(html) {
    const backgrounds = [
      'url("systems/cogwheel-syndicate/src/styles/images/gears1.png")',
      'url("systems/cogwheel-syndicate/src/styles/images/gears2.png")',
      'url("systems/cogwheel-syndicate/src/styles/images/gears3.png")',
      'url("systems/cogwheel-syndicate/src/styles/images/gears4.png")'
    ];

    html.find('.gear-background').each(function() {
      const randomBackground = backgrounds[Math.floor(Math.random() * backgrounds.length)];
      $(this).css('background-image', randomBackground);
    });
  }

  _assignEquipmentColors(html) {
    const equipmentItems = html.find('.equipment-item');
    
    // Mapowanie typów ekwipunku na steampunkowe kolory
    const steampunkColors = {
      'weapon': 'steampunk-weapon',
      'armor': 'steampunk-armor', 
      'tool': 'steampunk-tool',
      'gadget': 'steampunk-gadget',
      'other': 'steampunk-other'
    };
    
    // Kolory fallback dla kompatybilności wstecznej
    const pastelColors = [
      'pastel-pink',
      'pastel-blue', 
      'pastel-green',
      'pastel-yellow',
      'pastel-purple',
      'pastel-orange'
    ];

    equipmentItems.each((index, element) => {
      const $element = $(element);
      
      // Próbujemy znaleźć typ ekwipunku z danych data-*
      let equipmentType = $element.attr('data-equipment-type');
      
      // Jeśli nie ma data-equipment-type, próbujemy z innerHTML
      if (!equipmentType) {
        const typeElement = $element.find('.equipment-type');
        if (typeElement.length > 0) {
          equipmentType = typeElement.text().toLowerCase().trim();
        }
      }
      
      // Jeśli nadal nie ma typu, próbujemy z zawartości tekstowej
      if (!equipmentType) {
        const content = $element.text().toLowerCase();
        if (content.includes('weapon') || content.includes('broń')) equipmentType = 'weapon';
        else if (content.includes('armor') || content.includes('pancerz')) equipmentType = 'armor';
        else if (content.includes('tool') || content.includes('narzędzie')) equipmentType = 'tool';
        else if (content.includes('gadget') || content.includes('gadżet')) equipmentType = 'gadget';
        else equipmentType = 'other';
      }
      
      // Przypisz odpowiednią klasę steampunkową lub losowy pastelowy kolor
      let colorClass;
      if (equipmentType && steampunkColors[equipmentType]) {
        colorClass = steampunkColors[equipmentType];
      } else {
        colorClass = pastelColors[Math.floor(Math.random() * pastelColors.length)];
      }
      
      $element.addClass(colorClass);

      // Nie ustawiamy już kolorów tekstu w JS - kolory są teraz w CSS
      // Steampunkowe style mają już odpowiednie kolory tekstu z text-shadow
    });
  }

  async _onSpendGear(event) {
    event.preventDefault();
    
    // Use shared gear function - can be customized in the future by passing options
    await ActorGearFunctions.handleSpendGear(this.actor, this, {
      // Add any v2-specific customizations here in the future
      // For example:
      // onSuccess: (gearType, gearCost, steamCost, newGearValue) => {
      //   // v2-specific success handling
      // }
    });
  }

  async _onSpendStress(event) {
    event.preventDefault();
    
    // Use shared stress function - can be customized in the future by passing options
    await ActorStressFunctions.handleSpendStress(this.actor, this, {
      // Add any v2-specific customizations here in the future
      // For example:
      // onSuccess: (stressAction, stressCost, steamBonus, finalStressValue, traumaOccurred) => {
      //   // v2-specific success handling
      // },
      // onTraumaWarning: async (actor, currentStress, stressCost, maxStress) => {
      //   // v2-specific trauma warning handling
      //   return { proceed: true/false };
      // }
    });
  }

  // Migrate equipment status from old format (used/destroyed separate) to new format (usedDestroyed combined)
  async _migrateEquipmentStatus(data) {
    if (!data.system.equipments || data.system.equipments.length === 0) return;
    
    let needsUpdate = false;
    const updates = {};
    const migratedEquipments = data.system.equipments.map((equipment, index) => {
      const migratedEquipment = { ...equipment };
      
      // If equipment has old format fields, migrate them
      if (equipment.hasOwnProperty('used') || equipment.hasOwnProperty('destroyed')) {
        // Combine 'used' and 'destroyed' into 'usedDestroyed'
        migratedEquipment.usedDestroyed = equipment.used || equipment.destroyed || false;
        
        // Remove old fields
        delete migratedEquipment.used;
        delete migratedEquipment.destroyed;
        
        needsUpdate = true;
        console.log(`Cogwheel: Migrated equipment "${equipment.name}" from old status format to new format`);
      }
      
      return migratedEquipment;
    });
    
    if (needsUpdate) {
      updates["system.equipments"] = migratedEquipments;
      await this.actor.update(updates);
      console.log(`Cogwheel: Successfully migrated ${migratedEquipments.length} equipment items for actor "${this.actor.name}"`);
    }
  }
}

Actors.registerSheet("cogwheel-syndicate", CogwheelActorSheetV2, {
  types: ["agentv2"],
  makeDefault: true,
  label: "Cogwheel Agent v2 Sheet"
});
