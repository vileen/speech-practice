import { useNavigate } from 'react-router-dom';
import { AuthenticatedRoute } from '../App.js';

export function Home() {
  const navigate = useNavigate();

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
          "Either increase sacrifice or reduce desire."
        </div>
      </div>
    </AuthenticatedRoute>
  );
}
