/**
 * keepAlive.js
 * Ping le backend toutes les 10 min pour éviter le cold start Render
 */
const API = 'https://backend-pued.onrender.com/health'
const INTERVAL = 10 * 60 * 1000 // 10 min

export function startKeepAlive() {
  const ping = () => {
    fetch(API, { method: 'GET' })
      .then(() => console.log('🟢 Backend alive'))
      .catch(() => console.log('🔴 Backend sleeping'))
  }

  ping() // ping immédiat au démarrage
  return setInterval(ping, INTERVAL)
}
