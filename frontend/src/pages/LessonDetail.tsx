import { AuthenticatedRoute } from '../App.js';
import { LessonMode } from '../components/LessonMode/index.js';

export function LessonDetail() {
  return (
    <AuthenticatedRoute>
      <LessonMode />
    </AuthenticatedRoute>
  );
}
