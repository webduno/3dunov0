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
        this.milestones = [];
        this.achievedMilestones = [];

        // Storage keys for localStorage
        this.storageKey = 'travel-budget-saver-data';
        this.milestonesKey = 'travel-budget-saver-milestones';

        // Default milestones
        this.defaultMilestones = [
            { percentage: 10, message: "Great start! You've saved enough for travel insurance!" },
            { percentage: 25, message: "Quarter way there! This could cover your airport parking!" },
            { percentage: 50, message: "Halfway there! You can now afford plane tickets!" },
            { percentage: 75, message: "Almost there! Hotel accommodation is within reach!" },
            { percentage: 90, message: "So close! Just a bit more for those final travel expenses!" },
            { percentage: 100, message: "Congratulations! Your dream trip is fully funded!" }
        ];

        // Initialize the app
        this.init();
    }

    /**
     * Initialize the application
     */
    init() {
        this.loadFromStorage();
        this.loadMilestonesFromStorage();
        this.setupEventListeners();
        this.initializePhase();
        this.loadFromURL();
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
                this.achievedMilestones = data.achievedMilestones || [];
            }
        } catch (error) {
            console.error('Error loading from storage:', error);
        }
    }

    /**
     * Load milestones from localStorage or use defaults
     */
    loadMilestonesFromStorage() {
        try {
            const savedMilestones = localStorage.getItem(this.milestonesKey);
            if (savedMilestones) {
                this.milestones = JSON.parse(savedMilestones);
            } else {
                this.milestones = [...this.defaultMilestones];
                this.saveMilestonesToStorage();
            }
        } catch (error) {
            console.error('Error loading milestones from storage:', error);
            this.milestones = [...this.defaultMilestones];
        }
    }

    /**
     * Save milestones to localStorage
     */
    saveMilestonesToStorage() {
        try {
            localStorage.setItem(this.milestonesKey, JSON.stringify(this.milestones));
        } catch (error) {
            console.error('Error saving milestones to storage:', error);
        }
    }

    /**
     * Load journey from URL path
     */
    loadFromURL() {
        const path = window.location.pathname;
        const pathParts = path.split('/').filter(part => part.length > 0);
        
        // URL format: /from/lat,lng/to/lat,lng/budget/amount
        if (pathParts.length >= 6 && pathParts[0] === 'from' && pathParts[2] === 'to' && pathParts[4] === 'budget') {
            try {
                const sourceCoords = pathParts[1].split(',');
                const destCoords = pathParts[3].split(',');
                const budget = parseFloat(pathParts[5]);
                
                if (sourceCoords.length === 2 && destCoords.length === 2 && budget > 0) {
                    this.sourceLocation = {
                        lat: parseFloat(sourceCoords[0]),
                        lng: parseFloat(sourceCoords[1]),
                        name: `${parseFloat(sourceCoords[0]).toFixed(4)}, ${parseFloat(sourceCoords[1]).toFixed(4)}`
                    };
                    
                    this.destinationLocation = {
                        lat: parseFloat(destCoords[0]),
                        lng: parseFloat(destCoords[1]),
                        name: `${parseFloat(destCoords[0]).toFixed(4)}, ${parseFloat(destCoords[1]).toFixed(4)}`
                    };
                    
                    this.budgetGoal = budget;
                    
                    // Get location names via reverse geocoding
                    this.reverseGeocode(this.sourceLocation.lat, this.sourceLocation.lng, 'source');
                    this.reverseGeocode(this.destinationLocation.lat, this.destinationLocation.lng, 'destination');
                    
                    // Update displays if in setup phase
                    if (!this.hasCompleteSetup()) {
                        this.updateSetupDisplay();
                        document.getElementById('budget-input').value = this.budgetGoal;
                        this.validateSetup();
                    }
                }
            } catch (error) {
                console.error('Error loading from URL:', error);
            }
        }
    }

    /**
     * Update URL with current journey data
     */
    updateURL() {
        if (this.sourceLocation && this.destinationLocation && this.budgetGoal > 0) {
            const newURL = `/from/${this.sourceLocation.lat.toFixed(6)},${this.sourceLocation.lng.toFixed(6)}/to/${this.destinationLocation.lat.toFixed(6)},${this.destinationLocation.lng.toFixed(6)}/budget/${this.budgetGoal}`;
            window.history.replaceState({}, '', newURL);
        }
    }

    /**
     * Get current journey URL for sharing
     */
    getShareableURL() {
        if (this.sourceLocation && this.destinationLocation && this.budgetGoal > 0) {
            const baseURL = window.location.origin;
            return `${baseURL}/from/${this.sourceLocation.lat.toFixed(6)},${this.sourceLocation.lng.toFixed(6)}/to/${this.destinationLocation.lat.toFixed(6)},${this.destinationLocation.lng.toFixed(6)}/budget/${this.budgetGoal}`;
        }
        return window.location.href;
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
                startDate: this.startDate,
                achievedMilestones: this.achievedMilestones
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
        document.getElementById('copy-url-btn').addEventListener('click', () => this.copyJourneyURL());

        // Milestones management listeners
        document.getElementById('edit-milestones-btn').addEventListener('click', () => this.showMilestonesModal());
        document.getElementById('close-milestones-modal').addEventListener('click', () => this.hideMilestonesModal());
        document.getElementById('add-milestone-btn').addEventListener('click', () => this.addMilestoneEditor());
        document.getElementById('reset-milestones-btn').addEventListener('click', () => this.resetMilestones());
        document.getElementById('save-milestones-btn').addEventListener('click', () => this.saveMilestonesFromEditor());
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

        // Update milestones display
        this.updateMilestonesDisplay();

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
        
        this.updateURL();
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
        const previousSavings = this.currentSavings;
        this.currentSavings += amount;
        this.totalAdded += amount;

        // Animate the addition
        this.animateAmountAdd(amount);

        // Check for milestone achievements
        this.checkMilestones(previousSavings, this.currentSavings);

        this.updateMainDisplay();
        this.saveToStorage();

        // Check if goal is reached
        if (this.currentSavings >= this.budgetGoal) {
            this.celebrateGoalReached();
        }
    }

    /**
     * Check for milestone achievements
     */
    checkMilestones(previousSavings, currentSavings) {
        const previousProgress = this.budgetGoal > 0 ? (previousSavings / this.budgetGoal) * 100 : 0;
        const currentProgress = this.budgetGoal > 0 ? (currentSavings / this.budgetGoal) * 100 : 0;

        this.milestones.forEach(milestone => {
            const milestoneId = `${milestone.percentage}`;
            
            // Check if this milestone was just achieved
            if (previousProgress < milestone.percentage && 
                currentProgress >= milestone.percentage && 
                !this.achievedMilestones.includes(milestoneId)) {
                
                this.achievedMilestones.push(milestoneId);
                this.celebrateMilestone(milestone);
            }
        });
    }

    /**
     * Celebrate milestone achievement
     */
    celebrateMilestone(milestone) {
        // Show confetti
        this.jsConfetti.addConfetti({
            emojis: ['🎉', '⭐', '🎊', '🥳'],
            emojiSize: 80,
            confettiNumber: 30
        });

        // Show milestone notification
        this.showMilestoneNotification(milestone);
    }

    /**
     * Show milestone notification
     */
    showMilestoneNotification(milestone) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'milestone-notification';
        notification.innerHTML = `
            <div class="milestone-content">
                <div class="milestone-icon">🎯</div>
                <div class="milestone-text">
                    <div class="milestone-title">${milestone.percentage}% Milestone Reached!</div>
                    <div class="milestone-message">${milestone.message}</div>
                </div>
                <button class="milestone-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        // Add styles if not already present
        if (!document.getElementById('milestone-notification-styles')) {
            const style = document.createElement('style');
            style.id = 'milestone-notification-styles';
            style.textContent = `
                .milestone-notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border-radius: 15px;
                    padding: 20px;
                    max-width: 350px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                    z-index: 1000;
                    animation: slideInRight 0.5s ease-out;
                }
                
                .milestone-content {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }
                
                .milestone-icon {
                    font-size: 2rem;
                }
                
                .milestone-text {
                    flex: 1;
                }
                
                .milestone-title {
                    font-weight: bold;
                    font-size: 1.1rem;
                    margin-bottom: 5px;
                }
                
                .milestone-message {
                    font-size: 0.9rem;
                    opacity: 0.9;
                    line-height: 1.4;
                }
                
                .milestone-close {
                    background: rgba(255, 255, 255, 0.2);
                    border: none;
                    color: white;
                    border-radius: 50%;
                    width: 30px;
                    height: 30px;
                    cursor: pointer;
                    font-size: 1.2rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .milestone-close:hover {
                    background: rgba(255, 255, 255, 0.3);
                }
                
                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideInRight 0.5s ease-out reverse';
                setTimeout(() => notification.remove(), 500);
            }
        }, 5000);
    }

    /**
     * Update milestones display
     */
    updateMilestonesDisplay() {
        const milestonesList = document.getElementById('milestones-list');
        const milestonesAchieved = document.getElementById('milestones-achieved');
        
        if (!milestonesList) return;

        const currentProgress = this.budgetGoal > 0 ? (this.currentSavings / this.budgetGoal) * 100 : 0;
        
        // Sort milestones by percentage
        const sortedMilestones = [...this.milestones].sort((a, b) => a.percentage - b.percentage);
        
        milestonesList.innerHTML = '';
        
        sortedMilestones.forEach(milestone => {
            const isAchieved = this.achievedMilestones.includes(`${milestone.percentage}`);
            const milestoneItem = document.createElement('div');
            milestoneItem.className = `milestone-item ${isAchieved ? 'achieved' : ''}`;
            
            milestoneItem.innerHTML = `
                <span class="milestone-progress">${milestone.percentage}%</span>
                <span class="milestone-message">${milestone.message}</span>
                <span class="milestone-status">${isAchieved ? '✅' : '⏳'}</span>
            `;
            
            milestonesList.appendChild(milestoneItem);
        });

        // Update achieved count
        if (milestonesAchieved) {
            milestonesAchieved.textContent = `${this.achievedMilestones.length}/${this.milestones.length}`;
        }
    }

    /**
     * Copy journey URL to clipboard
     */
    async copyJourneyURL() {
        try {
            const shareableURL = this.getShareableURL();
            await navigator.clipboard.writeText(shareableURL);
            
            // Show feedback
            const button = document.getElementById('copy-url-btn');
            const originalText = button.innerHTML;
            button.innerHTML = '<i class="fas fa-check"></i> Copied!';
            button.style.background = '#48bb78';
            
            setTimeout(() => {
                button.innerHTML = originalText;
                button.style.background = '';
            }, 2000);
        } catch (error) {
            console.error('Failed to copy URL:', error);
            alert('Could not copy URL. Please copy manually from the address bar.');
        }
    }

    /**
     * Show milestones modal
     */
    showMilestonesModal() {
        const modal = document.getElementById('milestones-modal');
        this.populateMilestonesEditor();
        modal.classList.remove('hidden');
    }

    /**
     * Hide milestones modal
     */
    hideMilestonesModal() {
        const modal = document.getElementById('milestones-modal');
        modal.classList.add('hidden');
    }

    /**
     * Populate milestones editor
     */
    populateMilestonesEditor() {
        const editorList = document.getElementById('milestones-editor-list');
        editorList.innerHTML = '';

        this.milestones.forEach((milestone, index) => {
            this.addMilestoneEditorItem(milestone, index);
        });
    }

    /**
     * Add milestone editor item
     */
    addMilestoneEditorItem(milestone, index) {
        const editorList = document.getElementById('milestones-editor-list');
        const editorItem = document.createElement('div');
        editorItem.className = 'milestone-editor-item';
        editorItem.dataset.index = index;

        editorItem.innerHTML = `
            <input type="number" value="${milestone.percentage}" min="1" max="100" step="1" class="milestone-percentage">
            <span>%</span>
            <input type="text" value="${milestone.message}" placeholder="Achievement message" class="milestone-message">
            <button class="btn btn-danger btn-small remove-milestone">
                <i class="fas fa-trash"></i>
            </button>
        `;

        // Add remove listener
        editorItem.querySelector('.remove-milestone').addEventListener('click', () => {
            editorItem.remove();
        });

        editorList.appendChild(editorItem);
    }

    /**
     * Add new milestone editor
     */
    addMilestoneEditor() {
        const newMilestone = { percentage: 50, message: 'You\'re halfway there!' };
        const index = this.milestones.length;
        this.addMilestoneEditorItem(newMilestone, index);
    }

    /**
     * Reset milestones to defaults
     */
    resetMilestones() {
        if (confirm('Reset all achievement goals to defaults? This will remove any custom goals you\'ve created.')) {
            this.milestones = [...this.defaultMilestones];
            this.achievedMilestones = [];
            this.saveMilestonesToStorage();
            this.saveToStorage();
            this.populateMilestonesEditor();
            this.updateMilestonesDisplay();
        }
    }

    /**
     * Save milestones from editor
     */
    saveMilestonesFromEditor() {
        const editorItems = document.querySelectorAll('.milestone-editor-item');
        const newMilestones = [];

        editorItems.forEach(item => {
            const percentage = parseInt(item.querySelector('.milestone-percentage').value);
            const message = item.querySelector('.milestone-message').value.trim();

            if (percentage >= 1 && percentage <= 100 && message) {
                newMilestones.push({ percentage, message });
            }
        });

        if (newMilestones.length === 0) {
            alert('Please add at least one valid achievement goal.');
            return;
        }

        // Remove duplicates by percentage
        const uniqueMilestones = newMilestones.filter((milestone, index, self) => 
            index === self.findIndex(m => m.percentage === milestone.percentage)
        );

        this.milestones = uniqueMilestones;
        
        // Reset achieved milestones that no longer exist
        this.achievedMilestones = this.achievedMilestones.filter(achievedId => 
            this.milestones.some(m => `${m.percentage}` === achievedId)
        );

        this.saveMilestonesToStorage();
        this.saveToStorage();
        this.updateMilestonesDisplay();
        this.hideMilestonesModal();

        // Show success feedback
        const saveBtn = document.getElementById('save-milestones-btn');
        const originalText = saveBtn.innerHTML;
        saveBtn.innerHTML = '<i class="fas fa-check"></i> Saved!';
        saveBtn.style.background = '#48bb78';
        
        setTimeout(() => {
            saveBtn.innerHTML = originalText;
            saveBtn.style.background = '';
        }, 2000);
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
        const urlPreview = document.getElementById('url-preview');

        sourceSpan.textContent = this.sourceLocation.name;
        destSpan.textContent = this.destinationLocation.name;
        
        // Show the shareable URL
        if (urlPreview) {
            urlPreview.textContent = this.getShareableURL();
        }

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
        this.achievedMilestones = [];

        // Clear storage
        localStorage.removeItem(this.storageKey);

        // Clear URL back to root
        window.history.replaceState({}, '', '/');

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
