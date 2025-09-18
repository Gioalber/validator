class QRScanner {
    constructor() {
        this.video = document.getElementById('video');
        this.canvas = document.createElement('canvas');
        this.context = this.canvas.getContext('2d');
        this.stream = null;
        this.isScanning = false;
        this.scanInterval = null;
        
        this.init();
    }

    init() {
        this.startBtn = document.getElementById('startScan');
        this.stopBtn = document.getElementById('stopScan');
        this.statusMessage = document.getElementById('statusMessage');
        this.spinner = document.querySelector('.spinner');
        this.githubBanner = document.getElementById('githubPagesBanner');
        
        this.startBtn.addEventListener('click', () => this.startScanning());
        this.stopBtn.addEventListener('click', () => this.stopScanning());
        
        // Mostrar banner si es GitHub Pages
        if (window.location.hostname.includes('github.io')) {
            this.githubBanner.style.display = 'block';
        }
        
        // Auto-iniciar en móviles
        if (/Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
            setTimeout(() => this.startScanning(), 1000);
        }
    }

    async startScanning() {
        try {
            this.showSpinner(true);
            
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            
            this.video.srcObject = this.stream;
            await this.video.play();
            
            this.canvas.width = this.video.videoWidth;
            this.canvas.height = this.video.videoHeight;
            
            this.isScanning = true;
            this.startBtn.style.display = 'none';
            this.stopBtn.style.display = 'inline-block';
            
            this.scanInterval = setInterval(() => this.scanFrame(), 100);
            this.showSpinner(false);
            
        } catch (error) {
            this.showMessage('Error al acceder a la cámara', 'error');
            this.showSpinner(false);
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
            this.processCode(code.data);
        }
    }

    async processCode(qrData) {
        if (!this.isScanning) return;
        
        this.stopScanning();
        this.showSpinner(true);
        
        // Validación simple para GitHub Pages
        const validCodes = [
            'QR20250917_DEMO123456',
            'DEMO_GITHUB_PAGES_001', 
            'TEST_VALIDATOR_002',
            'VALID_QR_CODE_001',
            'VALID_QR_CODE_002'
        ];
        
        // Simular delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (validCodes.includes(qrData)) {
            this.showMessage('✅ QR Válido', 'success');
            this.logEvent(qrData, true);
        } else {
            this.showMessage('❌ No encontrado', 'error');
            this.logEvent(qrData, false);
        }
        
        this.showSpinner(false);
        
        // Auto-reiniciar después de 3 segundos
        setTimeout(() => {
            if (!this.isScanning) {
                this.startScanning();
            }
        }, 3000);
    }

    logEvent(code, success) {
        try {
            const logs = JSON.parse(localStorage.getItem('qr_scan_logs') || '[]');
            logs.unshift({
                timestamp: new Date().toISOString(),
                qr_code: code,
                success: success,
                message: success ? 'QR Válido' : 'No encontrado'
            });
            
            // Mantener solo últimos 100 logs
            if (logs.length > 100) logs.splice(100);
            
            localStorage.setItem('qr_scan_logs', JSON.stringify(logs));
        } catch (error) {
            console.log('No se pudo guardar el log');
        }
    }

    showMessage(text, type) {
        this.statusMessage.textContent = text;
        this.statusMessage.className = `status ${type}`;
        this.statusMessage.style.display = 'block';
        
        setTimeout(() => {
            this.statusMessage.style.display = 'none';
        }, 5000);
    }

    showSpinner(show) {
        this.spinner.style.display = show ? 'block' : 'none';
    }
}

// Inicializar cuando carga la página
document.addEventListener('DOMContentLoaded', () => {
    new QRScanner();
});