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

    // Synchronizuj archetype.name przy zmianie wybranego archetypu
    this.element.querySelector('select[name="system.archetype.id"]')?.addEventListener('change', async (event) => {
      const archetypeId = event.currentTarget.value;
      const archetype = archetypeId ? game.items.get(archetypeId) : null;
      await this.item.update({ "system.archetype.name": archetype?.name ?? "" });
    });
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