import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Header from './components/Header'
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

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-black text-white">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={
              <>
                <Header />
                <Home />
              </>
            } />
            <Route path="/login" element={
              <>
                <Header />
                <Login />
              </>
            } />
            <Route path="/signup" element={
              <>
                <Header />
                <Signup />
              </>
            } />
            <Route path="/demo" element={
              <>
                <Header />
                <Dashboard />
              </>
            } />
            <Route path="/subscription/plans" element={
              <>
                <Header />
                <SubscriptionPlans />
              </>
            } />
            
            {/* Protected routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardHome />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/matches" element={
              <ProtectedRoute>
                <DashboardMatches />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/matches/upload" element={
              <ProtectedRoute>
                <UploadMatch />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/matches/:matchId" element={
              <ProtectedRoute>
                <MatchDetail />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/players" element={
              <ProtectedRoute>
                <PlayerManagement />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/stats" element={
              <ProtectedRoute>
                <Statistics />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/team" element={
              <ProtectedRoute>
                <TeamManagement />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/settings" element={
              <ProtectedRoute>
                <ClubSettings />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
