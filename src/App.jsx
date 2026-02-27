import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import { Suspense, lazy } from 'react'

// Pages publiques — chargées immédiatement
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'

// Pages lazy
const Dashboard         = lazy(() => import('./pages/Dashboard'))
const DashboardHome     = lazy(() => import('./pages/DashboardHome'))
const DashboardMatches  = lazy(() => import('./pages/DashboardMatches'))
const PlayerManagement  = lazy(() => import('./pages/PlayerManagement'))
const ClubSettings      = lazy(() => import('./pages/ClubSettings'))
const CoachSettings     = lazy(() => import('./pages/CoachSettings'))
const MatchDetail       = lazy(() => import('./pages/MatchDetail'))
const Statistics        = lazy(() => import('./pages/Statistics'))
const TeamManagement    = lazy(() => import('./pages/TeamManagement'))
const ClubMembers       = lazy(() => import('./pages/ClubMembers'))
const JoinClub          = lazy(() => import('./pages/JoinClub'))
const ResetPassword     = lazy(() => import('./pages/ResetPassword'))
const RecoverAccount    = lazy(() => import('./pages/RecoverAccount'))
const SubscriptionPlans = lazy(() => import('./pages/SubscriptionPlans'))
const UploadMatch       = lazy(() => import('./pages/UploadMatch'))
const Onboarding        = lazy(() => import('./pages/Onboarding'))
const AdminPanel        = lazy(() => import('./pages/AdminPanel'))
const ClubDashboard     = lazy(() => import('./pages/ClubDashboard'))

const PageLoader = () => (
  <div style={{
    minHeight: '100vh', background: '#0a0908',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }}>
    <span style={{
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 10, letterSpacing: '.2em',
      textTransform: 'uppercase', color: 'rgba(201,162,39,0.5)',
    }}>Chargement...</span>
  </div>
)

// Route settings selon le plan
function SettingsRoute() {
  const { user } = useAuth()
  if (!user) return null
  return user.plan === 'CLUB' ? <ClubSettings /> : <CoachSettings />
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Landing */}
            <Route path="/" element={<Home />} />

            {/* Auth */}
            <Route path="/x-portal-7f2a/login"  element={<Login />} />
            <Route path="/x-portal-7f2a/signup" element={<Signup />} />
            <Route path="/login"  element={<Navigate to="/" replace />} />
            <Route path="/signup" element={<Navigate to="/" replace />} />

            {/* Onboarding */}
            <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />

            {/* Invitation & récupération */}
            <Route path="/join"    element={<JoinClub />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/recover" element={<RecoverAccount />} />

            {/* Demo / Plans / Admin */}
            <Route path="/demo"                element={<Dashboard />} />
            <Route path="/x-portal-7f2a/plans" element={<SubscriptionPlans />} />
            <Route path="/admin"               element={<AdminPanel />} />

            {/* Dashboard protégé */}
            <Route path="/dashboard"                  element={<ProtectedRoute><DashboardHome /></ProtectedRoute>} />
            <Route path="/dashboard/matches"          element={<ProtectedRoute><DashboardMatches /></ProtectedRoute>} />
            <Route path="/dashboard/matches/upload"   element={<ProtectedRoute><UploadMatch /></ProtectedRoute>} />
            <Route path="/dashboard/matches/:matchId" element={<ProtectedRoute><MatchDetail /></ProtectedRoute>} />
            <Route path="/dashboard/players"          element={<ProtectedRoute><PlayerManagement /></ProtectedRoute>} />
            <Route path="/dashboard/stats"            element={<ProtectedRoute><Statistics /></ProtectedRoute>} />
            <Route path="/dashboard/team"             element={<ProtectedRoute><TeamManagement /></ProtectedRoute>} />
            <Route path="/dashboard/club"             element={<ProtectedRoute><ClubDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/members"          element={<ProtectedRoute><ClubMembers /></ProtectedRoute>} />
            <Route path="/dashboard/settings"         element={<ProtectedRoute><SettingsRoute /></ProtectedRoute>} />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  )
}

export default App
