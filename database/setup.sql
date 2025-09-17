-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS qr_verification CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE qr_verification;

-- Tabla de capacitaciones
CREATE TABLE capacitaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    activa BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de usuarios/participantes
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    empresa VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de códigos QR
CREATE TABLE codigos_qr (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(255) UNIQUE NOT NULL,
    usuario_id INT NOT NULL,
    capacitacion_id INT NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    fecha_expiracion DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (capacitacion_id) REFERENCES capacitaciones(id) ON DELETE CASCADE,
    INDEX idx_codigo (codigo),
    INDEX idx_usuario_capacitacion (usuario_id, capacitacion_id)
);

-- Tabla de registros de acceso
CREATE TABLE registros_acceso (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo_qr_id INT NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    acceso_concedido BOOLEAN NOT NULL,
    motivo_denegacion VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (codigo_qr_id) REFERENCES codigos_qr(id) ON DELETE CASCADE,
    INDEX idx_fecha (created_at),
    INDEX idx_codigo_fecha (codigo_qr_id, created_at)
);

-- Tabla de administradores
CREATE TABLE administradores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar datos de ejemplo
INSERT INTO capacitaciones (nombre, descripcion, fecha_inicio, fecha_fin) VALUES
('Seguridad Industrial 2025', 'Capacitación sobre normas de seguridad en el lugar de trabajo', '2025-01-15', '2025-12-31'),
('Manejo de Equipos Pesados', 'Certificación para operación de maquinaria pesada', '2025-02-01', '2025-11-30');

INSERT INTO usuarios (nombre, email, telefono, empresa) VALUES
('Juan Pérez', 'juan.perez@email.com', '555-0001', 'Constructora ABC'),
('María González', 'maria.gonzalez@email.com', '555-0002', 'Ingeniería XYZ'),
('Carlos Rodríguez', 'carlos.rodriguez@email.com', '555-0003', 'Transportes DEF');

-- Crear usuario administrador por defecto (password: admin123)
INSERT INTO administradores (username, password_hash, nombre, email) VALUES
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrador', 'admin@sistema.com');