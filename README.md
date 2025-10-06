# Agenci Cogwheel - Foundry VTT System

A Foundry Virtual Tabletop system for **Agenci Cogwheel** - a tabletop RPG about secret agents fighting threats in the industrial revolution era.

**Current System Version: 0.9.19**

## ⚠️ Important Version Notice | Ważne Informacje o Wersji

### Foundry VTT v13+ (Current/Latest)
- **Version 0.9.19**: Requires Foundry VTT v13.348 or higher
- **Full native DOM API compatibility** - no jQuery dependencies
- **Latest features and optimizations**

### Foundry VTT v12 (Legacy Support)
- **Version 0.8.1**: Available on `foundry-v12-compat` branch
- **Compatible with Foundry VTT v12.331**
- **Maintained for users not ready to upgrade Foundry**

## Description

Gra o tajnych agentach, którzy walczą z zagrożeniami ery rewolucji przemysłowej.

*A game about secret agents who fight threats of the industrial revolution era.*

## 🔥 What's New in v0.9.19

### 🔄 Real-Time Clock Synchronization
- **⚡ Instant Updates**: All clock changes synchronize immediately across all connected users
- **🎯 No Window Refresh Needed**: Changes visible without closing/reopening the Doom Clocks dialog
- **📡 Socket Broadcasting**: Proper multi-user synchronization using Foundry's native socket system
- **🔧 All Operations Synced**: Add, edit, delete, increment/decrement segments - all update in real-time
- **📑 Category Preservation**: Active category (Mission/Campaign/Personal) maintained during sync

### 🛠️ Technical Improvements
- **🎯 ApplicationV2 Instance Discovery**: Triple-layer search for reliable dialog detection
  - Primary: `ui.windows` collection
  - Secondary: `foundry.applications.instances` (ApplicationV2 native)
  - Fallback: `globalThis.foundry.applications.apps`
- **🏷️ Unique Marker System**: Added `_isCogwheelClocksDialog` marker for reliable identification
  - More robust than `instanceof` checks with module scoping
- **🚫 Infinite Loop Prevention**: `isSocketUpdate` flag prevents socket broadcast loops
- **⚡ Optimized Non-GM Updates**: Players only refresh UI without redundant settings saves
- **📝 Reduced Logging**: Streamlined console output to essential synchronization messages only
- **🌐 Global Export**: `DoomClocksDialog` class exported and globally accessible

### 🐛 Bug Fixes
- Fixed clocks not updating immediately when GM makes changes
- Resolved ApplicationV2 instance not being found in `ui.windows` collection
- Fixed socket listener initialization timing (moved from `setup` to `ready` hook)

## 🔥 What's New in v0.9.18

### 🎯 Interactive Consequence Selection System
- **🎮 Player Choice**: Transform passive consequence display into interactive selection interface
- **📋 10 Consequence Types**: Comprehensive list of mechanical and narrative consequences
  1. Attribute damage | Obrażenie w atrybut
  2. Lower fictional position | Obniżenie pozycji fikcyjnej
  3. Lose Gear points | Utrata punktów Sprzętu
  4. Lose Steam Points | Utrata Punktów Pary
  5. Increase Stress level | Podniesienie poziomu Stresu
  6. Advance threat clock | Podbicie zegara zagrożenia
  7. Reduce progress clock | Obniżenie zegara postępu
  8. Damage/drop equipment | Uszkodzenie/upuszczenie ekwipunku
  9. Negative roll modifier | Ujemny modyfikator do rzutu
  10. Additional narrative complication | Dodatkowa komplikacja fabularna

### 🎨 Selection Dialog Features
- **✅ Real-Time Counter**: Live selection tracker with color-coded feedback (blue → green → red)
- **🔒 Smart Validation**: Automatic checkbox disabling when selection limit reached
- **⚠️ Exact Selection**: Enforces choosing the exact number of consequences (no more, no less)
- **🎭 Steampunk Styling**: Beautiful DialogV2 interface matching system aesthetic
- **🌐 Full Bilingual Support**: Complete Polish/English translations for all UI elements

### 💬 Chat Message Integration
- **📨 Selected Consequences Display**: Elegant chat message showing player's choices
- **⚙️ Gear Icon Bullets**: Copper-colored gear icons (⚙) for each consequence
- **👤 Agent Highlighting**: Blue-colored agent names for clear attribution
- **🎨 Steel/Coal Gradient**: Matching system's steampunk visual language
- **📏 Consistent Typography**: 1.3em font size matching consequence messages

