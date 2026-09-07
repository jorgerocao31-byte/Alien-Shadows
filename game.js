const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;


// ==================================================
// ESTADO
// ==================================================

let jugando = false;
let pausado = false;

let puntos = 0;

let balas = [];

let enemigos = [];

let trampas = [];

let teclas = {};


// ==================================================
// JUGADOR
// ==================================================

let jugador = {

    x: canvas.width / 2,
    y: canvas.height / 2,

    tamaño: 18,

    velocidad: 4,

    vida: 100

};


// ==================================================
// MOUSE
// ==================================================

let mouse = {

    x: canvas.width / 2,
    y: canvas.height / 2

};


// ==================================================
// ARMAS
// ==================================================

let armaActual = 1;

let armas = {

    1: {
        nombre: "Pistola Láser",
        daño: 1,
        velocidad: 12,
        balas: 1,
        enfriamiento: 220
    },

    2: {
        nombre: "Escopeta Espacial",
        daño: 1,
        velocidad: 9,
        balas: 5,
        enfriamiento: 600
    },

    3: {
        nombre: "Katana Eléctrica",
        daño: 3,
        velocidad: 0,
        balas: 0,
        enfriamiento: 500
    }

};

let ultimoDisparo = 0;


// ==================================================
// TECLADO
// ==================================================

document.addEventListener("keydown", (e) => {

    teclas[e.key.toLowerCase()] = true;


    // Cambiar armas

    if (e.key === "1") {

        armaActual = 1;

        actualizarHUD();

        sonidoCambio();

    }

    if (e.key === "2") {

        armaActual = 2;

        actualizarHUD();

        sonidoCambio();

    }

    if (e.key === "3") {

        armaActual = 3;

        actualizarHUD();

        sonidoCambio();

    }


    // PAUSA

    if (e.key === "Escape" && jugando) {

        pausado = !pausado;

        document.getElementById("pausa").style.display =
            pausado ? "flex" : "none";

        if (pausado) {

            sonidoPausa();

        }

    }

});


document.addEventListener("keyup", (e) => {

    teclas[e.key.toLowerCase()] = false;

});


// ==================================================
// MOUSE
// ==================================================

canvas.addEventListener("mousemove", (e) => {

    mouse.x = e.clientX;

    mouse.y = e.clientY;

});


canvas.addEventListener("mousedown", () => {

    atacar();

});


// ==================================================
// INICIAR
// ==================================================

function iniciarJuego() {

    jugador.x = canvas.width / 2;
    jugador.y = canvas.height / 2;

    jugador.vida = 100;

    puntos = 0;

    balas = [];

    enemigos = [];

    trampas = [];

    armaActual = 1;

    jugando = true;

    pausado = false;

    document.getElementById("menu").style.display = "none";

    document.getElementById("pausa").style.display = "none";

    document.getElementById("gameOver").style.display = "none";

    document.getElementById("hud").style.display = "block";

    actualizarHUD();

    sonidoInicio();

    juego();

}


// ==================================================
// CONTINUAR
// ==================================================

function continuarJuego() {

    pausado = false;

    document.getElementById("pausa").style.display = "none";

}


// ==================================================
// VOLVER AL MENÚ
// ==================================================

function volverAlMenu() {

    jugando = false;

    pausado = false;

    balas = [];

    enemigos = [];

    trampas = [];

    document.getElementById("menu").style.display = "flex";

    document.getElementById("pausa").style.display = "none";

    document.getElementById("gameOver").style.display = "none";

    document.getElementById("hud").style.display = "none";

}


// ==================================================
// HUD
// ==================================================

function actualizarHUD() {

    document.getElementById("vida").textContent =
        Math.max(0, jugador.vida);

    document.getElementById("puntos").textContent =
        puntos;

    document.getElementById("arma").textContent =
        armas[armaActual].nombre;

}


// ==================================================
// MOVIMIENTO
// ==================================================

function moverJugador() {

    if (teclas["w"]) {

        jugador.y -= jugador.velocidad;

    }

    if (teclas["s"]) {

        jugador.y += jugador.velocidad;

    }

    if (teclas["a"]) {

        jugador.x -= jugador.velocidad;

    }

    if (teclas["d"]) {

        jugador.x += jugador.velocidad;

    }


    jugador.x = Math.max(
        jugador.tamaño,
        Math.min(
            canvas.width - jugador.tamaño,
            jugador.x
        )
    );


    jugador.y = Math.max(
        jugador.tamaño,
        Math.min(
            canvas.height - jugador.tamaño,
            jugador.y
        )
    );

}


// ==================================================
// ATACAR
// ==================================================

