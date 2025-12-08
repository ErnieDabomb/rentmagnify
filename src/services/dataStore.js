import { getDb, getFirestoreHelpers, FIRESTORE_ENABLED } from './firebaseConfig'

// Hybrid data store: localStorage by default (no billing), Firestore when explicitly enabled and available.
// Set VITE_ENABLE_FIRESTORE=true and provide Firebase env vars to opt in. Defaults to local-only.

const KEY = 'rm_submissions_v1'
const DEVICE_KEY = 'rm_device_id'

function loadAll() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]')
  } catch {
    return []
  }
}

function saveAll(list) {
  localStorage.setItem(KEY, JSON.stringify(list))
}

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export function getDeviceId() {
  let id = localStorage.getItem(DEVICE_KEY)
  if (!id) {
    id = uid()
    localStorage.setItem(DEVICE_KEY, id)
  }
  return id
}

async function addSubmissionLocal(data) {
  const all = loadAll()
  const item = {
    id: uid(),
    status: 'pending',
    createdAt: Date.now(),
    deviceId: getDeviceId(),
    data,
  }
  all.push(item)
  saveAll(all)
  return item
}

async function listSubmissionsLocal(status) {
  const all = loadAll()
  return status ? all.filter((s) => s.status === status) : all
}

async function updateStatusLocal(id, nextStatus) {
  const all = loadAll()
  const idx = all.findIndex((s) => s.id === id)
  if (idx >= 0) {
    all[idx].status = nextStatus
    all[idx].moderatedAt = Date.now()
    saveAll(all)
    return true
  }
  return false
}

async function lastSubmissionAtForDeviceLocal(deviceId) {
  const all = loadAll()
  const times = all.filter((s) => s.deviceId === deviceId).map((s) => s.createdAt)
  return times.length ? Math.max(...times) : 0
}

async function clearAllSubmissionsLocal() {
  localStorage.removeItem(KEY)
}

async function addSubmissionRemote(data) {
  const db = await getDb()
  const helpers = getFirestoreHelpers()
  if (!db || !helpers) return addSubmissionLocal(data)
  const payload = {
    status: 'pending',
    createdAt: Date.now(),
    deviceId: getDeviceId(),
    data,
  }
  await helpers.addDoc(helpers.collection(db, 'submissions'), payload)
  return payload
}

async function listSubmissionsRemote(status) {
  const db = await getDb()
  const helpers = getFirestoreHelpers()
  if (!db || !helpers) return listSubmissionsLocal(status)
  const base = helpers.collection(db, 'submissions')
  const q = status ? helpers.query(base, helpers.where('status', '==', status)) : base
  const snap = await helpers.getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

async function updateStatusRemote(id, nextStatus) {
  const db = await getDb()
  const helpers = getFirestoreHelpers()
  if (!db || !helpers) return updateStatusLocal(id, nextStatus)
  await helpers.updateDoc(helpers.doc(db, 'submissions', id), { status: nextStatus, moderatedAt: Date.now() })
  return true
}

async function lastSubmissionAtForDeviceRemote(deviceId) {
  const db = await getDb()
  const helpers = getFirestoreHelpers()
  if (!db || !helpers) return lastSubmissionAtForDeviceLocal(deviceId)
  const q = helpers.query(helpers.collection(db, 'submissions'), helpers.where('deviceId', '==', deviceId))
  const snap = await helpers.getDocs(q)
  const times = snap.docs.map((d) => d.data().createdAt).filter(Boolean)
  return times.length ? Math.max(...times) : 0
}

export async function addSubmission(data) {
  if (!FIRESTORE_ENABLED) return addSubmissionLocal(data)
  return addSubmissionRemote(data)
}

export async function listSubmissions(status) {
  if (!FIRESTORE_ENABLED) return listSubmissionsLocal(status)
  return listSubmissionsRemote(status)
}

export async function updateStatus(id, nextStatus) {
  if (!FIRESTORE_ENABLED) return updateStatusLocal(id, nextStatus)
  return updateStatusRemote(id, nextStatus)
}

export async function listApproved() {
  const items = await listSubmissions('approved')
  return items.map((s) => s.data)
}

export async function lastSubmissionAtForDevice(deviceId) {
  if (!FIRESTORE_ENABLED) return lastSubmissionAtForDeviceLocal(deviceId)
  return lastSubmissionAtForDeviceRemote(deviceId)
}

export async function clearAllSubmissions() {
  if (!FIRESTORE_ENABLED) return clearAllSubmissionsLocal()
  // Avoid deleting remote data by default; noop when remote (protect prod/emulator data).
  return false
}
