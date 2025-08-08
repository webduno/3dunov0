class CivilizationGame {
    constructor() {
        // Game elements
        this.gameButton = document.getElementById('gameButton');
        this.populationDisplay = document.getElementById('populationDisplay');
        this.resourcesDisplay = document.getElementById('resourcesDisplay');
        this.buildingsDisplay = document.getElementById('buildingsDisplay');
        this.statusDisplay = document.getElementById('statusDisplay');
        this.errorPanel = document.getElementById('errorPanel');
        this.errorMessage = document.getElementById('errorMessage');
        this.voiceIndicator = document.getElementById('voiceIndicator');

        // Video and canvas elements
        this.videoStream = document.getElementById('videoStream');
        this.faceCanvas = document.getElementById('faceCanvas');
        this.gameCanvas = document.getElementById('gameCanvas');
        this.crosshair = document.getElementById('crosshair');
        this.leftEyeTracker = document.getElementById('leftEyeTracker');
        this.rightEyeTracker = document.getElementById('rightEyeTracker');

        // Game state
        this.isPlaying = false;
        this.population = 0;
        this.resources = 100;
        this.buildings = [];
        this.faceDetected = false;
        this.eyePosition = { x: 0.5, y: 0.5 };
        this.error = null;

        // MediaPipe and camera
        this.faceMesh = null;
        this.stream = null;

        // Speech recognition
        this.speechRecognition = null;
        this.isListening = false;

        // Three.js scene
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.raycaster = null;
        this.mouse = null;
        this.terrain = null;
        this.buildingsGroup = null;

        // Game timers
        this.gameLoopId = null;
        this.resourceTimerId = null;

        // Confetti
        this.confetti = null;

        this.initializeEventListeners();
    }

    initializeEventListeners() {
        this.gameButton.addEventListener('click', () => {
            if (this.isPlaying) {
                this.stopGame();
            } else {
                this.startGame();
            }
        });
    }

    async initializeFaceMesh() {
        try {
            this.faceMesh = new FaceMesh({
                locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
                }
            });

            this.faceMesh.setOptions({
                maxNumFaces: 1,
                refineLandmarks: true,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5
            });

            this.faceMesh.onResults((results) => this.onFaceMeshResults(results));
        } catch (error) {
            this.showError('Face tracking initialization failed: ' + error.message);
            throw error;
        }
    }

    async initializeCamera() {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480 }
            });
            this.videoStream.srcObject = this.stream;

            // Wait for video to be ready
            await new Promise((resolve) => {
                this.videoStream.addEventListener('loadedmetadata', resolve, { once: true });
            });

            // Start face mesh processing
            this.faceMesh.send({ image: this.videoStream });
        } catch (error) {
            this.showError('Camera access failed: ' + error.message);
            throw error;
        }
    }

    initializeSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.speechRecognition = new SpeechRecognition();
            this.speechRecognition.continuous = true;
            this.speechRecognition.interimResults = false;
            this.speechRecognition.lang = 'en-US';

            this.speechRecognition.onstart = () => {
                this.isListening = true;
                this.voiceIndicator.textContent = 'Voice: Listening...';
                this.voiceIndicator.classList.add('active');
            };

            this.speechRecognition.onend = () => {
                this.isListening = false;
                this.voiceIndicator.textContent = 'Voice: Stopped';
                this.voiceIndicator.classList.remove('active');
                
                // Restart if game is still playing
                if (this.isPlaying) {
                    this.speechRecognition.start();
                }
            };

            this.speechRecognition.onresult = (event) => {
                const command = event.results[event.results.length - 1][0].transcript.toLowerCase();
                this.processVoiceCommand(command);
            };

            this.speechRecognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
            };
        } else {
            this.showError('Speech recognition not supported in this browser');
        }
    }

    startListening() {
        if (this.speechRecognition && this.isPlaying) {
            try {
                this.speechRecognition.start();
            } catch (error) {
                console.error('Failed to start speech recognition:', error);
            }
        }
    }

    stopListening() {
        if (this.speechRecognition) {
            try {
                this.speechRecognition.stop();
            } catch (error) {
                console.error('Failed to stop speech recognition:', error);
            }
        }
    }

    processVoiceCommand(command) {
        console.log('Voice command:', command);
        
        if (command.includes('build house')) {
            this.buildStructure('house');
        } else if (command.includes('build farm')) {
            this.buildStructure('farm');
        } else if (command.includes('build tower')) {
            this.buildStructure('tower');
        } else if (command.includes('build city')) {
            this.buildStructure('city');
        } else if (command.includes('clear')) {
            this.clearBuildings();
        }
    }

    onFaceMeshResults(results) {
        if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
            const landmarks = results.multiFaceLandmarks[0];
            
            // Get eye positions
            const leftEye = landmarks[159]; // Left eye center
            const rightEye = landmarks[386]; // Right eye center
            
            if (leftEye && rightEye) {
                const leftEyeX = leftEye.x;
                const leftEyeY = leftEye.y;
                const rightEyeX = rightEye.x;
                const rightEyeY = rightEye.y;
                
                // Calculate center eye position
                this.eyePosition.x = (leftEyeX + rightEyeX) / 2;
                this.eyePosition.y = (leftEyeY + rightEyeY) / 2;
                
                // Update eye trackers
                this.leftEyeTracker.style.left = (leftEyeX * 100) + '%';
                this.leftEyeTracker.style.top = (leftEyeY * 100) + '%';
                this.leftEyeTracker.classList.add('visible');
                
                this.rightEyeTracker.style.left = (rightEyeX * 100) + '%';
                this.rightEyeTracker.style.top = (rightEyeY * 100) + '%';
                this.rightEyeTracker.classList.add('visible');
                
                // Update crosshair
                this.crosshair.style.left = (this.eyePosition.x * 100) + '%';
                this.crosshair.style.top = (this.eyePosition.y * 100) + '%';
                this.crosshair.classList.add('visible');
                
                this.setFaceDetected(true);
                
                // Update camera based on face position
                this.updateCameraFromFace();
            }
        } else {
            this.setFaceDetected(false);
            this.leftEyeTracker.classList.remove('visible');
            this.rightEyeTracker.classList.remove('visible');
            this.crosshair.classList.remove('visible');
        }
    }

    updateCameraFromFace() {
        if (!this.camera) return;
        
        // Map face position to camera rotation
        const panRange = Math.PI / 3; // 60 degrees
        const tiltRange = Math.PI / 6; // 30 degrees
        
        const pan = (this.eyePosition.x - 0.5) * panRange;
        const tilt = (this.eyePosition.y - 0.5) * tiltRange;
        
        this.camera.position.x = Math.sin(pan) * 20;
        this.camera.position.z = Math.cos(pan) * 20;
        this.camera.position.y = 15 + Math.sin(tilt) * 5;
        
        this.camera.lookAt(0, 0, 0);
    }

    initializeThreeJS() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB);

        // Camera
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 15, 20);
        this.camera.lookAt(0, 0, 0);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: this.gameCanvas, 
            alpha: true,
            antialias: true 
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 10);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);

        // Raycaster for building placement
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        // Create terrain
        this.createTerrain();

        // Buildings group
        this.buildingsGroup = new THREE.Group();
        this.scene.add(this.buildingsGroup);

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }

    createTerrain() {
        // Create a simple terrain with grass
        const terrainGeometry = new THREE.PlaneGeometry(50, 50, 10, 10);
        const terrainMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x90EE90,
            side: THREE.DoubleSide 
        });
        
        this.terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
        this.terrain.rotation.x = -Math.PI / 2;
        this.terrain.receiveShadow = true;
        this.scene.add(this.terrain);

        // Add some terrain variation
        const vertices = terrainGeometry.attributes.position.array;
        for (let i = 0; i < vertices.length; i += 3) {
            vertices[i + 2] = Math.random() * 2 - 1; // Random height
        }
        terrainGeometry.attributes.position.needsUpdate = true;
        terrainGeometry.computeVertexNormals();
    }

    buildStructure(type) {
        if (this.resources < 10) {
            this.showError('Not enough resources!');
            return;
        }

        // Get building position from eye gaze
        const buildingPosition = this.getBuildingPositionFromGaze();
        
        if (!buildingPosition) {
            this.showError('Cannot place building here!');
            return;
        }

        // Create building geometry based on type
        let geometry, material, scale = 1;
        
        switch (type) {
            case 'house':
                geometry = new THREE.BoxGeometry(2, 2, 2);
                material = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
                scale = 1;
                break;
            case 'farm':
                geometry = new THREE.BoxGeometry(4, 0.5, 4);
                material = new THREE.MeshLambertMaterial({ color: 0x228B22 });
                scale = 1;
                break;
            case 'tower':
                geometry = new THREE.BoxGeometry(1, 4, 1);
                material = new THREE.MeshLambertMaterial({ color: 0x696969 });
                scale = 1;
                break;
            case 'city':
                geometry = new THREE.BoxGeometry(3, 3, 3);
                material = new THREE.MeshLambertMaterial({ color: 0xFFD700 });
                scale = 1.5;
                break;
            default:
                return;
        }

        const building = new THREE.Mesh(geometry, material);
        building.position.copy(buildingPosition);
        building.scale.setScalar(scale);
        building.castShadow = true;
        building.receiveShadow = true;
        building.userData = { type: type };

        this.buildingsGroup.add(building);
        this.buildings.push(building);

        // Update resources and stats
        this.resources -= 10;
        this.population += type === 'house' ? 5 : type === 'city' ? 20 : 0;
        this.updateStats();

        // Trigger confetti
        this.triggerBuildingConfetti();

        console.log(`Built ${type} at position:`, buildingPosition);
    }

    getBuildingPositionFromGaze() {
        // Convert eye position to 3D world position
        const x = (this.eyePosition.x - 0.5) * 40; // Map to -20 to 20
        const z = (this.eyePosition.y - 0.5) * 40; // Map to -20 to 20
        
        // Check if position is within terrain bounds
        if (Math.abs(x) > 20 || Math.abs(z) > 20) {
            return null;
        }

        // Get terrain height at this position
        const y = 0; // For now, place on ground level
        
        return new THREE.Vector3(x, y, z);
    }

    clearBuildings() {
        while (this.buildingsGroup.children.length > 0) {
            this.buildingsGroup.remove(this.buildingsGroup.children[0]);
        }
        this.buildings = [];
        this.population = 0;
        this.updateStats();
        console.log('All buildings cleared');
    }

    updateStats() {
        this.populationDisplay.textContent = this.population;
        this.resourcesDisplay.textContent = this.resources;
        this.buildingsDisplay.textContent = this.buildings.length;
    }

    updateCameraFromFace() {
        if (!this.camera) return;
        
        // Map face position to camera rotation
        const panRange = Math.PI / 3; // 60 degrees
        const tiltRange = Math.PI / 6; // 30 degrees
        
        const pan = (this.eyePosition.x - 0.5) * panRange;
        const tilt = (this.eyePosition.y - 0.5) * tiltRange;
        
        this.camera.position.x = Math.sin(pan) * 20;
        this.camera.position.z = Math.cos(pan) * 20;
        this.camera.position.y = 15 + Math.sin(tilt) * 5;
        
        this.camera.lookAt(0, 0, 0);
    }

    gameLoop() {
        if (!this.isPlaying) return;

        // Update camera based on face position
        this.updateCameraFromFace();

        // Render scene
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }

        // Continue game loop
        this.gameLoopId = requestAnimationFrame(() => this.gameLoop());
    }

    resourceLoop() {
        if (!this.isPlaying) return;

        // Generate resources based on buildings
        const farmCount = this.buildings.filter(b => b.userData.type === 'farm').length;
        const cityCount = this.buildings.filter(b => b.userData.type === 'city').length;
        
        this.resources += farmCount * 2 + cityCount * 5;
        this.updateStats();

        // Continue resource loop
        this.resourceTimerId = setTimeout(() => this.resourceLoop(), 5000); // Every 5 seconds
    }

    async startGame() {
        try {
            this.isPlaying = true;
            this.updateButton();
            this.setStatus('Initializing...');

            // Initialize confetti
            this.initConfetti();

            // Initialize Three.js
            this.initializeThreeJS();

            // Initialize face tracking
            await this.initializeFaceMesh();
            await this.initializeCamera();

            // Initialize speech recognition
            this.initializeSpeechRecognition();
            this.startListening();

            // Start game loops
            this.gameLoop();
            this.resourceLoop();

            // Start face mesh processing
            if (this.faceMesh) {
                this.faceMesh.send({ image: this.videoStream });
            }

            this.setStatus('Playing');
            this.triggerStartGameConfetti();

        } catch (error) {
            this.showError('Failed to start game: ' + error.message);
            this.stopGame();
        }
    }

    stopGame() {
        this.isPlaying = false;
        this.stopListening();
        
        if (this.gameLoopId) {
            cancelAnimationFrame(this.gameLoopId);
            this.gameLoopId = null;
        }
        
        if (this.resourceTimerId) {
            clearTimeout(this.resourceTimerId);
            this.resourceTimerId = null;
        }

        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }

        this.updateButton();
        this.setStatus('Stopped');
    }

    updateButton() {
        if (this.isPlaying) {
            this.gameButton.textContent = 'Stop Civilization';
            this.gameButton.className = 'game-button stop-button';
        } else {
            this.gameButton.textContent = 'Start Civilization';
            this.gameButton.className = 'game-button start-button';
        }
    }

    setStatus(status) {
        this.statusDisplay.textContent = status;
        this.statusDisplay.className = 'stat-value ' + (status === 'Playing' ? 'status-locked' : 'status-searching');
    }

    setFaceDetected(detected) {
        this.faceDetected = detected;
        if (detected) {
            this.setStatus('Face Detected ✓');
        } else {
            this.setStatus('Searching...');
        }
    }

    showError(message) {
        this.error = message;
        this.errorMessage.textContent = message;
        this.errorPanel.classList.add('visible');
        
        setTimeout(() => {
            this.hideError();
        }, 3000);
    }

    hideError() {
        this.errorPanel.classList.remove('visible');
        this.error = null;
    }

    onWindowResize() {
        if (this.camera && this.renderer) {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        }
    }

    initConfetti() {
        this.confetti = new JSConfetti();
        console.log("Confetti system initialized");
    }

    triggerStartGameConfetti() {
        if (this.confetti) {
            this.confetti.addConfetti({
                emojis: ['🏛️', '🏠', '🌾', '🏰'],
                emojiSize: 50,
                confettiNumber: 30,
            });
        }
    }

    triggerBuildingConfetti() {
        if (this.confetti) {
            this.confetti.addConfetti({
                emojis: ['🏗️', '✨'],
                emojiSize: 30,
                confettiNumber: 15,
            });
        }
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    const game = new CivilizationGame();
}); 