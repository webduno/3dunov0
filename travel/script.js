/**
 * Travel Budget Saver - Gamified Budget Tracking App
 * Built with vanilla JavaScript, Leaflet.js, and js-confetti
 */

class TravelBudgetSaver {
    constructor() {
        // Initialize class properties
        this.sourceLocation = null;
        this.destinationLocation = null;
        this.budgetGoal = 0;
        this.currentSavings = 0;
        this.totalAdded = 0;
        this.startDate = null;
        this.setupMap = null;
        this.mainMap = null;
        this.jsConfetti = new JSConfetti();
        this.isSelectingSource = true;
        this.sourceMarker = null;
        this.destinationMarker = null;
        this.routeLine = null;
        this.planeMarker = null;

        // Storage key for localStorage
        this.storageKey = 'travel-budget-saver-data';

        // Initialize the app
        this.init();
    }

    /**
     * Initialize the application
     */
    init() {
        this.loadFromStorage();
        this.setupEventListeners();
        this.initializePhase();
    }

    /**
     * Load data from localStorage
     */
    loadFromStorage() {
        try {
            const savedData = localStorage.getItem(this.storageKey);
            if (savedData) {
                const data = JSON.parse(savedData);
                this.sourceLocation = data.sourceLocation;
                this.destinationLocation = data.destinationLocation;
                this.budgetGoal = data.budgetGoal || 0;
                this.currentSavings = data.currentSavings || 0;
                this.totalAdded = data.totalAdded || 0;
                this.startDate = data.startDate ? new Date(data.startDate) : null;
            }
        } catch (error) {
            console.error('Error loading from storage:', error);
        }
    }

    /**
     * Save data to localStorage
     */
    saveToStorage() {
        try {
            const data = {
                sourceLocation: this.sourceLocation,
                destinationLocation: this.destinationLocation,
                budgetGoal: this.budgetGoal,
                currentSavings: this.currentSavings,
                totalAdded: this.totalAdded,
                startDate: this.startDate
            };
            localStorage.setItem(this.storageKey, JSON.stringify(data));
        } catch (error) {
            console.error('Error saving to storage:', error);
        }
    }

    /**
     * Initialize the appropriate phase based on saved data
     */
    initializePhase() {
        if (this.hasCompleteSetup()) {
            this.showMainPhase();
        } else {
            this.showSetupPhase();
        }
    }

