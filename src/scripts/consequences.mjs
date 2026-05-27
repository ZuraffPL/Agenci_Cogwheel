/**
 * Consequences System for Cogwheel Syndicate
 * Handles calculation and display of consequences based on position and test result
 */

// Initialize consequence button timers system
window.cogwheelSyndicate = window.cogwheelSyndicate || {};
window.cogwheelSyndicate.consequenceButtonTimers = window.cogwheelSyndicate.consequenceButtonTimers || {};
window.cogwheelSyndicate.activeConsequenceButtons = window.cogwheelSyndicate.activeConsequenceButtons || {};
window.cogwheelSyndicate.devilConsequenceButtonTimers = window.cogwheelSyndicate.devilConsequenceButtonTimers || {};

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
    position = POSITIONS.CONTROLLED;
  }

  if (!CONSEQUENCES_TABLE[position][resultType]) {
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
 * Disable old consequence button and clear its timer
 * @param {string} buttonId - ID of the button to disable
 */
export function disableOldConsequenceButton(buttonId) {
  const button = document.getElementById(buttonId);
  if (button && button.classList.contains('select-consequences-btn')) {
    button.disabled = true;
    button.classList.add('select-consequences-btn-outdated');
    button.textContent = game.i18n.localize('COGWHEEL.Consequences.SelectButton') + 
                        ` (${game.i18n.localize('COGWHEEL.Consequences.Outdated')})`;
    
    // Clear timer if exists
    const timer = window.cogwheelSyndicate.consequenceButtonTimers[buttonId];
    if (timer) {
      clearTimeout(timer);
      delete window.cogwheelSyndicate.consequenceButtonTimers[buttonId];
    }
    
    // Remove from active buttons
    delete window.cogwheelSyndicate.activeConsequenceButtons[buttonId];
  }
}

/**
 * Calculate consequence count for given position and result type
 * @param {string} position - Position (controlled, risky, desperate)
 * @param {string} resultType - Result type (SuccessWithCost, FailureWithConsequence, FullSuccess, AutoCriticalSuccess, AutoCriticalFailure)
 * @returns {number} Number of consequences
 */
export function calculateConsequenceCount(position, resultType) {
  const consequencesTable = {
    'controlled': { 'SuccessWithCost': 1, 'FailureWithConsequence': 2, 'AutoCriticalFailure': 3 },
    'risky': { 'SuccessWithCost': 2, 'FailureWithConsequence': 3, 'AutoCriticalFailure': 4 },
    'desperate': { 'SuccessWithCost': 3, 'FailureWithConsequence': 4, 'AutoCriticalFailure': 4 }
  };
  
  return consequencesTable[position]?.[resultType] || 0;
}

/**
 * Create consequence button HTML with timer
 * @param {Actor} actor - The actor
 * @param {number} consequenceCount - Number of consequences to select
 * @param {string} oldButtonId - ID of old button to disable (optional)
 * @returns {Object} Object with html and buttonId
 */
export function createConsequenceButton(actor, consequenceCount, oldButtonId = null) {
  const timestamp = Date.now();
  const buttonId = `select-consequences-${timestamp}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Disable old button if provided
  if (oldButtonId) {
    disableOldConsequenceButton(oldButtonId);
  }
  
  // Set 240 second timer (240000 ms)
  const timer = setTimeout(() => {
    const button = document.getElementById(buttonId);
    if (button && !button.disabled) {
      button.disabled = true;
      button.classList.add('select-consequences-btn-expired');
      button.textContent = game.i18n.localize('COGWHEEL.Consequences.SelectButton') + 
                          ` (${game.i18n.localize('COGWHEEL.Consequences.Expired')})`;
    }
    delete window.cogwheelSyndicate.consequenceButtonTimers[buttonId];
    delete window.cogwheelSyndicate.activeConsequenceButtons[buttonId];
  }, 240000);
  
  // Save timer
  window.cogwheelSyndicate.consequenceButtonTimers[buttonId] = timer;
  window.cogwheelSyndicate.activeConsequenceButtons[buttonId] = {
    actorId: actor.id,
    consequenceCount: consequenceCount,
    timestamp: timestamp
  };
  
  return {
    html: `<button class="select-consequences-btn" 
            id="${buttonId}"
            data-actor-id="${actor.id}" 
            data-consequence-count="${consequenceCount}"
            data-message-id="">
      ${game.i18n.localize('COGWHEEL.Consequences.SelectButton')}
    </button>`,
    buttonId: buttonId
  };
}

/**
 * Reject a consequence by spending Stress Points
 * @param {Actor} actor - The actor rejecting consequence
 * @param {number} stressCost - Cost in Stress Points
 * @param {string} position - Fictional position name (for message)
 * @returns {Promise<boolean>} True if successful, false if failed
 */
async function rejectConsequenceForStress(actor, stressCost, position) {
  const currentStress = actor.system.resources.stress.value || 0;
  const maxStress = actor.system.resources.stress.max || 12;
  const currentTrauma = actor.system.resources.trauma.value || 0;
  const maxTrauma = actor.system.resources.trauma.max || 4;
  
  // Calculate new stress value
  const newStressValue = currentStress + stressCost;
  
  // Check if trauma will occur
  if (newStressValue > maxStress) {
    // Check if max trauma reached
    if (currentTrauma >= maxTrauma) {
      ui.notifications.error(game.i18n.localize('COGSYNDICATE.MaxTraumaReached'));
      return false;
    }
    
    // Calculate excess stress that becomes new stress after trauma
    const excessStress = newStressValue - maxStress;
    const newTraumaValue = currentTrauma + 1;
    
    // Update with trauma
    await actor.update({
      "system.resources.stress.value": excessStress,
      "system.resources.trauma.value": newTraumaValue
    });
    
    // Create chat message with trauma warning
    await ChatMessage.create({
      content: `
        <div class="selected-consequences-message">
          <p>
            <span class="agent-name" style="color: #3498db; font-weight: bold;">${actor.name}</span> 
            ${game.i18n.format('COGWHEEL.Consequences.RejectSuccess', { 
              agentName: '',
              cost: stressCost 
            })}
          </p>
          <p style="color: #8e44ad; font-weight: bold; margin-top: 8px;">
            <i class="fas fa-skull" style="margin-right: 6px;"></i>
            ${game.i18n.localize('COGSYNDICATE.TraumaReceived')}
          </p>
        </div>
      `,
      speaker: { actor: actor.id }
    });
  } else {
    // Normal stress increase without trauma
    await actor.update({
      "system.resources.stress.value": newStressValue
    });
    
    // Create chat message
    await ChatMessage.create({
      content: `
        <div class="selected-consequences-message">
          <p>
            <span class="agent-name" style="color: #3498db; font-weight: bold;">${actor.name}</span> 
            ${game.i18n.format('COGWHEEL.Consequences.RejectSuccess', { 
              agentName: '',
              cost: stressCost 
            })}
          </p>
        </div>
      `,
      speaker: { actor: actor.id }
    });
  }
  
  return true;
}

/**
 * Show consequence selection dialog with 10 consequence types
 * @param {Actor} actor - The actor selecting consequences
 * @param {number} consequenceCount - Number of consequences to select (1-4)
 * @param {string} messageId - Chat message ID to update
 * @param {HTMLButtonElement} button - The button that was clicked
 * @param {string} position - Fictional position (controlled, risky, desperate)
 */
export async function showConsequencesSelectionDialog(actor, consequenceCount, messageId, button, position = 'risky') {
  // Check if current user is GM
  const isGM = game.user.isGM;
  
  // Get active consequences state from settings
  let activeConsequences = game.settings.get("cogwheel-syndicate", "activeConsequences");
  
  // Calculate stress cost for rejecting a consequence based on position
  const stressCostMap = {
    'controlled': 1,
    'risky': 2,
    'desperate': 3
  };
  const stressCost = stressCostMap[position] || 2;
  
  // Track current consequence count (can be reduced by rejecting)
  let currentConsequenceCount = consequenceCount;
  
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
      <div class="consequence-row" data-index="${index}" data-deactivated="${!isActive}" style="${!isActive ? 'opacity: 0.5;' : ''}">
        ${isGM ? `
          <button type="button" class="consequence-toggle-btn ${isActive ? 'active' : 'inactive'}" data-index="${index}" 
            title="${game.i18n.localize('COGWHEEL.Consequences.ToggleTooltip')}"
            style="flex-shrink: 0; width: 28px; height: 28px; border-radius: 4px; border: 2px solid ${isActive ? '#27ae60' : '#7f8c8d'}; background: linear-gradient(135deg, ${isActive ? '#27ae60 0%, #229954 100%' : '#95a5a6 0%, #7f8c8d 100%'}); cursor: pointer; transition: all 0.3s ease;">
            <i class="fas ${isActive ? 'fa-check' : 'fa-times'}" style="color: white; font-size: 14px;"></i>
          </button>
        ` : ''}
        <label class="consequence-row-label" style="${isActive ? 'cursor: pointer;' : 'cursor: not-allowed;'}">
          <input type="checkbox" name="consequence" value="${index}" class="consequence-checkbox" 
            style="margin-right: 8px;" ${!isActive ? 'disabled' : ''}>
          <span class="consequence-label" style="${!isActive ? 'opacity: 0.4; text-decoration: line-through;' : ''}">${type}</span>
        </label>
      </div>
      `;
    }).join('');

    return `
      <form class="consequences-dialog-form">
        <div class="consequences-dialog-content">
          ${isGM ? `
            <div class="gm-info-box">
              <p class="gm-info-title">
                <i class="fas fa-crown"></i>
                ${game.i18n.localize('COGWHEEL.Consequences.GMOnly')}
              </p>
              <p class="gm-info-text">
                ${game.i18n.localize('COGWHEEL.Consequences.GMInfo')}
              </p>
            </div>
          ` : ''}
          <p class="consequences-dialog-title">
            ${game.i18n.format('COGWHEEL.Consequences.SelectUpTo', { count: currentConsequenceCount })}
          </p>
          <div class="consequence-types-container">
            ${checkboxesHtml}
          </div>
          <p id="selection-counter" class="consequences-selection-counter">
            ${game.i18n.localize('COGSYNDICATE.Selected')}: 0 / ${currentConsequenceCount}
          </p>
          <div class="consequences-actions">
            <button type="button" id="reject-consequence-btn" class="reject-consequence-btn" ${currentConsequenceCount <= 1 ? 'disabled' : ''}>
              <i class="fas fa-heart-broken" style="margin-right: 6px;"></i>
              ${game.i18n.localize('COGWHEEL.Consequences.RejectButton')}
            </button>
          </div>
        </div>
      </form>
    `;
  };

  // Store dialog reference for refresh
  let currentDialog = null;

  const resizeDialogToContent = (dialog) => {
    if (!dialog?.element) return;
    const contentEl = dialog.element.querySelector('.window-content');
    if (!contentEl) return;
    const maxHeight = Math.floor(window.innerHeight * 0.92);
    const chromePadding = 90;
    const desiredHeight = Math.min(maxHeight, Math.ceil(contentEl.scrollHeight + chromePadding));
    dialog.setPosition({ height: desiredHeight });
  };

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

      row.dataset.deactivated = String(!isActive);
    });

    resizeDialogToContent(currentDialog);
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
          counter.textContent = `${game.i18n.localize('COGSYNDICATE.Selected')}: ${checkedCount} / ${currentConsequenceCount}`;
          
          // Change color based on selection
          if (checkedCount === currentConsequenceCount) {
            counter.style.color = '#27ae60'; // Green when complete
          } else if (checkedCount > currentConsequenceCount) {
            counter.style.color = '#e74c3c'; // Red when over limit
          } else {
            counter.style.color = '#3498db'; // Blue when under limit
          }
        }
        
        // Disable other checkboxes if limit reached (only for active ones)
        if (checkedCount >= currentConsequenceCount) {
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
    
    // Handle "Reject Consequence" button
    const rejectBtn = form.querySelector('#reject-consequence-btn');
    if (rejectBtn) {
      rejectBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        
        // Check if can reject more
        if (currentConsequenceCount <= 1) {
          ui.notifications.warn(game.i18n.localize('COGWHEEL.Consequences.RejectNoneLeft'));
          return;
        }
        
        // Get position name for display
        const positionNames = {
          'controlled': game.i18n.localize('COGWHEEL.Consequences.PositionControlled'),
          'risky': game.i18n.localize('COGWHEEL.Consequences.PositionRisky'),
          'desperate': game.i18n.localize('COGWHEEL.Consequences.PositionDesperate')
        };
        const positionName = positionNames[position] || position;
        
        // Show confirmation dialog
        const confirmed = await foundry.applications.api.DialogV2.confirm({
          window: {
            title: game.i18n.localize('COGWHEEL.Consequences.RejectTitle'),
            icon: "fas fa-heart-broken"
          },
          content: `
            <div class="reject-consequence-info">
              <p>${game.i18n.format('COGWHEEL.Consequences.RejectPrompt', {
                cost: stressCost,
                position: positionName
              })}</p>
            </div>
          `,
          rejectClose: false,
          modal: true
        });
        
        if (confirmed) {
          // Try to reject consequence
          const success = await rejectConsequenceForStress(actor, stressCost, positionName);
          
          if (success) {
            // Reduce consequence count
            currentConsequenceCount -= 1;
            
            // Update counter text
            if (counter) {
              const checkedCount = form.querySelectorAll('.consequence-checkbox:checked').length;
              counter.textContent = `${game.i18n.localize('COGSYNDICATE.Selected')}: ${checkedCount} / ${currentConsequenceCount}`;
              
              // Update color
              if (checkedCount === currentConsequenceCount) {
                counter.style.color = '#27ae60';
              } else if (checkedCount > currentConsequenceCount) {
                counter.style.color = '#e74c3c';
              } else {
                counter.style.color = '#3498db';
              }
            }
            
            // Update instruction text
            const instructionText = form.querySelector('.consequences-dialog-title');
            if (instructionText) {
              instructionText.textContent = game.i18n.format('COGWHEEL.Consequences.SelectUpTo', { count: currentConsequenceCount });
            }
            
            // Disable button if no more consequences can be rejected
            if (currentConsequenceCount <= 1) {
              rejectBtn.disabled = true;
            }
            
            // Trigger checkbox change to re-validate selection
            const firstCheckbox = form.querySelector('.consequence-checkbox');
            if (firstCheckbox) {
              firstCheckbox.dispatchEvent(new Event('change'));
            }
          }
        }
      });
    }
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
      position: { width: 700 },
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
            
            // Validate selection count (use current count, not original)
            if (checkboxes.length !== currentConsequenceCount) {
              ui.notifications.warn(
                game.i18n.format('COGWHEEL.Consequences.MustSelect', { count: currentConsequenceCount })
              );
              return false; // Return false to prevent closing
            }
            
            // Return selected indices (will be available in result)
            return Array.from(checkboxes).map(cb => parseInt(cb.value));
          }
        }
      ],
      rejectClose: false,
      render: (event, dialog) => {
        // Store dialog reference
        currentDialog = dialog;
        
        // Attach event listeners
        attachEventListeners(dialog);

        requestAnimationFrame(() => resizeDialogToContent(dialog));
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
    // silently ignore dialog error
  }
}

