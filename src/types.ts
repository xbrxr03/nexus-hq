export type AgentState = 'idle' | 'working' | 'completed' | 'pending_approval' | 'offline'

export interface Agent {
  workspace_id: string
  session_id: string
  turn: number
  model: string
  zone: string
  deskIndex: number
  state: AgentState
}

export interface RuntimeInfo {
  installed?: boolean
  running?: boolean
  model?: string
}

export interface PeerInfo {
  name: string
  url: string
  host: string
}

export interface Approval {
  request_id?: string
  tool?: string
  target?: string
  task_id?: string
  workspace_id?: string
  id?: string
  decision?: string
}

export interface FeedEvent {
  type: string
  data?: Record<string, string>
  status?: string
  intent?: string
}