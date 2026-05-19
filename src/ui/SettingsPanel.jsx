import { useState, useEffect } from 'react'

const STORAGE_KEY = 'nexus-hq-settings'

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return {
    refreshRate: 5000,
    theme: 'dark',
    connectionUrl: 'http://192.168.0.18:7070',
  }
}

function saveSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {}
}

const S = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 200,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  panel: {
    width: 380, maxHeight: '80vh',
    background: 'rgba(6,8,16,0.95)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 16, overflow: 'hidden',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '16px 20px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  body: {
    padding: '20px',
    display: 'flex', flexDirection: 'column', gap: 20,
  },
  label: {
    fontSize: 11, fontWeight: 600, letterSpacing: '0.06em',
    textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: 8,
  },
  input: {
    width: '100%', padding: '10px 12px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8, color: '#f5f5f7',
    fontSize: 13, outline: 'none', fontFamily: 'inherit',
    boxSizing: 'border-box',
  },
  select: {
    width: '100%', padding: '10px 12px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8, color: '#f5f5f7',
    fontSize: 13, outline: 'none', fontFamily: 'inherit',
    appearance: 'none',
    boxSizing: 'border-box',
  },
  toggleRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  toggle: (active) => ({
    width: 40, height: 22, borderRadius: 11,
    background: active ? '#34d399' : 'rgba(255,255,255,0.15)',
    position: 'relative', cursor: 'pointer', transition: 'background 0.2s',
    border: 'none', padding: 0,
  }),
  toggleKnob: (active) => ({
    width: 16, height: 16, borderRadius: '50%',
    background: '#fff',
    position: 'absolute', top: 3,
    left: active ? 21 : 3,
    transition: 'left 0.2s',
  }),
  btnClose: {
    background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)',
    fontSize: 20, cursor: 'pointer', lineHeight: 1, padding: 4,
  },
  btnReset: {
    width: '100%', padding: '10px',
    background: 'rgba(248,113,113,0.1)',
    border: '1px solid rgba(248,113,113,0.2)',
    borderRadius: 8, color: '#f87171',
    fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
  },
}

export function SettingsPanel({ open, onClose, onSettingsChange }) {
  const [settings, setSettings] = useState(loadSettings)

  useEffect(() => {
    saveSettings(settings)
    if (onSettingsChange) onSettingsChange(settings)
  }, [settings])

  if (!open) return null

  function update(key, value) {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  function handleReset() {
    const defaults = { refreshRate: 5000, theme: 'dark', connectionUrl: 'http://192.168.0.18:7070' }
    setSettings(defaults)
  }

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.panel} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={S.header}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>Settings</span>
          <button style={S.btnClose} onClick={onClose}>×</button>
        </div>

        {/* Body */}
        <div style={S.body}>
          {/* Connection URL */}
          <div>
            <div style={S.label}>Connection Endpoint</div>
            <input
              style={S.input}
              value={settings.connectionUrl}
              onChange={e => update('connectionUrl', e.target.value)}
              placeholder="http://192.168.x.x:7070"
              spellCheck={false}
            />
          </div>

          {/* Refresh Rate */}
          <div>
            <div style={S.label}>Agent Refresh Rate</div>
            <select
              style={S.select}
              value={settings.refreshRate}
              onChange={e => update('refreshRate', Number(e.target.value))}
            >
              <option value={2000}>2 seconds</option>
              <option value={5000}>5 seconds</option>
              <option value={10000}>10 seconds</option>
              <option value={30000}>30 seconds</option>
            </select>
          </div>

          {/* Theme toggle */}
          <div>
            <div style={S.label}>Visual Theme</div>
            <div style={S.toggleRow}>
              <span style={{ fontSize: 13, color: settings.theme === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.4)' }}>
                🌙 Dark
              </span>
              <button style={S.toggle(settings.theme === 'dark')} onClick={() => update('theme', settings.theme === 'dark' ? 'light' : 'dark')}>
                <div style={S.toggleKnob(settings.theme === 'dark')} />
              </button>
            </div>
            <div style={{ ...S.toggleRow, marginTop: 8 }}>
              <span style={{ fontSize: 13, color: settings.theme === 'light' ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.4)' }}>
                ☀️ Light
              </span>
              <button style={S.toggle(settings.theme === 'light')} onClick={() => update('theme', settings.theme === 'light' ? 'dark' : 'light')}>
                <div style={S.toggleKnob(settings.theme === 'light')} />
              </button>
            </div>
          </div>

          {/* Reset */}
          <button style={S.btnReset} onClick={handleReset}>
            Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  )
}