    /**
     * Check if setup is complete
     */
    hasCompleteSetup() {
        return this.sourceLocation && 
               this.destinationLocation && 
               this.budgetGoal > 0;
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Setup phase listeners
        document.getElementById('budget-input').addEventListener('input', () => this.validateSetup());
        document.getElementById('start-saving-btn').addEventListener('click', () => this.startSavingJourney());

        // Main phase listeners
        document.getElementById('add-savings-btn').addEventListener('click', () => this.addSavings());
        document.getElementById('savings-amount').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addSavings();
        });
        document.getElementById('reset-journey').addEventListener('click', () => this.resetJourney());

        // Quick amount buttons
        document.querySelectorAll('.btn-quick').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const amount = parseFloat(e.target.dataset.amount);
                this.addSavingsAmount(amount);
            });
        });

        // Success modal listeners
        document.getElementById('start-new-journey').addEventListener('click', () => this.resetJourney());
    }

    /**
     * Show setup phase
     */
    showSetupPhase() {
        document.getElementById('setup-phase').classList.remove('hidden');
        document.getElementById('main-phase').classList.add('hidden');
        
        // Initialize setup map
        this.initSetupMap();
        
        // Pre-fill data if available
        if (this.budgetGoal > 0) {
            document.getElementById('budget-input').value = this.budgetGoal;
        }
        
        this.updateSetupDisplay();
        this.validateSetup();
    }

    /**
     * Show main phase
     */
    showMainPhase() {
        document.getElementById('setup-phase').classList.add('hidden');
        document.getElementById('main-phase').classList.remove('hidden');
        
        // Initialize main map
        this.initMainMap();
        
        // Update all displays
        this.updateMainDisplay();
    }

    /**
     * Initialize setup map
     */
    initSetupMap() {
        if (this.setupMap) {
            this.setupMap.remove();
        }

        this.setupMap = L.map('setup-map').setView([40.7128, -74.0060], 3);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18
        }).addTo(this.setupMap);

        // Add click listener for location selection
        this.setupMap.on('click', (e) => this.handleMapClick(e, 'setup'));

        // Add existing markers if available
        if (this.sourceLocation) {
            this.addSetupMarker(this.sourceLocation, 'source');
        }
        if (this.destinationLocation) {
            this.addSetupMarker(this.destinationLocation, 'destination');
        }
    }

    /**
     * Initialize main map
     */
    initMainMap() {
        if (this.mainMap) {
            this.mainMap.remove();
        }

        // Calculate center point between source and destination
        const centerLat = (this.sourceLocation.lat + this.destinationLocation.lat) / 2;
        const centerLng = (this.sourceLocation.lng + this.destinationLocation.lng) / 2;

        this.mainMap = L.map('main-map').setView([centerLat, centerLng], 4);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18
        }).addTo(this.mainMap);

        // Add markers and route
        this.addMainMarkers();
        this.drawRoute();
        this.updatePlanePosition();

        // Fit map to show both locations
        const group = new L.featureGroup([this.sourceMarker, this.destinationMarker]);
        this.mainMap.fitBounds(group.getBounds().pad(0.1));
    }

    /**
     * Handle map clicks for location selection
     */
    handleMapClick(e, mapType) {
        if (mapType !== 'setup') return;

        const { lat, lng } = e.latlng;

        if (this.isSelectingSource) {
            // Set source location
            this.sourceLocation = { lat, lng, name: `${lat.toFixed(4)}, ${lng.toFixed(4)}` };
            this.addSetupMarker(this.sourceLocation, 'source');
            this.isSelectingSource = false;
            
            // Reverse geocoding to get location name
            this.reverseGeocode(lat, lng, 'source');
        } else {
            // Set destination location
            this.destinationLocation = { lat, lng, name: `${lat.toFixed(4)}, ${lng.toFixed(4)}` };
            this.addSetupMarker(this.destinationLocation, 'destination');
            this.isSelectingSource = true; // Reset for next time
            
            // Reverse geocoding to get location name
            this.reverseGeocode(lat, lng, 'destination');
        }

        this.updateSetupDisplay();
        this.validateSetup();
    }

    /**
     * Reverse geocode coordinates to get location name
     */
    async reverseGeocode(lat, lng, type) {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
            const data = await response.json();
            
            if (data && data.display_name) {
                const locationName = this.formatLocationName(data.display_name);
                
                if (type === 'source') {
                    this.sourceLocation.name = locationName;
                } else {
                    this.destinationLocation.name = locationName;
                }
                
                this.updateSetupDisplay();
            }
        } catch (error) {
            console.error('Error with reverse geocoding:', error);
        }
    }

    /**
     * Format location name for display
     */
    formatLocationName(fullName) {
        const parts = fullName.split(',');
        if (parts.length >= 2) {
            return `${parts[0].trim()}, ${parts[parts.length - 1].trim()}`;
        }
        return fullName.length > 50 ? fullName.substring(0, 50) + '...' : fullName;
    }

    /**
     * Add marker to setup map
     */
    addSetupMarker(location, type) {
        const icon = L.divIcon({
            className: `custom-marker ${type}-marker`,
            html: type === 'source' ? '📍' : '🎯',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });

        const marker = L.marker([location.lat, location.lng], { icon }).addTo(this.setupMap);
        
        const popupText = type === 'source' ? 'Starting Point' : 'Destination';
        marker.bindPopup(`<b>${popupText}</b><br>${location.name}`);
    }

    /**
     * Add markers to main map
     */
    addMainMarkers() {
        // Source marker
        const sourceIcon = L.divIcon({
            className: 'custom-marker source-marker',
            html: '📍',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });

        this.sourceMarker = L.marker([this.sourceLocation.lat, this.sourceLocation.lng], { icon: sourceIcon })
            .addTo(this.mainMap)
            .bindPopup(`<b>Starting Point</b><br>${this.sourceLocation.name}`);

        // Destination marker
        const destIcon = L.divIcon({
            className: 'custom-marker destination-marker',
            html: '🎯',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });

        this.destinationMarker = L.marker([this.destinationLocation.lat, this.destinationLocation.lng], { icon: destIcon })
            .addTo(this.mainMap)
            .bindPopup(`<b>Destination</b><br>${this.destinationLocation.name}`);
    }

    /**
     * Draw route line between source and destination
     */
    drawRoute() {
        if (this.routeLine) {
            this.mainMap.removeLayer(this.routeLine);
        }

        const coordinates = [
            [this.sourceLocation.lat, this.sourceLocation.lng],
            [this.destinationLocation.lat, this.destinationLocation.lng]
        ];

        this.routeLine = L.polyline(coordinates, {
            color: '#667eea',
            weight: 3,
            opacity: 0.8,
            dashArray: '10, 10'
        }).addTo(this.mainMap);
    }

    /**
     * Update plane position on the route
     */
    updatePlanePosition() {
        const progress = this.budgetGoal > 0 ? Math.min(this.currentSavings / this.budgetGoal, 1) : 0;

        // Calculate position along the route
        const lat = this.sourceLocation.lat + (this.destinationLocation.lat - this.sourceLocation.lat) * progress;
        const lng = this.sourceLocation.lng + (this.destinationLocation.lng - this.sourceLocation.lng) * progress;

        // Remove existing plane marker
        if (this.planeMarker) {
            this.mainMap.removeLayer(this.planeMarker);
        }

        // Add new plane marker
        const planeIcon = L.divIcon({
            className: 'plane-marker',
            html: '✈️',
            iconSize: [25, 25],
            iconAnchor: [12.5, 12.5]
        });

        this.planeMarker = L.marker([lat, lng], { icon: planeIcon })
            .addTo(this.mainMap)
            .bindPopup(`Progress: ${(progress * 100).toFixed(1)}%`);

        // Update meter plane position
        const meterPlane = document.getElementById('meter-plane');
        if (meterPlane) {
            meterPlane.style.left = `${Math.max(0, progress * 100 - 2)}%`;
        }
    }

    /**
     * Update setup phase display
     */
    updateSetupDisplay() {
        const sourceDisplay = document.getElementById('source-display');
        const destDisplay = document.getElementById('destination-display');

        if (this.sourceLocation) {
            sourceDisplay.textContent = this.sourceLocation.name;
            sourceDisplay.style.color = '#48bb78';
            sourceDisplay.style.fontWeight = '600';
        } else {
            sourceDisplay.textContent = 'Click on map to select';
            sourceDisplay.style.color = '#a0aec0';
            sourceDisplay.style.fontWeight = 'normal';
        }

        if (this.destinationLocation) {
            destDisplay.textContent = this.destinationLocation.name;
            destDisplay.style.color = '#f56565';
            destDisplay.style.fontWeight = '600';
        } else {
            destDisplay.textContent = 'Click on map to select';
            destDisplay.style.color = '#a0aec0';
            destDisplay.style.fontWeight = 'normal';
        }
    }

    /**
     * Update main phase display
     */
    updateMainDisplay() {
        // Update journey display
        const journeyDisplay = document.getElementById('journey-display');
        if (journeyDisplay && this.sourceLocation && this.destinationLocation) {
            journeyDisplay.textContent = `${this.sourceLocation.name} → ${this.destinationLocation.name}`;
        }

        // Update budget displays
        document.getElementById('current-savings').textContent = this.currentSavings.toFixed(2);
        document.getElementById('goal-amount').textContent = this.budgetGoal.toFixed(2);
        document.getElementById('total-added').textContent = this.totalAdded.toFixed(2);

        // Update progress
        const progress = this.budgetGoal > 0 ? (this.currentSavings / this.budgetGoal) * 100 : 0;
        document.getElementById('progress-percent').textContent = `${Math.min(progress, 100).toFixed(1)}%`;

        // Update meter fill
        const meterFill = document.getElementById('meter-fill');
        if (meterFill) {
            meterFill.style.width = `${Math.min(progress, 100)}%`;
        }

        // Update days saving
        const daysSaving = this.calculateDaysSaving();
        document.getElementById('days-saving').textContent = daysSaving;

        // Update plane position
        this.updatePlanePosition();
    }

    /**
     * Calculate days since starting to save
     */
    calculateDaysSaving() {
        if (!this.startDate) return 0;
        const now = new Date();
        const diffTime = Math.abs(now - this.startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }

    /**
     * Validate setup form
     */
    validateSetup() {
        const budgetInput = document.getElementById('budget-input');
        const startBtn = document.getElementById('start-saving-btn');
        
        const budgetValid = budgetInput.value && parseFloat(budgetInput.value) > 0;
        const locationsValid = this.sourceLocation && this.destinationLocation;

        if (budgetValid && locationsValid) {
            startBtn.disabled = false;
            this.budgetGoal = parseFloat(budgetInput.value);
        } else {
            startBtn.disabled = true;
        }
    }

    /**
     * Start the saving journey
     */
    startSavingJourney() {
        if (!this.startDate) {
            this.startDate = new Date();
        }
        
        this.saveToStorage();
        this.showMainPhase();
    }

    /**
     * Add savings amount
     */
    addSavings() {
        const savingsInput = document.getElementById('savings-amount');
        const amount = parseFloat(savingsInput.value);

        if (!amount || amount <= 0) {
            this.showErrorMessage('Please enter a valid amount');
            return;
        }

        this.addSavingsAmount(amount);
        savingsInput.value = '';
    }

    /**
     * Add specific amount to savings
     */
    addSavingsAmount(amount) {
        this.currentSavings += amount;
        this.totalAdded += amount;

        // Animate the addition
        this.animateAmountAdd(amount);

        this.updateMainDisplay();
        this.saveToStorage();

        // Check if goal is reached
        if (this.currentSavings >= this.budgetGoal) {
            this.celebrateGoalReached();
        }
    }

    /**
     * Animate amount addition
     */
    animateAmountAdd(amount) {
        const currentSavingsElement = document.getElementById('current-savings');
        
        // Create floating animation
        const floatingAmount = document.createElement('div');
        floatingAmount.textContent = `+$${amount.toFixed(2)}`;
        floatingAmount.style.cssText = `
            position: absolute;
            color: #48bb78;
            font-weight: bold;
            font-size: 1.2rem;
            pointer-events: none;
            z-index: 100;
            animation: floatUp 2s ease-out forwards;
        `;

        // Add floating animation styles
        if (!document.getElementById('float-animation-styles')) {
            const style = document.createElement('style');
            style.id = 'float-animation-styles';
            style.textContent = `
                @keyframes floatUp {
                    0% {
                        opacity: 1;
                        transform: translateY(0px);
                    }
                    100% {
                        opacity: 0;
                        transform: translateY(-50px);
                    }
                }
            `;
            document.head.appendChild(style);
        }

        currentSavingsElement.parentElement.style.position = 'relative';
        currentSavingsElement.parentElement.appendChild(floatingAmount);

        setTimeout(() => {
            floatingAmount.remove();
        }, 2000);
    }

    /**
     * Show error message
     */
    showErrorMessage(message) {
        // Simple error display - you could enhance this with a toast notification
        alert(message);
    }

    /**
     * Celebrate goal reached
     */
    celebrateGoalReached() {
        // Trigger confetti
        this.jsConfetti.addConfetti({
            emojis: ['🎉', '✈️', '🎊', '🥳', '🎈'],
            emojiSize: 100,
            confettiNumber: 50
        });

        // Show success modal
        setTimeout(() => {
            this.showSuccessModal();
        }, 1000);
    }

    /**
     * Show success modal
     */
    showSuccessModal() {
        const modal = document.getElementById('success-modal');
        const sourceSpan = document.getElementById('success-source');
        const destSpan = document.getElementById('success-destination');

        sourceSpan.textContent = this.sourceLocation.name;
        destSpan.textContent = this.destinationLocation.name;

        modal.classList.remove('hidden');
    }

    /**
     * Reset journey and start over
     */
    resetJourney() {
        // Clear all data
        this.sourceLocation = null;
        this.destinationLocation = null;
        this.budgetGoal = 0;
        this.currentSavings = 0;
        this.totalAdded = 0;
        this.startDate = null;
        this.isSelectingSource = true;

        // Clear storage
        localStorage.removeItem(this.storageKey);

        // Hide success modal
        document.getElementById('success-modal').classList.add('hidden');

        // Reset form
        document.getElementById('budget-input').value = '';

        // Show setup phase
        this.showSetupPhase();
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TravelBudgetSaver();
});

// Service Worker registration for better performance (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
