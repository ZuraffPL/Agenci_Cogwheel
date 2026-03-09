// Karta Bazy - zmigrowana do ApplicationV2 (HandlebarsApplicationMixin + ActorSheetV2)
class CogwheelHQSheet extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.sheets.ActorSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["cogwheel", "sheet", "actor", "hq"],
    position: { width: 700, height: 900 },
    window: { resizable: true },
    form: { submitOnChange: true }
  };

  static tabGroups = {
    primary: "primary-locations"
  };

  static PARTS = {
    main: {
      template: "systems/cogwheel-syndicate/src/templates/hq-sheet.hbs"
    }
  };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const data = context;
    data.actor = this.actor;
    data.system = this.actor.system;

    if (!data.actor.img || data.actor.img === "") {
      data.actor.img = "icons/svg/mystery-man.svg";
    }

    data.system.locationsPrimary = data.system.locationsPrimary || [];
    data.system.locationsAdditional = data.system.locationsAdditional || [];
    data.system.expansionProjects = data.system.expansionProjects || [];
    data.system.primarySections = data.system.primarySections || {
      infirmary: { level: 0, isDestroyed: false },
      crewQuarters: { level: 0, isDestroyed: false },
      trainingHalls: { level: 0, isDestroyed: false },
      workshop: { level: 0, isDestroyed: false }
    };

    return data;
  }

  _onRender(context, options) {
    const html = this.element;

    // Przywróć aktywną zakładkę po re-renderze
    for (const [group, activeTab] of Object.entries(this.tabGroups)) {
      html.querySelectorAll(`[data-group="${group}"][data-tab]`).forEach(el => {
        el.classList.toggle('active', el.dataset.tab === activeTab);
      });
    }

    html.querySelector('.add-location-btn')?.addEventListener('click', this._onAddLocation.bind(this));
    html.querySelectorAll('.edit-location').forEach(el => el.addEventListener('click', this._onEditLocation.bind(this)));
    html.querySelectorAll('.delete-location').forEach(el => el.addEventListener('click', this._onDeleteLocation.bind(this)));
    html.querySelector('.add-project-btn')?.addEventListener('click', this._onAddExpansionProject.bind(this));
    html.querySelectorAll('.edit-project').forEach(el => el.addEventListener('click', this._onEditExpansionProject.bind(this)));
    html.querySelectorAll('.delete-project').forEach(el => el.addEventListener('click', this._onDeleteExpansionProject.bind(this)));
    html.querySelectorAll('.increase-level').forEach(el => el.addEventListener('click', this._onIncreaseLevel.bind(this)));
    html.querySelectorAll('.decrease-level').forEach(el => el.addEventListener('click', this._onDecreaseLevel.bind(this)));
    html.querySelectorAll('.destroyed-checkbox').forEach(el => el.addEventListener('change', this._onToggleDestroyed.bind(this)));
  }

  async _onAddLocation(event) {
    event.preventDefault();
    const dialogContent = await foundry.applications.handlebars.renderTemplate(
      "systems/cogwheel-syndicate/src/templates/add-location-dialog.hbs",
      { location: { name: "", description: "", effect: "" } }
    );
    const result = await foundry.applications.api.DialogV2.wait({
      window: { title: game.i18n.localize("COGSYNDICATE.AddLocation") },
      content: dialogContent,
      rejectClose: false,
      buttons: [
        { label: game.i18n.localize("COGSYNDICATE.Cancel"), action: "cancel" },
        {
          label: game.i18n.localize("COGSYNDICATE.Confirm"),
          action: "add",
          default: true,
          callback: (_event, _button, dialog) => {
            const name = dialog.element.querySelector('[name="name"]')?.value.trim() ?? "";
            const description = dialog.element.querySelector('[name="description"]')?.value.trim() ?? "";
            const effect = dialog.element.querySelector('[name="effect"]')?.value.trim() ?? "";
            if (!name || !effect) return null;
            return { name, description, effect };
          }
        }
      ]
    });
    if (!result) return;
    const currentLocations = foundry.utils.deepClone(this.actor.system.locationsAdditional) || [];
    currentLocations.push(result);
    await this.actor.update({ "system.locationsAdditional": currentLocations });
  }

  async _onEditLocation(event) {
    event.preventDefault();
    const index = parseInt(event.currentTarget.closest('.location-item').dataset.index);
    const currentLocations = foundry.utils.deepClone(this.actor.system.locationsAdditional) || [];
    const dialogContent = await foundry.applications.handlebars.renderTemplate(
      "systems/cogwheel-syndicate/src/templates/add-location-dialog.hbs",
      { location: currentLocations[index] }
    );
    const result = await foundry.applications.api.DialogV2.wait({
      window: { title: game.i18n.localize("COGSYNDICATE.EditLocation") },
      content: dialogContent,
      rejectClose: false,
      buttons: [
        { label: game.i18n.localize("COGSYNDICATE.Cancel"), action: "cancel" },
        {
          label: game.i18n.localize("COGSYNDICATE.Confirm"),
          action: "save",
          default: true,
          callback: (_event, _button, dialog) => {
            const name = dialog.element.querySelector('[name="name"]')?.value.trim() ?? "";
            const description = dialog.element.querySelector('[name="description"]')?.value.trim() ?? "";
            const effect = dialog.element.querySelector('[name="effect"]')?.value.trim() ?? "";
            if (!name || !effect) return null;
            return { name, description, effect };
          }
        }
      ]
    });
    if (!result) return;
    currentLocations[index] = result;
    await this.actor.update({ "system.locationsAdditional": currentLocations });
  }

  async _onDeleteLocation(event) {
    event.preventDefault();
    const index = parseInt(event.currentTarget.closest('.location-item').dataset.index);
    const currentLocations = foundry.utils.deepClone(this.actor.system.locationsAdditional) || [];
    currentLocations.splice(index, 1);
    await this.actor.update({ "system.locationsAdditional": currentLocations });
  }

  async _onAddExpansionProject(event) {
    event.preventDefault();
    const dialogContent = await foundry.applications.handlebars.renderTemplate(
      "systems/cogwheel-syndicate/src/templates/add-project-dialog.hbs",
      { project: { name: "", description: "", effect: "" } }
    );
    const result = await foundry.applications.api.DialogV2.wait({
      window: { title: game.i18n.localize("COGSYNDICATE.AddExpansionProject") },
      content: dialogContent,
      rejectClose: false,
      buttons: [
        { label: game.i18n.localize("COGSYNDICATE.Cancel"), action: "cancel" },
        {
          label: game.i18n.localize("COGSYNDICATE.Confirm"),
          action: "add",
          default: true,
          callback: (_event, _button, dialog) => {
            const name = dialog.element.querySelector('[name="name"]')?.value.trim() ?? "";
            const description = dialog.element.querySelector('[name="description"]')?.value.trim() ?? "";
            const effect = dialog.element.querySelector('[name="effect"]')?.value.trim() ?? "";
            if (!name || !effect) return null;
            return { name, description, effect };
          }
        }
      ]
    });
    if (!result) return;
    const currentProjects = foundry.utils.deepClone(this.actor.system.expansionProjects) || [];
    currentProjects.push(result);
    await this.actor.update({ "system.expansionProjects": currentProjects });
  }

  async _onEditExpansionProject(event) {
    event.preventDefault();
    const index = parseInt(event.currentTarget.closest('.project-item').dataset.index);
    const currentProjects = foundry.utils.deepClone(this.actor.system.expansionProjects) || [];
    const dialogContent = await foundry.applications.handlebars.renderTemplate(
      "systems/cogwheel-syndicate/src/templates/add-project-dialog.hbs",
      { project: currentProjects[index] }
    );
    const result = await foundry.applications.api.DialogV2.wait({
      window: { title: game.i18n.localize("COGSYNDICATE.EditExpansionProject") },
      content: dialogContent,
      rejectClose: false,
      buttons: [
        { label: game.i18n.localize("COGSYNDICATE.Cancel"), action: "cancel" },
        {
          label: game.i18n.localize("COGSYNDICATE.Confirm"),
          action: "save",
          default: true,
          callback: (_event, _button, dialog) => {
            const name = dialog.element.querySelector('[name="name"]')?.value.trim() ?? "";
            const description = dialog.element.querySelector('[name="description"]')?.value.trim() ?? "";
            const effect = dialog.element.querySelector('[name="effect"]')?.value.trim() ?? "";
            if (!name || !effect) return null;
            return { name, description, effect };
          }
        }
      ]
    });
    if (!result) return;
    currentProjects[index] = result;
    await this.actor.update({ "system.expansionProjects": currentProjects });
  }

  async _onDeleteExpansionProject(event) {
    event.preventDefault();
    const index = parseInt(event.currentTarget.closest('.project-item').dataset.index);
    const currentProjects = foundry.utils.deepClone(this.actor.system.expansionProjects) || [];
    currentProjects.splice(index, 1);
    await this.actor.update({ "system.expansionProjects": currentProjects });
  }

  async _onIncreaseLevel(event) {
    event.preventDefault();
    const section = event.currentTarget.dataset.section;
    const currentSections = foundry.utils.deepClone(this.actor.system.primarySections) || {};
    const currentLevel = currentSections[section]?.level || 0;
    if (currentLevel < 3) {
      currentSections[section].level = currentLevel + 1;
      await this.actor.update({ "system.primarySections": currentSections });
    }
  }

  async _onDecreaseLevel(event) {
    event.preventDefault();
    const section = event.currentTarget.dataset.section;
    const currentSections = foundry.utils.deepClone(this.actor.system.primarySections) || {};
    const currentLevel = currentSections[section]?.level || 0;
    if (currentLevel > 0) {
      currentSections[section].level = currentLevel - 1;
      await this.actor.update({ "system.primarySections": currentSections });
    }
  }

  async _onToggleDestroyed(event) {
    const section = event.currentTarget.dataset.section;
    const isChecked = event.currentTarget.checked;
    const currentSections = foundry.utils.deepClone(this.actor.system.primarySections) || {};
    currentSections[section].isDestroyed = isChecked;
    await this.actor.update({ "system.primarySections": currentSections });
  }
}

// Rejestracja arkusza
foundry.documents.collections.Actors.registerSheet("cogwheel-syndicate", CogwheelHQSheet, {
  types: ["HQ"],
  makeDefault: true,
  label: "Cogwheel HQ Sheet"
});