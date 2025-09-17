// Función auxiliar para obtener la URL base
function getBaseUrl() {
    return (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') 
        ? '../' 
        : 'https://cisscad.css.gob.pa/qr_verification/';
}