import { useEffect, useState } from "preact/hooks";
import { RefObject } from "preact";
import { VisualizerController } from "./visualizer-controller";

interface VisualizerProps {
  controller: RefObject<VisualizerController>;
}

export function Visualizer({ controller }: VisualizerProps) {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const [isEarthLoaded, setIsEarthLoaded] = useState<boolean>(false);

  useEffect(() => {
    if (canvas == null) {
      return;
    }
    setIsEarthLoaded(false);
    const visualizer = new VisualizerController(canvas, () => {
      setIsEarthLoaded(true);
    });
    controller.current = visualizer;
    return () => visualizer.stop();
  }, [canvas]);

  return (
    <div>
      {isEarthLoaded ? null : <p> Loading the Earth... </p>}
      <canvas ref={setCanvas} width={800} height={600} />
    </div>
  );
}
