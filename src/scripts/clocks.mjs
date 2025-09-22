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
      height: 630,
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

    // Dopasuj wysokość okna do ilości widocznych zegarów - wyłączone dla stałej wysokości 630px
    // setTimeout(() => this._adjustWindowHeight(), 100);
  }

  async _onAddClock(event) {
    event.preventDefault();
    
    // Pobierz aktualnie aktywną kategorię z instancji
    const activeCategory = this.activeCategory || 'mission';
    
    const dialogContent = await foundry.applications.handlebars.renderTemplate(
      "systems/cogwheel-syndicate/src/templates/add-clock-dialog.hbs",
      { clock: { name: "", description: "", max: 4, category: activeCategory, fillColor: "#dc2626" } }
    );

    const dialog = await foundry.applications.api.DialogV2.wait({
      window: {
        title: game.i18n.localize("COGSYNDICATE.AddDoomClock"),
        classes: ["cogwheel", "add-clock-dialog"]
      },
      content: dialogContent,
      buttons: [
        {
          action: "cancel",
          label: game.i18n.localize("COGSYNDICATE.Cancel"),
          default: false
        },
        {
          action: "add",
          label: game.i18n.localize("COGSYNDICATE.Confirm"),
          default: true
        }
      ]
    });

    if (dialog?.action === "add") {
      console.log("Add dialog result:", dialog);
      console.log("Dialog element:", dialog.element);
      
      // Alternatywne podejście - użyj FormData do pobrania danych
      const form = dialog.element.querySelector('form') || dialog.element;
      console.log("Found form:", form);
      
      if (form instanceof HTMLFormElement) {
        const formData = new FormData(form);
        console.log("FormData entries:");
        for (let [key, value] of formData.entries()) {
          console.log(`  ${key}: ${value}`);
        }
        
        const name = formData.get('name')?.toString().trim() || "";
        const description = formData.get('description')?.toString().trim() || "";
        const max = parseInt(formData.get('max')?.toString()) || 4;
        const category = formData.get('category')?.toString() || activeCategory;
        const fillColor = formData.get('fillColor')?.toString() || "#dc2626";
        
        console.log("FormData processed values:", { name, description, max, category, fillColor });
        
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
        
        console.log("Adding new clock:", newClock);
        this.clocks.push(newClock);
        await this._updateClocks();
        ui.notifications.info(`Dodano nowy zegar: ${name}`);
      } else {
        // Fallback na bezpośrednie selektory
        console.log("Form is not HTMLFormElement, using direct selectors");
        const element = dialog.element;
        
        const nameInput = element.querySelector('[name="name"]');
        const descInput = element.querySelector('[name="description"]');
        const maxInput = element.querySelector('[name="max"]');
        const categoryInput = element.querySelector('[name="category"]');
        const fillColorInput = element.querySelector('[name="fillColor"]:checked');
        
        console.log("Direct selector results:", {
          nameInput, descInput, maxInput, categoryInput, fillColorInput
        });
        
        const name = nameInput?.value?.trim() || "";
        const description = descInput?.value?.trim() || "";
        const max = parseInt(maxInput?.value) || 4;
        const category = categoryInput?.value || activeCategory;
        const fillColor = fillColorInput?.value || "#dc2626";

        console.log("Direct selector processed values:", { name, description, max, category, fillColor });

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
        
        console.log("Adding new clock (fallback):", newClock);
        this.clocks.push(newClock);
        await this._updateClocks();
        ui.notifications.info(`Dodano nowy zegar: ${name}`);
      }
    }
  }

  async _onEditClock(event) {
    event.preventDefault();
    const index = parseInt(event.currentTarget.closest(".clock-item").dataset.index);
    const clock = this.clocks[index];

    const dialogContent = await foundry.applications.handlebars.renderTemplate(
      "systems/cogwheel-syndicate/src/templates/add-clock-dialog.hbs",
      { clock }
    );

    const dialog = await foundry.applications.api.DialogV2.wait({
      window: {
        title: game.i18n.localize("COGSYNDICATE.EditDoomClock"),
        classes: ["cogwheel", "edit-clock-dialog"]
      },
      content: dialogContent,
      buttons: [
        {
          action: "cancel",
          label: game.i18n.localize("COGSYNDICATE.Cancel"),
          default: false
        },
        {
          action: "save",
          label: game.i18n.localize("COGSYNDICATE.Confirm"),
          default: true
        }
      ]
    });

    if (dialog?.action === "save") {
      console.log("Edit dialog result:", dialog);
      console.log("Edit dialog element:", dialog.element);
      
      // Alternatywne podejście - użyj FormData do pobrania danych
      const form = dialog.element.querySelector('form') || dialog.element;
      console.log("Edit found form:", form);
      
      if (form instanceof HTMLFormElement) {
        const formData = new FormData(form);
        console.log("Edit FormData entries:");
        for (let [key, value] of formData.entries()) {
          console.log(`  ${key}: ${value}`);
        }
        
        const name = formData.get('name')?.toString().trim() || "";
        const description = formData.get('description')?.toString().trim() || "";
        const max = parseInt(formData.get('max')?.toString()) || clock.max;
        const fillColor = formData.get('fillColor')?.toString() || clock.fillColor || "#dc2626";
        
        console.log("Edit FormData processed values:", { name, description, max, fillColor });
        
        if (!name) {
          ui.notifications.warn(game.i18n.localize("COGSYNDICATE.ClockNameRequired"));
          return;
        }

        const updatedClock = {
          name,
          description,
          value: Math.min(clock.value, max),
          max: Math.clamp(max, 2, 12),
          category: clock.category, // Zachowaj kategorię
          fillColor: fillColor
        };
        
        console.log("Updating clock at index", index, "from:", clock, "to:", updatedClock);
        this.clocks[index] = updatedClock;
        await this._updateClocks();
        ui.notifications.info(`Zaktualizowano zegar: ${name}`);
      } else {
        // Fallback na bezpośrednie selektory
        console.log("Edit form is not HTMLFormElement, using direct selectors");
        const element = dialog.element;
        
        const nameInput = element.querySelector('[name="name"]');
        const descInput = element.querySelector('[name="description"]');
        const maxInput = element.querySelector('[name="max"]');
        const fillColorInput = element.querySelector('[name="fillColor"]:checked');
        
        console.log("Edit direct selector results:", {
          nameInput, descInput, maxInput, fillColorInput
        });
        
        const name = nameInput?.value?.trim() || "";
        const description = descInput?.value?.trim() || "";
        const max = parseInt(maxInput?.value) || clock.max;
        const fillColor = fillColorInput?.value || clock.fillColor || "#dc2626";

        console.log("Edit direct selector processed values:", { name, description, max, fillColor });

        if (!name) {
          ui.notifications.warn(game.i18n.localize("COGSYNDICATE.ClockNameRequired"));
          return;
        }

        const updatedClock = {
          name,
          description,
          value: Math.min(clock.value, max),
          max: Math.clamp(max, 2, 12),
          category: clock.category, // Zachowaj kategorię
          fillColor: fillColor
        };
        
        console.log("Updating clock at index (fallback)", index, "from:", clock, "to:", updatedClock);
        this.clocks[index] = updatedClock;
        await this._updateClocks();
        ui.notifications.info(`Zaktualizowano zegar: ${name}`);
      }
    }
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
    console.log("_updateClocks called with clocks:", this.clocks);
    
    try {
      // Zapis zegarów do ustawień świata
      await game.settings.set("cogwheel-syndicate", "doomClocks", this.clocks);
      console.log("Successfully saved clocks to world settings");
      
      // Wysłanie aktualizacji przez socket do wszystkich użytkowników
      await game.socket.emit("system.cogwheel-syndicate", {
        type: "updateClocks",
        clocks: this.clocks
      });
      console.log("Successfully emitted socket update");

      // Wywołanie hooka lokalnie
      Hooks.call("cogwheelSyndicateClocksUpdated");
      console.log("Successfully called cogwheelSyndicateClocksUpdated hook");
      
      // Odświeżenie bieżącego okna - zachowaj aktywną kategorię
      const currentCategory = this.activeCategory;
      console.log("Rendering with current category:", currentCategory);
      this.render(true);
    
    // Po renderowaniu, przywróć aktywną kategorię
    setTimeout(() => {
      if (currentCategory !== 'mission') {
        this.activeCategory = currentCategory;
        
        // Znajdź i kliknij właściwą zakładkę aby przełączyć widok
        const targetTab = $(this.element).find(`.tab-btn[data-category="${currentCategory}"]`);
        if (targetTab.length > 0) {
          // Wywołaj _onTabChange aby rzeczywiście przełączyć widok
          const fakeEvent = { 
            currentTarget: targetTab[0],
            preventDefault: () => {} // Empty function to prevent errors
          };
          this._onTabChange(fakeEvent);
        }
      } else {
        // Wyłączone automatyczne dopasowywanie wysokości po dodaniu zegara
        // setTimeout(() => this._adjustWindowHeight(), 150);
      }
    }, 100);
    
    } catch (error) {
      console.error("Error in _updateClocks:", error);
      ui.notifications.error("Błąd podczas aktualizacji zegarów");
    }
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
    const tabs = $(this.element).find('.tab-btn');
    tabs.removeClass('active');
    
    // Dodaj klasę active do klikniętego przycisku
    button.classList.add('active');
    
    // Zaktualizuj atrybut kategorii kontenera
    const container = $(this.element).find('.doom-clocks-content');
    container.attr('data-active-category', category);
    
    // Dopasuj wysokość okna do ilości widocznych zegarów - wyłączone dla stałej wysokości
    // setTimeout(() => {
    //   this._adjustWindowHeight();
    // }, 100);
    
    // Zaktualizuj przycisk "Dodaj zegar" aby dodawał do aktywnej kategorii
    $(this.element).find('.add-clock').attr('data-category', category);
  }

  // Dopasowuje wysokość okna do ilości widocznych zegarów
  _adjustWindowHeight() {
    const $element = $(this.element);
    const visibleClocks = $element.find('.clock-item:visible').length;
    const baseHeight = 220; // Zwiększona podstawowa wysokość dla UI (przyciski, zakładki, padding)
    const clockHeight = 90; // Zwiększona wysokość jednego zegara (z większym marginesem)
    const maxHeight = 700; // Zwiększona maksymalna wysokość okna
    
    console.log(`Adjusting height for ${visibleClocks} visible clocks in category: ${this.activeCategory}`);
    
    // Oblicz optymalną wysokość z dodatkowym bufforem
    let targetHeight = baseHeight + (visibleClocks * clockHeight) + 50; // +50px bufora
    targetHeight = Math.min(targetHeight, maxHeight);
    
    // Ustaw minimalną wysokość żeby okno nie było za małe
    targetHeight = Math.max(targetHeight, 300);
    
    console.log(`Setting window height to: ${targetHeight}px`);
    
    // W ApplicationV2 używamy tylko setPosition - nie modyfikujemy CSS bezpośrednio
    this.setPosition({ height: targetHeight });
  }
}

export function openDoomClocks() {
  const dialog = new DoomClocksDialog();
  
  dialog.render(true).then(() => {
    // Pozycjonowanie po wyrenderowaniu - zachowaj stałą wysokość 630px
    dialog.setPosition({
      left: 20,
      top: 20,
      width: 500,
      height: 630
    });
    
    // Wyłączone automatyczne dopasowywanie dla stałej wysokości
    // setTimeout(() => dialog._adjustWindowHeight(), 150);
  });
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