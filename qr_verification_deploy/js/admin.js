class AdminPanel {
    constructor() {
                // Determinar la URL base según el entorno
            const baseUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
                ? '../' 
                : 'https://cisscad.css.gob.pa/qr_verification/';
                
            const statsResponse = await fetch(baseUrl + 'api/admin.php?action=stats');
            const stats = await statsResponse.json();

            if (stats.success) {
                document.getElementById('total-scans').textContent = stats.data.total_scans || 0;
                document.getElementById('successful-scans').textContent = stats.data.successful_scans || 0;
                document.getElementById('denied-scans').textContent = stats.data.denied_scans || 0;
                document.getElementById('active-codes').textContent = stats.data.active_codes || 0;
            }

            // Load recent activity
            const activityResponse = await fetch(baseUrl + 'api/admin.php?action=recent_activity');rentSection = 'dashboard';
        this.init();
    }

    init() {
        this.loadDashboard();
        this.bindEvents();
        this.loadUsers();
        this.loadTrainings();
    }

    bindEvents() {
        // QR Generation Form
        document.getElementById('qr-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.generateQR();
        });

        // User Form
        document.getElementById('user-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveUser();
        });

        // Training Form
        document.getElementById('training-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveTraining();
        });

        // Auto-refresh dashboard every 30 seconds
        setInterval(() => {
            if (this.currentSection === 'dashboard') {
                this.loadDashboard();
            }
        }, 30000);
    }

    async loadDashboard() {
        try {
            // Load statistics
            const statsResponse = await fetch('../api/admin.php?action=stats');
            const stats = await statsResponse.json();

            if (stats.success) {
                document.getElementById('total-scans').textContent = stats.data.total_scans || 0;
                document.getElementById('successful-scans').textContent = stats.data.successful_scans || 0;
                document.getElementById('denied-scans').textContent = stats.data.denied_scans || 0;
                document.getElementById('active-codes').textContent = stats.data.active_codes || 0;
            }

            // Load recent activity
            const activityResponse = await fetch('../api/admin.php?action=recent_activity');
            const activity = await activityResponse.json();

            if (activity.success) {
                this.renderRecentActivity(activity.data);
            }

            // Load expiring codes
            const expiringResponse = await fetch('../api/admin.php?action=expiring_codes');
            const expiring = await expiringResponse.json();

            if (expiring.success) {
                this.renderExpiringCodes(expiring.data);
            }

        } catch (error) {
            console.error('Error loading dashboard:', error);
            this.showAlert('Error cargando el dashboard', 'danger');
        }
    }

    renderRecentActivity(activities) {
        const container = document.getElementById('recent-activity');
        
        if (!activities || activities.length === 0) {
            container.innerHTML = '<p class="text-muted">No hay actividad reciente</p>';
            return;
        }

        const html = activities.map(activity => {
            const statusClass = activity.acceso_concedido ? 'text-success' : 'text-danger';
            const statusIcon = activity.acceso_concedido ? 'fa-check' : 'fa-times';
            const time = new Date(activity.created_at).toLocaleString('es-ES');

            return `
                <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
                    <div>
                        <strong>${activity.user_name || 'Usuario desconocido'}</strong><br>
                        <small class="text-muted">${activity.training_name || 'Sin capacitación'}</small>
                    </div>
                    <div class="text-end">
                        <i class="fas ${statusIcon} ${statusClass}"></i><br>
                        <small class="text-muted">${time}</small>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = html;
    }

    renderExpiringCodes(codes) {
        const container = document.getElementById('expiring-codes');
        
        if (!codes || codes.length === 0) {
            container.innerHTML = '<p class="text-muted">No hay códigos próximos a vencer</p>';
            return;
        }

        const html = codes.map(code => {
            const expiration = new Date(code.fecha_expiracion).toLocaleString('es-ES');
            const daysLeft = Math.ceil((new Date(code.fecha_expiracion) - new Date()) / (1000 * 60 * 60 * 24));

            return `
                <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
                    <div>
                        <strong>${code.user_name}</strong><br>
                        <small class="text-muted">${code.training_name}</small>
                    </div>
                    <div class="text-end">
                        <span class="badge bg-warning">${daysLeft} días</span><br>
                        <small class="text-muted">${expiration}</small>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = html;
    }

    async loadUsers() {
        try {
            const response = await fetch('../api/admin.php?action=get_users');
            const result = await response.json();

            if (result.success) {
                this.renderUsersTable(result.data);
                this.populateUserSelect(result.data);
            }
        } catch (error) {
            console.error('Error loading users:', error);
        }
    }

    async loadTrainings() {
        try {
            const response = await fetch('../api/admin.php?action=get_trainings');
            const result = await response.json();

            if (result.success) {
                this.renderTrainingsTable(result.data);
                this.populateTrainingSelect(result.data);
            }
        } catch (error) {
            console.error('Error loading trainings:', error);
        }
    }

    renderUsersTable(users) {
        const tbody = document.querySelector('#users-table tbody');
        
        const html = users.map(user => `
            <tr>
                <td>${user.id}</td>
                <td>${user.nombre}</td>
                <td>${user.email}</td>
                <td>${user.empresa || '-'}</td>
                <td>${user.telefono || '-'}</td>
                <td>${new Date(user.created_at).toLocaleDateString('es-ES')}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="adminPanel.editUser(${user.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="adminPanel.deleteUser(${user.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        tbody.innerHTML = html;
    }

    renderTrainingsTable(trainings) {
        const tbody = document.querySelector('#trainings-table tbody');
        
        const html = trainings.map(training => {
            const statusBadge = training.activa ? 
                '<span class="badge bg-success">Activa</span>' : 
                '<span class="badge bg-secondary">Inactiva</span>';

            return `
                <tr>
                    <td>${training.id}</td>
                    <td>${training.nombre}</td>
                    <td>${training.descripcion || '-'}</td>
                    <td>${new Date(training.fecha_inicio).toLocaleDateString('es-ES')}</td>
                    <td>${new Date(training.fecha_fin).toLocaleDateString('es-ES')}</td>
                    <td>${statusBadge}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary" onclick="adminPanel.editTraining(${training.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-${training.activa ? 'warning' : 'success'}" 
                                onclick="adminPanel.toggleTraining(${training.id}, ${!training.activa})">
                            <i class="fas fa-${training.activa ? 'pause' : 'play'}"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        tbody.innerHTML = html;
    }

    populateUserSelect(users) {
        const select = document.getElementById('user-select');
        const currentValue = select.value;
        
        select.innerHTML = '<option value="">Seleccionar usuario...</option>';
        
        users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = `${user.nombre} - ${user.empresa || 'Sin empresa'}`;
            select.appendChild(option);
        });

        select.value = currentValue;
    }

    populateTrainingSelect(trainings) {
        const select = document.getElementById('training-select');
        const currentValue = select.value;
        
        select.innerHTML = '<option value="">Seleccionar capacitación...</option>';
        
        trainings.filter(training => training.activa).forEach(training => {
            const option = document.createElement('option');
            option.value = training.id;
            option.textContent = training.nombre;
            select.appendChild(option);
        });

        select.value = currentValue;
    }

    async generateQR() {
        const userId = document.getElementById('user-select').value;
        const trainingId = document.getElementById('training-select').value;
        const expirationDate = document.getElementById('expiration-date').value;

        if (!userId || !trainingId) {
            this.showAlert('Por favor selecciona usuario y capacitación', 'warning');
            return;
        }

        try {
            const response = await fetch('../api/admin.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'generate_qr',
                    user_id: userId,
                    training_id: trainingId,
                    expiration_date: expirationDate || null
                })
            });

            const result = await response.json();

            if (result.success) {
                this.displayQR(result.data.qr_code);
                this.showAlert('Código QR generado exitosamente', 'success');
            } else {
                this.showAlert(result.message, 'danger');
            }

        } catch (error) {
            console.error('Error generating QR:', error);
            this.showAlert('Error generando código QR', 'danger');
        }
    }

    async displayQR(qrCode) {
        const canvas = document.createElement('canvas');
        const container = document.getElementById('qr-canvas');
        
        container.innerHTML = '';
        container.appendChild(canvas);

        await QRCode.toCanvas(canvas, qrCode, {
            width: 256,
            height: 256,
            colorDark: '#000000',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.M
        });

        document.getElementById('qr-code-text').textContent = qrCode;
        document.getElementById('qr-result').style.display = 'block';

        // Store for download
        window.currentQRCode = qrCode;
        window.currentQRCanvas = canvas;
    }

    async saveUser() {
        const userData = {
            action: 'save_user',
            nombre: document.getElementById('user-name').value,
            email: document.getElementById('user-email').value,
            telefono: document.getElementById('user-phone').value,
            empresa: document.getElementById('user-company').value
        };

        try {
            const response = await fetch('../api/admin.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });

            const result = await response.json();

            if (result.success) {
                this.showAlert('Usuario guardado exitosamente', 'success');
                document.getElementById('user-form').reset();
                bootstrap.Modal.getInstance(document.getElementById('userModal')).hide();
                this.loadUsers();
            } else {
                this.showAlert(result.message, 'danger');
            }

        } catch (error) {
            console.error('Error saving user:', error);
            this.showAlert('Error guardando usuario', 'danger');
        }
    }

    async saveTraining() {
        const trainingData = {
            action: 'save_training',
            nombre: document.getElementById('training-name').value,
            descripcion: document.getElementById('training-description').value,
            fecha_inicio: document.getElementById('training-start').value,
            fecha_fin: document.getElementById('training-end').value
        };

        try {
            const response = await fetch('../api/admin.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(trainingData)
            });

            const result = await response.json();

            if (result.success) {
                this.showAlert('Capacitación guardada exitosamente', 'success');
                document.getElementById('training-form').reset();
                bootstrap.Modal.getInstance(document.getElementById('trainingModal')).hide();
                this.loadTrainings();
            } else {
                this.showAlert(result.message, 'danger');
            }

        } catch (error) {
            console.error('Error saving training:', error);
            this.showAlert('Error guardando capacitación', 'danger');
        }
    }

    showAlert(message, type) {
        const alertsContainer = document.getElementById('alerts-container');
        const alertId = 'alert-' + Date.now();
        
        const alertHTML = `
            <div id="${alertId}" class="alert alert-${type} alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        
        alertsContainer.insertAdjacentHTML('beforeend', alertHTML);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            const alert = document.getElementById(alertId);
            if (alert) {
                bootstrap.Alert.getInstance(alert)?.close();
            }
        }, 5000);
    }

    // Section management
    showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.main-content').forEach(section => {
            section.style.display = 'none';
        });

        // Remove active class from all nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // Show selected section
        document.getElementById(sectionName + '-section').style.display = 'block';

        // Add active class to clicked nav link
        event.target.classList.add('active');

        this.currentSection = sectionName;

        // Load section-specific data
        if (sectionName === 'dashboard') {
            this.loadDashboard();
        } else if (sectionName === 'access-log') {
            this.loadAccessLog();
        }
    }

    async loadAccessLog() {
        try {
            const response = await fetch('../api/admin.php?action=access_log');
            const result = await response.json();

            if (result.success) {
                this.renderAccessLogTable(result.data);
            }
        } catch (error) {
            console.error('Error loading access log:', error);
        }
    }

    renderAccessLogTable(logs) {
        const tbody = document.querySelector('#access-log-table tbody');
        
        const html = logs.map(log => {
            const statusBadge = log.acceso_concedido ? 
                '<span class="badge bg-success">Concedido</span>' : 
                '<span class="badge bg-danger">Denegado</span>';

            return `
                <tr>
                    <td>${new Date(log.created_at).toLocaleString('es-ES')}</td>
                    <td>${log.user_name || 'Desconocido'}</td>
                    <td>${log.training_name || 'N/A'}</td>
                    <td>${statusBadge}</td>
                    <td>${log.ip_address || 'N/A'}</td>
                    <td>${log.motivo_denegacion || '-'}</td>
                </tr>
            `;
        }).join('');

        tbody.innerHTML = html;
    }
}

// Global functions
function showSection(sectionName) {
    adminPanel.showSection(sectionName);
}

function downloadQR() {
    if (window.currentQRCanvas && window.currentQRCode) {
        const link = document.createElement('a');
        link.download = `qr-code-${window.currentQRCode}.png`;
        link.href = window.currentQRCanvas.toDataURL();
        link.click();
    }
}

function filterAccessLog() {
    // Implementation for filtering access log
    adminPanel.loadAccessLog();
}

// Initialize admin panel
let adminPanel;
document.addEventListener('DOMContentLoaded', function() {
    adminPanel = new AdminPanel();
});