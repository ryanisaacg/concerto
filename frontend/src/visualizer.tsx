import { useEffect, useRef, useState } from "preact/hooks";
import * as THREE from "three";
import { Material } from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { RefObject } from "preact";

const RADIUS = 3;
const NOTE_SPEED = 0.0000027;
const EARTH_ROTATION = 0.000001;
const EARTH_TILT = (23.5 * Math.PI) / 180;

export function Visualizer() {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const addNote = useRef<((note: Note) => void) | null>(null);

  useEffect(() => {
    if (canvas == null) {
      return;
    }
    run(canvas, addNote);
  }, [canvas]);

  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      <canvas ref={setCanvas} width={800} height={600} />
      <div>
        <button
          onClick={() =>
            addNote.current?.(new Note(40.69, -73.98, 0, 0x00ffaa))
          }
        >
          Brooklyn
        </button>
        <button
          onClick={() => addNote.current?.(new Note(48.86, 2.35, 0, 0x00ffaa))}
        >
          Paris
        </button>
        <button
          onClick={() => addNote.current?.(new Note(28.7, 77.1, 0, 0x00ffaa))}
        >
          New Delhi
        </button>
        <button
          onClick={() =>
            addNote.current?.(new Note(-37.81, 144.96, 0, 0x00ffaa))
          }
        >
          Melbourne
        </button>
        <button onClick={() => addNote.current?.(new Note(0, 0, 0, "red"))}>
          Null Island
        </button>
      </div>
    </div>
  );
}

async function run(
  canvas: HTMLCanvasElement,
  addNote: RefObject<(note: Note) => void>,
) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    canvas.width / canvas.height,
    0.1,
    1000,
  );
  const renderer = new THREE.WebGLRenderer({ canvas });
  renderer.setSize(canvas.width, canvas.height);

  const controls = new OrbitControls(camera, canvas);

  const root = new THREE.Group();

  camera.position.z = 5;

  const earth: THREE.Texture = new THREE.TextureLoader().load("/earth.png");
  earth.wrapS = THREE.RepeatWrapping;
  earth.wrapT = THREE.RepeatWrapping;
  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(RADIUS - 0.01, 64, 32),
    new THREE.MeshBasicMaterial({
      map: earth,
    }),
  );
  root.add(sphere);

  const wireframe = new THREE.LineSegments(
    new THREE.WireframeGeometry(new THREE.SphereGeometry(RADIUS, 32, 16)),
  );
  const mat = wireframe.material as Material;
  mat.depthTest = false;
  mat.opacity = 0.25;
  mat.transparent = true;
  //root.add(wireframe);

  scene.add(root);

  const circles = new Map();

  const notes: Note[] = [];
  addNote.current = (note) => {
    root.add(note.circle);
    notes.push(note);
  };

  const axialTilt = new THREE.Quaternion();
  axialTilt.setFromAxisAngle(new THREE.Vector3(0, 0, 1), EARTH_TILT);
  root.applyQuaternion(axialTilt);

  const spinOnAxis = new THREE.Quaternion();
  const earthPoleAxis = new THREE.Vector3(0, 1, 0);
  earthPoleAxis.applyQuaternion(axialTilt);
  spinOnAxis.setFromAxisAngle(earthPoleAxis, EARTH_ROTATION * 1000);

  function animate() {
    controls.update();
    for (const note of notes) {
      note.tick(RADIUS, circles);
    }
    let i = 0;
    while (i < notes.length) {
      if (notes[i].progress >= Math.PI * 2 * RADIUS) {
        root.remove(notes[i].circle);
        notes.splice(i, 1);
      } else {
        i += 1;
      }
    }

    root.applyQuaternion(spinOnAxis);
    renderer.render(scene, camera);
  }
  renderer.setAnimationLoop(animate);
}

function createCircle(radius: number) {
  const circleGeometry = new THREE.CircleGeometry(radius, 64);

  // Remove center vertex
  const itemSize = 3;
  circleGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(
      circleGeometry.attributes.position.array.slice(
        itemSize,
        circleGeometry.attributes.position.array.length - itemSize,
      ),
      itemSize,
    ),
  );
  circleGeometry.index = null;

  return circleGeometry;
}

export function latLongToQuat(lat: number, long: number): THREE.Quaternion {
  // Adapted from https://stackoverflow.com/questions/5437865/longitude-latitude-to-quaternion
  const radLat = (lat * Math.PI) / 180;
  const q1 = new THREE.Quaternion();
  q1.setFromAxisAngle(new THREE.Vector3(1, 0, 0), radLat);

  // This -90 compensates for the Earth not matching our home-baked coordinate system
  const radLong = ((long - 90) * Math.PI) / 180;
  const q2 = new THREE.Quaternion();
  q2.setFromAxisAngle(new THREE.Vector3(0, 1, 0), radLong);

  return q2.multiply(q1);
}

class Note {
  quat: THREE.Quaternion;
  progress: number;
  speed: number;
  circle: THREE.LineLoop;

  constructor(
    lat: number,
    long: number,
    progress: number,
    color: THREE.ColorRepresentation,
  ) {
    this.quat = latLongToQuat(lat, long);
    this.progress = progress;
    this.speed = NOTE_SPEED;
    this.circle = new THREE.LineLoop(
      createCircle(2),
      new THREE.LineBasicMaterial({ color, linewidth: 4 }),
    );
    this.circle.applyQuaternion(this.quat);
  }

  tick(sphereRadius: number, circles: Map<number, THREE.CircleGeometry>) {
    this.progress += this.speed * 1000;

    const radius = sphereRadius * Math.sin(this.progress / (2 * sphereRadius));

    if (radius > 0) {
      let geometry = circles.get(radius);
      if (geometry == null) {
        geometry = createCircle(radius);
        circles.set(radius, geometry);
      }
      this.circle.geometry = geometry;
    }

    const sign = this.progress >= Math.PI * sphereRadius ? 1 : -1;

    const axialDistance =
      Math.sqrt(sphereRadius ** 2 - Math.abs(radius ** 2)) * sign;
    this.circle.position.set(0, 0, 1); // (0, 0, 1) produces the same direction as the rotation
    this.circle.position.applyQuaternion(this.quat);
    this.circle.position.multiplyScalar(axialDistance);
  }
}
