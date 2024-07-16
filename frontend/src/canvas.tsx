import { RefObject } from "preact";
import { useEffect, useMemo, useState } from "preact/hooks";

interface CanvasProps {
  points: Point[];
}

interface Point {
  x: number;
  y: number;
  color: string;
  pings: Ping[];
}

interface Ping {
  startTime: number;
}

export function Canvas({ points }: CanvasProps) {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const ctx = useMemo(() => canvas?.getContext("2d"), [canvas]);

  useEffect(() => {
    const isCancelled = { current: false };
    if (ctx) {
      requestAnimationFrame(() => render(ctx, points, isCancelled));
    }

    return () => (isCancelled.current = true);
  }, [ctx, points]);

  return (
    <canvas ref={setCanvas} width="800" height="600">
      {" "}
    </canvas>
  );
}

const RADIUS = 4;
const PIXELS_PER_MILLISECOND = 0.005;

function render(
  ctx: CanvasRenderingContext2D,
  points: Point[],
  isCancelled: RefObject<boolean>,
) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  for (const point of points) {
    ctx.fillStyle = point.color;
    ctx.strokeStyle = point.color;

    ctx.beginPath();
    ctx.arc(point.x, point.y, RADIUS, 0, 2 * Math.PI);
    ctx.fill();

    for (const ping of point.pings) {
      const elapsed = Date.now() - ping.startTime;
      const radius = elapsed * PIXELS_PER_MILLISECOND;
      ctx.beginPath();
      ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI);
      ctx.stroke();
    }
  }

  if (!isCancelled.current) {
    requestAnimationFrame(() => render(ctx, points, isCancelled));
  }
}