// =========================================
// DIABELSKIE KONSEKWENCJE (Devil's Bargain)
// =========================================

/**
 * Devil consequence count table — position-independent, depends only on result type
 */
const DEVIL_CONSEQUENCE_COUNT = {
  'SuccessWithCost': 1,
  'FailureWithConsequence': 2,
  'AutoCriticalFailure': 3
};

/**
 * Calculate devil consequence count based on result type
 * @param {string} resultType - SuccessWithCost | FailureWithConsequence | AutoCriticalFailure
 * @returns {number}
 */
export function calculateDevilConsequenceCount(resultType) {
  return DEVIL_CONSEQUENCE_COUNT[resultType] || 0;
}

/**
 * Disable an old devil consequence button and clear its timer
 * @param {string} buttonId
 */
export function disableOldDevilConsequenceButton(buttonId) {
  const button = document.getElementById(buttonId);
  if (button && button.classList.contains('select-devil-consequences-btn')) {
    button.disabled = true;
    button.classList.add('select-devil-consequences-btn-outdated');
    button.innerHTML = `<i class="fas fa-skull-crossbones" style="margin-right:6px;"></i>${game.i18n.localize('COGWHEEL.DevilConsequences.SelectButton')} (${game.i18n.localize('COGWHEEL.DevilConsequences.Outdated')})`;
    const timer = window.cogwheelSyndicate.devilConsequenceButtonTimers[buttonId];
    if (timer) {
      clearTimeout(timer);
      delete window.cogwheelSyndicate.devilConsequenceButtonTimers[buttonId];
    }
  }
}

