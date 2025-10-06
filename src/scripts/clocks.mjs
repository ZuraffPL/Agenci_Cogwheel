import cogwheel_syndicate_Utility from "../scripts/utiliti.mjs"

export class DoomClocksDialog extends foundry.applications.api.ApplicationV2 {

constructor(options = {}) {
    super(options);
    
    // Unikalny marker do identyfikacji tej klasy w hookach
    this._isCogwheelClocksDialog = true;
    
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
    id:
"doom-clocks-dialog",
    tag: "div",
    window: {
      title: "COGSYNDICATE.DoomClocksTitle",

     icon: "fas fa-clock",
      resizable: true
    },
    position: {
     
      width: "auto",
      height: "auto",
      left: 40,
      top: 20
    },
    form: {
 
    preventEscapeClose: true,
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
  async _renderHTML() {
    try {
    
      const html = await foundry.applications.handlebars.renderTemplate(
        "systems/cogwheel-syndicate/src/templates/doom-clocks-dialog.hbs", {isGM:game.user.isGM, clocks:this.clocks}
      );
      return html;
    } catch (e) {
      console.error("_renderHTML error:", e);
      throw e;
    }
  }

  async _replaceHTML(result, html) {
    html.innerHTML = result;
  }
  async render(force = false, options = {}) {
    await super.render(force, options);
    let html; // Zawinięcie w jQuery dla kompatybilności
    if (this.element && this.element.jquery) {
        html = this.element[0]
      }
    else{
      html = this.element
    }

    // Znajdź kontener - może być w różnych miejscach w zależności od wersji Foundry
    let container = html.querySelector('.doom-clocks-content');
    if (!container) {
      // Spróbuj znaleźć w całym dokumencie jako fallback
      container = html.querySelector('.doom-clocks-content');
    }
    
    // Ustaw właściwą zakładkę jako aktywną
    const tabBtns = html.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => btn.classList.remove('active'));
    
    const activeTab = html.querySelector(`.tab-btn[data-category="${this.activeCategory}"]`);
    if (activeTab) activeTab.classList.add('active');
    
    // Ustaw właściwy atrybut kontenera jeśli został znaleziony
    if (container) {
      container.setAttribute('data-active-category', this.activeCategory);
    }

 // Obsługa zakładek kategorii
  const buttons = html.querySelectorAll(".tab-btn");

   buttons.forEach(button =>{
    button.addEventListener("click", this._onTabChange.bind(this));
   }) 

if (game.user.isGM) {
  html.querySelector(".add-clock")
      .addEventListener("click", this._onAddClock.bind(this));
  
  // Przycisk archiwum
  const archiveBtn = html.querySelector(".open-archive");
  if (archiveBtn) {
    archiveBtn.addEventListener("click", this._onOpenArchive.bind(this));
  }
  
  html.querySelectorAll(".increment-clock").forEach(element => {
  element.addEventListener("click", this._onIncrementClock.bind(this));
});

// Decrement buttons
html.querySelectorAll(".decrement-clock").forEach(element => {
  element.addEventListener("click", this._onDecrementClock.bind(this));
});

// Edit buttons
html.querySelectorAll(".edit-clock").forEach(element => {
  element.addEventListener("click", this._onEditClock.bind(this));
});

// Delete buttons
html.querySelectorAll(".delete-clock").forEach(element => {
  element.addEventListener("click", this._onDeleteClock.bind(this));
});

}

    // Automatyczne dopasowanie wysokości okna do liczby zegarów
    this._autoAdjustHeight();
  }

  /**
   * Automatycznie dopasowuje wysokość okna do liczby widocznych zegarów
   * z zachowaniem ograniczeń min/max, zgodnie z natywnym DOM i AppV2
   */
  _autoAdjustHeight() {
    const $element = $(this.element);
    // Szukaj tylko widocznych zegarów w aktualnej kategorii
    const visibleClocks = $element.find('.clock-item:visible').length;
    const baseHeight = 220; // UI, przyciski, zakładki, padding
    const clockHeight = 110; // Większa wysokość jednego zegara
    const maxHeight = 750; // Maksymalna wysokość okna (zgodnie z DEFAULT_OPTIONS)
    const minHeight = 300;
    let targetHeight = baseHeight + (visibleClocks * clockHeight) + 70; // +70px bufora
    targetHeight = Math.min(targetHeight, maxHeight);
    targetHeight = Math.max(targetHeight, minHeight);
    // Ustaw wysokość tylko jeśli różni się od obecnej
    if (this.position?.height !== targetHeight) {
      this.setPosition({ height: targetHeight });
    }
  }
  async close(options = {}) {
    if (options.closeKey) {
      return false;
    }
    return super.close(options);
  }
  async _onAddClock(event) {
    event.preventDefault();
    console.log("=== _onAddClock START ===");
    
    // Pobierz aktualnie aktywną kategorię z instancji
    const activeCategory = this.activeCategory || 'mission';
    
    const dialogContent = await cogwheel_syndicate_Utility.renderTemplate(
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

      }
      
      
      _setCorrectColorSelection() {
        const element = this.element;
        const currentColor = this.clock.fillColor || "#dc2626";
         const radio = element.querySelector(
          `input[name="fillColor"][value="${currentColor}"]`
        );
        if (radio) {
            radio.checked = true;
        }

        

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
    const clock = this.clocks[index];
    
    // Dodaj timestamp archiwizacji
    const archivedClock = {
      ...clock,
      archivedAt: Date.now(),
      archivedDate: new Date().toLocaleDateString(game.i18n.lang, { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };
    
    // Pobierz aktualne archiwum i dodaj nowy zegar
    let archivedClocks = game.settings.get("cogwheel-syndicate", "archivedClocks") || [];
    archivedClocks.push(archivedClock);
    await game.settings.set("cogwheel-syndicate", "archivedClocks", archivedClocks);
    
    // Usuń z aktywnych zegarów
    this.clocks.splice(index, 1);
    await this._updateClocks();
    
    // Broadcast archiwum przez socket
    game.socket.emit("system.cogwheel-syndicate", {
      type: "updateArchivedClocks",
      archivedClocks: archivedClocks
    });
    
    ui.notifications.info(`${game.i18n.localize("COGSYNDICATE.ClockArchived")}: ${clock.name}`);
  }

  async _updateClocks(isSocketUpdate = false) {
    try {
      // Zapis zegarów do ustawień świata
      await game.settings.set("cogwheel-syndicate", "doomClocks", this.clocks);
      
      // Wysłanie aktualizacji przez socket do wszystkich użytkowników
      // Tylko jeśli to nie jest aktualizacja wywołana przez socket (uniknięcie pętli)
      if (!isSocketUpdate) {
        game.socket.emit("system.cogwheel-syndicate", {
          type: "updateClocks",
          clocks: this.clocks
        });
        console.log("[Clocks] ✅ Clocks synchronized to all users");
      }

      // Wywołanie hooka lokalnie dla odświeżenia UI
      Hooks.call("cogwheelSyndicateClocksUpdated");
      
      // Odświeżenie bieżącego okna - zachowaj aktywną kategorię
      const currentCategory = this.activeCategory;
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
    
    // Automatycznie dopasuj wysokość po zmianie zakładki
    this._autoAdjustHeight();
    
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

  // Metoda do otwierania archiwum zegarów
  async _onOpenArchive(event) {
    event.preventDefault();
    const archivedClocks = game.settings.get("cogwheel-syndicate", "archivedClocks") || [];
    
    // Render template dla archiwum
    const content = await cogwheel_syndicate_Utility.renderTemplate(
      "systems/cogwheel-syndicate/src/templates/clock-archive-dialog.hbs",
      { 
        archivedClocks,
        isGM: game.user.isGM,
        noClocks: archivedClocks.length === 0
      }
    );

    // Dialog archiwum
    class ArchiveDialog extends foundry.applications.api.DialogV2 {
      constructor(clocksApp) {
        const options = {
          window: {
            title: game.i18n.localize("COGSYNDICATE.ArchivedClocks"),
            icon: "fas fa-archive",
            classes: ["cogwheel", "clock-archive-dialog"]
          },
          position: {
            width: "auto",
            height: "auto"
          },
          content: content,
          buttons: [
            {
              action: "close",
              label: game.i18n.localize("COGSYNDICATE.Close"),
              default: true
            }
          ],
          rejectClose: false
        };
        
        super(options);
        this.clocksApp = clocksApp;
      }

      _onRender(context, options) {
        super._onRender(context, options);
        
        // Apply steampunk styling directly to dialog element
        const dialogEl = this.element;
        if (dialogEl) {
          // Set dialog-level styles
          dialogEl.style.background = "linear-gradient(135deg, #3d2817 0%, #4a321d 30%, #5a4a3a 70%, #2c1810 100%)";
          dialogEl.style.border = "2px solid #cd7f32";
          dialogEl.style.borderRadius = "8px";
          dialogEl.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.6), inset 0 1px 3px rgba(205, 127, 50, 0.3)";
          dialogEl.style.minWidth = "650px";
          dialogEl.style.maxWidth = "950px";
          
          // Style window header
          const header = dialogEl.querySelector('.window-header');
          if (header) {
            header.style.background = "linear-gradient(135deg, #4a321d 0%, #5a4a3a 50%, #4a321d 100%)";
            header.style.borderBottom = "2px solid #cd7f32";
            header.style.color = "#f4a460";
            header.style.textShadow = "1px 1px 2px rgba(0, 0, 0, 0.8)";
          }
          
          // Style window content
          const content = dialogEl.querySelector('.window-content');
          if (content) {
            content.style.background = "linear-gradient(135deg, #3d2817 0%, #4a321d 30%, #5a4a3a 70%, #2c1810 100%)";
            content.style.color = "#f4a460";
            content.style.padding = "15px";
          }
          
          // Style dialog buttons footer
          const buttonsFooter = dialogEl.querySelector('.dialog-buttons');
          if (buttonsFooter) {
            buttonsFooter.style.background = "linear-gradient(135deg, #3d2817 0%, #4a321d 50%, #2c1810 100%)";
            buttonsFooter.style.borderTop = "2px solid #cd7f32";
            buttonsFooter.style.padding = "10px 15px";
            
            const closeBtn = buttonsFooter.querySelector('button');
            if (closeBtn) {
              closeBtn.style.background = "linear-gradient(135deg, #3d2817 0%, #4a321d 50%, #2c1810 100%)";
              closeBtn.style.border = "2px solid #cd7f32";
              closeBtn.style.borderRadius = "5px";
              closeBtn.style.color = "#f4a460";
              closeBtn.style.padding = "8px 18px";
              closeBtn.style.fontWeight = "bold";
              closeBtn.style.textShadow = "1px 1px 2px rgba(0, 0, 0, 0.8)";
              closeBtn.style.cursor = "pointer";
              closeBtn.style.transition = "all 0.3s ease";
            }
          }
        }
        
        // Dodaj event listenery dla przycisków przywróć i usuń
        const restoreBtns = this.element.querySelectorAll('.restore-clock');
        const deleteBtns = this.element.querySelectorAll('.delete-archived-clock');
        
        restoreBtns.forEach(btn => {
          btn.addEventListener('click', async (e) => {
            const index = parseInt(e.currentTarget.dataset.index);
            await this.clocksApp._onRestoreClock(index);
            this.close();
          });
        });
        
        deleteBtns.forEach(btn => {
          btn.addEventListener('click', async (e) => {
            const index = parseInt(e.currentTarget.dataset.index);
            await this.clocksApp._onDeleteArchivedClock(index);
            this.close();
          });
        });
      }
    }

    const dialog = new ArchiveDialog(this);
    dialog.render(true);
  }

  // Przywrócenie zegara z archiwum
  async _onRestoreClock(index) {
    let archivedClocks = game.settings.get("cogwheel-syndicate", "archivedClocks") || [];
    const clock = archivedClocks[index];
    
    if (!clock) return;
    
    // Usuń pola archiwizacji
    const { archivedAt, archivedDate, ...restoredClock } = clock;
    
    // Dodaj z powrotem do aktywnych zegarów
    this.clocks.push(restoredClock);
    await this._updateClocks();
    
    // Usuń z archiwum
    archivedClocks.splice(index, 1);
    await game.settings.set("cogwheel-syndicate", "archivedClocks", archivedClocks);
    
    // Broadcast archiwum przez socket
    game.socket.emit("system.cogwheel-syndicate", {
      type: "updateArchivedClocks",
      archivedClocks: archivedClocks
    });
    
    ui.notifications.info(`${game.i18n.localize("COGSYNDICATE.ClockRestored")}: ${restoredClock.name}`);
  }

  // Usunięcie zegara z archiwum na stałe
  async _onDeleteArchivedClock(index) {
    let archivedClocks = game.settings.get("cogwheel-syndicate", "archivedClocks") || [];
    const clock = archivedClocks[index];
    
    if (!clock) return;
    
    // Usuń na stałe
    archivedClocks.splice(index, 1);
    await game.settings.set("cogwheel-syndicate", "archivedClocks", archivedClocks);
    
    // Broadcast archiwum przez socket
    game.socket.emit("system.cogwheel-syndicate", {
      type: "updateArchivedClocks",
      archivedClocks: archivedClocks
    });
    
    ui.notifications.warn(`${game.i18n.localize("COGSYNDICATE.ClockDeletedPermanently")}: ${clock.name}`);
  }
}

export async function openDoomClocks() {
  const dialog = await new DoomClocksDialog();
  
  dialog.render(true).then(() => {
    // Pozycjonowanie po wyrenderowaniu - użyj wartości z DEFAULT_OPTIONS.position
    dialog.setPosition({
      left: 40,
      top: 20,
      width: "auto",
      height: "auto"
    });
    // Wyłączone automatyczne dopasowywanie dla stałej wysokości
    // setTimeout(() => dialog._adjustWindowHeight(), 150);
  });
}

// Hook do odświeżania otwartych okien dialogowych zegarów
Hooks.on("cogwheelSyndicateClocksUpdated", () => {
  let foundDialogs = 0;
  
  // Metoda 1: Szukaj w ui.windows (standardowa dla Application)
  for (let appId in ui.windows) {
    const window = ui.windows[appId];
    if (window._isCogwheelClocksDialog === true) {
      foundDialogs++;
      refreshDialog(window);
    }
  }
  
  // Metoda 2: Szukaj w ApplicationV2.instances (dla ApplicationV2)
  if (foundDialogs === 0 && foundry.applications?.instances) {
    for (let [id, app] of foundry.applications.instances) {
      if (app._isCogwheelClocksDialog === true) {
        foundDialogs++;
        refreshDialog(app);
      }
    }
  }
  
  // Metoda 3: Globalne przeszukanie wszystkich instancji (fallback)
  if (foundDialogs === 0 && globalThis.foundry?.applications?.apps) {
    for (let app of Object.values(globalThis.foundry.applications.apps)) {
      if (app._isCogwheelClocksDialog === true) {
        foundDialogs++;
        refreshDialog(app);
      }
    }
  }
  
  if (foundDialogs > 0) {
    console.log(`[Clocks] ✅ Synchronized ${foundDialogs} clock dialog(s)`);
  }
  
  // Funkcja pomocnicza do odświeżania dialogu
  function refreshDialog(window) {
    // Aktualizacja lokalnej kopii zegarów w instancji dialogu
    let clocks = game.settings.get("cogwheel-syndicate", "doomClocks") || [];
    
    // Migracja starych zegarów - dodaj brakujące pola
    let needsSave = false;
    clocks = clocks.map(clock => {
      if (!clock.category) {
        clock.category = 'mission';
        needsSave = true;
      }
      if (!clock.fillColor) {
        clock.fillColor = '#dc2626';
        needsSave = true;
      }
      return clock;
    });
    
    // Zapisz migrację jeśli potrzeba
    if (needsSave && game.user.isGM) {
      game.settings.set("cogwheel-syndicate", "doomClocks", clocks);
    }
    
    // Zachowaj aktualną kategorię przed odświeżeniem
    const currentCategory = window.activeCategory;
    window.clocks = clocks;
    window.render(true);
    
    // Przywróć kategorię po renderze
    if (currentCategory) {
      setTimeout(() => {
        window.activeCategory = currentCategory;
      }, 50);
    }
  }
});

// Nasłuchiwanie na aktualizacje zegarów przez socket
Hooks.once("ready", () => {
  console.log("[Clocks] Socket listener registered");
  game.socket.on("system.cogwheel-syndicate", async (data) => {
    if (data.type === "updateClocks") {
      try {
        // Aktualizacja zegarów w ustawieniach świata (tylko dla nie-GM użytkowników)
        // GM już zapisał zmiany, więc nie potrzebuje ponownego zapisu
        if (!game.user.isGM) {
          await game.settings.set("cogwheel-syndicate", "doomClocks", data.clocks);
        }
        // Wywołanie hooka, który odświeży wszystkie otwarte okna dialogowe
        Hooks.call("cogwheelSyndicateClocksUpdated");
      } catch (error) {
        console.error("[Clocks] Error updating clocks via socket:", error);
      }
    }
    
    // Socket listener dla archiwum
    if (data.type === "updateArchivedClocks") {
      try {
        if (!game.user.isGM) {
          await game.settings.set("cogwheel-syndicate", "archivedClocks", data.archivedClocks);
        }
        Hooks.call("cogwheelSyndicateArchivedClocksUpdated");
      } catch (error) {
        console.error("[Clocks] Error updating archived clocks via socket:", error);
      }
    }
  });
});