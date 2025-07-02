// src/scripts/init.js
import { registerHandlebarsHelpers } from "./handlebars.mjs";
import { openDoomClocks } from "./clocks.mjs"; // Import funkcji otwierającej zegary
import { MetaCurrencyApp } from "../apps/metacurrency-app.mjs";

Hooks.once("init", () => {
  // Inicjalizacja globalnego obiektu przy ładowaniu systemu
  game.cogwheelSyndicate = game.cogwheelSyndicate || {
    nemesisPoints: 1,
    steamPoints: 1
    // Usuwamy clocks z game.cogwheelSyndicate, bo będą w ustawieniach świata
  };
  game.cogwheelSyndicate.nemesisPoints = Math.clamp(game.cogwheelSyndicate.nemesisPoints, 0, 100);
  game.cogwheelSyndicate.steamPoints = Math.clamp(game.cogwheelSyndicate.steamPoints, 0, 100);

  // Rejestracja ustawienia dla zegarów
  game.settings.register("cogwheel-syndicate", "doomClocks", {
    name: "Doom Clocks",
    hint: "Stores the global Doom Clocks for the Cogwheel Syndicate system",
    scope: "world", // Ustawienie globalne dla świata
    config: false,   // Nie widoczne w menu ustawień
    type: Array,
    default: [],     // Domyślnie pusta tablica
    onChange: (clocks) => {
      console.log("Doom Clocks updated in settings:", clocks);
      Hooks.call("cogwheelSyndicateClocksUpdated"); // Wywołaj hook po zmianie
    }
  });

  // Rejestracja niestandardowego helpera Handlebars
  Handlebars.registerHelper('capitalize', function (str) {
    if (typeof str !== 'string') return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  });

  registerHandlebarsHelpers();
});

Hooks.once("ready", async () => {
  if (game.user.isGM) {
    // Reset metawalut
    game.cogwheelSyndicate.nemesisPoints = 1;
    game.cogwheelSyndicate.steamPoints = 1;

    console.log("Cogwheel Syndicate | Metawaluty zresetowane do 1 globalnie.");

    // Synchronizacja metawalut przez socket
    game.socket.emit("system.cogwheel-syndicate", {
      type: "updateMetaCurrencies",
      nemesisPoints: game.cogwheelSyndicate.nemesisPoints,
      steamPoints: game.cogwheelSyndicate.steamPoints
    });

    Hooks.call("cogwheelSyndicateMetaCurrenciesUpdated");
  }

  // Automatyczne otwieranie aplikacji przy starcie
  openDoomClocks(); // Otwiera "Zegary Potępu" przy starcie
  MetaCurrencyApp.showApp(); // Otwiera okno metawalut przy starcie
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
  console.log("Hook triggered: cogwheelSyndicateMetaCurrenciesUpdated");
  for (let appId in ui.windows) {
    const window = ui.windows[appId];
    if (window instanceof MetaCurrencyApp) {
      console.log(`Odświeżanie okna MetaCurrencyApp o ID: ${appId}`);
      window.render(false);
    }
  }
});

// Synchronizacja przez socket (usuwamy synchronizację zegarów)
Hooks.once("setup", () => {
  game.socket.on("system.cogwheel-syndicate", (data) => {
    if (data.type === "updateMetaCurrencies") {
      game.cogwheelSyndicate.nemesisPoints = Math.clamp(data.nemesisPoints, 0, 100);
      game.cogwheelSyndicate.steamPoints = Math.clamp(data.steamPoints, 0, 100);
      console.log("Socket: Metawaluty zaktualizowane - Nemesis:", game.cogwheelSyndicate.nemesisPoints, "Steam:", game.cogwheelSyndicate.steamPoints);
      Hooks.call("cogwheelSyndicateMetaCurrenciesUpdated");
    }
    // Usunięto obsługę "updateClocks", bo game.settings automatycznie synchronizuje dane
  });
});