/**
 * TypeDataModel dla itemu typu "archetype".
 */
export class ArchetypeData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      description: new fields.HTMLField({ required: true, initial: "",
                     label: "COGSYNDICATE.Description" }),
      attributes: new fields.SchemaField({
        machine:     new fields.NumberField({ required: true, initial: 1, min: 1, integer: true,
                       label: "COGSYNDICATE.Machine" }),
        engineering: new fields.NumberField({ required: true, initial: 1, min: 1, integer: true,
                       label: "COGSYNDICATE.Engineering" }),
        intrigue:    new fields.NumberField({ required: true, initial: 1, min: 1, integer: true,
                       label: "COGSYNDICATE.Intrigue" }),
      }),
    };
  }
}

/**
 * TypeDataModel dla itemu typu "feat" (Atut).
 */
export class FeatData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      description: new fields.HTMLField({ required: true, initial: "",
                     label: "COGSYNDICATE.Description" }),
      type: new fields.StringField({
        required: true,
        initial: "initial",
        choices: () => ({
          initial:     game.i18n.localize("COGSYNDICATE.FeatInitial"),
          development: game.i18n.localize("COGSYNDICATE.FeatAdvanced"),
        }),
        label: "COGSYNDICATE.FeatType",
      }),
      effect: new fields.HTMLField({ required: true, initial: "",
                label: "COGSYNDICATE.FeatEffect" }),
      archetype: new fields.SchemaField({
        id:   new fields.StringField({ required: false, nullable: true, initial: null }),
        name: new fields.StringField({ required: false, initial: "" }),
      }),
    };
  }
}

/**
 * TypeDataModel dla itemu typu "equipment" (Wyposażenie).
 */
export class EquipmentItemData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      description: new fields.HTMLField({ required: true, initial: "",
                     label: "COGSYNDICATE.Description" }),
      type: new fields.StringField({
        required: true,
        initial: "weapon",
        choices: {
          weapon:  "COGSYNDICATE.EquipmentWeapon",
          armor:   "COGSYNDICATE.EquipmentArmor",
          tool:    "COGSYNDICATE.EquipmentTool",
          gadget:  "COGSYNDICATE.EquipmentGadget",
          other:   "COGSYNDICATE.EquipmentOther",
        },
        label: "COGSYNDICATE.EquipmentType",
      }),
      effect:        new fields.HTMLField({ required: true, initial: "" }),
      cost:          new fields.NumberField({ required: true, initial: 1, min: 0, integer: true,
                       label: "COGSYNDICATE.EquipmentCost" }),
      usage: new fields.StringField({
        required: true,
        initial: "Single",
        choices: {
          Single:     "COGSYNDICATE.EquipmentUsageSingle",
          Persistent: "COGSYNDICATE.EquipmentUsagePersistent",
          Consumable: "COGSYNDICATE.EquipmentUsageConsumable",
        },
        label: "COGSYNDICATE.EquipmentUsage",
      }),
      action:        new fields.StringField({ required: true, initial: "" }),
      usedDestroyed: new fields.BooleanField({ required: true, initial: false }),
      droppedDamaged:new fields.BooleanField({ required: true, initial: false }),
    };
  }
}
