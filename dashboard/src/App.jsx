import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Docs from './pages/Docs'
import Auth from './pages/Auth'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<><Navbar /><Landing /><Footer /></>} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Navbar />
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/docs" element={<><Navbar /><Docs /><Footer /></>} />
        <Route path="/login" element={<Auth mode="login" />} />
        <Route path="/signup" element={<Auth mode="signup" />} />
      </Routes>
    </AuthProvider>
  )
}