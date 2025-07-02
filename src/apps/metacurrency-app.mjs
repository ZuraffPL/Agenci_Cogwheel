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
      width: 300,
      height: 200,
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
    
    return data;
  }

  activateListeners(html) {
    super.activateListeners(html);
    html.find('.metacurrency-increment').click(this._onIncrement.bind(this));
    html.find('.metacurrency-decrement').click(this._onDecrement.bind(this));
    html.find('.spend-np-btn').click(this._onSpendNP.bind(this));
    html.find('.spend-sp-btn').click(this._onSpendSP.bind(this));
  }

  async _onIncrement(event) {
    const key = event.currentTarget.dataset.key;
    const currentValue = game.cogwheelSyndicate[key] || 0;
    const maxValue = 100;
    
    if (currentValue < maxValue) {
      // Aktualizuj globalną wartość
      game.cogwheelSyndicate[key] = currentValue + 1;
      
      // Synchronizuj przez socket dla GM
      if (game.user.isGM) {
        game.socket.emit("system.cogwheel-syndicate", {
          type: "updateMetaCurrencies",
          nemesisPoints: game.cogwheelSyndicate.nemesisPoints,
          steamPoints: game.cogwheelSyndicate.steamPoints
        });
      }
      
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
      
      // Synchronizuj przez socket dla GM
      if (game.user.isGM) {
        game.socket.emit("system.cogwheel-syndicate", {
          type: "updateMetaCurrencies",
          nemesisPoints: game.cogwheelSyndicate.nemesisPoints,
          steamPoints: game.cogwheelSyndicate.steamPoints
        });
      }
      
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
    new Dialog({
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
      default: "spend"
    }, {
      classes: ["cogwheel", "spend-points-dialog", "spend-np-dialog"],
      width: 600,
      resizable: true
    }).render(true);
  }

  async _handleNPSpend(html) {
    const selectedAction = html.find('input[name="npAction"]:checked');
    
    if (!selectedAction.length) {
      ui.notifications.warn(game.i18n.localize("COGSYNDICATE.metacurrency.selectAction"));
      return;
    }

    const actionValue = selectedAction.val();
    const cost = parseInt(selectedAction.data('cost'));
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

    // Synchronizuj przez socket dla GM
    if (game.user.isGM) {
      game.socket.emit("system.cogwheel-syndicate", {
        type: "updateMetaCurrencies",
        nemesisPoints: game.cogwheelSyndicate.nemesisPoints,
        steamPoints: game.cogwheelSyndicate.steamPoints
      });
    }

    // Uzyskaj tłumaczenie akcji
    const actionText = game.i18n.localize(`COGSYNDICATE.metacurrency.action${actionValue}`);
    
    // Wyślij komunikat na czat
    const message = game.i18n.format("COGSYNDICATE.metacurrency.spentNP", {
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

    // Odśwież aplikację
    this.render(false);
    Hooks.call("cogwheelSyndicateMetaCurrenciesUpdated");

    // Dialog zamknie się automatycznie po callback
  }

  async _onSpendSP(event) {
    // Utwórz dialog wydawania punktów Pary
    new Dialog({
      title: game.i18n.localize("COGSYNDICATE.metacurrency.spendSPDialog"),
      content: await renderTemplate("systems/cogwheel-syndicate/src/templates/spend-sp-dialog.hbs", {}),
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
            // Tutaj będzie logika wydawania punktów
            ui.notifications.info("Funkcjonalność wydawania punktów Pary będzie dodana później.");
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
}

export { MetaCurrencyApp };