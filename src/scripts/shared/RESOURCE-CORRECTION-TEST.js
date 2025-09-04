/**
 * RESOURCE AUTO-CORRECTION TEST EXAMPLES
 * 
 * This file demonstrates how the auto-correction system works
 * in both V1 and V2 actor sheets when attribute damage reduces
 * the maximum values of resources and equipment points.
 */

// Example scenarios where auto-correction will trigger:

const testScenarios = {
  
  // SCENARIO 1: Gear resource correction
  gearCorrection: {
    description: "Agent has 9/9 gear points, then receives Machine attribute damage",
    before: {
      "system.attributes.machine.base": 5,
      "system.attributes.machine.damage": 0, // V2 only
      "system.secondaryAttributes.endurance.value": 0, // V1 only  
      "system.resources.gear.value": 9,
      "system.resources.gear.max": 9, // 4 + 5 machine
      "system.resources.gear.basis": "machine"
    },
    damageApplied: {
      "system.attributes.machine.damage": 3 // V2: reduces effective machine to 2
      // OR in V1: secondary endurance damage reduces effective value
    },
    after: {
      "system.attributes.machine.value": 2, // effective after damage
      "system.resources.gear.max": 6, // 4 + 2 machine
      "system.resources.gear.value": 6 // AUTO-CORRECTED from 9 to 6
    },
    result: "✅ Gear automatically corrected from 9/6 to 6/6"
  },

  // SCENARIO 2: Equipment points are ALWAYS max 6 - NO auto-correction needed
  equipmentPoints: {
    description: "Equipment points always have maximum 6 regardless of attributes",
    note: "Equipment points do NOT depend on any attributes - they are separate mechanic",
    before: {
      "system.attributes.engineering.base": 4,
      "system.attributes.engineering.damage": 0,
      "system.equipmentPoints.value": 6,
      "system.equipmentPoints.max": 6 // ALWAYS 6
    },
    damageApplied: {
      "system.attributes.engineering.damage": 2 // This does NOT affect equipment points
    },
    after: {
      "system.attributes.engineering.value": 2, // Reduced due to damage
      "system.equipmentPoints.max": 6, // STILL 6 - unchanged
      "system.equipmentPoints.value": 6 // NO change - equipment points independent
    },
    result: "✅ Equipment points remain 6/6 - no attribute dependency"
  },

  // SCENARIO 3: Stress resource correction
  stressCorrection: {
    description: "Agent has 8/8 stress, then receives Intrigue damage",
    before: {
      "system.attributes.intrigue.base": 4,
      "system.attributes.intrigue.damage": 0,
      "system.resources.stress.value": 8,
      "system.resources.stress.max": 8 // 4 + 4 intrigue
    },
    damageApplied: {
      "system.attributes.intrigue.damage": 3 // reduces effective to 1
    },
    after: {
      "system.attributes.intrigue.value": 1,
      "system.resources.stress.max": 5, // 4 + 1 intrigue
      "system.resources.stress.value": 5 // AUTO-CORRECTED from 8 to 5  
    },
    result: "✅ Stress automatically corrected from 8/5 to 5/5"
  },

  // SCENARIO 3: Multiple corrections (but NOT equipment points)
  multipleCorrections: {
    description: "Multiple attribute damage affects gear and stress (equipment points unchanged)",
    before: {
      "system.attributes.machine.base": 3,
      "system.attributes.engineering.base": 3, 
      "system.attributes.intrigue.base": 3,
      "system.resources.gear.value": 7, // 4+3 machine
      "system.resources.stress.value": 7, // 4+3 intrigue
      "system.equipmentPoints.value": 6 // Always 6 regardless of engineering
    },
    damageApplied: {
      "system.attributes.machine.damage": 2, // machine: 3->1
      "system.attributes.engineering.damage": 1, // engineering: 3->2 (doesn't affect equipment)
      "system.attributes.intrigue.damage": 2 // intrigue: 3->1
    },
    after: {
      "system.resources.gear.max": 5, // 4+1 machine
      "system.resources.gear.value": 5, // AUTO-CORRECTED from 7
      "system.resources.stress.max": 5, // 4+1 intrigue
      "system.resources.stress.value": 5, // AUTO-CORRECTED from 7
      "system.equipmentPoints.max": 6, // ALWAYS 6 - no attribute dependency
      "system.equipmentPoints.value": 6 // NO CHANGE - independent of attributes
    },
    result: "✅ Gear and stress auto-corrected, equipment points unchanged (always 6/6)"
  }
};

// HOW THE AUTO-CORRECTION WORKS:

const implementationDetails = {
  location: "getData() method in both actor-sheet.js and actor-sheetv2.js",
  
  trigger: "Every time the actor sheet is rendered or data is refreshed",
  
  process: [
    "1. Calculate new maximum values based on current effective attributes",
    "2. Check if current resource values exceed their new maximums", 
    "3. Build update object for any corrections needed",
    "4. Apply corrections via actor.update() if any are found",
    "5. Update the data object to reflect corrected values immediately"
  ],
  
  correctedResources: [
    "system.resources.gear.value (based on machine attribute)",
    "system.resources.stress.value (based on intrigue attribute)"
    // NOTE: Equipment points are ALWAYS max 6 - no attribute dependency, no auto-correction needed
  ],
  
  logging: "Console.log shows when auto-corrections are applied",
  
  benefits: [
    "✅ Prevents invalid resource states (e.g. 8/6)",
    "✅ Automatic - no manual intervention required",
    "✅ Works in both V1 and V2 actor sheets", 
    "✅ Handles multiple corrections simultaneously",
    "✅ Transparent - logs when corrections occur"
  ]
};

console.log("Resource Auto-Correction System ready!");
console.log("Test scenarios:", testScenarios);
console.log("Implementation:", implementationDetails);
