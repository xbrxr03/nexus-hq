import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Floor }      from './Floor'
import { Zone }       from './Zone'
import { CommonArea } from './CommonArea'
import { Avatar }     from './Avatar'
import type { Agent, RuntimeInfo, Approval } from '../types'

interface OfficeProps {
  agents: Agent[]
  runtimes: Record<string, RuntimeInfo>
  approvals: Approval[]
  onAvatarClick: (agent: Agent) => void
  selectedId: string | null
}

export function Office({ agents, runtimes, approvals, onAvatarClick, selectedId }: OfficeProps) {
  const nexusAgents    = agents.filter(a => a.zone === 'picoclaw' || a.zone === 'nexus' ? a.zone === 'nexus' : false)
  const picoAgents     = agents.filter(a => a.zone === 'picoclaw')
  const openclawAgents = agents.filter(a => a.zone === 'openclaw')

  const nexusRunning    = runtimes?.nexus?.running    ?? false
  const picoRunning     = runtimes?.picoclaw?.running ?? false
  const openclawRunning = runtimes?.openclaw?.running ?? false

  return (
    <Canvas
      camera={{ position: [0, 20, 18], fov: 45, near: 0.1, far: 200 }}
      shadows
      gl={{ antialias: true, alpha: false }}
      style={{ background: '#060810' }}
    >
      {/* Ambient */}
      <ambientLight intensity={0.7} />

      {/* Key light */}
      <directionalLight
        position={[10, 20, 10]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      {/* Zone fill lights */}
      <pointLight position={[-6, 5,  4]} intensity={1.2} color="#4f8ef7" distance={16} />
      <pointLight position={[-6, 5, -5]} intensity={1.0} color="#f59e0b" distance={14} />
      <pointLight position={[ 6, 5, -3]} intensity={1.0} color="#a78bfa" distance={16} />
      <pointLight position={[ 0, 4,  2]} intensity={0.6} color="#ffffff" distance={12} />

      {/* Scene */}
      <Floor />
      <CommonArea approvalCount={approvals.length} />

      <Zone name="nexus"    running={nexusRunning}    agentCount={nexusAgents.length} />
      <Zone name="picoclaw" running={picoRunning}     agentCount={picoAgents.length} />
      <Zone name="openclaw" running={openclawRunning} agentCount={openclawAgents.length} />

      {/* All avatars */}
      {agents.map(agent => (
        <Avatar
          key={agent.session_id ?? agent.workspace_id}
          agent={agent}
          onClick={onAvatarClick}
          selected={selectedId === (agent.session_id ?? agent.workspace_id)}
        />
      ))}

      {/* Camera controls */}
      <OrbitControls
        enableDamping
        dampingFactor={0.06}
        minDistance={8}
        maxDistance={45}
        maxPolarAngle={Math.PI / 2.1}
        target={[0, 0, 0]}
      />
    </Canvas>
  )
}