function atacar() {

    if (!jugando || pausado) {

        return;

    }


    let ahora = Date.now();

    let arma = armas[armaActual];


    if (ahora - ultimoDisparo < arma.enfriamiento) {

        return;

    }


    ultimoDisparo = ahora;


    // ==================================================
    // KATANA
    // ==================================================

    if (armaActual === 3) {

        atacarKatana();

        return;

    }


    // ==================================================
    // ARMAS DE PROYECTILES
    // ==================================================

    let dx = mouse.x - jugador.x;

    let dy = mouse.y - jugador.y;


    let distancia = Math.sqrt(
        dx * dx + dy * dy
    );


    if (distancia === 0) {

        return;

    }


    let anguloBase = Math.atan2(dy, dx);


    for (let i = 0; i < arma.balas; i++) {

        let angulo = anguloBase;


        if (armaActual === 2) {

            angulo +=
                (i - 2) * 0.12;

        }


        balas.push({

            x: jugador.x,

            y: jugador.y,

            dx: Math.cos(angulo) * arma.velocidad,

            dy: Math.sin(angulo) * arma.velocidad,

            daño: arma.daño,

            tamaño: 4

        });

    }


    if (armaActual === 1) {

        sonidoPistola();

    }

    if (armaActual === 2) {

        sonidoEscopeta();

    }

}


// ==================================================
// KATANA
// ==================================================

function atacarKatana() {

    sonidoKatana();


    let alcance = 65;


    for (let i = enemigos.length - 1; i >= 0; i--) {

        let enemigo = enemigos[i];


        let dx = enemigo.x - jugador.x;

        let dy = enemigo.y - jugador.y;


        let distancia = Math.sqrt(
            dx * dx + dy * dy
        );


        if (distancia < alcance) {

            enemigo.vida -= 3;


            if (enemigo.vida <= 0) {

                puntos += enemigo.puntos;

                enemigos.splice(i, 1);

            }

        }

    }

}


// ==================================================
// BALAS
// ==================================================

function actualizarBalas() {

    for (
        let i = balas.length - 1;
        i >= 0;
        i--
    ) {

        let bala = balas[i];


        bala.x += bala.dx;

        bala.y += bala.dy;


        if (

            bala.x < 0 ||

            bala.x > canvas.width ||

            bala.y < 0 ||

            bala.y > canvas.height

        ) {

            balas.splice(i, 1);

        }

    }

}


// ==================================================
// CREAR ALIENS
// ==================================================

function crearAlien() {

    let lado =
        Math.floor(Math.random() * 4);


    let x;
    let y;


    if (lado === 0) {

        x = -30;

        y = Math.random() * canvas.height;

    }

    if (lado === 1) {

        x = canvas.width + 30;

        y = Math.random() * canvas.height;

    }

    if (lado === 2) {

        x = Math.random() * canvas.width;

        y = -30;

    }

    if (lado === 3) {

        x = Math.random() * canvas.width;

        y = canvas.height + 30;

    }


    let tipo =
        Math.random();


    // ==================================================
    // ALIEN EXPLORADOR
    // ==================================================

    if (tipo < 0.40) {

        enemigos.push({

            x: x,

            y: y,

            tamaño: 18,

            velocidad: 1.2,

            vida: 2,

            puntos: 10,

            tipo: "explorador"

        });

    }


    // ==================================================
    // ALIEN RÁPIDO
    // ==================================================

    else if (tipo < 0.60) {

        enemigos.push({

            x: x,

            y: y,

            tamaño: 12,

            velocidad: 2.7,

            vida: 1,

            puntos: 20,

            tipo: "rapido"

        });

    }


    // ==================================================
    // ALIEN GIGANTE
    // ==================================================

    else if (tipo < 0.78) {

        enemigos.push({

            x: x,

            y: y,

            tamaño: 30,

            velocidad: 0.7,

            vida: 6,

            puntos: 40,

            tipo: "gigante"

        });

    }


    // ==================================================
    // ALIEN ACECHADOR
    // ==================================================

    else if (tipo < 0.91) {

        enemigos.push({

            x: x,

            y: y,

            tamaño: 16,

            velocidad: 1.8,

            vida: 3,

            puntos: 30,

            tipo: "acechador"

        });

    }


    // ==================================================
    // ALIEN SALTADOR
    // ==================================================

    else {

        enemigos.push({

            x: x,

            y: y,

            tamaño: 20,

            velocidad: 1.5,

            vida: 3,

            puntos: 35,

            tipo: "saltador",

            salto: 0

        });

    }

}


// ==================================================
// ACTUALIZAR ALIENS
// ==================================================

