import React, { useRef, useState } from 'react';
import './GratitudeJournal.css';
import mindLeafLogo from './mind-leaf-logo.png';
import { Rnd } from 'react-rnd';
import { useAuth } from './AuthContext';

const PHRASES = [
  'I am grateful for my family and friends.',
  'I appreciate the little things in life.',
  'I am thankful for my health.',
  'I am grateful for new opportunities.',
  'I appreciate the beauty of nature.',
  'I am thankful for a safe place to live.',
  'I am grateful for the kindness of others.',
  'I appreciate moments of peace and calm.'
];
const STICKERS = ['🌸', '🌈', '💖', '😊', '✨', '🍃', '🌻', '🥰'];

const defaultStickerSize = { width: 44, height: 44 };



const GratitudeJournal = () => {
  const notepadRef = useRef();
  const [color, setColor] = useState('#444b5a');
  const [stickers, setStickers] = useState([]);
  const [notepadFocused, setNotepadFocused] = useState(false);
  const [notepadContent, setNotepadContent] = useState('');
  const [draggingId, setDraggingId] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [selection, setSelection] = useState(null);
  const { currentUser } = useAuth();
  const userId = currentUser?.uid || 'default';
  const [savedDates, setSavedDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [loadingEntry, setLoadingEntry] = useState(false);
  const [error, setError] = useState(null);
  const [isFetchingDates, setIsFetchingDates] = useState(false);

  // Add sticker to notepad area
  const handleAddSticker = (emoji) => {
    setStickers([
      ...stickers,
      {
        id: Date.now() + Math.random(),
        emoji,
        x: 120 + Math.random() * 120,
        y: 60 + Math.random() * 120,
        ...defaultStickerSize,
      },
    ]);
  };

  // Update sticker position/size
  const updateSticker = (id, data) => {
    setStickers(stickers.map(s => s.id === id ? { ...s, ...data } : s));
  };

  // Remove sticker
  const removeSticker = (id) => {
    setStickers(stickers.filter(s => s.id !== id));
  };

  // Insert text at cursor position in notepad
  const insertAtCursor = (insertText) => {
    // Save selection before focus
    notepadRef.current.focus();
    let sel = window.getSelection();
    let range = sel && sel.getRangeAt && sel.rangeCount > 0 ? sel.getRangeAt(0) : null;
    if (!range) {
      setNotepadContent(prev => prev + insertText);
      return;
    }
    // Insert text node at cursor
    range.deleteContents();
    const textNode = document.createTextNode(insertText);
    range.insertNode(textNode);
    // Move cursor after inserted text
    range.setStartAfter(textNode);
    range.setEndAfter(textNode);
    sel.removeAllRanges();
    sel.addRange(range);
    // Update state
    setNotepadContent(notepadRef.current.innerText);
  };

  // Notepad content/placeholder logic
  const handleNotepadInput = () => {
    setNotepadContent(notepadRef.current.innerText);
  };
  const handleNotepadFocus = () => setNotepadFocused(true);
  const handleNotepadBlur = () => setNotepadFocused(false);

  // Clear notepad
  const handleClearNotepad = () => {
    setShowClearConfirm(false);
    setNotepadContent('');
    if (notepadRef.current) {
      notepadRef.current.innerText = '';
    }
    setStickers([]);
  };

  // Keep contentEditable in sync with state
  React.useEffect(() => {
    if (notepadRef.current && notepadRef.current.innerText !== notepadContent) {
      notepadRef.current.innerText = notepadContent;
    }
  }, [notepadContent]);

  // Format date for display
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Fetch saved gratitude journal dates on mount
  React.useEffect(() => {
    const fetchDates = async () => {
      try {
        setIsFetchingDates(true);
        setError(null);
        console.log('Fetching dates for user:', userId);
        const res = await fetch(`http://localhost:5000/api/gratitude/history?user_id=${userId}`);
        if (!res.ok) {
          throw new Error(`Failed to fetch dates: ${res.status}`);
        }
        const dates = await res.json();
        console.log('Received dates:', dates);
        setSavedDates(dates || []);
      } catch (err) {
        console.error('Error fetching dates:', err);
        setError('Failed to load saved entries. Please try again later.');
      } finally {
        setIsFetchingDates(false);
      }
    };
    fetchDates();
  }, [userId]);

  // Load a saved entry when a date is selected
  const handleSelectDate = async (date) => {
    if (!date) return;
    try {
      setLoadingEntry(true);
      setError(null);
      console.log('Loading entry for date:', date);
      const res = await fetch(`http://localhost:5000/api/gratitude?user_id=${userId}&date=${date}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch entry: ${res.status}`);
      }
      const entry = await res.json();
      console.log('Received entry:', entry);
      if (entry && entry.text) {
        setNotepadContent(entry.text);
        setStickers(entry.stickers || []);
        setSelectedDate(date);
      } else {
        setError('No entry found for this date');
      }
    } catch (err) {
      console.error('Error loading entry:', err);
      setError('Failed to load entry. Please try again.');
    } finally {
      setLoadingEntry(false);
    }
  };

  // Save current entry to backend
  const handleSaveEntry = async () => {
    if (!notepadContent.trim()) {
      alert('Please write something before saving.');
      return;
    }
    try {
      const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      const entry = {
        user_id: userId,
        date,
        text: notepadContent,
        stickers,
        images: []
      };
      console.log('Saving entry:', entry);
      const res = await fetch('http://localhost:5000/api/gratitude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });
      if (!res.ok) {
        throw new Error(`Failed to save entry: ${res.status}`);
      }
      // Refresh saved dates
      const datesRes = await fetch(`http://localhost:5000/api/gratitude/history?user_id=${userId}`);
      if (!datesRes.ok) {
        throw new Error(`Failed to refresh dates: ${datesRes.status}`);
      }
      const dates = await datesRes.json();
      console.log('Updated dates list:', dates);
      setSavedDates(dates || []);
      alert('Gratitude entry saved successfully!');
    } catch (err) {
      console.error('Error saving entry:', err);
      alert('Failed to save entry. Please try again.');
    }
  };

  return (
    <div className="grat-bg-gradient">
      
      <div className="grat-header">
        <span className="grat-header-icon">📝</span>
        <span className="grat-header-title">Gratitude Journal</span>
      </div>
      <div className="grat-header-desc">Reflect on what you're grateful for today.</div>
      <div className="grat-main-cards">
        <div className="grat-card-left">
          <div className="grat-card-inner">
            <div className="grat-phrases-title">Prebuilt Gratitude Phrases</div>
            <ul className="grat-phrases-list">
              {PHRASES.map((p, i) => (
                <li key={i}>
                  <span
                    className="grat-plus"
                    onClick={() => insertAtCursor(p + ' ')}
                    tabIndex={0}
                    role="button"
                    aria-label={`Insert phrase: ${p}`}
                    title="Insert this phrase"
                    style={{ cursor: 'pointer' }}
                    onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && insertAtCursor(p + ' ')}
                  >
                    ＋
                  </span>
                  <button
                    className="grat-phrase-btn"
                    onClick={() => insertAtCursor(p + ' ')}
                    aria-label={`Insert phrase: ${p}`}
                    tabIndex={0}
                    title="Insert this phrase"
                  >
                    {p}
                  </button>
                </li>
              ))}
            </ul>
            <div className="grat-stickers-title">Add Bullet & Stickers</div>
            <div className="grat-stickers-row">
              <button
                className="grat-bullet-btn"
                onClick={() => insertAtCursor('• ')}
                title="Insert bullet"
                aria-label="Insert bullet"
                tabIndex={0}
                type="button"
              >
                •
              </button>
              {STICKERS.map((s, i) => (
                <span
                  key={i}
                  className="grat-sticker-emoji"
                  onClick={() => handleAddSticker(s)}
                  title="Click to add, then drag onto your note"
                  style={{ cursor: 'grab' }}
                  tabIndex={0}
                  aria-label={`Add sticker: ${s}`}
                  onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleAddSticker(s)}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="grat-card-right">
          <div className="grat-notepad-title">Notepad</div>
          {/* Dropdown to select saved journals */}
          <div className="grat-saved-dropdown-row" style={{ marginBottom: '1rem' }}>
            <label htmlFor="grat-saved-dropdown">View saved journals: </label>
            <select
              id="grat-saved-dropdown"
              value={selectedDate}
              onChange={e => handleSelectDate(e.target.value)}
              style={{ marginLeft: 8, padding: '0.3rem 0.7rem', borderRadius: 6 }}
              disabled={isFetchingDates}
            >
              <option value="">-- Select a date --</option>
              {savedDates.length > 0 ? (
                savedDates.map(date => (
                  <option key={date} value={date}>{formatDate(date)}</option>
                ))
              ) : (
                <option value="" disabled>
                  {isFetchingDates ? 'Loading...' : 'No saved entries'}
                </option>
              )}
            </select>
            {loadingEntry && <span style={{ marginLeft: 10 }}>Loading entry...</span>}
            {error && (
              <div style={{ color: '#e11d48', marginTop: 8, fontSize: '0.9rem' }}>
                {error}
              </div>
            )}
          </div>
          <div className="grat-color-picker-row">
            <label htmlFor="notepad-color-picker" title="Choose your text color">Text color:</label>
            <span className="grat-color-preview" style={{ background: color }} aria-label="Current text color" />
            <input
              id="notepad-color-picker"
              type="color"
              value={color}
              onChange={e => setColor(e.target.value)}
              className="grat-color-picker"
              title="Choose your text color"
              aria-label="Choose text color"
            />
          </div>
          <div className="notepad-wrapper" style={{ position: 'relative', width: '100%' }}>
            <div
              className="grat-notepad-area"
              contentEditable={true}
              spellCheck={true}
              suppressContentEditableWarning={true}
              ref={notepadRef}
              style={{ color, minHeight: '420px', minWidth: '100%', maxWidth: '100%', width: '100%', fontSize: '1.18rem', padding: '2.2rem' }}
              onInput={handleNotepadInput}
              onFocus={handleNotepadFocus}
              onBlur={handleNotepadBlur}
              aria-label="Gratitude notepad"
              tabIndex={0}
            />
            {(!notepadContent && !notepadFocused) && (
              <span className="grat-notepad-placeholder" style={{ position: 'absolute', left: '2.5rem', top: '2.2rem', pointerEvents: 'none' }}>Write what you're grateful for...</span>
            )}
            {/* Render stickers as absolutely positioned Rnd components */}
            {stickers.map(sticker => (
              <Rnd
                key={sticker.id}
                size={{ width: sticker.width, height: sticker.height }}
                position={{ x: sticker.x, y: sticker.y }}
                bounds=".notepad-wrapper"
                onDragStart={() => setDraggingId(sticker.id)}
                onDragStop={(e, d) => { setDraggingId(null); updateSticker(sticker.id, { x: d.x, y: d.y }); }}
                onResizeStart={() => setDraggingId(sticker.id)}
                onResizeStop={(e, direction, ref, delta, position) => {
                  setDraggingId(null);
                  updateSticker(sticker.id, {
                    width: parseInt(ref.style.width),
                    height: parseInt(ref.style.height),
                    ...position,
                  });
                }}
                enableResizing={{ bottomRight: true }}
                className={`grat-rnd-sticker${draggingId === sticker.id ? ' grat-sticker-dragging' : ''}`}
              >
                <div
                  className="grat-draggable-sticker"
                  tabIndex={0}
                  aria-label={`Sticker: ${sticker.emoji}`}
                  style={{ boxShadow: draggingId === sticker.id ? '0 0 0 3px #ffe066, 0 2px 12px rgba(37,99,235,0.10)' : undefined }}
                >
                  <span style={{ fontSize: '2rem', cursor: draggingId === sticker.id ? 'grabbing' : 'grab', transition: 'box-shadow 0.18s' }}>{sticker.emoji}</span>
                  <button
                    className="grat-remove-sticker"
                    onClick={() => removeSticker(sticker.id)}
                    title="Remove sticker"
                    aria-label="Remove sticker"
                    tabIndex={0}
                    style={{ opacity: 0 }}
                    onFocus={e => e.target.style.opacity = 1}
                    onBlur={e => e.target.style.opacity = 0}
                    onMouseEnter={e => e.target.style.opacity = 1}
                    onMouseLeave={e => e.target.style.opacity = 0}
                  >
                    ×
                  </button>
                </div>
              </Rnd>
            ))}
          </div>
          <div className="grat-notepad-actions">
            <button
              className="grat-save-btn"
              aria-label="Save gratitude entry"
              tabIndex={0}
              onClick={handleSaveEntry}
            >
              Save Entry
            </button>
            <button
              className="grat-clear-btn"
              aria-label="Clear notepad"
              tabIndex={0}
              onClick={() => setShowClearConfirm(true)}
              title="Clear notepad"
            >
              Clear Notepad
            </button>
          </div>
          {showClearConfirm && (
            <div className="grat-clear-confirm-modal">
              <div className="grat-clear-confirm-content">
                <p>Are you sure you want to clear your notepad and remove all stickers?</p>
                <button className="grat-confirm-btn" onClick={handleClearNotepad}>Yes, clear</button>
                <button className="grat-cancel-btn" onClick={() => setShowClearConfirm(false)}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GratitudeJournal; 