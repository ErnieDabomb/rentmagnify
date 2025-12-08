// Lazy Firebase init to keep builds working without installing firebase by default.
// Enable by setting VITE_ENABLE_FIRESTORE=true and providing Firebase env vars.

const enableFlag = String(import.meta.env.VITE_ENABLE_FIRESTORE || '').toLowerCase()
export const FIRESTORE_ENABLED = enableFlag === 'true'
// Debug aid: remove after verifying env values
console.log('VITE_ENABLE_FIRESTORE', import.meta.env.VITE_ENABLE_FIRESTORE)
const EMULATOR_HOST = import.meta.env.VITE_FIRESTORE_EMULATOR_HOST

let dbInstance = null
let helperModule = null
let initPromise = null

export async function getDb() {
  if (!FIRESTORE_ENABLED) return null
  if (dbInstance) return dbInstance
  if (initPromise) return initPromise

  initPromise = (async () => {
    try {
      const appModule = ['firebase', 'app'].join('/')
      const firestoreModule = ['firebase', 'firestore'].join('/')
      const firebaseApp = await import(/* @vite-ignore */ appModule)
      helperModule = await import(/* @vite-ignore */ firestoreModule)
      const firebaseConfig = {
        apiKey: import.meta.env.VITE_FB_API_KEY,
        authDomain: import.meta.env.VITE_FB_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FB_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FB_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FB_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FB_APP_ID,
      }
      const app = firebaseApp.initializeApp(firebaseConfig)
      dbInstance = helperModule.getFirestore(app)
      if (EMULATOR_HOST) {
        const [host, port] = EMULATOR_HOST.split(':')
        if (host && port) {
          helperModule.connectFirestoreEmulator(dbInstance, host, Number(port))
        }
      }
      return dbInstance
    } catch (e) {
      console.warn('Firebase not available; using local store instead.', e)
      dbInstance = null
      return null
    }
  })()

  return initPromise
}

export function getFirestoreHelpers() {
  return helperModule
}

// Promise-based handle to the Firestore instance for consumers that prefer direct awaits.
export const dbPromise = getDb()