### 🛠️ Technical Implementation
- **🧩 Modular Architecture**: All consequence logic in `consequences.mjs` module
- **⚡ DialogV2.wait() API**: Modern Foundry v13 dialog implementation
- **🔄 Button State Management**: Automatic disable after selection prevents duplicates
- **🎯 Timestamp-Based IDs**: Early generation prevents reference errors
- **🎨 Enhanced CSS**: New `.select-consequences-btn` and `.selected-consequences-message` styles

## 🔥 What's New in v0.9.9

### 💥 Foundry v13 Complete Compatibility
- **🎯 DialogV2 Migration**: Complete migration from Dialog to DialogV2.wait() for modern API compatibility
- **⚡ Scene Controls**: Fixed scene controls structure for Foundry v13 object-based approach
- **🔧 jQuery Compatibility**: Resolved all "element.find is not a function" errors with proper DOM wrapping
- **🌿 Namespace Updates**: Updated all deprecated APIs including renderTemplate namespace fixes

### 🛠️ Technical Fixes
- **📝 Render Callbacks**: Removed problematic DialogV2 render callback implementations
- **🔍 Hook Updates**: Replaced deprecated hooks with modern Foundry v13 equivalents
- **🎛️ Property Access**: Modern `.value`, `.checked`, `.dataset` instead of jQuery equivalents
- **🎨 Class Management**: Native `classList` API for all CSS class manipulations

## 🔥 What's New in v0.8.1

### 🤝 Support Feat System
- **🎯 Steam Agent Support Effect**: Complete implementation of Support feat for Steam Agent archetype
- **📊 Stacking Steam Points**: Each active Steam Agent with Support feat increases starting Steam Points by +1
- **👥 Active Player Detection**: Only counts Steam Agents with active (logged-in) player owners for balance
- **🎮 Multi-Agent Support**: Multiple Steam Agents with Support feat properly stack effects (2 agents = +2 points)
- **🌐 Real-Time Synchronization**: Steam Points automatically update when feats are added/removed or players connect/disconnect

### 🧹 Code Quality Improvements  
- **🐛 Debug Cleanup**: Removed redundant debug logs for cleaner console output
- **⚡ Performance Optimization**: Streamlined Support feat detection and Steam Points calculation
- **🔧 Error Handling**: Enhanced error handling for feat system operations
- **📝 Code Documentation**: Improved inline documentation for Support feat functionality

### 🎨 User Experience Enhancements
- **✨ Visual Feedback**: Clear notifications when Support effects modify Steam Points pool
- **📢 Chat Integration**: Automatic chat messages announcing Support feat application/removal
- **🎭 Thematic Icons**: FontAwesome hands-helping icon for Support feat effects
- **🌍 Full Internationalization**: Complete Polish/English support for all Support feat messages

## 🔥 What's New in v0.8.0

### 🎯 Progress Clocks Revolution
- **📋 Tab Categorization System**: Complete redesign with three independent tabs (Mission/Combat/Other) for perfect clock organization
- **📏 Dynamic Window Height**: Smart auto-resizing based on visible clocks - compact for few clocks, expanded for many (250px-600px range)
- **🎨 Category-Specific Filtering**: Each tab shows only its own clocks with proper CSS hierarchy and DOM synchronization
- **🔄 Smart State Management**: Active category preserved through all operations - add clocks to current tab and stay there

### 🛠️ Technical Excellence
- **🎮 Enhanced User Experience**: Streamlined workflow for managing categorized progress clocks with intuitive tab switching
- **🔧 Robust Event Handling**: Improved programmatic events with safe preventDefault calls and proper DOM restoration
- **📊 Advanced Debug System**: Comprehensive logging for troubleshooting category and state management
- **⚡ Performance Optimizations**: Efficient DOM updates and state synchronization for smooth user interactions

### 📈 Previous Features (v0.7.9)

- **🧠 Trauma Toggle & Collapse System**: Implemented collapsible trauma sections with full interactivity
  - **Toggle Functionality**: Added chevron icons for expand/collapse trauma details with smooth animations
  - **Type-Specific Icons**: FontAwesome icons for trauma types - heart-broken (Physical), head-side-virus (Psychological), brain (Mental)
  - **Steampunk Styling**: Purple gradient backgrounds with metallic effects across all trauma types
  - **Inline Actions**: Moved edit/delete buttons to trauma header with "|" separator for compact, professional layout

