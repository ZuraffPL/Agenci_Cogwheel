import { registerHandlebarsHelpers } from "./handlebars.mjs";

class CogwheelHQSheet extends ActorSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      template: "systems/cogwheel-syndicate/src/templates/hq-sheet.hbs",
      classes: ["cogwheel", "sheet", "actor", "hq"],
      width: 700,
      height: 900,
      submitOnChange: true,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-content", initial: "primary-locations" }]
    });
  }

  getData() {
    const data = super.getData();
    data.system = data.actor.system;

    // Ustaw domyślny obrazek awatara, jeśli nie wybrano
    if (!data.actor.img || data.actor.img === "") {
      data.actor.img = "systems/foundryvtt/assets/mystery-man.svg";
    }

    // Inicjalizacja list, jeśli nie istnieją
    data.system.locationsPrimary = data.system.locationsPrimary || [];
    data.system.locationsAdditional = data.system.locationsAdditional || [];
    data.system.expansionProjects = data.system.expansionProjects || [];

    // Inicjalizacja sekcji podstawowych, jeśli nie istnieją
    data.system.primarySections = data.system.primarySections || {
      infirmary: { level: 0, isDestroyed: false },
      crewQuarters: { level: 0, isDestroyed: false },
      trainingHalls: { level: 0, isDestroyed: false },
      workshop: { level: 0, isDestroyed: false }
    };

    return data;
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Obsługa zmiany obrazka awatara
    html[0].querySelector('.profile-img').addEventListener('click', event => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
          const img = await this._onImageUpload(file);
          await this.actor.update({ "img": img });
        }
      };
      input.click();
    });

    // Obsługa dodawania lokacji
    html[0].querySelector('.add-location-btn').addEventListener('click', this._onAddLocation.bind(this));

    // Obsługa edycji lokacji
    html[0].querySelectorAll('.edit-location').forEach(el => el.addEventListener('click', this._onEditLocation.bind(this)));

    // Obsługa usuwania lokacji
    html[0].querySelectorAll('.delete-location').forEach(el => el.addEventListener('click', this._onDeleteLocation.bind(this)));

    // Obsługa dodawania projektu rozbudowy
    html[0].querySelector('.add-project-btn').addEventListener('click', this._onAddExpansionProject.bind(this));

    // Obsługa edycji projektu rozbudowy
    html[0].querySelectorAll('.edit-project').forEach(el => el.addEventListener('click', this._onEditExpansionProject.bind(this)));

    // Obsługa usuwania projektu rozbudowy
    html[0].querySelectorAll('.delete-project').forEach(el => el.addEventListener('click', this._onDeleteExpansionProject.bind(this)));

    // Obsługa zwiększania poziomu sekcji
    html[0].querySelectorAll('.increase-level').forEach(el => el.addEventListener('click', this._onIncreaseLevel.bind(this)));

    // Obsługa zmniejszania poziomu sekcji
    html[0].querySelectorAll('.decrease-level').forEach(el => el.addEventListener('click', this._onDecreaseLevel.bind(this)));

    // Obsługa checkboxa "Lokacja zniszczona"
    html.find('.destroyed-checkbox').change(this._onToggleDestroyed.bind(this));
  }

  async _onImageUpload(file) {
    const uploadResponse = await FilePicker.upload("data", "", file);
    return uploadResponse.path; // Zwraca ścieżkę do przesłanego obrazu
  }

  async _onAddLocation(event) {
    event.preventDefault();

    // Dane dla szablonu
    const templateData = {
      location: { name: "", description: "", effect: "" }
    };

    // Renderowanie szablonu
    const dialogContent = await renderTemplate("systems/cogwheel-syndicate/src/templates/add-location-dialog.hbs", templateData);

    new Dialog({
      title: game.i18n.localize("COGSYNDICATE.AddLocation"),
      content: dialogContent,
      buttons: {
        cancel: {
          label: game.i18n.localize("COGSYNDICATE.Cancel"),
          callback: () => {}
        },
        add: {
          label: game.i18n.localize("COGSYNDICATE.Confirm"),
          callback: async (html) => {
            const locationName = html.find('[name="name"]').val().trim();
            const locationDescription = html.find('[name="description"]').val().trim();
            const locationEffect = html.find('[name="effect"]').val().trim();

            // Walidacja: Nazwa i Efekt są wymagane, Opis jest opcjonalny
            if (!locationName || !locationEffect) {
              html.find('.error-message').show();
              return;
            }

            const newLocation = {
              name: locationName,
              description: locationDescription || "", // Opis może być pusty
              effect: locationEffect
            };
            const currentLocations = foundry.utils.deepClone(this.actor.system.locationsAdditional) || [];
            currentLocations.push(newLocation);
            await this.actor.update({ "system.locationsAdditional": currentLocations });
            this.render();
          }
        }
      },
      default: "add",
      width: 400
    }).render(true);
  }

  async _onEditLocation(event) {
    event.preventDefault();
    const index = parseInt(event.currentTarget.closest('.location-item').dataset.index);
    const currentLocations = foundry.utils.deepClone(this.actor.system.locationsAdditional) || [];
    const location = currentLocations[index];

    // Dane dla szablonu
    const templateData = {
      location: location
    };

    // Renderowanie szablonu
    const dialogContent = await renderTemplate("systems/cogwheel-syndicate/src/templates/add-location-dialog.hbs", templateData);

    new Dialog({
      title: game.i18n.localize("COGSYNDICATE.EditLocation"),
      content: dialogContent,
      buttons: {
        cancel: {
          label: game.i18n.localize("COGSYNDICATE.Cancel"),
          callback: () => {}
        },
        save: {
          label: game.i18n.localize("COGSYNDICATE.Confirm"),
          callback: async (html) => {
            const locationName = html.find('[name="name"]').val().trim();
            const locationDescription = html.find('[name="description"]').val().trim();
            const locationEffect = html.find('[name="effect"]').val().trim();

            // Walidacja: Nazwa i Efekt są wymagane, Opis jest opcjonalny
            if (!locationName || !locationEffect) {
              html.find('.error-message').show();
              return;
            }

            // Aktualizacja lokacji
            currentLocations[index] = {
              name: locationName,
              description: locationDescription || "", // Opis może być pusty
              effect: locationEffect
            };
            await this.actor.update({ "system.locationsAdditional": currentLocations });
            this.render();
          }
        }
      },
      default: "save",
      width: 400
    }).render(true);
  }

  async _onDeleteLocation(event) {
    event.preventDefault();
    const index = parseInt(event.currentTarget.closest('.location-item').dataset.index);
    const currentLocations = foundry.utils.deepClone(this.actor.system.locationsAdditional) || [];
    currentLocations.splice(index, 1);
    await this.actor.update({ "system.locationsAdditional": currentLocations });
    this.render();
  }

  async _onAddExpansionProject(event) {
    event.preventDefault();

    // Dane dla szablonu
    const templateData = {
      project: { name: "", description: "", effect: "" }
    };

    // Renderowanie szablonu
    const dialogContent = await renderTemplate("systems/cogwheel-syndicate/src/templates/add-project-dialog.hbs", templateData);

    new Dialog({
      title: game.i18n.localize("COGSYNDICATE.AddExpansionProject"),
      content: dialogContent,
      buttons: {
        cancel: {
          label: game.i18n.localize("COGSYNDICATE.Cancel"),
          callback: () => {}
        },
        add: {
          label: game.i18n.localize("COGSYNDICATE.Confirm"),
          callback: async (html) => {
            const projectName = html.find('[name="name"]').val().trim();
            const projectDescription = html.find('[name="description"]').val().trim();
            const projectEffect = html.find('[name="effect"]').val().trim();

            // Walidacja: Nazwa i Efekt są wymagane, Opis jest opcjonalny
            if (!projectName || !projectEffect) {
              html.find('.error-message').show();
              return;
            }

            const newProject = {
              name: projectName,
              description: projectDescription || "", // Opis może być pusty
              effect: projectEffect
            };
            const currentProjects = foundry.utils.deepClone(this.actor.system.expansionProjects) || [];
            currentProjects.push(newProject);
            await this.actor.update({ "system.expansionProjects": currentProjects });
            this.render();
          }
        }
      },
      default: "add",
      width: 400
    }).render(true);
  }

  async _onEditExpansionProject(event) {
    event.preventDefault();
    const index = parseInt(event.currentTarget.closest('.project-item').dataset.index);
    const currentProjects = foundry.utils.deepClone(this.actor.system.expansionProjects) || [];
    const project = currentProjects[index];

    // Dane dla szablonu
    const templateData = {
      project: project
    };

    // Renderowanie szablonu
    const dialogContent = await renderTemplate("systems/cogwheel-syndicate/src/templates/add-project-dialog.hbs", templateData);

    new Dialog({
      title: game.i18n.localize("COGSYNDICATE.EditExpansionProject"),
      content: dialogContent,
      buttons: {
        cancel: {
          label: game.i18n.localize("COGSYNDICATE.Cancel"),
          callback: () => {}
        },
        save: {
          label: game.i18n.localize("COGSYNDICATE.Confirm"),
          callback: async (html) => {
            const projectName = html.find('[name="name"]').val().trim();
            const projectDescription = html.find('[name="description"]').val().trim();
            const projectEffect = html.find('[name="effect"]').val().trim();

            // Walidacja: Nazwa i Efekt są wymagane, Opis jest opcjonalny
            if (!projectName || !projectEffect) {
              html.find('.error-message').show();
              return;
            }

            // Aktualizacja projektu
            currentProjects[index] = {
              name: projectName,
              description: projectDescription || "", // Opis może być pusty
              effect: projectEffect
            };
            await this.actor.update({ "system.expansionProjects": currentProjects });
            this.render();
          }
        }
      },
      default: "save",
      width: 400
    }).render(true);
  }

  async _onDeleteExpansionProject(event) {
    event.preventDefault();
    const index = parseInt(event.currentTarget.closest('.project-item').dataset.index);
    const currentProjects = foundry.utils.deepClone(this.actor.system.expansionProjects) || [];
    currentProjects.splice(index, 1);
    await this.actor.update({ "system.expansionProjects": currentProjects });
    this.render();
  }

  async _onIncreaseLevel(event) {
    event.preventDefault();
    const section = event.currentTarget.dataset.section;
    const currentSections = foundry.utils.deepClone(this.actor.system.primarySections) || {};
    const currentLevel = currentSections[section]?.level || 0;

    if (currentLevel < 3) {
      currentSections[section].level = currentLevel + 1;
      await this.actor.update({ "system.primarySections": currentSections });
      this.render();
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
      this.render();
    }
  }

  async _onToggleDestroyed(event) {
    event.preventDefault();
    const section = event.currentTarget.dataset.section;
    const isChecked = event.currentTarget.checked;
    const currentSections = foundry.utils.deepClone(this.actor.system.primarySections) || {};

    currentSections[section].isDestroyed = isChecked;
    await this.actor.update({ "system.primarySections": currentSections });
    this.render();
  }

  async _onCreate(data, options, userId) {
    await super._onCreate(data, options, userId);

    const updates = {
      "img": "systems/foundryvtt/assets/mystery-man.svg", // Domyślny obrazek
      "system.locationsPrimary": [],
      "system.locationsAdditional": [],
      "system.expansionProjects": [],
      "system.primarySections": {
        infirmary: { level: 0, isDestroyed: false },
        crewQuarters: { level: 0, isDestroyed: false },
        trainingHalls: { level: 0, isDestroyed: false },
        workshop: { level: 0, isDestroyed: false }
      }
    };

    await this.actor.update(updates);
  }
}

Actors.registerSheet("cogwheel-syndicate", CogwheelHQSheet, {
  types: ["HQ"],
  makeDefault: true,
  label: "Cogwheel HQ Sheet"
});