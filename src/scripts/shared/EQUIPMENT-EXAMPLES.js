/**
 * PRZYKŁADY DOSTOSOWAŃ - ActorEquipmentFunctions
 * 
 * Ten plik pokazuje jak dostosować funkcje sprzętu dla różnych wersji kart
 * lub specjalnych wymagań, bez modyfikowania wspólnego kodu.
 */

// =============================================================================
// PRZYKŁAD 1: Karta V1 z domyślnym zachowaniem (jak teraz)
// =============================================================================

async _onAddEquipment(event) {
  event.preventDefault();
  await ActorEquipmentFunctions.handleAddEquipment(this.actor, this, {
    // Brak opcji = domyślne zachowanie V1
    // - Ścisła walidacja (name i action wymagane, z trimem)
    // - Błędy w dialogu
    // - Wiadomość chat po dodaniu
    // - Renderowanie po sukcesie
  });
}

// =============================================================================
// PRZYKŁAD 2: Karta V2 z uproszczoną walidacją
// =============================================================================

async _onAddEquipment(event) {
  event.preventDefault();
  await ActorEquipmentFunctions.handleAddEquipment(this.actor, this, {
    validateInput: (formData, html, config) => {
      // V2: Brak ścisłej walidacji
      return { valid: true };
    },
    
    showValidationError: (html, message) => {
      // V2: Błędy jako powiadomienia zamiast w dialogu
      ui.notifications.warn(message);
    },
    
    processEquipmentData: (formData, config) => ({
      name: formData.name, // Bez trim()
      type: formData.type,
      cost: formData.cost || 1,
      usage: formData.usage,
      action: formData.action, // Bez trim()
      used: false,
      droppedDamaged: false,
      destroyed: false
    })
  });
}

// =============================================================================
// PRZYKŁAD 3: Przyszła karta V3 z nowymi funkcjami
// =============================================================================

async _onAddEquipment(event) {
  event.preventDefault();
  await ActorEquipmentFunctions.handleAddEquipment(this.actor, this, {
    // V3: Custom walidacja z nowymi regułami
    validateInput: (formData, html, config) => {
      if (!formData.name || !formData.name.trim()) {
        return { valid: false, message: "V3: Nazwa jest wymagana!" };
      }
      
      // V3: Nowa reguła - broń musi mieć akcję
      if (formData.type === 'weapon' && !formData.action) {
        return { valid: false, message: "V3: Broń musi mieć opisaną akcję!" };
      }
      
      return { valid: true };
    },
    
    // V3: Custom koszty na podstawie typu agenta
    validateCost: (cost, availablePoints, actor, config) => {
      // V3: Tech Genius ma 50% zniżki
      if (actor.system.archetype === 'tech-genius') {
        const discountedCost = Math.ceil(cost / 2);
        if (discountedCost > availablePoints) {
          return {
            valid: false,
            message: `V3: Potrzebujesz ${discountedCost} punktów (z techniczną zniżką 50%)`
          };
        }
      } else if (cost > availablePoints) {
        return {
          valid: false,
          message: "V3: Niewystarczające punkty sprzętu"
        };
      }
      
      return { valid: true };
    },
    
    // V3: Dodatkowe pola w sprzęcie
    processEquipmentData: (formData, config) => ({
      name: formData.name.trim(),
      type: formData.type,
      cost: formData.cost,
      usage: formData.usage,
      action: formData.action.trim(),
      used: false,
      droppedDamaged: false,
      destroyed: false,
      // V3: Nowe pola
      techLevel: formData.techLevel || 1,
      reliability: formData.reliability || 'standard',
      modificationSlots: formData.type === 'weapon' ? 2 : 1
    }),
    
    // V3: Zaawansowane powiadomienia
    onSuccess: async (equipment, actor, sheet, config) => {
      const techBonus = actor.system.archetype === 'tech-genius' ? ' (z techniczną zniżką!)' : '';
      
      await ChatMessage.create({
        content: `
          <div style="background: linear-gradient(45deg, #2d5a87, #1e3a5f); padding: 15px; border-radius: 8px; color: white;">
            <h3 style="margin: 0 0 10px 0;">🔧 V3 Equipment System</h3>
            <p><strong>${actor.name}</strong> dodał <strong>${equipment.name}</strong>${techBonus}</p>
            <p style="font-size: 0.9em; opacity: 0.9;">
              Typ: ${equipment.type} | Koszt: ${equipment.cost} | Level Tech: ${equipment.techLevel}
            </p>
          </div>
        `,
        speaker: { actor: actor.id }
      });
      
      // V3: Auto-zapisz po dodaniu sprzętu
      if (game.settings.get('cogwheel-syndicate', 'v3AutoSave')) {
        game.world.saveData();
      }
      
      sheet.render();
    }
  });
}

