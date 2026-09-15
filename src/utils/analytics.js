const KEY = 'rm_events_v1'

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]')
  } catch {
    return []
  }
}

function save(events) {
  try {
    localStorage.setItem(KEY, JSON.stringify(events.slice(-200)))
  } catch {
    // ignore
  }
}

export function logEvent(name, data = {}) {
  const events = load()
  const evt = { name, data, ts: Date.now() }
  events.push(evt)
  save(events)
  if (import.meta.env.DEV) {
    console.info('[analytics]', evt)
  }
}
