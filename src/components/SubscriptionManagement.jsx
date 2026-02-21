import { useState, useEffect } from 'react'
import { CreditCard, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

function SubscriptionManagement() {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSubscription()
  }, [])

  const loadSubscription = async () => {
    try {
      setLoading(true)
      const response = await api.get('/subscription/subscription-status')
      setSubscription(response.data)
    } catch (error) {
      console.error('Error loading subscription:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleManageSubscription = async () => {
    try {
      const response = await api.post('/subscription/create-portal-session', {
        return_url: window.location.href
      })
      
      // Redirect to Stripe portal
      window.location.href = response.data.url
      
    } catch (error) {
      console.error('Error opening portal:', error)
      alert('Erreur lors de l\'ouverture du portail de gestion')
    }
  }

  const handleCancelSubscription = async () => {
    if (!confirm('Êtes-vous sûr de vouloir annuler votre abonnement ? Il restera actif jusqu\'à la fin de la période de facturation.')) {
      return
    }

    try {
      await api.post('/subscription/cancel-subscription')
      alert('Abonnement annulé avec succès. Il restera actif jusqu\'à la fin de la période.')
      loadSubscription()
    } catch (error) {
      console.error('Error canceling subscription:', error)
      alert('Erreur lors de l\'annulation')
    }
  }

  const getPlanName = (plan) => {
    return plan === 'coach' ? 'Coach' : 'Club'
  }

  const getPlanPrice = (plan) => {
    return plan === 'coach' ? '29€' : '89€'
  }

  if (loading) {
    return (
      <div className="bg-dark-card border border-dark-border rounded-lg p-6">
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-dark-card border border-dark-border rounded-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <CreditCard className="w-6 h-6 text-primary" />
        <h2 className="text-xl font-bold">Abonnement</h2>
      </div>

      {subscription?.active ? (
        <div className="space-y-6">
          {/* Active subscription info */}
          <div className="flex items-start gap-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <div className="font-semibold text-green-500 mb-1">Abonnement actif</div>
              <div className="text-sm text-gray-300">
                Votre abonnement {getPlanName(user?.plan)} est actif et renouvelé automatiquement.
              </div>
            </div>
          </div>

          {/* Plan details */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-black border border-dark-border rounded-lg">
              <div className="text-sm text-gray-400 mb-1">Plan actuel</div>
              <div className="text-2xl font-bold text-primary">
                {getPlanName(user?.plan)}
              </div>
            </div>

            <div className="p-4 bg-black border border-dark-border rounded-lg">
              <div className="text-sm text-gray-400 mb-1">Tarif</div>
              <div className="text-2xl font-bold">
                {getPlanPrice(user?.plan)} <span className="text-sm text-gray-400">/mois</span>
              </div>
            </div>
          </div>

          {subscription.current_period_end && (
            <div className="p-4 bg-black border border-dark-border rounded-lg">
              <div className="text-sm text-gray-400 mb-1">
                {subscription.cancel_at_period_end ? 'Actif jusqu\'au' : 'Prochain renouvellement'}
              </div>
              <div className="font-semibold">
                {new Date(subscription.current_period_end * 1000).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </div>
            </div>
          )}

          {subscription.cancel_at_period_end && (
            <div className="flex items-start gap-4 p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
              <AlertCircle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <div className="font-semibold text-orange-500 mb-1">Annulation programmée</div>
                <div className="text-sm text-gray-300">
                  Votre abonnement sera annulé à la fin de la période de facturation.
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleManageSubscription}
              className="flex-1 px-6 py-3 bg-primary text-black font-semibold rounded-lg hover:shadow-glow transition-all flex items-center justify-center gap-2"
            >
              Gérer l'abonnement
              <ExternalLink className="w-4 h-4" />
            </button>

            {!subscription.cancel_at_period_end && (
              <button
                onClick={handleCancelSubscription}
                className="px-6 py-3 border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
              >
                Annuler
              </button>
            )}
          </div>

          <p className="text-xs text-gray-500 text-center">
            La gestion des paiements est sécurisée par Stripe
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* No active subscription */}
          <div className="flex items-start gap-4 p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
            <AlertCircle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <div className="font-semibold text-orange-500 mb-1">Aucun abonnement actif</div>
              <div className="text-sm text-gray-300">
                Souscrivez à un plan pour accéder à toutes les fonctionnalités.
              </div>
            </div>
          </div>

          <button
            onClick={() => window.location.href = '/subscription/plans'}
            className="w-full px-6 py-3 bg-primary text-black font-semibold rounded-lg hover:shadow-glow transition-all"
          >
            Choisir un plan
          </button>
        </div>
      )}
    </div>
  )
}

export default SubscriptionManagement
