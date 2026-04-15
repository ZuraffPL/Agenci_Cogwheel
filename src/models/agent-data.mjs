/**
 * TypeDataModel dla typów aktora: agent (V1) i agentv2 (V2).
 * Oba typy mają identyczną strukturę danych — różnią się wyłącznie arkuszem i CSS.
 *
 * Pole `damage` przechowuje uszkodzenia atrybutu: liczba całkowita 0–(base) lub ciąg "T"
 * (traumatyczny paraliż atrybutu). Używamy StringField żeby umożliwić wartość "T".
 */
export class AgentData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;

    // Schema pola atrybutu z obrażeniami
    const attributeSchema = () => new fields.SchemaField({
      base:   new fields.NumberField({ required: true, initial: 1, min: 1, integer: true,
                label: "COGSYNDICATE.AttributeBase" }),
      value:  new fields.NumberField({ required: true, initial: 1, min: 0, integer: true,
                label: "COGSYNDICATE.AttributeValue" }),
      // damage to liczba (0–base) lub ciąg "T" — musi być StringField
      damage: new fields.StringField({ required: true, initial: "0",
                label: "COGSYNDICATE.Damage" }),
    });

    // Schema pola drugorzędnego atrybutu (pochodna, przechowywana dla V1 UI)
    const secondarySchema = () => new fields.SchemaField({
      value: new fields.NumberField({ required: true, initial: 0, min: 0, integer: true }),
    });

    return {
      archetype: new fields.SchemaField({
        id:   new fields.StringField({ required: false, nullable: true, initial: null }),
        name: new fields.StringField({ required: true, initial: "" }),
        img:  new fields.StringField({ required: false, nullable: true, initial: null }),
      }),

      attributes: new fields.SchemaField({
        machine:     attributeSchema(),
        engineering: attributeSchema(),
        intrigue:    attributeSchema(),
      }),

      // secondaryAttributes — pochodne od atrybutów głównych, przechowywane do odczytu przez V1 UI
      secondaryAttributes: new fields.SchemaField({
        endurance:     secondarySchema(),
        control:       secondarySchema(),
        determination: secondarySchema(),
      }),

      resources: new fields.SchemaField({
        gear: new fields.SchemaField({
          value: new fields.NumberField({ required: true, initial: 0, min: 0, integer: true,
                   label: "COGSYNDICATE.Gear" }),
          max:   new fields.NumberField({ required: true, initial: 4, min: 0, integer: true }),
          basis: new fields.StringField({ required: true, initial: "machine",
                   choices: { machine: "COGSYNDICATE.Machine", engineering: "COGSYNDICATE.Engineering", intrigue: "COGSYNDICATE.Intrigue" },
                   label: "COGSYNDICATE.GearBasis" }),
        }),
        stress: new fields.SchemaField({
          value: new fields.NumberField({ required: true, initial: 0, min: 0, integer: true,
                   label: "COGSYNDICATE.Stress" }),
          max:   new fields.NumberField({ required: true, initial: 4, min: 0, integer: true }),
        }),
        trauma: new fields.SchemaField({
          value: new fields.NumberField({ required: true, initial: 0, min: 0, integer: true,
                   label: "COGSYNDICATE.Trauma" }),
          max:   new fields.NumberField({ required: true, initial: 4, min: 0, integer: true }),
        }),
        development: new fields.SchemaField({
          value: new fields.NumberField({ required: true, initial: 0, min: 0, integer: true,
                   label: "COGSYNDICATE.Development" }),
          max:   new fields.NumberField({ required: true, initial: 12, min: 0, integer: true }),
        }),
      }),

      equipmentPoints: new fields.SchemaField({
        value: new fields.NumberField({ required: true, initial: 6, min: 0, integer: true }),
        max:   new fields.NumberField({ required: true, initial: 6, min: 0, integer: true }),
      }),

      // Tablica ID itemów typu "feat" (referencje, nie embedded)
      feats: new fields.ArrayField(
        new fields.StringField({ required: true }),
        { required: true, initial: [] }
      ),

      // Tablica obiektów traumy (embedded, nie items)
      traumas: new fields.ArrayField(
        new fields.ObjectField(),
        { required: true, initial: [] }
      ),

      // Tablica obiektów wyposażenia (embedded)
      equipments: new fields.ArrayField(
        new fields.ObjectField(),
        { required: true, initial: [] }
      ),

      notes: new fields.HTMLField({ required: true, initial: "" }),
    };
  }

  /**
   * Oblicza efektywną wartość atrybutu (base minus damage).
   * Wartość "T" oznacza całkowity paraliż — efektywna wartość = 0.
   * @param {string} attrName  "machine" | "engineering" | "intrigue"
   * @returns {number}
   */
  getEffectiveAttribute(attrName) {
    const attr = this.attributes[attrName];
    if (!attr) return 0;
    const base = attr.base ?? 1;
    const raw = attr.damage;
    const dmg = (raw === "T") ? base : (parseInt(raw, 10) || 0);
    return Math.max(0, base - dmg);
  }

  /**
   * Normalizuje wartości damage w atrybutach po wczytaniu danych.
   * Ujemne wartości legacy → wartość bezwzględna.
   * Wartość "T" — zachowana.
   */
  prepareDerivedData() {
    for (const attrName of ["machine", "engineering", "intrigue"]) {
      const attr = this.attributes[attrName];
      if (attr.damage !== "T") {
        const parsed = parseInt(attr.damage, 10);
        attr.damage = isNaN(parsed) ? "0" : String(Math.abs(parsed));
      }
      // Oblicz i zapisz efektywną wartość atrybutu
      attr.value = this.getEffectiveAttribute(attrName);
    }

    // Zaktualizuj maks. zasobów zależne od atrybutów
    const gearBasis = this.resources.gear.basis || "machine";
    this.resources.gear.max    = Math.max(4, 4 + this.getEffectiveAttribute(gearBasis));
    this.resources.stress.max  = Math.max(4, 4 + this.getEffectiveAttribute("intrigue"));
    this.resources.trauma.max  = 4;
    this.resources.development.max = 12;

    // Synchronizuj atrybuty drugorzędne (V1 UI)
    this.secondaryAttributes.endurance.value     = this.getEffectiveAttribute("machine");
    this.secondaryAttributes.control.value       = this.getEffectiveAttribute("engineering");
    this.secondaryAttributes.determination.value = this.getEffectiveAttribute("intrigue");
  }
}
