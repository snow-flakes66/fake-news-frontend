import { useState } from "react";
import "./App.css";

function App() {
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    if (!text.trim()) {
      setError("Please paste some article text first.");
      return;
    }
    setError("");
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("https://fake-news-detector-4bqv.onrender.com/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, url }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError("Could not reach the backend. It may be waking up — try again in a few seconds.");
    } finally {
      setLoading(false);
    }
  };

  const isFake = result?.ml_prediction === "Fake";

  return (
    <div className="page">
      <div className="glow glow-1"></div>
      <div className="glow glow-2"></div>

      <div className="container">
        <div className="header">
          <div className="badge">AI + Security Analysis</div>
          <h1>Fake News Detector</h1>
          <p className="subtitle">
            Paste an article's text and, optionally, its source URL to get an instant credibility check.
          </p>
        </div>

        <div className="card">
          <textarea
            placeholder="Paste the full article text here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={7}
          />

          <div className="input-row">
            <input
              type="text"
              placeholder="Source URL (optional)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <button onClick={handleAnalyze} disabled={loading}>
              {loading ? (
                <span className="spinner"></span>
              ) : (
                "Analyze"
              )}
            </button>
          </div>

          {error && <p className="error">{error}</p>}
        </div>

        {result && (
          <div className="card result-card fade-in">
            <div className="verdict-row">
              <div className={verdict-badge ${isFake ? "fake" : "real"}}>
                {isFake ? "⚠️ Likely Fake" : "✓ Likely Real"}
              </div>
              <div className="confidence">{result.ml_confidence}% confidence</div>
            </div>

            <div className="meter">
              <div
                className={meter-fill ${isFake ? "fake" : "real"}}
                style={{ width: ${result.ml_confidence}% }}
              ></div>
            </div>

            {result.url_analysis && (
              <div className="url-section">
                <div className="url-header">
                  <span>Source Trust Score</span>
                  <span className="url-score">{result.url_analysis.score}/100</span>
                </div>
                <div className="meter">
                  <div
                    className="meter-fill url"
                    style={{ width: ${result.url_analysis.score}% }}
                  ></div>
                </div>
                {result.url_analysis.flags.length > 0 ? (
                  <ul className="flags">
                    {result.url_analysis.flags.map((flag, i) => (
                      <li key={i}>{flag}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="clean">No red flags detected on this source.</p>
                )}
              </div>
            )}
          </div>
        )}

        <p className="footer">Built with a TF-IDF + Logistic Regression model and URL heuristics</p>
      </div>
    </div>
  );
}

export default App;