import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
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
import ClubMembers from './pages/ClubMembers'
import JoinClub from './pages/JoinClub'
import RecoverAccount from './pages/RecoverAccount'
import SubscriptionPlans from './pages/SubscriptionPlans'
import UploadMatch from './pages/UploadMatch'
import AdminPanel from './pages/AdminPanel'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Landing */}
          <Route path="/" element={<Home />} />

          {/* Auth */}
          <Route path="/x-portal-7f2a/login"  element={<Login />} />
          <Route path="/x-portal-7f2a/signup" element={<Signup />} />
          <Route path="/login"  element={<Navigate to="/" replace />} />
          <Route path="/signup" element={<Navigate to="/" replace />} />

          {/* Invitation & récupération */}
          <Route path="/join"    element={<JoinClub />} />
          <Route path="/recover" element={<RecoverAccount />} />

          {/* Demo / Plans / Admin */}
          <Route path="/demo"                element={<Dashboard />} />
          <Route path="/x-portal-7f2a/plans" element={<SubscriptionPlans />} />
          <Route path="/admin"               element={<AdminPanel />} />

          {/* Dashboard protégé */}
          <Route path="/dashboard"                    element={<ProtectedRoute><DashboardHome /></ProtectedRoute>} />
          <Route path="/dashboard/matches"            element={<ProtectedRoute><DashboardMatches /></ProtectedRoute>} />
          <Route path="/dashboard/matches/upload"     element={<ProtectedRoute><UploadMatch /></ProtectedRoute>} />
          <Route path="/dashboard/matches/:matchId"   element={<ProtectedRoute><MatchDetail /></ProtectedRoute>} />
          <Route path="/dashboard/players"            element={<ProtectedRoute><PlayerManagement /></ProtectedRoute>} />
          <Route path="/dashboard/stats"              element={<ProtectedRoute><Statistics /></ProtectedRoute>} />
          <Route path="/dashboard/team"               element={<ProtectedRoute><TeamManagement /></ProtectedRoute>} />
          <Route path="/dashboard/members"            element={<ProtectedRoute><ClubMembers /></ProtectedRoute>} />
          <Route path="/dashboard/settings"           element={<ProtectedRoute><ClubSettings /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
