import { useState } from 'react';

export function Login() {
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    localStorage.setItem('speech_practice_password', password);
    // Reload to trigger auth check
    window.location.reload();
  };

  return (
    <div className="login-container">
      <h1>Speech Practice</h1>
      <div className="login-form">
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
        />
        <button onClick={handleLogin}>Enter</button>
      </div>
      
      <div className="quotes-container">
        <div className="quote">
          <span className="quote-text">"Either increase sacrifice or reduce desire."</span>
        </div>
        <div className="quote">
          <span className="quote-text">"The pain of discipline is nothing like the pain of disappointment."</span>
          <span className="quote-author">— Justin Langer</span>
        </div>
      </div>
    </div>
  );
}
