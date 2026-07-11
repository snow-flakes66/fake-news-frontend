import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [displayedConfidence, setDisplayedConfidence] = useState(0);
  const [displayedUrlScore, setDisplayedUrlScore] = useState(0);
  const [headlineText, setHeadlineText] = useState("");

  const fullHeadline = "Is it news, or is it noise?";

  useEffect(function () {
    let i = 0;
    const interval = setInterval(function () {
      setHeadlineText(fullHeadline.slice(0, i + 1));
      i++;
      if (i >= fullHeadline.length) {
        clearInterval(interval);
      }
    }, 35);
    return function () {
      clearInterval(interval);
    };
  }, []);

  useEffect(
    function () {
      if (!result) {
        setDisplayedConfidence(0);
        return;
      }
      let current = 0;
      const target = result.ml_confidence;
      const interval = setInterval(function () {
        current += target / 30;
        if (current >= target) {
          current = target;
          clearInterval(interval);
        }
        setDisplayedConfidence(current);
      }, 20);
      return function () {
        clearInterval(interval);
      };
    },
    [result]
  );

  useEffect(
    function () {
      if (!result || !result.url_analysis) {
        setDisplayedUrlScore(0);
        return;
      }
      let current = 0;
      const target = result.url_analysis.score;
      const interval = setInterval(function () {
        current += target / 30;
        if (current >= target) {
          current = target;
          clearInterval(interval);
        }
        setDisplayedUrlScore(current);
      }, 20);
      return function () {
        clearInterval(interval);
      };
    },
    [result]
  );

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
        body: JSON.stringify({ text: text, url: url }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError("Could not reach the backend. It may be waking up, try again in a few seconds.");
    } finally {
      setLoading(false);
    }
  };

  const isFake = result && result.ml_prediction === "Fake";
  const verdictClass = isFake ? "fake" : "real";

  return (
    <div className="page">
      <div className="newsprint-bg"></div>

      <header className="masthead">
        <div className="masthead-inner">
          <span className="issue-label">📰 Est. 2026 &mdash; Vol. 1</span>
          <h1 className="wordmark">The Verifier</h1>
          <span className="issue-label">🔍 A Credibility Review</span>
        </div>
        <div className="rule"></div>
      </header>

      <main className="container">
        <section className="intro">
          <h2 className="headline">{headlineText}<span className="cursor">|</span></h2>
          <p className="dek">
            Submit an article and its source. Our analysis engine examines language patterns
            and domain credibility to render a verdict.
          </p>
        </section>

        <section className="submission">
          <label className="field-label">✏️ Article Text</label>
          <textarea
            placeholder="Paste the full article text here..."
            value={text}
            onChange={function (e) { setText(e.target.value); }}
            rows={8}
          />

          <label className="field-label">🔗 Source URL (optional)</label>
          <div className="input-row">
            <input
              type="text"
              placeholder="https://..."
              value={url}
              onChange={function (e) { setUrl(e.target.value); }}
            />
            <button onClick={handleAnalyze} disabled={loading} className={loading ? "pressing" : ""}>
              {loading ? (
                <span className="press-loading">
                  <span className="press-dot"></span>
                  <span className="press-dot"></span>
                  <span className="press-dot"></span>
                  Printing verdict
                </span>
              ) : (
                "Submit for Review"
              )}
            </button>
          </div>

          {error ? <p className="error">{error}</p> : null}
        </section>

        {result ? (
          <section className="verdict-section fade-in">
            <div className="rule thin"></div>
            <div className="verdict-header">
              <span className="field-label">
                {isFake ? "🚩 The Verdict" : "✅ The Verdict"}
              </span>
              <h3 className={"verdict-headline " + verdictClass}>
                {isFake ? "Fabricated" : "Credible"}
              </h3>
              <p className="verdict-sub">
                Our model is {displayedConfidence.toFixed(2)}% confident in this assessment.
              </p>
            </div>

            {result.url_analysis ? (
              <div className="dossier">
                <div className="dossier-header">
                  <span className="field-label">🗂️ Source Dossier</span>
                  <span className="dossier-score">{Math.round(displayedUrlScore)} / 100</span>
                </div>
                {result.url_analysis.flags.length > 0 ? (
                  <ul className="flags">
                    {result.url_analysis.flags.map(function (flag, i) {
                      return <li key={i}>⚠️ {flag}</li>;
                    })}
                  </ul>
                ) : (
                  <p className="clean">✓ No irregularities found in the source domain.</p>
                )}
              </div>
            ) : null}
          </section>
        ) : null}
      </main>

      <footer className="colophon">
        <div className="rule thin"></div>
        <p>📡 Analysis by TF-IDF + Logistic Regression, cross-referenced with domain heuristics.</p>
        <p className="disclaimer">
          Note: The model is trained on a static dataset and may be less reliable on very recent events, non-political topics, or non-US news sources. Source credibility checks remain independent of this limitation.
        </p>
      </footer>
    </div>
  );
}

export default App;