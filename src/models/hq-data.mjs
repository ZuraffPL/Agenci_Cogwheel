/**
 * TypeDataModel dla aktora typu "HQ" (Baza agentów).
 */
export class HQData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;

    const sectionSchema = () => new fields.SchemaField({
      level:       new fields.NumberField({ required: true, initial: 0, min: 0, integer: true }),
      isDestroyed: new fields.BooleanField({ required: true, initial: false }),
    });

    return {
      locationsPrimary: new fields.ArrayField(
        new fields.ObjectField(),
        { required: true, initial: [] }
      ),
      locationsAdditional: new fields.ArrayField(
        new fields.ObjectField(),
        { required: true, initial: [] }
      ),
      expansionProjects: new fields.ArrayField(
        new fields.ObjectField(),
        { required: true, initial: [] }
      ),
      primarySections: new fields.SchemaField({
        infirmary:     sectionSchema(),
        crewQuarters:  sectionSchema(),
        trainingHalls: sectionSchema(),
        workshop:      sectionSchema(),
      }),
      notes: new fields.HTMLField({ required: true, initial: "" }),
    };
  }
}
