import { useEffect, useState } from "preact/hooks";
import { RefObject } from "preact";
import { VisualizerController } from "./visualizer-controller";

interface VisualizerProps {
  coords: { lat: number; long: number };
  controller: RefObject<VisualizerController>;
}

export function Visualizer({ controller, coords }: VisualizerProps) {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const [isEarthLoaded, setIsEarthLoaded] = useState<boolean>(false);

  useEffect(() => {
    if (canvas == null) {
      return;
    }
    setIsEarthLoaded(false);
    const visualizer = new VisualizerController(canvas, coords, () => {
      setIsEarthLoaded(true);
    });
    controller.current = visualizer;
    return () => visualizer.stop();
  }, [canvas, coords]);

  return (
    <div>
      {isEarthLoaded ? (
        <p> Rotate the Earth with the mouse! Zoom in and out! </p>
      ) : (
        <p> Loading the Earth... </p>
      )}
      <canvas ref={setCanvas} width={800} height={600} />
    </div>
  );
}
