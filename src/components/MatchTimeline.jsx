import { Target, AlertCircle, ArrowRightLeft, Activity } from 'lucide-react'

function MatchTimeline({ events }) {
  // events = [{time: 15, type: 'goal', player: 'Mbappé', description: 'But'}]
  
  const getEventIcon = (type) => {
    switch (type) {
      case 'goal':
        return <Target className="w-4 h-4 text-green-500" />
      case 'card_yellow':
      case 'card_red':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
      case 'substitution':
        return <ArrowRightLeft className="w-4 h-4 text-blue-500" />
      default:
        return <Activity className="w-4 h-4 text-gray-500" />
    }
  }

  const getEventColor = (type) => {
    switch (type) {
      case 'goal':
        return 'border-green-500 bg-green-500/10'
      case 'card_yellow':
        return 'border-yellow-500 bg-yellow-500/10'
      case 'card_red':
        return 'border-red-500 bg-red-500/10'
      case 'substitution':
        return 'border-blue-500 bg-blue-500/10'
      default:
        return 'border-dark-border bg-dark-card'
    }
  }

  if (!events || events.length === 0) {
    return (
      <div className="bg-dark-card border border-dark-border rounded-lg p-8 text-center">
        <Activity className="w-12 h-12 mx-auto mb-3 text-gray-600" />
        <p className="text-gray-400">Aucun événement enregistré</p>
      </div>
    )
  }

  return (
    <div className="bg-dark-card border border-dark-border rounded-lg p-6">
      <h3 className="font-semibold mb-4">Timeline du match</h3>
      
      <div className="space-y-3">
        {events.map((event, index) => (
          <div 
            key={index}
            className={`flex items-start gap-4 p-4 border rounded-lg ${getEventColor(event.type)}`}
          >
            {/* Time */}
            <div className="flex-shrink-0 text-center">
              <div className="text-lg font-bold text-white">{event.time}'</div>
            </div>

            {/* Icon */}
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center">
              {getEventIcon(event.type)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="font-medium text-white mb-1">{event.player}</div>
              <div className="text-sm text-gray-400">{event.description}</div>
            </div>

            {/* Half indicator */}
            {event.half && (
              <div className="flex-shrink-0 px-2 py-1 bg-black/50 rounded text-xs text-gray-400">
                {event.half === 1 ? '1ère MT' : '2ème MT'}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default MatchTimeline
