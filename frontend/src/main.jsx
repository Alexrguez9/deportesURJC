import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

import { RouterProvider } from 'react-router-dom'
import { router } from './router/index.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { InstalacionesReservasProvider } from './context/InstalacioesReservasContext.jsx';


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <InstalacionesReservasProvider>
          <RouterProvider router={router} />
        </InstalacionesReservasProvider>
    </AuthProvider>
  </React.StrictMode>
)
