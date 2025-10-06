/**
 * Consequences System for Cogwheel Syndicate
 * Handles calculation and display of consequences based on position and test result
 */

/**
 * Position types for tests
 */
export const POSITIONS = {
  CONTROLLED: 'controlled',
  RISKY: 'risky',
  DESPERATE: 'desperate'
};

/**
 * Result types that trigger consequences
 */
export const RESULT_TYPES = {
  SUCCESS_WITH_COST: 'successWithCost',
  FAILURE_WITH_CONSEQUENCE: 'failureWithConsequence',
  CRITICAL_FAILURE: 'criticalFailure'
};

/**
 * Consequences table based on position and result
 */
const CONSEQUENCES_TABLE = {
  [POSITIONS.CONTROLLED]: {
    [RESULT_TYPES.SUCCESS_WITH_COST]: { consequences: 1, trauma: false },
    [RESULT_TYPES.FAILURE_WITH_CONSEQUENCE]: { consequences: 2, trauma: false },
    [RESULT_TYPES.CRITICAL_FAILURE]: { consequences: 3, trauma: false }
  },
  [POSITIONS.RISKY]: {
    [RESULT_TYPES.SUCCESS_WITH_COST]: { consequences: 2, trauma: false },
    [RESULT_TYPES.FAILURE_WITH_CONSEQUENCE]: { consequences: 3, trauma: false },
    [RESULT_TYPES.CRITICAL_FAILURE]: { consequences: 4, trauma: false }
  },
  [POSITIONS.DESPERATE]: {
    [RESULT_TYPES.SUCCESS_WITH_COST]: { consequences: 3, trauma: false },
    [RESULT_TYPES.FAILURE_WITH_CONSEQUENCE]: { consequences: 4, trauma: false },
    [RESULT_TYPES.CRITICAL_FAILURE]: { consequences: 4, trauma: true }
  }
};

/**
 * Calculate consequences based on position and result type
 * @param {string} position - The fictional position (controlled, risky, desperate)
 * @param {string} resultType - The result type (successWithCost, failureWithConsequence, criticalFailure)
 * @returns {Object} Object with consequences count and trauma flag
 */
export function calculateConsequences(position, resultType) {
  // Validate inputs
  if (!CONSEQUENCES_TABLE[position]) {
    console.warn(`[Consequences] Invalid position: ${position}. Defaulting to controlled.`);
    position = POSITIONS.CONTROLLED;
  }

  if (!CONSEQUENCES_TABLE[position][resultType]) {
    console.warn(`[Consequences] Invalid result type: ${resultType} for position ${position}. No consequences.`);
    return { consequences: 0, trauma: false };
  }

  return CONSEQUENCES_TABLE[position][resultType];
}

/**
 * Format consequences message for chat display
 * @param {number} consequences - Number of consequences
 * @param {boolean} trauma - Whether trauma is included
 * @returns {string} Formatted HTML message
 */
export function formatConsequencesMessage(consequences, trauma) {
  if (consequences === 0 && !trauma) {
    return '';
  }

  // Get localized strings
  const consequenceSingular = game.i18n.localize('COGWHEEL.Consequences.Singular');
  const consequenceGenitive = game.i18n.localize('COGWHEEL.Consequences.Genitive');
  const consequencePlural = game.i18n.localize('COGWHEEL.Consequences.Plural');
  const traumaText = game.i18n.localize('COGWHEEL.Consequences.Trauma');

  // Determine form: 1 = singular, 2-4 = genitive, 5+ = plural (Polish grammar)
  let consequenceWord;
  if (consequences === 1) {
    consequenceWord = consequenceSingular;
  } else if (consequences >= 2 && consequences <= 4) {
    consequenceWord = consequenceGenitive;
  } else {
    consequenceWord = consequencePlural;
  }

  // Build message
  let message = `<span class="consequence-count">${consequences}</span> ${consequenceWord}`;

  if (trauma) {
    message += ` + <span class="consequence-trauma">1 ${traumaText}</span>`;
  }

  return `<div class="consequence-message">
    <i class="fas fa-exclamation-triangle"></i>
    ${message}
  </div>`;
}

/**
 * Get consequences and format message in one call
 * @param {string} position - The fictional position
 * @param {string} resultType - The result type
 * @returns {string} Formatted HTML message or empty string
 */
