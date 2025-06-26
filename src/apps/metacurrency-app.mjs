class MetaCurrencyApp extends Application {
  constructor(actor, options = {}) {
    super(options);
    this.actor = actor;
    this._onUpdateActor = this._onUpdateActor.bind(this);
    Hooks.on("updateActor", this._onUpdateActor);
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: `metacurrency-app-${Math.random().toString(36).substr(2, 9)}`,
      title: game.i18n.localize("cogwheel.metacurrency.title"),
      template: "systems/cogwheel-syndicate/src/templates/metacurrency-app.hbs",
      popOut: true,
      resizable: true,
      width: 300,
      height: 200,
      classes: ["cogwheel", "metacurrency-app"],
    });
  }

  getData() {
    const data = super.getData();
    data.actor = this.actor;
    data.metacurrencies = this.actor.system.metacurrencies || {
      steamPoints: { value: 0, max: 5 },
      nemesisPoints: { value: 0, max: 3 },
    };
    return data;
  }

  activateListeners(html) {
    super.activateListeners(html);
    html.find('.metacurrency-increment').click(this._onIncrement.bind(this));
    html.find('.metacurrency-decrement').click(this._onDecrement.bind(this));
  }

  async _onIncrement(event) {
    const key = event.currentTarget.dataset.key;
    const metacurrency = this.actor.system.metacurrencies[key];
    if (metacurrency && metacurrency.value < metacurrency.max) {
      await this.actor.update({ [`system.metacurrencies.${key}.value`]: metacurrency.value + 1 });
    }
  }

  async _onDecrement(event) {
    const key = event.currentTarget.dataset.key;
    const metacurrency = this.actor.system.metacurrencies[key];
    if (metacurrency && metacurrency.value > 0) {
      await this.actor.update({ [`system.metacurrencies.${key}.value`]: metacurrency.value - 1 });
    }
  }

  _onUpdateActor(updatedActor, data) {
    if (updatedActor.id === this.actor.id && data.system?.metacurrencies) {
      this.render(false); // Odśwież tylko, jeśli zmieniono metacurrencies
    }
  }

  close(options = {}) {
    Hooks.off("updateActor", this._onUpdateActor);
    return super.close(options);
  }

  static showApp(actor) {
    const app = new MetaCurrencyApp(actor);
    app.render(true);
    return app;
  }
}

export { MetaCurrencyApp };