// Main script (animation + media handlers + galleries)

console.log("script.js loaded");
console.log("Delaunator present?", typeof Delaunator);

window.addEventListener('DOMContentLoaded', () => {
  // Grad research video embed
  const mediaFrame = document.getElementById('grad-media');
  const coverImg = document.getElementById('grad-cover');
  const playBtn = document.getElementById('grad-play');
  if (mediaFrame && coverImg && playBtn) {
    playBtn.addEventListener('click', () => {
      const iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube.com/embed/0tiTrBepmFs?autoplay=1&rel=0&vq=hd1080&playsinline=1';
      iframe.title = 'Graduate Research Video';
      iframe.allow = 'autoplay; encrypted-media';
      iframe.allowFullscreen = true;
      mediaFrame.appendChild(iframe);
      coverImg.style.display = 'none';
      playBtn.style.display = 'none';
    });
  }

  // OSRS bot video embed
  const osrsFrame = document.getElementById('osrs-media');
  const osrsCover = document.getElementById('osrs-cover');
  const osrsPlay = document.getElementById('osrs-play');
  if (osrsFrame && osrsCover && osrsPlay) {
    osrsPlay.addEventListener('click', () => {
      const iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube.com/embed/OB_UskZ1ajc?autoplay=1&rel=0&vq=hd1080&playsinline=1';
      iframe.title = 'OSRS Fishing Bot Video';
      iframe.allow = 'autoplay; encrypted-media';
      iframe.allowFullscreen = true;
      osrsFrame.appendChild(iframe);
      osrsCover.style.display = 'none';
      osrsPlay.style.display = 'none';
    });
  }

  // Chess AI placeholder video embed
  const chessAIFrame = document.getElementById('chessai-media');
  const chessAICover = document.getElementById('chessai-cover');
  const chessAIPlay  = document.getElementById('chessai-play');
  if (chessAIFrame && chessAICover && chessAIPlay) {
    chessAIPlay.addEventListener('click', () => {
      const iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube.com/embed/VIDEO_ID?autoplay=1&rel=0&vq=hd1080&playsinline=1';
      iframe.title = 'Chess AI Video';
      iframe.allow = 'autoplay; encrypted-media';
      iframe.allowFullscreen = true;
      chessAIFrame.appendChild(iframe);
      chessAICover.style.display = 'none';
      chessAIPlay.style.display = 'none';
    });
  }

  // Scroll line sizing
  const canvas = document.getElementById("bg");
  const ctx = canvas.getContext("2d");
  const content = document.querySelector('.content');
  const scrollText = document.querySelector('.scroll-text');
  const scrollLineExtend = document.querySelector('.scroll-line-extend');

  function positionScrollLineExtend() {
    if (!scrollText || !scrollLineExtend) return;
    const rect = scrollText.getBoundingClientRect();
    const top = rect.bottom;
    const height = window.innerHeight - top;
    scrollLineExtend.style.top = `${top}px`;
    scrollLineExtend.style.height = `${height}px`;
  }
  window.addEventListener('scroll', positionScrollLineExtend);
  window.addEventListener('resize', positionScrollLineExtend);
  positionScrollLineExtend();

  // Background animation config
  const NUM_POINTS = 60;
  const EDGE_POINTS_PER_SIDE = 10;
  const POINT_SPEED = 0.15;
  const POINT_RADIUS = 10;
  const COLOR_SHIFT_SPEED = 0.001;

  const HUE_MIN = 0.66;
  const VAL_MIN = 0.35;
  const VAL_MAX = 0.60;
  const SAT_MIN = 0.9;
  const SAT_MAX = 1.0;

  // State arrays
  let points = [];
  let velocities = [];
  let pointHSV = [];

  // HSV -> RGB helper
  function hsvToRgb(h, s, v) {
    let r, g, b;
    let i = Math.floor(h * 6);
    let f = h * 6 - i;
    let p = v * (1 - s);
    let q = v * (1 - f * s);
    let t = v * (1 - (1 - f) * s);
    switch (i % 6) {
      case 0: r = v; g = t; b = p; break;
      case 1: r = q; g = v; b = p; break;
      case 2: r = p; g = v; b = t; break;
      case 3: r = p; g = q; b = v; break;
      case 4: r = t; g = p; b = v; break;
      case 5: r = v; g = p; b = q; break;
    }
    return [Math.floor(r * 255), Math.floor(g * 255), Math.floor(b * 255)];
  }

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  // Point initialization
  function initPoints() {
    points = [];
    velocities = [];
    pointHSV = [];

    // Interior points
    for (let i = 0; i < NUM_POINTS; i++) {
      points.push([Math.random() * WIDTH, Math.random() * HEIGHT]);
      const angle = Math.random() * Math.PI * 2;
      velocities.push([Math.cos(angle) * POINT_SPEED, Math.sin(angle) * POINT_SPEED]);
      pointHSV.push([HUE_MIN, rand(SAT_MIN, SAT_MAX), rand(VAL_MIN, VAL_MAX)]);
    }

    // Edge points
    const n = EDGE_POINTS_PER_SIDE;
    for (let i = 0; i < n; i++) {
      const x = (i * WIDTH) / (n - 1);
      // top
      points.push([x, 0]); velocities.push([0, 0]); pointHSV.push([HUE_MIN, rand(SAT_MIN, SAT_MAX), rand(VAL_MIN, VAL_MAX)]);
      // bottom
      points.push([x, HEIGHT]); velocities.push([0, 0]); pointHSV.push([HUE_MIN, rand(SAT_MIN, SAT_MAX), rand(VAL_MIN, VAL_MAX)]);
    }
    for (let i = 0; i < n; i++) {
      const y = (i * HEIGHT) / (n - 1);
      // left
      points.push([0, y]); velocities.push([0, 0]); pointHSV.push([HUE_MIN, rand(SAT_MIN, SAT_MAX), rand(VAL_MIN, VAL_MAX)]);
      // right
      points.push([WIDTH, y]); velocities.push([0, 0]); pointHSV.push([HUE_MIN, rand(SAT_MIN, SAT_MAX), rand(VAL_MIN, VAL_MAX)]);
    }
  }

  // Canvas sizing
  function resizeCanvas() {
    WIDTH = window.innerWidth;
    HEIGHT = window.innerHeight;
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    initPoints();
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  // Simple image switcher (grad) — kept for possible reuse
  const gradImages = [
    "images/graduate_research/0.PNG",
    "images/graduate_research/1.PNG"
  ];
  let currentGradImage = 0;
  const gradImageEl = document.getElementById('grad-research-image');
  if (gradImageEl) {
    gradImageEl.addEventListener('click', () => {
      currentGradImage = (currentGradImage + 1) % gradImages.length;
      gradImageEl.src = gradImages[currentGradImage];
    });
  }

  // Video cover play button logic
  const playButton = document.getElementById('play-button');
  const videoCover = document.getElementById('video-cover');
  const videoBox = document.getElementById('grad-research-video-box');
  if (playButton && videoCover && videoBox) {
    playButton.addEventListener('click', () => {
      videoBox.innerHTML = `
        <iframe width="100%" height="100%" style="border-radius:16px; box-shadow:0 2px 16px rgba(0,0,0,0.12);"
          src="https://www.youtube.com/embed/0tiTrBepmFs?autoplay=1&rel=0"
          title="Graduate Research Video"
          frameborder="0"
          allow="autoplay; encrypted-media"
          allowfullscreen>
        </iframe>
      `;
    });
  }

  // Three-column cycling gallery (art)
  (function initArtGallery() {
    const gallery = document.querySelector('[data-role="art-gallery"]');
    if (!gallery) return;
    const ART_IMAGE_COUNT = 10;
    const artImages = Array.from({ length: ART_IMAGE_COUNT }, (_, i) => `images/art/${i}.png`);
    let startIndex = 0;
    const slots = gallery.querySelectorAll('[data-slot]');
    const prevBtn = gallery.querySelector('[data-action="art-prev"]');
    const nextBtn = gallery.querySelector('[data-action="art-next"]');
    function render() {
      slots.forEach((img, offset) => {
        const idx = (startIndex + offset) % artImages.length;
        img.src = artImages[idx];
        img.alt = `Art image ${idx}`;
      });
    }
    function step(delta) {
      startIndex = (startIndex + delta + artImages.length) % artImages.length;
      render();
    }
    prevBtn?.addEventListener('click', () => step(-1));
    nextBtn?.addEventListener('click', () => step(1));
    render();
  })();

  // Charcoal gallery (same logic as art)
  (function initCharcoalGallery() {
    const gallery = document.querySelector('[data-role="charcoal-gallery"]');
    if (!gallery) return;
    const CHARCOAL_IMAGE_COUNT = 6;
    const images = Array.from({ length: CHARCOAL_IMAGE_COUNT }, (_, i) => `images/charcoal/${i}.png`);
    let startIndex = 0;
    const slots = gallery.querySelectorAll('[data-slot]');
    const prevBtn = gallery.querySelector('[data-action="charcoal-prev"]');
    const nextBtn = gallery.querySelector('[data-action="charcoal-next"]');
    function render() {
      slots.forEach((img, offset) => {
        const idx = (startIndex + offset) % images.length;
        img.src = images[idx];
        img.alt = `Charcoal image ${idx}`;
      });
    }
    function step(delta) {
      startIndex = (startIndex + delta + images.length) % images.length;
      render();
    }
    prevBtn?.addEventListener('click', () => step(-1));
    nextBtn?.addEventListener('click', () => step(1));
    render();
  })();

  // Animation loop for triangulated background
  function stepFrame() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    // Move interior points
    for (let i = 0; i < points.length; i++) {
      const vx = velocities[i][0];
      const vy = velocities[i][1];
      if (vx !== 0 || vy !== 0) {
        points[i][0] += vx;
        points[i][1] += vy;
        if (points[i][0] <= 0 || points[i][0] >= WIDTH) velocities[i][0] *= -1;
        if (points[i][1] <= 0 || points[i][1] >= HEIGHT) velocities[i][1] *= -1;
      }
    }

    // Subtle brightness jitter
    for (let hsv of pointHSV) {
      hsv[2] += (Math.random() * 2 - 1) * COLOR_SHIFT_SPEED;
      hsv[2] = Math.max(VAL_MIN, Math.min(VAL_MAX, hsv[2]));
    }

    // Triangulation
    const delaunay = Delaunator.from(points);
    const triangles = delaunay.triangles;

    // First fill pass
    for (let i = 0; i < triangles.length; i += 3) {
      const p0 = points[triangles[i]];
      const p1 = points[triangles[i + 1]];
      const p2 = points[triangles[i + 2]];
      const c0 = pointHSV[triangles[i]];
      const c1 = pointHSV[triangles[i + 1]];
      const c2 = pointHSV[triangles[i + 2]];
      const avgH = (c0[0] + c1[0] + c2[0]) / 3;
      const avgS = (c0[1] + c1[1] + c2[1]) / 3;
      const avgV = (c0[2] + c1[2] + c2[2]) / 3;
      const [r, g, b] = hsvToRgb(avgH, avgS, avgV);
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.beginPath();
      ctx.moveTo(p0[0], p0[1]);
      ctx.lineTo(p1[0], p1[1]);
      ctx.lineTo(p2[0], p2[1]);
      ctx.closePath();
      ctx.fill();
    }

    // Stroke pass (same color)
    for (let i = 0; i < triangles.length; i += 3) {
      const p0 = points[triangles[i]];
      const p1 = points[triangles[i + 1]];
      const p2 = points[triangles[i + 2]];
      const c0 = pointHSV[triangles[i]];
      const c1 = pointHSV[triangles[i + 1]];
      const c2 = pointHSV[triangles[i + 2]];
      const avgH = (c0[0] + c1[0] + c2[0]) / 3;
      const avgS = (c0[1] + c1[1] + c2[1]) / 3;
      const avgV = (c0[2] + c1[2] + c2[2]) / 3;
      const [r, g, b] = hsvToRgb(avgH, avgS, avgV);
      const color = `rgb(${r}, ${g}, ${b})`;
      ctx.fillStyle = color;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(p0[0], p0[1]);
      ctx.lineTo(p1[0], p1[1]);
      ctx.lineTo(p2[0], p2[1]);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // Point render (kept for a dotted aesthetic)
    for (let i = 0; i < points.length; i++) {
      const [h, s, v] = pointHSV[i];
      const [r, g, b] = hsvToRgb(h, s, v);
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.beginPath();
      ctx.arc(points[i][0], points[i][1], POINT_RADIUS, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(stepFrame);
  }
  requestAnimationFrame(stepFrame);
});