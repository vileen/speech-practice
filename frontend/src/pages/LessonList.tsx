import { AuthenticatedRoute } from '../App.js';
import { LessonMode } from '../components/LessonMode/index.js';

export function LessonList() {
  return (
    <AuthenticatedRoute>
      <LessonMode />
    </AuthenticatedRoute>
  );
}
