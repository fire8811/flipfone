import { useState } from 'react'
import './App.css'
import { Demo } from './demo/demo'

function App() {
  const [page, setPage] = useState<'home' | 'demo' | 'game'>('home')

  return (
    <div className="App">
      <nav style={{ display: 'flex', gap: '1rem', padding: '1rem', borderBottom: '1px solid #ccc' }}>
        <button onClick={() => setPage('demo')}>Demo</button>
        <button onClick={() => setPage('game')}>Game</button>
      </nav>

      {page === 'demo' && <Demo />}
      {page === 'game' && <p>Game coming soon...</p>}
      {page === 'home' && <p>Select a page above.</p>}
    </div>
  )
}

export default App