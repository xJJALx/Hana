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

// Variable global para de referenciar el usuario logueado
let currentUser;

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
        setTimeout(() => {
            leerIndexedDBOffline();
        }, 3000);

    } else {
        //alert('Hay conexión');
    }
}


// Detecta el plan elegido y carga sus mensajes de Firestore
const target = (e) => {
    let plan = e.target.id;

    // Oculta el tablon con los mensajes y carga los planes
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

const limpiarInputMsg = () => {
    document.getElementById('addMensaje').value = "";
}


// Crea cards en html con los planes leidos
const creaCardPlanes = (planes) => {
    let tablon = document.getElementById('tablonDinamico');
    tablon.innerHTML = ''; // Limpia tablón
    for (let i = 0; i < planes.length; i++) {
        tablon.innerHTML += `
                    <div class="tablon__plan--card ">
                    <img src="../icons/web/lugares.png" alt="">
                    <h3 id="${planes[i]}">${planes[i]}</h3>
                    </div>
                    `;
    }
}


// Lee BD Firestore y genera planes dinamicamente, se ejecuta cuando se inicia sesión y carga los planes a los que está asociada su ID
const cargarPlanes = (usuarioID) => {
    dbRef
        .onSnapshot(snap => {
            let planes = [];
            snap.forEach(plan => {
                if (plan.id !== 'Usuarios') {
                    if (plan.data().usuarios.includes(usuarioID)) {
                        planes.push(plan.id)
                    }
                }
            });
            creaCardPlanes(planes);
        });
}

// Carga los mensajes dinamicamente del plan elegido
const cargarMensajes = (plan) => {
    document.getElementById('chatTitulo').innerHTML = '<h2>' + plan + '</h2>';
    dbRef.doc(plan)
        .collection('mensajes').orderBy('timestamp').onSnapshot(snap => {
            let chat = document.getElementById('innerMsg');
            chat.innerHTML = ''; // Limpia mensajes
            snap.forEach(snapHijo => {
                chat.innerHTML += '<div class="bubbleMsg"><p>' + snapHijo.data().autor + ": " + snapHijo.data().mensaje + '</p></div>';
            });
        });
}


// Añade mensajes al plan elegido a Firestore, también llama ala funcion que graba en IndexedDB
const addMensaje = () => {
    let f = new Date();
    let mensaje = document.getElementById('addMensaje').value;
    let autor = currentUser;
    let msg = {
        mensaje: mensaje,
        autor: autor,
        fecha: f.getDate() + "/" + (f.getMonth() + 1) + "/" + f.getFullYear(),
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };

    addMensajeIndexedDB(autor, mensaje);

    dbRef
        .doc(planRef)
        .collection('mensajes')
        .add(msg)

    limpiarInputMsg();
}



// Añade nombre e ID a Firestore - Document(Usuarios) -> Collection(IDs) -> [0]UsuarioID(String), [1]nombre(String)
const addUsuario = (uid, displayName) => {
    let ID = {
        usuarioID: uid,
        nombre: displayName
    };

    dbRef
        .doc('Usuarios')
        .collection('IDs')
        .add(ID)
}

// Añade planes a la BD Firestore y los usuarios que pueden acceder a él - Llama ala funcion que graba en la indexedDB 
const addPlanDBCollection = (usuarios) => {
    let nombrePlan = document.getElementById('addPlanValue').value;
    addPlanesIndexedDB(nombrePlan, null)

    dbRef
        .doc(nombrePlan).set({
            plan: nombrePlan,
            usuarios: usuarios
        });
}

// Recibe un array vacio en el que graba todos los usuarios - primero el nombre de usuario y despues su ID
const getAllUsersFirestore = (usuarios) => {
    dbRef
        .onSnapshot(snap => {
            snap.forEach(plan => {
                if (plan.id === 'Usuarios') {
                    plan.ref.collection('IDs').onSnapshot(snapHijo => {
                        snapHijo.forEach((document) => {
                            usuarios.push(document.data().nombre);
                            usuarios.push(document.data().usuarioID);
                        });
                    });
                }
            });
        });
}

// Muestra los usuarios que hay registrados para añadirlos al plan creado
const listarUsuarios = () => {
    let usuarios = [];
    let tablon = document.getElementById('listaUsuarios');

    document.getElementById('tablonUsuarios').classList.remove('oculto--plan');

    const datos = new Promise((resolve, reject) => {
        if (usuarios.length == 0) {
            resolve(getAllUsersFirestore(usuarios));
        } else {
            reject(console.log('No hay usuarios'));
        }
    });

    setTimeout(() => {
        for (let i = 0; i < usuarios.length; i += 2) {
            if (usuarios[i + 1] === currentUserID) {
                tablon.innerHTML +=
                    `<label><input type="checkbox" name="userCheckbox" value="${usuarios[i + 1]}"  checked="checked">${usuarios[i]}</label></br>`;
            } else {
                tablon.innerHTML +=
                    `<label><input type="checkbox" name="userCheckbox" value="${usuarios[i + 1]}">${usuarios[i]}</label></br>`;
            }
        }
    }, 400);

    // De esta forma no espera a que se añadan los usuarios al array en el resolve()
    // datos
    //     .then(() => {
    //         console.log(usuarios + ' usu' );
    //         for (let i = 0; i < usuarios.length; i += 2) {
    //             if (usuarios[i + 1] === currentUserID) {
    //                 document.getElementById('tablonDinamico').innerHTML +=
    //                     `<label><input type="checkbox" name="userCheckbox" value="${usuarios[i + 1]}"  checked="checked">${usuarios[i]}</label></br>`;
    //             } else {
    //                 document.getElementById('tablonDinamico').innerHTML +=
    //                     `<label><input type="checkbox" name="userCheckbox" value="${usuarios[i + 1]}">${usuarios[i]}</label></br>`;
    //             }
    //         }
    //     });
}

// Coge el ID de los usuarios seleccionados para añadirlos al Document(Usuarios) de cada PLAN en forma de string separado por ";"
const leerUsuariosSeleccionados = () => {
    const seleccionados = document.getElementsByName('userCheckbox');
    let usuarios;
    for (let e of seleccionados) {
        if (e.checked === true) {
            usuarios += ';' + e.value;
        }
    }
    addPlanDBCollection(usuarios);
    document.getElementById('tablonUsuarios').classList.add('oculto--plan');
}


/*  -------------------
        INDEXEDDB
    ------------------- */


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
            addPlanesIndexedDB(null, null);
        }, 3000);
    }
}


