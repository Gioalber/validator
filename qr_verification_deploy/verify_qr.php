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

require_once '../config/database.php';

class QRVerification {
    private $db;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
    }

    public function verifyQR($qrCode) {
        try {
            // Validar entrada
            if (empty($qrCode)) {
                return $this->response(false, 'Código QR vacío');
            }

            // Buscar el código QR en la base de datos
            $query = "SELECT cq.*, u.nombre as user_name, u.email, u.empresa, 
                             c.nombre as training_name, c.fecha_inicio, c.fecha_fin, c.activa
                      FROM codigos_qr cq
                      JOIN usuarios u ON cq.usuario_id = u.id
                      JOIN capacitaciones c ON cq.capacitacion_id = c.id
                      WHERE cq.codigo = :codigo";

            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':codigo', $qrCode);
            $stmt->execute();

            $result = $stmt->fetch();

            if (!$result) {
                $this->logAccess($qrCode, false, 'Código QR no encontrado');
                return $this->response(false, 'Código QR no válido');
            }

            // Verificar si el código está activo
            if (!$result['activo']) {
                $this->logAccess($result['id'], false, 'Código QR desactivado');
                return $this->response(false, 'Código QR desactivado');
            }

            // Verificar si la capacitación está activa
            if (!$result['activa']) {
                $this->logAccess($result['id'], false, 'Capacitación inactiva');
                return $this->response(false, 'Capacitación no activa');
            }

            // Verificar fechas de la capacitación
            $today = date('Y-m-d');
            if ($today < $result['fecha_inicio']) {
                $this->logAccess($result['id'], false, 'Capacitación aún no ha comenzado');
                return $this->response(false, 'La capacitación aún no ha comenzado');
            }

            if ($today > $result['fecha_fin']) {
                $this->logAccess($result['id'], false, 'Capacitación ha finalizado');
                return $this->response(false, 'La capacitación ya ha finalizado');
            }

            // Verificar fecha de expiración del código QR
            if ($result['fecha_expiracion'] && $result['fecha_expiracion'] < date('Y-m-d H:i:s')) {
                $this->logAccess($result['id'], false, 'Código QR expirado');
                return $this->response(false, 'Código QR expirado');
            }

            // Verificar si no se ha usado recientemente (opcional - prevenir uso múltiple rápido)
            if ($this->isRecentlyUsed($result['id'])) {
                $this->logAccess($result['id'], false, 'Código usado recientemente');
                return $this->response(false, 'Código usado recientemente, espera un momento');
            }

            // Todo está bien, registrar acceso exitoso
            $this->logAccess($result['id'], true, 'Acceso concedido');

            return $this->response(true, 'Acceso concedido', [
                'user_name' => $result['user_name'],
                'user_email' => $result['email'],
                'company' => $result['empresa'],
                'training_name' => $result['training_name'],
                'expiration' => $result['fecha_expiracion'] ? 
                    date('d/m/Y H:i', strtotime($result['fecha_expiracion'])) : 
                    date('d/m/Y', strtotime($result['fecha_fin'])),
                'access_time' => date('d/m/Y H:i:s')
            ]);

        } catch (Exception $e) {
            error_log("Error in QR verification: " . $e->getMessage());
            return $this->response(false, 'Error interno del servidor');
        }
    }

    private function isRecentlyUsed($qrId) {
        $query = "SELECT COUNT(*) as count FROM registros_acceso 
                  WHERE codigo_qr_id = :qr_id 
                  AND acceso_concedido = 1 
                  AND created_at > DATE_SUB(NOW(), INTERVAL 30 SECOND)";
        
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':qr_id', $qrId);
        $stmt->execute();
        
        $result = $stmt->fetch();
        return $result['count'] > 0;
    }

    private function logAccess($qrCodeId, $granted, $reason = '') {
        try {
            $query = "INSERT INTO registros_acceso 
                      (codigo_qr_id, ip_address, user_agent, acceso_concedido, motivo_denegacion) 
                      VALUES (:qr_id, :ip, :user_agent, :granted, :reason)";

            $stmt = $this->db->prepare($query);
            
            // Si qrCodeId es un string (código no encontrado), usar NULL
            $qrId = is_numeric($qrCodeId) ? $qrCodeId : null;
            
            $stmt->bindParam(':qr_id', $qrId);
            $stmt->bindParam(':ip', $_SERVER['REMOTE_ADDR']);
            $stmt->bindParam(':user_agent', $_SERVER['HTTP_USER_AGENT'] ?? '');
            $stmt->bindParam(':granted', $granted, PDO::PARAM_BOOL);
            $stmt->bindParam(':reason', $granted ? null : $reason);
            
            $stmt->execute();
            
        } catch (Exception $e) {
            error_log("Error logging access: " . $e->getMessage());
        }
    }

    private function response($success, $message, $data = null) {
        $response = [
            'success' => $success,
            'message' => $message,
            'timestamp' => date('c')
        ];

        if ($data) {
            $response = array_merge($response, $data);
        }

        return $response;
    }

    public function getStats() {
        try {
            $query = "SELECT 
                        COUNT(*) as total_scans,
                        SUM(CASE WHEN acceso_concedido = 1 THEN 1 ELSE 0 END) as successful_scans,
                        SUM(CASE WHEN acceso_concedido = 0 THEN 1 ELSE 0 END) as denied_scans,
                        COUNT(DISTINCT DATE(created_at)) as active_days
                      FROM registros_acceso 
                      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)";

            $stmt = $this->db->prepare($query);
            $stmt->execute();

            return $stmt->fetch();

        } catch (Exception $e) {
            error_log("Error getting stats: " . $e->getMessage());
            return null;
        }
    }
}

// Manejar la solicitud
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['code'])) {
        echo json_encode(['success' => false, 'message' => 'Código no proporcionado']);
        exit();
    }

    $verification = new QRVerification();
    $result = $verification->verifyQR($input['code']);
    
    echo json_encode($result);
    
} else if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['stats'])) {
    $verification = new QRVerification();
    $stats = $verification->getStats();
    
    if ($stats) {
        echo json_encode(['success' => true, 'data' => $stats]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error obteniendo estadísticas']);
    }
    
} else {
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
}
?>