// Demo data for GitHub Pages (since we can't use PHP/MySQL there)
class DemoData {
    static getUsers() {
        return [
            {id: 1, nombre: 'Juan Pérez', email: 'juan@demo.com', empresa: 'Demo Corp'},
            {id: 2, nombre: 'María González', email: 'maria@demo.com', empresa: 'Test Inc'},
            {id: 3, nombre: 'Carlos Rodríguez', email: 'carlos@demo.com', empresa: 'Sample LLC'}
        ];
    }
    
    static getTrainings() {
        return [
            {id: 1, nombre: 'Seguridad Industrial', activa: true},
            {id: 2, nombre: 'Manejo de Equipos', activa: true}
        ];
    }
    
    static getValidCodes() {
        return [
            'QR20250917_DEMO123456',
            'QR20250917_TEST789012', 
            'QR20250917_GITHUB345678',
            'DEMO_GITHUB_PAGES_001',
            'TEST_VALIDATOR_002'
        ];
    }
    
    static verifyCode(code) {
        const validCodes = this.getValidCodes();
        const users = this.getUsers();
        const trainings = this.getTrainings();
        
        if (validCodes.includes(code)) {
            const userIndex = Math.floor(Math.random() * users.length);
            const trainingIndex = Math.floor(Math.random() * trainings.length);
            
            return {
                success: true,
                user_name: users[userIndex].nombre,
                user_email: users[userIndex].email,
                company: users[userIndex].empresa,
                training_name: trainings[trainingIndex].nombre,
                expiration: '31/12/2025 23:59',
                access_time: new Date().toLocaleString('es-ES'),
                message: 'DEMO: Acceso concedido'
            };
        }
        
        return {
            success: false,
            message: 'Código QR no válido para demo. Códigos válidos: ' + validCodes.join(', ')
        };
    }
    
    static isDemoMode() {
        return window.location.hostname.includes('github.io') || 
               window.location.hostname === 'localhost' ||
               window.location.search.includes('demo=true');
    }
}