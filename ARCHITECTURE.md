# Cogwheel Syndicate - System Architecture

## Overview

Cogwheel Syndicate system uses a **modular shared function architecture** that eliminates code duplication while maintaining flexibility for different actor sheet versions and future extensibility.

## Core Principles

### 1. **Code Deduplication**
- **Single Source of Truth**: All common functionality is implemented once in shared modules
- **Maintainability**: Bug fixes and improvements affect all sheet versions automatically
- **Consistency**: Identical behavior across all actor sheets unless explicitly customized

### 2. **Flexible Customization**
- **Callback System**: Extensive hooks allow per-version behavior modification
- **Non-Breaking**: Default behavior preserves all existing functionality
- **Granular Control**: Individual aspects of operations can be customized independently

### 3. **Future-Proof Design**
- **Extensible Architecture**: New actor sheet versions can easily integrate shared functions
- **Backward Compatibility**: All changes preserve existing data and functionality
- **Modular Structure**: Clean separation allows independent module development

## Shared Function Modules

### ActorGearFunctions (v0.7.6)
**File**: `src/scripts/shared/actor-gear-functions.js`

**Purpose**: Handles gear spending operations (`_onSpendGear`)

**Key Features**:
- Steam point integration and calculation
- Gear type validation (light weapons, heavy weapons, tools, etc.)
- Customizable cost validation and message formatting
- Error handling with fallback mechanisms

**Usage Example**:
```javascript
await ActorGearFunctions.handleSpendGear(this.actor, this, {
  validateGearCost: (gearType, cost, steamCost, currentGear, currentSteam) => {
    // Custom validation logic
    return { valid: true };
  },
  onSuccess: (gearType, gearCost, steamCost, newGearValue) => {
    // Custom success handling
  }
});
```

### ActorStressFunctions (v0.7.6)
**File**: `src/scripts/shared/actor-stress-functions.js`

**Purpose**: Handles stress spending operations (`_onSpendStress`)

**Key Features**:
- Trauma detection and warning systems
- Steam point bonus calculation
- Customizable stress cost validation
- Team steam point pool integration

**Usage Example**:
```javascript
await ActorStressFunctions.handleSpendStress(this.actor, this, {
  onTraumaWarning: (actor, currentStress, stressCost, maxStress) => {
    // Custom trauma warning logic
  },
  onSuccess: (action, cost, steamBonus, finalStress, traumaOccurred) => {
    // Custom success handling
  }
});
```

### ActorEquipmentFunctions (v0.7.7)
**File**: `src/scripts/shared/actor-equipment-functions.js`

**Purpose**: Comprehensive equipment management (add/edit/delete operations)

**Key Features**:
- Universal equipment dialog handling
- Multi-stage validation pipeline (input → cost → processing)
- Customizable error display (dialog errors vs notifications)
- Equipment refund calculation system
- Cost difference handling for equipment edits

**Core Functions**:
- `handleAddEquipment(actor, sheet, options)`
- `handleEditEquipment(actor, sheet, equipmentIndex, options)`
- `handleDeleteEquipment(actor, sheet, equipmentIndex, options)`

**Customization Options**:
```javascript
{
  // Validation hooks
  validateInput: (formData, html, config) => ({ valid: true }),
  validateCost: (cost, availablePoints, actor, config) => ({ valid: true }),
  showValidationError: (html, message) => { /* error display */ },
  
  // Data processing
  processEquipmentData: (formData, config) => ({ /* processed data */ }),
  equipmentDefaults: { /* default values */ },
  
  // Operation callbacks
  onSuccess: (equipment, actor, sheet, config) => { /* success handling */ },
  onError: (error, actor, sheet, config) => { /* error handling */ },
  
  // Special options
  confirmDelete: true, // Show confirmation dialog
  calculateRefund: (equipment, actor, config) => equipment.cost
}
```

## Actor Sheet Integration

### Agent V1 (actor-sheet.js)
**Characteristics**:
- Strict validation with input trimming
- Dialog-based error display with CSS error messages
- Comprehensive validation requirements (name + action required)
- Chat messages for all operations

**Integration Pattern**:
```javascript
// V1 uses default strict validation
async _onAddEquipment(event) {
  await ActorEquipmentFunctions.handleAddEquipment(this.actor, this, {
    // V1 uses defaults which include strict validation
    onSuccess: async (equipment, actor, sheet, config) => {
      // V1-specific success handling
    }
  });
}
```

