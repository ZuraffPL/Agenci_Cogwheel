export class DoomClocksDialog extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2) {
  constructor(options = {}) {
    super(options);
    // Odczyt zegarów z ustawień świata
    this.clocks = game.settings.get("cogwheel-syndicate", "doomClocks") || [];
    // Zachowaj aktualną kategorię między renderowaniami
    this.activeCategory = 'mission';
  }

  static DEFAULT_OPTIONS = {
    id: "doom-clocks-dialog",
    tag: "div",
    window: {
      title: "COGSYNDICATE.DoomClocksTitle",
      icon: "fas fa-clock",
      resizable: true
    },
    position: {
      width: 500,
      height: "auto",
      left: 20,
      top: 20
    },
    classes: ["cogwheel", "doom-clocks"]
  };

  static PARTS = {
    content: {
      template: "systems/cogwheel-syndicate/src/templates/doom-clocks-dialog.hbs"
    }
  };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    // Migracja starych zegarów - dodaj kategorię "mission" i domyślny kolor jeśli nie ma
    const migratedClocks = this.clocks.map(clock => {
      if (!clock.category) {
        console.log(`Migrating clock "${clock.name}" to mission category`);
        clock.category = 'mission';
      }
      if (!clock.fillColor) {
        console.log(`Migrating clock "${clock.name}" to default red color`);
        clock.fillColor = '#dc2626';
      }
      return clock;
    });
    
    // Zapisz zmiany jeśli dokonano migracji
    if (migratedClocks.some((clock, index) => !this.clocks[index].category || !this.clocks[index].fillColor)) {
      this.clocks = migratedClocks;
      this._updateClocks(); // Zapisz do ustawień
    }
    
    context.clocks = migratedClocks;
    context.isGM = game.user.isGM;
    context.activeCategory = this.activeCategory;
    
    return context;
  }

  _onRender(context, options) {
    super._onRender(context, options);
    const html = $(this.element); // Zawinięcie w jQuery dla kompatybilności

    // Znajdź kontener - może być w różnych miejscach w zależności od wersji Foundry
    let container = this.element.querySelector('.doom-clocks-content');
    if (!container) {
      // Spróbuj znaleźć w całym dokumencie jako fallback
      container = html.find('.doom-clocks-content')[0];
    }
    
    // Ustaw właściwą zakładkę jako aktywną
    const tabBtns = this.element.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => btn.classList.remove('active'));
    
    const activeTab = this.element.querySelector(`.tab-btn[data-category="${this.activeCategory}"]`);
    if (activeTab) activeTab.classList.add('active');
    
    // Ustaw właściwy atrybut kontenera jeśli został znaleziony
    if (container) {
      container.setAttribute('data-active-category', this.activeCategory);
    }

    // Obsługa zakładek kategorii
    html.find(".tab-btn").on('click', this._onTabChange.bind(this));

    if (game.user.isGM) {
      html.find(".add-clock").on('click', this._onAddClock.bind(this));
      html.find(".increment-clock").on('click', this._onIncrementClock.bind(this));
      html.find(".decrement-clock").on('click', this._onDecrementClock.bind(this));
      html.find(".edit-clock").on('click', this._onEditClock.bind(this));
      html.find(".delete-clock").on('click', this._onDeleteClock.bind(this));
    }

    // Dopasuj wysokość okna do ilości widocznych zegarów
    setTimeout(() => this._adjustWindowHeight(), 50);
  }

  async _onAddClock(event) {
    event.preventDefault();
    
    // Pobierz aktualnie aktywną kategorię z instancji
    const activeCategory = this.activeCategory || 'mission';
    
    const dialogContent = await renderTemplate(
      "systems/cogwheel-syndicate/src/templates/add-clock-dialog.hbs",
      { clock: { name: "", description: "", max: 4, category: activeCategory, fillColor: "#dc2626" } }
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
            const name = html[0].querySelector('[name="name"]').value.trim();
            const description = html[0].querySelector('[name="description"]').value.trim();
            const max = parseInt(html[0].querySelector('[name="max"]').value) || 4;
            const category = html[0].querySelector('[name="category"]').value || activeCategory;
            const fillColor = html[0].querySelector('[name="fillColor"]:checked').value || "#dc2626";

            if (!name) {
              ui.notifications.warn(game.i18n.localize("COGSYNDICATE.ClockNameRequired"));
              return;
            }

            const newClock = { 
              name, 
              description, 
              value: 0, 
              max: Math.clamp(max, 2, 12),
              category: category,
              fillColor: fillColor
            };
            
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
            const name = html[0].querySelector('[name="name"]').value.trim();
            const description = html[0].querySelector('[name="description"]').value.trim();
            const max = parseInt(html[0].querySelector('[name="max"]').value) || clock.max;
            const fillColor = html[0].querySelector('[name="fillColor"]:checked').value || clock.fillColor || "#dc2626";

            if (!name) {
              ui.notifications.warn(game.i18n.localize("COGSYNDICATE.ClockNameRequired"));
              return;
            }

            this.clocks[index] = {
              name,
              description,
              value: Math.min(clock.value, max),
              max: Math.clamp(max, 2, 12),
              category: clock.category, // Zachowaj kategorię
              fillColor: fillColor
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
    
    // Odświeżenie bieżącego okna - zachowaj aktywną kategorię
    const currentCategory = this.activeCategory;
    this.render(true);
    
    // Po renderowaniu, przywróć aktywną kategorię
    setTimeout(() => {
      if (currentCategory !== 'mission') {
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
      } else {
        // Jeśli zostajemy na mission, i tak dopasuj wysokość po dodaniu zegara
        setTimeout(() => this._adjustWindowHeight(), 150);
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
    // Bezpiecznie wywołaj preventDefault tylko jeśli metoda istnieje
    if (event.preventDefault) {
      event.preventDefault();
    }
    
    const button = event.currentTarget;
    const category = button.dataset.category;
    
    // Zapisz aktywną kategorię w instancji
    this.activeCategory = category;
    
    // Usuń klasę active z wszystkich przycisków
    const tabs = this.element.find('.tab-btn');
    tabs.removeClass('active');
    
    // Dodaj klasę active do klikniętego przycisku
    button.classList.add('active');
    
    // Zaktualizuj atrybut kategorii kontenera
    const container = this.element.find('.doom-clocks-content');
    container.attr('data-active-category', category);
    
    // Dopasuj wysokość okna do ilości widocznych zegarów
    setTimeout(() => {
      this._adjustWindowHeight();
    }, 100);
    
    // Zaktualizuj przycisk "Dodaj zegar" aby dodawał do aktywnej kategorii
    this.element.find('.add-clock').attr('data-category', category);
  }

  // Dopasowuje wysokość okna do ilości widocznych zegarów
  _adjustWindowHeight() {
    const visibleClocks = this.element.find('.clock-item:visible').length;
    const baseHeight = 200; // Podstawowa wysokość dla UI (przyciski, zakładki)
    const clockHeight = 86; // Wysokość jednego zegara (70px + 8px margin + padding)
    const maxHeight = 600; // Maksymalna wysokość okna
    
    // Oblicz optymalną wysokość
    let targetHeight = baseHeight + (visibleClocks * clockHeight);
    targetHeight = Math.min(targetHeight, maxHeight);
    
    // Ustaw minimalną wysokość żeby okno nie było za małe
    targetHeight = Math.max(targetHeight, 250);
    
    // Zastosuj nową wysokość
    this.element.css('height', targetHeight + 'px');
    this.setPosition({ height: targetHeight });
  }
}

export function openDoomClocks() {
  const dialog = new DoomClocksDialog();
  
  // Pozycjonowanie po wyrenderowaniu
  dialog.setPosition({
    left: 20,
    top: 20,
    width: 500,
    height: "auto"
  });
  
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