import { performAttributeRoll } from './roll-mechanics.js';

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

    console.log("Dane w getData (Agent v2):", data);
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

    if (isChecked && equipment[status]) {
      equipment[status] = true;

      let messageKey = "";
      if (status === "used") {
        messageKey = "COGSYNDICATE.EquipmentUsed";
      } else if (status === "droppedDamaged") {
        messageKey = "COGSYNDICATE.EquipmentDroppedDamaged";
      } else if (status === "destroyed") {
        messageKey = "COGSYNDICATE.EquipmentDestroyed";
      }

      if (messageKey) {
        await ChatMessage.create({
          content: `<p>${game.i18n.format(messageKey, { name: equipmentName, actorName: actorName })}</p>`,
          speaker: { actor: this.actor.id }
        });
      }
    } else {
      equipment[status] = false;
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
    console.log("_onDrop: Created item from data:", item);

    let target = 'feat'; // domyślnie feat
    if (event.currentTarget.classList.contains('archetype-drop')) {
      target = 'archetype';
    } else if (event.currentTarget.classList.contains('feats-drop')) {
      target = 'feat';
    }
    console.log("_onDrop: Drop target:", target);

    if (target === 'archetype' && item.type === "archetype") {
      const archetypeUpdates = {
        "system.archetype.name": item.name,
        "system.archetype.id": item.id,
        "system.archetype.img": item.img,
        "system.attributes.machine.base": item.system.attributes.machine,
        "system.attributes.engineering.base": item.system.attributes.engineering,
        "system.attributes.intrigue.base": item.system.attributes.intrigue
      };

      await this.actor.update(archetypeUpdates);
      this.render();
    } else if (target === 'feat' && item.type === "feat") {
      const featIds = Array.isArray(this.actor.system.feats) ? [...this.actor.system.feats] : [];
      if (!featIds.includes(item.id)) {
        featIds.push(item.id);
        await this.actor.update({ "system.feats": featIds });
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
    if (this.actor.system.archetype.id) {
      console.log("Usuwanie archetypu:", this.actor.system.archetype.name);
    }
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
      await this.actor.update({
        [`system.resources.${resource}.value`]: currentValue + 1
      });
    }
  }

  async _onDecrementResource(event) {
    event.preventDefault();
    const resource = event.currentTarget.dataset.resource;
    const currentValue = this.actor.system.resources[resource].value || 0;

    if (currentValue > 0) {
      await this.actor.update({
        [`system.resources.${resource}.value`]: currentValue - 1
      });
    }
  }

  async _updateData() {
    console.log("Inicjalizacja danych dla Agent v2");

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
    
    if (!this.actor.system.resources?.gear?.value) {
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
      console.log("Aktualizacja danych Agent v2:", updates);
      await this.actor.update(updates);
    }
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
            const equipmentName = html.find('[name="name"]').val();
            const equipmentType = html.find('[name="type"]').val();
            const equipmentCost = parseInt(html.find('[name="cost"]').val(), 10) || 1;
            const equipmentUsage = html.find('[name="usage"]').val();
            const equipmentAction = html.find('[name="action"]').val();

            const currentEquipmentPoints = this.actor.system.equipmentPoints.value || 0;

            if (currentEquipmentPoints < equipmentCost) {
              ui.notifications.warn(game.i18n.localize("COGSYNDICATE.InsufficientEquipmentPoints"));
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

            const newEquipmentPoints = currentEquipmentPoints - equipmentCost;

            await this.actor.update({
              "system.equipments": currentEquipments,
              "system.equipmentPoints.value": newEquipmentPoints
            });

            await ChatMessage.create({
              content: `<p>${game.i18n.format("COGSYNDICATE.AddEquipment", { name: equipmentName, actorName: this.actor.name })}</p>`,
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
            const equipmentName = html.find('[name="name"]').val();
            const equipmentType = html.find('[name="type"]').val();
            const equipmentCost = parseInt(html.find('[name="cost"]').val(), 10) || 1;
            const equipmentUsage = html.find('[name="usage"]').val();
            const equipmentAction = html.find('[name="action"]').val();

            const costDifference = equipmentCost - originalCost;
            const currentEquipmentPoints = this.actor.system.equipmentPoints.value || 0;

            if (costDifference > 0 && currentEquipmentPoints < costDifference) {
              ui.notifications.warn(game.i18n.localize("COGSYNDICATE.InsufficientEquipmentPoints"));
              return;
            }

            currentEquipments[index] = {
              ...equipment,
              name: equipmentName,
              type: equipmentType,
              cost: equipmentCost,
              usage: equipmentUsage,
              action: equipmentAction
            };

            const newEquipmentPoints = currentEquipmentPoints - costDifference;

            await this.actor.update({
              "system.equipments": currentEquipments,
              "system.equipmentPoints.value": newEquipmentPoints
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
      const textColor = brightness > 128 ? '#000000' : '#FFFFFF';      
      $(element).find('.equipment-header, .equipment-details').css('color', textColor);
    });
  }

  async _onSpendGear(event) {
    event.preventDefault();

    const templateData = {
      actor: this.actor,
      gearValue: this.actor.system.resources.gear.value
    };

    const dialogContent = await renderTemplate("systems/cogwheel-syndicate/src/templates/spend-gear-dialog.hbs", templateData);

    new Dialog({
      title: game.i18n.localize("COGSYNDICATE.SpendGear"),
      content: dialogContent,
      buttons: {
        cancel: {
          label: game.i18n.localize("COGSYNDICATE.Cancel"),
          callback: () => {}
        },
        spend: {
          label: game.i18n.localize("COGSYNDICATE.Confirm"),
          callback: async (html) => {
            const spendAmount = parseInt(html.find('[name="spendAmount"]').val(), 10) || 1;
            const spendReason = html.find('[name="spendReason"]').val();

            const currentGear = this.actor.system.resources.gear.value || 0;
            const newGear = Math.max(currentGear - spendAmount, 0);

            await this.actor.update({
              "system.resources.gear.value": newGear
            });

            await ChatMessage.create({
              content: `<p>${game.i18n.format("COGSYNDICATE.SpentGear", { agentName: this.actor.name, amount: spendAmount, reason: spendReason })}</p>`,
              speaker: { actor: this.actor.id }
            });

            this.render();
          }
        }
      },
      default: "spend",
      width: 400,
      classes: ["cogsyndicate", "dialog", "spend-gear-dialog"]
    }).render(true);
  }

  async _onSpendStress(event) {
    event.preventDefault();

    const templateData = {
      actor: this.actor,
      stressValue: this.actor.system.resources.stress.value
    };

    const dialogContent = await renderTemplate("systems/cogwheel-syndicate/src/templates/spend-stress-dialog.hbs", templateData);

    new Dialog({
      title: game.i18n.localize("COGSYNDICATE.SpendStress"),
      content: dialogContent,
      buttons: {
        cancel: {
          label: game.i18n.localize("COGSYNDICATE.Cancel"),
          callback: () => {}
        },
        spend: {
          label: game.i18n.localize("COGSYNDICATE.Confirm"),
          callback: async (html) => {
            const spendAmount = parseInt(html.find('[name="spendAmount"]').val(), 10) || 1;
            const spendReason = html.find('[name="spendReason"]').val();

            const currentStress = this.actor.system.resources.stress.value || 0;
            const newStress = Math.max(currentStress - spendAmount, 0);

            await this.actor.update({
              "system.resources.stress.value": newStress
            });

            await ChatMessage.create({
              content: `<p>${game.i18n.format("COGSYNDICATE.SpentStress", { agentName: this.actor.name, amount: spendAmount, reason: spendReason })}</p>`,
              speaker: { actor: this.actor.id }
            });

            this.render();
          }
        }
      },
      default: "spend",
      width: 400,
      classes: ["cogsyndicate", "dialog", "spend-stress-dialog"]
    }).render(true);
  }
}

Actors.registerSheet("cogwheel-syndicate", CogwheelActorSheetV2, {
  types: ["agentv2"],
  makeDefault: true,
  label: "Cogwheel Agent v2 Sheet"
});
