#!/bin/bash

# Script de instalación automática para el Sistema de Verificación QR
# Requiere XAMPP instalado y MySQL ejecutándose

echo "🔧 Instalando Sistema de Verificación QR..."

# Verificar si XAMPP está instalado (macOS)
if [ ! -d "/Applications/XAMPP" ]; then
    echo "❌ XAMPP no está instalado. Por favor instálalo desde https://www.apachefriends.org/"
    exit 1
fi

# Verificar si MySQL está ejecutándose
if ! pgrep -x "mysqld" > /dev/null; then
    echo "❌ MySQL no está ejecutándose. Inicia XAMPP primero."
    exit 1
fi

echo "✅ XAMPP detectado y MySQL ejecutándose"

# Crear la base de datos
echo "📊 Configurando base de datos..."
mysql -u root -e "CREATE DATABASE IF NOT EXISTS qr_verification CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

if [ $? -eq 0 ]; then
    echo "✅ Base de datos 'qr_verification' creada exitosamente"
else
    echo "❌ Error creando la base de datos"
    exit 1
fi

# Importar estructura de base de datos
echo "🏗️ Importando estructura de tablas..."
mysql -u root qr_verification < database/setup.sql

if [ $? -eq 0 ]; then
    echo "✅ Tablas creadas exitosamente"
else
    echo "❌ Error importando estructura de base de datos"
    exit 1
fi

# Importar datos de ejemplo (opcional)
echo "📝 Importando datos de ejemplo..."
mysql -u root qr_verification < database/sample_data.sql

if [ $? -eq 0 ]; then
    echo "✅ Datos de ejemplo importados exitosamente"
else
    echo "⚠️ Error importando datos de ejemplo (opcional)"
fi

# Verificar permisos de archivos
echo "🔐 Configurando permisos..."
chmod -R 755 .
chmod -R 644 *.php *.html *.js *.css *.json *.md

# Mostrar información de instalación
echo ""
echo "🎉 ¡Instalación completada exitosamente!"
echo ""
echo "📱 URLs de acceso:"
echo "   Escáner QR: http://localhost/qr_verification/"
echo "   Panel Admin: http://localhost/qr_verification/admin/"
echo ""
echo "👤 Usuarios de prueba creados:"
echo "   - Juan Pérez (juan.perez@email.com)"
echo "   - María González (maria.gonzalez@email.com)"
echo "   - Carlos Rodríguez (carlos.rodriguez@email.com)"
echo ""
echo "🎓 Capacitaciones de prueba:"
echo "   - Seguridad Industrial 2025"
echo "   - Manejo de Equipos Pesados"
echo ""
echo "🔍 Códigos QR de prueba disponibles:"
echo "   - QR20250917_A1B2C3D4E5F6G7H8"
echo "   - QR20250917_B2C3D4E5F6G7H8I9"
echo "   - QR20250917_C3D4E5F6G7H8I9J0"
echo ""
echo "📖 Consulta README.md para más información y uso del sistema"
echo ""
echo "🚀 Para probar:"
echo "   1. Abre el escáner en tu móvil: http://localhost/qr_verification/"
echo "   2. Permite acceso a la cámara"
echo "   3. Genera un código QR desde el panel admin"
echo "   4. Escanea el código con tu móvil"
echo ""