import { useRef, useEffect } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three-stdlib";

export default function RotatingRobot() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 500;
    const height = mount.clientHeight || 500;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 1, 5);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    mount.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    // Load Robot
    const loader = new GLTFLoader();
    let robotAdded = false;
    let robot;
    loader.load(
      "/Robot.glb",
      (gltf) => {
        robot = gltf.scene;
        robot.scale.set(0.8, 0.8, 0.8);
        robot.position.x = 0.5;
        robot.position.y = -0.5;

        if (!robotAdded) {
          scene.add(robot);
          robotAdded = true; // ensures only one robot added
        }
      },
      undefined,
      (error) => console.error("Error loading Robot:", error)
    );

    // Animate
    const animate = () => {
      requestAnimationFrame(animate);
      if (robot) robot.rotation.y += 0.01;
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup on unmount
    return () => {
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} style={{ width: "100%", height: "500px" }}></div>;
}