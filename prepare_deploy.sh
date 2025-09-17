#!/bin/bash

# Script para preparar el proyecto para despliegue en cisscad.css.gob.pa
# Ejecutar desde el directorio del proyecto

echo "🚀 Preparando proyecto para despliegue en cisscad.css.gob.pa"

# Crear directorio temporal para el deployment
DEPLOY_DIR="qr_verification_deploy"
rm -rf $DEPLOY_DIR
mkdir $DEPLOY_DIR

echo "📁 Copiando archivos necesarios..."

# Copiar archivos principales
cp -r api/ $DEPLOY_DIR/
cp -r admin/ $DEPLOY_DIR/
cp -r config/ $DEPLOY_DIR/
cp -r js/ $DEPLOY_DIR/
cp index.html $DEPLOY_DIR/
cp manifest.json $DEPLOY_DIR/
cp sw.js $DEPLOY_DIR/
cp .htaccess $DEPLOY_DIR/

# Copiar archivos de configuración
cp .env.example $DEPLOY_DIR/
cp setup_complete.sql $DEPLOY_DIR/
cp README.md $DEPLOY_DIR/
cp DEPLOY.md $DEPLOY_DIR/

# Crear directorio de logs
mkdir -p $DEPLOY_DIR/logs/
touch $DEPLOY_DIR/logs/.gitkeep

echo "🔧 Configurando para producción..."

# Crear archivo de configuración específico para CSS
cat > $DEPLOY_DIR/.env << 'EOF'
# Configuración para cisscad.css.gob.pa
DB_HOST=localhost
DB_NAME=qr_verification
DB_USER=qr_user
DB_PASS=CAMBIAR_PASSWORD_AQUI

DOMAIN=cisscad.css.gob.pa
PROTOCOL=https
ENABLE_HTTPS=true
SECURE_COOKIES=true

APP_NAME=Sistema QR CSS - Control de Acceso
APP_ENV=production
DEBUG=false

LOG_LEVEL=INFO
LOG_FILE=/var/log/qr_verification.log
EOF

# Crear archivo de instalación para el servidor
cat > $DEPLOY_DIR/install_server.sh << 'EOF'
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
EOF

chmod +x $DEPLOY_DIR/install_server.sh

# Limpiar archivos no necesarios en producción
rm -f $DEPLOY_DIR/install.sh
rm -rf $DEPLOY_DIR/database/

echo "📦 Comprimiendo proyecto..."

# Crear archivo ZIP para subir al servidor
zip -r qr_verification_css.zip $DEPLOY_DIR/ -x "*.DS_Store" "*.git*"

echo "✅ Proyecto preparado para despliegue!"
echo ""
echo "📁 Archivos listos en: $DEPLOY_DIR/"
echo "📦 Archivo ZIP: qr_verification_css.zip"
echo ""
echo "🚀 Próximos pasos:"
echo "1. Subir qr_verification_css.zip al servidor"
echo "2. Descomprimir en /var/www/html/"
echo "3. Configurar .env con credenciales reales"
echo "4. Ejecutar install_server.sh en el servidor"
echo "5. Configurar Virtual Host de Apache"
echo ""
echo "📖 Ver DEPLOY.md para instrucciones detalladas"