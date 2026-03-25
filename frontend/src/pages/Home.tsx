import { useNavigate } from 'react-router-dom';
import { AuthenticatedRoute } from '../App.js';
import { Header } from '../components/Header/index.js';
import { ModeButton } from '../components/ModeButton/index.js';

// Quotes with weights: funny quotes appear 50% more often (weight 1.5 vs 1)
const QUOTES: { text: string; weight: number }[] = [
  // Funny quotes (50% more likely)
  { text: "Overthinking is just mental cardio.", weight: 1.5 },
  { text: "I put the 'fun' in 'dysfunctional'.", weight: 1.5 },
  { text: "Your heart is a muscle - train it with energy drinks.", weight: 1.5 },
  { text: "Fuck it, we ball.", weight: 1.5 },

  // Standard quotes (weight 1)
  { text: "Either increase sacrifice or reduce desire.", weight: 1 },
  { text: "Retardmaxxing fixes everything.", weight: 1 },
  { text: "Skill issue? Grind harder.", weight: 1 },
  { text: "I will not be outworked.", weight: 1 },
  { text: "Nobody cares about your process, only your output.", weight: 1 },
  { text: "You have to be odd to be number 1.", weight: 1 },
];

// Weighted random selection
function getRandomQuote(): string {
  const totalWeight = QUOTES.reduce((sum, q) => sum + q.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const quote of QUOTES) {
    random -= quote.weight;
    if (random <= 0) {
      return quote.text;
    }
  }
  
  return QUOTES[QUOTES.length - 1].text;
}

export function Home() {
  const navigate = useNavigate();
  const randomQuote = getRandomQuote();

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
            <ModeButton
              icon="📊"
              label="Counters"
              onClick={() => navigate('/counters')}
              borderColor="#e94560"
            />
            <ModeButton
              icon="📝"
              label="Verb Conjugation"
              onClick={() => navigate('/verbs')}
              borderColor="#00d2d3"
            />
            <ModeButton
              icon="📰"
              label="Reading Practice"
              onClick={() => navigate('/reading')}
              borderColor="#5f27cd"
            />
            <ModeButton
              icon="🎙️"
              label="Speaking Drills"
              onClick={() => navigate('/speaking')}
              borderColor="#ff9f43"
            />
            <ModeButton
              icon="📈"
              label="Progress Dashboard"
              onClick={() => navigate('/progress')}
              borderColor="#10ac84"
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