function actualizarEnemigos() {

    for (
        let i = enemigos.length - 1;
        i >= 0;
        i--
    ) {

        let enemigo = enemigos[i];


        let dx =
            jugador.x - enemigo.x;

        let dy =
            jugador.y - enemigo.y;


        let distancia =
            Math.sqrt(dx * dx + dy * dy);


        if (distancia > 0) {

            enemigo.x +=
                (dx / distancia) *
                enemigo.velocidad;

            enemigo.y +=
                (dy / distancia) *
                enemigo.velocidad;

        }


        // ==================================================
        // ALIEN SALTADOR
        // ==================================================

        if (enemigo.tipo === "saltador") {

            enemigo.salto++;

            if (enemigo.salto > 120) {

                enemigo.salto = 0;

            }

        }


        // ==================================================
        // CONTACTO
        // ==================================================

        if (
            distancia <
            jugador.tamaño +
            enemigo.tamaño
        ) {

            jugador.vida -= 0.4;

            actualizarHUD();


            if (jugador.vida <= 0) {

                terminarJuego();

                return;

            }

        }

    }

}


// ==================================================
// COLISIONES BALAS
// ==================================================

function detectarColisiones() {

    for (
        let i = balas.length - 1;
        i >= 0;
        i--
    ) {

        for (
            let j = enemigos.length - 1;
            j >= 0;
            j--
        ) {

            let bala =
                balas[i];

            let enemigo =
                enemigos[j];


            let dx =
                bala.x -
                enemigo.x;

            let dy =
                bala.y -
                enemigo.y;


            let distancia =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );


            if (
                distancia <
                bala.tamaño +
                enemigo.tamaño
            ) {

                enemigo.vida -=
                    bala.daño;


                balas.splice(i, 1);


                if (enemigo.vida <= 0) {

                    puntos +=
                        enemigo.puntos;

                    enemigos.splice(j, 1);

                    sonidoAlienDerrotado();

                }

                break;

            }

        }

    }

}


// ==================================================
// TRAMPAS
// ==================================================

function crearTrampa() {

    trampas.push({

        x:
            Math.random() *
            canvas.width,

        y:
            Math.random() *
            canvas.height,

        radio: 25,

        activa: true

    });

}


// ==================================================
// ACTUALIZAR TRAMPAS
// ==================================================

function actualizarTrampas() {

    for (let trampa of trampas) {

        if (!trampa.activa) {

            continue;

        }


        for (let enemigo of enemigos) {

            let dx =
                enemigo.x -
                trampa.x;

            let dy =
                enemigo.y -
                trampa.y;


            let distancia =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );


            if (
                distancia <
                trampa.radio +
                enemigo.tamaño
            ) {

                enemigo.vida -= 2;

                trampa.activa = false;

                sonidoTrampa();


                if (enemigo.vida <= 0) {

                    puntos +=
                        enemigo.puntos;

                }

            }

        }

    }


    trampas =
        trampas.filter(
            t => t.activa
        );

}


// ==================================================
// MAPA
// ==================================================

function dibujarMapa() {

    // Fondo

    ctx.fillStyle = "#08100b";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // Terreno

    ctx.fillStyle = "#101b14";


    for (
        let x = 0;
        x < canvas.width;
        x += 70
    ) {

        for (
            let y = 0;
            y < canvas.height;
            y += 70
        ) {

            ctx.fillRect(
                x,
                y,
                67,
                67
            );

        }

    }


    // Rocas

    for (let i = 0; i < 35; i++) {

        let x =
            (i * 347) %
            canvas.width;

        let y =
            (i * 217) %
            canvas.height;


        ctx.fillStyle = "#252d29";


        ctx.fillRect(
            x,
            y,
            25 + (i % 3) * 10,
            18 + (i % 4) * 6
        );

    }


    // Plantas alienígenas

    for (let i = 0; i < 25; i++) {

        let x =
            (i * 421) %
            canvas.width;

        let y =
            (i * 277) %
            canvas.height;


        ctx.strokeStyle = "#345b42";

        ctx.lineWidth = 5;


        ctx.beginPath();

        ctx.moveTo(x, y + 20);

        ctx.lineTo(x, y - 18);

        ctx.stroke();


        ctx.fillStyle = "#4c805b";


        ctx.beginPath();

        ctx.arc(
            x,
            y - 22,
            9,
            0,
            Math.PI * 2
        );

        ctx.fill();

    }


    // Suelo misterioso

    ctx.fillStyle =
        "rgba(50,80,60,0.08)";


    for (let i = 0; i < 15; i++) {

        let x =
            Math.random() *
            canvas.width;

        let y =
            Math.random() *
            canvas.height;


        ctx.beginPath();

        ctx.arc(
            x,
            y,
            50,
            0,
            Math.PI * 2
        );

        ctx.fill();

    }

}


