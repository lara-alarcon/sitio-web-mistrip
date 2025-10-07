// Array con datos de las canciones
const misCanciones = [
  {
    id: "xPHfFHI4q-Y",
    titulo: "A Puro Bangarang | Pomni Y Jax",
    artista: "Mistrip ft. Iris",
    año: "2025",
  },
  {
    id: "6zXL4ZlMcME",
    titulo: "DANDADAN MACRO RAP",
    artista: "Mistrip ft. Bawsersaurus Rex Keylu Kia Miamiamiau & MisSy",
    año: "2025",
  },
  {
    id: "a1rQ2qfq8-Y",
    titulo: "Fantastic 4: Primeros pasos RAP",
    artista: "Mistrip ft. Bawsersaurus Rex! & Miamiamiau",
    año: "2025",
  },
  {
    id: "9WOj8z-gPpA",
    titulo: "SENDOKAI MACRO RAP",
    artista: "Mistrip ft. Yaelol D, Iris, MisSy & Kenkisaurio",
    año: "2025",
  },
  {
    id: "TEJzDo5aK04",
    titulo: "RICK SANCHEZ RAP - BALA INTERDIMENSIONAL",
    artista: "Mistrip",
    año: "2025",
  },
  {
    id: "jigfUWdTwSU",
    titulo: "Momo x Okarun RAP",
    artista: "Mistrip",
    año: "2025",
  },
];

// YouTube IFrame API
const canciones = {};
const playerListo = {}; // <-- nuevo objeto para saber si el player está listo
let cancionActual = null;
let estaReproduciendo = false;
let intervaloProgreso;

// Inicializar la API de YouTube
function onYouTubeIframeAPIReady() {
  misCanciones.forEach((cancion, index) => {
    const numero = index + 1;

    canciones[numero] = {
      videoId: cancion.id,
      player: null,
    };

    const config = {
      videoId: cancion.id,
      height: "0",
      width: "0",
      playerVars: {
        playsinline: 1,
        controls: 0,
        rel: 0,
        modestbranding: 1,
        showinfo: 0,
        enablejsapi: 1,
      },
      events: {
        onReady: (event) => onPlayerReady(event, numero),
        onStateChange: (event) => onPlayerStateChange(event, numero),
      },
    };

    canciones[numero].player = new YT.Player(`player_${numero}`, config);
  });
}

// Reproductor listo
function onPlayerReady(event, numero) {
  const player = canciones[numero].player;
  playerListo[numero] = true; // <-- marcamos el player como listo

  const duration = player.getDuration();

  if (duration > 0) {
    document.getElementById(`tiempo_total_${numero}`).textContent =
      formatearTiempo(duration);
  }

  document.getElementById(`player_${numero}`).style.display = "none";
}

// Cambia el estado del reproductor
function onPlayerStateChange(event, numero) {
  const player = canciones[numero].player;
  const portada = document.getElementById(`cancion_portada_${numero}`);
  const botonPlay = document.getElementById(`boton_play_pausa_${numero}`);

  if (event.data == YT.PlayerState.PLAYING) {
    estaReproduciendo = true;
    cancionActual = numero;

    botonPlay.textContent = "⏸";
    document.getElementById(`punto_progreso_${numero}`).style.display = "block";
    portada.classList.add("reproduciendo");

    clearInterval(intervaloProgreso);
    intervaloProgreso = setInterval(() => actualizarProgreso(numero), 500);
  } else if (event.data == YT.PlayerState.PAUSED) {
    estaReproduciendo = false;
    botonPlay.textContent = "▶";
    document.getElementById(`punto_progreso_${numero}`).style.display = "none";
    portada.classList.remove("reproduciendo");
    clearInterval(intervaloProgreso);
  } else if (event.data == YT.PlayerState.ENDED) {
    estaReproduciendo = false;
    cancionActual = null;
    botonPlay.textContent = "▶";
    document.getElementById(`punto_progreso_${numero}`).style.display = "none";
    resetearProgreso(numero);
    portada.classList.remove("reproduciendo");
    clearInterval(intervaloProgreso);
  }
}

function resetearProgreso(numero) {
  document.getElementById(`progreso_${numero}`).style.width = "0%";
  document.getElementById(`punto_progreso_${numero}`).style.left = "0%";
  document.getElementById(`tiempo_actual_${numero}`).textContent = "0:00";
}

