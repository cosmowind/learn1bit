import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SHAPES_COUNT, SPEED, randomRange, FOG_FAR, FOG_NEAR } from '../constants';
import { FloatingObjectProps, AppStatus } from '../types';

const GeometryTypes = ['box', 'cone', 'sphere', 'torus'];

// Individual floating component
const Floater: React.FC<{ initialPos: THREE.Vector3, status: AppStatus }> = ({ initialPos, status }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [speed] = useState(() => randomRange(0.5, 1.5));
  const [rotSpeed] = useState(() => [randomRange(-0.02, 0.02), randomRange(-0.02, 0.02), randomRange(-0.02, 0.02)]);
  const [type] = useState(() => GeometryTypes[Math.floor(Math.random() * GeometryTypes.length)]);
  
  // Initialize random position
  const pos = useRef(initialPos.clone());

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    if (status === AppStatus.PAUSED) return;

    // Move towards camera (Z axis increases)
    pos.current.z += SPEED * speed * delta;

    // Reset if it passes the camera (camera is at 0,0,0 usually, but let's say near plane)
    // We actually move objects from -Z to +Z.
    if (pos.current.z > 5) {
        pos.current.z = -FOG_FAR - randomRange(0, 10);
        pos.current.x = randomRange(-15, 15);
        pos.current.y = randomRange(-10, 10);
    }

    meshRef.current.position.copy(pos.current);
    meshRef.current.rotation.x += rotSpeed[0];
    meshRef.current.rotation.y += rotSpeed[1];
    meshRef.current.rotation.z += rotSpeed[2];
  });

  const material = useMemo(() => new THREE.MeshStandardMaterial({
      color: 0x888888, // Mid-grey helps the dither shader
      roughness: 0.2,
      metalness: 0.8
  }), []);

  return (
    <mesh ref={meshRef} position={pos.current}>
        {type === 'box' && <boxGeometry args={[1, 1, 1]} />}
        {type === 'cone' && <coneGeometry args={[0.5, 1, 4]} />}
        {type === 'sphere' && <icosahedronGeometry args={[0.7, 0]} />}
        {type === 'torus' && <torusGeometry args={[0.6, 0.2, 8, 20]} />}
        <primitive object={material} />
    </mesh>
  );
};

// The Floor Grid
const Floor = ({ status }: { status: AppStatus }) => {
    const ref = useRef<THREE.Mesh>(null);
    useFrame((state, delta) => {
        if (!ref.current || status === AppStatus.PAUSED) return;
        // Scroll texture or move mesh
        ref.current.position.z += SPEED * delta;
        if(ref.current.position.z > 10) {
            ref.current.position.z = 0;
        }
    });

    return (
        <group>
             {/* Actual ground plane is invisible logic-wise, we use gridhelper for visuals */}
            <gridHelper args={[100, 50, 0xffffff, 0x444444]} position={[0, -5, -20]} />
            <gridHelper args={[100, 50, 0xffffff, 0x444444]} position={[0, -5, -70]} />
             {/* Moving Grid to simulate speed */}
             <mesh ref={ref} position={[0, -4.9, -25]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[100, 100]} />
                <meshBasicMaterial color="black" visible={false} /> 
                {/* We use the movement of this invisible mesh to track, 
                    but actually let's just animate a GridHelper instance manually or use a shader. 
                    Simpler: Just use instanced mesh or objects moving.
                */}
            </mesh>
            {/* Let's do a simple wireframe landscape instead of just grid */}
             <mesh position={[0, -8, -20]} rotation={[-Math.PI/2, 0, 0]}>
                 <planeGeometry args={[200, 200, 40, 40]} />
                 <meshBasicMaterial color="black" wireframe wireframeLinewidth={2} />
             </mesh>
        </group>
    )
}


interface WorldProps {
  status: AppStatus;
}

export const World: React.FC<WorldProps> = ({ status }) => {
  // Generate initial positions
  const objects = useMemo(() => {
    return new Array(SHAPES_COUNT).fill(null).map(() => {
      return new THREE.Vector3(
        randomRange(-15, 15),
        randomRange(-8, 8),
        randomRange(-FOG_FAR, -5)
      );
    });
  }, []);

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={2} castShadow />
      <pointLight position={[-10, -10, -5]} intensity={1} color="white" />
      
      {/* Fog is crucial for the fade-in effect from the darkness */}
      <fog attach="fog" args={['#000000', FOG_NEAR, FOG_FAR]} />

      <Floor status={status} />
      
      {objects.map((pos, i) => (
        <Floater key={i} initialPos={pos} status={status} />
      ))}
    </>
  );
};