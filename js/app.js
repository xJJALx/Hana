// Validación de ruta Desarrollo/Producción
var url = window.location.href;
var swLocation = '/ProyectoFinal/sw.js';

// Service Worker
if (navigator.serviceWorker) {
    if (url.includes('localhost') || url.includes('127.0.0.1')) {
        swLocation = '/sw.js';
    }
    navigator.serviceWorker.register(swLocation);
}

// KDA
const temaKDA = () => {
    let active = document.getElementById('switch');
    active.classList.toggle('active');

    let fondo = document.body;
    fondo.classList.toggle('fondo--kda');

    let titulo = document.getElementsByTagName('h1')[0];
    titulo.classList.toggle('kda');

    // CUIDADO CON EL ORDEN - si se modifica el index y se añaden <a>
    let general = document.getElementsByTagName('a')[0];
    general.classList.toggle('panel__boton--general_kda');

    let ajustes = document.getElementsByTagName('a')[1];
    ajustes.classList.toggle('panel__boton--ajustes_kda');

    let lugares = document.getElementsByTagName('a')[2];
    lugares.classList.toggle('panel__boton--ajustes_kda');

    let clima = document.getElementsByTagName('a')[3];
    clima.classList.toggle('panel__boton--ajustes_kda');

    let planes = document.getElementsByTagName('a')[4];
    planes.classList.toggle('panel__boton--ajustes_kda');
}

document.getElementById('switch').addEventListener('click', temaKDA, false);