### Agent V2 (actor-sheetv2.js)
**Characteristics**:
- Simplified validation without trimming
- Notification-based error display
- Relaxed validation requirements
- Different chat message formats

**Integration Pattern**:
```javascript
// V2 overrides defaults for simplified behavior
async _onAddEquipment(event) {
  await ActorEquipmentFunctions.handleAddEquipment(this.actor, this, {
    validateInput: () => ({ valid: true }), // V2: No strict validation
    showValidationError: (html, message) => {
      ui.notifications.warn(message); // V2: Notifications instead of dialog
    },
    processEquipmentData: (formData, config) => ({
      name: formData.name, // V2: No trimming
      // ... other fields
    })
  });
}
```

## Data Flow Architecture

### Equipment Addition Flow
```
1. User clicks "Add Equipment"
2. handleAddEquipment() called with sheet-specific options
3. Template rendered with equipment defaults
4. Dialog displayed with form
5. User submits form
6. validateInput() called with form data
7. validateCost() called with cost information
8. processEquipmentData() transforms form data
9. Actor updated with new equipment
10. onSuccess() callback executed
11. Chat message created and sheet rendered
```

### Customization Override Points
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Form Submit   │ -> │ validateInput() │ -> │ validateCost()  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                |                       |
                         [Validation Error]      [Cost Error]
                                |                       |
                                v                       v
                       ┌─────────────────┐    ┌─────────────────┐
                       │showValidation   │    │showValidation   │
                       │Error()          │    │Error()          │
                       └─────────────────┘    └─────────────────┘
                       
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Validation OK   │ -> │processEquipment │ -> │  Actor Update   │
└─────────────────┘    │Data()           │    └─────────────────┘
                       └─────────────────┘            |
                                                      v
                                               ┌─────────────────┐
                                               │   onSuccess()   │
                                               └─────────────────┘
```

## File Structure

### Core System Files
```
src/scripts/
├── actor-sheet.js              # Agent V1 implementation
├── actor-sheetv2.js            # Agent V2 implementation
├── init.js                     # System initialization
└── shared/                     # Shared function modules
    ├── actor-gear-functions.js
    ├── actor-stress-functions.js
    ├── actor-equipment-functions.js
    ├── EXAMPLES.js             # Gear/Stress examples
    ├── EQUIPMENT-EXAMPLES.js   # Equipment examples
    └── README.md               # Shared functions documentation
```

### Documentation Files
```
├── ARCHITECTURE.md             # This file
├── FEATS_EFFECTS.md           # Feat effects system documentation
├── CHANGELOG.md               # Version history
└── README.md                  # User documentation
```

### CSS Architecture
```
src/styles/
├── cogwheel.css               # Main V1 actor sheet styling
├── agent-v2.css               # V2 actor sheet styling
├── feats-effects.css          # Dedicated feat effects styling (v0.7.7+)
├── hq.css                     # Headquarters styling
├── nemesis.css                # Nemesis sheet styling
├── clocks.css                 # Clock system styling (includes archive dialog)
├── equipment.css              # Equipment dialogs styling
├── equipment-points.css       # Equipment points styling
├── notes.css                  # Notes section styling
├── trauma-types.css           # Trauma system styling
├── sidebars-controls.css      # Sidebar controls styling
├── spend-gear.css             # Gear spending dialogs styling
├── spend-stress.css           # Stress spending dialogs styling
├── success-upgrade.css        # Success upgrade buttons styling
├── meta-currency.css          # Meta currency system styling
├── spend-points-dialog.css    # Points spending dialogs styling
├── consequences.css           # Consequence system styling (v0.9.18+)
├── feats.css                  # General feats styling
└── rolldialog.css            # Roll dialogs styling
```

## Clock System (v0.9.19)

### DoomClocksDialog (clocks.mjs)
**File**: `src/scripts/clocks.mjs`

**Purpose**: Real-time synchronized clock management with archive system

**Key Features**:
- ApplicationV2-based dialog with category tabs (Mission/Combat/Other)
- Real-time multi-user synchronization via socket broadcasting
- Archive system for soft-delete with restore capability
- Triple-layer instance discovery for reliable dialog detection
- Unique marker system (`_isCogwheelClocksDialog`) for identification

**Architecture Highlights**:
```javascript
class DoomClocksDialog extends foundry.applications.api.ApplicationV2 {
  constructor() {
    this._isCogwheelClocksDialog = true;  // Unique marker
    // ... initialization
  }
}
```

### Archive System
**Settings**: `game.settings.get/set("cogwheel-syndicate", "archivedClocks")`

**Core Functions**:
- `_onDeleteClock()`: Archives clock with timestamp metadata instead of permanent deletion
- `_onOpenArchive()`: Opens archive dialog with DialogV2 and inline styling
- `_onRestoreClock(index)`: Removes archive metadata and returns clock to active list
- `_onDeleteArchivedClock(index)`: Permanently deletes clock from archive

**Styling Approach**: Triple-layer for maximum compatibility
1. **CSS Files**: `clocks.css` with `dialog.clock-archive-dialog` selectors
2. **JavaScript DOM**: Direct styling in `_onRender()` method
3. **Inline Styles**: Template-level styles in `clock-archive-dialog.hbs`

**Archive Dialog Layout**:
```
Horizontal Flexbox:
[Clock SVG 80x80] | [Details (flex-grow)] | [Buttons (fixed-width)]
                   Name, Progress,            Restore (green)
                   Date, Description          Delete (red)
