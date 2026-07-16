import { useState, useEffect } from "react";
import "./App.css";

const EXAMPLES = [
  {
    label: "Real headline",
    text: "The Reserve Bank of India's monetary policy committee voted unanimously to keep the repo rate unchanged, citing stable inflation trends and the need to support continued economic growth.",
    url: "https://thehindu.com",
  },
  {
    label: "Fake headline",
    text: "SHOCKING: Scientists confirm that drinking hot water with lemon every morning cures cancer completely, doctors don't want you to know this simple trick that Big Pharma is hiding.",
    url: "https://healthnewsdaily24.xyz",
  },
];

function App() {
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [displayedConfidence, setDisplayedConfidence] = useState(0);
  const [displayedUrlScore, setDisplayedUrlScore] = useState(0);
  const [headlineText, setHeadlineText] = useState("");
  const [history, setHistory] = useState([]);

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

      const entry = {
        snippet: text.slice(0, 60) + (text.length > 60 ? "..." : ""),
        verdict: data.ml_prediction,
        confidence: data.ml_confidence,
      };
      setHistory(function (prev) {
        const updated = [entry, ...prev];
        return updated.slice(0, 4);
      });
    } catch (err) {
      setError("Could not reach the backend. It may be waking up, try again in a few seconds.");
    } finally {
      setLoading(false);
    }
  };

  const loadExample = function (example) {
    setText(example.text);
    setUrl(example.url);
    setResult(null);
    setError("");
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

        <section className="how-it-works">
          <div className="rule thin"></div>
          <span className="field-label">🧭 How It Works</span>
          <div className="hiw-grid">
            <div className="hiw-item">
              <span className="hiw-number">1</span>
              <p><strong>Text Analysis</strong> — a Logistic Regression model trained on 72,000+ articles scores the language patterns in your submission.</p>
            </div>
            <div className="hiw-item">
              <span className="hiw-number">2</span>
              <p><strong>Source Check</strong> — the URL is independently checked for HTTPS, domain age, TLD reputation, and structure red flags.</p>
            </div>
            <div className="hiw-item">
              <span className="hiw-number">3</span>
              <p><strong>Combined Verdict</strong> — both signals are shown separately, so you see not just the answer but the reasoning behind it.</p>
            </div>
          </div>
        </section>

        <section className="submission">
          <label className="field-label">✏️ Article Text</label>
          <textarea
            placeholder="Paste the full article text here..."
            value={text}
            onChange={function (e) { setText(e.target.value); }}
            rows={8}
          />

          <div className="examples-row">
            <span className="try-label">Try:</span>
            {EXAMPLES.map(function (ex, i) {
              return (
                <button key={i} className="example-btn" onClick={function () { loadExample(ex); }}>
                  {ex.label}
                </button>
              );
            })}
          </div>

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
                Our model is {displayedConfidence.toFixed(2)}% confident in this assessment,
                based on {result.word_count} words analyzed.
              </p>
            </div>

            {result.top_words && result.top_words.length > 0 ? (
              <div className="word-influence">
                <span className="field-label">🔬 Most Influential Words</span>
                <div className="word-chips">
                  {result.top_words.map(function (w, i) {
                    return (
                      <span key={i} className={"chip " + (w.leans_fake ? "chip-fake" : "chip-real")}>
                        {w.word}
                      </span>
                    );
                  })}
                </div>
              </div>
            ) : null}

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

        {history.length > 0 ? (
          <section className="history-section">
            <div className="rule thin"></div>
            <span className="field-label">🕘 Recent Checks This Session</span>
            <div className="history-list">
              {history.map(function (h, i) {
                return (
                  <div key={i} className="history-item">
                    <span className={"history-badge " + (h.verdict === "Fake" ? "fake" : "real")}>
                      {h.verdict}
                    </span>
                    <span className="history-snippet">{h.snippet}</span>
                    <span className="history-confidence">{h.confidence}%</span>
                  </div>
                );
              })}
            </div>
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