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
        this.leftEyeTracker = document.getElementById('leftEyeTracker');
        this.rightEyeTracker = document.getElementById('rightEyeTracker');

        // Game state
        this.isPlaying = false;
        this.score = 0;
        this.gameTime = 30;
        this.ducks = [];
        this.faceDetected = false;
        this.eyeLasers = null;
        this.showLaser = false;
        this.laserPosition = { x: 320, y: 240 };
        this.error = null;

        // MediaPipe and camera
        this.faceMesh = null;
        this.stream = null;

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

            console.log('Microphone permission granted');
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

    onFaceMeshResults(results) {
        if (!this.isPlaying) return;

        const faceCtx = this.faceCanvas.getContext('2d');
        faceCtx.save();
        faceCtx.clearRect(0, 0, this.faceCanvas.width, this.faceCanvas.height);

        if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
            const landmarks = results.multiFaceLandmarks[0];
            this.setFaceDetected(true);

            // Get eye positions (approximate center points)
            const leftEye = landmarks[159]; // Left eye center
            const rightEye = landmarks[386]; // Right eye center

            if (leftEye && rightEye) {
                // Convert normalized coordinates to canvas coordinates
                const leftEyeX = leftEye.x * this.faceCanvas.width;
                const leftEyeY = leftEye.y * this.faceCanvas.height;
                const rightEyeX = rightEye.x * this.faceCanvas.width;
                const rightEyeY = rightEye.y * this.faceCanvas.height;

                // Draw laser beams from eyes
                this.drawLaserBeams(faceCtx, leftEyeX, leftEyeY, rightEyeX, rightEyeY);

                // Update eye trackers and crosshair
                this.setEyeLasers({
                    left: { x: leftEyeX, y: leftEyeY },
                    right: { x: rightEyeX, y: rightEyeY }
                });

                // Calculate crosshair position (between eyes, projected forward)
                const centerX = (leftEyeX + rightEyeX) / 2;
                const centerY = (leftEyeY + rightEyeY) / 2;
                this.setLaserPosition(centerX, centerY);
                this.setShowLaser(true);

                // Check for duck hits
                this.checkDuckHits(centerX, centerY);
            }
        } else {
            this.setFaceDetected(false);
            this.setEyeLasers(null);
            this.setShowLaser(false);
        }

        faceCtx.restore();

        // Continue face mesh processing
        if (this.faceMesh && this.isPlaying) {
            this.faceMesh.send({ image: this.videoStream });
        }
    }

    drawLaserBeams(ctx, leftEyeX, leftEyeY, rightEyeX, rightEyeY) {
        // Calculate center position for laser targeting
        const centerX = (leftEyeX + rightEyeX) / 2;
        const centerY = (leftEyeY + rightEyeY) / 2;

        ctx.save();
        
        // Create laser beam effect
        const gradient = ctx.createLinearGradient(leftEyeX, leftEyeY, centerX, centerY);
        gradient.addColorStop(0, 'rgba(255, 0, 0, 0.8)');
        gradient.addColorStop(0.5, 'rgba(255, 100, 100, 0.6)');
        gradient.addColorStop(1, 'rgba(255, 0, 0, 0.2)');

        // Draw left eye laser
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 3;
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(leftEyeX, leftEyeY);
        ctx.lineTo(centerX, centerY);
        ctx.stroke();

        // Draw right eye laser
        const gradient2 = ctx.createLinearGradient(rightEyeX, rightEyeY, centerX, centerY);
        gradient2.addColorStop(0, 'rgba(255, 0, 0, 0.8)');
        gradient2.addColorStop(0.5, 'rgba(255, 100, 100, 0.6)');
        gradient2.addColorStop(1, 'rgba(255, 0, 0, 0.2)');

        ctx.strokeStyle = gradient2;
        ctx.beginPath();
        ctx.moveTo(rightEyeX, rightEyeY);
        ctx.lineTo(centerX, centerY);
        ctx.stroke();

        // Draw laser impact point
        ctx.fillStyle = '#ff0000';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    checkDuckHits(laserX, laserY) {
        // Convert face canvas coordinates to game canvas coordinates
        const gameCanvasRect = this.gameCanvas.getBoundingClientRect();
        const faceCanvasRect = this.faceCanvas.getBoundingClientRect();
        
        const scaleX = this.gameCanvas.width / this.faceCanvas.width;
        const scaleY = this.gameCanvas.height / this.faceCanvas.height;
        
        const gameLaserX = laserX * scaleX;
        const gameLaserY = laserY * scaleY;

        this.ducks.forEach(duck => {
            if (!duck.alive) return;

            const duckX = duck.x * this.gameCanvas.width;
            const duckY = duck.y * this.gameCanvas.height;
            const duckSize = duck.size * this.gameCanvas.width;

            const distance = Math.sqrt(
                Math.pow(gameLaserX - duckX, 2) + 
                Math.pow(gameLaserY - duckY, 2)
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