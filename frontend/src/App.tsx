import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { RepeatMode } from './components/RepeatMode.js';
import { MemoryMode } from './components/MemoryMode.js';
import { OfflineScreen } from './components/OfflineScreen.js';

// Shared config and types
import { API_URL, getPassword } from './config/api.js';
import type { Lesson } from './types/index.js';

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


// Types

interface PracticePhrase {
  text: string;
  translation: string;
}

export const PRACTICE_PHRASES: Record<string, PracticePhrase[]> = {
  japanese: [
    { text: 'おはようございます', translation: 'Good morning' },
    { text: 'こんにちは', translation: 'Hello / Good afternoon' },
    { text: 'こんばんは', translation: 'Good evening' },
    { text: 'ありがとうございます', translation: 'Thank you (polite)' },
    { text: 'すみません', translation: 'Excuse me / Sorry' },
    { text: 'お名前は何ですか', translation: 'What is your name?' },
    { text: '私は学生です', translation: 'I am a student' },
    { text: '日本語を勉強しています', translation: 'I am studying Japanese' },
    { text: '今日は寒いです', translation: 'Today is cold' },
    { text: '明日は火曜日です', translation: 'Tomorrow is Tuesday' },
    { text: '犬と猫とどちらの方が好きですか', translation: 'Which do you prefer, dogs or cats?' },
    { text: '寿司とラーメンとどちらがいいですか', translation: 'Which is better, sushi or ramen?' },
    { text: '京都と東京とどちらが好きですか', translation: 'Which do you like more, Kyoto or Tokyo?' },
    { text: 'ポーランドの方がイタリアより好きです', translation: 'I prefer Poland over Italy' },
    { text: 'ラーメンの方がおいしいです', translation: 'Ramen is tastier' },
    { text: '伝統的な町が好きですから', translation: 'Because I like traditional towns' },
  ],
  italian: [
    { text: 'Buongiorno', translation: 'Good morning' },
    { text: 'Buonasera', translation: 'Good evening' },
    { text: 'Grazie mille', translation: 'Thank you very much' },
    { text: 'Mi scusi', translation: 'Excuse me' },
    { text: 'Come si chiama', translation: 'What is your name?' },
    { text: 'Sono uno studente', translation: 'I am a student' },
    { text: 'Studio italiano', translation: 'I study Italian' },
    { text: 'Oggi fa freddo', translation: 'Today it is cold' },
    { text: 'Domani è martedì', translation: 'Tomorrow is Tuesday' },
  ],
};

// Health check wrapper component
function HealthCheckWrapper({ children }: { children: React.ReactNode }) {
  const [healthStatus, setHealthStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  const checkHealth = async () => {
    setHealthStatus('checking');
    try {
      const response = await fetch(`${API_URL}/api/health`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        // Short timeout for quick feedback
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok) {
        setHealthStatus('online');
      } else {
        setHealthStatus('offline');
      }
    } catch (error) {
      setHealthStatus('offline');
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  if (healthStatus === 'checking') {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p>Checking connection...</p>
        </div>
      </div>
    );
  }

  if (healthStatus === 'offline') {
    return <OfflineScreen apiUrl={API_URL} onRetry={checkHealth} />;
  }

  return <>{children}</>;
}

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

function MemoryModeWrapper() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        // Use dedicated endpoint for Memory Mode (includes vocabulary/grammar)
        const response = await fetch(`${API_URL}/api/lessons/memory`, {
          headers: {
            'X-Password': getPassword(),
          },
        });
        if (response.ok) {
          const data = await response.json();
          const lessonsArray = data.lessons || data;
          console.log('MemoryMode: Fetched', lessonsArray.length, 'lessons with vocab/grammar');
          setLessons(Array.isArray(lessonsArray) ? lessonsArray : []);
        } else {
          console.error('MemoryMode: Failed to fetch lessons:', response.status);
          setLessons([]);
        }
      } catch (error) {
        console.error('Failed to fetch lessons:', error);
        setLessons([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, []);

  if (loading) {
    return (
      <AuthenticatedRoute>
        <div className="flex justify-content-center align-items-center min-h-screen">
          <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }} />
        </div>
      </AuthenticatedRoute>
    );
  }

  return (
    <AuthenticatedRoute>
      <MemoryMode lessons={lessons} />
    </AuthenticatedRoute>
  );
}


export default App;
// Build: Mon Feb 16 15:51:09 CET 2026
