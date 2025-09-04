// src/scripts/init.js
import { registerHandlebarsHelpers } from "./handlebars.mjs";
import { openDoomClocks } from "./clocks.mjs"; // Import funkcji otwierającej zegary
import { MetaCurrencyApp } from "../apps/metacurrency-app.mjs";
import { FeatsEffects } from "./feats-effects.mjs"; // Import systemu efektów atutów

Hooks.once("init", () => {
  // Konfiguracja typów aktorów
  CONFIG.Actor.typeLabels = {
    agent: "Agent",
    agentv2: "Agent v2",
    HQ: "HQ",
    nemesis: "Nemesis"
  };

  // Inicjalizacja globalnego obiektu przy ładowaniu systemu
  game.cogwheelSyndicate = game.cogwheelSyndicate || {
    nemesisPoints: 1,
    steamPoints: 1,
    stressReduceUsesThisSession: 0
    // Usuwamy clocks z game.cogwheelSyndicate, bo będą w ustawieniach świata
  };
  game.cogwheelSyndicate.nemesisPoints = Math.clamp(game.cogwheelSyndicate.nemesisPoints, 0, 100);
  game.cogwheelSyndicate.steamPoints = Math.clamp(game.cogwheelSyndicate.steamPoints, 0, 100);
  game.cogwheelSyndicate.stressReduceUsesThisSession = game.cogwheelSyndicate.stressReduceUsesThisSession || 0;

  // Rejestracja ustawienia dla zegarów
  game.settings.register("cogwheel-syndicate", "doomClocks", {
    name: "Doom Clocks",
    hint: "Stores the global Doom Clocks for the Cogwheel Syndicate system",
    scope: "world", // Ustawienie globalne dla świata
    config: false,   // Nie widoczne w menu ustawień
    type: Array,
    default: [],     // Domyślnie pusta tablica
    onChange: (clocks) => {
      Hooks.call("cogwheelSyndicateClocksUpdated"); // Wywołaj hook po zmianie
    }
  });

  // Rejestracja ustawienia dla licznika użyć redukcji stresu
  game.settings.register("cogwheel-syndicate", "stressReduceUsesThisSession", {
    name: "Stress Reduction Uses This Session",
    hint: "Tracks how many times stress reduction has been used this session",
    scope: "world",
    config: false,
    type: Number,
    default: 0
  });

  // Rejestracja niestandardowego helpera Handlebars
  Handlebars.registerHelper('capitalize', function (str) {
    if (typeof str !== 'string') return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  });

  // Initialize feats effects system
  window.CogwheelFeatsEffects = FeatsEffects;

  registerHandlebarsHelpers();
});

Hooks.once("ready", async () => {
  if (game.user.isGM) {
    // Reset metawalut
    game.cogwheelSyndicate.nemesisPoints = 1;
    game.cogwheelSyndicate.steamPoints = 1;

    // Synchronizacja metawalut przez socket
    game.socket.emit("system.cogwheel-syndicate", {
      type: "updateMetaCurrencies",
      nemesisPoints: game.cogwheelSyndicate.nemesisPoints,
      steamPoints: game.cogwheelSyndicate.steamPoints
    });

    Hooks.call("cogwheelSyndicateMetaCurrenciesUpdated");
  }

  // Resetuj licznik użyć redukcji stresu na początku sesji (opcjonalnie)
  // Można to zastąpić manualnym resetem przez GM

  // Automatyczne otwieranie aplikacji przy starcie
  openDoomClocks(); // Otwiera "Zegary Potępu" przy starcie
  MetaCurrencyApp.showApp(); // Otwiera okno metawalut przy starcie

  // --- AUTOMATYCZNE DODANIE PODRĘCZNIKA PDF DO DZIENNIKA ---
  if (game.user.isGM) {
    const journalName = game.i18n.localize("COGSYNDICATE.JournalManualTitle");
    const journalExists = game.journal.find(j => j.name === journalName);
    if (!journalExists) {
      // Ścieżka do PDF względem katalogu systemu
      const pdfPath = "systems/cogwheel-syndicate/podrecznik.pdf";
      // Treść wpisu z linkiem do PDF
      const content = `<p><a href=\"${pdfPath}\" target=\"_blank\">${game.i18n.localize("COGSYNDICATE.JournalManualLink")}</a></p>`;
      await JournalEntry.create({
        name: journalName,
        content,
        folder: null,
        permission: { default: (CONST?.DOCUMENT_PERMISSION_LEVELS?.OBSERVER ?? 2) }
      });
      ui.notifications.info(game.i18n.localize("COGSYNDICATE.JournalManualCreated"));
    }
  }
});

