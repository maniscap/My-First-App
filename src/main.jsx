import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import 'leaflet/dist/leaflet.css';
import { ThemeProvider } from './pages/🎫BottomNavigationCard/ThemeSettings.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
)

// --- PRO MOVE: SERVICE WORKER REGISTRATION ---
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((reg) => console.log('FARMCAP: Smart Caching Engine Registered!', reg.scope))
      .catch((err) => console.error('FARMCAP: Service Worker Setup Failed:', err));
  });
}