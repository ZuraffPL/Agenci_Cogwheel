# Agenci Cogwheel - Foundry VTT System

A Foundry Virtual Tabletop system for **Agenci Cogwheel** - a tabletop RPG about secret agents fighting threats in the industrial revolution era.

**Current System Version: 0.7.3**

## Description

Gra o tajnych agentach, którzy walczą z zagrożeniami ery rewolucji przemysłowej.

*A game about secret agents who fight threats of the industrial revolution era.*

## 🔄 What's New in v0.7.3

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

- **Foundry VTT**: Version 12 or higher
- **Verified Compatibility**: Foundry VTT v12.331

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

### Version 0.7.3 (2025-09-02) - Latest
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
