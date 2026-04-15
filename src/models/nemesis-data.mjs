/**
 * TypeDataModel dla aktora typu "nemesis".
 */
export class NemesisData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;

    return {
      influenceRange: new fields.StringField({
        required: true,
        initial: "Lokalny",
        choices: {
          Lokalny:          "COGSYNDICATE.InfluenceLocal",
          Międzynarodowy:   "COGSYNDICATE.InfluenceInternational",
          Globalny:         "COGSYNDICATE.InfluenceGlobal",
        },
        label: "COGSYNDICATE.InfluenceRange",
      }),

      organizationType:   new fields.StringField({ required: true, initial: "",
                            label: "COGSYNDICATE.OrganizationType" }),
      leaderDescription:  new fields.StringField({ required: true, initial: "",
                            label: "COGSYNDICATE.LeaderDescription" }),
      organizationGoal:   new fields.HTMLField({ required: true, initial: "",
                            label: "COGSYNDICATE.OrganizationGoal" }),

      clocks: new fields.SchemaField({
        goal: new fields.SchemaField({
          value:       new fields.NumberField({ required: true, initial: 0, min: 0, integer: true }),
          max:         new fields.NumberField({ required: true, initial: 8, min: 1, integer: true }),
          description: new fields.StringField({ required: true, initial: "" }),
        }),
        weakening: new fields.SchemaField({
          value: new fields.NumberField({ required: true, initial: 0, min: 0, integer: true }),
          max:   new fields.NumberField({ required: true, initial: 4, min: 1, integer: true }),
        }),
        revenge: new fields.SchemaField({
          value: new fields.NumberField({ required: true, initial: 0, min: 0, integer: true }),
          max:   new fields.NumberField({ required: true, initial: 6, min: 1, integer: true }),
        }),
      }),

      minions: new fields.ArrayField(
        new fields.ObjectField(),
        { required: true, initial: [] }
      ),

      notes: new fields.HTMLField({ required: true, initial: "" }),
    };
  }

  prepareDerivedData() {
    // Dostosuj rozmiary zegarów do zasięgu wpływów
    switch (this.influenceRange) {
      case "Lokalny":
        this.clocks.goal.max    = 8;
        this.clocks.weakening.max = 4;
        this.clocks.revenge.max = 6;
        break;
      case "Międzynarodowy":
        this.clocks.goal.max    = 12;
        this.clocks.weakening.max = 6;
        this.clocks.revenge.max = 8;
        break;
      case "Globalny":
        this.clocks.goal.max    = 16;
        this.clocks.weakening.max = 8;
        this.clocks.revenge.max = 12;
        break;
    }
  }
}
