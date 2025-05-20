// src/components/Analyzer.tsx
import React, { useState } from "react";
import { submitURL } from "../api";
import { getPredictionLabel } from "../utils";
import "./Analyzer.css";

const Analyzer: React.FC = () => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!url.trim()) {
      setError("Vă rugăm să introduceți un URL");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await submitURL(url);
      setResult(response.data);
    } catch (err) {
      console.error(err);
      setError("Eroare la analizarea URL-ului. Vă rugăm să verificați dacă URL-ul este valid și încercați din nou.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="analyzer-container">
      <div className="instruction-text">
        Atașați mai jos link-ul articolului ce urmează să fie analizat:
      </div>
      <div className="input-group">
        <input
          type="text"
          value={url}
          placeholder="Introduceți URL-ul articolului"
          onChange={(e) => setUrl(e.target.value)}
          className="url-input"
        />
        <button onClick={handleSubmit} disabled={loading} className="submit-button">
          {loading ? "Se analizează..." : "Analizează"}
        </button>
      </div>

      {error && <p className="error-message">{error}</p>}

      {result && (
        <div className="results-container">
          <div className="prediction-results">
            <div className="prediction-card">
              <h4>Support Vector Machine</h4>
              <div className={`prediction-label ${getPredictionLabel(result.svm_prediction).toLowerCase()}`}>
                {getPredictionLabel(result.svm_prediction)}
              </div>
            </div>
            <div className="prediction-card">
              <h4>Naive Bayes</h4>
              <div className={`prediction-label ${getPredictionLabel(result.nb_prediction).toLowerCase()}`}>
                {getPredictionLabel(result.nb_prediction)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analyzer;
