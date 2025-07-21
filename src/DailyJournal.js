import React, { useState, useRef, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import './DailyJournal.css';

function getTodayISO() {
  return new Date().toISOString().slice(0, 10);
}
function getPrettyDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

const STICKERS = [
  '🌸', '🌿', '🌻', '✨', '🍀', '🦋', '🌼', '💖', '🌙', '🍃'
];

const defaultStickerSize = { width: 60, height: 60 };
const defaultImageSize = { width: 120, height: 120 };
const minStickerSize = { width: 36, height: 36 };
const maxStickerSize = { width: 200, height: 200 };
const minImageSize = { width: 60, height: 60 };
const maxImageSize = { width: 600, height: 600 };

const API_URL = 'http://localhost:5000/api/journal';

const DailyJournal = () => {
  const [date, setDate] = useState(getTodayISO());
  const [stickers, setStickers] = useState([]);
  const [images, setImages] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const fileInputRef = useRef();
  const notepadRef = useRef();

  // Load journal entry for selected date
  useEffect(() => {
    loadJournal(date);
    // eslint-disable-next-line
  }, [date]);

  const loadJournal = async (dateToLoad) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}?date=${dateToLoad}&user_id=default`);
      if (res.ok) {
        const data = await res.json();
        if (data) {
          if (notepadRef.current) notepadRef.current.innerHTML = data.text || '';
          setStickers(data.stickers || []);
          setImages(data.images || []);
        } else {
          if (notepadRef.current) notepadRef.current.innerHTML = '';
          setStickers([]);
          setImages([]);
        }
      }
    } catch (e) {}
    setLoading(false);
  };

  const handleDateChange = (e) => {
    setDate(e.target.value);
  };

  const handleAddSticker = (emoji) => {
    setStickers([
      ...stickers,
      {
        id: Date.now() + Math.random(),
        emoji,
        x: 100 + Math.random() * 200,
        y: 100 + Math.random() * 200,
        ...defaultStickerSize,
      },
    ]);
  };

  const updateSticker = (id, data) => {
    setStickers(stickers.map(s => s.id === id ? { ...s, ...data } : s));
  };

  const removeSticker = (id) => {
    setStickers(stickers.filter(s => s.id !== id));
  };

  const handleAddImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImages([
        ...images,
        {
          id: Date.now() + Math.random(),
          src: ev.target.result,
          x: 120 + Math.random() * 200,
          y: 120 + Math.random() * 200,
          ...defaultImageSize,
        },
      ]);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const updateImage = (id, data) => {
    setImages(images.map(img => img.id === id ? { ...img, ...data } : img));
  };

  const removeImage = (id) => {
    setImages(images.filter(img => img.id !== id));
  };

  // Save journal entry
  const saveJournal = async () => {
    setSaveMsg('');
    const text = notepadRef.current ? notepadRef.current.innerHTML : '';
    setLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'default',
          date,
          text,
          stickers,
          images,
        }),
      });
      if (res.ok) setSaveMsg('Journal saved!');
      else setSaveMsg('Save failed.');
    } catch (e) {
      setSaveMsg('Save failed.');
    }
    setLoading(false);
    setTimeout(() => setSaveMsg(''), 2000);
  };

  // Fetch history
  const fetchHistory = async () => {
    setHistoryLoading(true);
    setShowHistory(true);
    try {
      const res = await fetch(`${API_URL}/history?user_id=default`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data.sort().reverse());
      }
    } catch (e) {}
    setHistoryLoading(false);
  };

  return (
    <div className="journal-root">
      <button className="history-btn" onClick={fetchHistory} title="View history">📅 History</button>
      <div className="journal-date-row">
        <input
          type="date"
          className="journal-date-picker"
          value={date}
          max={getTodayISO()}
          onChange={handleDateChange}
        />
        <span className="journal-date-label">{getPrettyDate(date)}</span>
      </div>
      <div className="sticker-palette">
        {STICKERS.map((emoji) => (
          <button
            key={emoji}
            className="sticker-btn"
            onClick={() => handleAddSticker(emoji)}
            title="Add sticker"
          >
            {emoji}
          </button>
        ))}
        <button
          className="image-btn"
          onClick={() => fileInputRef.current.click()}
          title="Add image"
        >
          🖼️ Add Image
        </button>
        <input
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          ref={fileInputRef}
          onChange={handleAddImage}
        />
        <button className="save-btn" onClick={saveJournal} disabled={loading} title="Save journal">
          💾 Save
        </button>
        {saveMsg && <span className="save-msg">{saveMsg}</span>}
      </div>
      <div className="journal-notepad-wrapper">
        <div
          className="journal-notepad"
          contentEditable={true}
          spellCheck={true}
          suppressContentEditableWarning={true}
          placeholder="Start writing your thoughts..."
          ref={notepadRef}
        />
        {stickers.map((sticker) => (
          <Rnd
            key={sticker.id}
            size={{ width: sticker.width, height: sticker.height }}
            position={{ x: sticker.x, y: sticker.y }}
            minWidth={minStickerSize.width}
            minHeight={minStickerSize.height}
            maxWidth={maxStickerSize.width}
            maxHeight={maxStickerSize.height}
            onDragStop={(e, d) => updateSticker(sticker.id, { x: d.x, y: d.y })}
            onResizeStop={(e, direction, ref, delta, position) =>
              updateSticker(sticker.id, {
                width: parseInt(ref.style.width),
                height: parseInt(ref.style.height),
                ...position,
              })
            }
            bounds="parent"
            className="journal-sticker-rnd"
            enableResizing={{
              top: true, right: true, bottom: true, left: true,
              topRight: true, bottomRight: true, bottomLeft: true, topLeft: true
            }}
            onMouseDown={() => setActiveId(sticker.id)}
            onResizeStart={() => setActiveId(sticker.id)}
            onDragStart={() => setActiveId(sticker.id)}
          >
            <div className="journal-sticker">
              {sticker.emoji}
              <button className="remove-btn" onClick={() => removeSticker(sticker.id)} title="Remove sticker">✖</button>
            </div>
          </Rnd>
        ))}
        {images.map((img) => (
          <Rnd
            key={img.id}
            size={{ width: img.width, height: img.height }}
            position={{ x: img.x, y: img.y }}
            minWidth={minImageSize.width}
            minHeight={minImageSize.height}
            maxWidth={maxImageSize.width}
            maxHeight={maxImageSize.height}
            onDragStop={(e, d) => updateImage(img.id, { x: d.x, y: d.y })}
            onResizeStop={(e, direction, ref, delta, position) =>
              updateImage(img.id, {
                width: parseInt(ref.style.width),
                height: parseInt(ref.style.height),
                ...position,
              })
            }
            bounds="parent"
            className="journal-image-rnd"
            enableResizing={{
              top: true, right: true, bottom: true, left: true,
              topRight: true, bottomRight: true, bottomLeft: true, topLeft: true
            }}
            onMouseDown={() => setActiveId(img.id)}
            onResizeStart={() => setActiveId(img.id)}
            onDragStart={() => setActiveId(img.id)}
          >
            <div className="journal-image-wrapper">
              <img src={img.src} alt="User upload" className="journal-image" />
              <button className="remove-btn" onClick={() => removeImage(img.id)} title="Remove image">✖</button>
            </div>
          </Rnd>
        ))}
      </div>
      {showHistory && (
        <div className="history-modal" onClick={() => setShowHistory(false)}>
          <div className="history-list" onClick={e => e.stopPropagation()}>
            <h3>Journal History</h3>
            {historyLoading ? <div>Loading...</div> : (
              history.length === 0 ? <div>No entries yet.</div> : (
                <ul>
                  {history.map(date => (
                    <li key={date}>
                      <button className="history-date-btn" onClick={() => { setDate(date); setShowHistory(false); }}>{date}</button>
                    </li>
                  ))}
                </ul>
              )
            )}
            <button className="close-history-btn" onClick={() => setShowHistory(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyJournal; 