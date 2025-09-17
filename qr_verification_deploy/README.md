# Sistema de Verificación QR para Control de Acceso

Un sistema web completo para verificar códigos QR y controlar el acceso a estacionamientos durante capacitaciones.

## Características Principales

- ✅ Escaneo de códigos QR desde dispositivos móviles
- ✅ Verificación en tiempo real contra base de datos
- ✅ Panel de administración completo
- ✅ Generación automática de códigos QR
- ✅ Gestión de usuarios y capacitaciones
- ✅ Registro completo de accesos
- ✅ Interfaz responsive para móviles
- ✅ Feedback visual y sonoro
- ✅ Estadísticas y reportes

## Instalación

### Requisitos
- XAMPP (Apache + MySQL + PHP)
- Navegador web moderno con soporte para cámara
- Dispositivos móviles para escanear códigos QR

### Pasos de Instalación

1. **Configurar XAMPP**
   ```bash
   # Asegúrate de que Apache y MySQL estén ejecutándose
   # Accede a phpMyAdmin en http://localhost/phpmyadmin
   ```

2. **Crear la Base de Datos**
   ```sql
   # Ejecuta el archivo database/setup.sql en phpMyAdmin
   # o desde línea de comandos:
   mysql -u root -p < database/setup.sql
   ```

3. **Configurar la Conexión**
   - Edita `config/database.php` si necesitas cambiar credenciales de MySQL
   - Por defecto usa: host=localhost, user=root, password=(vacío)

4. **Acceder a la Aplicación**
   - Escáner QR: `http://localhost/qr_verification/`
   - Panel Admin: `http://localhost/qr_verification/admin/`

## Uso del Sistema

### Para Usuarios (Escaneo)
1. Abrir `http://localhost/qr_verification/` en el móvil
2. Permitir acceso a la cámara
3. Apuntar la cámara al código QR
4. El sistema mostrará inmediatamente si el acceso es válido

### Para Administradores

1. **Acceder al Panel**
   - URL: `http://localhost/qr_verification/admin/`
   
2. **Gestionar Capacitaciones**
   - Crear nuevas capacitaciones con fechas de inicio y fin
   - Activar/desactivar capacitaciones existentes
   
3. **Gestionar Usuarios**
   - Registrar participantes con datos completos
   - Asociar usuarios con empresas
   
4. **Generar Códigos QR**
   - Seleccionar usuario y capacitación
   - Establecer fecha de expiración (opcional)
   - Descargar código QR generado
   
5. **Monitorear Accesos**
   - Ver estadísticas en tiempo real
   - Revisar historial de accesos
   - Identificar códigos próximos a vencer

## Estructura del Proyecto

```
qr_verification/
├── index.html              # Página principal de escaneo
├── config/
│   └── database.php        # Configuración de base de datos
├── database/
│   └── setup.sql          # Estructura de base de datos
├── api/
│   ├── verify_qr.php      # API para verificar códigos QR
│   └── admin.php          # API para panel de administración
├── js/
│   └── scanner.js         # Lógica del escáner QR
├── admin/
│   ├── index.html         # Panel de administración
│   └── js/
│       └── admin.js       # Lógica del panel admin
└── README.md              # Esta documentación
```

## Funcionalidades Técnicas

### Validaciones de Seguridad
- ✅ Verificación de códigos únicos y activos
- ✅ Validación de fechas de capacitación
- ✅ Control de expiración de códigos QR
- ✅ Prevención de uso múltiple rápido
- ✅ Registro completo de intentos de acceso

### Características Móviles
- ✅ Interfaz optimizada para smartphones
- ✅ Acceso a cámara trasera automáticamente
- ✅ Feedback visual con colores y iconos
- ✅ Vibración en dispositivos compatibles
- ✅ Sonidos de confirmación/error
- ✅ Funcionamiento sin conexión (caché)

### Panel de Administración
- ✅ Dashboard con estadísticas en tiempo real
- ✅ Generación de códigos QR con descarga
- ✅ CRUD completo de usuarios y capacitaciones
- ✅ Registro detallado de todos los accesos
- ✅ Alertas para códigos próximos a vencer

## API Endpoints

### Verificación de QR
```
POST /api/verify_qr.php
Content-Type: application/json

{
    "code": "QR20250917_A1B2C3D4E5F6G7H8"
}
```

### Administración
```
# Obtener estadísticas
GET /api/admin.php?action=stats

# Generar código QR
POST /api/admin.php
{
    "action": "generate_qr",
    "user_id": 1,
    "training_id": 1,
    "expiration_date": "2025-12-31 23:59:59"
}

# Crear usuario
POST /api/admin.php
{
    "action": "save_user",
    "nombre": "Juan Pérez",
    "email": "juan@email.com",
    "telefono": "555-0001",
    "empresa": "Empresa ABC"
}
```

## Personalización

### Cambiar Colores y Estilos
Editar los archivos CSS inline en `index.html` y `admin/index.html`

### Modificar Validaciones
Ajustar la lógica en `api/verify_qr.php` según tus reglas de negocio

### Agregar Campos
1. Modificar la base de datos en `database/setup.sql`
2. Actualizar las APIs en `api/`
3. Agregar campos en las interfaces HTML

## Solución de Problemas

### Problemas Comunes

1. **Error de Conexión a Base de Datos**
   - Verificar que MySQL esté ejecutándose
   - Comprobar credenciales en `config/database.php`

2. **Cámara No Funciona**
   - Usar HTTPS o localhost
   - Permitir permisos de cámara en el navegador
   - Verificar que el dispositivo tenga cámara

3. **Códigos QR No Se Generan**
   - Verificar que usuarios y capacitaciones existan
   - Comprobar fechas de capacitación válidas

## Seguridad

### Medidas Implementadas
- Validación de entrada en todas las APIs
- Prevención de inyección SQL con prepared statements
- Registro completo de actividad para auditoría
- Validaciones de fechas y estados

### Recomendaciones Adicionales
- Usar HTTPS en producción
- Implementar autenticación para panel admin
- Configurar respaldos automáticos de base de datos
- Limitar intentos de acceso por IP

## Licencia

Proyecto desarrollado para control de acceso en capacitaciones.

## Soporte

Para soporte técnico o consultas sobre el sistema, consultar la documentación del código o contactar al desarrollador.