import { initializeApp } from 'firebase/app'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
const messaging = getMessaging(app)

// Permission maango aur FCM token lo
export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      console.log('Notification permission denied')
      return null
    }

    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
    })

    if (token) {
      console.log('FCM Token:', token)
      return token
    }
    return null
  } catch (error) {
    console.error('FCM token error:', error)
    return null
  }
}

// Foreground messages handle karo (app open ho tab)
export const onForegroundMessage = (callback) => {
  return onMessage(messaging, (payload) => {
    callback(payload)
  })
}

export { messaging }