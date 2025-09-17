-- Script para insertar códigos QR de ejemplo después de tener usuarios y capacitaciones
-- Ejecutar después de configurar usuarios y capacitaciones

USE qr_verification;

-- Generar algunos códigos QR de ejemplo para pruebas
INSERT INTO codigos_qr (codigo, usuario_id, capacitacion_id, fecha_expiracion, activo) VALUES
('QR20250917_A1B2C3D4E5F6G7H8', 1, 1, '2025-12-31 23:59:59', 1),
('QR20250917_B2C3D4E5F6G7H8I9', 2, 1, '2025-12-31 23:59:59', 1),
('QR20250917_C3D4E5F6G7H8I9J0', 3, 2, '2025-11-30 23:59:59', 1);

-- Insertar algunos registros de acceso de ejemplo
INSERT INTO registros_acceso (codigo_qr_id, ip_address, user_agent, acceso_concedido, motivo_denegacion, created_at) VALUES
(1, '192.168.1.100', 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)', 1, NULL, NOW() - INTERVAL 2 HOUR),
(2, '192.168.1.101', 'Mozilla/5.0 (Android 11; Mobile)', 1, NULL, NOW() - INTERVAL 1 HOUR),
(1, '192.168.1.100', 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)', 0, 'Código usado recientemente', NOW() - INTERVAL 30 MINUTE),
(3, '192.168.1.102', 'Mozilla/5.0 (Android 12; Mobile)', 1, NULL, NOW() - INTERVAL 15 MINUTE);

-- Verificar que todo se insertó correctamente
SELECT 'Usuarios creados:' as info, COUNT(*) as total FROM usuarios
UNION ALL
SELECT 'Capacitaciones creadas:', COUNT(*) FROM capacitaciones
UNION ALL
SELECT 'Códigos QR activos:', COUNT(*) FROM codigos_qr WHERE activo = 1
UNION ALL
SELECT 'Registros de acceso:', COUNT(*) FROM registros_acceso;