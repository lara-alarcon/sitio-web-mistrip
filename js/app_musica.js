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

// Variables globales
const canciones = {};
let cancionActual = null;
let estaReproduciendo = false;
let intervaloProgreso;
let apiYouTubeCargada = false;

// Función global que YouTube espera
window.onYouTubeIframeAPIReady = function() {
  console.log('YouTube API cargada correctamente');
  apiYouTubeCargada = true;
  inicializarTodosLosReproductores();
};

// Inicializar todos los reproductores
function inicializarTodosLosReproductores() {
  console.log('Inicializando reproductores...');
  
  misCanciones.forEach((cancion, index) => {
    const numero = index + 1;
    inicializarReproductor(numero, cancion.id);
  });
}

// Inicializar un reproductor individual
function inicializarReproductor(numero, videoId) {
  console.log(`Inicializando reproductor ${numero} con video: ${videoId}`);
  
  try {
    canciones[numero] = {
      videoId: videoId,
      player: null,
      estaListo: false
    };

    const player = new YT.Player(`player_${numero}`, {
      videoId: videoId,
      width: '0',
      height: '0',
      playerVars: {
        'playsinline': 1,
        'controls': 0,
        'rel': 0,
        'modestbranding': 1,
        'showinfo': 0,
        'enablejsapi': 1,
        'origin': window.location.origin
      },
      events: {
        'onReady': (event) => onPlayerReady(event, numero),
        'onStateChange': (event) => onPlayerStateChange(event, numero),
        'onError': (event) => onPlayerError(event, numero)
      }
    });

    canciones[numero].player = player;
    
  } catch (error) {
    console.error(`Error inicializando reproductor ${numero}:`, error);
  }
}

// Cuando el reproductor está listo
function onPlayerReady(event, numero) {
  console.log(`Reproductor ${numero} listo`);
  canciones[numero].estaListo = true;
  
  const player = event.target;
  const duracion = player.getDuration();
  
  // Actualizar tiempo total
  const elementoDuracion = document.getElementById(`tiempo_total_${numero}`);
  if (elementoDuracion) {
    elementoDuracion.textContent = formatearTiempo(duracion);
  }
  
  // Ocultar el iframe del reproductor
  const iframe = document.getElementById(`player_${numero}`);
  if (iframe) {
    iframe.style.display = 'none';
  }
  
  // Habilitar el botón de play
  const botonPlay = document.getElementById(`boton_play_pausa_${numero}`);
  if (botonPlay) {
    botonPlay.disabled = false;
    botonPlay.innerHTML = '▶';
  }
}

// Manejar errores del reproductor
function onPlayerError(event, numero) {
  console.error(`Error en reproductor ${numero}:`, event.data);
  const botonPlay = document.getElementById(`boton_play_pausa_${numero}`);
  if (botonPlay) {
    botonPlay.innerHTML = '❌';
    botonPlay.title = 'Error al cargar el video';
  }
}

// Cambios de estado del reproductor
function onPlayerStateChange(event, numero) {
  if (!canciones[numero] || !canciones[numero].estaListo) return;

  const botonPlay = document.getElementById(`boton_play_pausa_${numero}`);
  const portada = document.getElementById(`cancion_portada_${numero}`);
  
  if (!botonPlay || !portada) return;

  switch(event.data) {
    case YT.PlayerState.PLAYING:
      estaReproduciendo = true;
      cancionActual = numero;
      botonPlay.innerHTML = '⏸';
      portada.classList.add('reproduciendo');
      
      // Iniciar actualización de progreso
      clearInterval(intervaloProgreso);
      intervaloProgreso = setInterval(() => actualizarProgreso(numero), 1000);
      break;
      
    case YT.PlayerState.PAUSED:
      estaReproduciendo = false;
      botonPlay.innerHTML = '▶';
      portada.classList.remove('reproduciendo');
      clearInterval(intervaloProgreso);
      break;
      
    case YT.PlayerState.ENDED:
      estaReproduciendo = false;
      cancionActual = null;
      botonPlay.innerHTML = '▶';
      portada.classList.remove('reproduciendo');
      resetearProgreso(numero);
      clearInterval(intervaloProgreso);
      break;
  }
}

// Formatear tiempo
function formatearTiempo(segundos) {
  const minutos = Math.floor(segundos / 60);
  const segundosRestantes = Math.floor(segundos % 60);
  return `${minutos}:${segundosRestantes < 10 ? '0' : ''}${segundosRestantes}`;
}

