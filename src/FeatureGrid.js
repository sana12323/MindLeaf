import React from 'react';
import { Link } from 'react-router-dom';
import './FeatureGrid.css';

const features = [
  {
    title: 'Daily Journal',
    description: 'Reflect on your thoughts and day',
    emoji: '📝',
    link: '/journal',
    color: '#ffe0ef',
  },
  {
    title: 'To-Do List',
    description: 'Stay organized and on track',
    emoji: '✅',
    link: '/todo',
    color: '#d6eaff',
  },
  {
    title: 'Affirmations',
    description: 'Positive thoughts for the day',
    emoji: '🌞',
    link: '/affirmations',
    color: '#fff7c7',
  },
  {
    title: 'Gratitude Journal',
    description: "Write down what you're thankful for", 
    emoji: '📒',
    link: '/gratitude',
    color: '#d8ffe6',
  },
  {
    title: 'Mood Tracker',
    description: "Log how you're feeling today", 
    emoji: '😊',
    link: '/mood',
    color: '#f3e6ff',
  },
];

const FeatureGrid = () => (
  <div className="feature-grid">
    {features.map((feature) => (
      <Link to={feature.link} className="feature-card" style={{ background: feature.color }} key={feature.title}>
        <div className="feature-emoji">{feature.emoji}</div>
        <div className="feature-title">{feature.title}</div>
        <div className="feature-desc">{feature.description}</div>
      </Link>
    ))}
  </div>
);

export default FeatureGrid; 