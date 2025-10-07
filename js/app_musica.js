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
let playerUnico = null;
let cancionActual = null;
let estaReproduciendo = false;
let intervaloProgreso;

// Función global que YouTube espera
window.onYouTubeIframeAPIReady = function() {
  console.log('YouTube API cargada correctamente');
};

// Generar la galería de música
function generarGaleriaMusica() {
  const galeria = document.getElementById('galeria_musica');
  
  if (!galeria) {
    console.error('No se encontró el elemento galeria_musica');
    return;
  }

  galeria.innerHTML = '';

  misCanciones.forEach((cancion, index) => {
    const numero = index + 1;
    
    const cancionHTML = `
      <div class="contenedor_cancion" data-numero="${numero}">
        <div class="cancion_portada" id="cancion_portada_${numero}">
          <img src="https://img.youtube.com/vi/${cancion.id}/maxresdefault.jpg" 
               alt="${cancion.titulo}"
               onerror="this.onerror=null; this.src='https://img.youtube.com/vi/${cancion.id}/hqdefault.jpg'">
          <button class="boton_play_pausa" id="boton_play_pausa_${numero}">▶</button>
          
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

// Crear reproductor único
function crearReproductorUnico(videoId, numero) {
  console.log('🎵 Creando reproductor para:', videoId);
  
  // Eliminar reproductor anterior si existe
  if (playerUnico) {
    const playerContainer = document.getElementById('playerUnicoContainer');
    if (playerContainer) {
      playerContainer.remove();
    }
    playerUnico = null;
  }
  
  // Crear contenedor para el reproductor
  const playerContainer = document.createElement('div');
  playerContainer.id = 'playerUnicoContainer';
  playerContainer.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.9);
    z-index: 10000;
    display: flex;
    justify-content: center;
    align-items: center;
  `;
  
  playerContainer.innerHTML = `
    <div style="position: relative; width: 90%; max-width: 800px;">
      <button id="cerrarPlayer" style="position: absolute; top: -40px; right: 0; background: red; color: white; border: none; padding: 10px; cursor: pointer; z-index: 10001;">Cerrar</button>
      <div id="playerUnico" style="width: 100%; height: 0; padding-bottom: 56.25%; position: relative;">
        <div id="youtubePlayer" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></div>
      </div>
    </div>
  `;
  
  document.body.appendChild(playerContainer);
  
  // Event listener para cerrar
  document.getElementById('cerrarPlayer').addEventListener('click', function() {
    playerContainer.remove();
    if (playerUnico && playerUnico.stopVideo) {
      playerUnico.stopVideo();
    }
    playerUnico = null;
    estaReproduciendo = false;
    cancionActual = null;
    
    // Resetear todos los botones
    misCanciones.forEach((_, index) => {
      const num = index + 1;
      const boton = document.getElementById(`boton_play_pausa_${num}`);
      if (boton) boton.innerHTML = '▶';
      const portada = document.getElementById(`cancion_portada_${num}`);
      if (portada) portada.classList.remove('reproduciendo');
      resetearProgreso(num);
    });
  });
  
  // Crear el reproductor de YouTube
  playerUnico = new YT.Player('youtubePlayer', {
    height: '100%',
    width: '100%',
    videoId: videoId,
    playerVars: {
      'autoplay': 1,
      'controls': 1,
      'rel': 0,
      'modestbranding': 1,
      'showinfo': 0,
      'playsinline': 1
    },
    events: {
      'onReady': function(event) {
        console.log('Reproductor único listo');
        // Actualizar UI
        const botonPlay = document.getElementById(`boton_play_pausa_${numero}`);
        const portada = document.getElementById(`cancion_portada_${numero}`);
        if (botonPlay) botonPlay.innerHTML = '⏸';
        if (portada) portada.classList.add('reproduciendo');
        
        estaReproduciendo = true;
        cancionActual = numero;
        
        // Iniciar actualización de progreso
        clearInterval(intervaloProgreso);
        intervaloProgreso = setInterval(() => actualizarProgreso(numero, event.target), 1000);
      },
      'onStateChange': function(event) {
        if (event.data === YT.PlayerState.ENDED) {
          // Cuando termina la canción
          const playerContainer = document.getElementById('playerUnicoContainer');
          if (playerContainer) {
            playerContainer.remove();
          }
          playerUnico = null;
          estaReproduciendo = false;
          cancionActual = null;
          
          const botonPlay = document.getElementById(`boton_play_pausa_${numero}`);
          const portada = document.getElementById(`cancion_portada_${numero}`);
          if (botonPlay) botonPlay.innerHTML = '▶';
          if (portada) portada.classList.remove('reproduciendo');
          resetearProgreso(numero);
        }
      },
      'onError': function(event) {
        console.error('Error en reproductor:', event.data);
      }
    }
  });
}

// Controlar reproducción
function controlarReproduccion(numero) {
  console.log('🎵 Reproduciendo canción:', numero);
  
  const cancion = misCanciones[numero - 1];
  
  // Si ya está reproduciendo esta canción, cerrar el reproductor
  if (estaReproduciendo && cancionActual === numero) {
    const playerContainer = document.getElementById('playerUnicoContainer');
    if (playerContainer) {
      playerContainer.remove();
    }
    if (playerUnico && playerUnico.stopVideo) {
      playerUnico.stopVideo();
    }
    playerUnico = null;
    estaReproduciendo = false;
    cancionActual = null;
    
    const botonPlay = document.getElementById(`boton_play_pausa_${numero}`);
    const portada = document.getElementById(`cancion_portada_${numero}`);
    if (botonPlay) botonPlay.innerHTML = '▶';
    if (portada) portada.classList.remove('reproduciendo');
    resetearProgreso(numero);
    
    return;
  }
  
  // Si hay otra canción reproduciéndose, detenerla
  if (estaReproduciendo && cancionActual !== numero) {
    const playerContainer = document.getElementById('playerUnicoContainer');
    if (playerContainer) {
      playerContainer.remove();
    }
    if (playerUnico && playerUnico.stopVideo) {
      playerUnico.stopVideo();
    }
    playerUnico = null;
    
    // Resetear la canción anterior
    const botonAnterior = document.getElementById(`boton_play_pausa_${cancionActual}`);
    const portadaAnterior = document.getElementById(`cancion_portada_${cancionActual}`);
    if (botonAnterior) botonAnterior.innerHTML = '▶';
    if (portadaAnterior) portadaAnterior.classList.remove('reproduciendo');
    resetearProgreso(cancionActual);
  }
  
  // Crear nuevo reproductor
  crearReproductorUnico(cancion.id, numero);
}

// Actualizar barra de progreso
function actualizarProgreso(numero, player) {
  try {
    const tiempoActual = player.getCurrentTime();
    const duracion = player.getDuration();
    
    if (duracion > 0) {
      const porcentaje = (tiempoActual / duracion) * 100;

      const progreso = document.getElementById(`progreso_${numero}`);
      const puntoProgreso = document.getElementById(`punto_progreso_${numero}`);
      const tiempoActualElement = document.getElementById(`tiempo_actual_${numero}`);
      const tiempoTotalElement = document.getElementById(`tiempo_total_${numero}`);

      if (progreso) progreso.style.width = porcentaje + '%';
      if (puntoProgreso) {
        puntoProgreso.style.left = porcentaje + '%';
        puntoProgreso.style.display = 'block';
      }
      if (tiempoActualElement) {
        tiempoActualElement.textContent = formatearTiempo(tiempoActual);
      }
      if (tiempoTotalElement) {
        tiempoTotalElement.textContent = formatearTiempo(duracion);
      }
    }
  } catch (error) {
    console.error('Error actualizando progreso:', error);
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

// Formatear tiempo
function formatearTiempo(segundos) {
  const minutos = Math.floor(segundos / 60);
  const segundosRestantes = Math.floor(segundos % 60);
  return `${minutos}:${segundosRestantes < 10 ? '0' : ''}${segundosRestantes}`;
}

// Configurar event listeners
function configurarEventListeners() {
  misCanciones.forEach((cancion, index) => {
    const numero = index + 1;
    
    const botonPlay = document.getElementById(`boton_play_pausa_${numero}`);
    const portada = document.getElementById(`cancion_portada_${numero}`);

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
  });
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM cargado - Iniciando aplicación');
  
  // Generar la galería primero
  generarGaleriaMusica();
  
  // Configurar event listeners
  configurarEventListeners();
});
