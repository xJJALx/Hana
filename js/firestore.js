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

// Lee BD y genera planes dinamicamente
const cargarPlanes = () => {
    let tablon = document.getElementById('tablonDinamico');

    dbRef
        .onSnapshot(snap => {
            var planes = [];
            snap.forEach(plan => {
                planes.push(plan.id);
            });

            document.getElementById('tablonDinamico').innerHTML = ''; // Limpia tablón
            for (let i = 0; i < planes.length; i++) {
                tablon.innerHTML += `
                            <div class="tablon__plan--card ">
                            <img src="../icons/web/lugares.png" alt="">
                            <h3 id="${planes[i]}">${planes[i]}</h3>
                            </div>
                            `;
            }
        });
}


// Variable global para de referenciar el plan y poder añadir mensajes 
let planRef;

// Selecciona nombres de planes generados dinamicamente
const targetPlan = (e) => {
    planRef = e.target.id;
}

// Añade mensajes al plan elegido
const addMensaje = () => {

    let f = new Date();
    let mensaje = document.getElementById('addMensaje').value;

    let msg = {
        mensaje: mensaje,
        autor: 'Admin',
        fecha: f.getHours() + ":" + f.getMinutes() + ":" + f.getSeconds() + "-" + f.getDate() + "/" + (f.getMonth() + 1) + "/" + f.getFullYear()
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


// Añade planes a la BD
const addBDCollection = () => {
    let nombrePlan = document.getElementById('addPlanValue').value;

    dbRef
        .doc(nombrePlan).set({
            plan: nombrePlan
        });
}


// Carga los mensajes dinamicamente del plan elegido
const cargarMensajes = (plan) => {
    dbRef.doc(plan)
        .collection('mensajes').onSnapshot(snap => {
            let chat = document.getElementById('innerMsg');
            document.getElementById('innerMsg').innerHTML = ''; // Limpia mensajes
            snap.forEach(snapHijo => {
                chat.innerHTML += '<div class="bubbleMsg"><p>' + snapHijo.data().autor + ": " + snapHijo.data().mensaje + '</p></div>';
            });
        });
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

window.cargarPlanes = cargarPlanes();

document.body.addEventListener('click', target, false);
document.getElementById('add').addEventListener('click', addBDCollection, false);
document.getElementById('tablonDinamico').addEventListener('click', targetPlan, false);
document.getElementById('enviar').addEventListener('click', addMensaje, false);
document.getElementById('atras').addEventListener('click', atras, false);
