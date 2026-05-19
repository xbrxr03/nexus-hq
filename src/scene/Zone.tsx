import { Text } from '@react-three/drei'
import { RT } from '../lib/colors'
import { ZONES } from '../lib/positions'

interface ZonePlatformProps {
  cx: number
  cz: number
  w: number
  d: number
  color: string
  running: boolean
}

function ZonePlatform({ cx, cz, w, d, color, running }: ZonePlatformProps) {
  const h    = 0.08
  const bump = running ? 0.02 : 0

  return (
    <group position={[cx, -0.01 + bump, cz]}>
      {/* Main platform */}
      <mesh receiveShadow castShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={running ? 0.18 : 0.10}
          metalness={0.2}
          roughness={0.5}
          emissive={color}
          emissiveIntensity={running ? 0.08 : 0.02}
        />
      </mesh>

      {/* Top edge glow line */}
      <mesh position={[0, h / 2 + 0.005, 0]}>
        <boxGeometry args={[w, 0.012, d]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={running ? 0.85 : 0.3}
        />
      </mesh>

      {/* Corner posts */}
      {[
        [-w/2 + 0.15,  d/2 - 0.15],
        [ w/2 - 0.15,  d/2 - 0.15],
        [-w/2 + 0.15, -d/2 + 0.15],
        [ w/2 - 0.15, -d/2 + 0.15],
      ].map(([px, pz], i) => (
        <mesh key={i} position={[px, h / 2 + 0.3, pz]}>
          <cylinderGeometry args={[0.04, 0.04, 0.6, 6]} />
          <meshStandardMaterial
            color={color}
            transparent
            opacity={running ? 0.5 : 0.15}
            emissive={color}
            emissiveIntensity={running ? 0.3 : 0}
          />
        </mesh>
      ))}
    </group>
  )
}

interface ZoneProps {
  name: string
  running?: boolean
  agentCount?: number
}

export function Zone({ name, running = false, agentCount = 0 }: ZoneProps) {
  const rt   = RT[name]
  const zone = ZONES[name]
  if (!rt || !zone) return null
  const [cx, , cz] = zone.center
  const [w, d]     = zone.size
  const color      = rt.primary

  return (
    <group>
      <ZonePlatform cx={cx} cz={cz} w={w} d={d} color={color} running={running} />

      {/* Zone label */}
      <Text
        position={[cx, 1.4, cz - d / 2 + 0.5]}
        fontSize={0.45}
        color={running ? color : '#3a4060'}
        anchorX="center"
        anchorY="bottom"
        font={undefined}
      >
        {rt.icon}  {rt.label}
      </Text>

      {/* Agent count badge */}
      {agentCount > 0 && (
        <Text
          position={[cx + 1.2, 1.4, cz - d / 2 + 0.5]}
          fontSize={0.28}
          color={color}
          anchorX="center"
          anchorY="bottom"
        >
          {agentCount}
        </Text>
      )}

      {/* Status dot */}
      <mesh position={[cx, 0.15, cz - d / 2 + 0.4]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshBasicMaterial
          color={running ? color : '#222840'}
          transparent
          opacity={running ? 0.9 : 0.4}
        />
      </mesh>
    </group>
  )
}