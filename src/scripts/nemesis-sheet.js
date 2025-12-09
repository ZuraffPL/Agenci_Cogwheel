// Use foundry.appv1 namespace to avoid deprecation warnings
class CogwheelNemesisSheet extends foundry.appv1.sheets.ActorSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      template: "systems/cogwheel-syndicate/src/templates/nemesis-sheet.hbs",
      classes: ["cogwheel", "sheet", "actor", "nemesis"],
      width: 700,
      height: 900,
      submitOnChange: true,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-content", initial: "main" }]
    });
  }

  getData() {
    const data = super.getData();
    data.system = data.actor.system;

    // Ustaw domyślny obrazek awatara, jeśli nie wybrano
    if (!data.actor.img || data.actor.img === "") {
      data.actor.img = "systems/cogwheel-syndicate/assets/default-nemesis.png";
    }

    // Inicjalizacja danych nemezis, jeśli nie istnieją
    data.system.influenceRange = data.system.influenceRange || "Lokalny";
    data.system.organizationType = data.system.organizationType || "";
    data.system.leaderDescription = data.system.leaderDescription || "";
    data.system.organizationGoal = data.system.organizationGoal || "";
    data.system.notes = data.system.notes || "";
    data.system.minions = data.system.minions || [];

    // Inicjalizacja zegarów
    data.system.clocks = data.system.clocks || {};
    data.system.clocks.goal = data.system.clocks.goal || { value: 0, max: 8, description: "" };
    data.system.clocks.weakening = data.system.clocks.weakening || { value: 0, max: 4 };
    data.system.clocks.revenge = data.system.clocks.revenge || { value: 0, max: 6 };

    // Oblicz ilość przybocznych na podstawie zasięgu wpływów
    const minionsCount = this._getMinionsCount(data.system.influenceRange);
    data.minionsCount = minionsCount;

    // Aktualizuj rozmiary zegarów na podstawie zasięgu wpływów
    this._updateClockSizes(data.system);

    // Opcje zasięgu wpływów
    data.influenceOptions = [
      { value: "Lokalny", label: "Lokalny" },
      { value: "Międzynarodowy", label: "Międzynarodowy" },
      { value: "Globalny", label: "Globalny" }
    ];

    return data;
  }

  _getMinionsCount(influenceRange) {
    switch (influenceRange) {
      case "Lokalny": return 2;
      case "Międzynarodowy": return 4;
      case "Globalny": return 6;
      default: return 2;
    }
  }

  _updateClockSizes(system) {
    const influenceRange = system.influenceRange || "Lokalny";
    const minionsCount = this._getMinionsCount(influenceRange);

    // Ustaw rozmiar zegara celu na podstawie zasięgu wpływów
    switch (influenceRange) {
      case "Lokalny":
        system.clocks.goal.max = 8;
        break;
      case "Międzynarodowy":
        system.clocks.goal.max = 10;
        break;
      case "Globalny":
        system.clocks.goal.max = 12;
        break;
    }

    // Ustaw rozmiar zegara osłabienia (Przyboczni x 2)
    system.clocks.weakening.max = minionsCount * 2;

    // Ustaw rozmiar zegara odwetu (Rozmiar zegara celu - 2)
    system.clocks.revenge.max = system.clocks.goal.max - 2;

    // Upewnij się, że wartości nie przekraczają maksymalnych
    system.clocks.goal.value = Math.min(system.clocks.goal.value, system.clocks.goal.max);
    system.clocks.weakening.value = Math.min(system.clocks.weakening.value, system.clocks.weakening.max);
    system.clocks.revenge.value = Math.min(system.clocks.revenge.value, system.clocks.revenge.max);
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Obsługa zmiany obrazka awatara
    html[0].querySelector('.profile-img').addEventListener('click', event => {
      const fp = new FilePicker({
        type: "image",
        current: this.actor.img,
        callback: path => {
          this.actor.update({ img: path });
        },
        top: this.position.top + 40,
        left: this.position.left + 10
      });
      fp.browse();
    });

    // Obsługa zmiany zasięgu wpływów
    html[0].querySelector('.influence-range-select').addEventListener('change', this._onInfluenceRangeChange.bind(this));

    // Obsługa zegarów nemezis
    html[0].querySelector('.increment-nemesis-clock').addEventListener('click', this._onIncrementNemesisClock.bind(this));
    html[0].querySelector('.decrement-nemesis-clock').addEventListener('click', this._onDecrementNemesisClock.bind(this));

    // Obsługa przybocznych
    html[0].querySelector('.add-minion-btn').addEventListener('click', this._onAddMinion.bind(this));
    html[0].querySelectorAll('.edit-minion').forEach(el => el.addEventListener('click', this._onEditMinion.bind(this)));
    html[0].querySelectorAll('.delete-minion').forEach(el => el.addEventListener('click', this._onDeleteMinion.bind(this)));
  }

  async _onInfluenceRangeChange(event) {
    const newRange = event.currentTarget.value;
    const currentSystem = foundry.utils.deepClone(this.actor.system);
    currentSystem.influenceRange = newRange;

    // Aktualizuj rozmiary zegarów
    this._updateClockSizes(currentSystem);

    await this.actor.update({ system: currentSystem });
    this.render();
  }

  async _onIncrementNemesisClock(event) {
    event.preventDefault();
    const clockType = event.currentTarget.dataset.clock;
    const currentSystem = foundry.utils.deepClone(this.actor.system);
    const clock = currentSystem.clocks[clockType];

    if (clock.value < clock.max) {
      clock.value += 1;
      await this.actor.update({ system: currentSystem });

      if (clock.value === clock.max) {
        const clockNames = {
          goal: "Zegar Celu Nemezis",
          weakening: "Zegar Osłabienia",
          revenge: "Zegar Odwetu"
        };

        await ChatMessage.create({
          content: `<p><strong>${clockNames[clockType]}</strong>: ${game.i18n.localize("COGSYNDICATE.ClockCompleted")}</p>`,
          speaker: { alias: "Nemezis Clocks" }
        });
      }
    }
  }

  async _onDecrementNemesisClock(event) {
    event.preventDefault();
    const clockType = event.currentTarget.dataset.clock;
    const currentSystem = foundry.utils.deepClone(this.actor.system);
    const clock = currentSystem.clocks[clockType];

    if (clock.value > 0) {
      clock.value -= 1;
      await this.actor.update({ system: currentSystem });
    }
  }

  async _onAddMinion(event) {
    event.preventDefault();

    const dialogContent = await renderTemplate(
      "systems/cogwheel-syndicate/src/templates/add-minion-dialog.hbs",
      { minion: { name: "", description: "", role: "" } }
    );

    new Dialog({
      title: "Dodaj Przybocznego",
      content: dialogContent,
      buttons: {
        cancel: {
          label: game.i18n.localize("COGSYNDICATE.Cancel"),
          callback: () => {}
        },
        add: {
          label: game.i18n.localize("COGSYNDICATE.Confirm"),
          callback: async (html) => {
            const name = html[0].querySelector('[name="name"]').value.trim();
            const description = html[0].querySelector('[name="description"]').value.trim();
            const role = html[0].querySelector('[name="role"]').value.trim();

            if (!name) {
              ui.notifications.warn("Nazwa przybocznego jest wymagana.");
              return;
            }

            const currentMinions = foundry.utils.deepClone(this.actor.system.minions) || [];
            currentMinions.push({ name, description, role });
            await this.actor.update({ "system.minions": currentMinions });
            this.render();
          }
        }
      },
      default: "add",
      width: 400
    }).render(true);
  }

  async _onEditMinion(event) {
    event.preventDefault();
    const index = parseInt(event.currentTarget.closest('.minion-item').dataset.index);
    const currentMinions = foundry.utils.deepClone(this.actor.system.minions) || [];
    const minion = currentMinions[index];

    const dialogContent = await renderTemplate(
      "systems/cogwheel-syndicate/src/templates/add-minion-dialog.hbs",
      { minion }
    );

    new Dialog({
      title: "Edytuj Przybocznego",
      content: dialogContent,
      buttons: {
        cancel: {
          label: game.i18n.localize("COGSYNDICATE.Cancel"),
          callback: () => {}
        },
        save: {
          label: game.i18n.localize("COGSYNDICATE.Confirm"),
          callback: async (html) => {
            const name = html[0].querySelector('[name="name"]').value.trim();
            const description = html[0].querySelector('[name="description"]').value.trim();
            const role = html[0].querySelector('[name="role"]').value.trim();

            if (!name) {
              ui.notifications.warn("Nazwa przybocznego jest wymagana.");
              return;
            }

            currentMinions[index] = { name, description, role };
            await this.actor.update({ "system.minions": currentMinions });
            this.render();
          }
        }
      },
      default: "save",
      width: 400
    }).render(true);
  }

  async _onDeleteMinion(event) {
    event.preventDefault();
    const index = parseInt(event.currentTarget.closest('.minion-item').dataset.index);
    const currentMinions = foundry.utils.deepClone(this.actor.system.minions) || [];
    currentMinions.splice(index, 1);
    await this.actor.update({ "system.minions": currentMinions });
    this.render();
  }

  async _onCreate(data, options, userId) {
    await super._onCreate(data, options, userId);
    
    if (game.userId === userId) {
      await this.actor.update({
        "name": "Nemezis",
        "system.influenceRange": "Lokalny",
        "system.clocks.goal.max": 8,
        "system.clocks.weakening.max": 4,
        "system.clocks.revenge.max": 6
      });
    }
  }
}

// Foundry v13 compatibility for registration - use same pattern as chlopcy-rpg
const CHLOPCYCONFIG_NEMESIS = {
  Actors: typeof foundry?.documents?.collections?.Actors !== "undefined" 
    ? foundry.documents.collections.Actors 
    : Actors,
  ActorSheet: typeof foundry?.appv1?.sheets?.ActorSheet !== "undefined"
    ? foundry.appv1.sheets.ActorSheet
    : ActorSheet
};

// Rejestracja arkusza z kompatybilnością
CHLOPCYCONFIG_NEMESIS.Actors.registerSheet("cogwheel-syndicate", CogwheelNemesisSheet, {
  types: ["nemesis"],
  makeDefault: true,
  label: "Cogwheel Nemesis Sheet"
});