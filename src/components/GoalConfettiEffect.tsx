import React, { useEffect, useRef } from 'react';

interface GoalConfettiEffectProps {
  active: boolean;
  onComplete?: () => void;
}

interface GoldStarParticle {
  x: number;
  y: number;
  size: number;
  color: string;
  speedX: number;
  speedY: number;
  gravity: number;
  rotation: number;
  rotationSpeed: number;
  alpha: number;
  decay: number;
  isStar: boolean;
}

export const GoalConfettiEffect: React.FC<GoalConfettiEffectProps> = ({ active, onComplete }) => {
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

    // Goal Theme Colors: Gold, Amber, Emerald, Diamond White
    const colors = [
      '#fbbf24', // amber-400
      '#f59e0b', // amber-500
      '#10b981', // emerald-500
      '#34d399', // emerald-400
      '#fcd34d', // amber-300
      '#ffffff', // white glow
      '#6ee7b7'  // emerald-300
    ];

    const particles: GoldStarParticle[] = [];
    const particleCount = 150;

    // Helper to draw a star
    const drawStar = (cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number, color: string, alpha: number) => {
      let rot = (Math.PI / 2) * 3;
      let x = cx;
      let y = cy;
      let step = Math.PI / spikes;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(cx, cy - outerRadius);

      for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
      }

      ctx.lineTo(cx, cy - outerRadius);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    // Initialize particles shooting upwards from the bottom/center
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.random() * 80 + 50) * (Math.PI / 180); // angle between 50 and 130 deg
      const speed = Math.random() * 12 + 8;
      
      particles.push({
        x: canvas.width / 2 + (Math.random() * 100 - 50),
        y: canvas.height - 20,
        size: Math.random() * 8 + 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedX: Math.cos(angle) * speed * (Math.random() > 0.5 ? 1 : -1),
        speedY: -Math.sin(angle) * speed,
        gravity: 0.22,
        rotation: Math.random() * 360,
        rotationSpeed: Math.random() * 14 - 7,
        alpha: 1.0,
        decay: Math.random() * 0.015 + 0.008,
        isStar: Math.random() > 0.45
      });
    }

    let animationId: number;
    let startTime = Date.now();
    const duration = 4500; // 4.5 seconds

    const render = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed > duration) {
        cancelAnimationFrame(animationId);
        if (onComplete) onComplete();
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw active backdrop glow for goal completion
      const grad = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 10,
        canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) / 2
      );
      grad.addColorStop(0, 'rgba(16, 185, 129, 0.03)');
      grad.addColorStop(0.5, 'rgba(245, 158, 11, 0.01)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        // Physics update
        p.speedY += p.gravity;
        p.x += p.speedX;
        p.y += p.speedY;
        p.rotation += p.rotationSpeed;
        p.alpha -= p.decay;

        if (p.alpha > 0) {
          if (p.isStar) {
            drawStar(p.x, p.y, 5, p.size, p.size / 2, p.color, p.alpha);
          } else {
            // Draw glowing circle
            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
            ctx.shadowBlur = 8;
            ctx.shadowColor = p.color;
            ctx.fill();
            ctx.restore();
          }
        }
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
