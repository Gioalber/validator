-- Ejecutar en phpMyAdmin para configurar el sistema

-- 1. Crear la base de datos
CREATE DATABASE IF NOT EXISTS qr_verification CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE qr_verification;

-- 2. Crear las tablas
CREATE TABLE capacitaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    activa BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    empresa VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE codigos_qr (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(255) UNIQUE NOT NULL,
    usuario_id INT NOT NULL,
    capacitacion_id INT NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    fecha_expiracion DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (capacitacion_id) REFERENCES capacitaciones(id) ON DELETE CASCADE
);

CREATE TABLE registros_acceso (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo_qr_id INT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    acceso_concedido BOOLEAN NOT NULL,
    motivo_denegacion VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (codigo_qr_id) REFERENCES codigos_qr(id) ON DELETE CASCADE
);

-- 3. Insertar datos de ejemplo
INSERT INTO capacitaciones (nombre, descripcion, fecha_inicio, fecha_fin) VALUES
('Seguridad Industrial 2025', 'Capacitación sobre normas de seguridad', '2025-01-15', '2025-12-31'),
('Manejo de Equipos Pesados', 'Certificación para maquinaria pesada', '2025-02-01', '2025-11-30');

INSERT INTO usuarios (nombre, email, telefono, empresa) VALUES
('Juan Pérez', 'juan.perez@email.com', '555-0001', 'Constructora ABC'),
('María González', 'maria.gonzalez@email.com', '555-0002', 'Ingeniería XYZ'),
('Carlos Rodríguez', 'carlos.rodriguez@email.com', '555-0003', 'Transportes DEF');

-- 4. Insertar códigos QR de ejemplo (ESTOS SON LOS CÓDIGOS VÁLIDOS)
INSERT INTO codigos_qr (codigo, usuario_id, capacitacion_id, fecha_expiracion, activo) VALUES
('QR20250917_DEMO123456', 1, 1, '2025-12-31 23:59:59', 1),
('QR20250917_TEST789012', 2, 1, '2025-12-31 23:59:59', 1),
('QR20250917_VALID345678', 3, 2, '2025-11-30 23:59:59', 1);

-- Verificar que todo se creó correctamente
SELECT 'Códigos QR válidos creados:' as info, codigo as codigo_qr, u.nombre as usuario, c.nombre as capacitacion
FROM codigos_qr cq
JOIN usuarios u ON cq.usuario_id = u.id
JOIN capacitaciones c ON cq.capacitacion_id = c.id
WHERE cq.activo = 1;