import React, { useRef, useState } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import mindLeafLogo from './mind-leaf-logo.png';

export default function Login() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const { login, loginWithGoogle } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(emailRef.current.value, passwordRef.current.value);
      navigate('/');
    } catch (err) {
      setError('Failed to log in: ' + err.message);
    }
    setLoading(false);
  }

  async function handleGoogle() {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
      navigate('/');
    } catch (err) {
      setError('Google login failed: ' + err.message);
    }
    setLoading(false);
  }

  return (
    <>
      {/* Floating Aesthetic Images - you can swap these URLs for your own images later */}
      <img className="aesthetic-img leaf1" src="https://pngimg.com/d/leaf_PNG3676.png" alt="leaf" />
      <img className="aesthetic-img leaf2" src="https://pngimg.com/d/leaf_PNG3680.png" alt="leaf" />
      <img className="aesthetic-img cloud1" src="https://pngimg.com/uploads/cloud/cloud_PNG27.png" alt="cloud" />
      <img className="aesthetic-img flower1" src="https://pngimg.com/uploads/flower/flower_PNG102.png" alt="flower" />
      <img className="aesthetic-img book1" src="https://pngimg.com/uploads/book/book_PNG2114.png" alt="book" />
      <div className="auth-container pastel-bg">
        <div className="auth-logo-row">
          <img src={mindLeafLogo} alt="MindLeaf Logo" className="auth-logo" />
          <span className="auth-title">MindLeaf</span>
        </div>
        <h2>Log In</h2>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input type="email" ref={emailRef} placeholder="Email" required />
          <input type="password" ref={passwordRef} placeholder="Password" required />
          <button disabled={loading} type="submit">Log In</button>
        </form>
        <button className="google-btn" onClick={handleGoogle} disabled={loading}>
          <span className="google-icon" style={{marginRight:8,display:'inline-flex',verticalAlign:'middle'}}>
            <svg width="22" height="22" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M43.6 20.5h-1.9V20H24v8h11.3c-1.6 4.3-5.7 7-11.3 7-6.6 0-12-5.4-12-12s5.4-12 12-12c2.7 0 5.2.9 7.2 2.6l6-6C36.1 5.1 30.3 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20.1-7.5 20.1-21 0-1.4-.1-2.4-.3-3.5z"/><path fill="#34A853" d="M6.3 14.7l6.6 4.8C14.5 16.1 18.8 13 24 13c2.7 0 5.2.9 7.2 2.6l6-6C36.1 5.1 30.3 3 24 3 16.1 3 9.1 7.6 6.3 14.7z"/><path fill="#FBBC05" d="M24 45c6.2 0 12-2.1 16.4-5.7l-7.6-6.2C30.7 35.7 27.5 37 24 37c-5.6 0-10.3-3.6-12-8.5l-7.5 5.8C9 41.4 16 45 24 45z"/><path fill="#EA4335" d="M43.6 20.5h-1.9V20H24v8h11.3c-1.1 2.9-3.2 5.2-6.1 6.6l7.6 6.2C41.7 41.2 45 34.9 45 24c0-1.4-.1-2.4-.3-3.5z"/></g></svg>
          </span>
          Log In with Google
        </button>
        <div className="auth-link">Need an account? <Link to="/signup">Sign Up</Link></div>
      </div>
    </>
  );
} 