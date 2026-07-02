import React, { useEffect, useRef } from 'react';

interface ConfettiEffectProps {
  active: boolean;
  onComplete?: () => void;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  color: string;
  speedX: number;
  speedY: number;
  rotation: number;
  rotationSpeed: number;
}

export const ConfettiEffect: React.FC<ConfettiEffectProps> = ({ active, onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set dimensions
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle pool
    const colors = [
      '#6366f1', // indigo
      '#f59e0b', // amber
      '#10b981', // emerald
      '#a855f7', // purple
      '#ec4899', // pink
      '#3b82f6', // blue
      '#e11d48'  // rose
    ];

    const particles: Particle[] = [];
    const particleCount = 140;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * -canvas.height - 20, // start above view
        size: Math.random() * 8 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedX: Math.random() * 4 - 2,
        speedY: Math.random() * 4 + 4,
        rotation: Math.random() * 360,
        rotationSpeed: Math.random() * 10 - 5
      });
    }

    let animationId: number;
    let startTime = Date.now();
    const duration = 10000; // 10 seconds duration as requested

    const render = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed > duration) {
        cancelAnimationFrame(animationId);
        if (onComplete) onComplete();
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Smoothly fade out all confetti over the last 2 seconds
      let globalAlpha = 1.0;
      if (elapsed > duration - 2000) {
        globalAlpha = Math.max(0, (duration - elapsed) / 2000);
      }

      particles.forEach((p) => {
        // Move particle
        p.y += p.speedY;
        p.x += p.speedX + Math.sin(p.y / 30) * 0.5; // subtle sway
        p.rotation += p.rotationSpeed;

        // Reset if goes off-screen (only if we are not in the fade-out phase to let them drain out)
        if (p.y > canvas.height && elapsed < duration - 2000) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
        }

        // Draw particle
        ctx.save();
        ctx.globalAlpha = globalAlpha;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        
        // Render rect/paper shape
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.5);
        ctx.restore();
      });

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [active, onComplete]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full z-50 pointer-events-none select-none"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};