function formatearTiempo(segundos) {
  const min = Math.floor(segundos / 60);
  const sec = Math.floor(segundos % 60);
  return `${min}:${sec < 10 ? "0" + sec : sec}`;
}

function actualizarProgreso(numero) {
  const player = canciones[numero].player;
  if (player && player.getCurrentTime) {
    const tiempoActual = player.getCurrentTime();
    const duracion = player.getDuration();
    const porcentaje = (tiempoActual / duracion) * 100;

    document.getElementById(`progreso_${numero}`).style.width =
      porcentaje + "%";
    document.getElementById(`punto_progreso_${numero}`).style.left =
      porcentaje + "%";
    document.getElementById(`tiempo_actual_${numero}`).textContent =
      formatearTiempo(tiempoActual);
  }
}

// Generar galería de canciones
function generarGaleriaMusica() {
  const galeria = document.getElementById("galeria_musica");

  misCanciones.forEach((cancion, index) => {
    const numero = index + 1;

    const cancionHTML = `
            <div class="contenedor_cancion">
              <div class="cancion_portada" id="cancion_portada_${numero}">
                <img src="https://img.youtube.com/vi/${cancion.id}/maxresdefault.jpg" alt="${cancion.titulo}" />
                <button class="boton_play_pausa" id="boton_play_pausa_${numero}">▶</button>

                <div id="player_${numero}" style="display: none"></div>
                <div class="contenedor_barra_progreso" id="contenedor_barra_progreso_${numero}">
                  <div class="barra_progreso" id="barra_progreso_${numero}">
                    <div class="progreso" id="progreso_${numero}"></div>
                    <div class="punto_progreso" id="punto_progreso_${numero}"></div>
                  </div>
                  <div class="video_reproductor_tiempo">
                    <span class="tiempo_actual" id="tiempo_actual_${numero}">0:00</span>
                    <span class="tiempo_total" id="tiempo_total_${numero}">0:00</span>
                  </div>
                </div>
              </div>
              <div class="info_cancion">
                <h3 class="titulo_cancion">${cancion.titulo}</h3>
                <p class="artista_cancion">${cancion.artista} • ${cancion.año}</p>
              </div>
            </div>
          `;
    galeria.innerHTML += cancionHTML;
  });
}

// DOM listo
document.addEventListener("DOMContentLoaded", function () {
  generarGaleriaMusica();

  // Configurar event listeners para cada canción
  misCanciones.forEach((cancion, index) => {
    const numero = index + 1;
    const portada = document.getElementById(`cancion_portada_${numero}`);
    const btnPlay = document.getElementById(`boton_play_pausa_${numero}`);
    const barraProgreso = document.getElementById(`barra_progreso_${numero}`);

    if (!portada || !btnPlay || !barraProgreso) return;

    btnPlay.addEventListener("click", function (e) {
      e.stopPropagation();
      controlarReproduccion(numero);
    });

    portada.addEventListener("click", function (e) {
      if (
        !e.target.closest(".boton_play_pausa") &&
        !e.target.closest(".barra_progreso")
      ) {
        controlarReproduccion(numero);
      }
    });

    barraProgreso.addEventListener("click", function (e) {
      adelantarRetroceder(e, numero);
    });
  });
});

// Controlar reproducción (solo si el player ya está listo)
function controlarReproduccion(numero) {
  // verificamos que el player exista y esté listo
  if (!canciones[numero] || !canciones[numero].player || !playerListo[numero]) return;

  const player = canciones[numero].player;

  if (estaReproduciendo && cancionActual === numero) {
    player.pauseVideo();
  } else {
    if (cancionActual !== numero && cancionActual !== null && canciones[cancionActual]?.player) {
      canciones[cancionActual].player.pauseVideo();
    }
    player.playVideo();
  }
}

function adelantarRetroceder(e, numero) {
  const player = canciones[numero].player;

  if (player && player.getDuration) {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const nuevoPorcentaje = (clickX / rect.width) * 100;
    const nuevoTiempo = (nuevoPorcentaje / 100) * player.getDuration();

    player.seekTo(nuevoTiempo, true);

    if (!estaReproduciendo || cancionActual !== numero) {
      if (cancionActual !== numero && canciones[cancionActual]?.player) {
        canciones[cancionActual].player.pauseVideo();
      }
      player.playVideo();
    }
  }
}


