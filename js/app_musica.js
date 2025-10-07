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
let cancionActual = null;
let estaReproduciendo = false;
let intervaloProgreso;
let apiCargada = false;
let inicializacionEnProgreso = false;

// Cargar API de YouTube de forma segura
function cargarYouTubeAPI() {
  if (window.YT && window.YT.Player) {
    console.log('YouTube API ya está cargada');
    inicializarReproductores();
    return;
  }

  const tag = document.createElement('script');
  tag.src = "https://www.youtube.com/iframe_api";
  tag.onerror = function() {
    console.error('Error al cargar YouTube API');
    mostrarErrorCarga();
  };
  const firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

// Función global que YouTube API espera
window.onYouTubeIframeAPIReady = function() {
  console.log('YouTube Iframe API Ready');
  apiCargada = true;
  inicializarReproductores();
};

// Inicializar reproductores con retry
function inicializarReproductores() {
  if (inicializacionEnProgreso) return;
  
  inicializacionEnProgreso = true;
  console.log('Inicializando reproductores...');

  let reproductoresCreados = 0;
  const totalReproductores = misCanciones.length;

  misCanciones.forEach((cancion, index) => {
    const numero = index + 1;
    
    // Inicializar objeto de canción
    canciones[numero] = {
      videoId: cancion.id,
      player: null,
      estaListo: false,
      intentos: 0,
      maxIntentos: 3
    };

    // Crear reproductor con retry
    crearReproductor(numero, cancion.id);
  });
}

function crearReproductor(numero, videoId, reintento = false) {
  if (reintento) {
    canciones[numero].intentos++;
    console.log(`Reintentando crear reproductor ${numero}, intento ${canciones[numero].intentos}`);
  }

  try {
    const playerConfig = {
      videoId: videoId,
      height: "0",
      width: "0",
      playerVars: {
        playsinline: 1,
        controls: 0,
        rel: 0,
        modestbranding: 1,
        showinfo: 0,
        enablejsapi: 1,
        origin: window.location.origin // Importante para CORS
      },
      events: {
        onReady: (event) => onPlayerReady(event, numero),
        onStateChange: (event) => onPlayerStateChange(event, numero),
        onError: (event) => onPlayerError(event, numero),
        onApiChange: (event) => onApiChange(event, numero)
      }
    };

    canciones[numero].player = new YT.Player(`player_${numero}`, playerConfig);
    
    if (!reintento) {
      console.log(`Reproductor ${numero} creado exitosamente`);
    }

  } catch (error) {
    console.error(`Error creando reproductor ${numero}:`, error);
    
    if (canciones[numero].intentos < canciones[numero].maxIntentos) {
      setTimeout(() => crearReproductor(numero, videoId, true), 1000 * canciones[numero].intentos);
    } else {
      console.error(`No se pudo crear el reproductor ${numero} después de ${canciones[numero].maxIntentos} intentos`);
      marcarReproductorComoFallido(numero);
    }
  }
}

function marcarReproductorComoFallido(numero) {
  const btnPlay = document.getElementById(`boton_play_pausa_${numero}`);
  if (btnPlay) {
    btnPlay.textContent = "❌";
    btnPlay.title = "Error al cargar el reproductor";
    btnPlay.style.cursor = "not-allowed";
  }
}

function mostrarErrorCarga() {
  // Opcional: mostrar un mensaje al usuario
  console.error('No se pudo cargar el reproductor de YouTube');
}

// Reproductor listo
function onPlayerReady(event, numero) {
  console.log(`Reproductor ${numero} listo`);
  canciones[numero].estaListo = true;

  const player = canciones[numero].player;
  
  try {
    const duration = player.getDuration();
    if (duration > 0) {
      document.getElementById(`tiempo_total_${numero}`).textContent = formatearTiempo(duration);
    }
  } catch (error) {
    console.warn(`No se pudo obtener duración del reproductor ${numero}:`, error);
    // Intentar nuevamente después de un tiempo
    setTimeout(() => {
      try {
        const duration = player.getDuration();
        if (duration > 0) {
          document.getElementById(`tiempo_total_${numero}`).textContent = formatearTiempo(duration);
        }
      } catch (e) {
        console.error(`Error persistente al obtener duración:`, e);
      }
    }, 1000);
  }

  document.getElementById(`player_${numero}`).style.display = "none";
  
  // Habilitar botón de play
  const btnPlay = document.getElementById(`boton_play_pausa_${numero}`);
  if (btnPlay) {
    btnPlay.disabled = false;
    btnPlay.textContent = "▶";
  }
}

function onPlayerError(event, numero) {
  console.error(`Error en reproductor ${numero}:`, event.data);
  canciones[numero].estaListo = false;
  
  const btnPlay = document.getElementById(`boton_play_pausa_${numero}`);
  if (btnPlay) {
    btnPlay.textContent = "⚠";
    btnPlay.title = "Error en el reproductor";
  }
}

function onApiChange(event, numero) {
  console.log(`API change en reproductor ${numero}:`, event);
}

// Resto de las funciones permanecen igual pero con mejor manejo de errores
function onPlayerStateChange(event, numero) {
  if (!canciones[numero] || !canciones[numero].estaListo) return;

  const player = canciones[numero].player;
  const portada = document.getElementById(`cancion_portada_${numero}`);
  const botonPlay = document.getElementById(`boton_play_pausa_${numero}`);

  if (!portada || !botonPlay) return;

  try {
    if (event.data == YT.PlayerState.PLAYING) {
      estaReproduciendo = true;
      cancionActual = numero;

      botonPlay.textContent = "⏸";
      const puntoProgreso = document.getElementById(`punto_progreso_${numero}`);
      if (puntoProgreso) puntoProgreso.style.display = "block";
      portada.classList.add("reproduciendo");

      clearInterval(intervaloProgreso);
      intervaloProgreso = setInterval(() => actualizarProgreso(numero), 500);
    } else if (event.data == YT.PlayerState.PAUSED) {
      estaReproduciendo = false;
      botonPlay.textContent = "▶";
      const puntoProgreso = document.getElementById(`punto_progreso_${numero}`);
      if (puntoProgreso) puntoProgreso.style.display = "none";
      portada.classList.remove("reproduciendo");
      clearInterval(intervaloProgreso);
    } else if (event.data == YT.PlayerState.ENDED) {
      estaReproduciendo = false;
      cancionActual = null;
      botonPlay.textContent = "▶";
      const puntoProgreso = document.getElementById(`punto_progreso_${numero}`);
      if (puntoProgreso) puntoProgreso.style.display = "none";
      resetearProgreso(numero);
      portada.classList.remove("reproduciendo");
      clearInterval(intervaloProgreso);
    }
  } catch (error) {
    console.error(`Error en onPlayerStateChange para reproductor ${numero}:`, error);
  }
}

function resetearProgreso(numero) {
  const progreso = document.getElementById(`progreso_${numero}`);
  const puntoProgreso = document.getElementById(`punto_progreso_${numero}`);
  const tiempoActual = document.getElementById(`tiempo_actual_${numero}`);
  
  if (progreso) progreso.style.width = "0%";
  if (puntoProgreso) puntoProgreso.style.left = "0%";
  if (tiempoActual) tiempoActual.textContent = "0:00";
}

function formatearTiempo(segundos) {
  const min = Math.floor(segundos / 60);
  const sec = Math.floor(segundos % 60);
  return `${min}:${sec < 10 ? "0" + sec : sec}`;
}

function actualizarProgreso(numero) {
  if (!canciones[numero] || !canciones[numero].estaListo) return;
  
  const player = canciones[numero].player;
  if (player && player.getCurrentTime) {
    try {
      const tiempoActual = player.getCurrentTime();
      const duracion = player.getDuration();
      const porcentaje = (tiempoActual / duracion) * 100;

      const progreso = document.getElementById(`progreso_${numero}`);
      const puntoProgreso = document.getElementById(`punto_progreso_${numero}`);
      const tiempoActualElement = document.getElementById(`tiempo_actual_${numero}`);

      if (progreso) progreso.style.width = porcentaje + "%";
      if (puntoProgreso) puntoProgreso.style.left = porcentaje + "%";
      if (tiempoActualElement) tiempoActualElement.textContent = formatearTiempo(tiempoActual);
    } catch (error) {
      console.error(`Error actualizando progreso ${numero}:`, error);
    }
  }
}

// Generar galería de canciones
function generarGaleriaMusica() {
  const galeria = document.getElementById("galeria_musica");
  if (!galeria) {
    console.error('Elemento galeria_musica no encontrado');
    return;
  }

  misCanciones.forEach((cancion, index) => {
    const numero = index + 1;

    const cancionHTML = `
      <div class="contenedor_cancion">
        <div class="cancion_portada" id="cancion_portada_${numero}">
          <img src="https://img.youtube.com/vi/${cancion.id}/maxresdefault.jpg" alt="${cancion.titulo}" 
               onerror="this.src='https://img.youtube.com/vi/${cancion.id}/hqdefault.jpg'" />
          <button class="boton_play_pausa" id="boton_play_pausa_${numero}" disabled>⌛</button>

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
  console.log('DOM cargado, generando galería...');
  generarGaleriaMusica();
  
  // Cargar API después de generar la galería
  setTimeout(() => {
    cargarYouTubeAPI();
  }, 100);

  // Configurar event listeners después de un breve delay
  setTimeout(() => {
    configurarEventListeners();
  }, 500);
});

function configurarEventListeners() {
  misCanciones.forEach((cancion, index) => {
    const numero = index + 1;
    const portada = document.getElementById(`cancion_portada_${numero}`);
    const btnPlay = document.getElementById(`boton_play_pausa_${numero}`);
    const barraProgreso = document.getElementById(`barra_progreso_${numero}`);

    if (!portada || !btnPlay || !barraProgreso) {
      console.warn(`Elementos no encontrados para canción ${numero}`);
      return;
    }

    btnPlay.addEventListener("click", function (e) {
      e.stopPropagation();
      controlarReproduccion(numero);
    });

    portada.addEventListener("click", function (e) {
      if (!e.target.closest(".boton_play_pausa") && !e.target.closest(".barra_progreso")) {
        controlarReproduccion(numero);
      }
    });

    barraProgreso.addEventListener("click", function (e) {
      adelantarRetroceder(e, numero);
    });
  });
}

function controlarReproduccion(numero) {
  // Verificar si el reproductor está listo
  if (!canciones[numero] || !canciones[numero].estaListo) {
    console.warn(`Reproductor ${numero} no está listo aún`);
    
    const btnPlay = document.getElementById(`boton_play_pausa_${numero}`);
    if (btnPlay) {
      const originalText = btnPlay.textContent;
      btnPlay.textContent = "⌛";
      btnPlay.disabled = true;
      
      setTimeout(() => {
        btnPlay.textContent = originalText;
        btnPlay.disabled = false;
        if (canciones[numero] && canciones[numero].estaListo) {
          controlarReproduccion(numero);
        }
      }, 1000);
    }
    return;
  }

  try {
    const player = canciones[numero].player;

    if (estaReproduciendo && cancionActual === numero) {
      player.pauseVideo();
    } else {
      if (cancionActual !== numero && canciones[cancionActual]?.player) {
        canciones[cancionActual].player.pauseVideo();
      }
      player.playVideo();
    }
  } catch (error) {
    console.error(`Error controlando reproducción ${numero}:`, error);
  }
}

function adelantarRetroceder(e, numero) {
  if (!canciones[numero] || !canciones[numero].estaListo) {
    console.warn(`Reproductor ${numero} no está listo para adelantar/retroceder`);
    return;
  }

  try {
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
  } catch (error) {
    console.error(`Error adelantando/retrocediendo ${numero}:`, error);
  }
}

// Verificar estado periódicamente
setInterval(() => {
  if (!apiCargada && !inicializacionEnProgreso) {
    console.log('Reintentando cargar API...');
    cargarYouTubeAPI();
  }
}, 5000);

