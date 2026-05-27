// Karty itemów — przepisane na ItemSheetV2 (Foundry VTT v13)

// ─── Karta Archetypu ────────────────────────────────────────────────────────
class CogwheelArchetypeSheet extends foundry.applications.api.HandlebarsApplicationMixin(
  foundry.applications.sheets.ItemSheetV2
) {
  static DEFAULT_OPTIONS = {
    classes: ["cogwheel", "sheet", "item", "archetype"],
    position: { width: 500, height: 420 },
    window: { resizable: true },
    form: { submitOnChange: true },
  };

  static PARTS = {
    main: {
      template: "systems/cogwheel-syndicate/src/templates/archetype-sheet.hbs",
    },
  };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    context.item = this.item;
    context.system = this.item.system;
    context.systemFields = this.item.system.schema.fields;
    return context;
  }

  _onRender(context, options) {
    this.element.querySelector('.profile-img')?.addEventListener('click', () => {
      const fp = new FilePicker({
        type: "image",
        callback: async (path) => { await this.item.update({ img: path }); },
      });
      fp.render(true);
    });
  }
}

// ─── Karta Atutu ────────────────────────────────────────────────────────────
class CogwheelFeatSheet extends foundry.applications.api.HandlebarsApplicationMixin(
  foundry.applications.sheets.ItemSheetV2
) {
  static DEFAULT_OPTIONS = {
    classes: ["cogwheel", "sheet", "item", "feat"],
    position: { width: 500, height: 460 },
    window: { resizable: true },
    form: { submitOnChange: true },
  };

  static PARTS = {
    main: {
      template: "systems/cogwheel-syndicate/src/templates/feat-sheet.hbs",
    },
  };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    context.item = this.item;
    context.system = this.item.system;
    context.systemFields = this.item.system.schema.fields;
    context.availableArchetypes = game.items.filter(i => i.type === "archetype");
    return context;
  }

  _onRender(context, options) {
    this.element.querySelector('.profile-img')?.addEventListener('click', () => {
      const fp = new FilePicker({
        type: "image",
        callback: async (path) => { await this.item.update({ img: path }); },
      });
      fp.render(true);
    });

    this._setupDescriptionAutoGrow();

  }

  _setupDescriptionAutoGrow() {
    const textarea = this.element.querySelector('textarea[name="system.effect"]');
    if (!textarea) return;

    const minHeight = 140;
    const maxTextareaHeight = Math.floor(window.innerHeight * 0.55);

    const resize = () => {
      textarea.style.height = "auto";
      const target = Math.max(minHeight, Math.min(textarea.scrollHeight, maxTextareaHeight));
      textarea.style.height = `${target}px`;
      textarea.style.overflowY = textarea.scrollHeight > maxTextareaHeight ? "auto" : "hidden";

      const body = this.element.querySelector('.sheet-body');
      if (!body) return;

      const appPadding = 170;
      const maxWindowHeight = Math.floor(window.innerHeight * 0.9);
      const desiredHeight = Math.min(maxWindowHeight, Math.ceil(body.scrollHeight + appPadding));
      this.setPosition({ height: desiredHeight });
    };

    resize();
    textarea.addEventListener("input", resize);
  }

  // Uzupełniamy archetype.name przed walidacją (w _processFormData, nie _processSubmitData)
  // submitData jest tu już zagnieżdżonym obiektem (po expandObject), więc używamy setProperty
  _processFormData(event, form, formData) {
    const data = super._processFormData(event, form, formData);
    const archetypeId = foundry.utils.getProperty(data, "system.archetype.id");
    if (archetypeId !== undefined) {
      const archetype = archetypeId ? game.items.get(archetypeId) : null;
      foundry.utils.setProperty(data, "system.archetype.name", archetype?.name ?? "");
    }
    return data;
  }
}

// ─── Rejestracja ────────────────────────────────────────────────────────────
foundry.documents.collections.Items.registerSheet("cogwheel-syndicate", CogwheelArchetypeSheet, {
  types: ["archetype"],
  makeDefault: true,
  label: "Cogwheel Archetype Sheet",
});

foundry.documents.collections.Items.registerSheet("cogwheel-syndicate", CogwheelFeatSheet, {
  types: ["feat"],
  makeDefault: true,
  label: "Cogwheel Feat Sheet",
});