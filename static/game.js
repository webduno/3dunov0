// Duck Hunt Game - Pure JavaScript Implementation
class DuckHuntGame {
    constructor() {
        // Game state
        this.isPlaying = false;
        this.score = 0;
        this.gameTime = 30;
        this.ducks = [];
        this.faceDetected = false;
        this.isListening = false;
        this.recognitionStarted = false;
        this.showLaser = false;
        this.laserPosition = { x: 0, y: 0 };
        this.eyeLasers = null;
        this.error = null;
        this.fallbackMode = false;

        // Initialize confetti
        this.confetti = new JSConfetti();

        // References
        this.gameLoopId = null;
        this.gameTimerId = null;
        this.spawnTimerId = null;
        this.faceMesh = null;
        this.camera = null;
        this.stream = null;
        this.recognition = null;

        // DOM elements
        this.gameButton = document.getElementById('gameButton');
        this.scoreDisplay = document.getElementById('scoreDisplay');
        this.timeDisplay = document.getElementById('timeDisplay');
        this.statusDisplay = document.getElementById('statusDisplay');
        this.voiceIndicator = document.getElementById('voiceIndicator');
        this.videoStream = document.getElementById('videoStream');
        this.faceCanvas = document.getElementById('faceCanvas');
        this.gameCanvas = document.getElementById('gameCanvas');
        this.leftEyeTracker = document.getElementById('leftEyeTracker');
        this.rightEyeTracker = document.getElementById('rightEyeTracker');
        this.crosshair = document.getElementById('crosshair');
        this.gameOverOverlay = document.getElementById('gameOverOverlay');
        this.finalScore = document.getElementById('finalScore');
        this.playAgainButton = document.getElementById('playAgainButton');
        this.errorPanel = document.getElementById('errorPanel');
        this.errorMessage = document.getElementById('errorMessage');

        // Initialize
        this.init();
    }

    init() {
        // Event listeners
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

        // Request microphone permission and start speech recognition
        this.requestMicrophonePermission();
        this.initSpeechRecognition();
    }

