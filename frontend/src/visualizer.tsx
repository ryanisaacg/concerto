import { useEffect, useState } from "preact/hooks";
import { RefObject } from "preact";
import { VisualizerController } from "./visualizer-controller";

interface VisualizerProps {
  controller: RefObject<VisualizerController>;
}

export function Visualizer({ controller }: VisualizerProps) {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (canvas == null) {
      return;
    }
    const visualizer = new VisualizerController(canvas);
    controller.current = visualizer;
    return () => visualizer.stop();
  }, [canvas]);

  return <canvas ref={setCanvas} width={800} height={600} />;
}
