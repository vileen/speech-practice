import { useNavigate, useParams } from 'react-router-dom';
import { AuthenticatedRoute } from '../App.js';
import { LessonMode } from '../components/LessonMode/index.js';

function LessonModeWrapper() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const password = localStorage.getItem('speech_practice_password') || '';

  const handleBack = () => {
    navigate('/lessons');
  };

  const handleStartLessonChat = (lessonId: string, _lessonTitle: string) => {
    navigate(`/lessons/${lessonId}/setup`);
  };

  const handleSelectLesson = (lessonId: string | null) => {
    if (lessonId) {
      navigate(`/lessons/${lessonId}`);
    } else {
      navigate('/lessons');
    }
  };

  return (
    <LessonMode
      password={password}
      onBack={handleBack}
      onStartLessonChat={handleStartLessonChat}
      onSelectLesson={handleSelectLesson}
      selectedLessonId={id}
    />
  );
}

export function LessonDetail() {
  return (
    <AuthenticatedRoute>
      <LessonModeWrapper />
    </AuthenticatedRoute>
  );
}
