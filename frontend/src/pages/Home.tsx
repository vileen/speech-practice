import { useNavigate } from 'react-router-dom';
import { AuthenticatedRoute } from '../App.js';
import { Header } from '../components/Header/index.js';
import { ModeButton } from '../components/ModeButton/index.js';

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
        <Header title="Speech Practice" icon="🎤" showBackButton={false} />
        <main>
          <div className="setup">
            <ModeButton
              icon="💬"
              label="Start Chat"
              onClick={() => navigate('/chat/setup')}
              variant="primary"
            />
            <ModeButton
              icon="🎯"
              label="Repeat After Me"
              onClick={() => navigate('/repeat/setup')}
              borderColor="#ff6b6b"
            />
            <ModeButton
              icon="📚"
              label="Lesson Mode"
              onClick={() => navigate('/lessons')}
              borderColor="#4a9eff"
            />
            <ModeButton
              icon="🧠"
              label="Memory Mode"
              onClick={() => navigate('/memory')}
              borderColor="#9b59b6"
            />
            <ModeButton
              icon="🈁"
              label="Kanji Practice"
              onClick={() => navigate('/kanji')}
              borderColor="#27ae60"
            />
            <ModeButton
              icon="📖"
              label="Grammar Drills"
              onClick={() => navigate('/grammar')}
              borderColor="#f39c12"
            />
          </div>
        </main>
        
        <footer className="quote-footer">
          {randomQuote}
        </footer>
      </div>
    </AuthenticatedRoute>
  );
}