// =============================================================================
// PRZYKŁAD 4: Specjalna karta "Smuggler" z ukrytym sprzętem
// =============================================================================

async _onAddEquipment(event) {
  event.preventDefault();
  await ActorEquipmentFunctions.handleAddEquipment(this.actor, this, {
    // Smuggler może dodać sprzęt "ukryty" za podwójny koszt
    equipmentDefaults: {
      name: "", type: "weapon", cost: "1", usage: "Single", 
      action: "", used: false, droppedDamaged: false, destroyed: false,
      hidden: false // Smuggler-specific field
    },
    
    validateCost: (cost, availablePoints, actor, config) => {
      // Jeśli sprzęt ma być ukryty, koszt x2
      const isHidden = html.find('[name="hidden"]').is(':checked');
      const finalCost = isHidden ? cost * 2 : cost;
      
      if (finalCost > availablePoints) {
        return {
          valid: false,
          message: `Potrzebujesz ${finalCost} punktów${isHidden ? ' (ukrycie x2)' : ''}`
        };
      }
      
      return { valid: true };
    },
    
    processEquipmentData: (formData, config) => ({
      ...config.equipmentDefaults,
      name: formData.name.trim(),
      type: formData.type,
      cost: formData.cost,
      usage: formData.usage,
      action: formData.action.trim(),
      hidden: formData.hidden || false // Smuggler can hide equipment
    }),
    
    onSuccess: async (equipment, actor, sheet, config) => {
      const hiddenText = equipment.hidden ? ' 🕵️‍♂️ (UKRYTE)' : '';
      
      await ChatMessage.create({
        content: `<p><strong>${actor.name}</strong> przemycił <strong>${equipment.name}</strong>${hiddenText}</p>`,
        speaker: { actor: actor.id },
        whisper: equipment.hidden ? [game.user.id] : [] // Whisper if hidden
      });
      
      sheet.render();
    }
  });
}

// =============================================================================
// PRZYKŁAD 5: Funkcja _onDeleteEquipment z potwierdzeniem
// =============================================================================

async _onDeleteEquipment(event) {
  event.preventDefault();
  const index = parseInt(event.currentTarget.closest('.equipment-item').dataset.index);
  
  await ActorEquipmentFunctions.handleDeleteEquipment(this.actor, this, index, {
    confirmDelete: true, // Włącz potwierdzenie
    
    // Custom refund calculation
    calculateRefund: (equipment, actor, config) => {
      // Ekspert-mechanik odzyskuje 100% kosztów
      if (actor.system.archetype === 'tech-genius') {
        return parseInt(equipment.cost, 10);
      }
      
      // Inne archetypy odzyskują tylko 50%
      return Math.floor(parseInt(equipment.cost, 10) / 2);
    },
    
    onSuccess: async (equipment, refund, actor, sheet, config) => {
      const refundText = refund > 0 ? ` (odzyskano ${refund} punktów)` : '';
      
      await ChatMessage.create({
        content: `<p><strong>${actor.name}</strong> pozbywa się <strong>${equipment.name}</strong>${refundText}</p>`,
        speaker: { actor: actor.id }
      });
      
      sheet.render();
    }
  });
}

