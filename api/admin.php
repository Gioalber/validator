<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';

class AdminAPI {
    private $db;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
    }

    public function handleRequest() {
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            return $this->handleGetRequest();
        } else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            return $this->handlePostRequest();
        } else {
            return ['success' => false, 'message' => 'Método no permitido'];
        }
    }

    private function handleGetRequest() {
        $action = $_GET['action'] ?? '';

        switch ($action) {
            case 'stats':
                return $this->getStats();
            case 'recent_activity':
                return $this->getRecentActivity();
            case 'expiring_codes':
                return $this->getExpiringCodes();
            case 'get_users':
                return $this->getUsers();
            case 'get_trainings':
                return $this->getTrainings();
            case 'access_log':
                return $this->getAccessLog();
            default:
                return ['success' => false, 'message' => 'Acción no válida'];
        }
    }

    private function handlePostRequest() {
        $input = json_decode(file_get_contents('php://input'), true);
        $action = $input['action'] ?? '';

        switch ($action) {
            case 'generate_qr':
                return $this->generateQR($input);
            case 'save_user':
                return $this->saveUser($input);
            case 'save_training':
                return $this->saveTraining($input);
            default:
                return ['success' => false, 'message' => 'Acción no válida'];
        }
    }

    private function getStats() {
        try {
            // Estadísticas generales
            $query = "SELECT 
                        COUNT(*) as total_scans,
                        SUM(CASE WHEN acceso_concedido = 1 THEN 1 ELSE 0 END) as successful_scans,
                        SUM(CASE WHEN acceso_concedido = 0 THEN 1 ELSE 0 END) as denied_scans
                      FROM registros_acceso 
                      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)";

            $stmt = $this->db->prepare($query);
            $stmt->execute();
            $stats = $stmt->fetch();

            // Códigos activos
            $query2 = "SELECT COUNT(*) as active_codes FROM codigos_qr WHERE activo = 1";
            $stmt2 = $this->db->prepare($query2);
            $stmt2->execute();
            $activeCodesResult = $stmt2->fetch();

            $stats['active_codes'] = $activeCodesResult['active_codes'];

            return ['success' => true, 'data' => $stats];

        } catch (Exception $e) {
            error_log("Error getting stats: " . $e->getMessage());
            return ['success' => false, 'message' => 'Error obteniendo estadísticas'];
        }
    }

    private function getRecentActivity() {
        try {
            $query = "SELECT ra.*, u.nombre as user_name, c.nombre as training_name
                      FROM registros_acceso ra
                      LEFT JOIN codigos_qr cq ON ra.codigo_qr_id = cq.id
                      LEFT JOIN usuarios u ON cq.usuario_id = u.id
                      LEFT JOIN capacitaciones c ON cq.capacitacion_id = c.id
                      ORDER BY ra.created_at DESC
                      LIMIT 10";

            $stmt = $this->db->prepare($query);
            $stmt->execute();
            $activities = $stmt->fetchAll();

            return ['success' => true, 'data' => $activities];

        } catch (Exception $e) {
            error_log("Error getting recent activity: " . $e->getMessage());
            return ['success' => false, 'message' => 'Error obteniendo actividad reciente'];
        }
    }

    private function getExpiringCodes() {
        try {
            $query = "SELECT cq.*, u.nombre as user_name, c.nombre as training_name
                      FROM codigos_qr cq
                      JOIN usuarios u ON cq.usuario_id = u.id
                      JOIN capacitaciones c ON cq.capacitacion_id = c.id
                      WHERE cq.activo = 1 
                      AND cq.fecha_expiracion IS NOT NULL
                      AND cq.fecha_expiracion BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 7 DAY)
                      ORDER BY cq.fecha_expiracion ASC";

            $stmt = $this->db->prepare($query);
            $stmt->execute();
            $codes = $stmt->fetchAll();

            return ['success' => true, 'data' => $codes];

        } catch (Exception $e) {
            error_log("Error getting expiring codes: " . $e->getMessage());
            return ['success' => false, 'message' => 'Error obteniendo códigos por vencer'];
        }
    }

    private function getUsers() {
        try {
            $query = "SELECT * FROM usuarios ORDER BY created_at DESC";
            $stmt = $this->db->prepare($query);
            $stmt->execute();
            $users = $stmt->fetchAll();

            return ['success' => true, 'data' => $users];

        } catch (Exception $e) {
            error_log("Error getting users: " . $e->getMessage());
            return ['success' => false, 'message' => 'Error obteniendo usuarios'];
        }
    }

    private function getTrainings() {
        try {
            $query = "SELECT * FROM capacitaciones ORDER BY created_at DESC";
            $stmt = $this->db->prepare($query);
            $stmt->execute();
            $trainings = $stmt->fetchAll();

            return ['success' => true, 'data' => $trainings];

        } catch (Exception $e) {
            error_log("Error getting trainings: " . $e->getMessage());
            return ['success' => false, 'message' => 'Error obteniendo capacitaciones'];
        }
    }

    private function getAccessLog() {
        try {
            $query = "SELECT ra.*, u.nombre as user_name, c.nombre as training_name
                      FROM registros_acceso ra
                      LEFT JOIN codigos_qr cq ON ra.codigo_qr_id = cq.id
                      LEFT JOIN usuarios u ON cq.usuario_id = u.id
                      LEFT JOIN capacitaciones c ON cq.capacitacion_id = c.id
                      ORDER BY ra.created_at DESC
                      LIMIT 100";

            $stmt = $this->db->prepare($query);
            $stmt->execute();
            $logs = $stmt->fetchAll();

            return ['success' => true, 'data' => $logs];

        } catch (Exception $e) {
            error_log("Error getting access log: " . $e->getMessage());
            return ['success' => false, 'message' => 'Error obteniendo registro de accesos'];
        }
    }

    private function generateQR($data) {
        try {
            $userId = $data['user_id'] ?? null;
            $trainingId = $data['training_id'] ?? null;
            $expirationDate = $data['expiration_date'] ?? null;

            if (!$userId || !$trainingId) {
                return ['success' => false, 'message' => 'Usuario y capacitación requeridos'];
            }

            // Verificar que el usuario y capacitación existen
            $userQuery = "SELECT id FROM usuarios WHERE id = :user_id";
            $stmt = $this->db->prepare($userQuery);
            $stmt->bindParam(':user_id', $userId);
            $stmt->execute();

            if (!$stmt->fetch()) {
                return ['success' => false, 'message' => 'Usuario no encontrado'];
            }

            $trainingQuery = "SELECT id FROM capacitaciones WHERE id = :training_id AND activa = 1";
            $stmt = $this->db->prepare($trainingQuery);
            $stmt->bindParam(':training_id', $trainingId);
            $stmt->execute();

            if (!$stmt->fetch()) {
                return ['success' => false, 'message' => 'Capacitación no encontrada o inactiva'];
            }

            // Verificar si ya existe un código activo para este usuario y capacitación
            $existingQuery = "SELECT codigo FROM codigos_qr 
                              WHERE usuario_id = :user_id AND capacitacion_id = :training_id AND activo = 1";
            $stmt = $this->db->prepare($existingQuery);
            $stmt->bindParam(':user_id', $userId);
            $stmt->bindParam(':training_id', $trainingId);
            $stmt->execute();

            $existing = $stmt->fetch();
            if ($existing) {
                return ['success' => true, 'data' => ['qr_code' => $existing['codigo']], 'message' => 'Código existente reutilizado'];
            }

            // Generar nuevo código único
            $qrCode = $this->generateUniqueCode();

            // Insertar nuevo código QR
            $insertQuery = "INSERT INTO codigos_qr (codigo, usuario_id, capacitacion_id, fecha_expiracion, activo) 
                            VALUES (:codigo, :user_id, :training_id, :expiration, 1)";

            $stmt = $this->db->prepare($insertQuery);
            $stmt->bindParam(':codigo', $qrCode);
            $stmt->bindParam(':user_id', $userId);
            $stmt->bindParam(':training_id', $trainingId);
            $stmt->bindParam(':expiration', $expirationDate);
            $stmt->execute();

            return ['success' => true, 'data' => ['qr_code' => $qrCode]];

        } catch (Exception $e) {
            error_log("Error generating QR: " . $e->getMessage());
            return ['success' => false, 'message' => 'Error generando código QR'];
        }
    }

    private function generateUniqueCode() {
        do {
            $code = 'QR' . date('Ymd') . '_' . strtoupper(bin2hex(random_bytes(8)));
            
            $query = "SELECT COUNT(*) as count FROM codigos_qr WHERE codigo = :codigo";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':codigo', $code);
            $stmt->execute();
            
            $result = $stmt->fetch();
        } while ($result['count'] > 0);

        return $code;
    }

    private function saveUser($data) {
        try {
            $nombre = $data['nombre'] ?? '';
            $email = $data['email'] ?? '';
            $telefono = $data['telefono'] ?? null;
            $empresa = $data['empresa'] ?? null;

            if (empty($nombre) || empty($email)) {
                return ['success' => false, 'message' => 'Nombre y email son requeridos'];
            }

            // Verificar email único
            $checkQuery = "SELECT COUNT(*) as count FROM usuarios WHERE email = :email";
            $stmt = $this->db->prepare($checkQuery);
            $stmt->bindParam(':email', $email);
            $stmt->execute();
            
            if ($stmt->fetch()['count'] > 0) {
                return ['success' => false, 'message' => 'El email ya está registrado'];
            }

            $insertQuery = "INSERT INTO usuarios (nombre, email, telefono, empresa) VALUES (:nombre, :email, :telefono, :empresa)";
            $stmt = $this->db->prepare($insertQuery);
            $stmt->bindParam(':nombre', $nombre);
            $stmt->bindParam(':email', $email);
            $stmt->bindParam(':telefono', $telefono);
            $stmt->bindParam(':empresa', $empresa);
            $stmt->execute();

            return ['success' => true, 'message' => 'Usuario guardado exitosamente'];

        } catch (Exception $e) {
            error_log("Error saving user: " . $e->getMessage());
            return ['success' => false, 'message' => 'Error guardando usuario'];
        }
    }

    private function saveTraining($data) {
        try {
            $nombre = $data['nombre'] ?? '';
            $descripcion = $data['descripcion'] ?? null;
            $fechaInicio = $data['fecha_inicio'] ?? '';
            $fechaFin = $data['fecha_fin'] ?? '';

            if (empty($nombre) || empty($fechaInicio) || empty($fechaFin)) {
                return ['success' => false, 'message' => 'Nombre, fecha inicio y fecha fin son requeridos'];
            }

            if ($fechaInicio > $fechaFin) {
                return ['success' => false, 'message' => 'La fecha de inicio no puede ser posterior a la fecha de fin'];
            }

            $insertQuery = "INSERT INTO capacitaciones (nombre, descripcion, fecha_inicio, fecha_fin, activa) 
                            VALUES (:nombre, :descripcion, :fecha_inicio, :fecha_fin, 1)";
            $stmt = $this->db->prepare($insertQuery);
            $stmt->bindParam(':nombre', $nombre);
            $stmt->bindParam(':descripcion', $descripcion);
            $stmt->bindParam(':fecha_inicio', $fechaInicio);
            $stmt->bindParam(':fecha_fin', $fechaFin);
            $stmt->execute();

            return ['success' => true, 'message' => 'Capacitación guardada exitosamente'];

        } catch (Exception $e) {
            error_log("Error saving training: " . $e->getMessage());
            return ['success' => false, 'message' => 'Error guardando capacitación'];
        }
    }
}

// Ejecutar API
try {
    $api = new AdminAPI();
    $result = $api->handleRequest();
    echo json_encode($result);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error interno del servidor']);
}
?>