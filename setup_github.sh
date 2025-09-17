#!/bin/bash

# Script para configurar y subir el proyecto a GitHub
# Ejecutar después de instalar Xcode Command Line Tools

echo "🚀 Configurando repositorio GitHub para QR Validator"

# Configurar Git (cambiar email por el tuyo)
git config --global user.name "Gioalber"
git config --global user.email "tu-email@example.com"

# Inicializar repositorio
git init

# Añadir remote del repositorio
git remote add origin https://github.com/Gioalber/validator.git

# Crear rama main
git checkout -b main

# Añadir todos los archivos
git add .

# Hacer commit inicial
git commit -m "🎉 Initial commit: QR Validator System

✨ Features:
- 📱 Mobile QR scanner with camera access
- 🔍 Real-time QR code validation 
- 👨‍💼 Complete admin panel
- 📊 Statistics and reports
- 🛡️ Security validations
- 🌐 PWA ready with offline support
- 🎯 Demo mode for GitHub Pages

🚀 Ready for deployment on GitHub Pages
🔗 Live demo: https://gioalber.github.io/validator/"

# Subir a GitHub
echo ""
echo "📤 Subiendo archivos a GitHub..."
git push -u origin main

echo ""
echo "✅ ¡Listo! Tu proyecto está en GitHub"
echo "🌐 Repositorio: https://github.com/Gioalber/validator"
echo "📱 Demo en vivo: https://gioalber.github.io/validator/"
echo ""
echo "🔧 Para habilitar GitHub Pages:"
echo "1. Ve a tu repositorio en GitHub"
echo "2. Settings > Pages"
echo "3. Source: Deploy from a branch"
echo "4. Branch: main / (root)"
echo "5. Save"
echo ""
echo "🎯 Códigos QR de prueba para el demo:"
echo "- QR20250917_DEMO123456"
echo "- DEMO_GITHUB_PAGES_001"
echo "- TEST_VALIDATOR_002"