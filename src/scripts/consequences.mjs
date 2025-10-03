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

  // Create dialog content with checkboxes
  const checkboxesHtml = consequenceTypes.map((type, index) => `
    <div style="margin: 8px 0;">
      <label style="display: flex; align-items: center; cursor: pointer;">
        <input type="checkbox" name="consequence" value="${index}" class="consequence-checkbox" style="margin-right: 8px;">
        <span>${type}</span>
      </label>
    </div>
  `).join('');

  const dialogContent = `
    <form>
      <div style="font-family: 'Palatino Linotype', serif;">
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

  try {
    // Use DialogV2.wait for simpler API
    const result = await foundry.applications.api.DialogV2.wait({
      window: {
        title: game.i18n.localize('COGWHEEL.Consequences.DialogTitle'),
        icon: "fas fa-exclamation-triangle"
      },
      content: dialogContent,
      buttons: [
        {
          action: "confirm",
          label: game.i18n.localize("COGSYNDICATE.Confirm"),
          icon: "fas fa-check",
          default: true,
          callback: (event, button, dialog) => {
            // Access form data via dialog.element (dialog is DialogV2 instance)
            const element = dialog.element;
            const form = element.querySelector('form');
            const checkboxes = form.querySelectorAll('input[name="consequence"]:checked');
            
            // Validate selection count
            if (checkboxes.length !== consequenceCount) {
              ui.notifications.warn(
                game.i18n.format('COGWHEEL.Consequences.MustSelect', { count: consequenceCount })
              );
              return null; // Return null to prevent closing
            }
            
            // Return selected indices
            return Array.from(checkboxes).map(cb => parseInt(cb.value));
          }
        },
        {
          action: "cancel",
          label: game.i18n.localize("COGSYNDICATE.Cancel"),
          icon: "fas fa-times"
        }
      ],
      rejectClose: false,
      modal: true,
      render: (event, dialog) => {
        // Add event listeners after dialog is rendered
        // dialog is DialogV2 instance, use dialog.element to get HTMLElement
        const element = dialog.element;
        const form = element.querySelector('form');
        const checkboxes = form.querySelectorAll('.consequence-checkbox');
        const counter = form.querySelector('#selection-counter');
        
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
            
            // Disable other checkboxes if limit reached
            if (checkedCount >= consequenceCount) {
              checkboxes.forEach(cb => {
                if (!cb.checked) {
                  cb.disabled = true;
                  cb.parentElement.style.opacity = '0.5';
                }
              });
            } else {
              checkboxes.forEach(cb => {
                cb.disabled = false;
                cb.parentElement.style.opacity = '1';
              });
            }
          });
        });
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
