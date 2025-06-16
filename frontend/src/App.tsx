import { useState } from 'react';
import axios from 'axios';
import './App.css';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// --- INTERFATA PENTRU REZULTATUL PREDICTIEI ---
interface PredictionResult {
  svm_prediction: string;
  nb_prediction: string;
  bert_prediction: string;
  bert_probabilities: { [label: string]: number };
  content: string;
}

const localizeLabel = (label: string) => {
  switch (label.toLowerCase()) {
    case 'real_news': return 'Știre reală';
    case 'fake_news': return 'Știre falsă';
    case 'misinformation': return 'Dezinformare';
    case 'propaganda': return 'Propagandă';
    case 'satire': return 'Satiră';
    default: return 'Necunoscută';
  }
};


export default function App() {
  const [url, setUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getLabelClass = (prediction: string): string => {
    const label = prediction?.toLowerCase() || 'necunoscut';
    if (['real_news', 'fake_news','misinformation','propaganda', 'satire'].includes(label)) {
      return `label-${label}`;
    }
    return 'label-necunoscut';
  };

  const handleSubmit = async () => {
    if (!url.trim()) {
      setError("Vă rugăm să introduceți un URL valid.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await axios.post("http://127.0.0.1:8000/submit-url", { url });
      if (response.data && response.data.data) {
        setResult(response.data.data);
      } else {
        throw new Error("Răspunsul de la server are un format neașteptat.");
      }
    } catch (err: any) {
      console.error(err);
      const serverError = err.response?.data?.error;
      setError(serverError || err.message || "A apărut o eroare necunoscută.");
    } finally {
      setLoading(false);
    }
  };

  const renderBertChart = () => {
    if (!result) return null;
    const labels = Object.keys(result.bert_probabilities).map(localizeLabel);
    const data = Object.values(result.bert_probabilities).map(p => +(p * 100).toFixed(2));

    return (
      <div className="bert-chart-container">
        <Bar
          data={{
            labels,
            datasets: [
              {
                label: 'Probabilitate (%)',
                data,
                backgroundColor: [
                  '#f45353', // stire falsa
                  '#e8855b', // dezinformare
                  '#ecd977', // propaganda
                  '#7cf170', // stire reala
                  '#8f61ec'  // satirA
                ],
                borderRadius: 8
              }
            ]
          }}
          options={{
            responsive: true,
            animation: {
              duration: 1000,
              easing: 'easeOutQuart'
            },
            plugins: {
              legend: { display: false },
              title: { display: true, text: 'Distribuția predicțiilor BERT' }
            },
            scales: {
              y: { beginAtZero: true, max: 100 }
            }
          }}
        />
      </div>
    );
  };

  return (
    <>
      <div className="app">
        <header className="app-header">
          <h1>Analizarea știrilor în limba română utilizând Inteligența Artificială</h1>
        </header>
        <main>
          <div className="analyzer-container">
            <div className="instruction-text">
              Atașați mai jos link-ul articolului ce urmează să fie analizat:
            </div>
            <div className="input-group">
              <input
                type="text"
                value={url}
                placeholder="https://exemplu.ro/articol..."
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                className="url-input"
              />
              <button onClick={handleSubmit} disabled={loading} className="submit-button">
                {loading ? "Se analizează..." : "Analizează"}
              </button>
            </div>

            {loading && <p className="loading-message">Se încarcă rezultatele...</p>}
            {error && <p className="error-message">{error}</p>}

            {result && (
              <div className="results-container">
                <div className="prediction-results">
                  <div className="prediction-card fade-in">
                    <h4>Support Vector Machine</h4>
                    <div className={`prediction-label ${getLabelClass(result.svm_prediction)}`}>
                      {localizeLabel(result.svm_prediction) || 'Necunoscută'}
                    </div>
                  </div>
                  <div className="prediction-card fade-in">
                    <h4>Naive Bayes</h4>
                    <div className={`prediction-label ${getLabelClass(result.nb_prediction)}`}>
                      {localizeLabel(result.nb_prediction) || 'Necunoscută'}
                    </div>
                  </div>
                  <div className="prediction-card fade-in">
                    <h4>BERT</h4>
                    <div className={`prediction-label ${getLabelClass(result.bert_prediction)}`}>
                      {localizeLabel(result.bert_prediction) || 'Necunoscută'}
                    </div>
                    {renderBertChart()}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
