import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  INSIGHTBALL
                </h1>
                <p className="text-xl text-gray-600 mb-8">
                  Analyse vidéo IA pour clubs de football
                </p>
                <div className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold">
                  ✅ Frontend configuré avec succès !
                </div>
              </div>
            </div>
          } />
        </Routes>
      </div>
    </Router>
  )
}

export default App