export function getConsequencesMessage(position, resultType) {
  const { consequences, trauma } = calculateConsequences(position, resultType);
  return formatConsequencesMessage(consequences, trauma);
}

/**
 * Determine result type from roll result
 * This is a helper function to map roll outcomes to consequence trigger types
 * @param {number} successes - Number of successes rolled
 * @param {boolean} isCriticalFailure - Whether it's a critical failure
 * @returns {string|null} Result type or null if no consequences
 */
export function determineResultType(successes, isCriticalFailure) {
  if (isCriticalFailure) {
    return RESULT_TYPES.CRITICAL_FAILURE;
  }

  // Based on typical Forged in the Dark success levels
  if (successes === 0) {
    return RESULT_TYPES.FAILURE_WITH_CONSEQUENCE;
  }

  if (successes >= 1 && successes <= 3) {
    // Partial success - could be success with cost depending on context
    return RESULT_TYPES.SUCCESS_WITH_COST;
  }

  // Full success (4-5) or critical (6+) - no consequences
  return null;
}

/**
 * Show consequence selection dialog with 10 consequence types
 * @param {Actor} actor - The actor selecting consequences
 * @param {number} consequenceCount - Number of consequences to select (1-4)
 * @param {string} messageId - Chat message ID to update
 * @param {HTMLButtonElement} button - The button that was clicked
 */
