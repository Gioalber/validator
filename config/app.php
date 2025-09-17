// Configuración automática según el entorno de despliegue
class AppConfig {
    public static function getConfig() {
        $hostname = $_SERVER['HTTP_HOST'] ?? 'localhost';
        $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
        
        $config = [
            'app_name' => 'QR Validator System',
            'version' => '1.0.0',
            'protocol' => $protocol,
            'hostname' => $hostname,
        ];
        
        // Configuración según el entorno
        if (strpos($hostname, 'github.io') !== false) {
            // GitHub Pages - Solo frontend
            $config['environment'] = 'github_pages';
            $config['base_url'] = 'https://gioalber.github.io/validator/';
            $config['demo_mode'] = true;
            $config['api_enabled'] = false;
            
        } elseif (strpos($hostname, 'localhost') !== false || strpos($hostname, '127.0.0.1') !== false) {
            // Desarrollo local
            $config['environment'] = 'development';
            $config['base_url'] = 'http://localhost/qr_verification/';
            $config['demo_mode'] = false;
            $config['api_enabled'] = true;
            $config['debug'] = true;
            
        } else {
            // Producción
            $config['environment'] = 'production';
            $config['base_url'] = $protocol . '://' . $hostname . '/';
            $config['demo_mode'] = false;
            $config['api_enabled'] = true;
            $config['debug'] = false;
        }
        
        return $config;
    }
    
    public static function isDemoMode() {
        return self::getConfig()['demo_mode'] ?? false;
    }
    
    public static function isApiEnabled() {
        return self::getConfig()['api_enabled'] ?? false;
    }
}
?>