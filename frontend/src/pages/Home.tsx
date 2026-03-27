import { useNavigate } from 'react-router-dom';
import { AuthenticatedRoute } from '../App.js';
import { Header } from '../components/Header/index.js';
import { ModeButton } from '../components/ModeButton/index.js';
import './Home.css';

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

// Mode categories for organized display
const MODE_CATEGORIES = [
  {
    title: "Core Practice",
    modes: [
      { icon: "💬", label: "Start Chat", path: "/chat/setup", color: "#e94560", primary: true },
      { icon: "🎯", label: "Repeat After Me", path: "/repeat/setup", color: "#ff6b6b" },
      { icon: "📚", label: "Lesson Mode", path: "/lessons", color: "#4a9eff" },
    ]
  },
  {
    title: "Review & Memory",
    modes: [
      { icon: "🧠", label: "Memory Mode", path: "/memory", color: "#9b59b6" },
      { icon: "📈", label: "Progress Dashboard", path: "/progress", color: "#10ac84" },
    ]
  },
  {
    title: "Drills & Exercises",
    modes: [
      { icon: "📖", label: "Grammar Drills", path: "/grammar", color: "#f39c12" },
      { icon: "📝", label: "Verb Conjugation", path: "/verbs", color: "#00d2d3" },
      { icon: "📊", label: "Counters", path: "/counters", color: "#e94560" },
      { icon: "🈁", label: "Kanji Practice", path: "/kanji", color: "#27ae60" },
    ]
  },
  {
    title: "Reading, Listening & Speaking",
    modes: [
      { icon: "📰", label: "Reading Practice", path: "/reading", color: "#5f27cd" },
      { icon: "🎧", label: "Listening Practice", path: "/listening", color: "#00d2d3" },
      { icon: "🎙️", label: "Speaking Drills", path: "/speaking", color: "#ff9f43" },
    ]
  },
];

export function Home() {
  const navigate = useNavigate();
  const randomQuote = getRandomQuote();

  return (
    <AuthenticatedRoute>
      <div className="app home-page">
        <Header title="Speech Practice" icon="🎤" showBackButton={false} />
        <main className="home-container">
          {MODE_CATEGORIES.map((category) => (
            <section key={category.title} className="mode-category">
              <h2 className="category-title">{category.title}</h2>
              <div className="mode-grid">
                {category.modes.map((mode) => (
                  <ModeButton
                    key={mode.path}
                    icon={mode.icon}
                    label={mode.label}
                    onClick={() => navigate(mode.path)}
                    variant={mode.primary ? 'primary' : 'default'}
                    borderColor={mode.color}
                  />
                ))}
              </div>
            </section>
          ))}
        </main>
        
        <footer className="quote-footer">
          {randomQuote}
        </footer>
      </div>
    </AuthenticatedRoute>
  );
}