/**
 * Create devil consequence button HTML with 240s expiry timer
 * @param {Actor} actor
 * @param {number} devilCount
 * @param {string|null} oldButtonId - ID of previous button to disable
 * @returns {{ html: string, buttonId: string }}
 */
export function createDevilConsequenceButton(actor, devilCount, oldButtonId = null) {
  const timestamp = Date.now();
  const buttonId = `select-devil-consequences-${timestamp}-${Math.random().toString(36).substr(2, 9)}`;

  if (oldButtonId) {
    disableOldDevilConsequenceButton(oldButtonId);
  }

  // Word form for Polish grammar
  let word;
  if (devilCount === 1) {
    word = game.i18n.localize('COGWHEEL.DevilConsequences.Singular');
  } else if (devilCount <= 4) {
    word = game.i18n.localize('COGWHEEL.DevilConsequences.Genitive');
  } else {
    word = game.i18n.localize('COGWHEEL.DevilConsequences.Plural');
  }

  const timer = setTimeout(() => {
    const btn = document.getElementById(buttonId);
    if (btn && !btn.disabled) {
      btn.disabled = true;
      btn.classList.add('select-devil-consequences-btn-expired');
      btn.innerHTML = `<i class="fas fa-skull-crossbones" style="margin-right:6px;"></i>${game.i18n.localize('COGWHEEL.DevilConsequences.SelectButton')} (${game.i18n.localize('COGWHEEL.DevilConsequences.Expired')})`;
    }
    delete window.cogwheelSyndicate.devilConsequenceButtonTimers[buttonId];
  }, 240000);

  window.cogwheelSyndicate.devilConsequenceButtonTimers[buttonId] = timer;

  return {
    html: `<div class="devil-consequences-message">
      <i class="fas fa-skull-crossbones"></i>
      <div class="devil-consequence-text"><span class="devil-consequence-count">${devilCount}</span>&nbsp;${word}</div>
    </div>
    <button class="select-devil-consequences-btn"
            id="${buttonId}"
            data-actor-id="${actor.id}"
            data-devil-consequence-count="${devilCount}"
            data-message-id="">
      <i class="fas fa-skull-crossbones" style="margin-right:6px;"></i>${game.i18n.localize('COGWHEEL.DevilConsequences.SelectButton')}
    </button>`,
    buttonId: buttonId
  };
}

