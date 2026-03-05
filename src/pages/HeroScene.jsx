import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { useRef } from "react";

function Cube() {
  const ref = useRef();

  useFrame((state) => {
    ref.current.rotation.x += 0.004;
    ref.current.rotation.y += 0.006;
    ref.current.position.y = Math.sin(state.clock.elapsedTime) * 0.3;
  });

  return (
    <mesh ref={ref} position={[0, 0, 0]}>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color="#ff7a18" />
    </mesh>
  );
}

function Sphere() {
  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <mesh position={[-3, 2, -2]}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial color="#6366f1" />
      </mesh>
    </Float>
  );
}

function Torus() {
  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <mesh position={[3.5, -2, -2]} rotation={[1, 0, 0]}>
        <torusGeometry args={[0.8, 0.25, 32, 100]} />
        <meshStandardMaterial color="#d1d5db" />
      </mesh>
    </Float>
  );
}

function Cone() {
  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <mesh position={[3, 2.2, -1]}>
        <coneGeometry args={[0.8, 1.5, 32]} />
        <meshStandardMaterial color="#22c55e" />
      </mesh>
    </Float>
  );
}

function Icosahedron() {
  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <mesh position={[-3.5, -1.8, -2]}>
        <icosahedronGeometry args={[0.9, 0]} />
        <meshStandardMaterial color="#f43f5e" />
      </mesh>
    </Float>
  );
}

/* Main Scene */
export default function HeroScene() {
  return (
    <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
  <ambientLight intensity={0.7} />
  <directionalLight position={[3, 3, 3]} intensity={1.2} />
  <pointLight position={[-3, -3, -3]} intensity={0.6} />

  <group scale={1.6} position={[1.2, 0, 0]}>
    <Cube />
    <Sphere />
    <Torus />
    <Cone />
    <Icosahedron />
  </group>

</Canvas>
  );
}