```

### Real-Time Synchronization
**Socket Type**: `updateClocks` and `updateArchivedClocks`

**Hook System**:
- `cogwheelSyndicateClocksUpdated`: Triggered when active clocks change
- `cogwheelSyndicateArchivedClocksUpdated`: Triggered when archived clocks change

**Instance Discovery**: Triple-layer search
1. `ui.windows` - Legacy support
2. `foundry.applications.instances` - ApplicationV2 native
3. `globalThis.foundry.applications.apps` - Fallback

**Loop Prevention**: `isSocketUpdate` flag prevents infinite broadcast loops

## Benefits

### For Developers
- **Reduced Maintenance**: Single location for all equipment logic
- **Easier Testing**: Centralized functions enable comprehensive testing
- **Consistent Behavior**: Identical functionality unless explicitly overridden
- **Clear Architecture**: Well-defined interfaces and extension points
- **Modular CSS**: Dedicated styling files for better code organization
- **Reduced File Bloat**: Extracted feat effects CSS to dedicated feats-effects.css module

### For Users
- **Reliability**: Fewer bugs due to code deduplication
- **Consistency**: Predictable behavior across all actor sheets
- **Performance**: Optimized shared code reduces memory usage
- **Future Features**: New functionality automatically available to all sheets
- **Better UX**: Consistent styling and behavior across all interfaces

### For System Evolution
- **Easy Extensions**: New actor sheet versions integrate effortlessly
- **Backward Compatibility**: All existing functionality preserved
- **Flexible Customization**: Any aspect can be modified for specific needs
- **Documentation**: Comprehensive examples for all use cases
- **CSS Modularity**: Easier styling maintenance with dedicated files for specific features

## Future Directions

### Planned Extensions
1. **ActorTraumaFunctions**: Shared trauma management operations
2. **ActorResourceFunctions**: Unified resource point management
3. **ActorRollFunctions**: Shared rolling mechanics and validation
4. **ActorFeatFunctions**: Enhanced feat effect system integration

### Version Roadmap
- **v0.7.8**: Trauma function deduplication
- **v0.7.9**: Resource management consolidation
- **v0.8.0**: Complete shared function ecosystem
- **v0.8.1**: Advanced customization features

### Architecture Goals
- **Zero Duplication**: Every function implemented exactly once
- **Maximum Flexibility**: Every behavior customizable per sheet version
- **Perfect Compatibility**: No breaking changes, ever
- **Comprehensive Documentation**: Every feature fully documented with examples

## Implementation Guidelines

### Adding New Shared Functions
1. **Analyze Duplication**: Identify identical code across sheet versions
2. **Design Interface**: Create flexible callback system for customization
3. **Preserve Behavior**: Ensure default behavior matches existing functionality
4. **Document Extensively**: Provide examples for all customization scenarios
5. **Test Thoroughly**: Validate all sheet versions work identically

### Customizing Existing Functions
1. **Review Examples**: Check EXAMPLES.js and EQUIPMENT-EXAMPLES.js
2. **Understand Defaults**: Know what behavior is preserved automatically
3. **Override Selectively**: Only customize what needs to be different
4. **Test Integration**: Verify changes don't break other functionality
5. **Document Changes**: Update local documentation for custom implementations

### Best Practices
- **Use Callbacks**: Prefer callback customization over function replacement
- **Preserve Defaults**: Only override when necessary for functionality
- **Error Handling**: Always provide fallback behavior for edge cases
- **Performance**: Avoid heavy operations in callback functions
- **Compatibility**: Test with both agent sheet versions before deployment

---

*This architecture document is maintained alongside the codebase and updated with each major system revision.*