- **📝 Enhanced Trauma Details Layout**: Complete restructuring of trauma information display
  - **Separate Labeled Sections**: Description and effect now in individual sections with bold labels and frames
  - **Visual Distinction**: Different colored left borders (purple accents) and hover effects for better organization
  - **Improved Readability**: Clear section labels with dashed underlines and proper spacing

- **� Progress Clocks Visual Overhaul**: Complete steampunk redesign of the Progress Clocks application
  - **Steampunk Dialog Background**: Brown-gold gradient background with metallic shine effects matching system aesthetic
  - **Enhanced Add Button**: Clock icon (fa-clock), increased width to 180px, professional steampunk gradient styling
  - **Multi-Color Clock Backgrounds**: 8 different steampunk gradient backgrounds for easy visual distinction between clocks
  - **Color Palette**: Bronze, Purple-Gold, Green-Olive, Orange-Rust, Mystical Purple, Red-Brown, Steel Blue, Military Khaki
  - **Typography Improvements**: Color-matched text with enhanced shadows for optimal readability on all background variants

- **�🔧 Dialog & UX Improvements**: Fixed trauma type dropdown and enhanced user experience
  - **Better Dropdown Display**: Fixed trauma type selection dropdown with improved height and visibility
  - **Enhanced Styling**: Better font sizing, line-height, and Foundry VTT dialog compatibility
  - **V1/V2 Consistency**: All trauma enhancements implemented uniformly across both actor sheet versions

## 🔥 What's New in v0.7.8