// ==================================================
// DIBUJAR JUGADOR
// ==================================================

function dibujarJugador() {

    // Cuerpo

    ctx.fillStyle = "#55798a";


    ctx.fillRect(
        jugador.x - 14,
        jugador.y - 8,
        28,
        22
    );


    // Casco

    ctx.fillStyle = "#c8d1d3";


    ctx.fillRect(
        jugador.x - 12,
        jugador.y - 20,
        24,
        14
    );


    // Visor

    ctx.fillStyle = "#162b34";


    ctx.fillRect(
        jugador.x - 9,
        jugador.y - 17,
        18,
        7
    );


    // Mochila

    ctx.fillStyle = "#40545d";


    ctx.fillRect(
        jugador.x - 19,
        jugador.y - 5,
        6,
        17
    );


    // Arma

    let dx =
        mouse.x -
        jugador.x;

    let dy =
        mouse.y -
        jugador.y;


    let distancia =
        Math.sqrt(
            dx * dx +
            dy * dy
        );


    if (distancia > 0) {

        let largo =
            armaActual === 3
                ? 42
                : 32;


        ctx.strokeStyle =
            armaActual === 3
                ? "#80ffff"
                : "#c9d2d5";


        ctx.lineWidth =
            armaActual === 3
                ? 7
                : 5;


        ctx.beginPath();

        ctx.moveTo(
            jugador.x,
            jugador.y
        );

        ctx.lineTo(
            jugador.x +
            (dx / distancia) *
            largo,

            jugador.y +
            (dy / distancia) *
            largo
        );

        ctx.stroke();

    }

}


// ==================================================
// DIBUJAR ALIENS
// ==================================================

function dibujarEnemigos() {

    enemigos.forEach((enemigo) => {


        // Explorador

        if (
            enemigo.tipo ===
            "explorador"
        ) {

            ctx.fillStyle = "#67a86e";

        }


        // Rápido

        if (
            enemigo.tipo ===
            "rapido"
        ) {

            ctx.fillStyle = "#a75ec9";

        }


        // Gigante

        if (
            enemigo.tipo ===
            "gigante"
        ) {

            ctx.fillStyle = "#4e9560";

        }


        // Acechador

        if (
            enemigo.tipo ===
            "acechador"
        ) {

            ctx.fillStyle = "#315d75";

        }


        // Saltador

        if (
            enemigo.tipo ===
            "saltador"
        ) {

            ctx.fillStyle = "#bd773e";

        }


        // Cuerpo

        ctx.beginPath();

        ctx.arc(
            enemigo.x,
            enemigo.y,
            enemigo.tamaño,
            0,
            Math.PI * 2
        );

        ctx.fill();


        // Ojos

        ctx.fillStyle = "#d8ffff";


        ctx.fillRect(
            enemigo.x - 8,
            enemigo.y - 5,
            5,
            5
        );


        ctx.fillRect(
            enemigo.x + 3,
            enemigo.y - 5,
            5,
            5
        );


        // Barra de vida

        if (enemigo.vida > 2) {

            let ancho = 40;


            ctx.fillStyle = "#303030";


            ctx.fillRect(
                enemigo.x - 20,
                enemigo.y -
                enemigo.tamaño -
                10,
                ancho,
                5
            );


            ctx.fillStyle = "#ffffff";


            ctx.fillRect(
                enemigo.x - 20,
                enemigo.y -
                enemigo.tamaño -
                10,
                Math.max(
                    0,
                    (enemigo.vida / 6) *
                    ancho
                ),
                5
            );

        }

    });

}


// ==================================================
// DIBUJAR BALAS
// ==================================================

function dibujarBalas() {

    balas.forEach((bala) => {

        ctx.fillStyle =
            armaActual === 2
                ? "#ffff80"
                : "#7fffff";


        ctx.beginPath();

        ctx.arc(
            bala.x,
            bala.y,
            bala.tamaño,
            0,
            Math.PI * 2
        );

        ctx.fill();

    });

}


// ==================================================
// DIBUJAR TRAMPAS
// ==================================================

function dibujarTrampas() {

    trampas.forEach((trampa) => {

        ctx.strokeStyle = "#6c8";

        ctx.lineWidth = 2;


        ctx.beginPath();

        ctx.arc(
            trampa.x,
            trampa.y,
            trampa.radio,
            0,
            Math.PI * 2
        );

        ctx.stroke();


        ctx.fillStyle =
            "rgba(100,255,150,0.15)";


        ctx.fill();

    });

}


