import { useState } from "react";
import axios from "axios"; // Using axios for straightforward API calls

// This single component contains all the necessary logic, styles, and functions.

// Helper function that would normally be in `utils.ts`
// Updated to be more robust against unexpected data types from the backend.
const getPredictionLabel = (prediction: string | number | undefined): string => {
  // Handle cases where the prediction is null, undefined, or not a recognized string.
  if (prediction === undefined || prediction === null) {
    return "NECUNOSCUT";
  }

  // If the backend sends a number instead of a string label, we can't know
  // the category, so we treat it as unknown to prevent a crash.
  if (typeof prediction === 'number') {
      return "NECUNOSCUT";
  }

  // Defensively convert to string to safely call .toLowerCase()
  const predictionString = String(prediction);

  switch (predictionString.toLowerCase()) {
    case 'real':
      return 'REAL';
    case 'fake':
      return 'FAKE';
    case 'satira':
      return 'SATIRĂ';
    // If the backend sends a string that is not recognized, treat it as unknown.
    default:
      return "NECUNOSCUT";
  }
};

// API call function that would normally be in `api.ts`
const submitURL = async (url: string) => {
  // Replace with your actual backend URL if it's different
  const backendUrl = "http://127.0.0.1:8000/submit-url";
  try {
    const response = await axios.post(backendUrl, { url });
    return response.data; // Axios automatically wraps the response in a `data` object
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      // If the backend sent a specific error message, use it
      throw new Error(error.response.data.error || "A backend error occurred.");
    }
    // For network errors or other issues
    throw new Error("Cannot connect to the analysis server.");
  }
};

// Styles that would normally be in `Analyzer.css`
const styles = `
  .analyzer-container {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    max-width: 800px;
    margin: 40px auto;
    padding: 24px;
    background-color: #ffffff;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    border: 1px solid #e2e8f0;
  }

  .instruction-text {
    font-size: 1.1rem;
    color: #4a5568;
    margin-bottom: 20px;
    text-align: center;
  }

  .input-group {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;
  }

  .url-input {
    flex-grow: 1;
    padding: 12px 16px;
    font-size: 1rem;
    border-radius: 8px;
    border: 1px solid #cbd5e0;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .url-input:focus {
    outline: none;
    border-color: #4299e1;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.5);
  }

  .submit-button {
    padding: 12px 24px;
    font-size: 1rem;
    font-weight: 600;
    color: white;
    background-color: #3182ce;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .submit-button:hover:not(:disabled) {
    background-color: #2b6cb0;
  }

  .submit-button:disabled {
    background-color: #a0aec0;
    cursor: not-allowed;
  }

  .error-message {
    color: #e53e3e;
    background-color: #fed7d7;
    padding: 12px;
    border-radius: 8px;
    text-align: center;
    margin-top: 16px;
  }

  .results-container {
    margin-top: 24px;
    border-top: 1px solid #e2e8f0;
    padding-top: 24px;
  }

  .prediction-results {
    display: flex;
    justify-content: space-around;
    gap: 20px;
  }

  .prediction-card {
    flex-basis: 45%;
    padding: 20px;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    text-align: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }
  
  .prediction-card h4 {
    margin-top: 0;
    margin-bottom: 16px;
    color: #2d3748;
    font-size: 1.2rem;
  }

  .prediction-label {
    font-size: 1.5rem;
    font-weight: 700;
    padding: 8px 16px;
    border-radius: 8px;
    color: white;
  }

  .prediction-label.real { background-color: #38a169; }
  .prediction-label.fake { background-color: #e53e3e; }
  .prediction-label.satiră { background-color: #dd6b20; }
  .prediction-label.necunoscut { background-color: #718096; }
`;

export default function App() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  // Updated interface to allow for number type in predictions, making it more robust.
  interface PredictionResult {
    svm_prediction: string | number;
    nb_prediction: string | number;
    content: string;
  }
  const [result, setResult] = useState<PredictionResult | null>(null);
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
      // The API function now returns the inner data object directly
      const responseData = await submitURL(url);
      setResult(responseData.data);
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "A aparut o eroare necunoscuta.";
      setError(`Eroare la analizarea URL-ului: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
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
    </>
  );
};
