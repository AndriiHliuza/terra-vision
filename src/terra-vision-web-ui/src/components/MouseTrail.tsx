import { useRef, useEffect } from "react";

interface Particle {
    x: number;
    y: number;
    radius: number;
    color: string;
    alpha: number; // transparency
}

function MouseTrail() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Particle[]>([]);

    useEffect(() => {

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const colors = ["#a9a4bf", "#96b5c5", "#89afcd"];
        const maxParticles = 50;

        const handleMouseMove = (e: MouseEvent) => {
            particlesRef.current.push({
                x: e.clientX,
                y: e.clientY,
                radius: 30, // large foggy radius
                color: colors[Math.floor(Math.random() * colors.length)],
                alpha: 0.3, // initial transparency
            });

            if (particlesRef.current.length > maxParticles) {
                particlesRef.current.shift();
            }
        };

        window.addEventListener("mousemove", handleMouseMove);

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particlesRef.current.forEach((p) => {
                // create radial gradient for fog effect
                const gradient = ctx.createRadialGradient(
                    p.x,
                    p.y,
                    0,
                    p.x,
                    p.y,
                    p.radius
                );
                const rgba = hexToRgb(p.color);
                gradient.addColorStop(0, `rgba(${rgba}, ${p.alpha})`);
                gradient.addColorStop(1, `rgba(${rgba}, 0)`);

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fill();

                p.alpha -= 0.005; // slow fade
            });

            // Remove fully faded particles
            particlesRef.current = particlesRef.current.filter((p) => p.alpha > 0);

            requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
        };
    }, []);

    const hexToRgb = (hex: string) => {
        const bigint = parseInt(hex.replace("#", ""), 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return `${r},${g},${b}`;
    };

    return <canvas
        ref={canvasRef}
        style={{ position: "fixed", top: 0, left: 0, pointerEvents: "none" }}
    />
}

export default MouseTrail;