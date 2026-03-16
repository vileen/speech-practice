import { useNavigate } from 'react-router-dom';
import { AuthenticatedRoute } from '../App.js';

const QUOTES = [
  "Either increase sacrifice or reduce desire.",
  "Retardmaxxing fixes everything.",
  "Skill issue? Grind harder.",
  "Overthinking is just mental cardio.",
  "I put the 'fun' in 'dysfunctional'.",
  "I will not be outworked.",
  "Your heart is a muscle - train it with energy drinks.",
  "Fuck it, we ball.",
  "Nobody cares about your process, only your output.",
  "You have to be odd to be number 1.",
];

export function Home() {
  const navigate = useNavigate();
  const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];

  return (
    <AuthenticatedRoute>
      <div className="app">
        <header>
          <h1>🎤 Speech Practice</h1>
        </header>
        
        <main>
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
            <button className="kanji-mode-btn" onClick={() => navigate('/kanji')}>
              🈁 Kanji Practice
            </button>
            <button className="grammar-mode-btn" onClick={() => navigate('/grammar')}>
              📚 Grammar Drills
            </button>
          </div>
        </main>
        
        <footer className="quote-footer">
          {randomQuote}
        </footer>
      </div>
    </AuthenticatedRoute>
  );
}
