// Firebase setup. The SDK is imported dynamically so it is only downloaded
// (and only adds to the bundle the browser fetches) when Firestore is both
// enabled via env var and actually requested by a caller.
const enableFlag = String(import.meta.env.VITE_ENABLE_FIRESTORE || '').toLowerCase()
export const FIRESTORE_ENABLED = enableFlag === 'true'
const EMULATOR_HOST = import.meta.env.VITE_FIRESTORE_EMULATOR_HOST

let appInstance = null
let appLoadPromise = null
let dbInstance = null
let dbLoadPromise = null
let firestoreModule = null

export function getFirestoreHelpers() {
  return firestoreModule
}

// Lazily creates the shared Firebase App instance (once). Both Firestore and
// Firebase Auth need this to exist before they can be used, regardless of
// which one a given page happens to touch first.
export async function getFirebaseApp() {
  if (appInstance) return appInstance
  if (appLoadPromise) return appLoadPromise

  appLoadPromise = (async () => {
    const { initializeApp } = await import('firebase/app')
    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FB_API_KEY,
      authDomain: import.meta.env.VITE_FB_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FB_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FB_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FB_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FB_APP_ID,
    }
    appInstance = initializeApp(firebaseConfig)
    return appInstance
  })()

  return appLoadPromise
}

export async function getDb() {
  if (!FIRESTORE_ENABLED) return null
  if (dbInstance) return dbInstance
  if (dbLoadPromise) return dbLoadPromise

  dbLoadPromise = (async () => {
    const [app, firestore] = await Promise.all([
      getFirebaseApp(),
      import('firebase/firestore'),
    ])
    firestoreModule = firestore
    dbInstance = firestoreModule.getFirestore(app)

    if (EMULATOR_HOST) {
      const [host, port] = EMULATOR_HOST.split(':')
      if (host && port) {
        firestoreModule.connectFirestoreEmulator(dbInstance, host, Number(port))
      }
    }

    return dbInstance
  })()

  return dbLoadPromise
}
