export class DoomClocksDialog extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2) {
  constructor(options = {}) {
    super(options);
    // Odczyt zegarów z ustawień świata
    this.clocks = game.settings.get("cogwheel-syndicate", "doomClocks") || [];
    
    // Migracja starych zegarów - dodaj brakujące pola
    let needsSave = false;
    this.clocks = this.clocks.map(clock => {
      if (!clock.category) {
        console.log(`Migrating clock "${clock.name}" to default category`);
        clock.category = 'mission';
        needsSave = true;
      }
      if (!clock.fillColor) {
        console.log(`Migrating clock "${clock.name}" to default red color`);
        clock.fillColor = '#dc2626';
        needsSave = true;
      }
      return clock;
    });
    
    // Zapisz migrację jeśli potrzeba
    if (needsSave) {
      console.log("Saving migrated clocks to settings");
      game.settings.set("cogwheel-syndicate", "doomClocks", this.clocks);
    }
    
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
    
    context.clocks = this.clocks;
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
    console.log("=== _onAddClock START ===");
    
    // Pobierz aktualnie aktywną kategorię z instancji
    const activeCategory = this.activeCategory || 'mission';
    
    const dialogContent = await foundry.applications.handlebars.renderTemplate(
      "systems/cogwheel-syndicate/src/templates/add-clock-dialog.hbs",
      { clock: { name: "", description: "", max: 4, category: activeCategory, fillColor: "#dc2626" } }
    );

    // Używamy klasy DialogV2 wzorowanej na kodzie kolegi bb46003
    class AddClockDialog extends foundry.applications.api.DialogV2 {
      constructor(clocksApp, activeCategory) {
        const options = {
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
              default: true,
              callback: async (event, button, html) => {
                console.log("Dialog callback triggered");
                await this.handleAddClock();
              }
            }
          ],
          rejectClose: false
        };
        
        super(options);
        this.clocksApp = clocksApp;
        this.activeCategory = activeCategory;
      }

      _onRender() {
        console.log("AddClockDialog _onRender called");
        // Wymuś ustawienie kolorów w palecie
        this._forceColorStyles();
      }
      
      _forceColorStyles() {
        const element = this.element;
        const allColorOptions = element.querySelectorAll(`.color-option`);
        
        const colorMap = {
          "#dc2626": "Red (Threat)",
          "#ea580c": "Orange (Warning)", 
          "#d97706": "Amber (Caution)",
          "#ca8a04": "Yellow (Time)",
          "#65a30d": "Lime (Progress)",
          "#16a34a": "Green (Success)",
          "#0d9488": "Teal (Water)",
          "#2563eb": "Blue (Cold)",
          "#4338ca": "Indigo (Magic)",
          "#7c3aed": "Purple (Mystery)",
          "#db2777": "Pink (Emotions)",
          "#6b7280": "Gray (Neutral)"
        };
        
        console.log("Forcing color styles for", allColorOptions.length, "options");
        
        allColorOptions.forEach((option, index) => {
          const associatedInput = option.previousElementSibling;
          if (associatedInput && associatedInput.type === 'radio') {
            const colorValue = associatedInput.value;
            option.style.backgroundColor = colorValue;
            option.title = colorMap[colorValue] || colorValue;
            console.log(`Forced color ${index}: ${colorValue}`);
          }
        });
      }

