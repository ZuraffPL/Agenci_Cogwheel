// src/scripts/init.js
import { registerHandlebarsHelpers } from "./handlebars.mjs";
import { openDoomClocks, DoomClocksDialog } from "./clocks.mjs"; // Import funkcji otwierającej zegary i klasy dialogu
import { MetaCurrencyApp } from "../apps/metacurrency-app.mjs";
import { FeatsEffects } from "./feats-effects.mjs"; // Import systemu efektów atutów
import { getConsequencesMessage, showConsequencesSelectionDialog, POSITIONS, RESULT_TYPES } from "./consequences.mjs"; // Import systemu konsekwencji

// Globalne udostępnienie klasy DoomClocksDialog dla hooków
window.DoomClocksDialog = DoomClocksDialog;

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
  
  // Dodaj moduł konsekwencji do globalnego obiektu
  game.cogwheelSyndicate.consequences = {
    getConsequencesMessage,
    showConsequencesSelectionDialog,
    POSITIONS,
    RESULT_TYPES
  };

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
    // Reset metawalut - sprawdź ile aktywnych agentów pary ma atut Wsparcie
    game.cogwheelSyndicate.nemesisPoints = 1;
    
    // Check how many Steam Agents with active player owners have Support feat
    const activeSteamAgents = game.actors.filter(actor => {
      // Must be agent type
      if (!(actor.type === 'agent' || actor.type === 'agentv2')) return false;
      
      // Must be Steam Agent archetype
      if (!actor.system.archetype?.name?.toLowerCase().includes('agent pary')) return false;
      
      // Check if any active user owns this actor
      const hasActiveOwner = game.users.filter(user => user.active && !user.isGM).some(user => {
        const ownership = actor.ownership[user.id];
        return ownership === CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER;
      });
      
      return hasActiveOwner;
    });
    
    // Count Steam Agents with Support feat
    const supportCount = activeSteamAgents.filter(agent => {
      const feats = agent.system.feats || [];
      const hasSupport = feats.some(featId => {
        const featItem = game.items.get(featId);
        const itemName = featItem?.name?.toLowerCase() || '';
        return itemName.includes('wsparcie');
      });
      return hasSupport;
    }).length;
    
    // Base Steam Points (1) + 1 for each Steam Agent with Support
    const startingSteamPoints = 1 + supportCount;
    
    game.cogwheelSyndicate.steamPoints = startingSteamPoints;

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

  const metaButton = `<button class="meta-currency-btn" title="${game.i18n.localize('COGSYNDICATE.metacurrency.title')}"><i class="fas fa-coins"></i> ${game.i18n.localize('COGSYNDICATE.metacurrency.open')}</button>`;
  const clockButton = `<button class="doom-clocks-btn" title="${game.i18n.localize('COGSYNDICATE.DoomClocksTitle')}"><i class="fas fa-clock"></i> ${game.i18n.localize('COGSYNDICATE.DoomClocksTitle')}</button>`;

  const header = html[0].querySelector(".directory-header");
  if (!header.querySelector(".meta-currency-btn")) {
    header.insertAdjacentHTML('beforeend', metaButton);
  }
  if (!header.querySelector(".doom-clocks-btn")) {
    header.insertAdjacentHTML('beforeend', clockButton);
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
  console.log("getSceneControlButtons hook called");
  
  // W Foundry v13 controls to object, nie array
  // Znajdź lub utwórz grupę Cogwheel bezpośrednio w object
  if (!controls.cogwheel) {
    controls.cogwheel = {
      name: "cogwheel",
      title: "Cogwheel Syndicate",
      icon: "fas fa-cog",
      layer: "controls",
      tools: [],
      visible: true
    };
  }
  
  const cogwheelControls = controls.cogwheel;
  
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
      visible: true
    });
  }
  
  if (!metaToolExists) {
    // Dodaj narzędzie metawalut
    cogwheelControls.tools.push({
      name: "meta-currency", 
      title: game.i18n.localize("COGSYNDICATE.metacurrency.title"),
      icon: "fas fa-coins",
      button: true,
      visible: true
    });
  }
  
  // Dla object controls nie potrzebujemy zwracać niczego
  // Foundry automatycznie użyje zmodyfikowanego object
});

