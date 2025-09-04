/**
 * PRZYKŁAD UŻYCIA WSPÓLNYCH FUNKCJI
 * 
 * Ten plik pokazuje, jak można dostosować wspólne funkcje dla różnych
 * wersji kart postaci bez modyfikowania podstawowej logiki.
 */

// PRZYKŁAD 1: Dostosowanie dla v2 z dodatkową logiką
/*
async _onSpendGear(event) {
  event.preventDefault();
  
  await ActorGearFunctions.handleSpendGear(this.actor, this, {
    // Custom validation - tylko v2 może wydawać "ultra-heavy" gear
    validateGearCost: (gearType, gearCost, steamCost, currentGear, currentSteam) => {
      if (gearType === 'ultra-heavy' && gearCost > 4) {
        return {
          valid: false,
          message: "Agent v2 nie może wydać więcej niż 4 punkty na ultra-heavy gear!"
        };
      }
      
      // Użyj standardowej walidacji dla innych przypadków
      if (currentGear < gearCost) {
        return {
          valid: false,
          message: game.i18n.format("COGSYNDICATE.ErrorInsufficientGear", {
            required: gearCost, 
            available: currentGear
          })
        };
      }
      
      return { valid: true };
    },
    
    // Custom message formatting - v2 ma inne komunikaty
    formatMessage: (gearType, gearCost, steamCost, actorName) => {
      return `<strong>Agent v2 ${actorName}</strong> wykorzystał zaawansowany sprzęt: <em>${gearType}</em> (${gearCost} punktów)`;
    },
    
    // Custom success callback - dodatkowe akcje po wydaniu gear
    onSuccess: (gearType, gearCost, steamCost, newGearValue) => {
      // Dodaj specjalny efekt dla v2
      if (gearType === 'steampunk-gadget') {
        ui.notifications.info("Steampunk gadget aktywowany! Bonus do następnego rzutu.");
      }
    }
  });
}
*/

// PRZYKŁAD 2: Dostosowanie dla v1 z ograniczeniami
/*
async _onSpendGearShared(event) {
  event.preventDefault();
  
  await ActorGearFunctions.handleSpendGear(this.actor, this, {
    // v1 ma ograniczenia - nie może wydawać więcej niż 2 punkty na raz
    validateGearCost: (gearType, gearCost, steamCost, currentGear, currentSteam) => {
      if (gearCost > 2) {
        return {
          valid: false,
          message: "Agent v1 może wydać maksymalnie 2 punkty sprzętu na raz!"
        };
      }
      
      // Standardowa walidacja
      if (currentGear < gearCost) {
        return {
          valid: false,
          message: game.i18n.format("COGSYNDICATE.ErrorInsufficientGear", {
            required: gearCost, 
            available: currentGear
          })
        };
      }
      
      return { valid: true };
    },
    
    // Prosty komunikat dla v1
    formatMessage: (gearType, gearCost, steamCost, actorName) => {
      return `${actorName} użył podstawowego sprzętu (${gearCost} punktów)`;
    }
  });
}
*/

// PRZYKŁAD 3: Dostosowanie stresu dla przyszłych wersji
/*
async _onSpendStress(event) {
  event.preventDefault();
  
  await ActorStressFunctions.handleSpendStress(this.actor, this, {
    // Custom trauma warning dla v3 - może mieć inne podejście do traumy
    onTraumaWarning: async (actor, currentStress, stressCost, maxStress) => {
      // v3 może automatycznie zarządzać traumą
      const autoManageTrauma = await new Promise(resolve => {
        new Dialog({
          title: "Agent v3 - Zarządzanie Traumą",
          content: `<p>Agent v3 może automatycznie zarządzać traumą. Czy chcesz włączyć auto-management?</p>`,
          buttons: {
            auto: {
              label: "Auto-manage",
              callback: () => resolve({ proceed: true, autoManage: true })
            },
            manual: {
              label: "Manual",
              callback: () => resolve({ proceed: true, autoManage: false })
            },
            cancel: {
              label: "Cancel",
              callback: () => resolve({ proceed: false })
            }
          }
        }).render(true);
      });
      
      return autoManageTrauma;
    },
    
    // Custom success dla v3
    onSuccess: (stressAction, stressCost, steamBonus, finalStressValue, traumaOccurred) => {
      if (traumaOccurred) {
        ui.notifications.warn("Agent v3: Trauma aktywowana - dostępne nowe zdolności!");
      }
    }
  });
}
*/

// PRZYKŁAD 4: Kompletnie nowa wersja v4 z własną logiką
/*
async _onSpendGear(event) {
  event.preventDefault();
  
  // v4 może mieć kompletnie inną mechanikę
  const isAdvancedGearSystemEnabled = this.actor.getFlag('cogwheel-syndicate', 'advancedGearSystem');
  
  if (isAdvancedGearSystemEnabled) {
    // Użyj kompletnie nowej logiki dla v4
    await this._handleAdvancedGearSpending(event);
  } else {
    // Fallback do wspólnej funkcji
    await ActorGearFunctions.handleSpendGear(this.actor, this, {
      // Podstawowe dostosowania dla v4
    });
  }
}
*/

export const ExampleCustomizations = {
  // Te przykłady pokazują elastyczność systemu
  // Każda wersja karty może łatwo dostosować funkcjonalność
  // bez modyfikowania podstawowej logiki
};
