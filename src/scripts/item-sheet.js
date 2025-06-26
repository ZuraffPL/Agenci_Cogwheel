class CogwheelArchetypeSheet extends ItemSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      template: "systems/cogwheel-syndicate/src/templates/archetype-sheet.hbs",
      classes: ["cogwheel", "sheet", "item"],
      width: 500,
      height: 400,
      submitOnChange: true,
      submitOnClose: true
    });
  }

  getData() {
    const data = super.getData();
    data.system = data.item.system;
    // Ustaw domyślną ikonę, jeśli nie istnieje
    if (!data.item.img || data.item.img === "icons/svg/item-bag.svg") {
      data.item.img = "icons/svg/mystery-man-black.svg";
    }
    return data;
  }

  async _onCreate(data, options, userId) {
    await super._onCreate(data, options, userId);
    // Ustawienie domyślnej ikony dla nowego archetypu
    await this.item.update({ "img": "icons/svg/mystery-man-black.svg" });
  }

  activateListeners(html) {
    super.activateListeners(html);
    // Obsługa zmiany ikony po kliknięciu
    html.find('.profile-img').click(async (event) => {
      const filePicker = new FilePicker({
        type: "image",
        callback: async (path) => {
          await this.item.update({ "img": path });
        }
      });
      filePicker.render(true);
    });
  }
}

class CogwheelFeatSheet extends ItemSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      template: "systems/cogwheel-syndicate/src/templates/feat-sheet.hbs",
      classes: ["cogwheel", "sheet", "item"],
      width: 500,
      height: 400,
      submitOnChange: true,
      submitOnClose: true
    });
  }

  getData() {
    const data = super.getData();
    data.system = data.item.system;
    // Ustaw domyślną ikonę, jeśli nie istnieje
    if (!data.item.img || data.item.img === "icons/svg/item-bag.svg") {
      data.item.img = "icons/svg/card-joker.svg";
    }
    return data;
  }

  async _onCreate(data, options, userId) {
    await super._onCreate(data, options, userId);
    // Ustawienie domyślnej ikony dla nowego atutu
    await this.item.update({ "img": "icons/svg/card-joker.svg" });
  }
}

Items.registerSheet("cogwheel-syndicate", CogwheelArchetypeSheet, {
  types: ["archetype"],
  makeDefault: true,
  label: "Cogwheel Archetype Sheet"
});

Items.registerSheet("cogwheel-syndicate", CogwheelFeatSheet, {
  types: ["feat"],
  makeDefault: true,
  label: "Cogwheel Feat Sheet"
});