// Dodaj przyciski do sidebaru w zakładce Actors
Hooks.on("renderSidebarTab", (app, html) => {
  if (app.tabName !== "actors") return;

  const metaButton = $(
    `<button class="meta-currency-btn" title="${game.i18n.localize('COGSYNDICATE.metacurrency.title')}"><i class="fas fa-coins"></i> ${game.i18n.localize('COGSYNDICATE.metacurrency.open')}</button>`
  );
  const clockButton = $(
    `<button class="doom-clocks-btn" title="${game.i18n.localize('COGSYNDICATE.DoomClocksTitle')}"><i class="fas fa-clock"></i> ${game.i18n.localize('COGSYNDICATE.DoomClocksTitle')}</button>`
  );

  const header = html.find(".directory-header");
  if (!header.find(".meta-currency-btn").length) {
    header.append(metaButton);
  }
  if (!header.find(".doom-clocks-btn").length) {
    header.append(clockButton);
  }

  metaButton.click(() => {
    MetaCurrencyApp.showApp();
  });
  clockButton.click(() => {
    openDoomClocks();
  });
});

// Dodaj kontrolki do paska narzędzi po lewej stronie
Hooks.on("getSceneControlButtons", (controls) => {
  // Usunięto warunek if (game.user.isGM) - teraz widoczne dla wszystkich
  
  // Sprawdź czy grupa już istnieje, żeby nie duplikować
  let cogwheelControls = controls.find(c => c.name === "cogwheel");
  
  if (!cogwheelControls) {
    cogwheelControls = {
      name: "cogwheel",
      title: "Cogwheel Syndicate",
      icon: "fas fa-cog",
      layer: "controls",
      tools: [],
      visible: true
    };
    // Dodaj grupę bez nadpisywania istniejących
    controls.push(cogwheelControls);
  }
  
  // Sprawdź czy narzędzia już nie zostały dodane (żeby uniknąć duplikatów)
  const clockToolExists = cogwheelControls.tools.some(t => t.name === "doom-clocks");
  const metaToolExists = cogwheelControls.tools.some(t => t.name === "meta-currency");
  
  if (!clockToolExists) {
    // Dodaj narzędzie zegarów postępu
    cogwheelControls.tools.push({
      name: "doom-clocks",
      title: game.i18n.localize("COGSYNDICATE.DoomClocksTitle"),
      icon: "fas fa-clock",
      button: true,
      visible: true,
      onClick: () => openDoomClocks()
    });
  }
  
  if (!metaToolExists) {
    // Dodaj narzędzie metawalut
    cogwheelControls.tools.push({
      name: "meta-currency",
      title: game.i18n.localize("COGSYNDICATE.metacurrency.title"),
      icon: "fas fa-coins",
      button: true,
      visible: true,
      onClick: () => {
        MetaCurrencyApp.showApp();
      }
    });
  }
  
  // Zwróć kontrolki bez modyfikacji (ważne!)
  return controls;
});

// Hook do odświeżania metawalut
Hooks.on("cogwheelSyndicateMetaCurrenciesUpdated", () => {
  for (let appId in ui.windows) {
    const window = ui.windows[appId];
    if (window instanceof MetaCurrencyApp) {
      window.render(false);
    }
  }
});

// Synchronizacja przez socket (usuwamy synchronizację zegarów)
Hooks.once("setup", () => {
  game.socket.on("system.cogwheel-syndicate", async (data) => {
    if (data.type === "updateMetaCurrencies") {
      game.cogwheelSyndicate.nemesisPoints = Math.clamp(data.nemesisPoints, 0, 100);
      game.cogwheelSyndicate.steamPoints = Math.clamp(data.steamPoints, 0, 100);
      Hooks.call("cogwheelSyndicateMetaCurrenciesUpdated");
    } else if (data.type === "updateStressUses") {
      game.cogwheelSyndicate.stressReduceUsesThisSession = data.stressReduceUsesThisSession;
      Hooks.call("cogwheelSyndicateMetaCurrenciesUpdated");
    }
    // Usunięto obsługę "updateClocks", bo game.settings automatycznie synchronizuje dane
  });
});