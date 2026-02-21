import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Zap, Users as UsersIcon, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

function SubscriptionPlans() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null)

  const plans = [
    {
      id: 'coach',
      name: 'Coach',
      price: 29,
      description: 'Pour les coachs individuels',
      icon: <Zap className="w-8 h-8" />,
      features: [
        '5 matchs analysés / mois',
        'Stats collectives complètes',
        'Stats individuelles joueurs',
        'Rapports PDF automatiques',
        'Heatmaps & zones activité',
        'Compositions tactiques',
        'Support email'
      ],
      color: 'border-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      id: 'club',
      name: 'Club',
      price: 89,
      description: 'Pour les clubs multi-catégories',
      icon: <UsersIcon className="w-8 h-8" />,
      popular: true,
      features: [
        '15 matchs analysés / mois',
        'Multi-catégories (N3, U19, U17...)',
        'Gestion effectif illimitée',
        'Tous les joueurs du club',
        'Staff technique',
        'Comparaisons entre équipes',
        'Dashboard club complet',
        'Support prioritaire'
      ],
      color: 'border-primary',
      bgColor: 'bg-primary/10'
    }
  ]

  const handleSelectPlan = async (planId) => {
    if (!user) {
      navigate('/signup')
      return
    }

    try {
      setLoading(true)
      setSelectedPlan(planId)

      const response = await api.post('/subscription/create-checkout-session', {
        plan: planId,
        success_url: `${window.location.origin}/dashboard?payment=success`,
        cancel_url: `${window.location.origin}/subscription/plans?payment=cancelled`
      })

      // Redirect to Stripe Checkout
      window.location.href = response.data.url
      
    } catch (error) {
      console.error('Error creating checkout session:', error)
      alert('Erreur lors de la création de la session de paiement')
      setLoading(false)
      setSelectedPlan(null)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">
            Choisissez votre plan
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Sélectionnez l'offre adaptée à vos besoins
          </p>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-dark-card border-2 ${plan.color} rounded-2xl p-8 hover:scale-105 transition-all duration-300`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-primary text-black text-sm font-bold rounded-full">
                  POPULAIRE
                </div>
              )}

              {/* Icon */}
              <div className={`w-16 h-16 ${plan.bgColor} rounded-xl flex items-center justify-center mb-6 text-${plan.id === 'coach' ? 'blue' : 'primary'}-500`}>
                {plan.icon}
              </div>

              {/* Name & Description */}
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <p className="text-gray-400 mb-6">{plan.description}</p>

              {/* Price */}
              <div className="mb-8">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold">{plan.price}€</span>
                  <span className="text-gray-400">/mois</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">Sans engagement</p>
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${plan.id === 'club' ? 'text-primary' : 'text-blue-500'}`} />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button
                onClick={() => handleSelectPlan(plan.id)}
                disabled={loading && selectedPlan === plan.id}
                className={`w-full py-4 ${
                  plan.popular
                    ? 'bg-primary text-black hover:shadow-glow'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                } font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
              >
                {loading && selectedPlan === plan.id ? (
                  <>
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    Chargement...
                  </>
                ) : (
                  <>
                    Choisir {plan.name.toUpperCase()}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ / Info */}
        <div className="bg-dark-card border border-dark-border rounded-xl p-8 text-center">
          <h3 className="text-xl font-bold mb-4">Questions fréquentes</h3>
          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div>
              <h4 className="font-semibold mb-2">Puis-je annuler ?</h4>
              <p className="text-sm text-gray-400">
                Oui, à tout moment. Aucun engagement.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Comment ça marche ?</h4>
              <p className="text-sm text-gray-400">
                Uploadez votre vidéo, on analyse, vous recevez le rapport PDF.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Paiement sécurisé ?</h4>
              <p className="text-sm text-gray-400">
                100% sécurisé via Stripe. Vos données sont protégées.
              </p>
            </div>
          </div>
        </div>

        {/* Back link */}
        <div className="text-center mt-8">
          <button
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-primary transition-colors"
          >
            ← Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  )
}

export default SubscriptionPlans
