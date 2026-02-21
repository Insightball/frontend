import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Play, BarChart3, Users, Zap, CheckCircle, ArrowRight, Sparkles, TrendingUp, Shield, Clock, Mail, MessageSquare, Send, Heart } from 'lucide-react'

function Home() {
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: ''
  })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const handleContactChange = (e) => {
    setContactForm({
      ...contactForm,
      [e.target.name]: e.target.value
    })
  }

  const handleContactSubmit = async (e) => {
    e.preventDefault()
    setSending(true)
    
    // Simulate sending
    setTimeout(() => {
      setSending(false)
      setSent(true)
      setTimeout(() => {
        setSent(false)
        setContactForm({ name: '', email: '', message: '' })
      }, 3000)
    }, 1000)
  }

  const features = [
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Statistiques automatiques",
      description: "Possession, passes, tirs, distance parcourue... Toutes les stats générées instantanément par l'IA."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Analyse individuelle",
      description: "Suivi détaillé de chaque joueur avec notes, heatmaps et évolution dans le temps."
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Rapports PDF instantanés",
      description: "Recevez un rapport complet automatiquement après chaque match analysé."
    }
  ]

  const stats = [
    { value: "2h", label: "Gagnées par match", description: "vs analyse manuelle" },
    { value: "50+", label: "Statistiques", description: "Générées automatiquement" },
    { value: "24h", label: "Délai d'analyse", description: "Upload → Rapport PDF" }
  ]

  const benefits = [
    "Upload vidéo simple et rapide",
    "Analyse IA en moins de 24h",
    "Stats collectives et individuelles",
    "Heatmaps et zones d'activité",
    "Timeline événements du match",
    "Comparaison entre matchs",
    "Suivi progression joueurs",
    "Export PDF professionnel"
  ]

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 rounded-full mb-8">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Analyse vidéo propulsée par l'IA</span>
            </div>

            {/* Title */}
            <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
              Transformez vos matchs
              <br />
              en <span className="text-primary">données exploitables</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-12">
              La plateforme d'analyse vidéo qui génère automatiquement toutes les statistiques dont vous avez besoin pour progresser.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                to="/signup"
                className="group px-8 py-4 bg-primary text-black font-bold text-lg rounded-lg hover:shadow-glow transition-all flex items-center gap-2"
              >
                Essayer gratuitement
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                to="/demo"
                className="px-8 py-4 border-2 border-primary text-primary font-bold text-lg rounded-lg hover:bg-primary/10 transition-all flex items-center gap-2"
              >
                <Play className="w-5 h-5" />
                Voir la démo
              </Link>
            </div>
          </div>

          {/* Hero Image/Video Placeholder - VERSION COMPACTE */}
          <div className="relative max-w-5xl mx-auto">
            <div className="relative rounded-2xl overflow-hidden border-2 border-primary/30 shadow-2xl aspect-video">
              <img 
                src="https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=1200&q=80" 
                alt="Dashboard preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
              
              {/* Floating stats cards */}
              <div className="absolute bottom-4 left-4 right-4 grid grid-cols-3 gap-3">
                <div className="bg-black/80 backdrop-blur-sm border border-primary/30 rounded-lg p-3">
                  <div className="text-2xl font-bold text-primary">58%</div>
                  <div className="text-xs text-gray-400">Possession</div>
                </div>
                <div className="bg-black/80 backdrop-blur-sm border border-primary/30 rounded-lg p-3">
                  <div className="text-2xl font-bold text-primary">482</div>
                  <div className="text-xs text-gray-400">Passes</div>
                </div>
                <div className="bg-black/80 backdrop-blur-sm border border-primary/30 rounded-lg p-3">
                  <div className="text-2xl font-bold text-primary">18</div>
                  <div className="text-xs text-gray-400">Tirs</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-black to-dark-card">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-6xl font-bold text-primary mb-3">{stat.value}</div>
                <div className="text-xl font-semibold text-white mb-2">{stat.label}</div>
                <div className="text-gray-400">{stat.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Tout ce dont un coach a besoin
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              De l'upload vidéo jusqu'au rapport PDF, tout est automatisé
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group bg-dark-card border border-dark-border rounded-2xl p-8 hover:border-primary/50 transition-all"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6 bg-dark-card">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Analysez, comprenez, progressez
              </h2>
              <p className="text-xl text-gray-400 mb-8">
                INSIGHTBALL automatise l'analyse vidéo pour que vous puissiez vous concentrer sur l'essentiel : faire progresser vos joueurs.
              </p>
              
              <div className="grid grid-cols-1 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                    <span className="text-lg text-gray-300">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden border-2 border-primary/30">
                <img 
                  src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80" 
                  alt="Analysis preview"
                  className="w-full h-auto"
                />
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-6 -right-6 bg-primary text-black font-bold p-6 rounded-2xl shadow-2xl">
                <TrendingUp className="w-8 h-8 mb-2" />
                <div className="text-3xl">+32%</div>
                <div className="text-sm">Progression</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Features Showcase */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Un dashboard complet pour vos analyses
            </h2>
            <p className="text-xl text-gray-400">
              Toutes les fonctionnalités dont vous avez besoin au même endroit
            </p>
          </div>

          {/* Feature 1: Stats Overview */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div className="order-2 md:order-1">
              <div className="relative rounded-xl overflow-hidden border-2 border-primary/30 shadow-2xl">
                {/* Dashboard Stats Mock */}
                <div className="bg-gradient-to-br from-dark-card to-black p-8">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-black/50 border border-primary/20 rounded-lg p-4">
                      <div className="text-3xl font-bold text-primary mb-1">12</div>
                      <div className="text-sm text-gray-400">Matchs analysés</div>
                    </div>
                    <div className="bg-black/50 border border-primary/20 rounded-lg p-4">
                      <div className="text-3xl font-bold text-primary mb-1">58%</div>
                      <div className="text-sm text-gray-400">Possession moy.</div>
                    </div>
                  </div>
                  <div className="bg-black/50 border border-primary/20 rounded-lg p-4">
                    <div className="text-xs text-gray-500 uppercase mb-2">Top joueur</div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/20 rounded-full"></div>
                      <div>
                        <div className="font-semibold">Joueur #10</div>
                        <div className="text-sm text-primary">Note: 8.5/10</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 md:order-2">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 rounded-full mb-6">
                <BarChart3 className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Vue d'ensemble</span>
              </div>
              <h3 className="text-3xl md:text-4xl font-bold mb-4">
                Dashboard intuitif
              </h3>
              <p className="text-lg text-gray-400 mb-6">
                Accédez à toutes vos statistiques en un coup d'œil. Matchs analysés, performances d'équipe, et classement des joueurs.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span className="text-gray-300">Stats en temps réel</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span className="text-gray-300">Top performers du mois</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span className="text-gray-300">Alertes importantes</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Feature 2: Player Analysis */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 rounded-full mb-6">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Analyse joueurs</span>
              </div>
              <h3 className="text-3xl md:text-4xl font-bold mb-4">
                Suivi individuel détaillé
              </h3>
              <p className="text-lg text-gray-400 mb-6">
                Heatmaps, statistiques avancées, et évolution dans le temps pour chaque joueur de votre effectif.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span className="text-gray-300">Heatmap de déplacements</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span className="text-gray-300">Timeline des actions</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span className="text-gray-300">Comparaison entre matchs</span>
                </li>
              </ul>
            </div>

            <div>
              <div className="relative rounded-xl overflow-hidden border-2 border-primary/30 shadow-2xl">
                {/* Heatmap Mock */}
                <div className="bg-gradient-to-br from-green-900/20 to-dark-card p-8 aspect-[3/4]">
                  <div className="bg-black/50 border border-primary/20 rounded-lg p-4 mb-4">
                    <div className="text-xs text-gray-500 uppercase mb-2">Joueur #7</div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <div className="text-2xl font-bold text-primary">12</div>
                        <div className="text-xs text-gray-400">Passes</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-primary">3</div>
                        <div className="text-xs text-gray-400">Tirs</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-primary">6.2</div>
                        <div className="text-xs text-gray-400">km</div>
                      </div>
                    </div>
                  </div>
                  {/* Simple field visualization */}
                  <div className="border-2 border-green-700/30 rounded-lg aspect-[2/3] relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      {/* Dots simulant heatmap */}
                      <div className="grid grid-cols-3 gap-8">
                        {[...Array(9)].map((_, i) => (
                          <div 
                            key={i} 
                            className="w-3 h-3 bg-primary rounded-full"
                            style={{ opacity: Math.random() * 0.5 + 0.3 }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 3: Tactical Board */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <div className="relative rounded-xl overflow-hidden border-2 border-primary/30 shadow-2xl">
                {/* Tactical board mock */}
                <div className="bg-gradient-to-b from-green-900/20 to-dark-card p-8 aspect-[3/4]">
                  <div className="bg-black/50 border border-primary/20 rounded-lg p-3 mb-4">
                    <div className="text-xs text-gray-400 uppercase mb-1">Formation</div>
                    <div className="text-lg font-bold text-primary">4-3-3</div>
                  </div>
                  <div className="border-2 border-green-700/30 rounded-lg aspect-[2/3] relative">
                    {/* Field with positioned players */}
                    <svg className="w-full h-full" viewBox="0 0 100 150">
                      <rect width="100" height="150" fill="none" stroke="#166534" strokeWidth="1" />
                      <line x1="0" y1="75" x2="100" y2="75" stroke="#166534" strokeWidth="1" />
                      {/* Player dots */}
                      {[
                        {x: 50, y: 140}, // GK
                        {x: 20, y: 110}, {x: 40, y: 115}, {x: 60, y: 115}, {x: 80, y: 110}, // DEF
                        {x: 30, y: 80}, {x: 50, y: 75}, {x: 70, y: 80}, // MID
                        {x: 20, y: 40}, {x: 50, y: 35}, {x: 80, y: 40} // ATT
                      ].map((pos, i) => (
                        <circle key={i} cx={pos.x} cy={pos.y} r="3" fill="#5EEAD4" />
                      ))}
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 md:order-2">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 rounded-full mb-6">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Compositions tactiques</span>
              </div>
              <h3 className="text-3xl md:text-4xl font-bold mb-4">
                Créez vos compositions
              </h3>
              <p className="text-lg text-gray-400 mb-6">
                Testez différentes formations tactiques et organisez votre effectif par catégorie. Titulaires et remplaçants en un clin d'œil.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span className="text-gray-300">6 formations disponibles</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span className="text-gray-300">Drag & drop joueurs</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span className="text-gray-300">Sauvegarde automatique</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Simple, rapide, efficace
            </h2>
            <p className="text-xl text-gray-400">En 3 étapes seulement</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Uploadez votre vidéo",
                description: "Déposez simplement votre vidéo de match depuis votre ordinateur ou smartphone."
              },
              {
                step: "02",
                title: "L'IA analyse automatiquement",
                description: "Notre intelligence artificielle détecte et analyse toutes les actions du match en moins de 24h."
              },
              {
                step: "03",
                title: "Recevez votre rapport",
                description: "Consultez vos stats, heatmaps et téléchargez votre rapport PDF professionnel."
              }
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="text-8xl font-bold text-primary/10 mb-4">{item.step}</div>
                <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                <p className="text-gray-400 leading-relaxed">{item.description}</p>
                
                {index < 2 && (
                  <ArrowRight className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 w-8 h-8 text-primary/30" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-black to-dark-card">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Choisissez votre plan
            </h2>
            <p className="text-xl text-gray-400">Aucun engagement, annulation à tout moment</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Plan Coach */}
            <div className="bg-dark-card border-2 border-dark-border rounded-2xl p-8 hover:border-primary/50 transition-all">
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">Coach</h3>
                <p className="text-gray-400">Pour les coachs individuels</p>
              </div>
              
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold">29€</span>
                  <span className="text-gray-400">/mois</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {[
                  "5 matchs analysés / mois",
                  "Stats collectives complètes",
                  "Stats individuelles joueurs",
                  "Rapports PDF",
                  "Heatmaps & zones",
                  "Support email"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <Link 
                to="/signup"
                className="block w-full py-4 text-center bg-dark-border hover:bg-primary hover:text-black font-bold rounded-lg transition-all"
              >
                Commencer
              </Link>
            </div>

            {/* Plan Club */}
            <div className="relative bg-gradient-to-b from-primary/10 to-dark-card border-2 border-primary rounded-2xl p-8">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-primary text-black text-sm font-bold rounded-full">
                POPULAIRE
              </div>

              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">Club</h3>
                <p className="text-gray-400">Pour les clubs multi-catégories</p>
              </div>
              
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold">89€</span>
                  <span className="text-gray-400">/mois</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {[
                  "15 matchs analysés / mois",
                  "Multi-catégories (N3, U19, U17...)",
                  "Gestion effectif illimitée",
                  "Comparaisons équipes",
                  "Dashboard club complet",
                  "Support prioritaire"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <Link 
                to="/signup"
                className="block w-full py-4 text-center bg-primary text-black font-bold rounded-lg hover:shadow-glow transition-all"
              >
                Commencer
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-2 border-primary/30 rounded-3xl p-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Prêt à transformer votre analyse vidéo ?
            </h2>
            <p className="text-xl text-gray-400 mb-8">
              Rejoignez les coachs qui utilisent déjà INSIGHTBALL
            </p>
            <Link 
              to="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-black font-bold text-lg rounded-lg hover:shadow-glow transition-all"
            >
              Essayer gratuitement
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="py-12 px-6 border-t border-dark-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { icon: <Shield className="w-8 h-8" />, text: "Paiement sécurisé" },
              { icon: <Clock className="w-8 h-8" />, text: "Support 24/7" },
              { icon: <CheckCircle className="w-8 h-8" />, text: "Satisfait ou remboursé" },
              { icon: <Users className="w-8 h-8" />, text: "100+ clubs" }
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-3 text-gray-400">
                {item.icon}
                <span className="text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer avec Contact */}
      <footer className="border-t border-dark-border bg-dark-card">
        <div className="max-w-7xl mx-auto px-6 py-16">
          {/* Contact Section */}
          <div className="grid md:grid-cols-2 gap-12 mb-16">
            {/* Email Direct */}
            <div>
              <h3 className="text-2xl font-bold mb-6">Nous contacter</h3>
              <a
                href="mailto:contact@insightball.com"
                className="flex items-center gap-4 p-6 bg-black border border-dark-border rounded-xl hover:border-primary/50 transition-all group"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-lg mb-1">Email direct</div>
                  <div className="text-primary">contact@insightball.com</div>
                </div>
                <ArrowRight className="w-5 h-5 ml-auto text-gray-600 group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </a>
            </div>

            {/* Contact Form */}
            <div>
              <h3 className="text-2xl font-bold mb-6">Envoyez-nous un message</h3>
              {sent ? (
                <div className="flex items-center gap-4 p-6 bg-green-500/10 border border-green-500/30 rounded-xl">
                  <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <Send className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <div className="font-semibold text-green-500 mb-1">Message envoyé !</div>
                    <div className="text-sm text-gray-400">Nous vous répondrons rapidement.</div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <input
                    type="text"
                    name="name"
                    value={contactForm.name}
                    onChange={handleContactChange}
                    placeholder="Votre nom"
                    className="w-full bg-black border border-dark-border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-primary focus:outline-none transition-colors"
                    required
                  />
                  <input
                    type="email"
                    name="email"
                    value={contactForm.email}
                    onChange={handleContactChange}
                    placeholder="votre@email.com"
                    className="w-full bg-black border border-dark-border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-primary focus:outline-none transition-colors"
                    required
                  />
                  <textarea
                    name="message"
                    value={contactForm.message}
                    onChange={handleContactChange}
                    rows={4}
                    placeholder="Votre message..."
                    className="w-full bg-black border border-dark-border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-primary focus:outline-none transition-colors resize-none"
                    required
                  />
                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full px-6 py-3 bg-primary text-black font-semibold rounded-lg hover:shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {sending ? (
                      <>
                        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                        Envoi...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Envoyer
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Made in Chocolatine */}
          <div className="text-center py-8 border-t border-dark-border">
            <p className="text-gray-400 flex items-center justify-center gap-2 text-lg">
              Made in <span className="text-primary font-semibold">Chocolatine</span> with <Heart className="w-5 h-5 text-primary fill-primary animate-pulse" />
            </p>
          </div>

          {/* Footer Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500 mt-8">
            <Link to="/demo" className="hover:text-primary transition-colors">Démo</Link>
            <Link to="/subscription/plans" className="hover:text-primary transition-colors">Tarifs</Link>
            <Link to="/login" className="hover:text-primary transition-colors">Connexion</Link>
          </div>

          {/* Copyright */}
          <div className="text-center mt-8 text-sm text-gray-600">
            Copyright © INSIGHTBALL 2026
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home
