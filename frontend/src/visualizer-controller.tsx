import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";

const RADIUS = 3;
const NOTE_SPEED = 0.0000027;
const EARTH_ROTATION = 0.000001;
const EARTH_TILT = (23.5 * Math.PI) / 180;

export class VisualizerController {
  private root: THREE.Group;
  private renderer: THREE.WebGLRenderer;
  private notes: VisualizerNote[];

  constructor(canvas: HTMLCanvasElement) {
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

    this.root = new THREE.Group();

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
    this.root.add(sphere);

    const wireframe = new THREE.LineSegments(
      new THREE.WireframeGeometry(new THREE.SphereGeometry(RADIUS, 32, 16)),
    );
    const mat = wireframe.material as THREE.Material;
    mat.depthTest = false;
    mat.opacity = 0.25;
    mat.transparent = true;
    //root.add(wireframe);

    scene.add(this.root);

    const circles = new Map();

    this.notes = [];

    const axialTilt = new THREE.Quaternion();
    axialTilt.setFromAxisAngle(new THREE.Vector3(0, 0, 1), EARTH_TILT);
    this.root.applyQuaternion(axialTilt);

    const spinOnAxis = new THREE.Quaternion();
    const earthPoleAxis = new THREE.Vector3(0, 1, 0);
    earthPoleAxis.applyQuaternion(axialTilt);
    spinOnAxis.setFromAxisAngle(earthPoleAxis, EARTH_ROTATION * 1000);

    const animate = () => {
      controls.update();
      for (const note of this.notes) {
        note.tick(RADIUS, circles);
      }
      let i = 0;
      while (i < this.notes.length) {
        if (this.notes[i].progress() >= Math.PI * 2 * RADIUS) {
          this.root.remove(this.notes[i].circle);
          this.notes.splice(i, 1);
        } else {
          i += 1;
        }
      }

      this.root.applyQuaternion(spinOnAxis);
      renderer.render(scene, camera);
    };
    renderer.setAnimationLoop(animate);
    this.renderer = renderer;
  }

  addNote(
    lat: number,
    long: number,
    timestamp: number,
    color: THREE.ColorRepresentation,
  ): void {
    const note = new VisualizerNote(lat, long, timestamp, color);
    this.root.add(note.circle);
    this.notes.push(note);
  }

  stop() {
    this.renderer.setAnimationLoop(null);
  }
}

class VisualizerNote {
  quat: THREE.Quaternion;
  timestamp: number;
  speed: number;
  circle: THREE.LineLoop;

  constructor(
    lat: number,
    long: number,
    timestamp: number,
    color: THREE.ColorRepresentation,
  ) {
    this.quat = latLongToQuat(lat, long);
    this.timestamp = timestamp;
    this.speed = NOTE_SPEED;
    this.circle = new THREE.LineLoop(
      createCircle(2),
      new THREE.LineBasicMaterial({ color, linewidth: 4 }),
    );
    this.circle.applyQuaternion(this.quat);
  }

  progress() {
    const timeDiff = Date.now() - this.timestamp;
    return (timeDiff / 10) * NOTE_SPEED * 1000;
  }

  tick(sphereRadius: number, circles: Map<number, THREE.CircleGeometry>) {
    const radius =
      sphereRadius * Math.sin(this.progress() / (2 * sphereRadius));

    if (radius > 0) {
      let geometry = circles.get(radius);
      if (geometry == null) {
        geometry = createCircle(radius);
        circles.set(radius, geometry);
      }
      this.circle.geometry = geometry;
    }

    const sign = this.progress() >= Math.PI * sphereRadius ? 1 : -1;

    const axialDistance =
      Math.sqrt(sphereRadius ** 2 - Math.abs(radius ** 2)) * sign;
    this.circle.position.set(0, 0, 1); // (0, 0, 1) produces the same direction as the rotation
    this.circle.position.applyQuaternion(this.quat);
    this.circle.position.multiplyScalar(axialDistance);
  }
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

function latLongToQuat(lat: number, long: number): THREE.Quaternion {
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
