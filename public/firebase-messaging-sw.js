importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js')
 
firebase.initializeApp({
  apiKey: "AIzaSyAvF8A9cTYpe9O90ebSKzWK73V4zeWSTsY",
  authDomain: "ritva-64669.firebaseapp.com",
  projectId: "ritva-64669",
  storageBucket: "ritva-64669.firebasestorage.app",
  messagingSenderId: "290581287045",
  appId: "1:290581287045:web:d43190ec534f69ae0f59ec", 
})
 
const messaging = firebase.messaging()
 
// Background message handler
messaging.onBackgroundMessage((payload) => {
  console.log('Background message received:', payload)
 
  const { title, body, icon } = payload.notification || {}
 
  self.registration.showNotification(title || 'Ritva 🌸', {
    body: body || 'Aapke liye ek reminder hai',
    icon: icon || '/hero.png',
    badge: '/hero.png',
    vibrate: [200, 100, 200],
    data: payload.data,
    actions: [
      { action: 'open', title: 'App Kholein' },
      { action: 'dismiss', title: 'Theek Hai' }
    ]
  })
})
 
// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})