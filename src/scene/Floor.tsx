import { Grid } from '@react-three/drei'

export function Floor() {
  return (
    <>
      {/* Dark glass base */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial
          color="#080c18"
          metalness={0.6}
          roughness={0.3}
          transparent
          opacity={0.95}
        />
      </mesh>

      {/* Grid overlay */}
      <Grid
        position={[0, 0, 0]}
        args={[60, 60]}
        cellSize={1}
        cellThickness={0.3}
        cellColor="#1a2340"
        sectionSize={5}
        sectionThickness={0.6}
        sectionColor="#1e2d50"
        fadeDistance={45}
        fadeStrength={1.5}
        infiniteGrid={false}
      />
    </>
  )
}