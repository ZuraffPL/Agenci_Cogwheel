# Release Notes v0.8.0 - Progress Clocks Revolution 🎉
## Cogwheel Syndicate Foundry VTT System

**Release Date**: September 6, 2025  
**Version**: 0.8.0  
**Compatibility**: Foundry VTT v12+

---

## 🌟 Major Features

### 🎯 Complete Progress Clocks Categorization System
The Progress Clocks system has been completely redesigned with a professional tab-based interface:

- **🏷️ Three Independent Categories**: Mission, Combat, and Other clocks are now organized in separate tabs
- **📋 Smart Tab Interface**: Click between categories to view only relevant clocks
- **➕ Context-Aware Adding**: New clocks are automatically added to the currently active tab
- **🔍 Category-Specific Filtering**: Each tab displays only its own clocks with proper CSS hierarchy

### 📏 Dynamic Window Height Adjustment
Intelligent window sizing that adapts to your needs:

- **📐 Smart Sizing**: Base height of 250px grows by 86px per visible clock
- **📊 Optimal View**: Compact view for few clocks, expanded view for many clocks
- **⚖️ Balanced Design**: Maximum height of 600px prevents oversized windows
- **⚡ Real-Time Updates**: Height adjusts instantly when switching tabs or adding/removing clocks

---

## 🛠️ Technical Improvements

### 🎮 Enhanced User Experience
- **🔄 State Persistence**: Active category is preserved through all operations
- **🎨 Visual Consistency**: Tab buttons properly highlight based on active category
- **📱 Responsive Design**: Window adapts to content for optimal screen real estate usage
- **⚙️ Streamlined Workflow**: Intuitive tab switching with immediate visual feedback

### 🔧 Robust State Management
- **💾 Automatic Restoration**: Active tab correctly restored after adding new clocks
- **🔄 Event Handling**: Improved programmatic events with safe preventDefault calls
- **🎯 DOM Synchronization**: Enhanced synchronization between JavaScript state and DOM elements
- **📊 Debug System**: Comprehensive logging for troubleshooting category and state issues

### 🏗️ Technical Architecture
- **🎪 CSS Hierarchy Fixes**: Fixed selector issues to properly target DOM elements
- **⚡ Performance Optimizations**: Efficient DOM updates and state synchronization
- **🛡️ Error Prevention**: Safe event handling prevents TypeErrors and duplicate actions
- **📝 Enhanced Debug**: Detailed console logging for development and troubleshooting

---

## 📋 What's Changed

### Files Updated
- **📄 system.json**: Version bumped to 0.8.0
- **📚 README.md**: Updated with v0.8.0 feature descriptions
- **📋 CHANGELOG.md**: Cleaned and consolidated release notes
- **🎨 src/styles/clocks.css**: Fixed CSS selectors for proper category filtering
- **⚙️ src/scripts/clocks.mjs**: Complete rewrite of state management and UI logic
- **🎭 src/templates/doom-clocks-dialog.hbs**: Enhanced template with dynamic tab highlighting

### Code Changes
- ✅ **Fixed**: CSS selectors now target correct DOM elements (.doom-clocks-content)
- ✅ **Fixed**: State management preserves active category between renders
- ✅ **Fixed**: Tab restoration works correctly after adding new clocks
- ✅ **Added**: Dynamic window height adjustment functionality
- ✅ **Added**: Category-specific clock filtering with proper hierarchy
- ✅ **Enhanced**: Event handling with programmatic event support
- ✅ **Improved**: Debug system with comprehensive logging

---

## 🚀 How to Use New Features

### Creating Categorized Clocks
1. Open Progress Clocks window
2. Switch to desired tab (Mission/Combat/Other)
3. Click "Add Progress Clock"
4. Clock is automatically assigned to active category
5. Clock appears only in its designated tab

### Managing Window Size
- Window automatically adjusts height based on visible clocks
- Switch between tabs to see different heights based on clock count
- No manual resizing needed - system handles optimization

### Troubleshooting
- Check browser console for detailed debug information
- Category switches are logged with timestamps
- State restoration events are tracked for debugging

---

## 🔄 Migration Notes

### For Existing Users
- **✅ Automatic Migration**: Existing clocks are automatically assigned to 'Mission' category
- **📋 No Data Loss**: All existing progress clocks are preserved
- **🎯 Enhanced Organization**: Start organizing clocks into appropriate categories

### For Developers
- **📊 Enhanced Debug**: More detailed logging available for troubleshooting
- **🎪 CSS Structure**: New CSS hierarchy requires .doom-clocks-content targeting
- **⚙️ State Management**: New activeCategory property controls tab switching

---

## 📈 Performance Impact

- **⚡ Improved**: More efficient DOM updates with targeted category switching
- **📊 Optimized**: Smart window sizing reduces unnecessary screen space usage
- **🔄 Enhanced**: Better state management reduces redundant render calls
- **💾 Reduced**: Consolidated debug logging improves performance

---

## 🌐 Compatibility

- **✅ Foundry VTT**: v12+ (tested on v12.331)
- **🌍 Languages**: English and Polish (dual language support)
- **🎭 Modules**: Compatible with all existing Cogwheel Syndicate modules
- **📱 Browsers**: All modern browsers supporting ES6+

---

## 👥 Credits

Developed with ❤️ for the Cogwheel Syndicate community
- **Development**: ZuraffPL
- **System Design**: Cogwheel Syndicate RPG Team
- **Testing**: Community feedback and extensive QA

---

## 📞 Support

- **🐛 Bug Reports**: [GitHub Issues](https://github.com/ZuraffPL/Agenci_Cogwheel/issues)
- **💬 Community**: Join our Discord for support and discussion
- **📋 Documentation**: Check README.md for detailed setup instructions

---

**Enjoy the enhanced Progress Clocks system! 🎯⚙️**
