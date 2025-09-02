export class DoomClocksDialog extends Application {
  constructor(options = {}) {
    super(options);
    // Odczyt zegarów z ustawień świata
    this.clocks = game.settings.get("cogwheel-syndicate", "doomClocks") || [];
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "doom-clocks-dialog",
      title: game.i18n.localize("COGSYNDICATE.DoomClocksTitle"),
      template: "systems/cogwheel-syndicate/src/templates/doom-clocks-dialog.hbs",
      width: 500,
      height: "auto",
      left: window.innerWidth - 520,
      top: 20,
      resizable: true,
      classes: ["cogwheel", "doom-clocks"]
    });
  }

  getData() {
    return {
      clocks: this.clocks,
      isGM: game.user.isGM
    };
  }

  activateListeners(html) {
    super.activateListeners(html);

    if (game.user.isGM) {
      html.find(".add-clock").click(this._onAddClock.bind(this));
      html.find(".increment-clock").click(this._onIncrementClock.bind(this));
      html.find(".decrement-clock").click(this._onDecrementClock.bind(this));
      html.find(".edit-clock").click(this._onEditClock.bind(this));
      html.find(".delete-clock").click(this._onDeleteClock.bind(this));
    }

    // Ustaw pozycję w prawym górnym rogu po wyrenderowaniu
    this._updatePosition();
  }

  _updatePosition() {
    if (this.element && this.element.length > 0) {
      const element = this.element[0];
      if (element) {
        element.style.left = `${window.innerWidth - 520}px`;
        element.style.top = '20px';
      }
    }
  }

  async _onAddClock(event) {
    event.preventDefault();
    const dialogContent = await renderTemplate(
      "systems/cogwheel-syndicate/src/templates/add-clock-dialog.hbs",
      { clock: { name: "", description: "", max: 4 } }
    );

    new Dialog({
      title: game.i18n.localize("COGSYNDICATE.AddDoomClock"),
      content: dialogContent,
      buttons: {
        cancel: {
          label: game.i18n.localize("COGSYNDICATE.Cancel"),
          callback: () => {}
        },
        add: {
          label: game.i18n.localize("COGSYNDICATE.Confirm"),
          callback: async (html) => {
            const name = html.find('[name="name"]').val().trim();
            const description = html.find('[name="description"]').val().trim();
            const max = parseInt(html.find('[name="max"]').val()) || 4;

            if (!name) {
              ui.notifications.warn(game.i18n.localize("COGSYNDICATE.ClockNameRequired"));
              return;
            }

            const newClock = { name, description, value: 0, max: Math.clamp(max, 2, 12) };
            this.clocks.push(newClock);
            await this._updateClocks();
          }
        }
      },
      default: "add"
    }).render(true);
  }

  async _onEditClock(event) {
    event.preventDefault();
    const index = parseInt(event.currentTarget.closest(".clock-item").dataset.index);
    const clock = this.clocks[index];

    const dialogContent = await renderTemplate(
      "systems/cogwheel-syndicate/src/templates/add-clock-dialog.hbs",
      { clock }
    );

    new Dialog({
      title: game.i18n.localize("COGSYNDICATE.EditDoomClock"),
      content: dialogContent,
      buttons: {
        cancel: {
          label: game.i18n.localize("COGSYNDICATE.Cancel"),
          callback: () => {}
        },
        save: {
          label: game.i18n.localize("COGSYNDICATE.Confirm"),
          callback: async (html) => {
            const name = html.find('[name="name"]').val().trim();
            const description = html.find('[name="description"]').val().trim();
            const max = parseInt(html.find('[name="max"]').val()) || clock.max;

            if (!name) {
              ui.notifications.warn(game.i18n.localize("COGSYNDICATE.ClockNameRequired"));
              return;
            }

            this.clocks[index] = {
              name,
              description,
              value: Math.min(clock.value, max),
              max: Math.clamp(max, 2, 12)
            };
            await this._updateClocks();
          }
        }
      },
      default: "save"
    }).render(true);
  }

  async _onIncrementClock(event) {
    event.preventDefault();
    const index = parseInt(event.currentTarget.closest(".clock-item").dataset.index);
    const clock = this.clocks[index];
    if (clock.value < clock.max) {
      clock.value += 1;
      await this._updateClocks();
      if (clock.value === clock.max) {
        await ChatMessage.create({
          content: `<p><strong>${clock.name}</strong>: ${game.i18n.localize("COGSYNDICATE.ClockCompleted")}</p>`,
          speaker: { alias: "Doom Clocks" }
        });
      }
    }
  }

  async _onDecrementClock(event) {
    event.preventDefault();
    const index = parseInt(event.currentTarget.closest(".clock-item").dataset.index);
    const clock = this.clocks[index];
    if (clock.value > 0) {
      clock.value -= 1;
      await this._updateClocks();
    }
  }

  async _onDeleteClock(event) {
    event.preventDefault();
    const index = parseInt(event.currentTarget.closest(".clock-item").dataset.index);
    this.clocks.splice(index, 1);
    await this._updateClocks();
  }

  async _updateClocks() {
    // Zapis zegarów do ustawień świata
    await game.settings.set("cogwheel-syndicate", "doomClocks", this.clocks);
    
    // Wysłanie aktualizacji przez socket do wszystkich użytkowników
    await game.socket.emit("system.cogwheel-syndicate", {
      type: "updateClocks",
      clocks: this.clocks
    });

    // Wywołanie hooka lokalnie
    Hooks.call("cogwheelSyndicateClocksUpdated");
    
    // Odświeżenie bieżącego okna
    this.render(true);
  }

  // Metoda do aktualizacji lokalnych zegarów w instancji dialogu
  updateClocks(clocks) {
    this.clocks = clocks;
    this.render(true);
  }
}

export function openDoomClocks() {
  const dialog = new DoomClocksDialog();
  
  // Ustaw pozycję w prawym górnym rogu
  dialog.options.left = window.innerWidth - 520;
  dialog.options.top = 20;
  
  dialog.render(true);
}

// Hook do odświeżania otwartych okien dialogowych zegarów
Hooks.on("cogwheelSyndicateClocksUpdated", () => {
  for (let appId in ui.windows) {
    const window = ui.windows[appId];
    if (window instanceof DoomClocksDialog) {
      // Aktualizacja lokalnej kopii zegarów w instancji dialogu
      window.clocks = game.settings.get("cogwheel-syndicate", "doomClocks") || [];
      window.render(true);
    }
  }
});

// Nasłuchiwanie na aktualizacje zegarów przez socket
Hooks.once("setup", () => {
  game.socket.on("system.cogwheel-syndicate", async (data) => {
    if (data.type === "updateClocks") {
      try {
        // Aktualizacja zegarów w ustawieniach świata
        await game.settings.set("cogwheel-syndicate", "doomClocks", data.clocks);
        // Wywołanie hooka, który odświeży wszystkie otwarte okna dialogowe
        Hooks.call("cogwheelSyndicateClocksUpdated");
      } catch (error) {
        console.error("Błąd podczas aktualizacji zegarów przez socket:", error);
      }
    }
  });
});