// Añade los planes del tablon a la indexedDB
const addPlanesIndexedDB = (p, datos) => {
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
            if (datos === null) {
                store.add({ id: plan, datos: datos });
            } else {
                if (plan === p) store.put({ id: plan, datos: datos });
            }
        }

        db.close();
    }
}

// Añade el mensaje al indexedDB 
const addMensajeIndexedDB = (autor, mensaje) => {
    let datos = `autor:${autor};mensaje:${mensaje};`;

    addPlanesIndexedDB(planRef, datos);

}

// Añade todos los mensajes a la indexedDB, requiere de conexion a internet.
const addMensajeIndexedDB2 = () => {
    dbRef.doc(planRef)
        .collection('mensajes').orderBy('timestamp').onSnapshot(snap => {
            let datos;
            snap.forEach(snapHijo => {
                datos += `;autor:${snapHijo.data().autor};mensaje:${snapHijo.data().mensaje}`;
            });
            addPlanesIndexedDB(planRef, datos);
        });
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

    tablon.innerHTML = ''; // Limpia tablón

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


// OPCIONAL (No se ha usado, falta mejorarlo) - carga los mensajes del indexedDB si no hay internet
// Por defecto se cargan del caché dinamico
const cargarMensajesIndexedDBOffline = (idPlan) => {

    //document.getElementById('tablonOff').classList.remove('oculto--plan');

    //let tablonOff = document.getElementById('tablonOff');

    let request = window.indexedDB.open('HANABD');

    let tablon = document.getElementById('tablonDinamico');

    request.onsuccess = event => {

        let db = event.target.result;

        let transaction = db.transaction(['Planes'], 'readonly');

        let store = transaction.objectStore('Planes');

        let cursor = store.openCursor();

        cursor.onsuccess = event => {

            let datos = event.target.result;

            if (datos) {

                let array = [];

                if (datos.value.id === idPlan) {
                    array = datos.value.datos.split(/;|:/)
                    for (let i = 1; i < array.length; i += 2) {
                        console.log(array[i]);
                        tablonOff.innerHTML +=
                            '<div class="bubbleMsg"><p>' + array[i] + ": " + array[i + 1] + '</p></div>';
                    }
                }
                datos.continue();
            }
        }
    }
}



/*  -------------------
         LOGIN
   ------------------- */


const registrar = () => {
    let email = document.getElementById('id_emailReg').value;
    let pass = document.getElementById('id_passReg').value;
    let user = document.getElementById('id_usuario').value;

    const datos = new Promise((resolve, reject) => {

        if ((email && pass && user) !== '') {
            resolve(
                firebase.auth().createUserWithEmailAndPassword(email, pass)
                    .then(() => {
                        firebase.auth().currentUser.updateProfile({
                            displayName: user,
                        });
                        addUsuario(firebase.auth().currentUser.uid, user);
                    })
                    .catch((error) => {
                        console.log(error.message);
                    }));
        } else {
            reject(alert('Debes introducir todos los datos'));
        }
    });

    datos
        .then(() => {
            verificarCorreo();
        });
}


const login = () => {
    let email = document.getElementById('id_emailLogin').value;
    let pass = document.getElementById('id_passLogin').value;

    firebase.auth().signInWithEmailAndPassword(email, pass)
        .then(() => { console.log('Logueado'); })
        .catch((error) => { console.log(error.message); });
}

const verificarCorreo = () => {
    let user = firebase.auth().currentUser;

    user.sendEmailVerification()
        .then(() => console.log('Enviando email de verificación'))
        .catch(() => console.log('Error de verificación'));
}

const logout = () => {
    firebase.auth().signOut();
    location.reload();
}

const observador = () => {
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            ifLogin();
            currentUser = user.displayName;
            currentUserID = user.uid;

            console.log('Hola ' + currentUser);

            cargarPlanes(currentUserID);

            /***** WARNING! ******/
            // Algunas veces al registrarse no da tiempo a que la variable currentUser tome el valor y lo deja a null, recargo para 'solventarlo' momentaneamente
            // Si se crea un plan en estas circunstancias el nombre de usuario es null si se escribe algun mensaje, recargamos para que tome valor la variable
            // No ha sido corregido porque creia que entendia las promesas pero aun se me escapan cosas - Probar con otra logica tambien.
            /***** WARNING! ******/


            /* Eventos que deben funcionar solo si se ha iniciado sesión */
            document.getElementById('add').addEventListener('click', listarUsuarios);
            document.getElementById('checkBoxOK').addEventListener('click', leerUsuariosSeleccionados);
            document.getElementById('enviar').addEventListener('click', addMensaje);

        } else {
            ifNoLogin();
            console.log('No hay usuario activo')

        }
    });
}


