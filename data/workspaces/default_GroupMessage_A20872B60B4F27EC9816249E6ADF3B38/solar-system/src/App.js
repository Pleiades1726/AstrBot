import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';

// 行星数据：名称、真实相对距离(AU)、真实相对半径、纹理URL
const planetData = [
  { name: '水星', distance: 0.39, radius: 0.38, color: '#A5A5A5', orbitSpeed: 4.15, rotSpeed: 0.004, texture: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Mercury_in_colorful_true_color.jpg/1024px-Mercury_in_colorful_true_color.jpg' },
  { name: '金星', distance: 0.72, radius: 0.95, color: '#E5C36B', orbitSpeed: 1.62, rotSpeed: 0.003, texture: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Venus_OSIRIS_1.jpg/1024px-Venus_OSIRIS_1.jpg' },
  { name: '地球', distance: 1.0, radius: 1.0, color: '#4B9CD3', orbitSpeed: 1.0, rotSpeed: 0.02, texture: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Solarsystemscope_-_orbit_-_earth.jpg/1024px-Solarsystemscope_-_orbit_-_earth.jpg' },
  { name: '火星', distance: 1.52, radius: 0.53, color: '#C16051', orbitSpeed: 0.53, rotSpeed: 0.019, texture: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/OSIRIS_Mars_truecolor.jpg/1024px-OSIRIS_Mars_truecolor.jpg' },
  { name: '木星', distance: 5.2, radius: 2.8, color: '#C6842F', orbitSpeed: 0.18, rotSpeed: 0.04, texture: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Jupiter.jpg/1024px-Jupiter.jpg' },
  { name: '土星', distance: 9.54, radius: 2.4, color: '#E8C554', orbitSpeed: 0.12, rotSpeed: 0.045, hasRing: true, texture: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Saturn.jpg/1024px-Saturn.jpg' },
  { name: '天王星', distance: 19.2, radius: 1.6, color: '#7B8BAA', orbitSpeed: 0.06, rotSpeed: 0.03, texture: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Uranus.jpg/1024px-Uranus.jpg' },
  { name: '海王星', distance: 30.1, radius: 1.5, color: '#3D58DB', orbitSpeed: 0.04, rotSpeed: 0.032, texture: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Neptune.jpg/1024px-Neptune.jpg' },
];

function Sun() {
  const meshRef = useRef();

  useFrame(() => {
    meshRef.current.rotation.y += 0.002;
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[3, 64, 64]} />
        <meshStandardMaterial
          emissive={new THREE.Color('#FFD700')}
          emissiveIntensity={2}
          color={new THREE.Color('#FF6600')}
          toneMapped={false}
        />
      </mesh>
      <pointLight intensity={2} distance={50} />
    </group>
  );
}

function OrbitLine({ distance }) {
  const radius = distance;
  const segments = 128;
  const positions = [];
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    positions.push(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
  }
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return geo;
  }, []);

  return (
    <mesh geometry={geometry}>
      <meshBasicMaterial color="#333333" transparent opacity={0.3} />
    </mesh>
  );
}

function Planet({ data }) {
  const meshRef = useRef();
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);

  // 创建纹理
  const texture = useMemo(() => {
    if (!data.texture) return null;
    const loader = new THREE.TextureLoader();
    loader.crossOrigin = 'anonymous';
    return loader.load(data.texture);
  }, [data.texture]);

  useFrame(() => {
    const time = Date.now() * 0.001;
    const angle = time * data.orbitSpeed;
    groupRef.current.position.x = Math.cos(angle) * data.distance;
    groupRef.current.position.z = Math.sin(angle) * data.distance;
    meshRef.current.rotation.y += data.rotSpeed;
  });

  return (
    <group ref={groupRef}>
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[data.radius, 64, 64]} />
        <meshStandardMaterial
          map={texture}
          color={texture ? undefined : data.color}
          emissive={hovered ? new THREE.Color(data.color).multiplyScalar(0.3) : new THREE.Color('#000000')}
          emissiveIntensity={hovered ? 0.5 : 0}
        />
      </mesh>
      {data.hasRing && (
        <mesh rotation={[0.4, 0, 0]}>
          <ringGeometry args={[data.radius * 1.4, data.radius * 2.2, 64]} />
          <meshStandardMaterial color="#C0A060" transparent opacity={0.7} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas camera={{ position: [0, 20, 30], fov: 50 }}>
        <color attach="background" args={['#050510']} />
        <ambientLight intensity={0.1} />
        <OrbitControls makeDefault />
        <Stars radius={100} depth={50} count={5000} scale={1} density={5} color={0x606060} />
        <Sun />
        {planetData.map((planet, index) => (
          <React.Fragment key={index}>
            <OrbitLine distance={planet.distance} />
            <Planet data={planet} />
          </React.Fragment>
        ))}
      </Canvas>
      <div style={{
        position: 'fixed',
        top: '10px',
        left: '10px',
        color: '#FFFFFF',
        fontFamily: 'monospace',
        fontSize: '14px',
        zIndex: 1000,
        pointerEvents: 'none',
        background: 'rgba(0,0,0,0.5)',
        padding: '10px',
        borderRadius: '5px'
      }}>
        <div>太阳系模拟</div>
        <div style={{ fontSize: '12px', marginTop: '5px', opacity: 0.7 }}>
          鼠标左键旋转 · 右键平移 · 滚轮缩放
        </div>
      </div>
    </div>
  );
}

export default App;
