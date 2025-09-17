class QRScanner {
    constructor() {
        this.video = document.getElementById('video');
        this.canvas = document.createElement('canvas');
        this.context = this.canvas.getContext('2d');
        this.stream = null;
        this.isScanning = false;
        this.scanInterval = null;
        
        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        this.startBtn = document.getElementById('startScan');
        this.stopBtn = document.getElementById('stopScan');
        this.statusMessage = document.getElementById('statusMessage');
        this.loadingSpinner = document.querySelector('.loading-spinner');
        this.cameraPermissions = document.getElementById('cameraPermissions');
        this.successSound = document.getElementById('successSound');
        this.errorSound = document.getElementById('errorSound');
    }



    bindEvents() {
        this.startBtn.addEventListener('click', () => this.startScanning());
        this.stopBtn.addEventListener('click', () => this.stopScanning());

        // Auto-iniciar la cámara en dispositivos móviles
        if (this.isMobileDevice()) {
            setTimeout(() => this.startScanning(), 1000);
        }
    }

    isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    async startScanning() {
        try {
            this.showLoading(true);
            this.hideMessage();
            
            const constraints = {
                video: {
                    facingMode: 'environment', // Cámara trasera
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            };

            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.video.srcObject = this.stream;
            
            await new Promise((resolve) => {
                this.video.onloadedmetadata = resolve;
            });

            await this.video.play();
            
            this.canvas.width = this.video.videoWidth;
            this.canvas.height = this.video.videoHeight;
            
            this.isScanning = true;
            this.startBtn.style.display = 'none';
            this.stopBtn.style.display = 'inline-block';
            this.cameraPermissions.style.display = 'none';
            
            this.scanInterval = setInterval(() => this.scanFrame(), 100);
            this.showLoading(false);
            
        } catch (error) {
            console.error('Error accessing camera:', error);
            this.handleCameraError(error);
            this.showLoading(false);
        }
    }

    stopScanning() {
        this.isScanning = false;
        
        if (this.scanInterval) {
            clearInterval(this.scanInterval);
            this.scanInterval = null;
        }
        
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        
        this.video.srcObject = null;
        this.startBtn.style.display = 'inline-block';
        this.stopBtn.style.display = 'none';
    }

    scanFrame() {
        if (!this.isScanning || this.video.readyState !== this.video.HAVE_ENOUGH_DATA) {
            return;
        }

        this.context.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
        const imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
        
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        
        if (code && code.data) {
            this.processQRCode(code.data);
        }
    }

    async processQRCode(qrData) {
        if (!this.isScanning) return;
        
        this.stopScanning();
        this.showLoading(true);
        
        try {
            await this.verifyCode(qrData);
        } catch (error) {
            console.error('Error processing QR:', error);
            this.showMessage('Error al procesar el código QR', 'error');
            this.playSound('error');
        }
        
        this.showLoading(false);
    }

    async verifyCode(code) {
        try {
            const baseUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
                ? '' 
                : window.location.origin + '/';
                
            const response = await fetch(baseUrl + 'api/verify_qr.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code: code })
            });

            const data = await response.json();
            
            if (data.success) {
                this.showMessage('✅ QR Válido', 'success');
                this.playSound('success');
                
                // Registrar evento exitoso
                this.logScanEvent(code, true, 'QR Válido', data);
                
                // Vibrar en dispositivos móviles
                if ('vibrate' in navigator) {
                    navigator.vibrate([200, 100, 200]);
                }
                
            } else {
                this.showMessage('❌ No encontrado', 'error');
                this.playSound('error');
                
                // Registrar evento fallido
                this.logScanEvent(code, false, data.message || 'No encontrado');
                
                if ('vibrate' in navigator) {
                    navigator.vibrate([500, 200, 500]);
                }
            }
            
        } catch (error) {
            console.error('Verification error:', error);
            this.showMessage('Error de conexión. Intenta nuevamente.', 'error');
            this.playSound('error');
            
            // Registrar error de conexión
            this.logScanEvent(code, false, 'Error de conexión');
        }
        
        // Auto-reiniciar escaneo después de 3 segundos
        setTimeout(() => {
            if (!this.isScanning) {
                this.startScanning();
            }
        }, 3000);
    }



    handleCameraError(error) {
        console.error('Camera error:', error);
        
        if (error.name === 'NotAllowedError') {
            this.cameraPermissions.style.display = 'block';
            this.showMessage('Acceso a la cámara denegado. Por favor, permite el acceso para escanear códigos QR.', 'warning');
        } else if (error.name === 'NotFoundError') {
            this.showMessage('No se encontró ninguna cámara en el dispositivo.', 'error');
        } else if (error.name === 'NotSupportedError') {
            this.showMessage('El navegador no soporta el acceso a la cámara.', 'error');
        } else {
            this.showMessage('Error al acceder a la cámara: ' + error.message, 'error');
        }
        
        this.startBtn.style.display = 'inline-block';
        this.stopBtn.style.display = 'none';
    }

    showMessage(message, type) {
        this.statusMessage.innerHTML = message;
        this.statusMessage.className = `status-message status-${type}`;
        this.statusMessage.style.display = 'block';
        
        // Auto-ocultar mensajes después de 5 segundos
        setTimeout(() => {
            if (this.statusMessage.style.display === 'block') {
                this.hideMessage();
            }
        }, 5000);
    }

    hideMessage() {
        this.statusMessage.style.display = 'none';
    }

    showLoading(show) {
        this.loadingSpinner.style.display = show ? 'block' : 'none';
    }

    playSound(type) {
        try {
            if (type === 'success' && this.successSound) {
                this.successSound.play().catch(() => {});
            } else if (type === 'error' && this.errorSound) {
                this.errorSound.play().catch(() => {});
            }
        } catch (error) {
            console.log('Could not play sound:', error);
        }
    }

    async logScanEvent(qrCode, success, message, userInfo = null) {
        try {
            const baseUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
                ? '' 
                : window.location.origin + '/';

            await fetch(baseUrl + 'api/logger.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'log_scan',
                    qr_code: qrCode,
                    success: success,
                    message: message,
                    user_info: userInfo
                })
            });
        } catch (error) {
            console.log('Could not log scan event:', error);
        }
    }
}

// Inicializar el escáner cuando la página esté cargada
document.addEventListener('DOMContentLoaded', function() {
    const scanner = new QRScanner();
    
    // Hacer disponible globalmente para debugging
    window.qrScanner = scanner;
});

// Service Worker para funcionamiento offline (opcional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('sw.js').then(function(registration) {
            console.log('SW registered: ', registration);
        }).catch(function(registrationError) {
            console.log('SW registration failed: ', registrationError);
        });
    });
}