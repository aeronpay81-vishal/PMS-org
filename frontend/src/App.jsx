import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Home from './pages/Home'
import Admin from './pages/Admin'
import { authAPI } from './api/admin.js'
import Feature from './pages/Feature'
import HowItWork from './pages/HowItWork'
import Pricing from './pages/Pricing'
import Faq from './pages/Faq'
function App() {
  const [auth, setAuth] = useState(() => {
    const storedUser = authAPI.getStoredUser()
    const accessToken = localStorage.getItem('access_token')
    return storedUser && accessToken ? { user: storedUser, access_token: accessToken } : null
  })

  const handleLogin = (authData) => {
    setAuth(authData)
  }

  const handleLogout = () => {
    authAPI.logout()
    setAuth(null)
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            auth ? <Navigate to="/admin" replace /> : <Home onLogin={handleLogin} />
          }
        />

        {/* Admin Routes - Protected */}
        <Route 
          path="/admin"
          element={
            auth ? (
              <Admin
                user={auth.user}
                accessToken={auth.access_token}
                onLogout={handleLogout}
              />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route path="/features" element={<Feature />} />
        <Route path="/how-it-works" element={<HowItWork />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/faq" element={<Faq />} />

        {/* Catch all - Redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App
