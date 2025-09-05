export class DoomClocksDialog extends Application {
  constructor(options = {}) {
    super(options);
    // Odczyt zegarów z ustawień świata
    this.clocks = game.settings.get("cogwheel-syndicate", "doomClocks") || [];
    // Zachowaj aktualną kategorię między renderowaniami
    this.activeCategory = 'mission';
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "doom-clocks-dialog",
      title: game.i18n.localize("COGSYNDICATE.DoomClocksTitle"),
      template: "systems/cogwheel-syndicate/src/templates/doom-clocks-dialog.hbs",
      width: 500,
      height: "auto",
      left: 20,
      top: 20,
      resizable: true,
      classes: ["cogwheel", "doom-clocks"]
    });
  }

  getData() {
    // Migracj starych zegarów - dodaj kategorię "mission" jeśli nie ma
    const migratedClocks = this.clocks.map(clock => {
      if (!clock.category) {
        console.log(`Migrating clock "${clock.name}" to mission category`);
        clock.category = 'mission';
      }
      return clock;
    });
    
    // Debug: pokaż wszystkie zegary i ich kategorie
    console.log('Clock categories:', migratedClocks.map(c => ({name: c.name, category: c.category})));
    console.log(`getData() - returning activeCategory: ${this.activeCategory}`); // Debug aktywnej kategorii
    
    // Zapisz zmiany jeśli dokonano migracji
    if (migratedClocks.some((clock, index) => !this.clocks[index].category)) {
      this.clocks = migratedClocks;
      this._updateClocks(); // Zapisz do ustawień
    }
    
    return {
      clocks: migratedClocks,
      isGM: game.user.isGM,
      activeCategory: this.activeCategory
    };
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Debug: sprawdź początkowy stan
    const container = html.find('.doom-clocks-content');
    // Użyj aktualnej wartości this.activeCategory zamiast zawsze defaultować do mission
    console.log(`Initial active category: ${this.activeCategory}`);
    
    // Debug: sprawdź wszystkie zegary i ich kategorie w DOM
    console.log(`Total clock items found: ${html.find('.clock-item').length}`);
    html.find('.clock-item').each(function() {
      const category = $(this).attr('data-category');
      const name = $(this).find('.clock-name').text();
      const isVisible = $(this).is(':visible');
      const displayStyle = $(this).css('display');
      console.log(`Clock "${name}" - category: ${category}, visible: ${isVisible}, display: ${displayStyle}`);
    });

    // Obsługa zakładek kategorii
    html.find(".tab-btn").click(this._onTabChange.bind(this));

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
        element.style.left = '20px';
        element.style.top = '20px';
      }
    }
  }

  async _onAddClock(event) {
    event.preventDefault();
    
    // Pobierz aktualnie aktywną kategorię z instancji
    const activeCategory = this.activeCategory || 'mission';
    
    console.log(`Adding clock to category: ${activeCategory}`); // Debug
    
    const dialogContent = await renderTemplate(
      "systems/cogwheel-syndicate/src/templates/add-clock-dialog.hbs",
      { clock: { name: "", description: "", max: 4, category: activeCategory } }
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
            const category = html.find('[name="category"]').val() || activeCategory;

            console.log(`Form values - name: "${name}", category: "${category}", activeCategory fallback: "${activeCategory}"`);

            if (!name) {
              ui.notifications.warn(game.i18n.localize("COGSYNDICATE.ClockNameRequired"));
              return;
            }

            const newClock = { 
              name, 
              description, 
              value: 0, 
              max: Math.clamp(max, 2, 12),
              category: category 
            };
            
            console.log(`Creating clock:`, newClock);
            this.clocks.push(newClock);
            console.log(`Total clocks after add:`, this.clocks.length);
            console.log(`Added clock "${newClock.name}" to category "${newClock.category}"`);
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
    console.log(`Updating clocks - total count: ${this.clocks.length}`);
    console.log(`Clock categories:`, this.clocks.map(c => ({name: c.name, category: c.category})));
    console.log(`Current activeCategory before render: ${this.activeCategory}`);
    
    // Zapis zegarów do ustawień świata
    await game.settings.set("cogwheel-syndicate", "doomClocks", this.clocks);
    
    // Wysłanie aktualizacji przez socket do wszystkich użytkowników
    await game.socket.emit("system.cogwheel-syndicate", {
      type: "updateClocks",
      clocks: this.clocks
    });

    // Wywołanie hooka lokalnie
    Hooks.call("cogwheelSyndicateClocksUpdated");
    
    // Odświeżenie bieżącego okna - zachowaj aktywną kategorię
    const currentCategory = this.activeCategory;
    this.render(true);
    
    // Po renderowaniu, przywróć aktywną kategorię
    setTimeout(() => {
      if (currentCategory !== 'mission') {
        console.log(`Restoring category to: ${currentCategory}`);
        this.activeCategory = currentCategory;
        
        // Znajdź i kliknij właściwą zakładkę aby przełączyć widok
        const targetTab = this.element.find(`.tab-btn[data-category="${currentCategory}"]`);
        if (targetTab.length > 0) {
          // Wywołaj _onTabChange aby rzeczywiście przełączyć widok
          const fakeEvent = { 
            currentTarget: targetTab[0],
            preventDefault: () => {} // Empty function to prevent errors
          };
          this._onTabChange(fakeEvent);
        }
      }
    }, 100);
  }

  // Metoda do aktualizacji lokalnych zegarów w instancji dialogu
  updateClocks(clocks) {
    this.clocks = clocks;
    this.render(true);
  }

  // Obsługa zmiany zakładek kategorii
  _onTabChange(event) {
    const isProgrammatic = event.currentTarget && event.currentTarget.tagName === undefined;
    console.log(`_onTabChange called - programmatic: ${isProgrammatic}`);
    
    // Bezpiecznie wywołaj preventDefault tylko jeśli metoda istnieje
    if (event.preventDefault) {
      event.preventDefault();
    }
    
    const button = event.currentTarget;
    const category = button.dataset.category;
    
    console.log(`Switching to category: ${category}`); // Debug
    
    // Zapisz aktywną kategorię w instancji
    this.activeCategory = category;
    console.log(`this.activeCategory set to: ${this.activeCategory}`); // Debug
    
    // Usuń klasę active z wszystkich przycisków
    const tabs = this.element.find('.tab-btn');
    tabs.removeClass('active');
    
    // Dodaj klasę active do klikniętego przycisku
    button.classList.add('active');
    
    // Zaktualizuj atrybut kategorii kontenera
    const container = this.element.find('.doom-clocks-content');
    container.attr('data-active-category', category);
    
    console.log(`Container category set to: ${container.attr('data-active-category')}`); // Debug
    
    // Debug: sprawdź które zegary są teraz widoczne
    setTimeout(() => {
      this.element.find('.clock-item').each(function() {
        const itemCategory = $(this).attr('data-category');
        const name = $(this).find('.clock-name').text();
        const isVisible = $(this).is(':visible');
        console.log(`After switch - Clock "${name}" (${itemCategory}): visible = ${isVisible}`);
      });
    }, 100);
    
    // Zaktualizuj przycisk "Dodaj zegar" aby dodawał do aktywnej kategorii
    this.element.find('.add-clock').attr('data-category', category);
  }
}

export function openDoomClocks() {
  const dialog = new DoomClocksDialog();
  
  // Ustaw pozycję w lewym górnym rogu
  dialog.options.left = 20;
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