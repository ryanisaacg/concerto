import { useEffect, useRef, useState } from "preact/hooks";
import * as THREE from "three";
import { Material } from "three";
import { WebGLShader } from "three/src/renderers/webgl/WebGLShader.js";

export function Visualizer() {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const sceneRotation = useRef(new THREE.Vector3());
  const lineRotation = useRef(new THREE.Vector3());

  useEffect(() => {
    console.log("e");
    if (canvas == null) {
      return;
    }
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      canvas.width / canvas.height,
      0.1,
      1000,
    );
    const renderer = new THREE.WebGLRenderer({ canvas });
    renderer.setSize(canvas.width, canvas.height);

    const root = new THREE.Group();

    /*const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);*/

    camera.position.z = 5;

    const geometry = new THREE.SphereGeometry(2, 32, 16);
    const material = new THREE.MeshBasicMaterial({ color: 0x0000ff });
    material.opacity = 0.75;
    material.transparent = true;
    const sphere = new THREE.Mesh(geometry, material);

    root.add(sphere);

    const wireframeGeometry = new THREE.WireframeGeometry(geometry);

    const wireframe = new THREE.LineSegments(wireframeGeometry);
    const mat = wireframe.material as Material;
    mat.depthTest = false;
    mat.opacity = 0.25;
    mat.transparent = true;
    root.add(wireframe);

    const circle = new THREE.LineLoop(
      createCircle(2),
      new THREE.LineBasicMaterial({ color: "red" }),
    );
    //circle.rotation.y = Math.PI / 4;
    //circle.rotation.x = Math.PI / 2;

    const lat = 40;
    const long = -73;

    const newJerseyVec = latLongToVec(lat, long).normalize();
    const newJerseyQuat = latLongToQuat(lat, long);
    circle.applyQuaternion(newJerseyQuat);
    //circle.rotation.y = (80 * Math.PI) / 180;
    //circle.rotation.z = (-74 * Math.PI) / 180;
    root.add(circle);

    //root.add(lineSegment(new THREE.Vector3(), newJerseyVec, 0x00ff00));

    let circleSpeed = 0.01;
    let circleProgress = 2;

    scene.add(root);

    function animate() {
      circle.position.set(0, 0, 1);
      circle.position.applyQuaternion(newJerseyQuat);
      circle.position.multiplyScalar(circleProgress);

      circleProgress += circleSpeed;
      if (circleProgress >= 2) {
        circleSpeed = -0.01;
      } else if (circleProgress <= -2) {
        circleSpeed = 0.01;
      }
      if (Math.abs(circleProgress) !== 2) {
        const chordLength = Math.sqrt(4 - Math.abs(circleProgress ** 2));
        circle.geometry = createCircle(chordLength);
      }

      root.rotation.x = (sceneRotation.current.x * Math.PI) / 180;
      root.rotation.y = (sceneRotation.current.y * Math.PI) / 180;
      root.rotation.z = (sceneRotation.current.z * Math.PI) / 180;
      /*{
        const chordLength = Math.sqrt(4 - Math.abs(circle.position.y ** 2));
        circle.geometry = createCircle(chordLength);
        }*/
      //wireframe.rotation.z = 0.41;
      renderer.render(scene, camera);
    }
    renderer.setAnimationLoop(animate);
  }, [canvas]);

  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      <canvas ref={setCanvas} width={800} height={600} />
      <div>
        <input
          type="number"
          value={sceneRotation.current.x}
          onChange={(e) =>
            (sceneRotation.current.x = Number(
              (e.target as HTMLInputElement).value,
            ))
          }
        />
        <input
          type="number"
          value={sceneRotation.current.y}
          onChange={(e) =>
            (sceneRotation.current.y = Number(
              (e.target as HTMLInputElement).value,
            ))
          }
        />
        <input
          type="number"
          value={sceneRotation.current.z}
          onChange={(e) =>
            (sceneRotation.current.z = Number(
              (e.target as HTMLInputElement).value,
            ))
          }
        />
      </div>
      <div>
        <input
          type="number"
          value={lineRotation.current.x}
          onChange={(e) =>
            (lineRotation.current.x = Number(
              (e.target as HTMLInputElement).value,
            ))
          }
        />
        <input
          type="number"
          value={lineRotation.current.y}
          onChange={(e) =>
            (lineRotation.current.y = Number(
              (e.target as HTMLInputElement).value,
            ))
          }
        />
        <input
          type="number"
          value={lineRotation.current.z}
          onChange={(e) =>
            (lineRotation.current.z = Number(
              (e.target as HTMLInputElement).value,
            ))
          }
        />
      </div>
    </div>
  );
}

function createCircle(radius: number) {
  const circleGeometry = new THREE.CircleGeometry(radius, 32);

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

export function latLongToVec(lat: number, long: number): THREE.Vector3 {
  // Adapted from https://stackoverflow.com/questions/10473852/convert-latitude-and-longitude-to-point-in-3d-space
  /*
   *     f  = 0                              # flattening
    ls = atan((1 - f)**2 * tan(lat))    # lambda

    x = rad * cos(ls) * cos(lon) + alt * cos(lat) * cos(lon)
    y = rad * cos(ls) * sin(lon) + alt * cos(lat) * sin(lon)
    z = rad * sin(ls) + alt * sin(lat)

    return c4d.Vector(x, y, z)
   */
  const latRadians = (lat * 2 * Math.PI) / 180;
  const longRadians = (long * Math.PI) / 180;
  const x =
    Math.cos(longRadians) + Math.cos(latRadians) * Math.cos(longRadians);
  const z =
    Math.sin(longRadians) + Math.cos(latRadians) * Math.sin(longRadians);
  const y = Math.sin(latRadians);

  return new THREE.Vector3(x, y, z);
}

export function latLongToQuat(lat: number, long: number): THREE.Quaternion {
  const radLat = (lat * Math.PI) / 180;
  const q1 = new THREE.Quaternion();
  q1.setFromAxisAngle(new THREE.Vector3(0, 0, 1), radLat);

  const radLong = (long * Math.PI) / 180;
  const q2 = new THREE.Quaternion();
  q2.setFromAxisAngle(new THREE.Vector3(0, 1, 0), radLong);

  return q1.multiply(q2);
}

const ZERO = new THREE.Vector3();

function lineSegment(
  start: THREE.Vector3,
  end: THREE.Vector3,
  color: THREE.ColorRepresentation,
): THREE.Line {
  const material = new THREE.LineBasicMaterial({ color });

  const points = [];
  points.push(start);
  points.push(end);

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  return new THREE.Line(geometry, material);
}
