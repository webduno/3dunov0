class LaserGame {
    constructor() {
        // Core Three.js setup
        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(-window.innerWidth/2, window.innerWidth/2, window.innerHeight/2, -window.innerHeight/2, 1, 1000);
        this.camera.position.z = 100;
        this.renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('gameCanvas'), alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x000000, 0);
        
        // Game state
        this.score = 0;
        this.gameStarted = false;
        this.gameOver = false;
        this.isCalibrated = false;
        this.isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        this.isPortrait = window.innerHeight > window.innerWidth;
        
        // Game objects arrays
        this.enemies = [];
        this.lasers = [];
        this.particles = [];
        this.bombs = [];
        this.kittens = [];
        
        // Timing
        this.lastEnemySpawn = 0;
        this.lastBombSpawn = 0;
        this.lastLaserTime = 0;
        this.enemySpawnInterval = 1500;
        this.bombSpawnInterval = 8000;
        
        // Two-player face tracking
        this.faceMesh = null;
        this.detectionEnabled = false;
        this.numPlayers = 0;
        
        // Player 1 data
        this.player1 = {
            leftEye: { x: 0.35, y: 0.4 },
            rightEye: { x: 0.45, y: 0.4 },
            mouth: { x: 0.4, y: 0.55, isOpen: false, width: 0, height: 0 },
            gaze: { x: 0.4, y: 0.4 },
            smoothGaze: { x: 0.4, y: 0.4 },
            faceCenter: { x: 0.4, y: 0.4 },
            currentFaceCenter: { x: 0.4, y: 0.4 },
            calibrated: false,
            color: 'blue',
            laserTip: null,
            lastLaserTime: 0
        };
        
        // Player 2 data
        this.player2 = {
            leftEye: { x: 0.55, y: 0.4 },
            rightEye: { x: 0.65, y: 0.4 },
            mouth: { x: 0.6, y: 0.55, isOpen: false, width: 0, height: 0 },
            gaze: { x: 0.6, y: 0.4 },
            smoothGaze: { x: 0.6, y: 0.4 },
            faceCenter: { x: 0.6, y: 0.4 },
            currentFaceCenter: { x: 0.6, y: 0.4 },
            calibrated: false,
            color: 'red',
            laserTip: null,
            lastLaserTime: 0
        };
        
        // Enhanced calibration system for both players
        this.calibrationHistory = { player1: [], player2: [] };
        this.maxCalibrationHistory = 30;
        this.lastRecalibrationTime = { player1: 0, player2: 0 };
        this.recalibrationCooldown = 2000;
        this.positionChangeThreshold = 0.12;
        this.distanceChangeThreshold = 0.27;
        this.stabilityFrames = 10;
        this.currentStabilityCount = { player1: 0, player2: 0 };
        this.pendingRecalibration = { player1: false, player2: false };
        this.baseFaceDistance = { player1: 0, player2: 0 };
        
        // Assets
        this.ghostTexture = null;
        this.kittenTexture = null;
        this.bombTexture = null;
        this.textureLoader = new THREE.TextureLoader();
        this.laserTip = null;
        
        // Kitten positions on forehead (adjusted for two players)
        this.kittenPositions = [
            { x: -0.1, y: -0.15 }, { x: 0.0, y: -0.15 }, { x: 0.1, y: -0.15 }
        ];

        this.init();
    }
    
    async init() {
        await Promise.all([this.setupMediaPipe(), this.loadSprites(), this.setupVideo()]);
        this.setupShaders();
        this.setupEventListeners();
        this.createLaserTip();
        this.animate();
        this.waitUntilReady();
    }

    waitUntilReady() {
        const startBtn = document.getElementById('startButton');
        startBtn.disabled = true;
        startBtn.textContent = "⏳ Loading...";

        const checkReady = setInterval(() => {
            if (this.video?.readyState >= 2) {
                startBtn.disabled = false;
                startBtn.textContent = "� Go �";
                clearInterval(checkReady);
            }
        }, 500);
    }

    async loadSprites() {
        const loadTexture = (path, fallback) => new Promise(resolve => {
            this.textureLoader.load(path, texture => {
                texture.magFilter = texture.minFilter = THREE.NearestFilter;
                resolve(texture);
            }, undefined, () => {
                console.warn(`Could not load ${path}, using fallback`);
                fallback.call(this);
                resolve(this[path.split('/')[1].split('.')[0] + 'Texture']);
            });
        });

        [this.ghostTexture, this.kittenTexture, this.bombTexture] = await Promise.all([
            loadTexture('assets/ghost.png', createFallbackGhostTexture),
            loadTexture('assets/kitten.png', createFallbackKittenTexture),
            loadTexture('assets/bomb.png', createFallbackBombTexture)
        ]);
    }
    
    async setupMediaPipe() {
        try {
            if (typeof window.FaceMesh !== 'undefined') {
                this.faceMesh = new window.FaceMesh({
                    locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4.1633559619/${file}`
                });
                this.faceMesh.setOptions({ 
                    maxNumFaces: 2, // Allow 2 faces
                    refineLandmarks: true, 
                    minDetectionConfidence: 0.3, 
                    minTrackingConfidence: 0.3 
                });
                this.faceMesh.onResults(results => {
                    if (results.multiFaceLandmarks) {
                        this.updateMultipleGazes(results.multiFaceLandmarks);
                    }
                });
                this.detectionEnabled = true;
            } else {
                this.setupMouseFallback();
            }
        } catch {
            this.setupMouseFallback();
        }
    }
    
    setupMouseFallback() {
        this.detectionEnabled = false;
        this.isCalibrated = true;
        this.player1.calibrated = true;
        this.numPlayers = 1;
        
        document.addEventListener('mousemove', e => {
            const player = this.player1;
            player.gaze.x = player.currentFaceCenter.x = player.mouth.x = e.clientX / window.innerWidth;
            player.gaze.y = player.currentFaceCenter.y = e.clientY / window.innerHeight;
            player.smoothGaze.x = player.gaze.x;
            player.smoothGaze.y = player.gaze.y;
            player.leftEye.x = player.gaze.x - 0.05;
            player.rightEye.x = player.gaze.x + 0.05;
            player.leftEye.y = player.rightEye.y = player.gaze.y;
            player.mouth.y = player.gaze.y + 0.1;
            player.mouth.isOpen = false;
            
            // Update laser tip position immediately in mouse mode
            if (this.laserTip && this.gameStarted) {
                this.laserTip.position.x = (player.smoothGaze.x - 0.5) * window.innerWidth;
                this.laserTip.position.y = -(player.smoothGaze.y - 0.5) * window.innerHeight;
            }
        });
        
        console.log("Mouse fallback setup complete, player1.calibrated:", this.player1.calibrated);
    }
    
    updateMultipleGazes(multiFaceLandmarks) {
        this.numPlayers = Math.min(multiFaceLandmarks.length, 2);
        
        multiFaceLandmarks.forEach((landmarks, index) => {
            if (index >= 2) return; // Only handle first 2 faces
            
            const player = index === 0 ? this.player1 : this.player2;
            const playerId = index === 0 ? 'player1' : 'player2';
            
            this.updatePlayerGaze(landmarks, player, playerId);
        });
        
        this.updateEyeUI();
    }
    
    updatePlayerGaze(landmarks, player, playerId) {
        const leftEye = landmarks[468] || landmarks[33];
        const rightEye = landmarks[473] || landmarks[362];
        if (!leftEye || !rightEye) return;
        
        const currentCenter = { x: (leftEye.x + rightEye.x) / 2, y: (leftEye.y + rightEye.y) / 2 };
        
        // Calculate face distance (approximate) using eye separation
        const eyeDistance = Math.sqrt((rightEye.x - leftEye.x) ** 2 + (rightEye.y - leftEye.y) ** 2);
        const currentFaceData = {
            center: currentCenter,
            distance: eyeDistance,
            timestamp: Date.now()
        };
        
        // Add to calibration history
        this.calibrationHistory[playerId].push(currentFaceData);
        if (this.calibrationHistory[playerId].length > this.maxCalibrationHistory) {
            this.calibrationHistory[playerId].shift();
        }
        
        // Initial calibration
        if (!player.calibrated) {
            player.faceCenter = { ...currentCenter };
            this.baseFaceDistance[playerId] = eyeDistance;
            player.calibrated = true;
            this.isCalibrated = this.player1.calibrated || this.player2.calibrated;
            console.log(`Initial calibration completed for ${playerId}`);
            
            // Show laser tip when player gets calibrated and game is started
            if (this.gameStarted && player.laserTip) {
                player.laserTip.visible = true;
                console.log(`${playerId} laser tip made visible after calibration`);
            }
            
            return;
        }
        
        // Check if we need to recalibrate
        this.checkForRecalibration(currentFaceData, player, playerId);
        
        player.currentFaceCenter = { ...currentCenter };
        
        // Calculate relative distance change for scaling sensitivity
        const distanceRatio = this.baseFaceDistance[playerId] / eyeDistance;
        const sensitivityScale = Math.max(0.5, Math.min(2.0, distanceRatio));
        
        // Calculate gaze from head movement with distance compensation
        const baseScaleX = this.isPortrait ? 0.06 : 0.08;
        const baseScaleY = this.isPortrait ? 0.08 : 0.05;
        
        const scaleX = baseScaleX * sensitivityScale;
        const scaleY = baseScaleY * sensitivityScale;
        
        const deltaX = (currentCenter.x - player.faceCenter.x) / scaleX;
        const deltaY = (currentCenter.y - player.faceCenter.y) / scaleY;

        player.gaze.x = Math.max(0, Math.min(1, 0.5 - deltaX));
        player.gaze.y = Math.max(0, Math.min(1, 0.5 + deltaY));
        
        // Smooth gaze and eye positions
        player.smoothGaze.x += (player.gaze.x - player.smoothGaze.x) * 0.15;
        player.smoothGaze.y += (player.gaze.y - player.smoothGaze.y) * 0.15;
        player.leftEye.x = 1 - leftEye.x;
        player.leftEye.y = leftEye.y;
        player.rightEye.x = 1 - rightEye.x;
        player.rightEye.y = rightEye.y;
        
        // Mouth tracking
        const [upperLip, lowerLip, leftCorner, rightCorner] = [landmarks[13], landmarks[14], landmarks[308], landmarks[78]];
        if (upperLip && lowerLip && leftCorner && rightCorner) {
            player.mouth.x = 1 - ((upperLip.x + lowerLip.x) / 2);
            player.mouth.y = (upperLip.y + lowerLip.y) / 2;
            player.mouth.width = Math.abs(rightCorner.x - leftCorner.x);
            player.mouth.height = Math.abs(lowerLip.y - upperLip.y);
            player.mouth.isOpen = (player.mouth.height / player.mouth.width) > 0.4;
        }
    }

    checkForRecalibration(currentFaceData, player, playerId) {
        const now = Date.now();
        
        // Don't recalibrate too frequently
        if (now - this.lastRecalibrationTime[playerId] < this.recalibrationCooldown) {
            return;
        }
        
        // Need enough history for comparison
        if (this.calibrationHistory[playerId].length < this.stabilityFrames) {
            return;
        }
        
        // Calculate position change from current calibration center
        const positionChange = Math.sqrt(
            Math.pow(currentFaceData.center.x - player.faceCenter.x, 2) +
            Math.pow(currentFaceData.center.y - player.faceCenter.y, 2)
        );
        
        // Calculate distance change from baseline
        const distanceChange = Math.abs(currentFaceData.distance - this.baseFaceDistance[playerId]) / this.baseFaceDistance[playerId];
        
        // Check if we've moved significantly
        const significantPositionChange = positionChange > this.positionChangeThreshold;
        const significantDistanceChange = distanceChange > this.distanceChangeThreshold;
        
        if (significantPositionChange || significantDistanceChange) {
            if (!this.pendingRecalibration[playerId]) {
                this.pendingRecalibration[playerId] = true;
                this.currentStabilityCount[playerId] = 0;
                console.log(`Significant movement detected for ${playerId}, checking for stability...`);
            }
            
            // Check if position has been stable for enough frames
            this.checkPositionStability(currentFaceData, player, playerId);
        } else {
            // Reset pending recalibration if we're back in normal range
            this.pendingRecalibration[playerId] = false;
            this.currentStabilityCount[playerId] = 0;
        }
    }

    checkPositionStability(currentFaceData, player, playerId) {
        if (this.calibrationHistory[playerId].length < this.stabilityFrames) {
            return;
        }
        
        // Check if the last N frames have been stable
        const recentFrames = this.calibrationHistory[playerId].slice(-this.stabilityFrames);
        const avgCenter = {
            x: recentFrames.reduce((sum, frame) => sum + frame.center.x, 0) / recentFrames.length,
            y: recentFrames.reduce((sum, frame) => sum + frame.center.y, 0) / recentFrames.length
        };
        const avgDistance = recentFrames.reduce((sum, frame) => sum + frame.distance, 0) / recentFrames.length;
        
        // Check variance in recent frames
        const maxVariance = 0.02; // Maximum allowed variance for stability
        const centerVariance = recentFrames.reduce((maxVar, frame) => {
            const variance = Math.sqrt(
                Math.pow(frame.center.x - avgCenter.x, 2) +
                Math.pow(frame.center.y - avgCenter.y, 2)
            );
            return Math.max(maxVar, variance);
        }, 0);
        
        const distanceVariance = recentFrames.reduce((maxVar, frame) => {
            return Math.max(maxVar, Math.abs(frame.distance - avgDistance) / avgDistance);
        }, 0);
        
        if (centerVariance < maxVariance && distanceVariance < 0.1) {
            this.currentStabilityCount[playerId]++;
            
            if (this.currentStabilityCount[playerId] >= this.stabilityFrames) {
                this.performRecalibration(avgCenter, avgDistance, player, playerId);
            }
        } else {
            this.currentStabilityCount[playerId] = 0;
        }
    }

    performRecalibration(newCenter, newDistance, player, playerId) {
        const oldCenter = { ...player.faceCenter };
        const oldDistance = this.baseFaceDistance[playerId];
        
        player.faceCenter = { ...newCenter };
        this.baseFaceDistance[playerId] = newDistance;
        this.lastRecalibrationTime[playerId] = Date.now();
        this.pendingRecalibration[playerId] = false;
        this.currentStabilityCount[playerId] = 0;
        
        console.log(`Auto-recalibrated face tracking for ${playerId}:`);
        console.log(`Position change: (${(newCenter.x - oldCenter.x).toFixed(3)}, ${(newCenter.y - oldCenter.y).toFixed(3)})`);
        console.log(`Distance change: ${((newDistance - oldDistance) / oldDistance * 100).toFixed(1)}%`);
    }

    forceRecalibration() {
        ['player1', 'player2'].forEach(playerId => {
            const player = playerId === 'player1' ? this.player1 : this.player2;
            if (this.calibrationHistory[playerId].length > 0) {
                const latest = this.calibrationHistory[playerId][this.calibrationHistory[playerId].length - 1];
                this.performRecalibration(latest.center, latest.distance, player, playerId);
            } else {
                player.calibrated = false;
            }
        });
        this.isCalibrated = this.player1.calibrated || this.player2.calibrated;
    }
    
    updateEyeUI() {
        const videoRect = document.getElementById('videoElement').getBoundingClientRect();
        
        // Update Player 1 eyes (original colors)
        if (this.player1.calibrated) {
            const leftEye1 = document.getElementById('leftEye');
            const rightEye1 = document.getElementById('rightEye');
            leftEye1.style.left = this.player1.leftEye.x * window.innerWidth + 'px';
            leftEye1.style.top = (videoRect.top + this.player1.leftEye.y * videoRect.height) + 'px';
            leftEye1.style.background = '#ebff68';
            leftEye1.style.border = '7px solid #ff00ff';
            rightEye1.style.left = this.player1.rightEye.x * window.innerWidth + 'px';
            rightEye1.style.top = (videoRect.top + this.player1.rightEye.y * videoRect.height) + 'px';
            rightEye1.style.background = '#ebff68';
            rightEye1.style.border = '7px solid #ff00ff';
            
            // Update Player 1 laser tip position and ensure it's visible during game
            if (this.player1.laserTip) {
                this.player1.laserTip.position.x = (this.player1.smoothGaze.x - 0.5) * window.innerWidth;
                this.player1.laserTip.position.y = -(this.player1.smoothGaze.y - 0.5) * window.innerHeight;
                
                // Ensure laser tip is visible if game is started
                if (this.gameStarted && !this.player1.laserTip.visible) {
                    this.player1.laserTip.visible = true;
                }
            }
        }

        // Create/Update Player 2 eyes (same colors as player 1)
        if (this.numPlayers >= 2 && this.player2.calibrated) {
            let leftEye2 = document.getElementById('leftEye2');
            let rightEye2 = document.getElementById('rightEye2');
            
            if (!leftEye2) {
                leftEye2 = document.createElement('div');
                leftEye2.id = 'leftEye2';
                leftEye2.className = 'eye-glow';
                leftEye2.style.display = this.gameStarted ? 'block' : 'none';
                document.getElementById('gameContainer').appendChild(leftEye2);
            }
            
            if (!rightEye2) {
                rightEye2 = document.createElement('div');
                rightEye2.id = 'rightEye2';
                rightEye2.className = 'eye-glow';
                rightEye2.style.display = this.gameStarted ? 'block' : 'none';
                document.getElementById('gameContainer').appendChild(rightEye2);
            }
            
            leftEye2.style.left = this.player2.leftEye.x * window.innerWidth + 'px';
            leftEye2.style.top = (videoRect.top + this.player2.leftEye.y * videoRect.height) + 'px';
            leftEye2.style.background = '#ebff68';
            leftEye2.style.border = '7px solid #ff00ff';
            rightEye2.style.left = this.player2.rightEye.x * window.innerWidth + 'px';
            rightEye2.style.top = (videoRect.top + this.player2.rightEye.y * videoRect.height) + 'px';
            rightEye2.style.background = '#ebff68';
            rightEye2.style.border = '7px solid #ff00ff';
            
            // Update Player 2 laser tip position and ensure it's visible during game
            if (this.player2.laserTip) {
                this.player2.laserTip.position.x = (this.player2.smoothGaze.x - 0.5) * window.innerWidth;
                this.player2.laserTip.position.y = -(this.player2.smoothGaze.y - 0.5) * window.innerHeight;
                
                // Ensure laser tip is visible if game is started
                if (this.gameStarted && !this.player2.laserTip.visible) {
                    this.player2.laserTip.visible = true;
                    console.log('Player 2 laser tip made visible in updateEyeUI');
                }
            }
        }

        // Update mouth portals
        [this.player1, this.player2].forEach((player, index) => {
            if (!player.calibrated) return;
            
            let mouthPortal = document.getElementById(`mouthPortal${index + 1}`);
            if (!mouthPortal && index === 1) {
                mouthPortal = document.createElement('div');
                mouthPortal.id = 'mouthPortal2';
                mouthPortal.className = 'mouth-portal';
                mouthPortal.style.display = 'none';
                mouthPortal.style.background = 'radial-gradient(circle, #ff0066 0%, #ff0033 30%, #cc0066 70%, transparent 100%)';
                document.getElementById('gameContainer').appendChild(mouthPortal);
            }
            
            if (index === 0) mouthPortal = document.getElementById('mouthPortal');
            
            if (mouthPortal) {
                mouthPortal.style.display = player.mouth.isOpen && this.gameStarted ? 'block' : 'none';
                if (player.mouth.isOpen && this.gameStarted) {
                    mouthPortal.style.left = player.mouth.x * window.innerWidth + 'px';
                    mouthPortal.style.top = (videoRect.top + player.mouth.y * videoRect.height) + 'px';
                }
            }
        });
    }
    
    setupShaders() {
        const shaderConfig = {
            laser: {
                uniforms: { time: { value: 0 }, intensity: { value: 1 }, color: { value: new THREE.Color(0.1, 0.1, 1.0) } },
                vertexShader: `
                    varying vec2 vUv; uniform float time;
                    void main() {
                        vUv = uv; vec3 pos = position;
                        pos.x += sin(time * 20.0 + position.y * 0.1) * 1.8 * (1.0 - abs(uv.y - 0.5) * 2.0);
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                    }`,
                fragmentShader: `
                    uniform float time, intensity; uniform vec3 color; varying vec2 vUv;
                    void main() {
                        float centerDist = abs(vUv.y - 0.5) * 2.0;
                        float beam = 1.0 - smoothstep(0.0, 0.4, centerDist);
                        float core = 1.0 - smoothstep(0.0, 0.15, centerDist);
                        float pulse = sin(time * 25.0) * 0.3 + 0.7;
                        vec3 finalColor = color * (beam * 2.0 + core * 6.0) * pulse * intensity;
                        gl_FragColor = vec4(finalColor, (beam * 2.5 + core * 2.0) * intensity * pulse);
                    }`
            },
            laserTip: {
                uniforms: { time: { value: 0 }, intensity: { value: 1 } },
                vertexShader: `
                    varying vec2 vUv; uniform float time;
                    void main() {
                        vUv = uv; vec3 pos = position;
                        float swirl = sin(time * 8.0) * 0.8;
                        pos.x += cos(time * 10.0 + pos.y * 0.5) * swirl;
                        pos.y += sin(time * 12.0 + pos.x * 0.5) * swirl;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                    }`,
                fragmentShader: `
                    uniform float time, intensity; varying vec2 vUv;
                    void main() {
                        vec2 center = vUv - 0.5; float dist = length(center), angle = atan(center.y, center.x);
                        float swirl = sin(angle * 6.0 + time * 15.0 + dist * 20.0) * 0.5 + 0.5;
                        float spiral = sin(angle * 3.0 - time * 8.0 + dist * 15.0) * 0.5 + 0.5;
                        float core = 1.0 - smoothstep(0.0, 0.2, dist);
                        float ring = smoothstep(0.2, 0.6, dist) - smoothstep(0.3, 0.6, dist);
                        float pulse = sin(time * 20.0) * 0.8 + 1.7;
                        vec3 color1 = vec3(1.0, 0.2, 0.2), color2 = vec3(1.0, 0.8, 0.2), color3 = vec3(0.2, 0.8, 1.0);
                        vec3 finalColor = mix(color1, color2, swirl) * core + mix(color2, color3, spiral) * ring;
                        finalColor *= pulse * intensity * 2.0;
                        gl_FragColor = vec4(finalColor, (core + ring * 1.2) * pulse * intensity);
                    }`
            },
            explosion: {
                uniforms: { time: { value: 0 }, progress: { value: 0 }, intensity: { value: 2 } },
                vertexShader: `
                    varying vec2 vUv; uniform float time, progress;
                    void main() { vUv = uv; vec3 pos = position * (1.0 + progress * 1.0); gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0); }`,
                fragmentShader: `
                    uniform float time, progress, intensity; varying vec2 vUv;
                    void main() {
                        vec2 center = vUv - 0.5; float dist = length(center), angle = atan(center.y, center.x);
                        float rays = sin(angle * 12.0 + time * 20.0) * 0.5 + 0.5;
                        float blast = 1.0 - smoothstep(0.0, progress, dist);
                        float ring = smoothstep(progress * 0.7, progress, dist) * (1.0 - smoothstep(progress, progress * 1.2, dist));
                        vec3 colors[4]; colors[0] = vec3(1.0, 0.0, 1.0); colors[1] = vec3(0.0, 1.0, 1.0); colors[2] = vec3(1.0, 1.0, 0.0); colors[3] = vec3(1.0, 0.0, 0.0);
                        float colorProgress = dist / progress;
                        vec3 finalColor = colorProgress < 0.33 ? mix(colors[0], colors[1], colorProgress * 3.0) : 
                                         colorProgress < 0.66 ? mix(colors[1], colors[2], (colorProgress - 0.33) * 3.0) : 
                                         mix(colors[2], colors[3], (colorProgress - 0.66) * 3.0);
                        vec3 rainbowRing = vec3(sin(angle * 3.0 + time * 10.0) * 0.5 + 0.5, sin(angle * 3.0 + time * 10.0 + 2.094) * 0.5 + 0.5, sin(angle * 3.0 + time * 10.0 + 4.188) * 0.5 + 0.5);
                        finalColor = mix(finalColor, rainbowRing, ring * 1.0) * (blast + ring * rays) * intensity * (1.2 - progress * 0.6);
                        gl_FragColor = vec4(finalColor, (blast + ring) * intensity * (1.0 - progress));
                    }`
            },
            particle: {
                uniforms: { time: { value: 0 }, size: { value: 20 } },
                vertexShader: `
                    uniform float time, size; attribute float life, sparkIndex; attribute vec3 velocity; varying float vLife, vIndex;
                    void main() {
                        vLife = life; vIndex = sparkIndex; float lifeProgress = 1.0 - life;
                        vec3 pos = position + velocity * lifeProgress * 2.0; pos.y -= lifeProgress * lifeProgress * 60.0;
                        gl_PointSize = size * life * (0.8 + sin(time * 25.0 + sparkIndex * 10.0) * 0.8);
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                    }`,
                fragmentShader: `
                    uniform float time; varying float vLife, vIndex;
                    void main() {
                        vec2 center = gl_PointCoord - vec2(0.5); if (length(center) > 0.5) discard;
                        float alpha = (1.0 - length(center) * 1.5) * vLife * (0.9 + sin(time * 40.0 + vIndex * 15.0) * 0.3) * 1.8;
                        vec3 color = mix(vec3(1.0), vec3(1.0, 0.3, 0.1), 1.0 - vLife) * 1.5;
                        gl_FragColor = vec4(color, alpha);
                    }`
            }
        };

        Object.entries(shaderConfig).forEach(([name, config]) => {
            this[name + 'Material'] = new THREE.ShaderMaterial({
                ...config,
                transparent: true,
                blending: THREE.AdditiveBlending
            });
        });
    }

    createLaserTip() {
        // Create separate materials for each player to avoid conflicts
        const laserTipMaterial1 = new THREE.ShaderMaterial({
            uniforms: { 
                time: { value: 0 }, 
                intensity: { value: 1 } 
            },
            vertexShader: `
                varying vec2 vUv; uniform float time;
                void main() {
                    vUv = uv; vec3 pos = position;
                    float swirl = sin(time * 8.0) * 0.8;
                    pos.x += cos(time * 10.0 + pos.y * 0.5) * swirl;
                    pos.y += sin(time * 12.0 + pos.x * 0.5) * swirl;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }`,
            fragmentShader: `
                uniform float time, intensity; varying vec2 vUv;
                void main() {
                    vec2 center = vUv - 0.5; float dist = length(center), angle = atan(center.y, center.x);
                    float swirl = sin(angle * 6.0 + time * 15.0 + dist * 20.0) * 0.5 + 0.5;
                    float spiral = sin(angle * 3.0 - time * 8.0 + dist * 15.0) * 0.5 + 0.5;
                    float core = 1.0 - smoothstep(0.0, 0.2, dist);
                    float ring = smoothstep(0.2, 0.6, dist) - smoothstep(0.3, 0.6, dist);
                    float pulse = sin(time * 20.0) * 0.8 + 1.7;
                    vec3 color1 = vec3(0.2, 0.2, 1.0), color2 = vec3(0.2, 0.8, 1.0), color3 = vec3(1.0, 0.8, 0.2);
                    vec3 finalColor = mix(color1, color2, swirl) * core + mix(color2, color3, spiral) * ring;
                    finalColor *= pulse * intensity * 2.0;
                    gl_FragColor = vec4(finalColor, (core + ring * 1.2) * pulse * intensity);
                }`,
            transparent: true,
            blending: THREE.AdditiveBlending
        });

        const laserTipMaterial2 = new THREE.ShaderMaterial({
            uniforms: { 
                time: { value: 0 }, 
                intensity: { value: 1 } 
            },
            vertexShader: `
                varying vec2 vUv; uniform float time;
                void main() {
                    vUv = uv; vec3 pos = position;
                    float swirl = sin(time * 8.0) * 0.8;
                    pos.x += cos(time * 10.0 + pos.y * 0.5) * swirl;
                    pos.y += sin(time * 12.0 + pos.x * 0.5) * swirl;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }`,
            fragmentShader: `
                uniform float time, intensity; varying vec2 vUv;
                void main() {
                    vec2 center = vUv - 0.5; float dist = length(center), angle = atan(center.y, center.x);
                    float swirl = sin(angle * 6.0 + time * 15.0 + dist * 20.0) * 0.5 + 0.5;
                    float spiral = sin(angle * 3.0 - time * 8.0 + dist * 15.0) * 0.5 + 0.5;
                    float core = 1.0 - smoothstep(0.0, 0.2, dist);
                    float ring = smoothstep(0.2, 0.6, dist) - smoothstep(0.3, 0.6, dist);
                    float pulse = sin(time * 20.0) * 0.8 + 1.7;
                    vec3 color1 = vec3(1.0, 0.2, 0.2), color2 = vec3(1.0, 0.8, 0.2), color3 = vec3(0.2, 0.8, 1.0);
                    vec3 finalColor = mix(color1, color2, swirl) * core + mix(color2, color3, spiral) * ring;
                    finalColor *= pulse * intensity * 2.0;
                    gl_FragColor = vec4(finalColor, (core + ring * 1.2) * pulse * intensity);
                }`,
            transparent: true,
            blending: THREE.AdditiveBlending
        });
        
        // Create laser tip for player 1 (blue theme)
        this.player1.laserTip = new THREE.Mesh(new THREE.CircleGeometry(80, 32), laserTipMaterial1);
        this.player1.laserTip.position.z = 50;
        this.player1.laserTip.visible = false;
        this.scene.add(this.player1.laserTip);
        
        // Create laser tip for player 2 (red theme)
        this.player2.laserTip = new THREE.Mesh(new THREE.CircleGeometry(80, 32), laserTipMaterial2);
        this.player2.laserTip.position.z = 50;
        this.player2.laserTip.visible = false;
        this.scene.add(this.player2.laserTip);
        
        // Keep the old reference for backward compatibility
        this.laserTip = this.player1.laserTip;
    }
    
    async setupVideo() {
        const video = document.getElementById('videoElement');
        try {
            video.srcObject = await navigator.mediaDevices.getUserMedia({
                video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' }
            });
            this.video = video;
            video.onloadeddata = () => {
                if (this.detectionEnabled && this.faceMesh) this.startFaceDetection();
            };
        } catch {
            alert('Camera access required to play.');
        }
    }

    setupEventListeners() {
        document.getElementById('startButton').addEventListener('click', () => {
            if (this.video?.readyState < 2) {
                alert("Please wait for the camera and face tracking to fully load.");
                return;
            }
            this.startGame();
        });
        
        document.addEventListener('keydown', e => { 
            if (e.key.toLowerCase() === 'c') {
                this.forceRecalibration();
            }
        });
        
        window.addEventListener('resize', () => {
            this.isPortrait = window.innerHeight > window.innerWidth;
            this.camera.left = -window.innerWidth / 2;
            this.camera.right = window.innerWidth / 2;
            this.camera.top = window.innerHeight / 2;
            this.camera.bottom = -window.innerHeight / 2;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }
    
    startGame() {
        // UI updates
        document.getElementById('start-overlay').style.display = 'none';
        document.getElementById('gameOverScreen').style.display = 'none';
        
        // Show player eyes
        ['leftEye', 'rightEye'].forEach(id => document.getElementById(id).style.display = 'block');
        
        // Show player 2 eyes if they exist
        if (this.numPlayers >= 2) {
            ['leftEye2', 'rightEye2'].forEach(id => {
                const eye = document.getElementById(id);
                if (eye) eye.style.display = 'block';
            });
        }
        
        // Game state reset
        Object.assign(this, {
            gameStarted: true,
            gameOver: false,
            score: 0,
            lastEnemySpawn: Date.now(),
            lastBombSpawn: Date.now(),
            enemySpawnInterval: 1500
        });
        
        // Note: Laser tips will be made visible automatically when players get calibrated
        // This happens in updatePlayerGaze() and updateEyeUI()
        
        document.getElementById('score').textContent = this.score;
        
        // Clear previous game objects
        [this.enemies, this.lasers, this.particles, this.kittens, this.bombs].forEach(arr => {
            arr.forEach(obj => this.scene.remove(obj));
            arr.length = 0;
        });
        
        this.createKittens();
        if (this.detectionEnabled && this.faceMesh && this.video) this.startFaceDetection();
    }

    createKittens() {
        this.kittenPositions.forEach((pos, index) => {
            const kitten = new THREE.Mesh(
                new THREE.PlaneGeometry(120, 120),
                new THREE.MeshBasicMaterial({ map: this.kittenTexture, transparent: true, alphaTest: 0.1 })
            );
            kitten.position.z = 51;
            kitten.userData = { index, alive: true, relativePosition: pos };
            this.scene.add(kitten);
            this.kittens.push(kitten);
        });
    }
    
    updateKittenPositions() {
        if (!this.isCalibrated || !this.kittens.length) return;
        
        // Use the average face center of active players for kitten positioning
        let avgFaceCenterX = 0, avgFaceCenterY = 0, activePlayers = 0;
        
        if (this.player1.calibrated && this.player1.currentFaceCenter) {
            avgFaceCenterX += (1 - this.player1.currentFaceCenter.x) * window.innerWidth;
            avgFaceCenterY += this.player1.currentFaceCenter.y * window.innerHeight;
            activePlayers++;
        }
        
        if (this.player2.calibrated && this.player2.currentFaceCenter) {
            avgFaceCenterX += (1 - this.player2.currentFaceCenter.x) * window.innerWidth;
            avgFaceCenterY += this.player2.currentFaceCenter.y * window.innerHeight;
            activePlayers++;
        }
        
        if (activePlayers === 0) return;
        
        avgFaceCenterX /= activePlayers;
        avgFaceCenterY /= activePlayers;
        
        this.kittens.forEach(kitten => {
            if (kitten.userData.alive) {
                const relPos = kitten.userData.relativePosition;
                kitten.position.x = avgFaceCenterX + relPos.x * window.innerWidth - window.innerWidth/2;
                kitten.position.y = -(avgFaceCenterY + relPos.y * window.innerHeight - window.innerHeight/2);
            }
        });
    }
    
    async startFaceDetection() {
        const detect = async () => {
            if (!this.gameStarted) return;
            if (this.video.readyState >= 2) {
                try { await this.faceMesh.send({image: this.video}); } catch {}
            }
            requestAnimationFrame(detect);
        };
        detect();
    }
    
    spawnEnemy() {
        const enemy = new THREE.Mesh(
            new THREE.PlaneGeometry(80, 80),
            new THREE.MeshBasicMaterial({ map: this.ghostTexture, transparent: true, alphaTest: 0.1 })
        );
        
        const positions = [
            [(Math.random() - 0.5) * window.innerWidth, -window.innerHeight / 2 - 100],
            [window.innerWidth / 2 + 100, (Math.random() - 0.5) * window.innerHeight],
            [-window.innerWidth / 2 - 100, (Math.random() - 0.5) * window.innerHeight]
        ];
        
        [enemy.position.x, enemy.position.y] = positions[Math.floor(Math.random() * 3)];
        enemy.position.z = 0;
        
        enemy.userData = {
            health: 100,
            speed: this.isMobile ? 30 + Math.random() * 30 : 40 + Math.random() * 40,
            initialY: enemy.position.y,
            bobSpeed: 6 + Math.random() * 4,
            bobAmount: 40 + Math.random() * 20,
            rotationSpeed: 4 + Math.random() * 3,
            rotationAmount: (25 + Math.random() * 10) * (Math.PI / 180),
            timeOffset: Math.random() * Math.PI * 2
        };
        
        this.scene.add(enemy);
        this.enemies.push(enemy);
    }
    
    spawnBomb() {
        const bomb = new THREE.Mesh(
            new THREE.PlaneGeometry(170, 170),
            new THREE.ShaderMaterial({
                uniforms: { time: { value: 0 }, map: { value: this.bombTexture }, flashIntensity: { value: 0 } },
                vertexShader: `
                    uniform float time; varying vec2 vUv;
                    void main() { vUv = uv; vec3 pos = position * (1.0 + sin(time * 4.0) * 0.5); gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0); }`,
                fragmentShader: `
                    uniform sampler2D map; uniform float time, flashIntensity; varying vec2 vUv;
                    void main() {
                        vec4 texColor = texture2D(map, vUv); if (texColor.a < 0.1) discard;
                        vec3 finalColor = mix(texColor.rgb, vec3(1.0, 1.0, 0.3), flashIntensity);
                        gl_FragColor = vec4(finalColor, texColor.a);
                    }`,
                transparent: true
            })
        );
        
        const margin = 120;
        bomb.position.x = (Math.random() - 0.5) * (window.innerWidth - margin * 2);
        bomb.position.y = (Math.random() - 0.5) * (window.innerHeight - margin * 2);
        bomb.position.z = 10;
        
        bomb.userData = {
            health: 3,
            direction: { x: (Math.random() - 0.5) * 60, y: (Math.random() - 0.5) * 60 },
            speed: 20 + Math.random() * 30,
            rotationSpeed: 2 + Math.random() * 2,
            bobSpeed: 3 + Math.random() * 2,
            bobAmount: 15 + Math.random() * 10,
            timeOffset: Math.random() * Math.PI * 2,
            nextFlash: Date.now() + 2000 + Math.random() * 3000,
            flashDuration: 0
        };
        
        this.scene.add(bomb);
        this.bombs.push(bomb);
    }
    
    findClosestKitten(enemyPos) {
        return this.kittens.filter(k => k.userData.alive)
            .reduce((closest, kitten) => {
                const dist = Math.sqrt((kitten.position.x - enemyPos.x) ** 2 + (kitten.position.y - enemyPos.y) ** 2);
                return !closest || dist < closest.distance ? { kitten, distance: dist } : closest;
            }, null)?.kitten || null;
    }
    
    createLaser(startX, startY, endX, endY, player) {
        const distance = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2) * 4;
        const material = this.laserMaterial.clone();
        // Set color based on player
        if (player.color === 'red') {
            material.uniforms.color.value = new THREE.Color(1.0, 0.1, 0.1);
        } else {
            material.uniforms.color.value = new THREE.Color(0.1, 0.1, 1.0);
        }
        const laser = new THREE.Mesh(new THREE.CylinderGeometry(25, 20, distance, 8), material);
        laser.position.set((startX + endX) / 2, (startY + endY) / 2, 20);
        laser.rotation.z = Math.atan2(endY - startY, endX - startX) - Math.PI / 2;
        laser.userData = { life: 0.5, maxLife: 1, player: player.color };
        this.scene.add(laser);
        this.lasers.push(laser);
    }
    
    createParticles(x, y, count = 8) {
        const positions = new Float32Array(count * 3);
        const lives = new Float32Array(count);
        const velocities = new Float32Array(count * 3);
        const indices = new Float32Array(count);
        
        for (let i = 0; i < count; i++) {
            const idx = i * 3;
            positions[idx] = x; positions[idx + 1] = y; positions[idx + 2] = 1;
            lives[i] = 1; indices[i] = i;
            const angle = (i / count) * Math.PI * 2;
            const speed = 50 + Math.random() * 250;
            velocities[idx] = Math.cos(angle) * speed;
            velocities[idx + 1] = Math.sin(angle) * speed;
            velocities[idx + 2] = (Math.random() - 0.5) * 40;
        }
        
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('life', new THREE.BufferAttribute(lives, 1));
        geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
        geometry.setAttribute('sparkIndex', new THREE.BufferAttribute(indices, 1));
        
        const particles = new THREE.Points(geometry, this.particleMaterial);
        particles.userData = { life: 0.8, maxLife: 0.8, lives };
        this.scene.add(particles);
        this.particles.push(particles);
    }
    
    createExplosion(x, y, radius = 300) {
        const explosion = new THREE.Mesh(new THREE.CircleGeometry(radius, 32), this.explosionMaterial.clone());
        explosion.position.set(x, y, 25);
        explosion.userData = { life: 1.0, maxLife: 1.0, radius };
        this.scene.add(explosion);
        this.particles.push(explosion);
        return explosion;
    }
    
    explodeBomb(bomb) {
        const explosionRadius = 400;
        this.createExplosion(bomb.position.x, bomb.position.y, explosionRadius);
        this.createParticles(bomb.position.x, bomb.position.y, 20);
        
        // Destroy enemies in blast radius
        this.enemies = this.enemies.filter(enemy => {
            const distance = Math.sqrt((enemy.position.x - bomb.position.x) ** 2 + (enemy.position.y - bomb.position.y) ** 2);
            if (distance < explosionRadius) {
                this.scene.remove(enemy);
                this.createParticles(enemy.position.x, enemy.position.y, 8);
                this.score++;
                document.getElementById('score').textContent = this.score;
                playGhostPopSound();
                return false;
            }
            return true;
        });
        
        // Remove bomb
        this.scene.remove(bomb);
        this.bombs.splice(this.bombs.indexOf(bomb), 1);
        playBombExplosionSound();
    }
    
    fireLaser(player) {
        if (!player.calibrated) return;
        
        const targetX = (player.smoothGaze.x - 0.5) * window.innerWidth;
        const targetY = -(player.smoothGaze.y - 0.5) * window.innerHeight;
        const leftEyeX = (player.leftEye.x - 0.5) * window.innerWidth;
        const leftEyeY = -(player.leftEye.y - 0.5) * window.innerHeight;
        const rightEyeX = (player.rightEye.x - 0.5) * window.innerWidth;
        const rightEyeY = -(player.rightEye.y - 0.5) * window.innerHeight;
        
        this.createLaser(leftEyeX, leftEyeY, targetX, targetY, player);
        this.createLaser(rightEyeX, rightEyeY, targetX, targetY, player);
        this.createParticles(targetX, targetY, 2);
        this.checkHit(targetX, targetY);
    }
    
    checkHit(x, y) {
        // Check bomb hits first
        for (let i = this.bombs.length - 1; i >= 0; i--) {
            const bomb = this.bombs[i];
            if (Math.sqrt((bomb.position.x - x) ** 2 + (bomb.position.y - y) ** 2) < 120) {
                bomb.userData.health--;
                if (bomb.material.uniforms?.flashIntensity) bomb.material.uniforms.flashIntensity.value = 1.0;
                this.createParticles(bomb.position.x, bomb.position.y, 4);
                playBombHitSound();
                setTimeout(() => {
                    if (bomb.material?.uniforms?.flashIntensity) bomb.material.uniforms.flashIntensity.value = 0;
                }, 150);
                if (bomb.userData.health <= 0) this.explodeBomb(bomb);
                return;
            }
        }
        
        // Check enemy hits
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            if (Math.sqrt((enemy.position.x - x) ** 2 + (enemy.position.y - y) ** 2) < 120) {
                enemy.userData.health -= 35;
                enemy.material.color.setHex(0x0000ff);
                this.createParticles(enemy.position.x, enemy.position.y, 8);
                playGhostPopSound();
                setTimeout(() => { if (enemy.material) enemy.material.color.setHex(0xffffff); }, 100);
                if (enemy.userData.health <= 0) {
                    this.scene.remove(enemy);
                    this.enemies.splice(i, 1);
                    this.score++;
                    document.getElementById('score').textContent = this.score;
                }
                return;
            }
        }
    }
    
    checkMouthEating() {
        if (!this.gameStarted) return;
        
        [this.player1, this.player2].forEach(player => {
            if (!player.mouth.isOpen || !player.calibrated) return;
            
            const mouthX = (player.mouth.x - 0.5) * window.innerWidth;
            const mouthY = -(player.mouth.y - 0.5) * window.innerHeight;
            
            this.enemies = this.enemies.filter(enemy => {
                const distance = Math.sqrt((enemy.position.x - mouthX) ** 2 + (enemy.position.y - mouthY) ** 2);
                if (distance < 160) {
                    this.scene.remove(enemy);
                    this.createParticles(enemy.position.x, enemy.position.y, 12);
                    this.score++;
                    document.getElementById('score').textContent = this.score;
                    playMouthEatSound();
                    return false;
                }
                return true;
            });
        });
    }
    
    checkKittenCollisions() {
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            for (const kitten of this.kittens) {
                if (kitten.userData.alive) {
                    const distance = Math.sqrt((enemy.position.x - kitten.position.x) ** 2 + (enemy.position.y - kitten.position.y) ** 2);
                    if (distance < 50) {
                        kitten.userData.alive = false;
                        kitten.visible = false;
                        this.createParticles(kitten.position.x, kitten.position.y, 15);
                        this.scene.remove(enemy);
                        this.enemies.splice(i, 1);
                        this.createParticles(enemy.position.x, enemy.position.y, 10);
                        
                        if (this.kittens.filter(k => k.userData.alive).length === 0) {
                            this.triggerGameOver();
                        }
                        playKittenAlertSound();
                        break;
                    }
                }
            }
        }
    }
    
    triggerGameOver() {
        this.gameOver = true;
        this.gameStarted = false;
        
        // Hide all eye indicators
        ['leftEye', 'rightEye', 'leftEye2', 'rightEye2', 'mouthPortal', 'mouthPortal2'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
        });
        
        // Hide both laser tips
        if (this.player1.laserTip) this.player1.laserTip.visible = false;
        if (this.player2.laserTip) this.player2.laserTip.visible = false;
        
        // Keep backward compatibility
        if (this.laserTip) this.laserTip.visible = false;
        
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOverScreen').style.display = 'block';
    }
    
    update(deltaTime) {
        if (this.gameOver) return;
        
        const now = Date.now();
        const time = now * 0.001;
        
        this.updateKittenPositions();
        
        // Spawning
        if (now - this.lastEnemySpawn > this.enemySpawnInterval) {
            this.spawnEnemy();
            this.lastEnemySpawn = now;
            this.enemySpawnInterval = Math.max(350, this.enemySpawnInterval - 25);
        }
        
        if (now - this.lastBombSpawn > this.bombSpawnInterval) {
            this.spawnBomb();
            this.lastBombSpawn = now;
            this.bombSpawnInterval = 6000 + Math.random() * 7000;
        }
        
        // Auto-fire for both players
        [this.player1, this.player2].forEach(player => {
            if (player.calibrated && now - player.lastLaserTime > 180) {
                this.fireLaser(player);
                player.lastLaserTime = now;
            }
        });
        
        this.checkMouthEating();
        this.checkKittenCollisions();
        
        // Update bombs
        this.bombs.forEach(bomb => {
            const userData = bomb.userData;
            
            if (bomb.material.uniforms) {
                bomb.material.uniforms.time.value = time;
                
                // Flash effect
                if (now > userData.nextFlash) {
                    userData.flashDuration = 600;
                    userData.nextFlash = now + 2000 + Math.random() * 2000;
                }
                
                if (userData.flashDuration > 0) {
                    userData.flashDuration -= deltaTime * 1000;
                    bomb.material.uniforms.flashIntensity.value = Math.max(0, userData.flashDuration / 300) * 0.8;
                } else {
                    bomb.material.uniforms.flashIntensity.value = 0;
                }
            }
            
            // Random direction changes
            if (Math.random() < 0.02) {
                userData.direction.x += (Math.random() - 0.5) * 40;
                userData.direction.y += (Math.random() - 0.5) * 40;
                const speed = Math.sqrt(userData.direction.x ** 2 + userData.direction.y ** 2);
                if (speed > userData.speed) {
                    userData.direction.x = (userData.direction.x / speed) * userData.speed;
                    userData.direction.y = (userData.direction.y / speed) * userData.speed;
                }
            }
            
            // Move and bounce
            bomb.position.x += userData.direction.x * deltaTime;
            bomb.position.y += userData.direction.y * deltaTime;
            
            const margin = 100;
            if (bomb.position.x > window.innerWidth/2 - margin || bomb.position.x < -window.innerWidth/2 + margin) {
                userData.direction.x *= -1;
                bomb.position.x = Math.max(-window.innerWidth/2 + margin, Math.min(window.innerWidth/2 - margin, bomb.position.x));
            }
            if (bomb.position.y > window.innerHeight/2 - margin || bomb.position.y < -window.innerHeight/2 + margin) {
                userData.direction.y *= -1;
                bomb.position.y = Math.max(-window.innerHeight/2 + margin, Math.min(window.innerHeight/2 - margin, bomb.position.y));
            }
            
            // Bobbing and rotation
            bomb.position.y += Math.sin(time * userData.bobSpeed + userData.timeOffset) * userData.bobAmount * deltaTime;
            bomb.rotation.z += userData.rotationSpeed * deltaTime;
        });
        
        // Update enemies
        this.enemies.forEach(enemy => {
            const closestKitten = this.findClosestKitten(enemy.position);
            if (closestKitten) {
                const dx = closestKitten.position.x - enemy.position.x;
                const dy = closestKitten.position.y - enemy.position.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance > 5) {
                    enemy.position.x += (dx / distance) * enemy.userData.speed * deltaTime;
                    enemy.position.y += (dy / distance) * enemy.userData.speed * deltaTime;
                }
            }
            
            // Bobbing and rotation
            enemy.position.y += Math.sin(time * enemy.userData.bobSpeed + enemy.userData.timeOffset) * enemy.userData.bobAmount * deltaTime;
            enemy.rotation.z = Math.sin(time * enemy.userData.rotationSpeed + enemy.userData.timeOffset) * enemy.userData.rotationAmount;
        });
        
        // Update lasers
        this.lasers = this.lasers.filter(laser => {
            laser.userData.life -= deltaTime;
            if (laser.material.uniforms) laser.material.uniforms.intensity.value = laser.userData.life / laser.userData.maxLife;
            if (laser.userData.life <= 0) {
                this.scene.remove(laser);
                return false;
            }
            return true;
        });
        
        // Update particles
        this.particles = this.particles.filter(particles => {
            particles.userData.life -= deltaTime;
            
            // Handle explosion effects
            if (particles.material === this.explosionMaterial || particles.material.uniforms?.progress) {
                const progress = 1.0 - particles.userData.life / particles.userData.maxLife;
                if (particles.material.uniforms?.progress) particles.material.uniforms.progress.value = progress;
            }
            
            // Handle regular particles
            if (particles.userData.lives) {
                const lives = particles.userData.lives;
                for (let j = 0; j < lives.length; j++) {
                    lives[j] -= deltaTime * (0.8 + Math.random() * 1.6);
                    lives[j] = Math.max(0, lives[j]);
                }
                particles.geometry.attributes.life.needsUpdate = true;
            }
            
            if (particles.userData.life <= 0) {
                this.scene.remove(particles);
                return false;
            }
            return true;
        });
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        const time = Date.now() * 0.001;
        
        // Update shader uniforms for all materials
        [this.laserMaterial, this.particleMaterial, this.explosionMaterial].forEach(material => {
            if (material?.uniforms?.time) material.uniforms.time.value = time;
        });
        
        // Update laser tip materials for both players
        if (this.player1.laserTip?.material?.uniforms?.time) {
            this.player1.laserTip.material.uniforms.time.value = time;
        }
        if (this.player2.laserTip?.material?.uniforms?.time) {
            this.player2.laserTip.material.uniforms.time.value = time;
        }
        
        // Update bomb shader uniforms
        this.bombs.forEach(bomb => {
            if (bomb.material.uniforms?.time) bomb.material.uniforms.time.value = time;
        });
        
        if (this.gameStarted) {
            this.update(0.016);
            // Always update eye UI regardless of detection mode
            this.updateEyeUI();
        }
        
        this.renderer.render(this.scene, this.camera);
    }
}

window.addEventListener('load', () => new LaserGame());