// =============================================================================
// PRZYKŁAD 6: Funkcja _onEditEquipment z logowaniem zmian
// =============================================================================

async _onEditEquipment(event) {
  event.preventDefault();
  const index = parseInt(event.currentTarget.closest('.equipment-item').dataset.index);
  
  await ActorEquipmentFunctions.handleEditEquipment(this.actor, this, index, {
    onSuccess: async (newEquipment, oldEquipment, actor, sheet, config) => {
      // Loguj zmiany w chacie
      const changes = [];
      
      if (oldEquipment.name !== newEquipment.name) {
        changes.push(`nazwa: ${oldEquipment.name} → ${newEquipment.name}`);
      }
      
      if (oldEquipment.cost !== newEquipment.cost) {
        changes.push(`koszt: ${oldEquipment.cost} → ${newEquipment.cost}`);
      }
      
      if (oldEquipment.action !== newEquipment.action) {
        changes.push(`akcja zaktualizowana`);
      }
      
      if (changes.length > 0) {
        await ChatMessage.create({
          content: `
            <p><strong>${actor.name}</strong> zmodyfikował sprzęt:</p>
            <ul>${changes.map(change => `<li>${change}</li>`).join('')}</ul>
          `,
          speaker: { actor: actor.id }
        });
      }
      
      sheet.render();
    }
  });
}

// =============================================================================
// PRZYKŁAD 7: Kompletna custom implementacja dla "Master Craftsman"
// =============================================================================

// Archetypie "Master Craftsman" może tworzyć własny sprzęt z unikalnymi właściwościami
async _onAddEquipment(event) {
  event.preventDefault();
  
  // Sprawdź czy to Master Craftsman
  if (this.actor.system.archetype !== 'master-craftsman') {
    // Fallback do normalnej funkcji
    return await ActorEquipmentFunctions.handleAddEquipment(this.actor, this, {});
  }
  
  // Master Craftsman ma własny dialog
  const craftingDialog = await renderTemplate(
    "systems/cogwheel-syndicate/src/templates/master-craftsman-equipment-dialog.hbs",
    { materials: this.actor.system.materials, tools: this.actor.system.tools }
  );
  
  // Custom implementacja dla Master Craftsman
  new Dialog({
    title: "Stwórz Sprzęt - Master Craftsman",
    content: craftingDialog,
    buttons: {
      cancel: { label: "Anuluj", callback: () => {} },
      craft: {
        label: "Stwórz",
        callback: async (html) => {
          // Master Craftsman logic...
          const craftingResult = await this._processCraftingAttempt(html);
          
          if (craftingResult.success) {
            // Użyj wspólnej funkcji do finalnego dodania
            await ActorEquipmentFunctions.handleAddEquipment(this.actor, this, {
              equipmentDefaults: craftingResult.equipment,
              validateCost: () => ({ valid: true }), // Master Craftsman nie płaci punktów
              onSuccess: async (equipment, actor, sheet, config) => {
                await ChatMessage.create({
                  content: `🛠️ <strong>${actor.name}</strong> wykował <strong>${equipment.name}</strong>! Jakość: ${craftingResult.quality}`,
                  speaker: { actor: actor.id }
                });
                sheet.render();
              }
            });
          }
        }
      }
    }
  }).render(true);
}

/**
 * PODSUMOWANIE:
 * 
 * System ActorEquipmentFunctions pozwala na:
 * 
 * 1. ✅ Identyczne działanie na kartach V1 i V2 (domyślnie)
 * 2. ✅ Łatwe dostosowania per wersja karty
 * 3. ✅ Dodawanie nowych funkcji bez modyfikacji wspólnego kodu
 * 4. ✅ Zachowanie kompatybilności z przyszłymi wersjami
 * 5. ✅ Możliwość kompletnych custom implementacji
 * 
 * Każda karta może wybrać poziom dostosowania:
 * - Brak opcji = domyślne zachowanie
 * - Wybrane opcje = częściowe dostosowanie
 * - Custom implementacja = pełna kontrola
 */
