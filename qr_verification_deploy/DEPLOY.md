# 🚀 Guía de Despliegue para cisscad.css.gob.pa

## 📋 Checklist Pre-Despliegue

### ✅ **Requisitos del Servidor**
- [ ] PHP 7.4 o superior
- [ ] MySQL 5.7 o superior / MariaDB 10.3+
- [ ] Apache con mod_rewrite habilitado
- [ ] HTTPS configurado (SSL/TLS)
- [ ] Acceso SSH al servidor

### ✅ **Configuración de Base de Datos**
1. **Crear base de datos en el servidor:**
   ```sql
   CREATE DATABASE qr_verification CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

2. **Crear usuario de base de datos:**
   ```sql
   CREATE USER 'qr_user'@'localhost' IDENTIFIED BY 'password_seguro_aqui';
   GRANT ALL PRIVILEGES ON qr_verification.* TO 'qr_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

3. **Importar estructura:**
   ```bash
   mysql -u qr_user -p qr_verification < setup_complete.sql
   ```

### ✅ **Subir Archivos**
1. **Comprimir proyecto:**
   ```bash
   cd /Applications/XAMPP/xamppfiles/htdocs
   zip -r qr_verification.zip qr_verification/ -x "*.DS_Store" "*.git*"
   ```

2. **Subir via SFTP/SCP al servidor:**
   ```bash
   scp qr_verification.zip usuario@cisscad.css.gob.pa:/var/www/html/
   ```

3. **Descomprimir en el servidor:**
   ```bash
   ssh usuario@cisscad.css.gob.pa
   cd /var/www/html
   unzip qr_verification.zip
   ```

### ✅ **Configurar Permisos**
```bash
# En el servidor
chmod -R 755 qr_verification/
chmod -R 644 qr_verification/*.php qr_verification/*.html
chmod 600 qr_verification/.env
chown -R www-data:www-data qr_verification/
```

### ✅ **Configurar Variables de Entorno**
1. **Copiar archivo de configuración:**
   ```bash
   cp .env.example .env
   ```

2. **Editar configuración:**
   ```bash
   nano .env
   ```
   
   Configurar:
   ```
   DB_HOST=localhost
   DB_NAME=qr_verification  
   DB_USER=qr_user
   DB_PASS=tu_password_real
   DOMAIN=cisscad.css.gob.pa
   PROTOCOL=https
   ```

### ✅ **Configurar Apache Virtual Host**
Crear archivo: `/etc/apache2/sites-available/qr-verification.conf`

```apache
<VirtualHost *:80>
    ServerName cisscad.css.gob.pa
    DocumentRoot /var/www/html
    
    # Redirigir HTTP a HTTPS
    Redirect permanent / https://cisscad.css.gob.pa/
</VirtualHost>

<VirtualHost *:443>
    ServerName cisscad.css.gob.pa
    DocumentRoot /var/www/html
    
    # SSL Configuration
    SSLEngine on
    SSLCertificateFile /path/to/certificate.crt
    SSLCertificateKeyFile /path/to/private.key
    SSLCertificateChainFile /path/to/ca-bundle.crt
    
    # Security Headers
    Header always set Strict-Transport-Security "max-age=63072000; includeSubDomains; preload"
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
    Header always set X-XSS-Protection "1; mode=block"
    
    # Logs
    ErrorLog ${APACHE_LOG_DIR}/qr-verification_error.log
    CustomLog ${APACHE_LOG_DIR}/qr-verification_access.log combined
</VirtualHost>
```

### ✅ **Habilitar sitio:**
```bash
a2ensite qr-verification
a2enmod ssl headers rewrite
systemctl reload apache2
```

## 🔧 **URLs de Acceso Final**

- **Escáner QR:** `https://cisscad.css.gob.pa/qr_verification/`
- **Panel Admin:** `https://cisscad.css.gob.pa/qr_verification/admin/`

## 🧪 **Pruebas Post-Despliegue**

### ✅ **Verificar Conectividad**
1. Acceder a: `https://cisscad.css.gob.pa/qr_verification/`
2. Verificar que carga correctamente
3. Probar acceso a cámara en móvil

### ✅ **Verificar Base de Datos**
1. Acceder al panel admin
2. Verificar estadísticas
3. Crear un usuario de prueba
4. Generar código QR de prueba
5. Escanear código generado

### ✅ **Verificar HTTPS**
1. Confirmar certificado SSL válido
2. Verificar redirección HTTP → HTTPS
3. Probar PWA (agregar a pantalla inicio)

## 🔒 **Seguridad Adicional**

### ✅ **Configurar Firewall**
```bash
# UFW Example
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 22/tcp
ufw enable
```

### ✅ **Configurar Backup Automático**
```bash
#!/bin/bash
# /etc/cron.daily/qr-backup
mysqldump -u qr_user -p'password' qr_verification > /backup/qr_verification_$(date +%Y%m%d).sql
tar -czf /backup/qr_files_$(date +%Y%m%d).tar.gz /var/www/html/qr_verification
```

### ✅ **Monitoring y Logs**
- Configurar logrotate para logs de aplicación
- Monitorear espacio en disco
- Configurar alertas de error

## 📱 **Configuración PWA**

Para que funcione como app móvil:
1. Verificar que `manifest.json` sea accesible
2. Configurar Service Worker
3. Probar "Agregar a pantalla de inicio"

## 🆘 **Solución de Problemas Comunes**

### ❌ **Error de Conexión DB**
```bash
# Verificar conexión MySQL
mysql -u qr_user -p qr_verification -e "SHOW TABLES;"
```

### ❌ **Error 500**
```bash
# Revisar logs de Apache
tail -f /var/log/apache2/qr-verification_error.log
```

### ❌ **Cámara no funciona**
- Verificar HTTPS está activo
- Confirmar permisos de cámara en navegador
- Probar en diferentes dispositivos

## 📞 **Contacto de Soporte**

- Documentación técnica: Ver README.md
- Logs del sistema: `/var/log/apache2/qr-verification_error.log`
- Base de datos: Revisar conexión en `config/database.php`