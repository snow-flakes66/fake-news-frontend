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
      const res = await fetch("http://127.0.0.1:5000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, url }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError("Could not reach the backend. Is app.py running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Fake News Detector</h1>
      <p className="subtitle">Paste an article's text and (optionally) its URL</p>

      <textarea
        placeholder="Paste article text here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={8}
      />

      <input
        type="text"
        placeholder="Article URL (optional)"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />

      <button onClick={handleAnalyze} disabled={loading}>
        {loading ? "Analyzing..." : "Analyze"}
      </button>

      {error && <p className="error">{error}</p>}

      {result && (
        <div className="result">
          <h2>
            Verdict:{" "}
            <span className={result.ml_prediction === "Fake" ? "fake" : "real"}>
              {result.ml_prediction}
            </span>
          </h2>
          <p>Confidence: {result.ml_confidence}%</p>

          {result.url_analysis && (
            <div className="url-analysis">
              <h3>URL Trust Score: {result.url_analysis.score}/100</h3>
              {result.url_analysis.flags.length > 0 ? (
                <ul>
                  {result.url_analysis.flags.map((flag, i) => (
                    <li key={i}>{flag}</li>
                  ))}
                </ul>
              ) : (
                <p>No red flags detected.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;