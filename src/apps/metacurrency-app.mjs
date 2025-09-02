class MetaCurrencyApp extends Application {
  constructor(options = {}) {
    super(options);
    this._onUpdateMetaCurrencies = this._onUpdateMetaCurrencies.bind(this);
    Hooks.on("cogwheelSyndicateMetaCurrenciesUpdated", this._onUpdateMetaCurrencies);
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: `metacurrency-app-${Math.random().toString(36).substr(2, 9)}`,
      title: game.i18n.localize("COGSYNDICATE.metacurrency.title"),
      template: "systems/cogwheel-syndicate/src/templates/meta-currency-dialog.hbs",
      popOut: true,
      resizable: true,
      width: 320,
      height: 250,
      left: 20,
      top: window.innerHeight - 270,
      classes: ["cogwheel", "metacurrency-app"],
    });
  }

  getData() {
    const data = super.getData();
    data.metacurrencies = {
      steamPoints: { 
        value: game.cogwheelSyndicate.steamPoints ?? 1, 
        max: 100 
      },
      nemesisPoints: { 
        value: game.cogwheelSyndicate.nemesisPoints ?? 1, 
        max: 100 
      },
    };
    
    // Sprawdź uprawnienia użytkownika - tylko GM i Assistant GM mogą wydawać punkty Nemezis
    data.canSpendNP = game.user.isGM || game.user.role >= CONST.USER_ROLES.ASSISTANT;
    
    // Dodaj informacje o użyciach redukcji stresu
    data.stressUsesLeft = this._getStressUsesLeft();
    
    return data;
  }

  activateListeners(html) {
    super.activateListeners(html);
    html.find('.metacurrency-increment').click(this._onIncrement.bind(this));
    html.find('.metacurrency-decrement').click(this._onDecrement.bind(this));
    html.find('.spend-np-btn').click(this._onSpendNP.bind(this));
    html.find('.spend-sp-btn').click(this._onSpendSP.bind(this));
    html.find('.reset-stress-uses-btn').click(this._onResetStressUses.bind(this));
    
    // Obsługa bezpośredniej edycji wartości metawalut
    html.find('.meta-value-input').on('change blur', this._onValueChange.bind(this));
    html.find('.meta-value-input').on('keydown', this._onValueKeydown.bind(this));
    
    // Ustaw pozycję w lewym dolnym rogu po wyrenderowaniu
    this._updatePosition();
  }

  _updatePosition() {
    if (this.element && this.element.length > 0) {
      const element = this.element[0];
      if (element) {
        element.style.left = '20px';
        element.style.top = `${window.innerHeight - 270}px`;
      }
    }
  }

  async _onIncrement(event) {
    const key = event.currentTarget.dataset.key;
    const currentValue = game.cogwheelSyndicate[key] || 0;
    const maxValue = 100;
    
    if (currentValue < maxValue) {
      // Aktualizuj globalną wartość
      game.cogwheelSyndicate[key] = currentValue + 1;
      
      // Synchronizuj przez socket (wszyscy użytkownicy, nie tylko GM)
      game.socket.emit("system.cogwheel-syndicate", {
        type: "updateMetaCurrencies",
        nemesisPoints: game.cogwheelSyndicate.nemesisPoints,
        steamPoints: game.cogwheelSyndicate.steamPoints
      });
      
      // Wyślij komunikat na czat używając istniejących tłumaczeń
      const resourceName = key === 'steamPoints' ? 
        game.i18n.localize("COGSYNDICATE.SteamPoint") : 
        game.i18n.localize("COGSYNDICATE.NemesisPoint");
      
      const message = game.i18n.format("COGSYNDICATE.ResourceAdded", {
        actorName: game.user.name,
        resource: resourceName
      });
      
      // Określ kolor tła w zależności od typu punktów
      const bgColor = key === 'steamPoints' ? 'background-color: #e6f3ff;' : 'background-color: #ffe6e6;';
      
      ChatMessage.create({
        content: `<div style="padding: 8px; border-radius: 4px; ${bgColor}"><p style="margin: 0;">${message}</p></div>`,
        speaker: { alias: game.user.name }
      });
      
      // Odśwież aplikację
      this.render(false);
      Hooks.call("cogwheelSyndicateMetaCurrenciesUpdated");
    }
  }

  async _onDecrement(event) {
    const key = event.currentTarget.dataset.key;
    const currentValue = game.cogwheelSyndicate[key] || 0;
    
    if (currentValue > 0) {
      // Aktualizuj globalną wartość
      game.cogwheelSyndicate[key] = currentValue - 1;
      
      // Synchronizuj przez socket (wszyscy użytkownicy, nie tylko GM)
      game.socket.emit("system.cogwheel-syndicate", {
        type: "updateMetaCurrencies",
        nemesisPoints: game.cogwheelSyndicate.nemesisPoints,
        steamPoints: game.cogwheelSyndicate.steamPoints
      });
      
      // Wyślij komunikat na czat używając istniejących tłumaczeń
      const resourceName = key === 'steamPoints' ? 
        game.i18n.localize("COGSYNDICATE.SteamPoint") : 
        game.i18n.localize("COGSYNDICATE.NemesisPoint");
      
      const message = game.i18n.format("COGSYNDICATE.ResourceSpent", {
        actorName: game.user.name,
        resource: resourceName
      });
      
      // Określ kolor tła w zależności od typu punktów
      const bgColor = key === 'steamPoints' ? 'background-color: #e6f3ff;' : 'background-color: #ffe6e6;';
      
      ChatMessage.create({
        content: `<div style="padding: 8px; border-radius: 4px; ${bgColor}"><p style="margin: 0;">${message}</p></div>`,
        speaker: { alias: game.user.name }
      });
      
      // Odśwież aplikację
      this.render(false);
      Hooks.call("cogwheelSyndicateMetaCurrenciesUpdated");
    }
  }

  _onUpdateMetaCurrencies() {
    this.render(false); // Odśwież tylko gdy zmieniono metacurrencies
  }

  close(options = {}) {
    Hooks.off("cogwheelSyndicateMetaCurrenciesUpdated", this._onUpdateMetaCurrencies);
    return super.close(options);
  }

  static showApp() {
    const app = new MetaCurrencyApp();
    
    // Ustaw pozycję w lewym dolnym rogu
    app.options.left = 20;
    app.options.top = window.innerHeight - 270;
    
    app.render(true);
    return app;
  }

  async _onSpendNP(event) {
    // Sprawdź uprawnienia
    if (!game.user.isGM && game.user.role < CONST.USER_ROLES.ASSISTANT) {
      ui.notifications.warn(game.i18n.localize("COGSYNDICATE.metacurrency.noPermission"));
      return;
    }

    // Utwórz dialog wydawania punktów Nemezis
    const dialog = new Dialog({
      title: game.i18n.localize("COGSYNDICATE.metacurrency.spendNPDialog"),
      content: await renderTemplate("systems/cogwheel-syndicate/src/templates/spend-np-dialog.hbs", {}),
      buttons: {
        cancel: {
          label: game.i18n.localize("COGSYNDICATE.Cancel"),
          callback: () => {
            // Dialog zamknie się automatycznie
          }
        },
        spend: {
          label: game.i18n.localize("COGSYNDICATE.metacurrency.spendPoints"),
          callback: (html) => {
            this._handleNPSpend(html);
          }
        }
      },
      default: "spend",
      render: (html) => {
        // Dodaj event listenery dla niestandardowej akcji
        const customAmountInput = html.find('.custom-np-amount');
        const customRadio = html.find('input[name="npAction"][value="custom"]');
        
        // Automatycznie zaznacz radio button gdy użytkownik kliknie na input
        customAmountInput.on('focus click', () => {
          customRadio.prop('checked', true);
        });
        
        // Zaktualizuj atrybut data-cost gdy zmieni się wartość
        customAmountInput.on('input change', (e) => {
          const value = parseInt(e.target.value) || 1;
          customRadio.attr('data-cost', value);
        });
      }
    }, {
      classes: ["cogwheel", "spend-points-dialog", "spend-np-dialog"],
      width: 600,
      resizable: true
    });
    
    dialog.render(true);
  }

  async _handleNPSpend(html) {
    const selectedAction = html.find('input[name="npAction"]:checked');
    
    if (!selectedAction.length) {
      ui.notifications.warn(game.i18n.localize("COGSYNDICATE.metacurrency.selectAction"));
      return;
    }

    const actionValue = selectedAction.val();
    let cost;
    
    // Obsługa akcji niestandardowej
    if (actionValue === "custom") {
      const customAmountInput = html.find('.custom-np-amount');
      const customAmount = parseInt(customAmountInput.val());
      
      // Walidacja liczby punktów
      if (!customAmount || customAmount < 1 || customAmount > 10) {
        ui.notifications.warn(game.i18n.localize("COGSYNDICATE.metacurrency.invalidCustomAmount"));
        return;
      }
      
      cost = customAmount;
    } else {
      cost = parseInt(selectedAction.data('cost'));
    }
    
    const currentNP = game.cogwheelSyndicate.nemesisPoints || 0;

    // Sprawdź czy jest wystarczająco punktów
    if (currentNP < cost) {
      new Dialog({
        title: game.i18n.localize("COGSYNDICATE.metacurrency.insufficientNP"),
        content: `<div style="text-align: center; padding: 20px;">
          <p style="font-weight: bold; color: #d32f2f; font-size: 16px;">
            ${game.i18n.localize("COGSYNDICATE.metacurrency.insufficientNP")}
          </p>
        </div>`,
        buttons: {
          ok: {
            label: "OK",
            callback: () => {}
          }
        }
      }).render(true);
      return;
    }

    // Odejmij punkty z puli
    game.cogwheelSyndicate.nemesisPoints = currentNP - cost;

    // Synchronizuj przez socket (wszyscy użytkownicy, nie tylko GM)
    game.socket.emit("system.cogwheel-syndicate", {
      type: "updateMetaCurrencies",
      nemesisPoints: game.cogwheelSyndicate.nemesisPoints,
      steamPoints: game.cogwheelSyndicate.steamPoints
    });

    // Uzyskaj tłumaczenie akcji i utwórz komunikat
    let actionText, message;
    
    if (actionValue === "custom") {
      // Dla akcji niestandardowej użyj specjalnego komunikatu
      message = game.i18n.format("COGSYNDICATE.metacurrency.spentCustomNP", {
        userName: game.user.name,
        amount: cost
      });
      
      ChatMessage.create({
        content: `<div style="padding: 8px; border-radius: 4px; background-color: #ffe6e6;">
          <p style="margin: 0;">
            <strong>${game.user.name}</strong> wydał 
            <strong style="color: #d32f2f;">${cost} Punktów Nemezis</strong> na 
            <strong>akcję Przybocznego/Nemezis</strong>
          </p>
        </div>`,
        speaker: { alias: game.user.name }
      });
    } else {
      // Dla standardowych akcji użyj istniejącego komunikatu
      actionText = game.i18n.localize(`COGSYNDICATE.metacurrency.action${actionValue}`);
      
      message = game.i18n.format("COGSYNDICATE.metacurrency.spentNP", {
        userName: game.user.name,
        amount: cost,
        action: actionText
      });

      ChatMessage.create({
        content: `<div style="padding: 8px; border-radius: 4px; background-color: #ffe6e6;">
          <p style="margin: 0;">
            <strong>${game.user.name}</strong> wydał 
            <strong style="color: #d32f2f;">${cost} Punktów Nemezis</strong> na 
            <strong>${actionText}</strong>
          </p>
        </div>`,
        speaker: { alias: game.user.name }
      });
    }

    // Odśwież aplikację
    this.render(false);
    Hooks.call("cogwheelSyndicateMetaCurrenciesUpdated");

    // Dialog zamknie się automatycznie po callback
  }

  async _onSpendSP(event) {
    // Pobierz dane o użyciach redukcji stresu
    const stressUsesLeft = this._getStressUsesLeft();
    
    // Utwórz dialog wydawania punktów Pary
    new Dialog({
      title: game.i18n.localize("COGSYNDICATE.metacurrency.spendSPDialog"),
      content: await renderTemplate("systems/cogwheel-syndicate/src/templates/spend-sp-dialog.hbs", {
        stressUsesLeft: stressUsesLeft
      }),
      buttons: {
        cancel: {
          label: game.i18n.localize("COGSYNDICATE.Cancel"),
          callback: () => {
            // Dialog zamknie się automatycznie
          }
        },
        spend: {
          label: game.i18n.localize("COGSYNDICATE.metacurrency.spendPoints"),
          callback: (html) => {
            this._handleSPSpend(html);
          }
        }
      },
      default: "spend"
    }, {
      classes: ["cogwheel", "spend-points-dialog", "spend-sp-dialog"],
      width: 600,
      resizable: true
    }).render(true);
  }

  _getStressUsesLeft() {
    const usedThisSession = game.cogwheelSyndicate.stressReduceUsesThisSession || 0;
    return Math.max(0, 3 - usedThisSession);
  }

  async _handleSPSpend(html) {
    const selectedAction = html.find('input[name="spAction"]:checked');
    
    if (!selectedAction.length) {
      ui.notifications.warn(game.i18n.localize("COGSYNDICATE.metacurrency.selectAction"));
      return;
    }

    const actionValue = selectedAction.val();
    const cost = parseInt(selectedAction.data('cost'));
    const currentSP = game.cogwheelSyndicate.steamPoints || 0;

    // Sprawdź czy jest wystarczająco punktów
    if (currentSP < cost) {
      new Dialog({
        title: game.i18n.localize("COGSYNDICATE.spendSP.insufficientSP"),
        content: `<div style="text-align: center; padding: 20px;">
          <p style="font-weight: bold; color: #1976d2; font-size: 16px;">
            ${game.i18n.localize("COGSYNDICATE.spendSP.insufficientSP")}
          </p>
        </div>`,
        buttons: {
          ok: {
            label: "OK",
            callback: () => {}
          }
        }
      }).render(true);
      return;
    }

    // Specjalna logika dla redukcji stresu
    if (actionValue === 'reduce-stress') {
      const stressUsesLeft = this._getStressUsesLeft();
      if (stressUsesLeft <= 0) {
        ui.notifications.warn(game.i18n.localize("COGSYNDICATE.spendSP.usesExhausted"));
        return;
      }
      
      // Wykonaj redukcję stresu
      const stressReduced = await this._executeStressReduction();
      if (!stressReduced) {
        return; // Jeśli nie udało się zmniejszyć stresu, przerwij
      }
      
      // Zapisz użycie
      game.cogwheelSyndicate.stressReduceUsesThisSession = (game.cogwheelSyndicate.stressReduceUsesThisSession || 0) + 1;
      
      // Synchronizuj przez socket dla innych graczy
      game.socket.emit("system.cogwheel-syndicate", {
        type: "updateStressUses",
        stressReduceUsesThisSession: game.cogwheelSyndicate.stressReduceUsesThisSession
      });
    }

    // Odejmij punkty z puli
    game.cogwheelSyndicate.steamPoints = currentSP - cost;

    // Synchronizuj przez socket (wszyscy użytkownicy, nie tylko GM)
    game.socket.emit("system.cogwheel-syndicate", {
      type: "updateMetaCurrencies",
      nemesisPoints: game.cogwheelSyndicate.nemesisPoints,
      steamPoints: game.cogwheelSyndicate.steamPoints
    });

    // Uzyskaj tłumaczenie akcji
    let actionKey;
    switch(actionValue) {
      case 'boost-position':
        actionKey = 'COGSYNDICATE.spendSP.boostPosition';
        break;
      case 'help-agent':
        actionKey = 'COGSYNDICATE.spendSP.helpAgent';
        break;
      case 'ignore-critical-failure':
        actionKey = 'COGSYNDICATE.spendSP.ignoreCriticalFailure';
        break;
      case 'ignore-trauma':
        actionKey = 'COGSYNDICATE.spendSP.ignoreTrauma';
        break;
      case 'reduce-stress':
        actionKey = 'COGSYNDICATE.spendSP.reduceStress';
        break;
      case 'reduce-threat-clock':
        actionKey = 'COGSYNDICATE.spendSP.reduceThreatClock';
        break;
      case 'advance-progress-clock':
        actionKey = 'COGSYNDICATE.spendSP.advanceProgressClock';
        break;
      default:
        actionKey = 'COGSYNDICATE.spendSP.unknownAction';
    }
    
    const actionText = game.i18n.localize(actionKey);
    
    // Wyślij komunikat na czat
    const message = game.i18n.format("COGSYNDICATE.spendSP.spentSP", {
      userName: game.user.name,
      amount: cost,
      action: actionText
    });

    ChatMessage.create({
      content: `<div style="padding: 8px; border-radius: 4px; background-color: #e6f3ff;">
        <p style="margin: 0;">
          <strong>${game.user.name}</strong> wydał 
          <strong style="color: #1976d2;">${cost} Punktów Pary</strong> na 
          <strong>${actionText}</strong>
        </p>
      </div>`,
      speaker: { alias: game.user.name }
    });

    // Odśwież aplikację
    this.render(false);
    Hooks.call("cogwheelSyndicateMetaCurrenciesUpdated");
  }

  async _executeStressReduction() {
    // Znajdź aktora gracza - najpierw sprawdź przypisanego aktora, potem kontrolowanych tokenów
    let actor = null;
    
    // 1. Sprawdź czy gracz ma przypisanego aktora
    if (game.user.character) {
      actor = game.user.character;
    } else {
      // 2. Sprawdź kontrolowane tokeny
      const controlledActors = canvas.tokens.controlled.map(token => token.actor).filter(actor => actor?.type === 'character');
      if (controlledActors.length > 0) {
        actor = controlledActors[0];
      }
    }
    
    if (!actor) {
      ui.notifications.warn("Musisz mieć przypisanego aktora lub wybrać token aktora, aby zmniejszyć jego stres.");
      return false;
    }

    const currentStress = actor.system.resources.stress.value || 0;
    const stressReduction = Math.min(2, currentStress); // Maksymalnie 2, ale nie mniej niż 0
    const newStress = Math.max(0, currentStress - stressReduction);

    // Aktualizuj stres aktora
    await actor.update({
      "system.resources.stress.value": newStress
    });

    // Wyślij komunikat o redukcji stresu
    ChatMessage.create({
      content: `<div style="padding: 8px; border-radius: 4px; background-color: #e6f3ff;">
        <p style="margin: 0;">
          Agent <strong>${actor.name}</strong> wydał 
          <strong style="color: #1976d2;">1 Punkt Pary</strong> żeby zmniejszyć 
          <strong style="color: #d32f2f;">Stres</strong> o 
          <strong>${stressReduction}</strong> punktów
        </p>
      </div>`,
      speaker: { alias: game.user.name }
    });
    
    return true; // Zwróć true jeśli operacja się powiodła
  }

  async _onResetStressUses(event) {
    game.cogwheelSyndicate.stressReduceUsesThisSession = 0;
    
    // Synchronizuj przez socket dla innych graczy
    game.socket.emit("system.cogwheel-syndicate", {
      type: "updateStressUses",
      stressReduceUsesThisSession: game.cogwheelSyndicate.stressReduceUsesThisSession
    });
    
    // Wyślij komunikat na czat
    ChatMessage.create({
      content: `<div style="padding: 8px; border-radius: 4px; background-color: #f3e5f5;">
        <p style="margin: 0;">
          <strong>GM</strong> zresetował licznik użyć redukcji stresu
        </p>
      </div>`,
      speaker: { alias: "System" }
    });
    
    this.render(false);
  }

  async _onValueChange(event) {
    const key = event.currentTarget.dataset.key;
    const newValue = parseInt(event.currentTarget.value) || 0;
    const maxValue = 100;
    
    // Walidacja wartości
    const validValue = Math.max(0, Math.min(maxValue, newValue));
    
    if (validValue !== newValue) {
      event.currentTarget.value = validValue;
    }
    
    const oldValue = game.cogwheelSyndicate[key] || 0;
    
    if (validValue !== oldValue) {
      // Aktualizuj globalną wartość
      game.cogwheelSyndicate[key] = validValue;
      
      // Synchronizuj przez socket (wszyscy użytkownicy, nie tylko GM)
      game.socket.emit("system.cogwheel-syndicate", {
        type: "updateMetaCurrencies",
        nemesisPoints: game.cogwheelSyndicate.nemesisPoints,
        steamPoints: game.cogwheelSyndicate.steamPoints
      });
      
      // Wyślij komunikat na czat
      const resourceName = key === 'steamPoints' ? 
        game.i18n.localize("COGSYNDICATE.SteamPoint") : 
        game.i18n.localize("COGSYNDICATE.NemesisPoint");
      
      const diff = validValue - oldValue;
      const bgColor = key === 'steamPoints' ? 'background-color: #e6f3ff;' : 'background-color: #ffe6e6;';
      
      if (diff > 0) {
        const message = game.i18n.format("COGSYNDICATE.ResourceAdded", {
          actorName: game.user.name,
          resource: `${diff} ${resourceName}`
        });
        
        ChatMessage.create({
          content: `<div style="padding: 8px; border-radius: 4px; ${bgColor}"><p style="margin: 0;">${message}</p></div>`,
          speaker: { alias: game.user.name }
        });
      } else if (diff < 0) {
        const message = game.i18n.format("COGSYNDICATE.ResourceSpent", {
          actorName: game.user.name,
          resource: `${Math.abs(diff)} ${resourceName}`
        });
        
        ChatMessage.create({
          content: `<div style="padding: 8px; border-radius: 4px; ${bgColor}"><p style="margin: 0;">${message}</p></div>`,
          speaker: { alias: game.user.name }
        });
      }
      
      // Odśwież aplikację
      this.render(false);
      Hooks.call("cogwheelSyndicateMetaCurrenciesUpdated");
    }
  }

  _onValueKeydown(event) {
    // Pozwól na Enter, aby zatwierdzić zmiany
    if (event.key === 'Enter') {
      event.currentTarget.blur(); // To wywoła zdarzenie change
    }
    
    // Pozwól na Escape, aby anulować zmiany
    if (event.key === 'Escape') {
      const key = event.currentTarget.dataset.key;
      const currentValue = game.cogwheelSyndicate[key] || 0;
      event.currentTarget.value = currentValue;
      event.currentTarget.blur();
    }
  }
}

// --- OBSŁUGA SOCKETÓW: synchronizacja metawalut u wszystkich graczy ---
if (game.socket) {
  game.socket.on("system.cogwheel-syndicate", (data) => {
    if (data?.type === "updateMetaCurrencies") {
      // Zaktualizuj wartości globalne
      if (typeof data.nemesisPoints === "number") game.cogwheelSyndicate.nemesisPoints = data.nemesisPoints;
      if (typeof data.steamPoints === "number") game.cogwheelSyndicate.steamPoints = data.steamPoints;
      Hooks.call("cogwheelSyndicateMetaCurrenciesUpdated");
    }
    if (data?.type === "updateStressUses") {
      if (typeof data.stressReduceUsesThisSession === "number") game.cogwheelSyndicate.stressReduceUsesThisSession = data.stressReduceUsesThisSession;
      Hooks.call("cogwheelSyndicateMetaCurrenciesUpdated");
    }
  });
}

export { MetaCurrencyApp };