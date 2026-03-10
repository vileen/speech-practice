import { useNavigate } from 'react-router-dom';
import { AuthenticatedRoute } from '../App.js';

const QUOTES = [
  "Either increase sacrifice or reduce desire.",
  "Retardmaxxing fixes everything.",
  "Skill issue? Just grind more levels and out-stat the problem.",
  "Overthinking is just mental cardio.",
  "I put the 'fun' in 'dysfunctional'.",
  "Your heart is a muscle—train it with energy drinks.",
];

export function Home() {
  const navigate = useNavigate();
  const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];

  return (
    <AuthenticatedRoute>
      <div className="app">
        <header>
          <h1>🎤 Speech Practice</h1>
          <div className="setup">
            <button className="start-btn" onClick={() => navigate('/chat/setup')}>
              💬 Start Chat
            </button>
            
            <button className="repeat-mode-btn" onClick={() => navigate('/repeat/setup')}>
              🎯 Repeat After Me
            </button>
            
            <button className="lesson-mode-btn" onClick={() => navigate('/lessons')}>
              📚 Lesson Mode
            </button>

            <button className="memory-mode-btn" onClick={() => navigate('/memory')}>
              🧠 Memory Mode
            </button>
          </div>
        </header>
        
        <div className="quote-footer">
          {randomQuote}
        </div>
      </div>
    </AuthenticatedRoute>
  );
}
