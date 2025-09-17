<?php
class Database {
    private $host;
    private $db_name;
    private $username;
    private $password;
    private $conn = null;

    public function __construct() {
        // Configuración automática según el entorno
        if ($_SERVER['HTTP_HOST'] === 'localhost' || $_SERVER['HTTP_HOST'] === '127.0.0.1') {
            // Configuración local (XAMPP)
            $this->host = 'localhost';
            $this->db_name = 'qr_verification';
            $this->username = 'root';
            $this->password = '';
        } else {
            // Configuración de producción
            $this->host = $_ENV['DB_HOST'] ?? 'localhost';
            $this->db_name = $_ENV['DB_NAME'] ?? 'qr_verification';
            $this->username = $_ENV['DB_USER'] ?? 'root';
            $this->password = $_ENV['DB_PASS'] ?? '';
        }
    }

    public function getConnection() {
        if ($this->conn === null) {
            try {
                $this->conn = new PDO(
                    "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=utf8mb4",
                    $this->username,
                    $this->password,
                    [
                        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                        PDO::ATTR_EMULATE_PREPARES => false,
                        PDO::ATTR_TIMEOUT => 30
                    ]
                );
            } catch(PDOException $e) {
                // En producción, no mostrar detalles del error
                if ($_SERVER['HTTP_HOST'] === 'localhost' || $_SERVER['HTTP_HOST'] === '127.0.0.1') {
                    throw new Exception("Error de conexión: " . $e->getMessage());
                } else {
                    error_log("Database connection error: " . $e->getMessage());
                    throw new Exception("Error de conexión a la base de datos");
                }
            }
        }
        return $this->conn;
    }

    public function closeConnection() {
        $this->conn = null;
    }
}
?>