    async requestMicrophonePermission() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            // Stop the stream immediately, we just needed permission
            stream.getTracks().forEach(track => track.stop());
            console.log('Microphone permission granted');
        } catch (error) {
            console.log('Microphone permission denied or not available:', error);
        }
    }

    initSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.log('Speech recognition not supported');
            return;
        }

        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US';

        this.recognition.onresult = (event) => {
            const last = event.results.length - 1;
            const command = event.results[last][0].transcript.toLowerCase().trim();
            
            if (command.includes('start') && !this.isPlaying) {
                console.log('Voice command: Starting game');
                this.startGame();
            }
        };

        this.recognition.onerror = (event) => {
            console.log('Speech recognition error:', event.error);
        };

        this.recognition.onstart = () => {
            this.recognitionStarted = true;
            this.voiceIndicator.classList.add('active');
        };

        this.recognition.onend = () => {
            this.recognitionStarted = false;
            this.voiceIndicator.classList.remove('active');
            if (this.isListening) {
                setTimeout(() => {
                    if (this.isListening && this.recognition && !this.recognitionStarted) {
                        try {
                            this.recognition.start();
                        } catch (error) {
                            console.log('Speech recognition restart error:', error);
                        }
                    }
                }, 100);
            }
        };

        // Start listening after a delay
        setTimeout(() => {
            this.startListening();
        }, 500);
    }

    startListening() {
        if (this.recognition && !this.isListening && !this.recognitionStarted) {
            try {
                this.isListening = true;
                this.recognition.start();
            } catch (error) {
                console.log('Speech recognition start error:', error);
                this.isListening = false;
            }
        }
    }

    stopListening() {
        this.isListening = false;
        this.voiceIndicator.classList.remove('active');
        if (this.recognition && this.recognitionStarted) {
            try {
                this.recognition.stop();
            } catch (error) {
                console.log('Speech recognition stop error:', error);
            }
        }
    }

    async initializeFaceMesh() {
        if (!this.faceCanvas) return;

        // Clean up existing instance
        if (this.faceMesh) {
            try {
                if (typeof this.faceMesh.close === 'function') {
                    this.faceMesh.close();
                }
            } catch (error) {
                // Ignore cleanup errors
            }
            this.faceMesh = null;
            await new Promise(resolve => setTimeout(resolve, 200));
        }

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

            this.faceMesh.onResults((results) => this.onFaceResults(results));
        } catch (error) {
            console.log('FaceMesh initialization error:', error);
            this.showError('Face tracking initialization failed. Please refresh the page.');
        }
    }

    onFaceResults(results) {
        if (!this.faceCanvas || !this.gameCanvas) return;

        const canvasCtx = this.faceCanvas.getContext('2d');
        if (!canvasCtx) return;

        // Clear the overlay canvas
        canvasCtx.save();
        canvasCtx.clearRect(0, 0, this.faceCanvas.width, this.faceCanvas.height);

        if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
            this.setFaceDetected(true);
            
            const landmarks = results.multiFaceLandmarks[0];
            
            // Get key face landmarks for orientation calculation
            const noseTip = landmarks[1];        // Nose tip
            const leftEye = landmarks[468];      // Left eye center
            const rightEye = landmarks[473];     // Right eye center
            const chin = landmarks[175];         // Chin center
            
            if (noseTip && leftEye && rightEye && chin) {
                // Calculate face center
                const faceCenterX = (leftEye.x + rightEye.x) / 2;
                const faceCenterY = (leftEye.y + rightEye.y) / 2;
                
                // Calculate face orientation using nose position
                const eyeMidpointX = (leftEye.x + rightEye.x) / 2;
                const eyeMidpointY = (leftEye.y + rightEye.y) / 2;
                
                // Calculate horizontal rotation based on nose position
                const noseOffsetX = noseTip.x - eyeMidpointX;
                const eyeSpan = Math.abs(rightEye.x - leftEye.x);
                
                // Normalize and amplify the rotation for better sensitivity
                const horizontalRotation = (noseOffsetX / eyeSpan) * 2;
                
                // Calculate vertical rotation using nose-to-eye distance
                const noseOffsetY = noseTip.y - eyeMidpointY;
                const faceHeight = Math.abs(chin.y - eyeMidpointY);
                const verticalRotation = (noseOffsetY / faceHeight) * 1.5;
                
                // Convert face center to screen coordinates
                const faceScreenX = eyeMidpointX * this.faceCanvas.width;
                const faceScreenY = eyeMidpointY * this.faceCanvas.height;
                
                // Calculate targeting position with proper sensitivity
                const targetingDistance = 250;
                // Mirror X coordinate for game canvas (video is mirrored)
                const targetX = this.faceCanvas.width - (faceScreenX + (horizontalRotation * targetingDistance));
                const targetY = faceScreenY + (verticalRotation * targetingDistance);
                
                // Set eye laser positions for visual feedback
                const leftEyeX = leftEye.x * this.faceCanvas.width;
                const leftEyeY = leftEye.y * this.faceCanvas.height;
                const rightEyeX = rightEye.x * this.faceCanvas.width;
                const rightEyeY = rightEye.y * this.faceCanvas.height;
                
                this.setEyeLasers({
                    left: { x: leftEyeX, y: leftEyeY },
                    right: { x: rightEyeX, y: rightEyeY }
                });
                
                // Update crosshair position
                this.setLaserPosition(targetX, targetY);
                this.setShowLaser(true);

                // Draw eye points on canvas
                canvasCtx.fillStyle = '#ff0000';
                canvasCtx.beginPath();
                canvasCtx.arc(leftEyeX, leftEyeY, 4, 0, Math.PI * 2);
                canvasCtx.fill();
                
                canvasCtx.beginPath();
                canvasCtx.arc(rightEyeX, rightEyeY, 4, 0, Math.PI * 2);
                canvasCtx.fill();

                // Check for duck hits
                this.checkDuckHits(targetX, targetY);
            }
        } else {
            this.setFaceDetected(false);
            this.setShowLaser(false);
            this.setEyeLasers(null);
        }

        canvasCtx.restore();
    }

    checkDuckHits(x, y) {
        const hitRadius = 50;
        
        this.ducks.forEach(duck => {
            if (!duck.alive) return;

            const duckX = duck.x * this.gameCanvas.width;
            const duckY = duck.y * this.gameCanvas.height;
            const distance = Math.sqrt((x - duckX) ** 2 + (y - duckY) ** 2);

            if (distance < hitRadius) {
                duck.alive = false;
                duck.hitTime = Date.now();
                this.score += 10;
                this.updateScore();
                
                // Trigger confetti effect for hitting a duck
                this.triggerDuckHitConfetti();
            }
        });
    }

    async initializeCamera() {
        try {
            if (!this.videoStream || !this.faceMesh) return;

            // Check if we're on HTTPS or localhost (required for camera access)
            const isSecure = location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
            if (!isSecure) {
                throw new Error('Camera access requires HTTPS or localhost. Current protocol: ' + location.protocol);
            }

            // Check if navigator.mediaDevices is available
            if (!navigator.mediaDevices) {
                throw new Error('MediaDevices API not supported in this browser');
            }

            if (!navigator.mediaDevices.getUserMedia) {
                throw new Error('getUserMedia not supported in this browser');
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480 }
            });

            this.stream = stream;
            this.videoStream.srcObject = stream;

            // Wait for video to be ready
            await new Promise((resolve) => {
                this.videoStream.onloadedmetadata = () => {
                    resolve();
                };
            });

            // Start the face detection loop using requestAnimationFrame
            this.startFaceDetectionLoop();

        } catch (err) {
            this.showError(`Camera initialization failed: ${err.message}`);
        }
    }

    startFaceDetectionLoop() {
        const detectFaces = async () => {
            if (this.faceMesh && this.videoStream && this.videoStream.readyState === 4) {
                try {
                    await this.faceMesh.send({ image: this.videoStream });
                } catch (error) {
                    console.log('Face detection error:', error);
                }
            }
            
            if (this.isPlaying) {
                requestAnimationFrame(detectFaces);
            }
        };
        
        detectFaces();
    }

    spawnDuck() {
        const newDuck = {
            id: Date.now() + Math.random(),
            x: Math.random() < 0.5 ? -0.1 : 1.1,
            y: 0.2 + Math.random() * 0.6,
            vx: (Math.random() < 0.5 ? 1 : -1) * (0.002 + Math.random() * 0.003),
            vy: (Math.random() - 0.5) * 0.001,
            size: 0.08 + Math.random() * 0.04,
            alive: true
        };

        this.ducks.push(newDuck);
    }

    gameLoop() {
        if (!this.gameCanvas) return;

        const canvas = this.gameCanvas;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
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
        this.setEyeLasers(null);
        this.setShowLaser(false);
        this.ducks = [];
        this.score = 0;
        this.gameTime = 30;
        
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
        this.setEyeLasers(null);
        this.setShowLaser(false);
        this.hideError();
        
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
            this.gameButton.textContent = 'START DUCK HUNT';
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

    setEyeLasers(lasers) {
        this.eyeLasers = lasers;
        if (lasers) {
            this.leftEyeTracker.style.left = `${(lasers.left.x / 640) * 100}%`;
            this.leftEyeTracker.style.top = `${(lasers.left.y / 480) * 100}%`;
            this.rightEyeTracker.style.left = `${(lasers.right.x / 640) * 100}%`;
            this.rightEyeTracker.style.top = `${(lasers.right.y / 480) * 100}%`;
            this.leftEyeTracker.classList.add('visible');
            this.rightEyeTracker.classList.add('visible');
        } else {
            this.leftEyeTracker.classList.remove('visible');
            this.rightEyeTracker.classList.remove('visible');
        }
    }

    setLaserPosition(x, y) {
        this.laserPosition = { x, y };
        this.crosshair.style.left = `${(x / 640) * 100}%`;
        this.crosshair.style.top = `${(y / 480) * 100}%`;
    }

    setShowLaser(show) {
        this.showLaser = show;
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
                '#FFA500', // Orange (game theme)
                '#00FF00', // Green
                '#FFFF00'  // Yellow
            ],
            confettiRadius: 4,
            confettiNumber: 30,
        });
    }

    triggerDuckHitConfetti() {
        // Create a burst of confetti with duck hunt themed colors
        this.confetti.addConfetti({
            confettiColors: [
                '#FFA500', // Orange (game theme)
                '#00FF00', // Green (score color)
                '#FFFF00', // Yellow (time color)
                '#8B4513', // Brown (duck color)
                '#228B22', // Forest green
                '#FFD700'  // Gold
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
                emojis: ['🦆', '🎯', '🏆', '⭐'],
                emojiSize: 50,
                confettiNumber: 30,
            });
        } else {
            // Standard completion confetti
            this.confetti.addConfetti({
                confettiColors: [
                    '#FFA500', // Orange
                    '#00FF00', // Green
                    '#FFFF00', // Yellow
                    '#FFD700'  // Gold
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