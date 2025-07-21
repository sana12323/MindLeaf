import React, { useState } from "react";
import "./MoodTracker.css";

const MOODS = [
  { emoji: "😄", label: "Happy", color: "#ffe066" },
  { emoji: "🙂", label: "Content", color: "#b5ead7" },
  { emoji: "😐", label: "Neutral", color: "#bdbdbd" },
  { emoji: "😔", label: "Sad", color: "#a0c4ff" },
  { emoji: "😢", label: "Crying", color: "#b2a4ff" },
  { emoji: "😡", label: "Angry", color: "#ffb4a2" },
  { emoji: "😱", label: "Anxious", color: "#ffd6e0" },
  { emoji: "🥰", label: "Loved", color: "#ffd6ec" },
];

function getLocalDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const MoodTracker = () => {
  const [selectedMood, setSelectedMood] = useState(null);
  const [note, setNote] = useState("");
  const [moodHistory, setMoodHistory] = useState([]);
  const [saved, setSaved] = useState(false);
  const today = getLocalDateString(new Date());

  const handleSelectMood = (mood) => {
    setSelectedMood(mood);
    setSaved(false);
  };

  const handleSave = () => {
    if (!selectedMood) return;
    setMoodHistory([
      { date: today, mood: selectedMood, note },
      ...moodHistory.filter((m) => m.date !== today), // Only one per day
    ]);
    setSaved(true);
    setNote("");
  };

  return (
    <div className="mood-bg-gradient">
      <div className="mood-header">
        <span className="mood-header-emoji">🌈</span>
        <span className="mood-header-title">Mood Tracker</span>
      </div>
      <div className="mood-header-desc">How are you feeling today?</div>
      <div className="mood-main-card">
        <div className="mood-today-row">
          <span className="mood-today-date">{today}</span>
          <span className="mood-greeting">Hi there! Let's check in with yourself.</span>
        </div>
        <div className="mood-emoji-row">
          {MOODS.map((m) => (
            <button
              key={m.label}
              className={`mood-emoji-btn${selectedMood && selectedMood.label === m.label ? " selected" : ""}`}
              style={{ background: m.color }}
              onClick={() => handleSelectMood(m)}
              aria-label={m.label}
            >
              <span className="mood-emoji">{m.emoji}</span>
              <span className="mood-emoji-label">{m.label}</span>
            </button>
          ))}
        </div>
        {selectedMood && (
          <div className="mood-note-section">
            <div className="mood-note-label">Want to add a note?</div>
            <textarea
              className="mood-note-input"
              placeholder="Write a few words about your mood..."
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={3}
            />
            <button className="mood-save-btn" onClick={handleSave} disabled={saved}>
              {saved ? "Saved!" : "Save Mood"}
            </button>
          </div>
        )}
      </div>
      <div className="mood-history-title">Recent Mood Check-ins</div>
      <div className="mood-history-list">
        {moodHistory.length === 0 && <div className="mood-history-empty">No moods tracked yet. Your recent moods will appear here!</div>}
        {moodHistory.map((entry, i) => (
          <div className="mood-history-card" key={entry.date} style={{ borderLeft: `6px solid ${entry.mood.color}` }}>
            <div className="mood-history-row">
              <span className="mood-history-emoji">{entry.mood.emoji}</span>
              <span className="mood-history-label">{entry.mood.label}</span>
              <span className="mood-history-date">{entry.date}</span>
            </div>
            {entry.note && <div className="mood-history-note">{entry.note}</div>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MoodTracker; 