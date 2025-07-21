import React, { useState, useRef, useEffect } from "react";
import "./Affirmations.css";

const MOTIVATIONAL_QUOTES = [
  "You are stronger than you think.",
  "Believe in yourself and all that you are.",
  "Every day is a fresh start.",
  "You are worthy of love and respect.",
  "Progress, not perfection."
];

const PREBUILT_AFFIRMATIONS = [
  "I am calm and centered.",
  "I am worthy of good things.",
  "I choose to focus on the present.",
  "I am growing stronger every day.",
  "I radiate positivity and kindness."
];

const STICKERS = [
  "•", "🌈", "💪", "🌟", "✨", "💖", "😊", "🌸", "🙌"
];

const API_URL = "http://localhost:5000/api/affirmation";

function getLocalDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const Affirmations = () => {
  const [text, setText] = useState("");
  const [date, setDate] = useState(() => getLocalDateString(new Date()));
  const [datesWithAffirmations, setDatesWithAffirmations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const textareaRef = useRef();

  // Load affirmation for selected date
  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}?date=${date}&user_id=default`)
      .then(res => res.json())
      .then(data => setText(data.text || ""))
      .finally(() => setLoading(false));
  }, [date]);

  // Load all dates with affirmations
  useEffect(() => {
    fetch(`${API_URL}/dates?user_id=default`)
      .then(res => res.json())
      .then(data => setDatesWithAffirmations(data));
  }, [text]);

  // Insert text at cursor position in textarea
  const insertAtCursor = (insertText) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = text.slice(0, start);
    const after = text.slice(end);
    setText(before + insertText + after);
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + insertText.length;
    }, 0);
  };

  const handleSave = async () => {
    setSaveMsg("Saving...");
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: "default", date, text })
    });
    if (res.ok) {
      setSaveMsg("Saved!");
      // Refresh dates with affirmations
      fetch(`${API_URL}/dates?user_id=default`)
        .then(res => res.json())
        .then(data => setDatesWithAffirmations(data));
    } else {
      setSaveMsg("Save failed");
    }
    setTimeout(() => setSaveMsg(""), 1200);
  };

  const handleDateChange = (e) => {
    setDate(e.target.value);
  };

  return (
    <div className="affirmations-bg">
      <div className="affirmations-header">
        <span className="affirmations-emoji">😊</span>
        <span className="affirmations-title">Affirmations</span>
      </div>
      <div className="affirmations-subtitle">Surround yourself with positivity.</div>
      <div className="affirmations-main-cards">
        <div className="affirmations-card affirmations-left-card">
          <div className="affirmations-section-title" style={{color:'#e64980'}}>Motivational Quotes</div>
          <ul className="affirmations-motivation-list">
            {MOTIVATIONAL_QUOTES.map((q, i) => (
              <li key={i}>• {q}</li>
            ))}
          </ul>
          <div className="affirmations-section-title" style={{marginTop:32, color:'#d6336c'}}>Choose from Prebuilt</div>
          <ul className="affirmations-prebuilt-list">
            {PREBUILT_AFFIRMATIONS.map((a, i) => (
              <li key={i}>
                <button className="affirmations-prebuilt-btn" onClick={() => insertAtCursor(a)} title="Add to writing space">➕</button>
                <span className="affirmations-prebuilt-text" onClick={() => insertAtCursor(a)} tabIndex={0} role="button" aria-label="Add affirmation" onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && insertAtCursor(a)}>{a}</span>
              </li>
            ))}
          </ul>
          <div className="affirmations-section-title" style={{marginTop:32, color:'#b197fc'}}>Past Affirmation Dates</div>
          <div className="affirmations-history-list">
            {datesWithAffirmations.length === 0 && <div className="affirmations-history-empty">No saved affirmations yet.</div>}
            {datesWithAffirmations.map(d => (
              <button
                key={d}
                className={`affirmations-history-btn${d === date ? ' selected' : ''}`}
                onClick={() => setDate(d)}
                title={`View affirmation for ${d}`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
        <div className="affirmations-card affirmations-right-card">
          <div className="affirmations-section-title" style={{color:'#e64980', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
            <span>Write Your Affirmations</span>
            <span className="affirmations-date-picker">
              <span role="img" aria-label="calendar" style={{marginRight:4}}>📅</span>
              <input type="date" value={date} onChange={handleDateChange} className="affirmations-date-input" />
            </span>
          </div>
          <textarea
            ref={textareaRef}
            className="affirmations-textarea"
            placeholder="Type your affirmations here..."
            value={loading ? "" : text}
            onChange={e => setText(e.target.value)}
            rows={10}
            disabled={loading}
          />
          <div className="affirmations-stickers-row">
            <span className="affirmations-section-title" style={{color:'#e64980', fontSize:'1.05em'}}>Add Stickers & Bullets</span>
            <span className="affirmations-stickers-list">
              {STICKERS.map((s, i) => (
                <button key={i} className={`affirmations-sticker-btn${i === 0 ? ' bullet' : ''}`} onClick={() => insertAtCursor(s)} title="Add sticker or bullet">{s}</button>
              ))}
            </span>
          </div>
          <button className="affirmations-save-btn" onClick={handleSave} disabled={loading}>{saveMsg || "Save Affirmation"}</button>
        </div>
      </div>
    </div>
  );
};

export default Affirmations; 