// Actualizar barra de progreso
function actualizarProgreso(numero) {
  if (!canciones[numero] || !canciones[numero].estaListo) return;
  
  const player = canciones[numero].player;
  const tiempoActual = player.getCurrentTime();
  const duracion = player.getDuration();
  const porcentaje = (tiempoActual / duracion) * 100;

  const progreso = document.getElementById(`progreso_${numero}`);
  const puntoProgreso = document.getElementById(`punto_progreso_${numero}`);
  const tiempoActualElement = document.getElementById(`tiempo_actual_${numero}`);

  if (progreso) progreso.style.width = porcentaje + '%';
  if (puntoProgreso) {
    puntoProgreso.style.left = porcentaje + '%';
    puntoProgreso.style.display = 'block';
  }
  if (tiempoActualElement) {
    tiempoActualElement.textContent = formatearTiempo(tiempoActual);
  }
}

// Resetear progreso
function resetearProgreso(numero) {
  const progreso = document.getElementById(`progreso_${numero}`);
  const puntoProgreso = document.getElementById(`punto_progreso_${numero}`);
  const tiempoActual = document.getElementById(`tiempo_actual_${numero}`);

  if (progreso) progreso.style.width = '0%';
  if (puntoProgreso) {
    puntoProgreso.style.left = '0%';
    puntoProgreso.style.display = 'none';
  }
  if (tiempoActual) tiempoActual.textContent = '0:00';
}

// Generar la galería de música
function generarGaleriaMusica() {
  const galeria = document.getElementById('galeria_musica');
  
  if (!galeria) {
    console.error('No se encontró el elemento galeria_musica');
    return;
  }

  galeria.innerHTML = ''; // Limpiar contenido existente

  misCanciones.forEach((cancion, index) => {
    const numero = index + 1;
    
    const cancionHTML = `
      <div class="contenedor_cancion">
        <div class="cancion_portada" id="cancion_portada_${numero}">
          <img src="https://img.youtube.com/vi/${cancion.id}/maxresdefault.jpg" 
               alt="${cancion.titulo}"
               onerror="this.onerror=null; this.src='https://img.youtube.com/vi/${cancion.id}/hqdefault.jpg'">
          <button class="boton_play_pausa" id="boton_play_pausa_${numero}" disabled>...</button>
          
          <div id="player_${numero}"></div>
          
          <div class="contenedor_barra_progreso">
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

// Controlar reproducción
function controlarReproduccion(numero) {
  if (!canciones[numero] || !canciones[numero].estaListo) {
    console.warn(`Reproductor ${numero} no está listo`);
    return;
  }

  const player = canciones[numero].player;

  if (estaReproduciendo && cancionActual === numero) {
    // Pausar la canción actual
    player.pauseVideo();
  } else {
    // Si hay otra canción reproduciéndose, pausarla primero
    if (cancionActual && cancionActual !== numero && canciones[cancionActual]) {
      canciones[cancionActual].player.pauseVideo();
    }
    // Reproducir la nueva canción
    player.playVideo();
  }
}

// Adelantar/retroceder
function adelantarRetroceder(event, numero) {
  if (!canciones[numero] || !canciones[numero].estaListo) return;

  const barraProgreso = document.getElementById(`barra_progreso_${numero}`);
  const rect = barraProgreso.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const porcentaje = (clickX / rect.width) * 100;
  
  const player = canciones[numero].player;
  const nuevoTiempo = (porcentaje / 100) * player.getDuration();
  
  player.seekTo(nuevoTiempo, true);
}

// Configurar event listeners
function configurarEventListeners() {
  misCanciones.forEach((cancion, index) => {
    const numero = index + 1;
    
    const botonPlay = document.getElementById(`boton_play_pausa_${numero}`);
    const portada = document.getElementById(`cancion_portada_${numero}`);
    const barraProgreso = document.getElementById(`barra_progreso_${numero}`);

    if (botonPlay) {
      botonPlay.addEventListener('click', (e) => {
        e.stopPropagation();
        controlarReproduccion(numero);
      });
    }

    if (portada) {
      portada.addEventListener('click', (e) => {
        if (!e.target.closest('.boton_play_pausa') && !e.target.closest('.barra_progreso')) {
          controlarReproduccion(numero);
        }
      });
    }

    if (barraProgreso) {
      barraProgreso.addEventListener('click', (e) => {
        adelantarRetroceder(e, numero);
      });
    }
  });
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM cargado - Iniciando aplicación');
  
  // Generar la galería primero
  generarGaleriaMusica();
  
  // Si la API de YouTube ya está cargada, inicializar reproductores
  if (window.YT && window.YT.Player) {
    console.log('YT.Player ya disponible');
    apiYouTubeCargada = true;
    inicializarTodosLosReproductores();
  }
  
  // Configurar event listeners después de un breve delay
  setTimeout(() => {
    configurarEventListeners();
    console.log('Event listeners configurados');
  }, 1000);
});

// Fallback: si después de 3 segundos la API no se cargó, intentar nuevamente
setTimeout(() => {
  if (!apiYouTubeCargada && window.YT && window.YT.Player) {
    console.log('Fallback: inicializando reproductores');
    apiYouTubeCargada = true;
    inicializarTodosLosReproductores();
  }
}, 3000);

