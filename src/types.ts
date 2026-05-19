// ── Agent Dashboard Types ──────────────────────────────────────────────────

export type AgentStatus = 'idle' | 'working' | 'completed' | 'pending_approval' | 'offline' | 'error'

export interface Agent {
  workspace_id: string
  session_id?: string
  turn: number
  model?: string
  zone: string
  deskIndex: number
  state: AgentStatus
}

export interface RuntimeInfo {
  installed: boolean
  running: boolean
  model?: string
}

export interface Runtimes {
  nexus?: RuntimeInfo
  picoclaw?: RuntimeInfo
  openclaw?: RuntimeInfo
}

export interface Approval {
  request_id?: string
  tool?: string
  target?: string
  task_id?: string
  workspace_id?: string
}

export interface DashboardEvent {
  type: string
  data?: Record<string, unknown>
  timestamp?: number
}

// ── Settings ──────────────────────────────────────────────────────────────

export interface DashboardSettings {
  refreshRate: number   // milliseconds between agent data refreshes
  theme: 'dark' | 'light'
  connectionUrl: string
}

export const DEFAULT_SETTINGS: DashboardSettings = {
  refreshRate: 5000,
  theme: 'dark',
  connectionUrl: 'http://192.168.0.18:7070',
}

// ── Action Log ─────────────────────────────────────────────────────────────

export type ActionStatus = 'success' | 'fail' | 'pending'

export interface ActionLogEntry {
  id: string
  timestamp: number
  agent: string
  action: string
  type: 'audit' | 'task' | 'approval' | 'system'
  status: ActionStatus
  detail?: string
}