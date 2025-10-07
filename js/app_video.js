// Array con IDs de los videos
const misVideos = [
    "xPHfFHI4q-Y",
    "6zXL4ZlMcME", 
    "a1rQ2qfq8-Y",
    "9WOj8z-gPpA",
    "TEJzDo5aK04",
    "jigfUWdTwSU",
    "AT69po6dUaA",
    "75fy_hjnHf0",
    "rNbppDyFW5M",
    "mKaWRNfp7Z4",
    "QM6JhOf_PoU",
    "WsmkaElopEs",
];

function generarGaleria() {
    const galeria = document.querySelector('.galeria_videos');
    
    misVideos.forEach(videoId => {
        const videoHTML = `
            <div class="contenedor_video">
                <div class="video_portada" data-video-id="${videoId}">
                    <img src="https://img.youtube.com/vi/${videoId}/sddefault.jpg" alt="Video">
                    <button class="boton_play_pausa">▶</button>
                </div>
            </div>
        `;
        galeria.innerHTML += videoHTML;
    });
}

// Modal para Videos
let player;
let modalAbierto = false;

// API de YouTube listo
function onYouTubeIframeAPIReady() {
    console.log("YouTube API ready");
}

// Función para abrir video en modal
function abrirVideo(videoId) {
    const modal = document.getElementById('modal_video');
    
    // Crear o actualizar el reproductor
    if (!player) {
        player = new YT.Player('videoPlayer', {
            height: '100%',
            width: '100%',
            videoId: videoId,
            playerVars: {
                'autoplay': 1,
                'controls': 1,
                'rel': 0,
                'modestbranding': 1,
                'showinfo': 0
            },
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange
            }
        });
    } else {
        player.loadVideoById(videoId);
        player.playVideo();
    }
    
    // Mostrar modal
    modal.classList.add('mostrar');
    modalAbierto = true;
    document.body.style.overflow = 'hidden';
}

function onPlayerReady(event) {
    console.log("Reproductor listo");
}

// Función para manejar cambios de estado del video
function onPlayerStateChange(event) {
}

// Función para cerrar modal
function cerrarModal() {
    const modal = document.getElementById('modal_video');
    modal.classList.remove('mostrar');
    modalAbierto = false;
    document.body.style.overflow = 'auto';
    
    // Pausar video al cerrar
    if (player && player.pauseVideo) {
        player.pauseVideo();
    }
}

// Función para configurar event listeners de los videos
function configurarEventListeners() {
    const miniaturas = document.querySelectorAll('.video_portada');
    
    miniaturas.forEach(miniatura => {
        // Agregar evento click
        miniatura.addEventListener('click', function() {
            const videoId = this.getAttribute('data-video-id');
            abrirVideo(videoId);
        });
    });
}

// Llamar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Generar la galería automáticamente
    generarGaleria();
    
    // Configurar los event listeners para los videos generados
    configurarEventListeners();
    
    // Cerrar modal
    document.querySelector('.cerrar_modal').addEventListener('click', cerrarModal);
    
    // Cerrar modal al hacer click fuera
    document.getElementById('modal_video').addEventListener('click', function(e) {
        if (e.target === this) {
            cerrarModal();
        }
    });
    
    // Cerrar modal con tecla ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modalAbierto) {
            cerrarModal();
        }
    });
});
