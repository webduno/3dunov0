class DuckHuntGame {
    constructor() {
        // Game elements
        this.gameButton = document.getElementById('gameButton');
        this.scoreDisplay = document.getElementById('scoreDisplay');
        this.timeDisplay = document.getElementById('timeDisplay');
        this.statusDisplay = document.getElementById('statusDisplay');
        this.errorPanel = document.getElementById('errorPanel');
        this.errorMessage = document.getElementById('errorMessage');
        this.gameOverOverlay = document.getElementById('gameOverOverlay');
        this.finalScore = document.getElementById('finalScore');
        this.playAgainButton = document.getElementById('playAgainButton');
        this.voiceIndicator = document.getElementById('voiceIndicator');

        // Video and canvas elements
        this.videoStream = document.getElementById('videoStream');
        this.faceCanvas = document.getElementById('faceCanvas');
        this.gameCanvas = document.getElementById('gameCanvas');
        this.crosshair = document.getElementById('crosshair');

        // Game state
        this.isPlaying = false;
        this.score = 0;
        this.gameTime = 30;
        this.ducks = [];
        this.faceDetected = false;
        this.eyePointer = null;
        this.showPointer = false;
        this.pointerPosition = { x: 320, y: 240 };
        this.error = null;

        // MediaPipe and camera
        this.faceMesh = null;
        this.stream = null;
        this.isCalibrated = false;
        this.isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        this.isPortrait = window.innerHeight > window.innerWidth;

        // Enhanced face tracking system (based on example.js)
        this.player = {
            leftEye: { x: 0.4, y: 0.4 },
            rightEye: { x: 0.5, y: 0.4 },
            mouth: { x: 0.45, y: 0.55, isOpen: false, width: 0, height: 0 },
            gaze: { x: 0.45, y: 0.4 },
            smoothGaze: { x: 0.45, y: 0.4 },
            faceCenter: { x: 0.45, y: 0.4 },
            currentFaceCenter: { x: 0.45, y: 0.4 },
            calibrated: false,
            lastLaserTime: 0
        };

        // Calibration system
        this.calibrationHistory = [];
        this.maxCalibrationHistory = 30;
        this.lastRecalibrationTime = 0;
        this.recalibrationCooldown = 2000;
        this.positionChangeThreshold = 0.12;
        this.distanceChangeThreshold = 0.27;
        this.stabilityFrames = 10;
        this.currentStabilityCount = 0;
        this.pendingRecalibration = false;
        this.baseFaceDistance = 0;

        // Speech recognition
        this.speechRecognition = null;
        this.isListening = false;

        // Game timers
        this.gameLoopId = null;
        this.gameTimerId = null;
        this.spawnTimerId = null;

        // Confetti
        this.confetti = new JSConfetti();

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

        this.playAgainButton.addEventListener('click', () => {
            this.resetGame();
        });
        
        document.addEventListener('keydown', e => { 
            if (e.key.toLowerCase() === 'c') {
                this.forceRecalibration();
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

            console.log('Camera permission granted');
        } catch (error) {
            this.showError('Camera access denied. Please allow camera access and try again.');
            throw error;
        }
    }

    startListening() {
        if ('webkitSpeechRecognition' in window) {
            this.speechRecognition = new webkitSpeechRecognition();
            this.speechRecognition.continuous = true;
            this.speechRecognition.interimResults = false;
            this.speechRecognition.lang = 'en-US';

            this.speechRecognition.onresult = (event) => {
                const command = event.results[event.resultIndex][0].transcript.toLowerCase().trim();
                this.processVoiceCommand(command);
            };

            this.speechRecognition.onerror = (event) => {
                console.log('Speech recognition error:', event.error);
            };

            this.speechRecognition.onstart = () => {
                this.isListening = true;
                this.voiceIndicator.classList.add('active');
            };

            this.speechRecognition.onend = () => {
                this.isListening = false;
                this.voiceIndicator.classList.remove('active');
                if (this.isPlaying) {
                    setTimeout(() => this.speechRecognition.start(), 100);
                }
            };

            this.speechRecognition.start();
        }
    }

    stopListening() {
        if (this.speechRecognition) {
            this.speechRecognition.stop();
            this.speechRecognition = null;
        }
        this.isListening = false;
        this.voiceIndicator.classList.remove('active');
    }

    processVoiceCommand(command) {
        if (command.includes('start') && !this.isPlaying) {
            this.startGame();
        }
    }

    updatePlayerGaze(landmarks) {
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
        this.calibrationHistory.push(currentFaceData);
        if (this.calibrationHistory.length > this.maxCalibrationHistory) {
            this.calibrationHistory.shift();
        }
        
        // Initial calibration
        if (!this.player.calibrated) {
            this.player.faceCenter = { ...currentCenter };
            this.baseFaceDistance = eyeDistance;
            this.player.calibrated = true;
            this.isCalibrated = true;
            console.log('Initial calibration completed');
            return;
        }
        
        // Check if we need to recalibrate
        this.checkForRecalibration(currentFaceData);
        
        this.player.currentFaceCenter = { ...currentCenter };
        
        // Calculate relative distance change for scaling sensitivity
        const distanceRatio = this.baseFaceDistance / eyeDistance;
        const sensitivityScale = Math.max(0.5, Math.min(2.0, distanceRatio));
        
        // Calculate gaze from head movement with distance compensation
        const baseScaleX = this.isPortrait ? 0.06 : 0.08;
        const baseScaleY = this.isPortrait ? 0.08 : 0.05;
        
        const scaleX = baseScaleX * sensitivityScale;
        const scaleY = baseScaleY * sensitivityScale;
        
        const deltaX = (currentCenter.x - this.player.faceCenter.x) / scaleX;
        const deltaY = (currentCenter.y - this.player.faceCenter.y) / scaleY;

        this.player.gaze.x = Math.max(0, Math.min(1, 0.5 - deltaX));
        this.player.gaze.y = Math.max(0, Math.min(1, 0.5 + deltaY));
        
        // Smooth gaze and eye positions
        this.player.smoothGaze.x += (this.player.gaze.x - this.player.smoothGaze.x) * 0.15;
        this.player.smoothGaze.y += (this.player.gaze.y - this.player.smoothGaze.y) * 0.15;
        this.player.leftEye.x = 1 - leftEye.x;
        this.player.leftEye.y = leftEye.y;
        this.player.rightEye.x = 1 - rightEye.x;
        this.player.rightEye.y = rightEye.y;
        
        // Mouth tracking
        const [upperLip, lowerLip, leftCorner, rightCorner] = [landmarks[13], landmarks[14], landmarks[308], landmarks[78]];
        if (upperLip && lowerLip && leftCorner && rightCorner) {
            this.player.mouth.x = 1 - ((upperLip.x + lowerLip.x) / 2);
            this.player.mouth.y = (upperLip.y + lowerLip.y) / 2;
            this.player.mouth.width = Math.abs(rightCorner.x - leftCorner.x);
            this.player.mouth.height = Math.abs(lowerLip.y - upperLip.y);
            this.player.mouth.isOpen = (this.player.mouth.height / this.player.mouth.width) > 0.4;
        }
    }

    checkForRecalibration(currentFaceData) {
        const now = Date.now();
        
        // Don't recalibrate too frequently
        if (now - this.lastRecalibrationTime < this.recalibrationCooldown) {
            return;
        }
        
        // Need enough history for comparison
        if (this.calibrationHistory.length < this.stabilityFrames) {
            return;
        }
        
        // Calculate position change from current calibration center
        const positionChange = Math.sqrt(
            Math.pow(currentFaceData.center.x - this.player.faceCenter.x, 2) +
            Math.pow(currentFaceData.center.y - this.player.faceCenter.y, 2)
        );
        
        // Calculate distance change from baseline
        const distanceChange = Math.abs(currentFaceData.distance - this.baseFaceDistance) / this.baseFaceDistance;
        
        // Check if we've moved significantly
        const significantPositionChange = positionChange > this.positionChangeThreshold;
        const significantDistanceChange = distanceChange > this.distanceChangeThreshold;
        
        if (significantPositionChange || significantDistanceChange) {
            if (!this.pendingRecalibration) {
                this.pendingRecalibration = true;
                this.currentStabilityCount = 0;
                console.log('Significant movement detected, checking for stability...');
            }
            
            // Check if position has been stable for enough frames
            this.checkPositionStability(currentFaceData);
        } else {
            // Reset pending recalibration if we're back in normal range
            this.pendingRecalibration = false;
            this.currentStabilityCount = 0;
        }
    }

    checkPositionStability(currentFaceData) {
        if (this.calibrationHistory.length < this.stabilityFrames) {
            return;
        }
        
        // Check if the last N frames have been stable
        const recentFrames = this.calibrationHistory.slice(-this.stabilityFrames);
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
            this.currentStabilityCount++;
            
            if (this.currentStabilityCount >= this.stabilityFrames) {
                this.performRecalibration(avgCenter, avgDistance);
            }
        } else {
            this.currentStabilityCount = 0;
        }
    }

    performRecalibration(newCenter, newDistance) {
        const oldCenter = { ...this.player.faceCenter };
        const oldDistance = this.baseFaceDistance;
        
        this.player.faceCenter = { ...newCenter };
        this.baseFaceDistance = newDistance;
        this.lastRecalibrationTime = Date.now();
        this.pendingRecalibration = false;
        this.currentStabilityCount = 0;
        
        console.log('Auto-recalibrated face tracking:');
        console.log(`Position change: (${(newCenter.x - oldCenter.x).toFixed(3)}, ${(newCenter.y - oldCenter.y).toFixed(3)})`);
        console.log(`Distance change: ${((newDistance - oldDistance) / oldDistance * 100).toFixed(1)}%`);
    }

    forceRecalibration() {
        if (this.calibrationHistory.length > 0) {
            const latest = this.calibrationHistory[this.calibrationHistory.length - 1];
            this.performRecalibration(latest.center, latest.distance);
        } else {
            this.player.calibrated = false;
        }
        this.isCalibrated = this.player.calibrated;
    }

    onFaceMeshResults(results) {
        if (!this.isPlaying) return;

        const faceCtx = this.faceCanvas.getContext('2d');
        faceCtx.save();
        faceCtx.clearRect(0, 0, this.faceCanvas.width, this.faceCanvas.height);

        if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
            const landmarks = results.multiFaceLandmarks[0];
            this.setFaceDetected(true);

            // Update player gaze using the new calibration system
            this.updatePlayerGaze(landmarks);

            if (this.player.calibrated) {
                // Get eye positions for visualization
                const leftEye = landmarks[468] || landmarks[33];
                const rightEye = landmarks[473] || landmarks[362];
                
                if (leftEye && rightEye) {
                    const leftEyeX = leftEye.x * this.faceCanvas.width;
                    const leftEyeY = leftEye.y * this.faceCanvas.height;
                    const rightEyeX = rightEye.x * this.faceCanvas.width;
                    const rightEyeY = rightEye.y * this.faceCanvas.height;

                    // Draw civilization-themed face tracking
                    this.drawFacePointerWithNewLogic(faceCtx, leftEyeX, leftEyeY, rightEyeX, rightEyeY);

                    // Convert smooth gaze to terrain coordinates for 3D pointer
                    const terrainX = this.player.smoothGaze.x * 2 - 1; // Map to -1 to 1
                    const terrainZ = this.player.smoothGaze.y; // Map to 0 to 1

                    // Corner detection and redirection logic
                    const cornerThreshold = 0.7;
                    let redirectedTerrainX = terrainX;
                    let redirectedTerrainZ = terrainZ;

                    // Check if face is near corners and redirect
                    if (Math.abs(terrainX) > cornerThreshold && Math.abs(terrainZ - 0.5) > cornerThreshold) {
                        if (terrainX > cornerThreshold && terrainZ > 0.5 + cornerThreshold) {
                            redirectedTerrainX = 1.0;
                            redirectedTerrainZ = 1.0;
                        } else if (terrainX > cornerThreshold && terrainZ < 0.5 - cornerThreshold) {
                            redirectedTerrainX = 1.0;
                            redirectedTerrainZ = 0.0;
                        } else if (terrainX < -cornerThreshold && terrainZ > 0.5 + cornerThreshold) {
                            redirectedTerrainX = -1.0;
                            redirectedTerrainZ = 1.0;
                        } else if (terrainX < -cornerThreshold && terrainZ < 0.5 - cornerThreshold) {
                            redirectedTerrainX = -1.0;
                            redirectedTerrainZ = 0.0;
                        }
                    }

                    // Convert terrain coordinates to canvas pointer position
                    const pointerX = (this.faceCanvas.width * 0.1) + ((redirectedTerrainX + 1) * this.faceCanvas.width * 0.4);
                    const pointerY = (this.faceCanvas.height * 0.2) + ((1 - redirectedTerrainZ) * this.faceCanvas.height * 0.6);

                    // Clamp pointer position to canvas bounds
                    const clampedPointerX = Math.max(0, Math.min(this.faceCanvas.width, pointerX));
                    const clampedPointerY = Math.max(0, Math.min(this.faceCanvas.height, pointerY));

                    // Set pointer position based on new terrain logic
                    this.setPointerPosition(clampedPointerX, clampedPointerY);
                    this.setShowPointer(true);

                    // Check for duck hits with new pointer position
                    this.checkDuckHits(clampedPointerX, clampedPointerY);
                    
                    // EXPOSE FACE TRACKING DATA TO THE 3D GAME
                    if (window.gameState !== undefined) {
                        window.faceRotation = {
                            x: redirectedTerrainZ * 2 - 1, // Map to -1 to 1
                            y: redirectedTerrainX * 2, // Map to -2 to 2
                            z: 0
                        };
                        
                        // Also expose the raw terrain coordinates for more precise control
                        window.terrainCoordinates = {
                            x: redirectedTerrainX,
                            z: redirectedTerrainZ
                        };
                        
                        // Debug logging for troubleshooting
                        console.log("Face tracking data exposed:", {
                            terrainX: redirectedTerrainX,
                            terrainZ: redirectedTerrainZ,
                            faceRotation: window.faceRotation
                        });
                    }
                }
            }
        } else {
            this.setFaceDetected(false);
            this.setShowPointer(false);
        }

        faceCtx.restore();

        // Continue face mesh processing
        if (this.faceMesh && this.isPlaying) {
            this.faceMesh.send({ image: this.videoStream });
        }
    }

    drawFacePointerWithNewLogic(ctx, leftEyeX, leftEyeY, rightEyeX, rightEyeY) {
        ctx.save();
        
        // Draw eye tracking points (civilization theme)
        ctx.fillStyle = 'rgba(255, 255, 0, 1.0)'; // Bright yellow
        ctx.shadowColor = '#FFFF00';
        ctx.shadowBlur = 15;
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'rgba(0, 0, 0, 1.0)'; // Black border
        
        // Left eye
        ctx.beginPath();
        ctx.arc(leftEyeX, leftEyeY, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Right eye
        ctx.beginPath();
        ctx.arc(rightEyeX, rightEyeY, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Add inner highlights
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(leftEyeX, leftEyeY, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(rightEyeX, rightEyeY, 3, 0, Math.PI * 2);
        ctx.fill();

        // Draw gaze direction indicator
        if (this.player.calibrated) {
            const gazeX = this.player.smoothGaze.x * this.faceCanvas.width;
            const gazeY = this.player.smoothGaze.y * this.faceCanvas.height;
            
            // Gaze point
            const gazeColor = this.player.smoothGaze.y > 0.7 ? 'rgba(255, 69, 0, 0.9)' : // Deep red-orange
                             this.player.smoothGaze.y > 0.4 ? 'rgba(255, 140, 0, 0.9)' : // Orange
                             'rgba(255, 215, 0, 0.9)'; // Gold

            const glowGradient = ctx.createRadialGradient(gazeX, gazeY, 0, gazeX, gazeY, 12);
            glowGradient.addColorStop(0, gazeColor);
            glowGradient.addColorStop(0.5, 'rgba(255, 165, 0, 0.6)');
            glowGradient.addColorStop(1, 'rgba(255, 69, 0, 0.2)');

            ctx.fillStyle = glowGradient;
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.arc(gazeX, gazeY, 6, 0, Math.PI * 2);
            ctx.fill();

            // Direction indicator
            const directionColor = this.player.smoothGaze.x < 0.3 ? 'rgba(0, 255, 0, 0.8)' : // Green for left
                                 this.player.smoothGaze.x > 0.7 ? 'rgba(0, 0, 255, 0.8)' : // Blue for right
                                 'rgba(255, 255, 255, 0.8)'; // White for center

            ctx.fillStyle = directionColor;
            ctx.shadowBlur = 0;
            ctx.beginPath();
            ctx.arc(gazeX, gazeY, 2, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    checkDuckHits(pointerX, pointerY) {
        // Convert face canvas coordinates to game canvas coordinates
        const gameCanvasRect = this.gameCanvas.getBoundingClientRect();
        const faceCanvasRect = this.faceCanvas.getBoundingClientRect();
        
        const scaleX = this.gameCanvas.width / this.faceCanvas.width;
        const scaleY = this.gameCanvas.height / this.faceCanvas.height;
        
        const gamePointerX = pointerX * scaleX;
        const gamePointerY = pointerY * scaleY;

        this.ducks.forEach(duck => {
            if (!duck.alive) return;

            const duckX = duck.x * this.gameCanvas.width;
            const duckY = duck.y * this.gameCanvas.height;
            const duckSize = duck.size * this.gameCanvas.width;

            const distance = Math.sqrt(
                Math.pow(gamePointerX - duckX, 2) + 
                Math.pow(gamePointerY - duckY, 2)
            );

            if (distance < duckSize / 2) {
                duck.alive = false;
                duck.hitTime = Date.now();
                this.score += 10;
                this.updateScore();
                this.triggerDuckHitConfetti();
            }
        });
    }

    spawnDuck() {
        const side = Math.random() < 0.5 ? 'left' : 'right';
        const x = side === 'left' ? -0.1 : 1.1;
        const y = 0.2 + Math.random() * 0.6;
        const vx = side === 'left' ? 0.002 + Math.random() * 0.003 : -(0.002 + Math.random() * 0.003);
        const vy = (Math.random() - 0.5) * 0.001;
        
        this.ducks.push({
            x: x,
            y: y,
            vx: vx,
            vy: vy,
            size: 0.05 + Math.random() * 0.03,
            alive: true,
            hitTime: null
        });
    }

    gameLoop() {
        const canvas = this.gameCanvas;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Update and draw ducks
        this.ducks = this.ducks.filter(duck => {
            if (!duck.alive && duck.hitTime && Date.now() - duck.hitTime > 500) {
                return false; // Remove dead ducks after animation
            }

            if (duck.alive) {
                duck.x += duck.vx;
                duck.y += duck.vy;

                // Remove ducks that go off screen
                if (duck.x < -0.2 || duck.x > 1.2) {
                    return false;
                }
            }

            // Draw retro pixelated duck
            const x = Math.floor(duck.x * canvas.width);
            const y = Math.floor(duck.y * canvas.height);
            const size = Math.floor(duck.size * canvas.width);

            ctx.save();
            ctx.imageSmoothingEnabled = false; // Pixelated rendering
            
            if (!duck.alive) {
                ctx.globalAlpha = 0.5;
                ctx.translate(x, y);
                ctx.rotate(Math.PI); // Flip when hit
                ctx.translate(-x, -y);
            }

            // Duck body (brown rectangle)
            ctx.fillStyle = duck.alive ? '#8B4513' : '#555';
            ctx.fillRect(x - size/2, y - size/3, size, size/2);
            
            // Duck head (green square)
            ctx.fillStyle = duck.alive ? '#228B22' : '#333';
            ctx.fillRect(x - size/2 - size/4, y - size/2, size/2, size/2);
            
            // Duck beak (yellow pixel)
            ctx.fillStyle = duck.alive ? '#FFD700' : '#666';
            ctx.fillRect(x - size/2 - size/3, y - size/4, size/6, size/8);

            // Wing (darker brown block)
            ctx.fillStyle = duck.alive ? '#654321' : '#444';
            ctx.fillRect(x - size/4, y - size/4, size/3, size/4);

            // Simple eye (white pixel)
            if (duck.alive) {
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(x - size/2 - size/6, y - size/3, 2, 2);
            }

            ctx.restore();
            return true;
        });

        if (this.isPlaying) {
            this.gameLoopId = requestAnimationFrame(() => this.gameLoop());
        }
    }

    async startGame() {
        this.hideError();
        await this.initializeFaceMesh();
        await this.initializeCamera();
        
        this.startListening();
        
        this.isPlaying = true;
        this.score = 0;
        this.gameTime = 30;
        this.ducks = [];

        this.updateUI();

        // Start game timer
        this.gameTimerId = setInterval(() => {
            this.gameTime--;
            this.updateTime();
            
            if (this.gameTime <= 0) {
                this.endGame();
            }
        }, 1000);

        // Start spawning ducks
        this.spawnTimerId = setInterval(() => {
            if (Math.random() < 0.7) { // 70% chance to spawn
                this.spawnDuck();
            }
        }, 1500);

        // Start game loop
        this.gameLoop();

        // Start face mesh processing
        if (this.faceMesh) {
            this.faceMesh.send({ image: this.videoStream });
        }

        // Trigger start game confetti
        this.triggerStartGameConfetti();

        // Auto-stop after 30 seconds
        setTimeout(() => {
            if (this.spawnTimerId) {
                clearInterval(this.spawnTimerId);
            }
        }, 30000);
    }

    stopGame() {
        this.isPlaying = false;
        this.stopListening();

        // Clear timers
        if (this.gameLoopId) {
            cancelAnimationFrame(this.gameLoopId);
            this.gameLoopId = null;
        }
        if (this.gameTimerId) {
            clearInterval(this.gameTimerId);
            this.gameTimerId = null;
        }
        if (this.spawnTimerId) {
            clearInterval(this.spawnTimerId);
            this.spawnTimerId = null;
        }

        // Stop camera and streams
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        if (this.videoStream) {
            this.videoStream.srcObject = null;
        }
        if (this.faceMesh) {
            try {
                if (typeof this.faceMesh.close === 'function') {
                    this.faceMesh.close();
                }
            } catch (error) {
                // Ignore cleanup errors
            }
            this.faceMesh = null;
        }
        
        // Reset states
        this.setFaceDetected(false);
        this.setShowPointer(false);
        this.ducks = [];
        this.score = 0;
        this.gameTime = 30;
        
        // Reset calibration system
        this.player.calibrated = false;
        this.isCalibrated = false;
        this.calibrationHistory = [];
        this.currentStabilityCount = 0;
        this.pendingRecalibration = false;
        
        this.updateUI();
    }

    endGame() {
        this.stopGame();
        this.showGameOver();
    }

    async resetGame() {
        this.hideGameOver();
        
        // Wait for cleanup
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Reset all states
        this.score = 0;
        this.gameTime = 30;
        this.ducks = [];
        this.setFaceDetected(false);
        this.setShowPointer(false);
        this.hideError();
        
        // Reset calibration system
        this.player.calibrated = false;
        this.isCalibrated = false;
        this.calibrationHistory = [];
        this.currentStabilityCount = 0;
        this.pendingRecalibration = false;
        
        this.updateUI();
        
        // Start fresh
        setTimeout(() => {
            this.startGame();
        }, 500);
    }

    // UI Update Methods
    updateUI() {
        this.updateScore();
        this.updateTime();
        this.updateButton();
    }

    updateScore() {
        this.scoreDisplay.textContent = this.score.toString().padStart(6, '0');
    }

    updateTime() {
        this.timeDisplay.textContent = this.gameTime.toString().padStart(2, '0');
    }

    updateButton() {
        if (this.isPlaying) {
            this.gameButton.textContent = 'STOP GAME';
            this.gameButton.className = 'game-button stop-button';
            this.gameButton.setAttribute('data-testid', 'button-stop-game');
        } else {
            this.gameButton.textContent = 'START CIVILIZATION';
            this.gameButton.className = 'game-button start-button';
            this.gameButton.setAttribute('data-testid', 'button-start-game');
        }
    }

    setFaceDetected(detected) {
        this.faceDetected = detected;
        if (detected) {
            this.statusDisplay.textContent = 'LOCKED';
            this.statusDisplay.className = 'stat-value status-value status-locked';
        } else {
            this.statusDisplay.textContent = 'SEARCHING';
            this.statusDisplay.className = 'stat-value status-value status-searching';
        }
    }



    setPointerPosition(x, y) {
        this.pointerPosition = { x, y };
        this.crosshair.style.left = `${(x / 640) * 100}%`;
        this.crosshair.style.top = `${(y / 480) * 100}%`;
    }

    setShowPointer(show) {
        this.showPointer = show;
        if (show) {
            this.crosshair.classList.add('visible');
        } else {
            this.crosshair.classList.remove('visible');
        }
    }

    showGameOver() {
        this.finalScore.textContent = `FINAL SCORE: ${this.score.toString().padStart(6, '0')}`;
        this.gameOverOverlay.classList.add('visible');
        
        // Trigger game over confetti celebration
        this.triggerGameOverConfetti();
    }

    hideGameOver() {
        this.gameOverOverlay.classList.remove('visible');
    }

    showError(message) {
        this.error = message;
        this.errorMessage.textContent = message;
        this.errorPanel.classList.add('visible');
    }

    hideError() {
        this.error = null;
        this.errorPanel.classList.remove('visible');
    }

    triggerStartGameConfetti() {
        // Quick burst to signal game start
        this.confetti.addConfetti({
            confettiColors: [
                '#FFD700', // Gold (civilization theme)
                '#FFA500', // Orange
                '#8B4513', // Brown (earth/terrain)
                '#228B22'  // Forest green
            ],
            confettiRadius: 4,
            confettiNumber: 30,
        });
    }

    triggerDuckHitConfetti() {
        // Create a burst of confetti with civilization themed colors
        this.confetti.addConfetti({
            confettiColors: [
                '#FFD700', // Gold (civilization theme)
                '#FFA500', // Orange
                '#8B4513', // Brown (earth/terrain)
                '#228B22', // Forest green
                '#CD853F', // Peru (sand/stone)
                '#DAA520'  // Goldenrod
            ],
            confettiRadius: 6,
            confettiNumber: 50,
        });
    }

    triggerGameOverConfetti() {
        // Special confetti burst for game completion
        if (this.score >= 100) {
            // Big celebration for high scores
            this.confetti.addConfetti({
                emojis: ['🏛️', '👑', '🏆', '⭐'],
                emojiSize: 50,
                confettiNumber: 30,
            });
        } else {
            // Standard completion confetti
            this.confetti.addConfetti({
                confettiColors: [
                    '#FFD700', // Gold
                    '#FFA500', // Orange
                    '#8B4513', // Brown
                    '#228B22'  // Forest green
                ],
                confettiRadius: 8,
                confettiNumber: 75,
            });
        }
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.duckHuntGame = new DuckHuntGame();
});