import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { RepeatMode } from './components/RepeatMode/index.js';
import { HealthCheckWrapper } from './components/HealthCheckWrapper/index.js';

// Shared config and types

// Page components
import { Login } from './pages/Login.js';
import { Home } from './pages/Home.js';
import { LessonList } from './pages/LessonList.js';
import { LessonDetail } from './pages/LessonDetail.js';
import { ChatSetup } from './pages/ChatSetup.js';
import { RepeatSetup } from './pages/RepeatSetup.js';
import { LessonPracticeSetup } from './pages/LessonPracticeSetup.js';
import { ChatSession } from './pages/ChatSession.js';
import { LessonPractice } from './pages/LessonPractice.js';
import { MemoryModeWrapper } from './pages/MemoryModeWrapper.js';
import { GrammarMode } from './components/GrammarMode/index.js';
import { CountersMode } from './components/CountersMode/CountersMode.js';
import { KanjiPracticePage } from './pages/KanjiPracticePage.js';
import { VerbMode } from './components/VerbMode/index.js';
import { ReadingMode } from './components/ReadingMode/ReadingMode.js';
import { SpeakingMode } from './components/SpeakingMode/SpeakingMode.js';
import { ProgressDashboard } from './components/ProgressDashboard/ProgressDashboard.js';

// Types

// Health check wrapper component

// Main App wrapper with router
function App() {
  return (
    <HealthCheckWrapper>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chat/setup" element={<ChatSetup />} />
        <Route path="/chat" element={<ChatSession />} />
        <Route path="/repeat/setup" element={<RepeatSetup />} />
        <Route path="/repeat" element={<RepeatMode />} />
        <Route path="/memory" element={<MemoryModeWrapper />} />
        <Route path="/kanji" element={<KanjiPracticePage />} />
        <Route path="/grammar" element={<GrammarMode />} />
        <Route path="/counters" element={<CountersMode />} />
        <Route path="/verbs" element={<VerbMode />} />
        <Route path="/reading" element={<ReadingMode />} />
        <Route path="/speaking" element={<SpeakingMode />} />
        <Route path="/progress" element={<ProgressDashboard />} />
        <Route path="/lessons" element={<LessonList />} />
        <Route path="/lessons/:id" element={<LessonDetail />} />
        <Route path="/lessons/:id/setup" element={<LessonPracticeSetup />} />
        <Route path="/lessons/:id/practice" element={<LessonPractice />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HealthCheckWrapper>
  );
}

// Helper component for authenticated routes
export function AuthenticatedRoute({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedPassword = localStorage.getItem('speech_practice_password');
    if (savedPassword) {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="login-container">
        <h1>🎤 Speech Practice</h1>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return <>{children}</>;
}


export default App;
// Build: Mon Feb 16 15:51:09 CET 2026
