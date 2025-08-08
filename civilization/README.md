# Civilization God - 3D Face Tracking Game

A unique civilization-building game where you control your empire using voice commands and face tracking. You literally become a god looking down at your civilization!

## Features

### 🎮 Gameplay
- **Voice Commands**: Control your civilization with natural speech
- **Face Tracking**: Your face position controls the 3D camera view
- **3D Building System**: Place buildings where you're looking
- **Resource Management**: Manage population, resources, and buildings
- **Real-time Stats**: Track your civilization's progress

### 🏗️ Building Types
- **House** (🏠): Provides population (+5)
- **Farm** (🌾): Generates resources (+2 every 5 seconds)
- **Tower** (🏰): Watchtower for defense
- **City** (🏛️): Major population center (+20 population, +5 resources every 5 seconds)

### 🎯 Voice Commands
- "Build house" - Place a house where you're looking
- "Build farm" - Place a farm
- "Build tower" - Place a watchtower
- "Build city" - Place a city center
- "Clear" - Remove all buildings

### 🎥 Face Tracking
- Your face position controls the 3D camera view
- Look around to aim your building placement
- Eye tracking shows where you're looking
- Real-time face detection status

### 🎨 Visual Features
- 3D terrain with grass and variation
- Realistic lighting and shadows
- Building placement with visual feedback
- Confetti celebrations for achievements
- Camera background overlay

## How to Play

1. **Start the Game**: Click "Start Civilization" to begin
2. **Allow Permissions**: Grant camera and microphone access
3. **Look Around**: Move your face to control the camera view
4. **Speak Commands**: Use voice commands to build structures
5. **Manage Resources**: Watch your population and resources grow
6. **Expand**: Build more structures to grow your civilization

## Technical Details

### Technologies Used
- **Three.js**: 3D graphics and rendering
- **MediaPipe**: Face tracking and eye detection
- **Web Speech API**: Voice command recognition
- **Canvas Confetti**: Visual effects

### Browser Requirements
- Modern browser with WebGL support
- Camera and microphone permissions
- Speech recognition support (Chrome recommended)

### Performance
- Optimized 3D rendering with instanced geometries
- Efficient face tracking with MediaPipe
- Responsive design for various screen sizes

## Development

The game is built with vanilla JavaScript and uses:
- No external dependencies beyond CDN libraries
- Modular class-based architecture
- Real-time game loops for smooth performance
- Error handling for graceful degradation

## Future Enhancements

- More building types (military, cultural, etc.)
- Terrain elevation and water features
- Multiplayer support
- Advanced AI opponents
- More complex resource systems
- Building upgrades and specializations

---

**Enjoy being a god of your own civilization!** 🏛️✨ 