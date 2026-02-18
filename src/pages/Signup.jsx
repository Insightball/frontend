import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User, Building2, ArrowRight, Check } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

function Signup() {
  const navigate = useNavigate()
  const { signup } = useAuth()
  const [step, setStep] = useState(1) // 1: Plan selection, 2: Registration form
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    clubName: '' // Only for CLUB plan
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const plans = [
    {
      id: 'coach',
      name: 'COACH',
      price: '29€',
      period: '/mois',
      features: [
        '3 matchs analysés/mois',
        'Stats complètes',
        'Rapports PDF',
        'Support email'
      ]
    },
    {
      id: 'club',
      name: 'CLUB',
      price: '89€',
      period: '/mois',
      popular: true,
      features: [
        '10 matchs analysés/mois',
        'Multi-catégories',
        'Multi-utilisateurs',
        'Stats + GPS-like',
        'Support prioritaire'
      ]
    }
  ]

  const handlePlanSelect = (planId) => {
    setSelectedPlan(planId)
    setStep(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    if (formData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères')
      return
    }

    setLoading(true)

    try {
      // Format data for API
      const signupData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        plan: selectedPlan  // 'coach' or 'club' (lowercase)
      }
      
      // Add club_name only for CLUB plan
      if (selectedPlan === 'club' && formData.clubName) {
        signupData.club_name = formData.clubName
      }
      
      await signup(signupData)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-4xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-3 group">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-all">
              <svg className="w-7 h-7 text-primary" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-2xl font-bold">INSIGHTBALL</span>
          </Link>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 ${step >= 1 ? 'text-primary' : 'text-gray-600'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'border-primary bg-primary/10' : 'border-gray-600'}`}>
                {step > 1 ? <Check className="w-5 h-5" /> : '1'}
              </div>
              <span className="text-sm font-medium">Plan</span>
            </div>
            <div className={`w-12 h-0.5 ${step >= 2 ? 'bg-primary' : 'bg-gray-700'}`} />
            <div className={`flex items-center space-x-2 ${step >= 2 ? 'text-primary' : 'text-gray-600'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'border-primary bg-primary/10' : 'border-gray-600'}`}>
                2
              </div>
              <span className="text-sm font-medium">Inscription</span>
            </div>
          </div>
        </div>

        {/* Step 1: Plan Selection */}
        {step === 1 && (
          <div>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Choisissez votre plan</h1>
              <p className="text-gray-400">Sélectionnez l'offre adaptée à vos besoins</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  onClick={() => handlePlanSelect(plan.id)}
                  className={`relative bg-dark-card border rounded-xl p-8 cursor-pointer transition-all hover:border-primary/50 ${
                    plan.popular ? 'border-primary' : 'border-dark-border'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-black text-xs font-bold rounded-full uppercase">
                      Populaire
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <div className="flex items-baseline">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-gray-400 ml-2">{plan.period}</span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button className="w-full px-6 py-3 bg-primary text-black font-semibold rounded-lg hover:shadow-glow transition-all">
                    Choisir {plan.name}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Registration Form */}
        {step === 2 && (
          <div className="max-w-md mx-auto">
            <div className="bg-dark-card border border-dark-border rounded-xl p-8">
              <div className="mb-8">
                <button
                  onClick={() => setStep(1)}
                  className="text-sm text-gray-400 hover:text-primary mb-4"
                >
                  ← Changer de plan
                </button>
                <h1 className="text-3xl font-bold mb-2">Créer un compte</h1>
                <p className="text-gray-400">
                  Plan <span className="text-primary font-medium">{selectedPlan?.toUpperCase()}</span>
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {selectedPlan === 'club' ? 'Nom du directeur' : 'Nom complet'}
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full bg-black border border-dark-border rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:border-primary focus:outline-none transition-colors"
                      placeholder="Jean Dupont"
                      required
                    />
                  </div>
                </div>

                {/* Club Name (only for CLUB plan) */}
                {selectedPlan === 'club' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nom du club
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="text"
                        name="clubName"
                        value={formData.clubName}
                        onChange={handleChange}
                        className="w-full bg-black border border-dark-border rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:border-primary focus:outline-none transition-colors"
                        placeholder="FC Toulouse"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full bg-black border border-dark-border rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:border-primary focus:outline-none transition-colors"
                      placeholder="votre@email.com"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full bg-black border border-dark-border rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:border-primary focus:outline-none transition-colors"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Minimum 8 caractères</p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Confirmer le mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full bg-black border border-dark-border rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:border-primary focus:outline-none transition-colors"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full group px-8 py-4 bg-primary text-black font-semibold rounded-lg hover:shadow-glow transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>{loading ? 'Création...' : 'Créer mon compte'}</span>
                  {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                </button>
              </form>

              {/* Login Link */}
              <div className="mt-8 pt-6 border-t border-dark-border text-center">
                <p className="text-gray-400">
                  Déjà un compte ?{' '}
                  <Link to="/login" className="text-primary hover:underline font-medium">
                    Se connecter
                  </Link>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Signup