/**
 * Show devil consequences selection dialog
 * @param {Actor} actor
 * @param {number} devilConsequenceCount - How many devil consequences to select
 * @param {string} messageId - Chat message ID
 * @param {HTMLButtonElement} button - The clicked button
 */
export async function showDevilConsequencesSelectionDialog(actor, devilConsequenceCount, messageId, button) {
  const isGM = game.user.isGM;

  // Two groups of devil consequence types from the Czarci Targ table
  const oneShotTypes = [
    game.i18n.localize('COGWHEEL.DevilConsequences.OneShotType1'),
    game.i18n.localize('COGWHEEL.DevilConsequences.OneShotType2'),
    game.i18n.localize('COGWHEEL.DevilConsequences.OneShotType3'),
    game.i18n.localize('COGWHEEL.DevilConsequences.OneShotType4'),
    game.i18n.localize('COGWHEEL.DevilConsequences.OneShotType5'),
    game.i18n.localize('COGWHEEL.DevilConsequences.OneShotType6'),
    game.i18n.localize('COGWHEEL.DevilConsequences.OneShotType7'),
    game.i18n.localize('COGWHEEL.DevilConsequences.OneShotType8')
  ];
  const campaignTypes = [
    game.i18n.localize('COGWHEEL.DevilConsequences.CampaignType1'),
    game.i18n.localize('COGWHEEL.DevilConsequences.CampaignType2'),
    game.i18n.localize('COGWHEEL.DevilConsequences.CampaignType3'),
    game.i18n.localize('COGWHEEL.DevilConsequences.CampaignType4'),
    game.i18n.localize('COGWHEEL.DevilConsequences.CampaignType5'),
    game.i18n.localize('COGWHEEL.DevilConsequences.CampaignType6'),
    game.i18n.localize('COGWHEEL.DevilConsequences.CampaignType7'),
    game.i18n.localize('COGWHEEL.DevilConsequences.CampaignType8')
  ];

  // Selection state: counts[0..7] = one-shot, counts[8..15] = campaign
  const counts = new Array(16).fill(0);

  // Helper — wczytaj aktualny stan aktywnych konsekwencji
  const getActive = () => {
    try {
      const saved = game.settings.get("cogwheel-syndicate", "activeDevilConsequences");
      if (Array.isArray(saved) && saved.length === 16) return [...saved];
    } catch (_) { /* fallback */ }
    return new Array(16).fill(true);
  };

  const renderRows = (types, groupOffset, activeArr) => types.map((type, i) => {
    const idx = groupOffset + i;
    const active = activeArr[idx];
    const inactiveStyle = active ? '' : 'opacity:0.45;';
    const labelStyle = active ? '' : 'text-decoration:line-through;color:#999;';
    const toggleBtn = isGM ? `
      <button type="button"
        class="devil-toggle-btn ${active ? 'active' : 'inactive'}"
        data-index="${idx}"
        title="${game.i18n.localize(active ? 'COGWHEEL.DevilConsequences.ToggleTooltipDisable' : 'COGWHEEL.DevilConsequences.ToggleTooltipEnable')}">
        <i class="fas ${active ? 'fa-check' : 'fa-times'}"></i>
      </button>` : '';
    return `<div class="devil-consequence-row" data-index="${idx}" style="${inactiveStyle}">
      ${toggleBtn}
      <button type="button" class="devil-counter-btn minus" data-index="${idx}" ${active ? '' : 'disabled'}>−</button>
      <span class="devil-counter-value" data-index="${idx}">0</span>
      <button type="button" class="devil-counter-btn plus" data-index="${idx}" ${active ? '' : 'disabled'}>+</button>
      <span class="devil-consequence-label" style="${labelStyle}">${type}</span>
    </div>`;
  }).join('');

  const generateContent = (activeArr) => {
    const gmInfoBox = isGM ? `
      <div class="devil-gm-info-box">
        <i class="fas fa-crown"></i>
        ${game.i18n.localize('COGWHEEL.DevilConsequences.GMOnly')}
        — ${game.i18n.localize('COGWHEEL.DevilConsequences.GMInfo')}
      </div>` : '';
    return `
    <form class="devil-consequences-dialog-form">
      ${gmInfoBox}
      <p class="devil-dialog-header">
        <i class="fas fa-skull-crossbones"></i>
        ${game.i18n.format('COGWHEEL.DevilConsequences.SelectCount', { count: devilConsequenceCount })}
      </p>
      <p class="devil-dialog-note">${game.i18n.localize('COGWHEEL.DevilConsequences.CanRepeat')}</p>
      <div class="devil-types-container">
        <div class="devil-group-header">
          <i class="fas fa-skull-crossbones"></i>
          ${game.i18n.localize('COGWHEEL.DevilConsequences.OneShot')}
        </div>
        ${renderRows(oneShotTypes, 0, activeArr)}
        <div class="devil-group-header" style="margin-top:10px;">
          <i class="fas fa-skull-crossbones"></i>
          ${game.i18n.localize('COGWHEEL.DevilConsequences.Campaign')}
        </div>
        ${renderRows(campaignTypes, 8, activeArr)}
      </div>
      <p id="devil-selection-counter" class="devil-counter-total">
        ${game.i18n.localize('COGSYNDICATE.Selected')}: 0 / ${devilConsequenceCount}
      </p>
    </form>
  `;
  };

  // Przebuduj wiersze dialogu bez zamykania (odświeżanie po toggle GM)
  const refreshDevilDialog = (dialogInst) => {
    const form = dialogInst.element?.querySelector('form');
    if (!form) return;
    const activeArr = getActive();
    const container = form.querySelector('.devil-types-container');
    if (!container) return;

    // Odśwież istniejące wiersze — nie przebudowuj całego kontenera (nie czyścimy inputów/liczników)
    container.querySelectorAll('.devil-consequence-row').forEach(row => {
      const idx = parseInt(row.dataset.index);
      const active = activeArr[idx];
      row.style.opacity = active ? '' : '0.45';
      const label = row.querySelector('.devil-consequence-label');
      if (label) {
        label.style.textDecoration = active ? '' : 'line-through';
        label.style.color = active ? '' : '#999';
      }
      const minusBtn = row.querySelector('.devil-counter-btn.minus');
      const plusBtn = row.querySelector('.devil-counter-btn.plus');
      if (minusBtn) minusBtn.disabled = !active;
      if (plusBtn) plusBtn.disabled = !active;

      // Jeśli wyłączono typ — wyzeruj jego licznik
      if (!active && counts[idx] > 0) {
        counts[idx] = 0;
        const valEl = row.querySelector(`.devil-counter-value[data-index="${idx}"]`);
        if (valEl) valEl.textContent = '0';
      }

      const toggleBtn = row.querySelector('.devil-toggle-btn');
      if (toggleBtn) {
        toggleBtn.className = `devil-toggle-btn ${active ? 'active' : 'inactive'}`;
        toggleBtn.title = game.i18n.localize(active ? 'COGWHEEL.DevilConsequences.ToggleTooltipDisable' : 'COGWHEEL.DevilConsequences.ToggleTooltipEnable');
        const icon = toggleBtn.querySelector('i');
        if (icon) {
          icon.className = `fas ${active ? 'fa-check' : 'fa-times'}`;
        }
      }
    });

    // Zaktualizuj licznik zaznaczenia
    const total = counts.reduce((a, b) => a + b, 0);
    const counterEl = form.querySelector('#devil-selection-counter');
    if (counterEl) {
      counterEl.textContent = `${game.i18n.localize('COGSYNDICATE.Selected')}: ${total} / ${devilConsequenceCount}`;
      counterEl.classList.toggle('devil-counter-done', total === devilConsequenceCount);
    }
  };

  const attachListeners = (dialog) => {
    const form = dialog.element.querySelector('form');
    if (!form) return;

    const updateTotal = () => {
      const total = counts.reduce((a, b) => a + b, 0);
      const el = form.querySelector('#devil-selection-counter');
      if (el) {
        el.textContent = `${game.i18n.localize('COGSYNDICATE.Selected')}: ${total} / ${devilConsequenceCount}`;
        el.classList.toggle('devil-counter-done', total === devilConsequenceCount);
      }
    };

    // Przyciski +/− licznika
    form.querySelectorAll('.devil-counter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.disabled) return;
        const idx = parseInt(btn.dataset.index);
        const activeArr = getActive();
        if (!activeArr[idx]) return; // Zablokowane przez GM
        const total = counts.reduce((a, b) => a + b, 0);
        if (btn.classList.contains('plus')) {
          if (total < devilConsequenceCount) {
            counts[idx]++;
            const valEl = form.querySelector(`.devil-counter-value[data-index="${idx}"]`);
            if (valEl) valEl.textContent = counts[idx];
          }
        } else {
          if (counts[idx] > 0) {
            counts[idx]--;
            const valEl = form.querySelector(`.devil-counter-value[data-index="${idx}"]`);
            if (valEl) valEl.textContent = counts[idx];
          }
        }
        updateTotal();
      });
    });

    // Przyciski toggle GM
    if (isGM) {
      form.querySelectorAll('.devil-toggle-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const idx = parseInt(btn.dataset.index);
          const activeArr = getActive();
          activeArr[idx] = !activeArr[idx];
          await game.settings.set("cogwheel-syndicate", "activeDevilConsequences", activeArr);
          game.socket.emit("system.cogwheel-syndicate", {
            type: "updateActiveDevilConsequences",
            activeDevilConsequences: activeArr
          });
          Hooks.call("cogwheelSyndicateActiveDevilConsequencesUpdated");
        });
      });
    }

    // Hook do odświeżania dialogu gdy GM zmieni ustawienia
    const hookId = Hooks.on("cogwheelSyndicateActiveDevilConsequencesUpdated", () => {
      refreshDevilDialog(dialog);
    });

    // Sprzątanie hooka po zamknięciu dialogu
    const origClose = dialog.close?.bind(dialog);
    if (origClose) {
      dialog.close = (...args) => {
        Hooks.off("cogwheelSyndicateActiveDevilConsequencesUpdated", hookId);
        return origClose(...args);
      };
    }
  };

  try {
    const result = await foundry.applications.api.DialogV2.wait({
      window: {
        title: game.i18n.localize('COGWHEEL.DevilConsequences.DialogTitle'),
        icon: "fas fa-skull-crossbones",
        classes: ["cogwheel-devil-consequence-dialog"]
      },
      content: generateContent(getActive()),
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
          callback: (event, btnEl, dialog) => {
            const total = counts.reduce((a, b) => a + b, 0);
            if (total !== devilConsequenceCount) {
              ui.notifications.warn(
                game.i18n.format('COGWHEEL.DevilConsequences.MustSelect', { count: devilConsequenceCount })
              );
              return false;
            }
            const selected = [];
            counts.forEach((cnt, idx) => {
              if (cnt > 0) {
                const name = idx < 8 ? oneShotTypes[idx] : campaignTypes[idx - 8];
                selected.push({ name, count: cnt });
              }
            });
            return selected;
          }
        }
      ],
      rejectClose: false,
      render: (event, dialog) => attachListeners(dialog)
    });

    if (result && Array.isArray(result) && result.length > 0) {
      const listHtml = result.map(item =>
        item.count > 1 ? `<li>${item.name} ×${item.count}</li>` : `<li>${item.name}</li>`
      ).join('');

      await ChatMessage.create({
        content: `
          <div class="selected-devil-consequences-message">
            <p>
              <i class="fas fa-skull-crossbones" style="margin-right:6px;color:#8b0000;"></i>
              ${game.i18n.format('COGWHEEL.DevilConsequences.SelectedMessage', {
                agentName: `<span class="agent-name" style="color:#3498db;font-weight:bold;">${actor.name}</span>`
              })}
            </p>
            <ul>${listHtml}</ul>
          </div>
        `,
        speaker: { actor: actor.id }
      });

      button.disabled = true;
      button.innerHTML = `<i class="fas fa-skull-crossbones" style="margin-right:6px;"></i>${game.i18n.localize('COGWHEEL.DevilConsequences.AlreadySelected')}`;
    }
  } catch (error) {
    // silently ignore dialog error
  }
}
