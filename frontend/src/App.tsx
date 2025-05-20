import './App.css'
import Analyzer from './components/Analyzer'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Analizarea știrilor în limba română utilizând Inteligența Artificială</h1>
      </header>
      <main>
        <Analyzer />
      </main>
    </div>
  )
}

export default App
