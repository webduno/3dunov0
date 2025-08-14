# Travel Budget Saver

## Overview

Travel Budget Saver is a gamified budget tracking web application that helps users save money for their dream vacations. The app combines interactive map visualization with progress tracking to make saving money engaging and motivating. Users can set budget goals, select travel routes on an interactive map, and track their savings progress with visual feedback and celebratory animations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

**Frontend Architecture**
- Pure vanilla JavaScript implementation using class-based architecture
- Single-page application (SPA) with phase-based UI management
- Component-based design with the main `TravelBudgetSaver` class handling all functionality
- Event-driven architecture for user interactions and state management

**UI/UX Design Patterns**
- Phase-based navigation system (setup phase → saving phase)
- Responsive design with CSS Grid and Flexbox layouts
- Gradient-based visual theme with smooth transitions
- Interactive map integration for location selection and route visualization

**Data Management**
- Browser localStorage for persistent data storage
- JSON-based data serialization for saving user progress
- In-memory state management through class properties
- Automatic data persistence on state changes

**Mapping and Visualization**
- Leaflet.js for interactive map functionality
- Dual map system: setup map for route planning, main map for progress tracking
- Custom markers for source/destination locations
- Animated route visualization with progress indicators

**Gamification Features**
- Visual progress tracking with percentage-based indicators
- Celebration animations using js-confetti library
- Achievement-style feedback for reaching milestones
- Interactive progress visualization tied to map route

## External Dependencies

**Mapping Services**
- Leaflet.js (v1.9.4) - Core mapping functionality and interactive controls
- OpenStreetMap tiles - Base map data and geographic visualization

**UI Libraries**
- Font Awesome (v6.0.0) - Icon library for enhanced visual elements
- js-confetti - Celebration animations and visual feedback effects

**CDN Resources**
- All external dependencies loaded via CDN for simplicity
- No build process or package management required
- Direct browser compatibility without compilation steps

**Browser APIs**
- localStorage API - Persistent data storage across sessions
- Geolocation API (potential future integration for automatic location detection)
- DOM APIs for dynamic content manipulation and event handling