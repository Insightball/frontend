import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Play, BarChart3, Users, TrendingUp, CheckCircle2, ArrowRight, Sparkles, Zap, Target, Mail, Phone, MapPin, Send, Clock, Shield, Award, Camera, FileText, Activity } from 'lucide-react'

function LandingPage() {
  const [scrollY, setScrollY] = useState(0)
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' })
  const [isVisible, setIsVisible] = useState({})

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
      
      // Parallax effect for elements
      const elements = document.querySelectorAll('.parallax')
      elements.forEach(el => {
        const speed = el.dataset.speed || 0.5
        el.style.transform = `translateY(${scrollY * speed}px)`
      })
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [scrollY])

  const handleContactSubmit = (e) => {
    e.preventDefault()
    alert('Message envoyé ! Nous vous répondrons sous 24h.')
    setContactForm({ name: '', email: '', message: '' })
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 transition-all duration-300" 
           style={{
             backgroundColor: scrollY > 50 ? 'rgba(0, 0, 0, 0.95)' : 'transparent',
             backdropFilter: scrollY > 50 ? 'blur(20px)' : 'none',
             borderBottom: scrollY > 50 ? '1px solid rgba(16, 185, 129, 0.1)' : 'none'
           }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group shrink-0">
              <img 
                src="/logo.svg" 
                alt="INSIGHTBALL" 
                className="w-10 sm:w-12 h-10 sm:h-12 group-hover:scale-110 transition-transform"
              />
              <span className="text-lg sm:text-xl md:text-2xl font-bold whitespace-nowrap">
                INSIGHT<span className="text-violet-400">BALL</span>
              </span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center gap-6 ml-auto">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors whitespace-nowrap">Fonctionnalités</a>
              <a href="#pricing" className="text-gray-300 hover:text-white transition-colors whitespace-nowrap">Tarifs</a>
              <a href="#contact" className="text-gray-300 hover:text-white transition-colors whitespace-nowrap">Contact</a>
              <Link to="/login" className="text-gray-300 hover:text-white transition-colors whitespace-nowrap">Connexion</Link>
              <Link to="/signup" className="px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-violet-500 to-purple-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-violet-500/50 transition-all whitespace-nowrap shrink-0 text-sm sm:text-base">
                Essayer gratuitement
              </Link>
            </div>

            {/* Mobile CTA */}
            <div className="lg:hidden flex items-center gap-3">
              <Link to="/login" className="text-gray-300 hover:text-white transition-colors text-sm font-medium whitespace-nowrap">
                Connexion
              </Link>
              <Link to="/signup" className="px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-500 text-white font-semibold rounded-lg text-sm whitespace-nowrap">
                Essayer
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 sm:pt-32 pb-16 sm:pb-20 px-4 sm:px-6 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-violet-500/20 rounded-full blur-3xl animate-pulse parallax" data-speed="0.3"></div>
          <div className="absolute bottom-1/4 -right-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse parallax" data-speed="0.5" style={{ animationDelay: '1s' }}></div>
          
          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'linear-gradient(rgba(16, 185, 129, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.3) 1px, transparent 1px)',
              backgroundSize: '50px 50px'
            }}></div>
          </div>

          {/* Floating elements */}
          <div className="absolute top-20 left-10 w-2 h-2 bg-violet-500 rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>
          <div className="absolute top-40 right-20 w-3 h-3 bg-purple-500 rounded-full animate-ping" style={{ animationDuration: '4s', animationDelay: '1s' }}></div>
          <div className="absolute bottom-20 left-1/4 w-2 h-2 bg-fuchsia-500 rounded-full animate-ping" style={{ animationDuration: '5s', animationDelay: '2s' }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-violet-500/10 border border-violet-500/30 rounded-full mb-6 sm:mb-8 animate-fade-in">
              <Sparkles className="w-4 h-4 text-violet-400 animate-pulse" />
              <span className="text-xs sm:text-sm text-violet-400 font-medium">Analyse vidéo intelligente</span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold mb-4 sm:mb-6 leading-tight animate-fade-in-up px-4">
              <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                Analysez vos matchs
              </span>
              <br />
              <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
                comme les pros
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl md:text-2xl text-gray-400 mb-8 sm:mb-12 max-w-3xl mx-auto animate-fade-in-up px-4" style={{ animationDelay: '0.2s' }}>
              La plateforme d'analyse vidéo qui transforme vos matchs en rapports tactiques professionnels. Rapide, précis, accessible.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up px-4" style={{ animationDelay: '0.4s' }}>
              <Link 
                to="/signup" 
                className="group w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-violet-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-2xl hover:shadow-violet-500/50 transition-all flex items-center justify-center space-x-2"
              >
                <span className="text-sm sm:text-base">Commencer gratuitement</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a 
                href="#demo" 
                className="group w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white/5 border border-white/10 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/10 transition-all flex items-center justify-center space-x-2"
              >
                <Play className="w-5 h-5" />
                <span className="text-sm sm:text-base">Voir la démo</span>
              </a>
            </div>


          </div>
        </div>
      </section>

      {/* Dashboard Preview - NEW */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-3xl blur-3xl"></div>
            
            {/* Dashboard mockup placeholder */}
            <div className="relative bg-gradient-to-br from-gray-900 to-black border-2 border-violet-500/30 rounded-2xl overflow-hidden shadow-2xl">
              <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                <div className="text-center p-6 sm:p-8">
                  <BarChart3 className="w-12 sm:w-16 h-12 sm:h-16 mx-auto mb-4 text-violet-500" />
                  <h3 className="text-lg sm:text-2xl font-bold mb-2">Tableau de bord intuitif</h3>
                  <p className="text-sm sm:text-base text-gray-400">Visualisez toutes vos statistiques en un coup d'œil</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 sm:py-20 px-4 sm:px-6 relative">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full mb-6">
              <Zap className="w-4 h-4 text-purple-400" />
              <span className="text-xs sm:text-sm text-purple-400 font-medium">Fonctionnalités</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 px-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto px-4">
              Une plateforme complète d'analyse vidéo pour votre staff technique
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Feature 1 */}
            <div className="group relative p-6 sm:p-8 bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-2xl hover:border-violet-500/50 transition-all duration-300 hover:transform hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="w-12 sm:w-14 h-12 sm:h-14 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                  <Camera className="w-6 sm:w-7 h-6 sm:h-7 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3">Upload en 1 clic</h3>
                <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
                  Uploadez votre vidéo depuis votre téléphone ou ordinateur. Notre IA fait le reste.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group relative p-6 sm:p-8 bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-2xl hover:border-violet-500/50 transition-all duration-300 hover:transform hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="w-12 sm:w-14 h-12 sm:h-14 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                  <Clock className="w-6 sm:w-7 h-6 sm:h-7 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3">Analyse en 24h</h3>
                <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
                  Recevez votre rapport complet en moins de 24 heures. Prêt pour votre prochain entraînement.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group relative p-6 sm:p-8 bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-2xl hover:border-violet-500/50 transition-all duration-300 hover:transform hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="w-12 sm:w-14 h-12 sm:h-14 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                  <FileText className="w-6 sm:w-7 h-6 sm:h-7 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3">Rapports PDF pros</h3>
                <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
                  Heatmaps, statistiques détaillées et recommandations tactiques. Prêt à partager.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="group relative p-6 sm:p-8 bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-2xl hover:border-violet-500/50 transition-all duration-300 hover:transform hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="w-12 sm:w-14 h-12 sm:h-14 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                  <Users className="w-6 sm:w-7 h-6 sm:h-7 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3">Suivi d'effectif</h3>
                <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
                  Gérez vos joueurs, suivez leurs performances et optimisez vos compositions.
                </p>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="group relative p-6 sm:p-8 bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-2xl hover:border-violet-500/50 transition-all duration-300 hover:transform hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="w-12 sm:w-14 h-12 sm:h-14 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                  <Shield className="w-6 sm:w-7 h-6 sm:h-7 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3">98% de précision</h3>
                <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
                  Notre IA analyse chaque action avec une précision professionnelle validée par des experts.
                </p>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="group relative p-6 sm:p-8 bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-2xl hover:border-violet-500/50 transition-all duration-300 hover:transform hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="w-12 sm:w-14 h-12 sm:h-14 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                  <Activity className="w-6 sm:w-7 h-6 sm:h-7 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3">Support 24/7</h3>
                <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
                  Notre équipe d'experts vous accompagne à chaque étape. Réponse garantie sous 24h.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center p-6 sm:p-8 bg-gradient-to-b from-violet-500/10 to-transparent border border-violet-500/20 rounded-2xl hover:transform hover:scale-105 transition-all">
              <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent mb-2 animate-pulse">
                98%
              </div>
              <div className="text-sm sm:text-base text-gray-400">Précision de l'analyse</div>
            </div>
            <div className="text-center p-6 sm:p-8 bg-gradient-to-b from-violet-500/10 to-transparent border border-violet-500/20 rounded-2xl hover:transform hover:scale-105 transition-all">
              <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent mb-2 animate-pulse" style={{ animationDelay: '0.5s' }}>
                &lt;24h
              </div>
              <div className="text-sm sm:text-base text-gray-400">Temps d'analyse</div>
            </div>
            <div className="text-center p-6 sm:p-8 bg-gradient-to-b from-violet-500/10 to-transparent border border-violet-500/20 rounded-2xl hover:transform hover:scale-105 transition-all">
              <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent mb-2 animate-pulse" style={{ animationDelay: '1s' }}>
                100%
              </div>
              <div className="text-sm sm:text-base text-gray-400">Satisfaction garantie</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section - UPDATED */}
      <section id="pricing" className="py-12 sm:py-20 px-4 sm:px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 px-4">Offre de lancement 🎉</h2>
            <p className="text-lg sm:text-xl text-gray-400 px-4">Prix valables à vie pour les premiers utilisateurs</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
            {/* Plan Coach */}
            <div className="p-6 sm:p-8 bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-2xl hover:transform hover:scale-105 transition-all">
              <h3 className="text-xl sm:text-2xl font-bold mb-2">Plan COACH</h3>
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">29€</span>
                <span className="text-base sm:text-lg text-gray-400 line-through">39€</span>
                <span className="text-xs sm:text-sm text-gray-400">/mois</span>
              </div>
              <div className="inline-block px-3 py-1 bg-violet-500/10 border border-violet-500/30 text-violet-400 text-xs font-medium rounded-full mb-6">
                -26% - Offre limitée
              </div>
              <ul className="space-y-3 sm:space-y-4 mb-8">
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-violet-500 shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base text-gray-300">10 matchs analysés/mois</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-violet-500 shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base text-gray-300">Rapports PDF professionnels</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-violet-500 shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base text-gray-300">Support email 24h</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-violet-500 shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base text-gray-300">Gestion d'effectif basique</span>
                </li>
              </ul>
              <Link to="/signup" className="block w-full text-center px-6 sm:px-8 py-3 bg-white/5 border border-white/10 text-white font-semibold rounded-lg hover:bg-white/10 transition-all text-sm sm:text-base">
                Commencer
              </Link>
            </div>

            {/* Plan Club */}
            <div className="relative p-6 sm:p-8 bg-gradient-to-b from-violet-500/10 to-transparent border-2 border-violet-500/50 rounded-2xl hover:transform hover:scale-105 transition-all">
              <div className="absolute top-0 right-4 sm:right-6 -translate-y-1/2 px-3 sm:px-4 py-1 bg-gradient-to-r from-violet-500 to-purple-500 text-white text-xs sm:text-sm font-bold rounded-full">
                POPULAIRE
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2">Plan CLUB</h3>
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">99€</span>
                <span className="text-base sm:text-lg text-gray-400 line-through">139€</span>
                <span className="text-xs sm:text-sm text-gray-400">/mois</span>
              </div>
              <div className="inline-block px-3 py-1 bg-violet-500/10 border border-violet-500/30 text-violet-400 text-xs font-medium rounded-full mb-6">
                -29% - Offre limitée
              </div>
              <ul className="space-y-3 sm:space-y-4 mb-8">
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-violet-500 shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base text-gray-300 font-semibold">Matchs illimités</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-violet-500 shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base text-gray-300">Multi-utilisateurs (jusqu'à 5)</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-violet-500 shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base text-gray-300">Gestion complète d'effectif</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-violet-500 shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base text-gray-300">Support prioritaire 24/7</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-violet-500 shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base text-gray-300">Analyses avancées</span>
                </li>
              </ul>
              <Link to="/signup" className="block w-full text-center px-6 sm:px-8 py-3 bg-gradient-to-r from-violet-500 to-purple-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-violet-500/50 transition-all text-sm sm:text-base">
                Commencer
              </Link>
            </div>
          </div>

          <p className="text-center text-sm text-gray-500 mt-8 px-4">
            💎 Prix garantis à vie · Pas d'engagement · Annulation en 1 clic
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-12 sm:py-20 px-4 sm:px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 px-4">Une question ?</h2>
            <p className="text-lg sm:text-xl text-gray-400 px-4">Notre équipe vous répond sous 24h</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 sm:gap-12 max-w-6xl mx-auto">
            {/* Contact Info */}
            <div className="space-y-6 sm:space-y-8">
              <div className="flex items-start space-x-4">
                <div className="w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-br from-violet-500 to-purple-500 rounded-lg flex items-center justify-center shrink-0">
                  <Mail className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold mb-1">Email</h3>
                  <a href="mailto:contact@insightball.com" className="text-sm sm:text-base text-gray-400 hover:text-violet-400 transition-colors">
                    contact@insightball.com
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-br from-violet-500 to-purple-500 rounded-lg flex items-center justify-center shrink-0">
                  <Phone className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold mb-1">Téléphone</h3>
                  <a href="tel:+33123456789" className="text-sm sm:text-base text-gray-400 hover:text-violet-400 transition-colors">
                    +33 1 23 45 67 89
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-br from-violet-500 to-purple-500 rounded-lg flex items-center justify-center shrink-0">
                  <MapPin className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold mb-1">Adresse</h3>
                  <p className="text-sm sm:text-base text-gray-400">
                    42 Avenue des Champs-Élysées<br />
                    75008 Paris, France
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <form onSubmit={handleContactSubmit} className="space-y-4 sm:space-y-6 p-6 sm:p-8 bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-2xl">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nom</label>
                <input
                  type="text"
                  required
                  value={contactForm.name}
                  onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                  className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 sm:py-3 text-sm sm:text-base text-white placeholder-gray-500 focus:border-violet-500 focus:outline-none transition-colors"
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
                  className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 sm:py-3 text-sm sm:text-base text-white placeholder-gray-500 focus:border-violet-500 focus:outline-none transition-colors"
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
                  className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 sm:py-3 text-sm sm:text-base text-white placeholder-gray-500 focus:border-violet-500 focus:outline-none transition-colors resize-none"
                  placeholder="Votre message..."
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center space-x-2 px-6 sm:px-8 py-2 sm:py-3 bg-gradient-to-r from-violet-500 to-purple-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-violet-500/50 transition-all text-sm sm:text-base"
              >
                <Send className="w-5 h-5" />
                <span>Envoyer</span>
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 relative">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative p-8 sm:p-12 bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/30 rounded-3xl overflow-hidden hover:transform hover:scale-105 transition-all">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent"></div>
            <div className="relative">
              <Target className="w-12 sm:w-16 h-12 sm:h-16 text-violet-400 mx-auto mb-4 sm:mb-6 animate-bounce" />
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 px-4">
                Prêt à passer au niveau supérieur ?
              </h2>
              <p className="text-lg sm:text-xl text-gray-400 mb-6 sm:mb-8 px-4">
                Rejoignez les clubs qui analysent leurs matchs avec INSIGHTBALL
              </p>
              <Link 
                to="/signup" 
                className="inline-flex items-center space-x-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-violet-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-2xl hover:shadow-violet-500/50 transition-all text-sm sm:text-base"
              >
                <span>Commencer gratuitement</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-12 px-4 sm:px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center space-x-3 mb-4">
                <img 
                  src="/logo.svg" 
                  alt="INSIGHTBALL" 
                  className="w-8 sm:w-10 h-8 sm:h-10"
                />
                <span className="text-lg sm:text-xl font-bold">
                  INSIGHT<span className="text-violet-400">BALL</span>
                </span>
              </div>
              <p className="text-sm text-gray-400">
                La plateforme d'analyse vidéo pour le football moderne.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-3 sm:mb-4 text-sm sm:text-base">Produit</h4>
              <ul className="space-y-2 text-gray-400 text-xs sm:text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Fonctionnalités</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Tarifs</a></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Connexion</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-3 sm:mb-4 text-sm sm:text-base">Entreprise</h4>
              <ul className="space-y-2 text-gray-400 text-xs sm:text-sm">
                <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">À propos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-3 sm:mb-4 text-sm sm:text-base">Légal</h4>
              <ul className="space-y-2 text-gray-400 text-xs sm:text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Confidentialité</a></li>
                <li><a href="#" className="hover:text-white transition-colors">CGU</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Mentions légales</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-6 sm:pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs sm:text-sm text-gray-400 text-center sm:text-left">
              © 2026 INSIGHTBALL. Tous droits réservés.
            </div>
            <div className="text-xs sm:text-sm text-gray-400 flex items-center gap-2">
              Made in France with <span className="text-red-500 animate-pulse">❤️</span>
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