// ==================================================
// LINTERNA
// ==================================================

function dibujarLinterna() {

    let dx =
        mouse.x -
        jugador.x;

    let dy =
        mouse.y -
        jugador.y;


    let distancia =
        Math.sqrt(
            dx * dx +
            dy * dy
        );


    if (distancia === 0) {

        return;

    }


    let angulo =
        Math.atan2(dy, dx);


    let alcance = 320;


    let gradiente =
        ctx.createRadialGradient(
            jugador.x,
            jugador.y,
            20,
            jugador.x,
            jugador.y,
            alcance
        );


    gradiente.addColorStop(
        0,
        "rgba(255,255,220,0.30)"
    );


    gradiente.addColorStop(
        1,
        "rgba(0,0,0,0)"
    );


    ctx.fillStyle =
        gradiente;


    ctx.beginPath();


    ctx.moveTo(
        jugador.x,
        jugador.y
    );


    ctx.arc(
        jugador.x,
        jugador.y,
        alcance,
        angulo - 0.45,
        angulo + 0.45
    );


    ctx.closePath();


    ctx.fill();

}


// ==================================================
// OSCURIDAD
// ==================================================

function dibujarOscuridad() {

    ctx.fillStyle =
        "rgba(0,0,0,0.60)";


    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    dibujarLinterna();

}


// ==================================================
// BUCLE
// ==================================================

function juego() {

    if (!jugando) {

        return;

    }


    if (!pausado) {

        moverJugador();

        actualizarBalas();

        actualizarEnemigos();

        detectarColisiones();

        actualizarTrampas();

        actualizarHUD();

    }


    dibujarMapa();

    dibujarTrampas();

    dibujarBalas();

    dibujarEnemigos();

    dibujarJugador();

    dibujarOscuridad();


    requestAnimationFrame(juego);

}


// ==================================================
// GAME OVER
// ==================================================

function terminarJuego() {

    jugando = false;

    pausado = false;


    document.getElementById(
        "puntuacionFinal"
    ).textContent = puntos;


    document.getElementById(
        "gameOver"
    ).style.display = "flex";


    sonidoGameOver();

}


// ==================================================
// CREAR ALIENS AUTOMÁTICAMENTE
// ==================================================

setInterval(() => {

    if (jugando && !pausado) {

        crearAlien();

    }

}, 1500);


// ==================================================
// CREAR TRAMPAS
// ==================================================

setInterval(() => {

    if (jugando && !pausado) {

        crearTrampa();

    }

}, 5000);


// ==================================================
// SONIDOS CON CÓDIGO
// ==================================================

let audioContext = null;


function iniciarAudio() {

    if (!audioContext) {

        audioContext =
            new (
                window.AudioContext ||
                window.webkitAudioContext
            )();

    }

}


function sonido(frecuencia, duracion, tipo = "square") {

    iniciarAudio();


    let oscilador =
        audioContext.createOscillator();

    let ganancia =
        audioContext.createGain();


    oscilador.type = tipo;

    oscilador.frequency.value =
        frecuencia;


    ganancia.gain.setValueAtTime(
        0.08,
        audioContext.currentTime
    );


    ganancia.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime +
        duracion
    );


    oscilador.connect(ganancia);

    ganancia.connect(
        audioContext.destination
    );


    oscilador.start();

    oscilador.stop(
        audioContext.currentTime +
        duracion
    );

}


// ==================================================
// SONIDOS
// ==================================================

function sonidoPistola() {

    sonido(
        700,
        0.08,
        "square"
    );

}


function sonidoEscopeta() {

    sonido(
        180,
        0.18,
        "sawtooth"
    );

}


function sonidoKatana() {

    sonido(
        900,
        0.25,
        "triangle"
    );

}


function sonidoCambio() {

    sonido(
        500,
        0.08,
        "sine"
    );

}


function sonidoTrampa() {

    sonido(
        250,
        0.30,
        "square"
    );

}


function sonidoAlienDerrotado() {

    sonido(
        150,
        0.15,
        "triangle"
    );

}


function sonidoInicio() {

    sonido(
        300,
        0.20,
        "sine"
    );

}


function sonidoPausa() {

    sonido(
        200,
        0.15,
        "sine"
    );

}


function sonidoGameOver() {

    sonido(
        100,
        0.50,
        "sawtooth"
    );

}


// ==================================================
// CAMBIO DE TAMAÑO
// ==================================================

window.addEventListener(
    "resize",
    () => {

        canvas.width =
            window.innerWidth;

        canvas.height =
            window.innerHeight;

    }
);
