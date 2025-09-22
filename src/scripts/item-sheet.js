// Foundry v13 compatibility - use same pattern as chlopcy-rpg
const BaseItemSheet =
  typeof foundry?.appv1?.sheets?.ItemSheet !== "undefined"
    ? foundry.appv1.sheets.ItemSheet
    : ItemSheet;

console.log("Cogwheel Archetype: Selected BaseItemSheet:", BaseItemSheet.name);

class CogwheelArchetypeSheet extends BaseItemSheet {
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
    html[0].querySelector('.profile-img').addEventListener('click', async (event) => {
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

class CogwheelFeatSheet extends BaseItemSheet {
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
    
    // Pobierz dostępne archetypy
    data.availableArchetypes = game.items.filter(item => item.type === "archetype");
    
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

  async _updateObject(event, formData) {
    // Jeśli zmieniono archetyp, zaktualizuj jego nazwę
    if (formData["system.archetype.id"]) {
      const archetype = game.items.get(formData["system.archetype.id"]);
      if (archetype) {
        formData["system.archetype.name"] = archetype.name;
      }
    } else {
      // Jeśli nie wybrano archetypu, wyczyść nazwę
      formData["system.archetype.name"] = "";
    }
    
    return super._updateObject(event, formData);
  }
}

// Foundry v13 compatibility for registration - use same pattern as chlopcy-rpg
const CHLOPCYCONFIG_ITEMS = {
  Items: typeof foundry?.documents?.collections?.Items !== "undefined" 
    ? foundry.documents.collections.Items 
    : Items,
  ItemSheet: typeof foundry?.appv1?.sheets?.ItemSheet !== "undefined"
    ? foundry.appv1.sheets.ItemSheet
    : ItemSheet
};

// Rejestracja arkuszy z kompatybilnością
CHLOPCYCONFIG_ITEMS.Items.registerSheet("cogwheel-syndicate", CogwheelArchetypeSheet, {
  types: ["archetype"],
  makeDefault: true,
  label: "Cogwheel Archetype Sheet"
});

CHLOPCYCONFIG_ITEMS.Items.registerSheet("cogwheel-syndicate", CogwheelFeatSheet, {
  types: ["feat"],
  makeDefault: true,
  label: "Cogwheel Feat Sheet"
});