#!/bin/bash
# Script de instalación en el servidor

echo "🔧 Instalando Sistema QR CSS..."

# Configurar permisos
chmod -R 755 .
chmod -R 644 *.php *.html *.js *.css *.json *.md
chmod 600 .env
chmod +x install_server.sh

# Crear base de datos (requiere credenciales MySQL)
echo "📊 Configurando base de datos..."
echo "Por favor ejecuta manualmente:"
echo "mysql -u root -p < setup_complete.sql"

echo "✅ Instalación completada"
echo "Configurar las credenciales de BD en el archivo .env"
echo ""
echo "URLs de acceso:"
echo "- Escáner: https://cisscad.css.gob.pa/qr_verification/"  
echo "- Admin: https://cisscad.css.gob.pa/qr_verification/admin/"