/*  -------------------
         DISPLAYS
    ------------------- */

let btn = document.getElementsByClassName('tablon__plan');

const showPanel = () => {
    for (let i = 0; i < btn.length; i++) {
        btn[i].classList.add('oculto--plan');
    }

    document.getElementById('chat').classList.remove('oculto--plan');
    document.getElementById('atras').classList.remove('oculto--plan');
    document.getElementById('tablonAdd').classList.add('oculto--plan');
}


const atras = () => {
    document.getElementById('innerMsg').innerHTML = '';
    for (let i = 0; i < btn.length; i++) {
        btn[i].classList.remove('oculto--plan');
    }

    document.getElementById('chat').classList.add('oculto--plan');
    document.getElementById('atras').classList.add('oculto--plan');
    document.getElementById('tablonAdd').classList.remove('oculto--plan');

}

const ifLogin = () => {
    document.getElementById('tablonAdd').classList.add('tablon__add--visible');
    document.getElementById('tablonAdd').classList.remove('oculto--tab');
    document.getElementById('loginRegistro').classList.add('oculto--tab');
    document.getElementById('addMensaje').classList.remove('oculto--plan');
    document.getElementById('enviar').classList.remove('oculto--plan');
}

const ifNoLogin = () => {
    document.getElementById('tablonAdd').classList.remove('tablon__add--visible');
    document.getElementById('tablonAdd').classList.add('oculto--tab');
    document.getElementById('loginRegistro').classList.remove('oculto--tab');
    document.getElementById('addMensaje').classList.add('oculto--plan');
    document.getElementById('enviar').classList.add('oculto--plan');
}


/*  -------------------
         TEMA KDA
    ------------------- */

let active = document.getElementById('switch');
let fondo = document.body;
let titulo = document.getElementsByTagName('h1')[0];
let tablon = document.getElementById('tablon');

const temaKDA = () => {
    active.classList.toggle('active');
    fondo.classList.toggle('fondo--kda');
    titulo.classList.toggle('kda');
    tablon.classList.toggle('tablon--kda');

    // Guardar modo
    if (document.body.classList.contains('fondo--kda')) {
        localStorage.setItem('kda-mode', 'true');
    } else {
        localStorage.setItem('kda-mode', 'false');
    }
}

// Obtener modo
if (localStorage.getItem('kda-mode') === 'true') {
    active.classList.add('active');
    fondo.classList.add('fondo--kda');
    titulo.classList.add('kda');
    tablon.classList.add('tablon--kda');

} else {
    active.classList.remove('active');
    fondo.classList.remove('fondo--kda');
    titulo.classList.remove('kda');
    tablon.classList.remove('tablon--kda');
}



/*  -------------------
       LISTENERS
   ------------------- */


window.onload = iniciarIndexedDB();
window.onload = observador();

window.addEventListener('online', isOnline);
window.addEventListener('offline', isOnline);


document.getElementById('registrar').addEventListener('click', registrar, false);
document.getElementById('login').addEventListener('click', login, false);
document.getElementById('Logout').addEventListener('click', logout, false);


document.body.addEventListener('click', target, false);
document.getElementById('tablonDinamico').addEventListener('click', targetPlan, false);
document.getElementById('atras').addEventListener('click', atras, false);

document.getElementById('switch').addEventListener('click', temaKDA, false);



