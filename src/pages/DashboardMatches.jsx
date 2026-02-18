import { useState } from 'react'
import { Plus } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import UploadModal from '../components/UploadModal'
import MatchList from '../components/MatchList'
import { useAuth } from '../context/AuthContext'

function DashboardMatches() {
  const { user } = useAuth()
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [matches, setMatches] = useState([
    // Mock data - will be replaced by API
    {
      id: '1',
      opponent: 'FC Lyon',
      date: '2026-02-10',
      category: 'N3',
      type: 'championnat',
      status: 'completed',
      stats: {
        possession: 58,
        passes: 482,
        shots: 18
      }
    },
    {
      id: '2',
      opponent: 'AS Monaco',
      date: '2026-02-15',
      category: 'U19',
      type: 'championnat',
      status: 'processing',
      progress: 68
    },
    {
      id: '3',
      opponent: 'OL',
      date: '2026-02-17',
      category: 'U17',
      type: 'amical',
      status: 'pending'
    }
  ])

  const handleUpload = (newMatch) => {
    setMatches([newMatch, ...matches])
  }

  // Get quota info based on plan
  const getQuotaInfo = () => {
    if (!user) return { used: 0, total: 0 }
    
    const totalQuota = user.plan === 'club' ? 10 : 3
    const usedThisMonth = matches.filter(m => {
      const matchDate = new Date(m.date)
      const now = new Date()
      return matchDate.getMonth() === now.getMonth() && 
             matchDate.getFullYear() === now.getFullYear()
    }).length
    
    return { used: usedThisMonth, total: totalQuota }
  }

  const quota = getQuotaInfo()
  const quotaPercentage = (quota.used / quota.total) * 100

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Mes matchs</h1>
            <p className="text-gray-400">Gérez et analysez vos matchs</p>
          </div>
          
          <button
            onClick={() => setIsUploadOpen(true)}
            className="group px-6 py-3 bg-primary text-black font-semibold rounded-lg hover:shadow-glow transition-all flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Nouveau match</span>
          </button>
        </div>

        {/* Quota Info */}
        <div className="bg-dark-card border border-dark-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold mb-1">Quota mensuel</h3>
              <p className="text-sm text-gray-400">
                {quota.used} / {quota.total} matchs analysés ce mois
              </p>
            </div>
            
            <div className="text-right">
              <div className="text-3xl font-bold">
                {quota.total - quota.used}
              </div>
              <div className="text-sm text-gray-400">restants</div>
            </div>
          </div>
          
          <div className="w-full bg-dark-border rounded-full h-2 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all ${
                quotaPercentage >= 90 ? 'bg-red-500' : 
                quotaPercentage >= 70 ? 'bg-yellow-500' : 
                'bg-gradient-to-r from-primary to-primary-light'
              }`}
              style={{ width: `${quotaPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Match List */}
      <MatchList matches={matches} />

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUpload={handleUpload}
      />
    </DashboardLayout>
  )
}

export default DashboardMatches
