import { performAttributeRoll } from "./roll-mechanics.js";

class CogwheelActorSheet extends ActorSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      template: "systems/cogwheel-syndicate/src/templates/actor-sheet.hbs",
      classes: ["cogwheel", "sheet", "actor"],
      width: 750,
      submitOnChange: true,
      dragDrop: [{ dropSelector: ".archetype-drop, .feats-drop" }],
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-content", initial: "core" }]
    });
  }

  getData() {
    const data = super.getData();
    data.system = data.actor.system;

    // ARCHETYPE: Load archetype data if ID exists
    if (data.system.archetype && data.system.archetype.id) {
      const archetypeItem = game.items.get(data.system.archetype.id);
      if (archetypeItem && archetypeItem.type === "archetype") {
        data.system.archetype = {
          id: archetypeItem.id,
          name: archetypeItem.name,
          img: archetypeItem.img,
          attributes: archetypeItem.system.attributes
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
    data.system.attributes.machine = data.system.attributes.machine || { base: 1, value: 1 };
    data.system.attributes.engineering = data.system.attributes.engineering || { base: 1, value: 1 };
    data.system.attributes.intrigue = data.system.attributes.intrigue || { base: 1, value: 1 };

    data.system.attributes.machine.base = parseInt(data.system.attributes.machine.base, 10) || 1;
    data.system.attributes.engineering.base = parseInt(data.system.attributes.engineering.base, 10) || 1;
    data.system.attributes.intrigue.base = parseInt(data.system.attributes.intrigue.base, 10) || 1;

    data.system.resources = data.system.resources || {};
    data.system.resources.gear = data.system.resources.gear || { value: 0, max: 4, basis: "machine" };
    data.system.resources.stress = data.system.resources.stress || { value: 0, max: 4 };
    data.system.resources.trauma = data.system.resources.trauma || { value: 0, max: 4 };
    data.system.resources.development = data.system.resources.development || { value: 0, max: 12 };

    data.system.equipmentPoints = data.system.equipmentPoints || { value: 6, max: 6 };
    data.system.traumas = data.system.traumas || [];
    data.system.equipments = data.system.equipments || [];
    data.system.notes = data.system.notes || "";

    const attributeMap = {
      machine: "endurance",
      engineering: "control",
      intrigue: "determination"
    };

    data.effectiveAttributes = {};
    for (const [mainAttr, secondaryAttr] of Object.entries(attributeMap)) {
      const baseValue = parseInt(data.system.attributes[mainAttr].base, 10) || 1;
      const secondaryValue = parseInt(data.system.secondaryAttributes[secondaryAttr].value, 10) || 0;
      data.effectiveAttributes[mainAttr] = baseValue + secondaryValue;
      data.system.attributes[mainAttr].value = data.effectiveAttributes[mainAttr];
    }

    const gearBasis = data.system.resources.gear.basis || "machine";
    data.system.resources.gear.max = Math.max(4, 4 + (data.effectiveAttributes[gearBasis] || 0));
    data.system.resources.stress.max = Math.max(4, 4 + (data.effectiveAttributes.intrigue || 0));
    data.system.resources.trauma.max = 4;
    data.system.resources.development.max = 12;

    console.log("Dane w getData:", data);
    return data;
  }

  activateListeners(html) {
    super.activateListeners(html);
    html.find('.roll-attribute').click(this._onRollAttribute.bind(this));
    html.find('.delete-feat').click(this._onDeleteFeat.bind(this));
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
    this._assignRandomBackgrounds(html);
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

    if (isChecked && equipment[status]) {
      equipment.used = false;
      equipment.droppedDamaged = false;
      equipment.destroyed = false;

      await ChatMessage.create({
        content: `<p>${game.i18n.format("COGSYNDICATE.EquipmentRestored", { name: equipmentName, actorName: actorName })}</p>`,
        speaker: { actor: this.actor.id }
      });
    } else {
      equipment.used = false;
      equipment.droppedDamaged = false;
      equipment.destroyed = false;

      if (isChecked) {
        equipment[status] = true;
        let messageKey;
        if (status === "used") {
          messageKey = "COGSYNDICATE.EquipmentUsedMessage";
        } else if (status === "droppedDamaged") {
          messageKey = "COGSYNDICATE.EquipmentDroppedDamagedMessage";
        } else if (status === "destroyed") {
          messageKey = "COGSYNDICATE.EquipmentDestroyedMessage";
        }

        await ChatMessage.create({
          content: `<p>${game.i18n.format(messageKey, { name: equipmentName, actorName: actorName })}</p>`,
          speaker: { actor: this.actor.id }
        });
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

      const actorName = this.actor.name;
      const changeAmount = Math.abs(clampedValue - currentValue);

      if (clampedValue > currentValue) {
        await ChatMessage.create({
          content: `<p>${game.i18n.format("COGSYNDICATE.DevelopmentReceived", { agentName: actorName, amount: changeAmount })}</p>`,
          speaker: { actor: this.actor.id }
        });
      } else {
        await ChatMessage.create({
          content: `<p>${game.i18n.format("COGSYNDICATE.DevelopmentSpent", { agentName: actorName, amount: changeAmount })}</p>`,
          speaker: { actor: this.actor.id }
        });
      }
    }
  }

  async _onImageUpload(file) {
    const uploadResponse = await FilePicker.upload("data", "", file);
    return uploadResponse.path;
  }

  async _onDrop(event) {
    if (!(event instanceof DragEvent)) {
      console.warn("_onDrop: Event is not a DragEvent.");
      return;
    }

    let data;
    try {
      data = JSON.parse(event.dataTransfer.getData("text/plain"));
      console.log("_onDrop: Received data:", data);
    } catch (err) {
      console.error("_onDrop: Failed to parse drop data.", err);
      return;
    }

    if (data.type !== "Item") {
      console.warn("_onDrop: Dropped data is not of type 'Item'.");
      return;
    }

    const item = await Item.fromDropData(data);
    console.log("_onDrop: Created item from data:", item);

    const target = event.currentTarget.classList.contains('archetype-drop') ? 'archetype' : 'feat';
    console.log("_onDrop: Drop target:", target);

    if (target === 'archetype' && item.type === "archetype") {
      console.log("_onDrop: Adding archetype to actor.");
      // ARCHETYPE: Store only reference to item ID for live sync
      await this.actor.update({ 
        "system.archetype.id": item.id,
        "system.archetype.name": item.name,
        "system.archetype.img": item.img
      });
    } else if (target === 'feat' && item.type === "feat") {
      // FEATS: Only store reference to item ID for live sync
      const featIds = Array.isArray(this.actor.system.feats) ? [...this.actor.system.feats] : [];
      if (!featIds.includes(item.id)) {
        featIds.push(item.id);
        await this.actor.update({ "system.feats": featIds });
      } else {
        // Already present, check for sync (force re-render)
        this.render();
      }
    } else {
      console.warn("_onDrop: Item type does not match drop target.");
    }
  }

  async _onRollAttribute(event) {
    event.preventDefault();
    const attribute = event.currentTarget.dataset.attribute;
    await performAttributeRoll(this.actor, attribute);
    this.render();
  }

  async _onDeleteFeat(event) {
    const itemId = event.currentTarget.closest('.feat-item').dataset.itemId;
    // Remove feat ID from system.feats
    const featIds = Array.isArray(this.actor.system.feats) ? [...this.actor.system.feats] : [];
    const idx = featIds.indexOf(itemId);
    if (idx !== -1) {
      featIds.splice(idx, 1);
      await this.actor.update({ "system.feats": featIds });
    }
    this.render();
  }

  async _onRemoveArchetype(event) {
    await this.actor.update({
      "system.archetype.name": "",
      "system.archetype.id": null,
      "system.archetype.img": null
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
          default: "confirm",
          close: () => resolve(false)
        }).render(true);
      });

      if (traumaDialog) {
        const currentTrauma = this.actor.system.resources.trauma.value || 0;
        const newTrauma = Math.min(currentTrauma + 1, this.actor.system.resources.trauma.max);
        await this.actor.update({
          "system.resources.stress.value": 0,
          "system.resources.trauma.value": newTrauma
        });
        await ChatMessage.create({
          content: `<p>${game.i18n.localize("COGSYNDICATE.TraumaReceived")}</p>`,
          speaker: { actor: this.actor.id }
        });

        if (newTrauma === this.actor.system.resources.trauma.max) {
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
      return;
    } else if (resource === "trauma" && currentValue + 1 <= maxValue) {
      const newTrauma = currentValue + 1;
      await this.actor.update({
        [`system.resources.${resource}.value`]: newTrauma
      });
      await ChatMessage.create({
        content: `<p>${game.i18n.format("COGSYNDICATE.TraumaIncreased", { actorName: this.actor.name })}</p>`,
        speaker: { actor: this.actor.id }
      });

      if (newTrauma === maxValue) {
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
    } else if (currentValue < maxValue) {
      const newValue = currentValue + 1;
      await this.actor.update({
        [`system.resources.${resource}.value`]: newValue
      });

      const actorName = this.actor.name;
      const resourceLabel = game.i18n.localize(`COGSYNDICATE.${resource.charAt(0).toUpperCase() + resource.slice(1)}`);

      if (resource === "development") {
        await ChatMessage.create({
          content: `<p>${game.i18n.format("COGSYNDICATE.DevelopmentReceived", { agentName: actorName, amount: 1 })}</p>`,
          speaker: { actor: this.actor.id }
        });
      } else if (resource === "gear") {
        await ChatMessage.create({
          content: `<p>${game.i18n.format("COGSYNDICATE.ResourceAdded", { actorName, resource: resourceLabel })}</p>`,
          speaker: { actor: this.actor.id }
        });
      } else if (resource === "stress") {
        await ChatMessage.create({
          content: `<p>${game.i18n.format("COGSYNDICATE.ResourceSpent", { actorName, resource: resourceLabel })}</p>`,
          speaker: { actor: this.actor.id }
        });
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
      const actorName = this.actor.name;
      const resourceLabel = game.i18n.localize(`COGSYNDICATE.${resource.charAt(0).toUpperCase() + resource.slice(1)}`);

      if (resource === "development") {
        await ChatMessage.create({
          content: `<p>${game.i18n.format("COGSYNDICATE.DevelopmentSpent", { agentName: actorName, amount: 1 })}</p>`,
          speaker: { actor: this.actor.id }
        });
      } else if (resource === "gear") {
        await ChatMessage.create({
          content: `<p>${game.i18n.format("COGSYNDICATE.ResourceSpent", { actorName, resource: resourceLabel })}</p>`,
          speaker: { actor: this.actor.id }
        });
      } else if (resource === "stress") {
        await ChatMessage.create({
          content: `<p>${game.i18n.format("COGSYNDICATE.StressReduced", { actorName, resource: resourceLabel })}</p>`,
          speaker: { actor: this.actor.id }
        });
      } else if (resource === "trauma") {
        await ChatMessage.create({
          content: `<p>${game.i18n.format("COGSYNDICATE.TraumaDecreased", { actorName: actorName })}</p>`,
          speaker: { actor: this.actor.id }
        });
      }
    }
  }

  async _onCreate(data, options, userId) {
    console.log("Tworzenie postaci - _onCreate wywołane:", data, options, userId);
    await super._onCreate(data, options, userId);

    const gearMax = 4 + (this.actor.system.attributes.machine.base || 0);
    const updates = {
      "img": "icons/svg/mystery-man.svg",
      "system.resources.gear.value": gearMax,
      "system.resources.gear.basis": "machine",
      "system.resources.stress.value": 0,
      "system.resources.trauma.value": 0,
      "system.resources.development.value": 0,
      "system.equipmentPoints.value": 6,
      "system.traumas": [],
      "system.equipments": []
    };

    console.log("Aktualizacja zasobów przy tworzeniu:", updates);
    await this.actor.update(updates);
  }

  async _onAddEquipment(event) {
    event.preventDefault();

    const templateData = {
      equipment: { name: "", type: "weapon", cost: "1", usage: "Single", action: "", used: false, droppedDamaged: false, destroyed: false }
    };

    const dialogContent = await renderTemplate("systems/cogwheel-syndicate/src/templates/equipment-dialog.hbs", templateData);

    new Dialog({
      title: game.i18n.localize("COGSYNDICATE.AddEquipment"),
      content: dialogContent,
      buttons: {
        cancel: {
          label: game.i18n.localize("COGSYNDICATE.Cancel"),
          callback: () => {}
        },
        add: {
          label: game.i18n.localize("COGSYNDICATE.Confirm"),
          callback: async (html) => {
            const equipmentName = html.find('[name="name"]').val().trim();
            const equipmentType = html.find('[name="type"]').val().trim();
            const equipmentCost = parseInt(html.find('[name="cost"]').val().trim(), 10);
            const equipmentUsage = html.find('[name="usage"]').val().trim();
            const equipmentAction = html.find('[name="action"]').val().trim();

            const errorMessage = html.find('.error-message');
            if (!equipmentName || !equipmentAction) {
              errorMessage.text(game.i18n.localize("COGSYNDICATE.EquipmentValidationError")).addClass('show');
              setTimeout(() => errorMessage.removeClass('show'), 3000);
              return;
            }

            const currentEquipmentPoints = this.actor.system.equipmentPoints.value || 0;
            if (equipmentCost > currentEquipmentPoints) {
              errorMessage.text(game.i18n.localize("COGSYNDICATE.InsufficientEquipmentPointsMessage")).addClass('show');
              setTimeout(() => errorMessage.removeClass('show'), 3000);
              return;
            }

            const newEquipment = {
              name: equipmentName,
              type: equipmentType,
              cost: equipmentCost,
              usage: equipmentUsage,
              action: equipmentAction,
              used: false,
              droppedDamaged: false,
              destroyed: false
            };
            const currentEquipments = foundry.utils.deepClone(this.actor.system.equipments) || [];
            currentEquipments.push(newEquipment);
            await this.actor.update({
              "system.equipments": currentEquipments,
              "system.equipmentPoints.value": currentEquipmentPoints - equipmentCost
            });
            await ChatMessage.create({
              content: `<p>${game.i18n.format("COGSYNDICATE.EquipmentAdded", { name: equipmentName, actorName: this.actor.name })}</p>`,
              speaker: { actor: this.actor.id }
            });
            this.render();
          }
        }
      },
      default: "add",
      width: 400,
      classes: ["cogsyndicate", "dialog", "equipment-dialog"],
      close: () => {}
    }).render(true);
  }

  async _onEditEquipment(event) {
    event.preventDefault();
    const index = parseInt(event.currentTarget.closest('.equipment-item').dataset.index);
    const currentEquipments = foundry.utils.deepClone(this.actor.system.equipments) || [];
    const equipment = currentEquipments[index];
    const originalCost = parseInt(equipment.cost, 10);

    const templateData = {
      equipment: equipment
    };

    const dialogContent = await renderTemplate("systems/cogwheel-syndicate/src/templates/equipment-dialog.hbs", templateData);

    new Dialog({
      title: game.i18n.localize("COGSYNDICATE.EditEquipment"),
      content: dialogContent,
      buttons: {
        cancel: {
          label: game.i18n.localize("COGSYNDICATE.Cancel"),
          callback: () => {}
        },
        save: {
          label: game.i18n.localize("COGSYNDICATE.Confirm"),
          callback: async (html) => {
            const equipmentName = html.find('[name="name"]').val().trim();
            const equipmentType = html.find('[name="type"]').val().trim();
            const equipmentCost = parseInt(html.find('[name="cost"]').val().trim(), 10);
            const equipmentUsage = html.find('[name="usage"]').val().trim();
            const equipmentAction = html.find('[name="action"]').val().trim();

            const errorMessage = html.find('.error-message');
            if (!equipmentName || !equipmentAction) {
              errorMessage.text(game.i18n.localize("COGSYNDICATE.EquipmentValidationError")).addClass('show');
              setTimeout(() => errorMessage.removeClass('show'), 3000);
              return;
            }

            const currentEquipmentPoints = this.actor.system.equipmentPoints.value || 0;
            const costDifference = equipmentCost - originalCost;
            if (costDifference > currentEquipmentPoints) {
              errorMessage.text(game.i18n.localize("COGSYNDICATE.InsufficientEquipmentPointsMessage")).addClass('show');
              setTimeout(() => errorMessage.removeClass('show'), 3000);
              return;
            }

            currentEquipments[index] = {
              name: equipmentName,
              type: equipmentType,
              cost: equipmentCost,
              usage: equipmentUsage,
              action: equipmentAction,
              used: equipment.used,
              droppedDamaged: equipment.droppedDamaged,
              destroyed: equipment.destroyed
            };
            await this.actor.update({
              "system.equipments": currentEquipments,
              "system.equipmentPoints.value": currentEquipmentPoints - costDifference
            });
            this.render();
          }
        }
      },
      default: "save",
      width: 400,
      classes: ["cogsyndicate", "dialog", "equipment-dialog"],
      close: () => {}
    }).render(true);
  }

  async _onDeleteEquipment(event) {
    event.preventDefault();
    const index = parseInt(event.currentTarget.closest('.equipment-item').dataset.index);
    const currentEquipments = foundry.utils.deepClone(this.actor.system.equipments) || [];
    const deletedEquipment = currentEquipments[index];
    const equipmentCost = parseInt(deletedEquipment.cost, 10);
    const currentEquipmentPoints = this.actor.system.equipmentPoints.value || 0;
    const maxEquipmentPoints = this.actor.system.equipmentPoints.max || 6;
    const newEquipmentPoints = Math.min(currentEquipmentPoints + equipmentCost, maxEquipmentPoints);
    currentEquipments.splice(index, 1);
    await this.actor.update({
      "system.equipments": currentEquipments,
      "system.equipmentPoints.value": newEquipmentPoints
    });
    await ChatMessage.create({
      content: `<p>${game.i18n.format("COGSYNDICATE.DeleteEquipment", { name: deletedEquipment.name, actorName: this.actor.name })}</p>`,
      speaker: { actor: this.actor.id }
    });
    this.render();
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
            const traumaName = html.find('[name="name"]').val().trim();
            const traumaType = html.find('[name="type"]').val().trim();
            const traumaDescription = html.find('[name="description"]').val().trim();
            const traumaEffect = html.find('[name="effect"]').val().trim();

            if (!traumaName || !traumaEffect) {
              html.find('.error-message').text(game.i18n.localize("COGSYNDICATE.TraumaValidationError")).show();
              return;
            }

            const newTrauma = {
              name: traumaName,
              type: traumaType,
              description: traumaDescription || "",
              effect: traumaEffect
            };
            const currentTraumas = foundry.utils.deepClone(this.actor.system.traumas) || [];
            currentTraumas.push(newTrauma);
            await this.actor.update({ "system.traumas": currentTraumas });
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
            const traumaName = html.find('[name="name"]').val().trim();
            const traumaType = html.find('[name="type"]').val().trim();
            const traumaDescription = html.find('[name="description"]').val().trim();
            const traumaEffect = html.find('[name="effect"]').val().trim();

            if (!traumaName || !traumaEffect) {
              html.find('.error-message').text(game.i18n.localize("COGSYNDICATE.TraumaValidationError")).show();
              return;
            }

            currentTraumas[index] = {
              name: traumaName,
              type: traumaType,
              description: traumaDescription || "",
              effect: traumaEffect
            };
            await this.actor.update({ "system.traumas": currentTraumas });
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
    currentTraumas.splice(index, 1);
    await this.actor.update({ "system.traumas": currentTraumas });
    this.render();
  }

  _assignRandomBackgrounds(html) {
    const equipmentItems = html.find('.equipment-item');
    const pastelColors = [
      'pastel-pink',
      'pastel-blue',
      'pastel-green',
      'pastel-yellow',
      'pastel-purple',
      'pastel-orange'
    ];

    equipmentItems.each((index, element) => {
      const randomColorClass = pastelColors[Math.floor(Math.random() * pastelColors.length)];
      $(element).addClass(randomColorClass);

      const bgColor = window.getComputedStyle(element).backgroundColor;
      const rgb = bgColor.match(/\d+/g).map(Number);
      const brightness = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
      const textColor = brightness > 128 ? '#000000' : '#FFFFFF';      $(element).find('.equipment-header, .equipment-details').css('color', textColor);
    });
  }
  async _onSpendGear(event) {
    event.preventDefault();
    console.log("=== SPEND GEAR DEBUG START ===");

    const templateData = {
      currentGear: this.actor.system.resources.gear.value || 0,
      currentSteam: game.cogwheelSyndicate?.steamPoints || 0
    };const dialogContent = await renderTemplate("systems/cogwheel-syndicate/src/templates/spend-gear-dialog.hbs", templateData);

    // Zachowaj referencję do this dla użycia w callback
    const actorRef = this.actor;
    const sheetRef = this;

    const dialog = new Dialog({
      title: game.i18n.localize("COGSYNDICATE.SpendGearTitle"),
      content: dialogContent,
      buttons: {
        cancel: {
          label: game.i18n.localize("COGSYNDICATE.Cancel"),
          callback: () => {
            console.log("Dialog anulowany");
          }
        },
        confirm: {
          label: game.i18n.localize("COGSYNDICATE.Confirm"),
          callback: async (html) => {
            console.log("Callback confirm uruchomiony");
            
            const selectedOption = html.find('input[name="gearType"]:checked');
            const errorMessage = html.find('.error-message');

            console.log("Wybrane opcje:", selectedOption.length);            if (selectedOption.length === 0) {
              console.log("Brak wybranej opcji");
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

            const gearType = selectedOption.val();
            const gearCost = parseInt(selectedOption.data('cost'), 10);
            const steamCost = parseInt(selectedOption.data('steam'), 10);            const currentGear = actorRef.system.resources.gear.value || 0;
            const currentSteam = game.cogwheelSyndicate?.steamPoints || 0;

            console.log("Dane sprzętu:", { gearType, gearCost, steamCost, currentGear, currentSteam });            // Sprawdź czy agent ma wystarczająco punktów sprzętu
            if (currentGear < gearCost) {
              console.log("Za mało punktów sprzętu");
              new Dialog({
                title: game.i18n.localize("COGSYNDICATE.Error"),
                content: `<p style="color: red; font-weight: bold; text-align: center; font-size: 16px;">${game.i18n.format("COGSYNDICATE.ErrorInsufficientGear", {required: gearCost, available: currentGear})}</p>`,
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

            // Sprawdź czy są wystarczające punkty pary
            if (steamCost > 0 && currentSteam < steamCost) {
              console.log("Za mało punktów pary");
              new Dialog({
                title: game.i18n.localize("COGSYNDICATE.Error"),
                content: `<p style="color: red; font-weight: bold; text-align: center; font-size: 16px;">${game.i18n.format("COGSYNDICATE.ErrorInsufficientSteam", {required: steamCost, available: currentSteam})}</p>`,
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

            try {
              console.log("Rozpoczynam aktualizację...");
              
              // Aktualizuj punkty sprzętu u agenta
              const newGearValue = currentGear - gearCost;
              await actorRef.update({
                "system.resources.gear.value": newGearValue
              });
              console.log("Zaktualizowano punkty sprzętu:", newGearValue);

              // Aktualizuj punkty pary (jeśli potrzebne)
              if (steamCost > 0) {                const newSteamValue = currentSteam - steamCost;
                game.cogwheelSyndicate.steamPoints = newSteamValue;
                
                // Synchronizacja przez socket
                game.socket.emit("system.cogwheel-syndicate", {
                  type: "updateMetaCurrencies",
                  nemesisPoints: game.cogwheelSyndicate.nemesisPoints,
                  steamPoints: game.cogwheelSyndicate.steamPoints
                });
                
                Hooks.call("cogwheelSyndicateMetaCurrenciesUpdated");
                console.log("Zaktualizowano punkty pary:", newSteamValue);
              }

              // Przygotuj komunikat na czat
              const gearTypeLabels = {
                'light': game.i18n.localize("COGSYNDICATE.GearLight"),
                'medium': game.i18n.localize("COGSYNDICATE.GearMedium"), 
                'heavy': game.i18n.localize("COGSYNDICATE.GearHeavy"),
                'very-heavy': game.i18n.localize("COGSYNDICATE.GearVeryHeavy")
              };

              const gearTypeName = gearTypeLabels[gearType] || gearType;
              const agentName = actorRef.name;
              const gearPointsLabel = gearCost === 1 ? 
                game.i18n.localize("COGSYNDICATE.GearPoint") : 
                game.i18n.localize("COGSYNDICATE.GearPoints");
            
              let message;
            
              if (steamCost > 0) {
                message = `Agent <strong>${agentName}</strong> wydał <strong>${gearCost}</strong> ${gearPointsLabel} oraz <strong>1 ${game.i18n.localize("COGSYNDICATE.SteamPoint")}</strong> na <strong>${gearTypeName}</strong>.`;
              } else {
                message = `Agent <strong>${agentName}</strong> wydał <strong>${gearCost}</strong> ${gearPointsLabel} na <strong>${gearTypeName}</strong>.`;
              }

              console.log("Przygotowany komunikat:", message);

              // Wyślij komunikat na czat
              const chatMessage = await ChatMessage.create({
                content: `<p>${message}</p>`,
                speaker: { actor: actorRef.id },
                style: CONST.CHAT_MESSAGE_STYLES.OTHER
              });

              console.log("ChatMessage utworzony:", chatMessage);
              console.log("=== SPEND GEAR DEBUG END ===");

              sheetRef.render();
              
              // Zamknij dialog dopiero po sukcesie
              dialog.close();
              return true;            } catch (error) {
              console.error("Błąd podczas wydawania sprzętu:", error);
              new Dialog({
                title: game.i18n.localize("COGSYNDICATE.Error"),
                content: `<p style="color: red; font-weight: bold; text-align: center; font-size: 16px;">${game.i18n.format("COGSYNDICATE.ErrorGeneral", {error: error.message})}</p>`,
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
          }
        }
      },
      default: "confirm",
      width: 400,
      classes: ["cogsyndicate", "dialog", "spend-gear-dialog"],
      close: () => {
        console.log("Dialog zamknięty");
      }
    });

    dialog.render(true);
  }

  async _onSpendStress(event) {
    event.preventDefault();
    console.log("=== SPEND STRESS DEBUG START ===");

    const templateData = {
      currentStress: this.actor.system.resources.stress.value || 0,
      maxStress: this.actor.system.resources.stress.max || 12,
      currentSteam: game.cogwheelSyndicate?.steamPoints || 0
    };

    const dialogContent = await renderTemplate("systems/cogwheel-syndicate/src/templates/spend-stress-dialog.hbs", templateData);

    // Zachowaj referencję do this dla użycia w callback
    const actorRef = this.actor;
    const sheetRef = this;

    const dialog = new Dialog({
      title: game.i18n.localize("COGSYNDICATE.SpendStressTitle"),
      content: dialogContent,
      buttons: {
        cancel: {
          label: game.i18n.localize("COGSYNDICATE.Cancel"),
          callback: () => {
            console.log("Dialog anulowany");
          }
        },
        confirm: {
          label: game.i18n.localize("COGSYNDICATE.Confirm"),
          callback: async (html) => {
            console.log("Callback confirm uruchomiony");
            
            const selectedOption = html.find('input[name="stressAction"]:checked');
            const errorMessage = html.find('.error-message');

            console.log("Wybrane opcje:", selectedOption.length);
            
            if (selectedOption.length === 0) {
              console.log("Brak wybranej opcji");
              new Dialog({
                title: game.i18n.localize("COGSYNDICATE.Error"),
                content: `<p style="color: red; font-weight: bold; text-align: center; font-size: 16px;">${game.i18n.localize("COGSYNDICATE.ErrorNoStressSelected")}</p>`,
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

            const stressAction = selectedOption.val();
            const stressCost = parseInt(selectedOption.data('cost'), 10);
            const steamBonus = parseInt(selectedOption.data('steam') || 0, 10);
            
            const currentStress = actorRef.system.resources.stress.value || 0;
            const maxStress = actorRef.system.resources.stress.max || 12;
            const currentSteam = game.cogwheelSyndicate?.steamPoints || 0;

            console.log("Dane stresu:", { stressAction, stressCost, steamBonus, currentStress, maxStress, currentSteam });

            // Funkcja wykonania akcji stresu
            const executeStressAction = async (withTrauma = false) => {
              try {
                console.log("Rozpoczynam aktualizację...");
                
                let finalStressValue;
                let traumaOccurred = false;
                
                if (withTrauma) {
                  // Jeśli z traumą, oblicz końcową wartość stresu
                  const excessStress = (currentStress + stressCost) - maxStress;
                  finalStressValue = excessStress;
                  traumaOccurred = true;
                  
                  // Zwiększ traumę
                  const traumaValue = actorRef.system.resources.trauma.value || 0;
                  const newTraumaValue = Math.min(traumaValue + 1, actorRef.system.resources.trauma.max);
                  
                  await actorRef.update({
                    "system.resources.stress.value": finalStressValue,
                    "system.resources.trauma.value": newTraumaValue
                  });
                  
                  console.log("Agent doznał traumy, nowy stres:", finalStressValue, "trauma:", newTraumaValue);
                } else {
                  // Normalne wydanie stresu bez traumy
                  finalStressValue = currentStress + stressCost;
                  await actorRef.update({
                    "system.resources.stress.value": finalStressValue
                  });
                  console.log("Zaktualizowano punkty stresu:", finalStressValue);
                }

                // Aktualizuj punkty pary (jeśli potrzebne)
                if (steamBonus > 0) {
                  const newSteamValue = currentSteam + steamBonus;
                  game.cogwheelSyndicate.steamPoints = newSteamValue;
                  
                  // Synchronizacja przez socket
                  game.socket.emit("system.cogwheel-syndicate", {
                    type: "updateMetaCurrencies",
                    nemesisPoints: game.cogwheelSyndicate.nemesisPoints,
                    steamPoints: game.cogwheelSyndicate.steamPoints
                  });
                  
                  Hooks.call("cogwheelSyndicateMetaCurrenciesUpdated");
                  console.log("Zaktualizowano punkty pary:", newSteamValue);
                }

                // Przygotuj komunikat na czat
                const agentName = actorRef.name;
                let message;
                
                switch(stressAction) {
                  case 'controlled':
                    message = game.i18n.format("COGSYNDICATE.StressSpentControlled", {agentName});
                    break;
                  case 'risky':
                    message = game.i18n.format("COGSYNDICATE.StressSpentRisky", {agentName});
                    break;
                  case 'desperate':
                    message = game.i18n.format("COGSYNDICATE.StressSpentDesperate", {agentName});
                    break;
                  case 'steam':
                    message = game.i18n.format("COGSYNDICATE.StressSpentSteam", {agentName});
                    break;
                  case 'help':
                    message = game.i18n.format("COGSYNDICATE.StressSpentHelp", {agentName});
                    break;
                  default:
                    message = `Agent ${agentName} wydał ${stressCost} punktów stresu.`;
                }

                // Dodaj informację o traumie do komunikatu jeśli wystąpiła
                if (traumaOccurred) {
                  message += `<br><strong>${game.i18n.localize("COGSYNDICATE.TraumaReceived")}</strong>`;
                }

                console.log("Przygotowany komunikat:", message);

                // Wyślij komunikat na czat
                const chatMessage = await ChatMessage.create({
                  content: `<p>${message}</p>`,
                  speaker: { actor: actorRef.id },
                  style: CONST.CHAT_MESSAGE_STYLES.OTHER
                });

                console.log("ChatMessage utworzony:", chatMessage);
                sheetRef.render();
                
                return true;
              } catch (error) {
                console.error("Błąd podczas wydawania stresu:", error);
                new Dialog({
                  title: game.i18n.localize("COGSYNDICATE.Error"),
                  content: `<p style="color: red; font-weight: bold; text-align: center; font-size: 16px;">Wystąpił błąd podczas wydawania stresu!<br><br><small>${error.message}</small></p>`,
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
            };

            // Sprawdź czy agent przekroczy maksymalny poziom stresu
            const newStressValue = currentStress + stressCost;
            const willCauseTrauma = newStressValue > maxStress;
            
            if (willCauseTrauma) {
              console.log("Wydanie stresu spowoduje traumę");
              
              // Pokaż ostrzeżenie o traumie i pozwól na potwierdzenie
              const traumaWarningDialog = new Dialog({
                title: game.i18n.localize("COGSYNDICATE.TraumaWarning"),
                content: `<p style="text-align: center; font-size: 16px; margin-bottom: 15px;">${game.i18n.format("COGSYNDICATE.TraumaMessage", {agentName: actorRef.name})}</p>`,
                buttons: {
                  cancel: {
                    label: game.i18n.localize("COGSYNDICATE.Cancel"),
                    callback: () => {
                      console.log("Anulowano wydanie stresu z traumą");
                      return false;
                    }
                  },
                  confirm: {
                    label: game.i18n.localize("COGSYNDICATE.Confirm"),
                    callback: async () => {
                      console.log("Potwierdzono wydanie stresu z traumą");
                      
                      // Wykonaj akcję z traumą
                      await executeStressAction(true);
                      dialog.close();
                      return true;
                    }
                  }
                },
                default: "confirm"
              });
              
              traumaWarningDialog.render(true);
              return false; // Zatrzymaj pierwotny dialog
            }

            // Wykonaj akcję normalnie (bez traumy)
            await executeStressAction(false);
            dialog.close();
            return true;
          }
        }
      },
      default: "confirm",
      width: 450,
      classes: ["cogsyndicate", "dialog", "spend-stress-dialog"],
      close: () => {
        console.log("Dialog zamknięty");
      }
    });

    dialog.render(true);
  }
}

Actors.registerSheet("cogwheel-syndicate", CogwheelActorSheet, {
  types: ["agent"],
  makeDefault: true,
  label: "Cogwheel Actor Sheet"
});