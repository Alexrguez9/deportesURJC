import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

import { RouterProvider } from 'react-router-dom'
import { router } from './router/index.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { InstalacionesReservasProvider } from './context/InstalacioesReservasContext.jsx';
import { TeamsAndResultsProvider } from './context/TeamsAndResultsContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <InstalacionesReservasProvider>
        <TeamsAndResultsProvider>
          <RouterProvider router={router} />
        </TeamsAndResultsProvider>
      </InstalacionesReservasProvider>
    </AuthProvider>
  </React.StrictMode>
)