export async function showConsequencesSelectionDialog(actor, consequenceCount, messageId, button) {
  // Check if current user is GM
  const isGM = game.user.isGM;
  
  // Get active consequences state from settings
  let activeConsequences = game.settings.get("cogwheel-syndicate", "activeConsequences");
  
  // 10 consequence types
  const consequenceTypes = [
    game.i18n.localize('COGWHEEL.Consequences.Type1'),
    game.i18n.localize('COGWHEEL.Consequences.Type2'),
    game.i18n.localize('COGWHEEL.Consequences.Type3'),
    game.i18n.localize('COGWHEEL.Consequences.Type4'),
    game.i18n.localize('COGWHEEL.Consequences.Type5'),
    game.i18n.localize('COGWHEEL.Consequences.Type6'),
    game.i18n.localize('COGWHEEL.Consequences.Type7'),
    game.i18n.localize('COGWHEEL.Consequences.Type8'),
    game.i18n.localize('COGWHEEL.Consequences.Type9'),
    game.i18n.localize('COGWHEEL.Consequences.Type10')
  ];

  // Function to generate dialog content
  const generateContent = () => {
    // Create dialog content with checkboxes and optional GM toggle buttons
    const checkboxesHtml = consequenceTypes.map((type, index) => {
      const isActive = activeConsequences[index];
      
      return `
      <div class="consequence-row" data-index="${index}" style="margin: 8px 0; display: flex; align-items: center; gap: 8px; ${!isActive ? 'opacity: 0.5;' : ''}">
        ${isGM ? `
          <button type="button" class="consequence-toggle-btn ${isActive ? 'active' : 'inactive'}" data-index="${index}" 
            title="${game.i18n.localize('COGWHEEL.Consequences.ToggleTooltip')}"
            style="flex-shrink: 0; width: 28px; height: 28px; border-radius: 4px; border: 2px solid ${isActive ? '#27ae60' : '#7f8c8d'}; background: linear-gradient(135deg, ${isActive ? '#27ae60 0%, #229954 100%' : '#95a5a6 0%, #7f8c8d 100%'}); cursor: pointer; transition: all 0.3s ease;">
            <i class="fas ${isActive ? 'fa-check' : 'fa-times'}" style="color: white; font-size: 14px;"></i>
          </button>
        ` : ''}
        <label style="display: flex; align-items: center; ${isActive ? 'cursor: pointer;' : 'cursor: not-allowed;'} flex: 1;">
          <input type="checkbox" name="consequence" value="${index}" class="consequence-checkbox" 
            style="margin-right: 8px;" ${!isActive ? 'disabled' : ''}>
          <span class="consequence-label" style="${!isActive ? 'opacity: 0.4; text-decoration: line-through;' : ''}">${type}</span>
        </label>
      </div>
      `;
    }).join('');

    return `
      <form>
        <div style="font-family: 'Palatino Linotype', serif;">
          ${isGM ? `
            <div class="gm-info-box" style="background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%); border: 2px solid #d4af37; border-radius: 6px; padding: 10px; margin-bottom: 12px;">
              <p style="margin: 0; color: #d4af37; font-weight: bold; font-size: 13px;">
                <i class="fas fa-crown" style="margin-right: 6px;"></i>
                ${game.i18n.localize('COGWHEEL.Consequences.GMOnly')}
              </p>
              <p style="margin: 6px 0 0 0; color: #ecf0f1; font-size: 12px;">
                ${game.i18n.localize('COGWHEEL.Consequences.GMInfo')}
              </p>
            </div>
          ` : ''}
          <p style="margin-bottom: 12px; font-weight: bold; color: #d4af37;">
            ${game.i18n.format('COGWHEEL.Consequences.SelectUpTo', { count: consequenceCount })}
          </p>
          <div style="max-height: 400px; overflow-y: auto; padding: 5px;">
            ${checkboxesHtml}
          </div>
          <p id="selection-counter" style="margin-top: 10px; font-weight: bold; color: #3498db;">
            ${game.i18n.localize('COGSYNDICATE.Selected')}: 0 / ${consequenceCount}
          </p>
        </div>
      </form>
    `;
  };

  // Store dialog reference for refresh
  let currentDialog = null;

  // Function to refresh dialog content (only updates consequence rows, preserves dialog structure)
  const refreshDialog = () => {
    if (!currentDialog || !currentDialog.element) return;
    
    activeConsequences = game.settings.get("cogwheel-syndicate", "activeConsequences");
    
    const form = currentDialog.element.querySelector('form');
    if (!form) return;
    
    // Update each consequence row individually
    const consequenceRows = form.querySelectorAll('.consequence-row');
    consequenceRows.forEach((row, index) => {
      const isActive = activeConsequences[index];
      const toggleBtn = row.querySelector('.consequence-toggle-btn');
      const label = row.querySelector('.consequence-label');
      const checkbox = row.querySelector('.consequence-checkbox');
      const labelElement = row.querySelector('label');
      
      // Update row opacity
      row.style.opacity = isActive ? '1' : '0.5';
      
      if (isGM && toggleBtn) {
        // Update toggle button appearance
        const icon = toggleBtn.querySelector('i');
        if (icon) {
          icon.className = `fas ${isActive ? 'fa-check' : 'fa-times'}`;
        }
        toggleBtn.style.borderColor = isActive ? '#27ae60' : '#7f8c8d';
        toggleBtn.style.background = `linear-gradient(135deg, ${isActive ? '#27ae60 0%, #229954 100%' : '#95a5a6 0%, #7f8c8d 100%'})`;
        toggleBtn.title = game.i18n.localize('COGWHEEL.Consequences.ToggleTooltip') + 
                          ` (${game.i18n.localize(isActive ? 'COGWHEEL.Consequences.Active' : 'COGWHEEL.Consequences.Inactive')})`;
      }
      
      // Update checkbox state
      if (checkbox) {
        checkbox.disabled = !isActive;
        // Uncheck disabled checkboxes
        if (!isActive && checkbox.checked) {
          checkbox.checked = false;
          // Trigger change event to update counter
          checkbox.dispatchEvent(new Event('change'));
        }
      }
      
      // Update label appearance
      if (label) {
        label.style.opacity = isActive ? '1' : '0.4';
        label.style.textDecoration = isActive ? 'none' : 'line-through';
      }
      
      // Update label cursor
      if (labelElement) {
        labelElement.style.cursor = isActive ? 'pointer' : 'not-allowed';
      }
    });
  };

  // Function to attach event listeners
  const attachEventListeners = (dialog) => {
    const element = dialog.element;
    const form = element.querySelector('form');
    if (!form) return;
    
    const checkboxes = form.querySelectorAll('.consequence-checkbox');
    const counter = form.querySelector('#selection-counter');
    
    // GM-only: Handle toggle buttons for activating/deactivating consequences
    if (isGM) {
      const toggleButtons = form.querySelectorAll('.consequence-toggle-btn');
      
      toggleButtons.forEach(toggleBtn => {
        toggleBtn.addEventListener('click', async (e) => {
          e.preventDefault();
          const index = parseInt(toggleBtn.dataset.index);
          
          // Toggle state in activeConsequences array
          const newActiveConsequences = [...activeConsequences];
          newActiveConsequences[index] = !newActiveConsequences[index];
          
          // Save to settings (triggers hook and socket sync)
          await game.settings.set("cogwheel-syndicate", "activeConsequences", newActiveConsequences);
          
          // Broadcast to other users via socket
          game.socket.emit("system.cogwheel-syndicate", {
            type: "updateActiveConsequences",
            activeConsequences: newActiveConsequences
          });
          
          // Update local state
          activeConsequences = newActiveConsequences;
          
          // Refresh this dialog
          refreshDialog();
        });
      });
    }
    
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        const checkedCount = form.querySelectorAll('.consequence-checkbox:checked').length;
        
        // Update counter
        if (counter) {
          counter.textContent = `${game.i18n.localize('COGSYNDICATE.Selected')}: ${checkedCount} / ${consequenceCount}`;
          
          // Change color based on selection
          if (checkedCount === consequenceCount) {
            counter.style.color = '#27ae60'; // Green when complete
          } else if (checkedCount > consequenceCount) {
            counter.style.color = '#e74c3c'; // Red when over limit
          } else {
            counter.style.color = '#3498db'; // Blue when under limit
          }
        }
        
        // Disable other checkboxes if limit reached (only for active ones)
        if (checkedCount >= consequenceCount) {
          checkboxes.forEach(cb => {
            if (!cb.checked && !cb.disabled) {
              cb.disabled = true;
              cb.parentElement.style.opacity = '0.5';
            }
          });
        } else {
          checkboxes.forEach(cb => {
            // Re-enable only if not deactivated by GM
            const index = parseInt(cb.value);
            if (activeConsequences[index]) {
              cb.disabled = false;
              cb.parentElement.style.opacity = '1';
            }
          });
        }
      });
    });
  };

  try {
    // Register hook listener before opening dialog
    const hookId = Hooks.on("cogwheelSyndicateActiveConsequencesUpdated", () => {
      refreshDialog();
    });

    // Use DialogV2.wait with render callback
    const result = await foundry.applications.api.DialogV2.wait({
      window: {
        title: game.i18n.localize('COGWHEEL.Consequences.DialogTitle'),
        icon: "fas fa-exclamation-triangle",
        classes: ["cogwheel-consequence-dialog"]
      },
      content: generateContent(),
      buttons: [
        {
          action: "cancel",
          label: game.i18n.localize("COGSYNDICATE.Cancel"),
          icon: "fas fa-times",
          default: false
        },
        {
          action: "confirm",
          label: game.i18n.localize("COGSYNDICATE.Confirm"),
          icon: "fas fa-check",
          default: true,
          callback: (event, button, dialog) => {
            // Access form data via dialog.element
            const element = dialog.element;
            const form = element.querySelector('form');
            const checkboxes = form.querySelectorAll('input[name="consequence"]:checked');
            
            // Validate selection count
            if (checkboxes.length !== consequenceCount) {
              ui.notifications.warn(
                game.i18n.format('COGWHEEL.Consequences.MustSelect', { count: consequenceCount })
              );
              return false; // Return false to prevent closing
            }
            
            // Return selected indices (will be available in result)
            return Array.from(checkboxes).map(cb => parseInt(cb.value));
          }
        }
      ],
      rejectClose: false,
      modal: true,
      render: (event, dialog) => {
        // Store dialog reference
        currentDialog = dialog;
        
        // Attach event listeners
        attachEventListeners(dialog);
      },
      close: () => {
        // Clean up hook when dialog closes
        Hooks.off("cogwheelSyndicateActiveConsequencesUpdated", hookId);
        currentDialog = null;
      }
    });

    // If user confirmed and we have results
    if (result && Array.isArray(result)) {
      // Get selected consequence names
      const selectedConsequences = result.map(index => consequenceTypes[index]);
      
      // Create consequences list HTML
      const consequencesListHtml = selectedConsequences.map(c => `<li>${c}</li>`).join('');
      
      // Create chat message with selected consequences
      await ChatMessage.create({
        content: `
          <div class="selected-consequences-message">
            <p>${game.i18n.format('COGWHEEL.Consequences.SelectedMessage', { 
              agentName: `<span class="agent-name">${actor.name}</span>` 
            })}</p>
            <ul>
              ${consequencesListHtml}
            </ul>
          </div>
        `,
        speaker: { actor: actor.id }
      });

      // Disable the button
      button.disabled = true;
      button.textContent = game.i18n.localize('COGWHEEL.Consequences.AlreadySelected');
    }
  } catch (error) {
    console.error("Error in consequence selection dialog:", error);
  }
}
