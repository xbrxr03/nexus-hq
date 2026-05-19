import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import { COMMON_AREA } from '../lib/positions'
import type { Mesh, MeshBasicMaterial as MeshBasicMat } from 'three'

interface CommonAreaProps {
  approvalCount?: number
}

export function CommonArea({ approvalCount = 0 }: CommonAreaProps) {
  const ringRef = useRef<Mesh>(null)
  const glowRef = useRef<Mesh>(null)
  const [cx, , cz] = COMMON_AREA.center

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (ringRef.current) {
      ringRef.current.rotation.y = t * 0.4
      const intensity = approvalCount > 0
        ? 0.4 + Math.sin(t * 3) * 0.2
        : 0.1 + Math.sin(t * 0.8) * 0.05
      ;(ringRef.current.material as THREE.MeshBasicMaterial).opacity = intensity
    }
    if (glowRef.current) {
      ;(glowRef.current.material as THREE.MeshBasicMaterial).opacity = approvalCount > 0
        ? 0.06 + Math.sin(t * 2) * 0.03
        : 0.025
    }
  })

  const ringColor = approvalCount > 0 ? '#fb923c' : '#4f8ef7'

  return (
    <group position={[cx, 0, cz]}>
      {/* Floor circle glow */}
      <mesh ref={glowRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[COMMON_AREA.radius, 48]} />
        <meshBasicMaterial
          color={ringColor}
          transparent
          opacity={0.025}
        />
      </mesh>

      {/* Rotating ring */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[COMMON_AREA.radius - 0.15, COMMON_AREA.radius, 64]} />
        <meshBasicMaterial
          color={ringColor}
          transparent
          opacity={0.1}
        />
      </mesh>

      {/* Inner ring (static) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[0.3, 0.5, 32]} />
        <meshBasicMaterial color={ringColor} transparent opacity={0.25} />
      </mesh>

      {/* Label */}
      <Text
        position={[0, 0.2, -COMMON_AREA.radius + 0.3]}
        fontSize={0.3}
        color={approvalCount > 0 ? '#fb923c' : '#2a3560'}
        anchorX="center"
      >
        {approvalCount > 0 ? `⏸  ${approvalCount} APPROVAL${approvalCount > 1 ? 'S' : ''}` : 'COMMON AREA'}
      </Text>
    </group>
  )
}