import React, { useState, useRef, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './ToDoList.css';
import mindLeafLogo from './mind-leaf-logo.png';

// Get YYYY-MM-DD in local time (no UTC conversion)
function getLocalDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
function getPrettyDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

const API_URL = 'http://localhost:5000/api/todo';

const ToDoList = () => {
  const [date, setDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Prevent auto-save on load
  const [taskDates, setTaskDates] = useState([]);
  const inputRef = useRef();
  const isFirstLoad = useRef(true);

  // Load tasks when date changes
  useEffect(() => {
    loadTasks(getLocalDateString(date));
    // eslint-disable-next-line
  }, [date]);

  // Auto-save tasks when tasks change (but not on first load or load from backend)
  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }
    if (isLoading) return; // Don't auto-save when loading from backend
    autoSaveTasks();
    // eslint-disable-next-line
  }, [tasks]);

  // Fetch all dates with tasks on mount and when tasks are added/deleted
  useEffect(() => {
    fetchTaskDates();
    // eslint-disable-next-line
  }, []);

  // Also refresh taskDates when tasks are added/deleted
  useEffect(() => {
    fetchTaskDates();
    // eslint-disable-next-line
  }, [tasks]);

  const loadTasks = async (dateToLoad) => {
    setIsLoading(true);
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}?date=${dateToLoad}&user_id=default`);
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks || []);
      } else {
        setTasks([]);
      }
    } catch (e) { setTasks([]); }
    setSaving(false);
    setTimeout(() => setIsLoading(false), 0); // Allow tasks to update before disabling loading
  };

  const autoSaveTasks = async () => {
    setSaving(true);
    setSaveMsg('Saving...');
    try {
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'default',
          date: getLocalDateString(date),
          tasks,
        }),
      });
      setSaveMsg('Saved!');
    } catch (e) {
      setSaveMsg('Save failed.');
    }
    setSaving(false);
    setTimeout(() => setSaveMsg(''), 1200);
  };

  const fetchTaskDates = async () => {
    try {
      const res = await fetch(`${API_URL}/dates?user_id=default`);
      if (res.ok) {
        const data = await res.json();
        setTaskDates(data);
      }
    } catch (e) {}
  };

  const handleInputChange = (e) => setInput(e.target.value);

  const handleAddTask = () => {
    if (input.trim() === '') return;
    setTasks([
      ...tasks,
      { id: Date.now() + Math.random(), text: input.trim(), completed: false }
    ]);
    setInput('');
    inputRef.current && inputRef.current.focus();
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') handleAddTask();
  };

  const handleToggleComplete = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleDeleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const handleEditTask = (id, text) => {
    setEditingId(id);
    setEditingText(text);
  };

  const handleEditChange = (e) => setEditingText(e.target.value);

  const handleEditSave = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, text: editingText } : t));
    setEditingId(null);
    setEditingText('');
  };

  const handleEditKeyDown = (e, id) => {
    if (e.key === 'Enter') handleEditSave(id);
    if (e.key === 'Escape') { setEditingId(null); setEditingText(''); }
  };

  // Custom tileClassName for today highlight
  const tileClassName = ({ date: calDate }) => {
    const today = getLocalDateString(new Date());
    if (getLocalDateString(calDate) === today) {
      return 'calendar-today-highlight';
    }
    return null;
  };

  // Add a dot under days with tasks
  const tileContent = ({ date: calDate, view }) => {
    if (view === 'month') {
      const dateStr = getLocalDateString(calDate);
      if (taskDates.includes(dateStr)) {
        return (
          <span className="calendar-task-dot" />
        );
      }
    }
    return null;
  };

  return (
    <div className="todo2-root pastel-bg">
      <div className="todo2-columns">
        <div className="todo2-calendar-col pastel-card">
          <Calendar
            onChange={setDate}
            value={date}
            tileClassName={tileClassName}
            tileContent={tileContent}
          />
        </div>
        <div className="todo2-card-col">
          <div className="todo2-card pastel-card">
            <h2 className="todo2-title">Tasks for {getLocalDateString(date)}</h2>
            <div className="todo2-input-row">
              <input
                className="todo2-input"
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleInputKeyDown}
                placeholder="Add a task..."
                disabled={saving}
              />
              <button className="todo2-add-btn" onClick={handleAddTask} disabled={saving || input.trim() === ''}>Add</button>
              {saveMsg && <span className="todo2-save-msg">{saveMsg}</span>}
            </div>
            {/* Clear All Tasks Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
              <button
                className="todo2-clear-btn"
                onClick={() => setTasks([])}
                disabled={tasks.length === 0 || saving}
                style={{
                  background: 'linear-gradient(90deg, #e3e0ff 0%, #f9b1e3 100%)',
                  color: '#a278c9',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '1rem',
                  padding: '0.4rem 1.1rem',
                  cursor: tasks.length === 0 || saving ? 'not-allowed' : 'pointer',
                  fontFamily: 'Pacifico, cursive',
                  boxShadow: '0 2px 8px 0 #e3e0ff22',
                  opacity: tasks.length === 0 || saving ? 0.5 : 1,
                  transition: 'background 0.2s, opacity 0.2s',
                }}
              >
                Clear All Tasks
              </button>
            </div>
            <ul className="todo2-list">
              {tasks.length === 0 && <li className="todo2-empty">No tasks for this day.</li>}
              {tasks.map(task => (
                <li key={task.id} className={`todo2-task${task.completed ? ' completed' : ''}`}>
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleToggleComplete(task.id)}
                  />
                  {editingId === task.id ? (
                    <input
                      className="todo2-edit-input"
                      value={editingText}
                      onChange={handleEditChange}
                      onBlur={() => handleEditSave(task.id)}
                      onKeyDown={e => handleEditKeyDown(e, task.id)}
                      autoFocus
                    />
                  ) : (
                    <span
                      className="todo2-task-text"
                      onDoubleClick={() => handleEditTask(task.id, task.text)}
                      title="Double-click to edit"
                    >
                      {task.text}
                    </span>
                  )}
                  <button className="todo2-edit-btn" onClick={() => handleEditTask(task.id, task.text)} title="Edit">✏️</button>
                  <button className="todo2-delete-btn" onClick={() => handleDeleteTask(task.id)} title="Delete">✖</button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToDoList; 