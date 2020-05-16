/*  -------------------
        CONEXION
    ------------------- */

// Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyBVsmsWWZ5WS2PG4Ou2A-TnEEFrM4lWwLk",
    authDomain: "pruebaplanes.firebaseapp.com",
    databaseURL: "https://pruebaplanes.firebaseio.com",
    projectId: "pruebaplanes",
    storageBucket: "pruebaplanes.appspot.com",
    messagingSenderId: "1000608792183",
    appId: "1:1000608792183:web:abcaf58af21f4e568e5072"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

let db = firebase.firestore();
let dbRef = db.collection('Hana-B');


/*  -------------------
        FUNCIONES
    ------------------- */


// Variable global para de referenciar el plan y poder añadir mensajes ***addMensaje()***
let planRef;

// Selecciona nombres de planes generados dinamicamente
const targetPlan = (e) => {
    planRef = e.target.id;
}

// Comprueba si no hay internet para leer los últimos datos guardados en IndexedDB
const isOnline = () => {
    if (!navigator.onLine) {
        alert('Se ha caído la conexión');
        leerIndexedDBOffline();
    } else {
        alert('Hay conexión');
    }
}

// Reinicia indexedDB para actualizar la informacion
const gestionIndexedDB = () => {
    reiniciarIndexedDB();
    iniciarIndexedDB();
}

// Crea cards en html con los planes leidos de Firestore
const creaMensajes = (planes) => {
    let tablon = document.getElementById('tablonDinamico');
    document.getElementById('tablonDinamico').innerHTML = ''; // Limpia tablón
    for (let i = 0; i < planes.length; i++) {
        tablon.innerHTML += `
                    <div class="tablon__plan--card ">
                    <img src="../icons/web/lugares.png" alt="">
                    <h3 id="${planes[i]}">${planes[i]}</h3>
                    </div>
                    `;
    }
}


// Lee BD Firestore y genera planes dinamicamente
const cargarPlanes = () => {
    dbRef
        .onSnapshot(snap => {
            var planes = [];
            snap.forEach(plan => {
                planes.push(plan.id);
            });
            creaMensajes(planes);
        });
}


// Carga los mensajes dinamicamente del plan elegido
const cargarMensajes = (plan) => {
    dbRef.doc(plan)
        .collection('mensajes').orderBy('timestamp').onSnapshot(snap => {
            let chat = document.getElementById('innerMsg');
            document.getElementById('innerMsg').innerHTML = ''; // Limpia mensajes
            snap.forEach(snapHijo => {
                chat.innerHTML += '<div class="bubbleMsg"><p>' + snapHijo.data().autor + ": " + snapHijo.data().mensaje + '</p></div>';
            });
        });
}


// Añade mensajes al plan elegido
const addMensaje = () => {

    let f = new Date();
    let mensaje = document.getElementById('addMensaje').value;
    let autor = 'Admin';

    let msg = {
        mensaje: mensaje,
        autor: autor,
        fecha: f.getDate() + "/" + (f.getMonth() + 1) + "/" + f.getFullYear(),
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };

    dbRef
        .doc(planRef)
        .collection('mensajes')
        .add(msg)
}


// Detecta el plan elegido y carga sus mensajes
const target = (e) => {
    let plan = e.target.id;

    if (plan === 'atras') atras();

    dbRef
        .get().then(snap => {
            snap.forEach(planBD => {
                if (plan === planBD.id) {
                    showPanel();
                    cargarMensajes(plan);
                }
            });
        });
}


// Añade planes a la BD Firestore
const addBDCollection = () => {
    let nombrePlan = document.getElementById('addPlanValue').value;

    dbRef
        .doc(nombrePlan).set({
            plan: nombrePlan
        });

    gestionIndexedDB();
}


