import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Play, BarChart3, Users, TrendingUp, CheckCircle2, ArrowRight, Sparkles, Zap, Target, Mail, Phone, MapPin, Send } from 'lucide-react'

function LandingPage() {
  const [scrollY, setScrollY] = useState(0)
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' })

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleContactSubmit = (e) => {
    e.preventDefault()
    alert('Message envoyé ! Nous vous répondrons sous 24h.')
    setContactForm({ name: '', email: '', message: '' })
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Navigation - FIXED */}
      <nav className="fixed top-0 w-full z-50 transition-all duration-300" 
           style={{
             backgroundColor: scrollY > 50 ? 'rgba(0, 0, 0, 0.95)' : 'transparent',
             backdropFilter: scrollY > 50 ? 'blur(20px)' : 'none',
             borderBottom: scrollY > 50 ? '1px solid rgba(16, 185, 129, 0.1)' : 'none'
           }}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo - FIXED WIDTH */}
            <Link to="/" className="flex items-center space-x-3 group shrink-0">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shrink-0">
                  <svg className="w-7 h-7 text-black" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              <span className="text-xl md:text-2xl font-bold whitespace-nowrap">
                INSIGHTBALL
              </span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center gap-6 ml-auto">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors whitespace-nowrap">Fonctionnalités</a>
              <a href="#pricing" className="text-gray-300 hover:text-white transition-colors whitespace-nowrap">Tarifs</a>
              <a href="#contact" className="text-gray-300 hover:text-white transition-colors whitespace-nowrap">Contact</a>
              <Link to="/login" className="text-gray-300 hover:text-white transition-colors whitespace-nowrap">Connexion</Link>
              <Link to="/signup" className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-semibold rounded-lg hover:shadow-lg hover:shadow-emerald-500/50 transition-all whitespace-nowrap shrink-0">
                Essayer gratuitement
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          
          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'linear-gradient(rgba(16, 185, 129, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.3) 1px, transparent 1px)',
              backgroundSize: '50px 50px'
            }}></div>
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full mb-8 animate-fade-in">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-emerald-400 font-medium">L'analyse vidéo nouvelle génération</span>
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight animate-fade-in-up">
              <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                Transformez vos
              </span>
              <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                matchs en insights
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              L'IA qui analyse vos vidéos de match et génère automatiquement des rapports tactiques professionnels.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <Link 
                to="/signup" 
                className="group px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-semibold rounded-xl hover:shadow-2xl hover:shadow-emerald-500/50 transition-all flex items-center space-x-2"
              >
                <span>Commencer gratuitement</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a 
                href="#demo" 
                className="group px-8 py-4 bg-white/5 border border-white/10 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/10 transition-all flex items-center space-x-2"
              >
                <Play className="w-5 h-5" />
                <span>Voir la démo</span>
              </a>
            </div>

            {/* Trust Badge */}
            <div className="mt-16 flex flex-wrap items-center justify-center gap-6 text-gray-500 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span className="text-sm">Essai gratuit 14 jours</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span className="text-sm">Sans carte bancaire</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span className="text-sm">Support 24/7</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 relative">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-teal-500/10 border border-teal-500/30 rounded-full mb-6">
              <Zap className="w-4 h-4 text-teal-400" />
              <span className="text-sm text-teal-400 font-medium">Fonctionnalités</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Une plateforme complète pour analyser, comprendre et améliorer vos performances
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group relative p-8 bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-2xl hover:border-emerald-500/50 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mb-6">
                  <Play className="w-7 h-7 text-black" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Analyse vidéo automatique</h3>
                <p className="text-gray-400 leading-relaxed">
                  Uploadez votre vidéo de match et laissez notre IA extraire automatiquement les données tactiques et statistiques.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group relative p-8 bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-2xl hover:border-emerald-500/50 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mb-6">
                  <BarChart3 className="w-7 h-7 text-black" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Rapports professionnels</h3>
                <p className="text-gray-400 leading-relaxed">
                  Recevez des rapports PDF complets avec analyses tactiques, heatmaps et recommandations personnalisées.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group relative p-8 bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-2xl hover:border-emerald-500/50 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mb-6">
                  <Users className="w-7 h-7 text-black" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Gestion d'effectif</h3>
                <p className="text-gray-400 leading-relaxed">
                  Suivez les performances individuelles, gérez vos compositions et optimisez votre stratégie d'équipe.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-gradient-to-b from-emerald-500/10 to-transparent border border-emerald-500/20 rounded-2xl">
              <div className="text-5xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-2">
                95%
              </div>
              <div className="text-gray-400">Précision de l'analyse</div>
            </div>
            <div className="text-center p-8 bg-gradient-to-b from-emerald-500/10 to-transparent border border-emerald-500/20 rounded-2xl">
              <div className="text-5xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-2">
                &lt;5min
              </div>
              <div className="text-gray-400">Temps de traitement</div>
            </div>
            <div className="text-center p-8 bg-gradient-to-b from-emerald-500/10 to-transparent border border-emerald-500/20 rounded-2xl">
              <div className="text-5xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-2">
                500+
              </div>
              <div className="text-gray-400">Clubs utilisateurs</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Tarifs simples et transparents</h2>
            <p className="text-xl text-gray-400">Choisissez le plan qui correspond à vos besoins</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Plan Coach */}
            <div className="p-8 bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-2xl">
              <h3 className="text-2xl font-bold mb-2">Plan COACH</h3>
              <div className="text-4xl font-bold mb-6">
                <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">29€</span>
                <span className="text-lg text-gray-400">/mois</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-gray-300">10 matchs analysés/mois</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-gray-300">Rapports PDF professionnels</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-gray-300">Support email</span>
                </li>
              </ul>
              <Link to="/signup" className="block w-full text-center px-8 py-3 bg-white/5 border border-white/10 text-white font-semibold rounded-lg hover:bg-white/10 transition-all">
                Commencer
              </Link>
            </div>

            {/* Plan Club */}
            <div className="relative p-8 bg-gradient-to-b from-emerald-500/10 to-transparent border-2 border-emerald-500/50 rounded-2xl">
              <div className="absolute top-0 right-6 -translate-y-1/2 px-4 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-black text-sm font-bold rounded-full">
                POPULAIRE
              </div>
              <h3 className="text-2xl font-bold mb-2">Plan CLUB</h3>
              <div className="text-4xl font-bold mb-6">
                <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">99€</span>
                <span className="text-lg text-gray-400">/mois</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-gray-300">Matchs illimités</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-gray-300">Multi-utilisateurs (jusqu'à 5)</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-gray-300">Gestion complète d'effectif</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-gray-300">Support prioritaire 24/7</span>
                </li>
              </ul>
              <Link to="/signup" className="block w-full text-center px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-semibold rounded-lg hover:shadow-lg hover:shadow-emerald-500/50 transition-all">
                Commencer
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Contactez-nous</h2>
            <p className="text-xl text-gray-400">Une question ? Notre équipe vous répond sous 24h</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Contact Info */}
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center shrink-0">
                  <Mail className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">Email</h3>
                  <a href="mailto:contact@insightball.com" className="text-gray-400 hover:text-emerald-400 transition-colors">
                    contact@insightball.com
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center shrink-0">
                  <Phone className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">Téléphone</h3>
                  <a href="tel:+33123456789" className="text-gray-400 hover:text-emerald-400 transition-colors">
                    +33 1 23 45 67 89
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center shrink-0">
                  <MapPin className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">Adresse</h3>
                  <p className="text-gray-400">
                    42 Avenue des Champs-Élysées<br />
                    75008 Paris, France
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <form onSubmit={handleContactSubmit} className="space-y-6 p-8 bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-2xl">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nom</label>
                <input
                  type="text"
                  required
                  value={contactForm.name}
                  onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                  className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none transition-colors"
                  placeholder="Votre nom"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={contactForm.email}
                  onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                  className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none transition-colors"
                  placeholder="votre@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Message</label>
                <textarea
                  required
                  rows={5}
                  value={contactForm.message}
                  onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                  className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none transition-colors resize-none"
                  placeholder="Votre message..."
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center space-x-2 px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-semibold rounded-lg hover:shadow-lg hover:shadow-emerald-500/50 transition-all"
              >
                <Send className="w-5 h-5" />
                <span>Envoyer</span>
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 relative">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative p-12 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent"></div>
            <div className="relative">
              <Target className="w-16 h-16 text-emerald-400 mx-auto mb-6" />
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Prêt à améliorer vos performances ?
              </h2>
              <p className="text-xl text-gray-400 mb-8">
                Rejoignez les 500+ clubs qui utilisent déjà INSIGHTBALL pour progresser
              </p>
              <Link 
                to="/signup" 
                className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-semibold rounded-xl hover:shadow-2xl hover:shadow-emerald-500/50 transition-all"
              >
                <span>Commencer gratuitement</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-black" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="text-xl font-bold">INSIGHTBALL</span>
              </div>
              <p className="text-gray-400 text-sm">
                L'analyse vidéo intelligente pour le football amateur et professionnel.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4">Produit</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Fonctionnalités</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Tarifs</a></li>
                <li><a href="#demo" className="hover:text-white transition-colors">Démo</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Entreprise</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">À propos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Carrières</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Légal</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Confidentialité</a></li>
                <li><a href="#" className="hover:text-white transition-colors">CGU</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Mentions légales</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2026 INSIGHTBALL. Tous droits réservés.
            </div>
            <div className="text-gray-400 text-sm">
              Made with ❤️ in Paris
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }
      `}</style>
    </div>
  )
}

export default LandingPage
