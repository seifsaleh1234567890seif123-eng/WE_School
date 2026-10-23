// High-Performance Cyber Particle Mesh (Ultra-Lightweight & GPU Efficient)
function initCyberParticles(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  // Skip completely on low-powered mobile devices to save 100% CPU/battery
  if (window.innerWidth < 768) {
    canvas.style.display = 'none';
    return;
  }

  const ctx = canvas.getContext('2d', { alpha: true });
  let width, height;
  let particles = [];
  let isVisible = true;
  let animId = null;

  function resize() {
    width = canvas.width = canvas.parentElement.offsetWidth || window.innerWidth;
    height = canvas.height = canvas.parentElement.offsetHeight || window.innerHeight;
    createParticles();
  }

  function createParticles() {
    particles = [];
    // Strict cap: maximum 28 particles (down from 150+) to eliminate O(N^2) lag
    const count = Math.min(28, Math.max(12, Math.floor((width * height) / 45000)));
    const colors = ['#5E2784', '#7E33B8', '#C48822'];
    
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 1.5 + 1,
        color: colors[i % colors.length]
      });
    }
  }

  // Only animate when visible in viewport
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      isVisible = entries[0].isIntersecting;
      if (isVisible && !animId) {
        draw();
      }
    }, { threshold: 0.1 });
    observer.observe(canvas);
  }

  function draw() {
    if (!isVisible) {
      animId = null;
      return;
    }

    ctx.clearRect(0, 0, width, height);

    // Subtle connection lines (cheap distance calculation)
    const pLen = particles.length;
    for (let i = 0; i < pLen; i++) {
      const pi = particles[i];
      for (let j = i + 1; j < pLen; j++) {
        const pj = particles[j];
        const dx = pi.x - pj.x;
        const dy = pi.y - pj.y;
        if (Math.abs(dx) > 90 || Math.abs(dy) > 90) continue; // Early exit
        const distSq = dx * dx + dy * dy;

        if (distSq < 8100) { // 90^2
          const alpha = (1 - Math.sqrt(distSq) / 90) * 0.2;
          ctx.beginPath();
          ctx.moveTo(pi.x, pi.y);
          ctx.lineTo(pj.x, pj.y);
          ctx.strokeStyle = `rgba(94, 39, 132, ${alpha})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }

      // Update particle position
      pi.x += pi.vx;
      pi.y += pi.vy;
      if (pi.x < 0 || pi.x > width) pi.vx *= -1;
      if (pi.y < 0 || pi.y > height) pi.vy *= -1;

      // Draw particle (zero shadowBlur for 60fps smoothness)
      ctx.beginPath();
      ctx.arc(pi.x, pi.y, pi.radius, 0, Math.PI * 2);
      ctx.fillStyle = pi.color;
      ctx.fill();
    }

    animId = requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize, { passive: true });
  resize();
  draw();
}
