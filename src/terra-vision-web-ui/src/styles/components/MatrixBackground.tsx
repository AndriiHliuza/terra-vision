import {useEffect, useRef} from "react";
import type {MatrixBackgroundProps} from "../../commons/models.ts";
import "../../styles/components/MatrixBackground.css";

export default function MatrixBackground({
                                             speed = 33,
                                             fontSize = 16,
                                             color = "#0F0",
                                             backgroundColor = "#000000",
                                             backgroundOpacity = 0.1,
                                         }: MatrixBackgroundProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const hexToRgba = (hex: string, opacity: number) => {
        const shorthand = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthand, (_, r, g, b) => r + r + g + g + b + b);

        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (!result) return `rgba(0,0,0,${opacity})`;

        const r = parseInt(result[1], 16);
        const g = parseInt(result[2], 16);
        const b = parseInt(result[3], 16);
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Matrix characters - katakana, latin letters, nums
        const chars = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()123456789";
        const charArray = chars.split('');

        let drops: number[] = [];

        const initCanvas = () => {
            canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
            canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;

            const columns = Math.floor(canvas.width / fontSize);

            // Only initialize if drops is empty (first run)
            if (drops.length === 0) {
                drops = Array(columns).fill(1).map(() => Math.random() * -100);
            } else {
                // Adjust drops array for new column count
                const oldLength = drops.length;

                if (columns > oldLength) {
                    // Add new columns with random starting positions
                    for (let i = oldLength; i < columns; i++) {
                        drops.push(Math.random() * -100);
                    }
                } else if (columns < oldLength) {
                    // Remove excess columns
                    drops = drops.slice(0, columns);
                }
            }
        };

        initCanvas();

        function draw() {
            if (!ctx || !canvas) return;

            // Background with transparency for trail effect
            ctx.fillStyle = hexToRgba(backgroundColor, backgroundOpacity);
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = color;
            ctx.font = fontSize + 'px monospace';

            for (let i = 0; i < drops.length; i++) {
                // Random character
                const text = charArray[Math.floor(Math.random() * charArray.length)];

                // Draw character
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);

                // Reset drop to top randomly or when it goes off screen
                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }

                drops[i]++;
            }
        }

        const interval = setInterval(draw, speed);

        // Handle window resize
        const handleResize = () => {
            initCanvas();
        };

        window.addEventListener('resize', handleResize);

        return () => {
            clearInterval(interval);
            window.removeEventListener('resize', handleResize);
        };
    }, [speed, fontSize, color, backgroundColor, backgroundOpacity]);

    return (
        <canvas ref={canvasRef} className="matrix-canvas"/>
    );
}