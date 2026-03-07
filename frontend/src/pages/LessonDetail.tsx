import { useParams, useNavigate } from 'react-router-dom';
import { AuthenticatedRoute } from '../App.js';
import { LessonMode } from '../components/LessonMode/index.js';

export function LessonDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const handleStartLessonChat = (lessonId: string, lessonTitle: string) => {
    navigate(`/lessons/${lessonId}/setup`, { state: { lessonTitle } });
  };

  return (
    <AuthenticatedRoute>
      <LessonMode
        password={localStorage.getItem('speech_practice_password') || ''}
        onBack={() => navigate('/lessons')}
        onStartLessonChat={handleStartLessonChat}
        selectedLessonId={id}
        onSelectLesson={(selectedId) => {
          if (selectedId && selectedId !== id) {
            navigate(`/lessons/${selectedId}`);
          } else if (!selectedId) {
            navigate('/lessons');
          }
        }}
      />
    </AuthenticatedRoute>
  );
}
