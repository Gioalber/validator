<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Manejar solicitudes OPTIONS para CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

class Logger {
    private $logDir;
    private $logFile;

    public function __construct() {
        // Crear directorio de logs si no existe
        $this->logDir = __DIR__ . '/../logs/';
        if (!file_exists($this->logDir)) {
            mkdir($this->logDir, 0755, true);
        }
        
        // Archivo de log diario
        $this->logFile = $this->logDir . 'scan_log_' . date('Y-m-d') . '.txt';
    }

    public function logScanAttempt($qrCode, $success, $message = '', $userInfo = null) {
        $timestamp = date('Y-m-d H:i:s');
        $ip = $this->getClientIP();
        $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown';
        
        $logEntry = [
            'timestamp' => $timestamp,
            'ip_address' => $ip,
            'qr_code' => $qrCode,
            'success' => $success ? 'SUCCESS' : 'FAILED',
            'message' => $message,
            'user_agent' => $userAgent
        ];

        if ($userInfo) {
            $logEntry['user_info'] = $userInfo;
        }

        $logLine = json_encode($logEntry) . "\n";
        
        // Escribir al archivo de log
        file_put_contents($this->logFile, $logLine, FILE_APPEND | LOCK_EX);
        
        return true;
    }

    public function getLogs($date = null, $limit = 100) {
        if ($date) {
            $targetFile = $this->logDir . 'scan_log_' . $date . '.txt';
        } else {
            $targetFile = $this->logFile;
        }

        if (!file_exists($targetFile)) {
            return [];
        }

        $lines = file($targetFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        $logs = [];

        // Obtener las últimas $limit líneas
        $startIndex = max(0, count($lines) - $limit);
        for ($i = $startIndex; $i < count($lines); $i++) {
            $decoded = json_decode($lines[$i], true);
            if ($decoded) {
                $logs[] = $decoded;
            }
        }

        return array_reverse($logs); // Más recientes primero
    }

    public function getStats($date = null) {
        $logs = $this->getLogs($date, 10000); // Obtener más logs para estadísticas
        
        $stats = [
            'total_scans' => count($logs),
            'successful_scans' => 0,
            'failed_scans' => 0,
            'unique_ips' => [],
            'last_scan' => null,
            'hourly_distribution' => array_fill(0, 24, 0)
        ];

        foreach ($logs as $log) {
            if ($log['success'] === 'SUCCESS') {
                $stats['successful_scans']++;
            } else {
                $stats['failed_scans']++;
            }

            $stats['unique_ips'][$log['ip_address']] = true;
            
            if (!$stats['last_scan'] || $log['timestamp'] > $stats['last_scan']) {
                $stats['last_scan'] = $log['timestamp'];
            }

            // Distribución por hora
            $hour = (int) date('H', strtotime($log['timestamp']));
            $stats['hourly_distribution'][$hour]++;
        }

        $stats['unique_ips'] = count($stats['unique_ips']);
        
        return $stats;
    }

    private function getClientIP() {
        $ipKeys = ['HTTP_CF_CONNECTING_IP', 'HTTP_CLIENT_IP', 'HTTP_X_FORWARDED_FOR', 'REMOTE_ADDR'];
        
        foreach ($ipKeys as $key) {
            if (!empty($_SERVER[$key])) {
                $ip = $_SERVER[$key];
                if (strpos($ip, ',') !== false) {
                    $ip = explode(',', $ip)[0];
                }
                return trim($ip);
            }
        }
        
        return 'Unknown';
    }
}

// Manejar solicitudes
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? '';
    
    $logger = new Logger();
    
    switch ($action) {
        case 'log_scan':
            $qrCode = $input['qr_code'] ?? '';
            $success = $input['success'] ?? false;
            $message = $input['message'] ?? '';
            $userInfo = $input['user_info'] ?? null;
            
            $result = $logger->logScanAttempt($qrCode, $success, $message, $userInfo);
            echo json_encode(['success' => $result]);
            break;
            
        case 'get_logs':
            $date = $input['date'] ?? null;
            $limit = $input['limit'] ?? 100;
            $logs = $logger->getLogs($date, $limit);
            echo json_encode(['success' => true, 'logs' => $logs]);
            break;
            
        case 'get_stats':
            $date = $input['date'] ?? null;
            $stats = $logger->getStats($date);
            echo json_encode(['success' => true, 'stats' => $stats]);
            break;
            
        default:
            echo json_encode(['success' => false, 'message' => 'Acción no válida']);
            break;
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
}
?>