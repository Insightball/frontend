import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
// ← Header supprimé des routes login/signup/subscription — ces pages ont leur propre nav
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import DashboardHome from './pages/DashboardHome'
import DashboardMatches from './pages/DashboardMatches'
import PlayerManagement from './pages/PlayerManagement'
import ClubSettings from './pages/ClubSettings'
import MatchDetail from './pages/MatchDetail'
import Statistics from './pages/Statistics'
import TeamManagement from './pages/TeamManagement'
import SubscriptionPlans from './pages/SubscriptionPlans'
import UploadMatch from './pages/UploadMatch'
import AdminPanel from './pages/AdminPanel'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Landing - gère sa propre nav */}
          <Route path="/" element={<Home />} />

          {/* Auth - gèrent leur propre nav, PAS de <Header /> */}
          <Route path="/login"  element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Demo / Plans - gèrent leur propre nav */}
          <Route path="/demo"                element={<Dashboard />} />
          <Route path="/subscription/plans"  element={<SubscriptionPlans />} />
          <Route path="/admin" element={<AdminPanel />} />

          {/* Protected dashboard routes */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardHome /></ProtectedRoute>} />
          <Route path="/dashboard/matches" element={<ProtectedRoute><DashboardMatches /></ProtectedRoute>} />
          <Route path="/dashboard/matches/upload" element={<ProtectedRoute><UploadMatch /></ProtectedRoute>} />
          <Route path="/dashboard/matches/:matchId" element={<ProtectedRoute><MatchDetail /></ProtectedRoute>} />
          <Route path="/dashboard/players" element={<ProtectedRoute><PlayerManagement /></ProtectedRoute>} />
          <Route path="/dashboard/stats" element={<ProtectedRoute><Statistics /></ProtectedRoute>} />
          <Route path="/dashboard/team" element={<ProtectedRoute><TeamManagement /></ProtectedRoute>} />
          <Route path="/dashboard/settings" element={<ProtectedRoute><ClubSettings /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
