import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { NotificacionesProvider } from "./context/NotificacionesContext"


import { PagosProvider } from "./context/PagosContext"


ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <PagosProvider>
      <NotificacionesProvider>
        <App />
      </NotificacionesProvider>
    </PagosProvider>
  </BrowserRouter>

)
