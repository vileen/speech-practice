import { useNavigate } from 'react-router-dom';
import { AuthenticatedRoute } from '../App.js';
import { LessonMode } from '../components/LessonMode/index.js';

export function LessonList() {
  const navigate = useNavigate();

  const handleStartLessonChat = (lessonId: string, lessonTitle: string) => {
    navigate(`/lessons/${lessonId}/setup`, { state: { lessonTitle } });
  };

  return (
    <AuthenticatedRoute>
      <LessonMode
        password={localStorage.getItem('speech_practice_password') || ''}
        onBack={() => navigate('/')}
        onStartLessonChat={handleStartLessonChat}
        selectedLessonId={undefined}
        onSelectLesson={(id) => {
          if (id) navigate(`/lessons/${id}`);
        }}
      />
    </AuthenticatedRoute>
  );
}
