import { useState } from 'react'
import { Filter, Search } from 'lucide-react'
import MatchCard from '../components/MatchCard'

function MatchList({ matches, onFilterChange }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')

  // Filter matches
  const filteredMatches = matches.filter(match => {
    const matchesSearch = match.opponent.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || match.category === selectedCategory
    const matchesStatus = selectedStatus === 'all' || match.status === selectedStatus
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Rechercher un adversaire..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-dark-card border border-dark-border rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:border-primary focus:outline-none transition-colors"
          />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-dark-card border border-dark-border rounded-lg pl-12 pr-8 py-3 text-white focus:border-primary focus:outline-none transition-colors appearance-none min-w-[180px]"
          >
            <option value="all">Toutes catégories</option>
            <option value="N3">N3</option>
            <option value="U19">U19 Nationaux</option>
            <option value="U17">U17 Nationaux</option>
            <option value="U15">U15</option>
            <option value="Seniors">Seniors</option>
          </select>
        </div>

        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="bg-dark-card border border-dark-border rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none transition-colors appearance-none min-w-[160px]"
        >
          <option value="all">Tous les statuts</option>
          <option value="completed">Terminés</option>
          <option value="processing">En cours</option>
          <option value="pending">En attente</option>
          <option value="error">Erreurs</option>
        </select>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">
          {filteredMatches.length} {filteredMatches.length > 1 ? 'matchs trouvés' : 'match trouvé'}
        </p>
      </div>

      {/* Match Cards */}
      {filteredMatches.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-6">
          {filteredMatches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-dark-card border border-dark-border rounded-lg">
          <div className="w-16 h-16 mx-auto mb-4 bg-dark-border rounded-full flex items-center justify-center">
            <Search className="w-8 h-8 text-gray-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-300 mb-2">Aucun match trouvé</h3>
          <p className="text-gray-500">Essayez de modifier vos filtres de recherche</p>
        </div>
      )}
    </div>
  )
}

export default MatchList
