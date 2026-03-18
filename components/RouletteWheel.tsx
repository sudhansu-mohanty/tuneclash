"use client";

import {
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useCallback,
} from "react";
import type { Entry } from "@/lib/types";

const COLORS = [
  "#ff5c3a",
  "#3a7bff",
  "#22cc77",
  "#ffcc3a",
  "#cc44ff",
  "#ff44aa",
  "#44ddff",
  "#ff9922",
];

export interface RouletteWheelHandle {
  spin: () => void;
}

interface Props {
  entries: Entry[];
  onLand: (entry: Entry) => void;
}

const RouletteWheel = forwardRef<RouletteWheelHandle, Props>(
  ({ entries, onLand }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rotationRef = useRef(0);
    const spinningRef = useRef(false);

    const draw = useCallback(
      (rotation: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const size = canvas.width;
        const cx = size / 2;
        const cy = size / 2;
        const r = size / 2 - 4;
        const n = entries.length;

        ctx.clearRect(0, 0, size, size);

        if (n === 0) {
          ctx.fillStyle = "#27272a";
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#71717a";
          ctx.font = `bold 16px sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("No entries yet", cx, cy);
          return;
        }

        const arc = (Math.PI * 2) / n;

        for (let i = 0; i < n; i++) {
          const start = rotation + i * arc;
          const end = start + arc;

          // Segment
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.arc(cx, cy, r, start, end);
          ctx.closePath();
          ctx.fillStyle = COLORS[i % COLORS.length];
          ctx.fill();
          ctx.strokeStyle = "#0d0d0d";
          ctx.lineWidth = 2;
          ctx.stroke();

          // Label
          const mid = start + arc / 2;
          const lx = cx + (r * 0.65) * Math.cos(mid);
          const ly = cy + (r * 0.65) * Math.sin(mid);
          ctx.save();
          ctx.translate(lx, ly);
          ctx.rotate(mid + Math.PI / 2);
          ctx.fillStyle = "#fff";
          ctx.font = `bold 13px sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          const label = entries[i].title.slice(0, 12);
          ctx.fillText(label, 0, 0);
          ctx.restore();
        }

        // Center cap
        ctx.beginPath();
        ctx.arc(cx, cy, 14, 0, Math.PI * 2);
        ctx.fillStyle = "#0d0d0d";
        ctx.fill();

        // Pointer (top)
        ctx.beginPath();
        ctx.moveTo(cx, 4);
        ctx.lineTo(cx - 10, 22);
        ctx.lineTo(cx + 10, 22);
        ctx.closePath();
        ctx.fillStyle = "#fff";
        ctx.fill();
      },
      [entries]
    );

    useEffect(() => {
      draw(rotationRef.current);
    }, [draw]);

    useImperativeHandle(ref, () => ({
      spin() {
        if (spinningRef.current || entries.length === 0) return;
        spinningRef.current = true;

        const totalRotation =
          Math.PI * 2 * (5 + Math.floor(Math.random() * 5)) +
          Math.random() * Math.PI * 2;
        const duration = 3500;
        const start = performance.now();
        const startRot = rotationRef.current;

        function easeOut(t: number) {
          return 1 - Math.pow(1 - t, 3);
        }

        function animate(now: number) {
          const elapsed = now - start;
          const t = Math.min(elapsed / duration, 1);
          const rot = startRot + totalRotation * easeOut(t);
          rotationRef.current = rot;
          draw(rot);

          if (t < 1) {
            requestAnimationFrame(animate);
          } else {
            spinningRef.current = false;

            // Determine which segment is under the top pointer
            const n = entries.length;
            const arc = (Math.PI * 2) / n;
            // Pointer is at angle -Math.PI/2 from the canvas top (pointing up)
            // We need to map the pointer's canvas angle to wheel angle
            const pointerAngle = -Math.PI / 2;
            const normalised =
              ((pointerAngle - rot) % (Math.PI * 2) + Math.PI * 2) %
              (Math.PI * 2);
            const index = Math.floor(normalised / arc) % n;
            onLand(entries[index]);
          }
        }

        requestAnimationFrame(animate);
      },
    }));

    return (
      <canvas
        ref={canvasRef}
        width={380}
        height={380}
        className="w-full max-w-[380px] aspect-square"
      />
    );
  }
);

RouletteWheel.displayName = "RouletteWheel";

export default RouletteWheel;
