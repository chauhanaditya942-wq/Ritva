import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import OneSignal from 'react-onesignal'

OneSignal.init({
  appId: "3e5f56ff-a507-4d66-9a8d-384b74f41409",  // ✅ direct ID
  notifyButton: { enable: false },
  allowLocalhostAsSecureOrigin: true,
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)