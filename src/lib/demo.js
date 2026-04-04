// Demo mode — fake agents that cycle through states automatically

const DEMO_AGENTS = [
  { workspace_id: 'nexus_default', session_id: 'sess_demo_001', turn: 3, model: 'qwen2.5:7b',   zone: 'nexus',    deskIndex: 0 },
  { workspace_id: 'research',      session_id: 'sess_demo_002', turn: 7, model: 'qwen2.5:7b',   zone: 'nexus',    deskIndex: 1 },
  { workspace_id: 'code_review',   session_id: 'sess_demo_003', turn: 1, model: 'qwen2.5:coder', zone: 'nexus',   deskIndex: 2 },
]

const DEMO_PEERS = [
  { name: 'MacBook-Pro',   url: 'http://192.168.0.21:7070', host: '192.168.0.21' },
  { name: 'RaspberryPi5',  url: 'http://192.168.0.25:7070', host: '192.168.0.25' },
]

const DEMO_EVENTS = [
  { type: 'audit_event',  data: { tool: 'fs.read',          decision: 'approved', target: '~/docs/report.md' }},
  { type: 'audit_event',  data: { tool: 'web.search',       decision: 'approved', target: 'latest AI papers 2026' }},
  { type: 'audit_event',  data: { tool: 'shell.restricted', decision: 'approved', target: 'git status' }},
  { type: 'task_update',  data: { status: 'running',        intent: 'summarize meeting notes from last week' }},
  { type: 'task_update',  data: { status: 'completed',      intent: 'find all TODOs in the codebase' }},
  { type: 'audit_event',  data: { tool: 'memory.write',     decision: 'approved', target: 'user prefers dark themes' }},
  { type: 'task_update',  data: { status: 'running',        intent: 'generate a disk usage report' }},
  { type: 'audit_event',  data: { tool: 'fs.write',         decision: 'approved', target: '~/clawos/workspace/report.md' }},
]

const DEMO_RUNTIMES = {
  nexus:    { installed: true,  running: true,  model: 'qwen2.5:7b' },
  picoclaw: { installed: true,  running: true,  model: 'local' },
  openclaw: { installed: true,  running: true,  model: 'kimi-k2.5' },
}

// Agent state cycle: idle → working → completed → idle
// Each phase duration in ms
const PHASE_DURATIONS = { idle: 4000, working: 3000, completed: 1500 }

export class DemoEngine {
  constructor(onUpdate) {
    this.onUpdate   = onUpdate
    this._agents    = DEMO_AGENTS.map(a => ({ ...a, state: 'idle', _phase: 0 }))
    this._eventIdx  = 0
    this._timers    = []
    this._running   = false
  }

  start() {
    if (this._running) return
    this._running = true
    this._agents.forEach((_, i) => this._cycleAgent(i, Math.random() * 2000))
    this._scheduleEvent()
    this._scheduleApproval()
  }

  stop() {
    this._running = false
    this._timers.forEach(t => clearTimeout(t))
    this._timers = []
  }

  _schedule(fn, delay) {
    const t = setTimeout(fn, delay)
    this._timers.push(t)
    return t
  }

  _cycleAgent(i, delay = 0) {
    if (!this._running) return
    this._schedule(() => {
      if (!this._running) return
      const agent = this._agents[i]
      const states = ['idle', 'working', 'completed']
      const next = states[(states.indexOf(agent.state) + 1) % states.length]
      agent.state = next
      if (next === 'working') agent.turn++
      this._notify()
      this._cycleAgent(i, PHASE_DURATIONS[next] + Math.random() * 1000)
    }, delay)
  }

  _scheduleEvent() {
    if (!this._running) return
    this._schedule(() => {
      this._eventIdx = (this._eventIdx + 1) % DEMO_EVENTS.length
      this.onUpdate({ type: 'demo_event', event: DEMO_EVENTS[this._eventIdx] })
      this._scheduleEvent()
    }, 2500 + Math.random() * 1500)
  }

  _scheduleApproval() {
    if (!this._running) return
    this._schedule(() => {
      // Move random nexus agent to common area for approval
      const nexusAgents = this._agents.filter(a => a.zone === 'nexus')
      if (nexusAgents.length > 0) {
        const a = nexusAgents[Math.floor(Math.random() * nexusAgents.length)]
        const prev = a.state
        a.state = 'pending_approval'
        this._notify()
        this._schedule(() => {
          a.state = prev
          this._notify()
        }, 5000)
      }
      this._scheduleApproval()
    }, 12000 + Math.random() * 8000)
  }

  _notify() {
    this.onUpdate({
      type:     'state',
      agents:   this._agents.map(a => ({ ...a })),
      runtimes: DEMO_RUNTIMES,
      peers:    DEMO_PEERS,
      approvals: this._agents.filter(a => a.state === 'pending_approval').map(a => ({
        request_id: `req_${a.workspace_id}`,
        tool:       'shell.restricted',
        target:     `df -h /home/${a.workspace_id}`,
        task_id:    `task_demo`,
      })),
    })
  }

  get initialState() {
    return {
      agents:    this._agents.map(a => ({ ...a })),
      runtimes:  DEMO_RUNTIMES,
      peers:     DEMO_PEERS,
      approvals: [],
      events:    DEMO_EVENTS.slice(0, 5),
    }
  }
}
