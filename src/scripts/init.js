// src/scripts/init.js
import { registerHandlebarsHelpers } from "./handlebars.mjs";
import { openDoomClocks } from "./clocks.mjs"; // Import funkcji otwierającej zegary

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

  // Automatyczne otwieranie dialogu metawalut i zegarów dla wszystkich
  new MetaCurrencyDialog().render(true);
  openDoomClocks(); // Otwiera "Zegary Potępu" przy starcie
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
    new MetaCurrencyDialog().render(true);
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
      onClick: () => new MetaCurrencyDialog().render(true)
    });
  }
  
  // Zwróć kontrolki bez modyfikacji (ważne!)
  return controls;
});

// Klasa okna dialogowego dla metawalut
class MetaCurrencyDialog extends Dialog {
  constructor() {
    super({
      title: game.i18n.localize("COGSYNDICATE.metacurrency.title"),
      content: "",
      buttons: {},
      default: null
    });
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      width: 300,
      height: "auto",
      resizable: true,
      classes: ["cogwheel", "meta-currency-dialog"]
    });
  }

  async getData() {
    return {
      nemesisPoints: game.cogwheelSyndicate.nemesisPoints,
      steamPoints: game.cogwheelSyndicate.steamPoints
    };
  }

  async _renderInner(data) {
    const html = await renderTemplate(
      "systems/cogwheel-syndicate/src/templates/meta-currency-dialog.hbs",
      data
    );
    return $(html);
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find(".nemesis-minus").click(() => this._updateMetaCurrency("nemesisPoints", -1));
    html.find(".nemesis-plus").click(() => this._updateMetaCurrency("nemesisPoints", 1));
    html.find(".steam-minus").click(() => this._updateMetaCurrency("steamPoints", -1));
    html.find(".steam-plus").click(() => this._updateMetaCurrency("steamPoints", 1));
  }

  async _updateMetaCurrency(currency, change) {
    const currentValue = game.cogwheelSyndicate[currency];
    const newValue = Math.clamp(currentValue + change, 0, 100);

    // Określ nazwę metawaluty dla komunikatu (z i18n)
    const currencyNameKey = currency === "nemesisPoints" ? "COGSYNDICATE.NemesisPoints" : "COGSYNDICATE.SteamPoints";
    const currencyName = game.i18n.localize(currencyNameKey);

    // Przygotuj komunikat na czat
    let messageKey = change < 0 ? "COGSYNDICATE.SpentMetaCurrency" : "COGSYNDICATE.AddedMetaCurrency";
    const message = game.i18n.format(messageKey, {
      user: game.user.name,
      currency: currencyName
    });

    // Wyślij komunikat na czat
    await ChatMessage.create({
      content: `<p>${message}</p>`,
      speaker: { alias: "Metawaluty" }
    });

    // Zaktualizuj wartość metawaluty
    game.cogwheelSyndicate[currency] = newValue;

    // Synchronizacja przez socket
    game.socket.emit("system.cogwheel-syndicate", {
      type: "updateMetaCurrencies",
      nemesisPoints: game.cogwheelSyndicate.nemesisPoints,
      steamPoints: game.cogwheelSyndicate.steamPoints
    });

    Hooks.call("cogwheelSyndicateMetaCurrenciesUpdated");

    this.render(true);
  }
}

// Hook do odświeżania metawalut
Hooks.on("cogwheelSyndicateMetaCurrenciesUpdated", () => {
  console.log("Hook triggered: cogwheelSyndicateMetaCurrenciesUpdated");
  for (let appId in ui.windows) {
    const window = ui.windows[appId];
    if (window instanceof MetaCurrencyDialog) {
      console.log(`Odświeżanie okna MetaCurrencyDialog o ID: ${appId}`);
      window.render(true);
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