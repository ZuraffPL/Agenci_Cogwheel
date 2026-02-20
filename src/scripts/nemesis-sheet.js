// Use HandlebarsApplicationMixin + ActorSheetV2 (ApplicationV2 framework)
class CogwheelNemesisSheet extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.sheets.ActorSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["cogwheel", "sheet", "actor", "nemesis"],
    position: { width: 700, height: 900 },
    window: { resizable: true },
    form: { submitOnChange: true }
  };

  static PARTS = {
    main: {
      template: "systems/cogwheel-syndicate/src/templates/nemesis-sheet.hbs"
    }
  };

  static tabGroups = {
    primary: "main"
  };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    context.actor = this.actor;
    context.system = this.actor.system;

    // Ustaw domyślny obrazek awatara, jeśli nie wybrano
    if (!context.actor.img || context.actor.img === "") {
      await this.actor.update({ img: "systems/cogwheel-syndicate/assets/default-nemesis.png" });
      context.actor.img = "systems/cogwheel-syndicate/assets/default-nemesis.png";
    }

    // Inicjalizacja danych nemezis, jeśli nie istnieją
    context.system.influenceRange = context.system.influenceRange || "Lokalny";
    context.system.organizationType = context.system.organizationType || "";
    context.system.leaderDescription = context.system.leaderDescription || "";
    context.system.organizationGoal = context.system.organizationGoal || "";
    context.system.notes = context.system.notes || "";
    context.system.minions = context.system.minions || [];

    // Inicjalizacja zegarów
    context.system.clocks = context.system.clocks || {};
    context.system.clocks.goal = context.system.clocks.goal || { value: 0, max: 8, description: "" };
    context.system.clocks.weakening = context.system.clocks.weakening || { value: 0, max: 4 };
    context.system.clocks.revenge = context.system.clocks.revenge || { value: 0, max: 6 };

    // Oblicz ilość przybocznych na podstawie zasięgu wpływów
    const minionsCount = this._getMinionsCount(context.system.influenceRange);
    context.minionsCount = minionsCount;

    // Aktualizuj rozmiary zegarów na podstawie zasięgu wpływów
    this._updateClockSizes(context.system);

    // Opcje zasięgu wpływów
    context.influenceOptions = [
      { value: "Lokalny", label: "Lokalny" },
      { value: "Międzynarodowy", label: "Międzynarodowy" },
      { value: "Globalny", label: "Globalny" }
    ];

    return context;
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

  _onRender(context, options) {
    const html = this.element;

    // Obsługa zmiany obrazka awatara
    html.querySelector('.profile-img')?.addEventListener('click', event => {
      const fp = new foundry.applications.apps.FilePicker({
        type: "image",
        current: this.actor.img,
        callback: path => { this.actor.update({ img: path }); },
        top: this.position.top + 40,
        left: this.position.left + 10
      });
      fp.browse();
    });

    // Obsługa zmiany zasięgu wpływów
    html.querySelector('.influence-range-select')?.addEventListener('change', this._onInfluenceRangeChange.bind(this));

    // Obsługa zegarów nemezis
    html.querySelectorAll('.increment-nemesis-clock').forEach(el => el.addEventListener('click', this._onIncrementNemesisClock.bind(this)));
    html.querySelectorAll('.decrement-nemesis-clock').forEach(el => el.addEventListener('click', this._onDecrementNemesisClock.bind(this)));

    // Obsługa przybocznych
    html.querySelector('.add-minion-btn')?.addEventListener('click', this._onAddMinion.bind(this));
    html.querySelectorAll('.edit-minion').forEach(el => el.addEventListener('click', this._onEditMinion.bind(this)));
    html.querySelectorAll('.delete-minion').forEach(el => el.addEventListener('click', this._onDeleteMinion.bind(this)));

    // Przywróć aktywną zakładkę po re-renderze
    for (const [group, activeTab] of Object.entries(this.tabGroups)) {
      html.querySelectorAll(`[data-group="${group}"][data-tab]`).forEach(el => {
        el.classList.toggle('active', el.dataset.tab === activeTab);
      });
    }
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

    const dialogContent = await foundry.applications.handlebars.renderTemplate(
      "systems/cogwheel-syndicate/src/templates/add-minion-dialog.hbs",
      { minion: { name: "", description: "", role: "" } }
    );

    await foundry.applications.api.DialogV2.wait({
      window: { title: "Dodaj Przybocznego" },
      content: dialogContent,
      rejectClose: false,
      buttons: [
        {
          action: "cancel",
          label: game.i18n.localize("COGSYNDICATE.Cancel"),
          callback: () => null
        },
        {
          action: "add",
          label: game.i18n.localize("COGSYNDICATE.Confirm"),
          default: true,
          callback: async (event, button) => {
            const form = button.form;
            const name = form.querySelector('[name="name"]').value.trim();
            const description = form.querySelector('[name="description"]').value.trim();
            const role = form.querySelector('[name="role"]').value.trim();

            if (!name) { ui.notifications.warn("Nazwa przybocznego jest wymagana."); return; }

            const currentMinions = foundry.utils.deepClone(this.actor.system.minions) || [];
            currentMinions.push({ name, description, role });
            await this.actor.update({ "system.minions": currentMinions });
          }
        }
      ]
    });
  }

  async _onEditMinion(event) {
    event.preventDefault();
    const index = parseInt(event.currentTarget.closest('.minion-item').dataset.index);
    const currentMinions = foundry.utils.deepClone(this.actor.system.minions) || [];
    const minion = currentMinions[index];

    const dialogContent = await foundry.applications.handlebars.renderTemplate(
      "systems/cogwheel-syndicate/src/templates/add-minion-dialog.hbs",
      { minion }
    );

    await foundry.applications.api.DialogV2.wait({
      window: { title: "Edytuj Przybocznego" },
      content: dialogContent,
      rejectClose: false,
      buttons: [
        {
          action: "cancel",
          label: game.i18n.localize("COGSYNDICATE.Cancel"),
          callback: () => null
        },
        {
          action: "save",
          label: game.i18n.localize("COGSYNDICATE.Confirm"),
          default: true,
          callback: async (event, button) => {
            const form = button.form;
            const name = form.querySelector('[name="name"]').value.trim();
            const description = form.querySelector('[name="description"]').value.trim();
            const role = form.querySelector('[name="role"]').value.trim();

            if (!name) { ui.notifications.warn("Nazwa przybocznego jest wymagana."); return; }

            currentMinions[index] = { name, description, role };
            await this.actor.update({ "system.minions": currentMinions });
          }
        }
      ]
    });
  }

  async _onDeleteMinion(event) {
    event.preventDefault();
    const index = parseInt(event.currentTarget.closest('.minion-item').dataset.index);
    const currentMinions = foundry.utils.deepClone(this.actor.system.minions) || [];
    currentMinions.splice(index, 1);
    await this.actor.update({ "system.minions": currentMinions });
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

// Rejestracja arkusza (ApplicationV2)
foundry.documents.collections.Actors.registerSheet("cogwheel-syndicate", CogwheelNemesisSheet, {
  types: ["nemesis"],
  makeDefault: true,
  label: "Cogwheel Nemesis Sheet"
});