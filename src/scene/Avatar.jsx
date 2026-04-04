import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Float } from '@react-three/drei'
import * as THREE from 'three'
import { avatarColor } from '../lib/colors.js'
import { getDeskPosition, COMMON_AREA } from '../lib/positions.js'

const STATE_PARAMS = {
  idle:             { emissive: 0.15, bobSpeed: 1.2,  bobAmp: 0.08, glowOpacity: 0.15, ringColor: null },
  working:          { emissive: 0.55, bobSpeed: 2.5,  bobAmp: 0.12, glowOpacity: 0.5,  ringColor: '#4f8ef7' },
  completed:        { emissive: 0.35, bobSpeed: 1.8,  bobAmp: 0.10, glowOpacity: 0.35, ringColor: '#34d399' },
  pending_approval: { emissive: 0.7,  bobSpeed: 3.5,  bobAmp: 0.15, glowOpacity: 0.8,  ringColor: '#fb923c' },
  offline:          { emissive: 0.0,  bobSpeed: 0.5,  bobAmp: 0.03, glowOpacity: 0.0,  ringColor: null },
}

export function Avatar({ agent, onClick, selected }) {
  const groupRef   = useRef()
  const headRef    = useRef()
  const ringRef    = useRef()
  const labelRef   = useRef()
  const currentPos = useRef(new THREE.Vector3())
  const color      = useMemo(() => avatarColor(agent.workspace_id), [agent.workspace_id])

  // Target position based on state
  const targetPos = useMemo(() => {
    if (agent.state === 'pending_approval') {
      const meetPos = COMMON_AREA.meetPositions[agent.deskIndex % COMMON_AREA.meetPositions.length]
      return new THREE.Vector3(meetPos[0], meetPos[1], meetPos[2])
    }
    const desk = getDeskPosition(agent.zone, agent.deskIndex)
    return new THREE.Vector3(desk[0], desk[1], desk[2])
  }, [agent.state, agent.zone, agent.deskIndex])

  // Init position
  useMemo(() => {
    currentPos.current.copy(targetPos)
  }, [])

  const params = STATE_PARAMS[agent.state] ?? STATE_PARAMS.idle

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime

    // Smooth movement to target
    currentPos.current.lerp(targetPos, Math.min(1, delta * 3))
    if (groupRef.current) {
      groupRef.current.position.copy(currentPos.current)
      // Bob
      groupRef.current.position.y = currentPos.current.y + Math.sin(t * params.bobSpeed) * params.bobAmp
    }

    // Head rotation
    if (headRef.current) {
      headRef.current.rotation.y = t * 0.6
      const mat = headRef.current.material
      mat.emissiveIntensity = params.emissive + Math.sin(t * params.bobSpeed * 1.3) * 0.08
    }

    // Orbit ring for working/pending
    if (ringRef.current) {
      ringRef.current.rotation.y = t * (agent.state === 'pending_approval' ? 2.5 : 1.5)
      ringRef.current.material.opacity = params.glowOpacity * (0.7 + Math.sin(t * 3) * 0.3)
    }
  })

  const isOffline = agent.state === 'offline'
  const shortName = agent.workspace_id.length > 10
    ? agent.workspace_id.slice(0, 10) + '…'
    : agent.workspace_id

  return (
    <group ref={groupRef} onClick={e => { e.stopPropagation(); onClick?.(agent) }}>
      {/* Selection halo */}
      {selected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.6, 0]}>
          <ringGeometry args={[0.55, 0.7, 32]} />
          <meshBasicMaterial color={color} transparent opacity={0.5} />
        </mesh>
      )}

      {/* Body — cone */}
      <mesh position={[0, 0, 0]} castShadow>
        <coneGeometry args={[0.28, 0.7, 8]} />
        <meshStandardMaterial
          color={color}
          metalness={0.2}
          roughness={0.5}
          transparent
          opacity={isOffline ? 0.25 : 0.9}
        />
      </mesh>

      {/* Head — sphere */}
      <mesh ref={headRef} position={[0, 0.62, 0]} castShadow>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial
          color={color}
          metalness={0.4}
          roughness={0.3}
          emissive={color}
          emissiveIntensity={params.emissive}
          transparent
          opacity={isOffline ? 0.25 : 0.9}
        />
      </mesh>

      {/* Ground glow disc */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.34, 0]}>
        <circleGeometry args={[0.4, 24]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={isOffline ? 0 : params.glowOpacity * 0.25}
        />
      </mesh>

      {/* Orbit ring (working / pending_approval) */}
      {(agent.state === 'working' || agent.state === 'pending_approval') && (
        <mesh ref={ringRef} rotation={[Math.PI / 3, 0, 0]}>
          <torusGeometry args={[0.45, 0.025, 8, 40]} />
          <meshBasicMaterial
            color={params.ringColor ?? color}
            transparent
            opacity={params.glowOpacity}
          />
        </mesh>
      )}

      {/* Completed spark ring */}
      {agent.state === 'completed' && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
          <ringGeometry args={[0.5, 0.55, 32]} />
          <meshBasicMaterial color="#34d399" transparent opacity={0.6} />
        </mesh>
      )}

      {/* Turn count bubble */}
      {agent.turn > 0 && !isOffline && (
        <mesh position={[0.28, 0.85, 0]}>
          <sphereGeometry args={[0.13, 8, 8]} />
          <meshBasicMaterial color={color} />
        </mesh>
      )}

      {/* Name label */}
      <Text
        position={[0, -0.55, 0]}
        fontSize={0.2}
        color={isOffline ? '#333' : color}
        anchorX="center"
        anchorY="top"
        renderOrder={1}
      >
        {shortName}
      </Text>
    </group>
  )
}
