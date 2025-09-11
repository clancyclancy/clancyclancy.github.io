// script.js

console.log("script.js is loaded!");
console.log("Delaunator is", typeof Delaunator);

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById("bg");
  if (!canvas) {
    alert("Canvas element not found!");
    return;
  }
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    alert("Canvas context not found!");
    return;
  }

  let WIDTH, HEIGHT;

  // ====== CONFIG ======
  const NUM_POINTS = 60;
  const EDGE_POINTS_PER_SIDE = 10;
  const POINT_SPEED = 0.15;
  const POINT_RADIUS = 3;
  const COLOR_SHIFT_SPEED = 0.001;

  const HUE_MIN = 0.66; // navy hue
  const VAL_MIN = 0.10;
  const VAL_MAX = 0.35;
  const SAT_MIN = 0.9;
  const SAT_MAX = 1.0;

  // ====== STATE ======
  let points = [];
  let velocities = [];
  let pointHSV = [];

  // ====== UTILITIES ======
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

  // ====== INIT POINTS ======
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

  // Match canvas size to window size and re-init points
  function resizeCanvas() {
    WIDTH = window.innerWidth;
    HEIGHT = window.innerHeight;
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    initPoints();
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  // ====== ANIMATION LOOP ======
  function step() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    // TEST: draw a red square to confirm canvas works
    // Uncomment the next two lines to test:
    // ctx.fillStyle = "red";
    // ctx.fillRect(0, 0, 100, 100);

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

    // Shimmer effect
    for (let hsv of pointHSV) {
      hsv[2] += (Math.random() * 2 - 1) * COLOR_SHIFT_SPEED;
      hsv[2] = Math.max(VAL_MIN, Math.min(VAL_MAX, hsv[2]));
    }

    // Triangulate
    const delaunay = Delaunator.from(points);
    const triangles = delaunay.triangles;

    // Draw triangles
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

    // Draw points
    for (let i = 0; i < points.length; i++) {
      const [h, s, v] = pointHSV[i];
      const [r, g, b] = hsvToRgb(h, s, v);
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.beginPath();
      ctx.arc(points[i][0], points[i][1], POINT_RADIUS, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(step);
  } 

  requestAnimationFrame(step);
}); 