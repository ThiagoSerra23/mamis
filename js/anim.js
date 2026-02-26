// Sincronizar las letras con la canción
var audio = document.querySelector("audio");
var lyrics = document.querySelector("#lyrics");

// Array de objetos que contiene cada línea y su tiempo de aparición en segundos

// Lyrics disabled due to missing lyricsData
// function updateLyrics() { ... }
// setInterval(updateLyrics, 1000);

//funcion titulo
// Función para ocultar el título después de 216 segundos
function ocultarTitulo() {
  var titulo = document.querySelector(".titulo");
  titulo.style.animation =
    "fadeOut 3s ease-in-out forwards"; /* Duración y función de temporización de la desaparición */
  setTimeout(function () {
    titulo.style.display = "none";
  }, 3000); // Espera 3 segundos antes de ocultar completamente
}

// Llama a la función después de 216 segundos (216,000 milisegundos)
setTimeout(ocultarTitulo, 216000);

// Falling images functionality
function createFallingImage() {
  const img = document.createElement('img');
  img.src = 'assets/image.png';
  img.classList.add('falling-image');

  // Random horizontal position
  img.style.left = Math.random() * 100 + 'vw';

  // Random animation duration between 5s and 10s
  const animationDuration = Math.random() * 5 + 5;
  img.style.animationDuration = animationDuration + 's';

  // Random size between 15px and 35px
  const size = Math.random() * 20 + 15;
  img.style.width = size + 'px';
  img.style.height = 'auto';

  // Opacidade inicial
  img.style.opacity = Math.random() * 0.5 + 0.3;

  document.body.appendChild(img);

  // Remove image after animation ends
  setTimeout(() => {
    img.remove();
  }, animationDuration * 1000);
}

// Create new falling image every 800ms
setInterval(createFallingImage, 800);