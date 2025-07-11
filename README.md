# Agenci Cogwheel - Foundry VTT System

A Foundry Virtual Tabletop system for **Agenci Cogwheel** - a tabletop RPG about secret agents fighting threats in the industrial revolution era.

**Current System Version: 0.6.8**

## Description

Gra o tajnych agentach, którzy walczą z zagrożeniami ery rewolucji przemysłowej.

*A game about secret agents who fight threats of the industrial revolution era.*

## Features

- **Multilingual Support**: Available in English and Polish
- **Character Sheets**: Complete actor sheets for players and NPCs
- **Headquarters Management**: HQ sheets for managing your base of operations
- **Nemesis System**: Special sheets for tracking antagonists
- **Nemesis Clocks Tab**: Dedicated tab for Nemesis clocks (goal, weakening, revenge) with visual progress and chat notifications
- **Clock System**: Built-in progress clocks for tracking missions and events
- **Equipment Management**: Comprehensive gear and equipment tracking
- **Trauma System**: Detailed trauma tracking mechanics
- **Roll Mechanics**: Integrated dice rolling system
- **Meta Currency**: Special currency management system with real-time synchronization for all users
- **Improved Translations**: Full support for Polish and English, including dynamic UI elements

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

### Version 0.6.8
- **Nowa funkcja**: Możliwość przenoszenia i edycji zegarów Nemezis w dedykowanej zakładce
- **Poprawki synchronizacji**: Ulepszona synchronizacja metawalut i liczników stresu dla wszystkich użytkowników
- **Usprawnienia UI**: Refaktoryzacja szablonów, lepsza nawigacja i czytelność kart aktorów
- **Drobne poprawki tłumaczeń**: Uzupełnienia i korekty w plikach językowych
- **Stabilność**: Poprawki błędów zgłaszanych przez użytkowników

### Version 0.6.3
- **Synchronizacja metawalut**: Zmiany metawalut i liczników stresu są natychmiast widoczne dla wszystkich użytkowników (nie tylko GM)
- **Refaktoryzacja UI**: Sekcja zegarów Nemezis przeniesiona do osobnej zakładki z dedykowaną nawigacją
- **Poprawki tłumaczeń**: Uzupełniono i poprawiono tłumaczenia atrybutów i UI
- **Wsparcie PowerShell 7**: Zalecane środowisko terminalowe dla deweloperów na Windows

### Version 0.6.1
- **Compendium Pack dla Archetypów**: Automatyczne dostarczanie gotowych archetypów po instalacji systemu

---

**Note**: This system is designed for the Agenci Cogwheel RPG. Make sure you have access to the game rules to fully utilize this system.
