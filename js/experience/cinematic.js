(() => {
  "use strict";

  const messages = [
    "Obrigado por todos os momentos em que esteve presente.",
    "Seu carinho faz diferença até nos dias mais difíceis.",
    "Existem coisas que palavras não conseguem explicar.",
    "Você merece receber todo o carinho que oferece.",
    "Este pequeno presente é apenas uma forma de dizer o quanto você é especial."
  ];

  const sceneIds = ["hero", "story", "stars", "memories", "hug", "final"];
  const scenes = sceneIds.map(id => document.getElementById(`scene-${id}`));
  const progress = document.getElementById("progress-bar");
  const count = document.getElementById("scene-count");
  const toast = document.getElementById("message-toast");
  let currentScene = 0;
  let isTransitioning = false;
  const transitionDelay = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 650;
  const foundStars = new Set();

  function showScene(id) {
    const nextIndex = sceneIds.indexOf(id);
    if (nextIndex < 0 || nextIndex === currentScene || isTransitioning) return;

    isTransitioning = true;
    const previousIndex = currentScene;
    scenes[previousIndex].classList.remove("is-active");
    window.setTimeout(() => {
      scenes[previousIndex].hidden = true;
      scenes[nextIndex].hidden = false;
      // Force a layout pass so the entrance transition always runs.
      void scenes[nextIndex].offsetWidth;
      scenes[nextIndex].classList.add("is-active");
      currentScene = nextIndex;
      isTransitioning = false;
      progress.style.width = `${((currentScene + 1) / scenes.length) * 100}%`;
      count.textContent = `${String(currentScene + 1).padStart(2, "0")} — ${String(scenes.length).padStart(2, "0")}`;
    }, transitionDelay);
  }

  document.querySelectorAll("[data-next]").forEach(button => {
    button.addEventListener("click", () => showScene(button.dataset.next));
  });

  document.querySelectorAll("[data-star]").forEach(button => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.star);
      if (!Number.isInteger(index) || !messages[index]) return;
      foundStars.add(index);
      button.classList.add("is-found");
      button.setAttribute("aria-pressed", "true");
      document.getElementById("star-message").textContent = messages[index];
      document.getElementById("star-progress").textContent = `${foundStars.size} DE 5 DESCOBERTAS`;
      document.getElementById("stars-next").disabled = foundStars.size !== messages.length;
    });
  });

  document.getElementById("stars-next").addEventListener("click", () => {
    if (foundStars.size === messages.length) showScene("memories");
  });

  document.getElementById("hug-button").addEventListener("click", event => {
    const button = event.currentTarget;
    document.getElementById("hug-after").hidden = false;
    button.textContent = "ABRAÇO ENVIADO ♡";
    button.disabled = true;
    window.setTimeout(() => showScene("final"), 2600);
  });

  // Lightweight ambient particles. The animation pauses when the tab is hidden.
  const canvas = document.getElementById("fireflies");
  const context = canvas && canvas.getContext("2d");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let particles = [];
  let frame = 0;
  let running = false;

  function resizeCanvas() {
    if (!canvas || !context) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.floor(canvas.clientWidth * ratio);
    canvas.height = Math.floor(canvas.clientHeight * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    particles = Array.from({ length: reduceMotion ? 10 : 34 }, () => ({
      x: Math.random() * canvas.clientWidth,
      y: Math.random() * canvas.clientHeight,
      radius: 0.7 + Math.random() * 1.6,
      alpha: 0.15 + Math.random() * 0.55,
      phase: Math.random() * Math.PI * 2,
      speed: 0.002 + Math.random() * 0.006
    }));
  }

  function drawParticles() {
    if (!running || !context) return;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    context.clearRect(0, 0, width, height);
    particles.forEach(particle => {
      particle.phase += particle.speed;
      const alpha = particle.alpha * (0.55 + Math.sin(particle.phase) * 0.45);
      context.beginPath();
      context.fillStyle = `rgba(211, 177, 255, ${alpha})`;
      context.shadowBlur = reduceMotion ? 0 : 12;
      context.shadowColor = "#b98cff";
      context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      context.fill();
      if (!reduceMotion) {
        particle.x += Math.sin(particle.phase) * 0.12;
        particle.y -= 0.08;
        if (particle.y < -4) particle.y = height + 4;
      }
    });
    context.shadowBlur = 0;
    frame = window.requestAnimationFrame(drawParticles);
  }

  function startParticles() {
    if (!context || running || reduceMotion) return;
    running = true;
    drawParticles();
  }
  function stopParticles() {
    running = false;
    if (frame) window.cancelAnimationFrame(frame);
    frame = 0;
  }

  if (canvas && context) {
    resizeCanvas();
    startParticles();
    window.addEventListener("resize", resizeCanvas, { passive: true });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stopParticles();
      else startParticles();
    });
  }

  // Keyboard navigation is intentionally limited to the journey's forward flow.
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && currentScene > 0) {
      showScene(sceneIds[currentScene - 1]);
    }
  });

  // Initial state and progress indicator.
  progress.style.width = `${100 / scenes.length}%`;
  count.textContent = `01 — ${String(scenes.length).padStart(2, "0")}`;
})();