// Crea una IndexedDB y el objeto para almacenar planes. Una vez creada llama a una funcion y graba los planes
const iniciarIndexedDB = () => {

    isOnline(); // Comprueba si se cayó la conexion para cargar los planes indexedDB
    let request = window.indexedDB.open('HANABD');

    request.onupgradeneeded = event => {
        console.log('Actualización de BD');

        let db = event.target.result;

        db.createObjectStore('Planes', {
            keyPath: 'id'
        });
    };

    // Cerramos la BD abierta y esperamos 3 segundos para que firestore cargue (suele ser instantaneo pero a veces tarda)
    request.onsuccess = event => {
        let db = event.target.result;
        db.close();

        setTimeout(() => {
            addPlanesIndexedDB();
        }, 3000);
    }
}


// Añade los planes del tablon a la indexedDB
const addPlanesIndexedDB = () => {
    let request = window.indexedDB.open('HANABD');
    let planes = [];

    request.onsuccess = event => {
        let db = event.target.result;

        let totalPlanes = document.getElementsByTagName('h3').length;

        for (let i = 1; i < totalPlanes; i++) {
            let plan = document.getElementsByTagName('h3')[i].textContent;
            planes.push(plan);
        }

        let transaction = db.transaction(['Planes'], 'readwrite');

        let store = transaction.objectStore('Planes');

        for (let plan of planes) {
            store.add({ id: plan });
        }

        db.close();
    }
}


// Borra IndexedDB por completo
const reiniciarIndexedDB = () => {
    var request = indexedDB.deleteDatabase('HANABD');

    request.onsuccess = function () {
        console.log("Deleted database successfully");
    };

    request.onerror = function () {
        console.log("Couldn't delete database");
    };

    request.onblocked = function () {
        console.log("Couldn't delete database due to the operation being blocked");
    };
}


// Lee la indexedDB y genera cards html con los planes
const leerIndexedDBOffline = () => {

    let request = window.indexedDB.open('HANABD');

    let tablon = document.getElementById('tablonDinamico');

    document.getElementById('tablonDinamico').innerHTML = ''; // Limpia tablón

    request.onsuccess = event => {

        let db = event.target.result;

        let transaction = db.transaction(['Planes'], 'readonly');

        let store = transaction.objectStore('Planes');

        let cursor = store.openCursor();

        cursor.onsuccess = event => {

            let datos = event.target.result;

            if (datos) {

                tablon.innerHTML += `
                <div class="tablon__plan--card ">
                <img src="../icons/web/lugares.png" alt="">
                <h3 id="${datos.value.id}">${datos.value.id}</h3>
                </div>
                `;
                datos.continue();
            }
        }
    }
}


/*  -------------------
         DISPLAYS
    ------------------- */

let btn = document.getElementsByClassName('tablon__plan');

const showPanel = () => {
    for (let i = 0; i < btn.length; i++) {
        btn[i].classList.toggle('oculto--plan');
    }

    document.getElementById('chat').classList.toggle('oculto--plan');
    document.getElementById('atras').classList.toggle('oculto--plan');
    document.getElementById('tablonAdd').classList.toggle('oculto--plan');
}


const atras = () => {

    for (let i = 0; i < btn.length; i++) {
        btn[i].classList.remove('oculto--plan');
    }

    document.getElementById('chat').classList.add('oculto--plan');
    document.getElementById('atras').classList.add('oculto--plan');
    document.getElementById('tablonAdd').classList.remove('oculto--plan');
}


/*  -------------------
       LISTENERS
   ------------------- */

window.onload = cargarPlanes();
window.onload = iniciarIndexedDB();

window.addEventListener('online', isOnline);
window.addEventListener('offline', isOnline);

document.body.addEventListener('click', target, false);
document.getElementById('add').addEventListener('click', addBDCollection, false);
document.getElementById('tablonDinamico').addEventListener('click', targetPlan, false);
document.getElementById('enviar').addEventListener('click', addMensaje, false);
document.getElementById('atras').addEventListener('click', atras, false);