- **💀 Trauma Section UI Modernization**: Complete visual overhaul matching equipment section design  
  - **Archetype-Style Background**: Applied steampunk gradient backgrounds with golden borders to trauma sections
  - **Purple Skull Icon**: Added distinctive fa-skull icon with purple color (#8e44ad) for thematic distinction
  - **Steampunk Button Design**: "Dodaj traumę" button with professional gradient styling and hover animations
  - **Visual Consistency**: Trauma sections now match equipment section elegance with unified archetype-inspired styling
  - **Template Updates**: Both V1 and V2 actor sheets updated with `.archetype-section` class and `.steampunk-btn` components
  - **Visual Differentiation**: Color-coded agent names (blue), equipment names (green), and costs (red)
  - **Backpack Icons**: fa-backpack icons for all equipment add/delete operations
  - **Both Sheet Support**: V1 and V2 actor sheets fully integrated with custom message callbacks

- **⚡ Resource Message Icon System**: Specialized visual indicators for different resource types
  - **Gear Resources**: fa-cog (cog wheel) icons - maintains mechanical theme
  - **Stress Resources**: fa-exclamation-triangle (warning triangle) icons
  - **Trauma Resources**: fa-skull icons for dramatic impact
  - **Agent Name Styling**: Consistent blue coloring (#3498db) across all message types

- **🎨 CSS Architecture Enhancement**: Modular styling system for better maintainability
  - **feats-effects.css**: Dedicated stylesheet for all feat effects and message styling
  - **Equipment-Message Class**: New archetype-inspired styling for equipment operations
  - **Resource-Specific Colors**: Gear (green), stress (red), trauma (purple) visual coding
  - **Unified Design Language**: Consistent steampunk aesthetic across all message types

- **🏗️ Revolutionary Code Architecture**: Complete equipment function deduplication system
  - **ActorEquipmentFunctions Module**: Universal equipment management (add/edit/delete) with shared functions
  - **500+ Lines of Code Eliminated**: Massive reduction in duplicated code across both agent sheet versions
  - **Flexible Customization System**: 10+ customization hooks allowing different behavior per sheet version
  - **Zero Breaking Changes**: All existing functionality preserved while dramatically improving maintainability

- **📚 Enhanced Multilingual Support**: Improved translation system for equipment messages
  - **HTML-Formatted Translations**: Rich text support in PL/EN language files
  - **Consistent Message Formatting**: Standardized equipment add/delete message templates

## 🔄 Previous Updates in v0.7.7
  - **Archetype-Style Design**: Equipment messages now match character archetype visual styling
  - **Equipment-Message CSS Class**: Steampunk gradient backgrounds with golden borders and shadows
  - **Visual Differentiation**: Color-coded agent names (blue), equipment names (green), and costs (red)
  - **Backpack Icons**: fa-backpack icons for all equipment add/delete operations
  - **Both Sheet Support**: V1 and V2 actor sheets fully integrated with custom message callbacks

- **⚡ Resource Message Icon System**: Specialized visual indicators for different resource types
  - **Gear Resources**: fa-cog (cog wheel) icons - maintains mechanical theme
  - **Stress Resources**: fa-exclamation-triangle (warning triangle) icons
  - **Trauma Resources**: fa-skull icons for dramatic impact
  - **Agent Name Styling**: Consistent blue coloring (#3498db) across all message types

- **🎨 CSS Architecture Enhancement**: Modular styling system for better maintainability
  - **feats-effects.css**: Dedicated stylesheet for all feat effects and message styling
  - **Equipment-Message Class**: New archetype-inspired styling for equipment operations
  - **Resource-Specific Colors**: Gear (green), stress (red), trauma (purple) visual coding
  - **Unified Design Language**: Consistent steampunk aesthetic across all message types

- **🏗️ Revolutionary Code Architecture**: Complete equipment function deduplication system
  - **ActorEquipmentFunctions Module**: Universal equipment management (add/edit/delete) with shared functions
  - **500+ Lines of Code Eliminated**: Massive reduction in duplicated code across both agent sheet versions
  - **Flexible Customization System**: 10+ customization hooks allowing different behavior per sheet version
  - **Zero Breaking Changes**: All existing functionality preserved while dramatically improving maintainability

- **� Enhanced Multilingual Support**: Improved translation system for equipment messages
  - **HTML-Formatted Translations**: Rich text support in PL/EN language files
  - **Consistent Message Formatting**: Standardized equipment add/delete message templates
  - **Agent Name Integration**: Proper bold formatting for character names in all languages

## 🔄 Previous Updates in v0.7.6

- **⚡ Steam Booster Effect**: Complete Steam Booster feat effect implementation for Tech Genius archetype
  - **2x Steam Points Generation**: Attribute tests now generate double Steam Points when Tech Genius has "Dopalacz Pary" feat
  - **Universal Compatibility**: Works perfectly on both Agent v1 and Agent v2 character sheets
  - **Visual Notifications**: Styled chat messages announce Steam Booster activation with steampunk theming
  - **Smart Detection**: Automatically detects archetype-feat combinations and applies effects seamlessly
- **🎯 Feat Display Enhancements**: Major visual improvements to feat management system
  - **Archetype Integration**: Feat creation now includes archetype selection for better organization
  - **Adaptive Layout**: Dynamic column widths prevent feat name truncation
  - **Enhanced Grid**: Improved spacing, alignment, and visual hierarchy in feat display
- **🔧 Critical Agent v2 Fix**: Resolved Steam Booster compatibility issue with Agent v2 sheets
  - **Root Cause Fixed**: Corrected feat access method to use proper `actor.system.feats` array
  - **Architectural Alignment**: Now matches Cogwheel Syndicate's feat storage system perfectly
  - **Comprehensive Testing**: Added debugging infrastructure to prevent future compatibility issues

## 🔄 Previous Updates in v0.7.5

- **🔧 Feats Effects System**: Complete automated attribute modification system
  - **Steam Commando + Steam Augmentation**: Steel attribute +1 (maximum 6)
  - **Tech Genius + Tinkerer**: Machine attribute +1 (maximum 6)  
  - Automatic effect application when feat-archetype combinations are detected
  - Visual notifications with chat messages and steampunk theming
  - Smart effect removal when feats are deleted or archetypes changed
- **✨ Terminology Consistency**: Complete system rename from "advantage" to "feats"
  - All files renamed: `advantage-effects.mjs` → `feats-effects.mjs`
  - Updated API methods: `applyAdvantageEffects()` → `applyFeatEffects()`
  - CSS classes updated: `.advantage-effect-message` → `.feat-effect-message`
  - Language files corrected: `COGSYNDICATE.AdvantageEffect` → `COGSYNDICATE.FeatEffect`
- **🎨 Visual Polish**: Enhanced feat effect messages with Font Awesome icons and copper theming
- **📚 Documentation**: Complete system documentation in `FEATS_EFFECTS.md`

## 🔄 Previous Updates in v0.7.4

- **🎯 Complete Resource Icon System**: All agent resources now have distinctive, color-coded icons
  - ⚙️ **Gear**: Copper cog icon for equipment and tools
  - ⚠️ **Stress**: Red warning triangle for danger indicators  
  - 💀 **Trauma**: Purple skull icon for permanent damage
- **📝 Enhanced Typography**: Larger, more readable labels across both agent cards
  - 16px main resource labels with improved contrast
  - 15px secondary attribute labels for better hierarchy
- **🪟 Optimized Window Layout**: Better workspace organization
  - Metacurrency window positioned in bottom-left corner (250px height)
  - Doom clocks positioned in top-left corner for optimal workflow
- **🔧 Agent v2 Functionality Parity**: Complete feature synchronization
  - Fixed spend stress mechanics with trauma warnings and Steam Points integration
  - Fixed spend gear system with all gear types and proper validation
  - Resolved gear auto-regeneration bug for accurate resource tracking
- **✨ Visual Consistency**: Both agent card versions now have identical functionality and appearance

## 🔄 Previous Updates in v0.7.3

- **🏗️ Major Attribute Restructuring**: Complete attribute rename system implemented
  - **Stal (Steel)**: New name for the first core attribute (was: Maszyna)
  - **Maszyna (Machine)**: New name for the second core attribute (was: Inżynieria) 
  - **Intryga (Intrigue)**: Unchanged third core attribute
- **🐛 Critical Bugfix**: Fixed "currentResult is not defined" error in success upgrade buttons
- **✨ Enhanced User Experience**: All UI elements updated with consistent naming convention
- **🔧 Full Backward Compatibility**: All existing characters work without data migration

## 🎨 Previous Features in v0.7.2

- **🎨 Complete Steampunk Theme**: Full visual overhaul with copper, steel, and coal color palette
- **🎯 Enhanced Roll Dialog**: Color-coded dice sections with stress (red), steam (blue), devil (steel gradient), and trauma (purple)
- **🔧 Label Styling Fixes**: All roll dialog labels now display properly in sandy color (#f4a460)
- **💜 Trauma Text Formatting**: Improved trauma display with proper black text for descriptions
- **✨ Visual Polish**: Enhanced UI consistency across both agent card versions

- **🎯 Enhanced Archetype System**: Drag & drop archetypes now properly update character attributes
- **🎨 Improved Visual Layout**: Better CSS Grid positioning and archetype information display
- **🔧 Technical Improvements**: Backward compatibility and enhanced data handling
- **✨ Polished UI**: Optimized layouts with better visual balance and user experience

## 🔥 Key Features in v0.7.1

- **🎯 Enhanced Archetype System**: Drag & drop archetypes now properly update character attributes
- **🎨 Improved Visual Layout**: Better CSS Grid positioning and archetype information display
- **🔧 Technical Improvements**: Backward compatibility and enhanced data handling
- **✨ Polished UI**: Optimized layouts with better visual balance and user experience

## 🎲 Previous Major Features in v0.7.0

- **🎲 Devil's Bargain**: New rolling mechanic - trade 2 Nemesis Points for an extra d12 die
- **⚡ Visual Effects**: Smart mutual exclusion between Devil Die and Steam Die with cross-out effects
- **🎭 Complete Agent v2**: Full feature parity between both agent sheet types
- **🎨 Premium Styling**: Elegant archetype sections with gradients and hover effects

## Features

- **Advanced Rolling System**: 
  - **Devil's Bargain (Czarci Targ)**: New rolling mechanic - add 2 Nemesis Points to pool for extra d12 die
  - **Steam Die Integration**: Enhanced steam die mechanics with visual exclusion effects
  - **Smart Dice Management**: Maximum 4d12 per roll with intelligent combination handling
  - **Reroll System**: 3PP reroll mechanics with free bonus dice integration
- **Multilingual Support**: Available in English and Polish with complete UI localization
- **Character Management**:
  - **Dual Agent Sheets**: Complete actor sheets for both Agent v1 and Agent v2 with identical functionality
  - **Archetype System**: Drag-and-drop archetype support with automatic attribute value application
  - **Trauma Tracking**: Detailed trauma system with specialized trauma types and levels
  - **Equipment Points**: Comprehensive gear and equipment management
- **Headquarters Management**: 
  - **HQ Sheets**: Complete base management with locations and expansion projects
  - **Primary Sections**: Infirmary, Crew Quarters, Training Halls, Workshop with upgrade tracking
- **Nemesis System**: 
  - **Nemesis Sheets**: Specialized antagonist tracking with influence ranges and organization types
  - **Clock Management**: Goal, weakening, and revenge clocks with visual progress indicators
  - **Minion Tracking**: Complete minion management within nemesis sheets
- **Meta Currency System**: 
  - **Real-time Synchronization**: Instant updates for all users, not just GM
  - **Interactive Dialogs**: Spending interfaces for gear, stress, and development points
  - **Chat Integration**: Automatic notifications for all meta currency changes
- **Enhanced UI/UX**:
  - **Visual Feedback**: Mutual exclusion effects for Devil Die and Steam Die
  - **Archetype Styling**: Elegant gradients, hover effects, and professional layout
  - **Grid Layouts**: Optimized CSS Grid systems for better information organization
  - **Responsive Design**: Consistent experience across different screen sizes

## Installation

### Method 1: Manifest URL (Recommended)
1. Open Foundry VTT
2. Go to "Game Systems" tab
3. Click "Install System"
4. Paste the manifest URL: `https://github.com/ZuraffPL/Agenci_Cogwheel/releases/latest/download/system.json`
5. Click "Install"

### Method 2: Manual Installation
1. Download the latest release from the [Releases](../../releases) page
2. Extract the zip file into your Foundry VTT `Data/systems` folder
3. Restart Foundry VTT
4. Create a new world using the "Agenci Cogwheel" system

## System Requirements

### For v0.9.9 (Current Version)
- **Foundry VTT**: Version 13.348 or higher
- **Verified Compatibility**: Foundry VTT v13.348
- **Modern Browser**: Required for native DOM API support

### For v0.8.1 (Legacy Support)
- **Foundry VTT**: Version 12.331
- **Branch**: Use `foundry-v12-compat` branch
- **jQuery Support**: Included for older Foundry versions

## 🎮 Core Mechanics

### Rolling System
- **Base Roll**: 2d12 + attribute + stress dice
- **Steam Die**: Spend 1 stress for +1d12 (max once per roll)
- **Devil's Bargain**: Spend 2 Nemesis Points for +1d12 (mutual exclusive with Steam Die)
- **Reroll**: Spend 3PP to reroll with bonus dice included for free
- **Critical Results**: Double 11s and 12s for critical success, double 1s for critical failure

### Character Development
- **Archetypes**: Pre-built character templates with balanced attribute distributions
- **Trauma System**: Specialized trauma types affecting different aspects of gameplay
- **Equipment Points**: Strategic resource management for gear acquisition
- **Development Points**: Character advancement through mission completion

### Meta Currency Management
- **Nemesis Points**: Shared pool affecting Devil's Bargain and GM complications
- **Stress**: Individual resource for enhanced performance and Steam Die usage
- **Gear Points**: Equipment acquisition and maintenance resource
- **Real-time Sync**: All currency changes instantly visible to all players

## File Structure

```
cogwheel-syndicate/
├── lang/                    # Language files
│   ├── en.json             # English translations
│   └── pl.json             # Polish translations
├── packs/                   # Compendium packs
│   └── archetypes/         # Character archetypes
├── src/
│   ├── apps/               # Application classes
│   ├── scripts/            # JavaScript modules
│   ├── styles/             # CSS stylesheets
│   └── templates/          # Handlebars templates
├── system.json             # System manifest
└── template.json           # Data model templates
```

## Development

This system is built using:
- **Foundry VTT API**: v12+
- **JavaScript ES6 Modules**
- **Handlebars Templates**
- **CSS3**
- **PowerShell 7+** (recommended for development on Windows)

### Local Development Setup

1. Clone this repository into your Foundry VTT `Data/systems` folder
2. Restart Foundry VTT
3. Create a test world using this system
4. Make your changes and test in the world

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## License

[Add your license information here]

## Support

If you encounter any issues or have questions about this system, please:
1. Check the [Issues](../../issues) page for existing reports
2. Create a new issue if your problem isn't already reported
3. Provide detailed information about your setup and the issue

## Changelog

### Version 0.8.1 (2025-09-08) - Latest
- **Support Feat System for Steam Agent Archetype**:
  - Complete implementation of Support feat effect increasing starting Steam Points pool
  - Intelligent active player detection - only counts Steam Agents with connected players
  - Stacking system for multiple Support feats (each active Steam Agent with Support adds +1 to base pool)
  - Real-time Steam Points synchronization when feats are added/removed or players connect/disconnect
- **Code Quality & Performance**:
  - Removed redundant debug logs for cleaner console output and better performance
  - Enhanced error handling and streamlined Support feat detection algorithms  
  - Improved inline documentation for better code maintainability
- **User Experience Enhancements**:
  - Visual notifications and chat integration for Support feat effects with thematic icons
  - Complete internationalization support with Polish/English translations
  - Clear feedback when Support effects modify Steam Points pool

### Version 0.8.0 (2025-09-07)
- **Complete UI Enhancement System**:
  - Trauma Section UI Modernization with archetype-style backgrounds and purple skull icons
  - Equipment Section UI Overhaul with steampunk gradient styling and backpack iconography
  - Unified design language across all character sheet sections with consistent button styling
  - Professional steampunk aesthetic with golden borders, shadows, and hover animations
- **Enhanced Equipment & Resource Systems**:
  - Equipment messaging system with archetype-inspired chat message styling
  - Resource-specific icons (gear/stress/trauma) with color-coded information display
  - Revolutionary code architecture with ActorEquipmentFunctions module eliminating 500+ lines of duplication
  - Advanced customization hooks allowing flexible behavior across different sheet versions
- **Visual Excellence & Maintainability**:
  - Modular CSS architecture with dedicated feats-effects.css stylesheet
  - Template synchronization across V1 and V2 actor sheets with identical functionality
  - Enhanced multilingual support with HTML-formatted translations and consistent messaging

### Version 0.7.7 (2025-09-04)
- **Revolutionary Code Architecture**:
  - Complete equipment function deduplication system with ActorEquipmentFunctions module
  - 500+ lines of duplicated code eliminated while preserving all existing functionality
  - Advanced shared function system with 10+ customization hooks for per-version behavior
  - Universal equipment management (add/edit/delete) with flexible validation and callback systems
- **Enhanced Maintainability**:
  - Single-point-of-change for all equipment operations across both agent sheet versions
  - Future-proof architecture ready for V3, V4, and additional agent sheet versions
  - Comprehensive documentation with EQUIPMENT-EXAMPLES.js showing 7+ implementation scenarios
  - Zero breaking changes - all existing sheets work identically with new shared function architecture
- **Technical Excellence**:
  - Modular shared function architecture with ActorGearFunctions, ActorStressFunctions, and ActorEquipmentFunctions
  - Complete validation pipeline with custom override capabilities and robust error handling
  - ES6 module system with clean dependency management and optimized loading order

### Version 0.7.6 (2025-09-04)
- **Steam Booster Effect for Tech Genius Archetype**:
  - Complete implementation with 2x Steam Points generation during attribute tests
  - Universal compatibility across both Agent v1 and Agent v2 character sheets
  - Visual notifications with steampunk-themed chat messages and automatic effect detection
- **Feat Display System Enhancements**:
  - Major visual improvements with archetype integration and adaptive layout systems
  - Enhanced grid display preventing feat name truncation with dynamic column width adjustment
- **Critical Agent v2 Compatibility Fix**:
  - Resolved Steam Booster effect issues with corrected feat access methods
  - Architectural alignment with Cogwheel Syndicate's feat storage system using actor.system.feats array

### Version 0.7.5 (2025-09-03)
- **Feats Effects System**:
  - Complete automated attribute modification system for feat-archetype combinations
  - Steam Commando + Steam Augmentation: Steel attribute +1 (maximum 6)
  - Tech Genius + Tinkerer: Machine attribute +1 (maximum 6)
  - Automatic effect application and removal with visual notifications
  - Chat messages with steampunk theming and Font Awesome icons
- **System Terminology Consistency**:
  - Complete rename from "advantage-effects" to "feats-effects" throughout system
  - Updated all API methods, CSS classes, and language file keys
  - Consistent "feats" terminology across entire codebase
- **Documentation Enhancement**:
  - Added comprehensive FEATS_EFFECTS.md documentation
  - System architecture and effect implementation details

### Version 0.7.4 (2025-09-02)
- **Major Attribute Restructuring**:
  - Complete attribute rename system: Stal (Steel), Maszyna (Machine), Intryga (Intrigue)
  - Strategic remapping: Former "Maszyna" → "Stal", Former "Inżynieria" → "Maszyna"
  - All character sheets, roll dialogs, and archetype descriptions updated
  - Full backward compatibility maintained with existing character data
- **Critical Bugfix**:
  - Fixed "currentResult is not defined" error in success upgrade button functionality
  - Success upgrade buttons now work correctly for both Agent v1 and v2 sheets
  - Proper Steam Points deduction and chat message display restored
- **Enhanced User Experience**:
  - Unified naming convention across entire system interface
  - All UI elements updated with consistent attribute naming
  - Archetype descriptions reflect new attribute structure
- **Technical Improvements**:
  - Comprehensive localization updates for both Polish and English
  - All Handlebars templates updated with new attribute references
  - Data integrity preserved for seamless compatibility

### Version 0.7.2 (2025-08-28)
- **Complete Steampunk Theme Implementation**:
  - Full visual overhaul with cohesive steampunk color palette
  - Copper (#cd7f32), steel (#c0c0c0-#d3d3d3), coal gradients, and sandy (#f4a460) colors throughout
  - Enhanced archetype sections with steampunk styling on both agent cards v1 and v2
  - Notes sections unified with steampunk theme across all actor sheets
- **Roll Dialog Enhanced Styling**:
  - Color-coded dice sections: stress dice (red), steam dice (blue), devil dice (steel gradient), trauma (purple)
  - Fixed position and modifier labels - now properly display sandy color (#f4a460)
  - Ultra-specific CSS selectors for reliable label styling
  - Devil dice section background changed to dark steel gradient
- **Trauma Text Formatting**:
  - Removed bold formatting from "Agent posiada traumę" prefix text
  - Changed prefix text color to black for better readability
  - Maintained purple styling for trauma values
- **UI Consistency Improvements**:
  - Enhanced visual hierarchy in roll dialogs
  - Improved text contrast and readability
  - Consistent steampunk aesthetic across entire system

### Version 0.7.1 (2025-08-27)
- **Enhanced Archetype Functionality**:
  - Fixed drag & drop archetype application - now properly updates actor attribute values
  - Improved archetype attribute display with correct numerical values
  - Added backward compatibility for different archetype data formats
- **UI/UX Improvements**:
  - Optimized CSS Grid layout for better archetype section centering
  - Enhanced visual balance with improved column proportions (1fr 2fr 60px)
  - Fixed HTML structure for better Grid compatibility
- **Technical Enhancements**:
  - Enhanced `_onDrop()` functions to properly copy archetype attributes to actors
  - Improved data loading in `getData()` with dual format support
  - Optimized Handlebars templates for correct attribute value rendering

### Version 0.7.0 (2025-08-26)
- **Devil's Bargain (Czarci Targ) - New Rolling Mechanic**:
  - Added "Devil's Bargain" checkbox in roll dialog - spend 2 Nemesis Points for +1d12
  - Positioned between Steam Die and Trauma checkboxes with distinctive red styling
  - Mutual exclusion with Steam Die - maximum one bonus die per roll
  - Full integration with critical success/failure mechanics and reroll system
- **Visual Mutual Exclusion Effects**:
  - Cross-out effects when Devil Die and Steam Die exclude each other
  - Dynamic visual feedback: opacity reduction, line-through, red strike-through
  - Gray background and disabled cursor for inactive options
  - Automatic restoration when checkboxes are unchecked
- **Enhanced Agent v2 Functionality**:
  - Complete reconstruction of Equipment, Trauma, and Notes sections
  - Color-coded equipment, structured trauma types, improved layout
  - Full feature parity with original Agent sheets
- **Archetype Styling Enhancement**:
  - Elegant gradient backgrounds (gray-purple palette) for archetype sections
  - Purple borders with rounded corners and subtle shadows
  - Hover effects with animated light streaks and scaling transforms
  - Stylized remove buttons with gradient effects and hover/active states

### Version 0.6.9 (2025-08-25)
- **Enhanced Nemesis Clock Management**: Moveable and editable clocks in dedicated tab
- **Improved Meta Currency Synchronization**: Real-time updates for all users
- **UI Refactoring**: Better navigation and readability across all actor sheets
- **Translation Updates**: Comprehensive Polish and English localization improvements

---

**Note**: This system is designed for the Agenci Cogwheel RPG. Make sure you have access to the game rules to fully utilize this system.