// Hook do obsługi kliknięć w scene controls
Hooks.on("renderSceneControls", (controls, html, data) => {
  console.log("renderSceneControls hook called");
  
  // Konwertuj native DOM element na jQuery
  const $html = $(html);
  
  // Znajdź i obsłuż kliknięcia na nasze przyciski
  $html.find('[data-tool="doom-clocks"]').off('click').on('click', () => {
    console.log("Doom clocks button clicked via renderSceneControls!");
    try {
      openDoomClocks();
    } catch (error) {
      console.error("Error opening doom clocks:", error);
    }
  });
  
  $html.find('[data-tool="meta-currency"]').off('click').on('click', () => {
    console.log("Meta currency button clicked via renderSceneControls!");
    try {
      MetaCurrencyApp.showApp();
    } catch (error) {
      console.error("Error opening meta currency:", error);
    }
  });
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

// Hook do debugowania przewijania czatu - WŁĄCZONY
Hooks.on("ready", () => {
  console.log("Cogwheel Syndicate: System ready");
  
  // Opóźnij sprawdzenie chat-log, żeby UI się w pełni załadowało
  setTimeout(() => {
    console.log("Cogwheel Syndicate: Sprawdzanie przewijania czatu");
    
    // Foundry v13 changed chat-log selector
    const chatLog = document.getElementById('chat-log') || 
                   document.querySelector('.chat-scroll') ||
                   document.querySelector('[data-application-part="log"]');
    if (chatLog) {
      console.log("Chat log found:", chatLog);
      console.log("Chat log styles:", {
        overflow: window.getComputedStyle(chatLog).overflow,
        overflowY: window.getComputedStyle(chatLog).overflowY,
        height: window.getComputedStyle(chatLog).height,
        maxHeight: window.getComputedStyle(chatLog).maxHeight,
        pointerEvents: window.getComputedStyle(chatLog).pointerEvents
      });
      
      // Dodaj test event listener na wheel
      chatLog.addEventListener('wheel', function(e) {
        console.log("Wheel event on chat log:", e);
        console.log("Delta Y:", e.deltaY);
        console.log("Scroll top before:", chatLog.scrollTop);
        console.log("Scroll height:", chatLog.scrollHeight);
        console.log("Client height:", chatLog.clientHeight);
      });
      
      // Test kliknięcia w chat
      chatLog.addEventListener('click', function(e) {
        console.log("Click event on chat log:", e);
      });
      
    } else {
      console.warn("Chat log still not found after timeout!");
      
      // Spróbuj znaleźć alternatywne selektory
      const chatAlternatives = [
        '#chat',
        '.chat-log', 
        '#sidebar #chat',
        '#ui-right #chat',
        '#sidebar .chat',
        '.sidebar .chat-log',
        '[data-tab="chat"]',
        '.app.sidebar #chat'
      ];
      
      chatAlternatives.forEach(selector => {
        const element = document.querySelector(selector);
        if (element) {
          console.log(`Found chat element with selector: ${selector}`, element);
          console.log(`Element styles:`, {
            display: window.getComputedStyle(element).display,
            visibility: window.getComputedStyle(element).visibility,
            opacity: window.getComputedStyle(element).opacity,
            overflow: window.getComputedStyle(element).overflow,
            overflowY: window.getComputedStyle(element).overflowY,
            pointerEvents: window.getComputedStyle(element).pointerEvents
          });
        }
      });
      
      // Spróbuj też znaleźć chat-log jako dziecko
      const chatContainer = document.querySelector('#chat');
      if (chatContainer) {
        console.log("Chat container found:", chatContainer);
        const chatLogChild = chatContainer.querySelector('[id*="log"], [class*="log"], ol, ul');
        if (chatLogChild) {
          console.log("Chat log child found:", chatLogChild);
        }
      }
    }
  }, 2000); // 2 sekundy opóźnienia
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