      async handleAddClock() {
        console.log("handleAddClock called");
        
        try {
          // Używamy element z dialogu, wzorując się na kodzie kolegi
          const element = this.element;
          console.log("Dialog element:", element);
          
          const nameInput = element.querySelector('[name="name"]');
          const descInput = element.querySelector('[name="description"]');
          const maxInput = element.querySelector('[name="max"]');
          const categoryInput = element.querySelector('[name="category"]');
          const fillColorInput = element.querySelector('[name="fillColor"]:checked');
          
          console.log("Form inputs found:", {
            nameInput: nameInput?.value,
            descInput: descInput?.value,
            maxInput: maxInput?.value,
            categoryInput: categoryInput?.value,
            fillColorInput: fillColorInput?.value
          });
          
          const name = nameInput?.value?.trim() || "";
          const description = descInput?.value?.trim() || "";
          const max = parseInt(maxInput?.value) || 4;
          const category = categoryInput?.value || this.activeCategory;
          const fillColor = fillColorInput?.value || "#dc2626";

          console.log("Processed form values:", { name, description, max, category, fillColor });

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
          this.clocksApp.clocks.push(newClock);
          await this.clocksApp._updateClocks();
          ui.notifications.info(`Dodano nowy zegar: ${name}`);
        } catch (error) {
          console.error("Error in handleAddClock:", error);
          ui.notifications.error("Błąd podczas dodawania zegara");
        }
      }
    }

    const dialog = new AddClockDialog(this, activeCategory);
    dialog.render(true, { height: 630 });

    console.log("=== _onAddClock END ===");
  }

  async _onEditClock(event) {
    event.preventDefault();
    console.log("=== _onEditClock START ===");
    
    const index = parseInt(event.currentTarget.closest(".clock-item").dataset.index);
    const clock = this.clocks[index];
    
    // Upewnij się, że clock ma fillColor - jeśli nie, ustaw domyślny
    if (!clock.fillColor) {
      clock.fillColor = "#dc2626";
    }
    
    console.log("Editing clock with data:", JSON.stringify(clock, null, 2));

    const dialogContent = await foundry.applications.handlebars.renderTemplate(
      "systems/cogwheel-syndicate/src/templates/add-clock-dialog.hbs",
      { clock }
    );
    
    console.log("Generated dialog content:", dialogContent.substring(0, 200) + "...");

    // Używamy klasy DialogV2 wzorowanej na kodzie kolegi bb46003
    class EditClockDialog extends foundry.applications.api.DialogV2 {
      constructor(clocksApp, clock, index) {
        const options = {
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
              default: true,
              callback: async (event, button, html) => {
                console.log("Edit dialog callback triggered");
                await this.handleEditClock();
              }
            }
          ],
          rejectClose: false
        };
        
        super(options);
        this.clocksApp = clocksApp;
        this.clock = clock;
        this.index = index;
      }

      _onRender() {
        console.log("EditClockDialog _onRender called");
        // Upewnij się, że poprawny kolor jest zaznaczony
        this._setCorrectColorSelection();
        // Wymuś ustawienie kolorów w palecie
        this._forceColorStyles();
      }
      
      _forceColorStyles() {
        const element = this.element;
        const allColorOptions = element.querySelectorAll(`.color-option`);
        
        const colorMap = {
          "#dc2626": "Red (Threat)",
          "#ea580c": "Orange (Warning)", 
          "#d97706": "Amber (Caution)",
          "#ca8a04": "Yellow (Time)",
          "#65a30d": "Lime (Progress)",
          "#16a34a": "Green (Success)",
          "#0d9488": "Teal (Water)",
          "#2563eb": "Blue (Cold)",
          "#4338ca": "Indigo (Magic)",
          "#7c3aed": "Purple (Mystery)",
          "#db2777": "Pink (Emotions)",
          "#6b7280": "Gray (Neutral)"
        };
        
        console.log("Forcing color styles for", allColorOptions.length, "options");
        
        allColorOptions.forEach((option, index) => {
          const associatedInput = option.previousElementSibling;
          if (associatedInput && associatedInput.type === 'radio') {
            const colorValue = associatedInput.value;
            option.style.backgroundColor = colorValue;
            option.title = colorMap[colorValue] || colorValue;
            console.log(`Forced color ${index}: ${colorValue}`);
          }
        });
      }
      
      _setCorrectColorSelection() {
        const element = this.element;
        const currentColor = this.clock.fillColor || "#dc2626";
        
        console.log("=== DEBUG COLOR SELECTION ===");
        console.log("Setting correct color selection to:", currentColor);
        console.log("Dialog element:", element);
        console.log("Dialog element classes:", element.className);
        
        // Sprawdź całą strukturę DOM
        const paletteContainer = element.querySelector('.clock-color-palette');
        console.log("Palette container found:", paletteContainer);
        
        if (paletteContainer) {
          console.log("Palette container HTML:", paletteContainer.outerHTML.substring(0, 500));
        }
        
        // Znajdź odpowiedni radio button i zaznacz go
        const colorInput = element.querySelector(`input[name="fillColor"][value="${currentColor}"]`);
        const allColorInputs = element.querySelectorAll(`input[name="fillColor"]`);
        const allColorOptions = element.querySelectorAll(`.color-option`);
        
        console.log("Found color inputs:", allColorInputs.length);
        console.log("Found color options:", allColorOptions.length);
        console.log("Target color input:", colorInput);
        
        // WYMUŚ ustawienie kolorów tła dla wszystkich opcji
        const colorMap = {
          "#dc2626": "Red (Threat)",
          "#ea580c": "Orange (Warning)", 
          "#d97706": "Amber (Caution)",
          "#ca8a04": "Yellow (Time)",
          "#65a30d": "Lime (Progress)",
          "#16a34a": "Green (Success)",
          "#0d9488": "Teal (Water)",
          "#2563eb": "Blue (Cold)",
          "#4338ca": "Indigo (Magic)",
          "#7c3aed": "Purple (Mystery)",
          "#db2777": "Pink (Emotions)",
          "#6b7280": "Gray (Neutral)"
        };
        
        // Debug wszystkich opcji kolorów i wymuś kolory
        allColorOptions.forEach((option, index) => {
          const associatedInput = option.previousElementSibling;
          if (associatedInput && associatedInput.type === 'radio') {
            const colorValue = associatedInput.value;
            
            // WYMUŚ kolor tła
            option.style.backgroundColor = colorValue;
            option.title = colorMap[colorValue] || colorValue;
            
            console.log(`Color option ${index}:`, {
              element: option,
              classes: option.className,
              originalStyle: option.getAttribute('style'),
              forcedBg: colorValue,
              computedBg: window.getComputedStyle(option).backgroundColor,
              title: option.getAttribute('title')
            });
          }
        });
        
        if (colorInput) {
          colorInput.checked = true;
          console.log("Successfully set color selection:", currentColor);
          
          // Sprawdź czy visual feedback działa
          const colorOption = colorInput.nextElementSibling;
          if (colorOption && colorOption.classList.contains('color-option')) {
            console.log("Color option element:", colorOption);
            console.log("Color option background:", window.getComputedStyle(colorOption).backgroundColor);
          }
        } else {
          console.warn("Could not find color input for:", currentColor);
          // Fallback - zaznacz domyślny czerwony
          const defaultInput = element.querySelector(`input[name="fillColor"][value="#dc2626"]`);
          if (defaultInput) {
            defaultInput.checked = true;
            console.log("Set fallback color selection to red");
          }
        }
        console.log("=== END DEBUG COLOR SELECTION ===");
      }

      async handleEditClock() {
        console.log("handleEditClock called");
        
        try {
          // Używamy element z dialogu, wzorując się na kodzie kolegi
          const element = this.element;
          console.log("Edit dialog element:", element);
          
          const nameInput = element.querySelector('[name="name"]');
          const descInput = element.querySelector('[name="description"]');
          const maxInput = element.querySelector('[name="max"]');
          const fillColorInput = element.querySelector('[name="fillColor"]:checked');
          
          console.log("Edit form inputs found:", {
            nameInput: nameInput?.value,
            descInput: descInput?.value,
            maxInput: maxInput?.value,
            fillColorInput: fillColorInput?.value
          });
          
          const name = nameInput?.value?.trim() || "";
          const description = descInput?.value?.trim() || "";
          const max = parseInt(maxInput?.value) || this.clock.max;
          const fillColor = fillColorInput?.value || this.clock.fillColor || "#dc2626";

          console.log("Edit processed form values:", { name, description, max, fillColor });

          if (!name) {
            ui.notifications.warn(game.i18n.localize("COGSYNDICATE.ClockNameRequired"));
            return;
          }

          const updatedClock = {
            name,
            description,
            value: Math.min(this.clock.value, max),
            max: Math.clamp(max, 2, 12),
            category: this.clock.category, // Zachowaj kategorię
            fillColor: fillColor
          };
          
          console.log("Updating clock at index", this.index, "from:", this.clock, "to:", updatedClock);
          this.clocksApp.clocks[this.index] = updatedClock;
          await this.clocksApp._updateClocks();
          ui.notifications.info(`Zaktualizowano zegar: ${name}`);
        } catch (error) {
          console.error("Error in handleEditClock:", error);
          ui.notifications.error("Błąd podczas edytowania zegara");
        }
      }
    }

    const dialog = new EditClockDialog(this, clock, index);
    dialog.render(true, { height: 630 });

    console.log("=== _onEditClock END ===");
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
      let clocks = game.settings.get("cogwheel-syndicate", "doomClocks") || [];
      
      // Migracja starych zegarów - dodaj brakujące pola
      let needsSave = false;
      clocks = clocks.map(clock => {
        if (!clock.category) {
          console.log(`Migrating clock "${clock.name}" to default category`);
          clock.category = 'mission';
          needsSave = true;
        }
        if (!clock.fillColor) {
          console.log(`Migrating clock "${clock.name}" to default red color`);
          clock.fillColor = '#dc2626';
          needsSave = true;
        }
        return clock;
      });
      
      // Zapisz migrację jeśli potrzeba
      if (needsSave) {
        console.log("Saving migrated clocks to settings in hook");
        game.settings.set("cogwheel-syndicate", "doomClocks", clocks);
      }
      
      window.clocks = clocks;
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