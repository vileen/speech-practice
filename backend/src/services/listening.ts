import { pool } from '../db/pool.js';

export interface ListeningPassage {
  id: number;
  title: string;
  level: string;
  audio_url: string;
  transcript: string;
  japanese_text: string | null;
  duration_seconds: number | null;
  difficulty_speed: string | null;
  topic_category: string | null;
  created_at: Date;
}

export interface ListeningQuestion {
  id: number;
  passage_id: number;
  question_text: string;
  question_type: 'main_idea' | 'detail' | 'inference';
  options: string[];
  correct_answer: number;
  explanation: string | null;
}

export interface PassageSummary {
  id: number;
  title: string;
  level: string;
  audio_url: string;
  duration_seconds: number | null;
  difficulty_speed: string | null;
  topic_category: string | null;
  created_at: Date;
}

export interface AnswerSubmission {
  questionId: number;
  selectedOption: number;
}

export interface AnswerResult {
  questionId: number;
  selectedOption: number;
  isCorrect: boolean;
  correctAnswer: number;
  explanation: string | null;
  questionType: string;
}

export interface QuizResult {
  score: number;
  correctCount: number;
  totalQuestions: number;
  results: AnswerResult[];
  listeningTimeSeconds: number | null;
}

/**
 * Fetch all listening passages (without transcript)
 * Optionally filter by level
 */
export async function getPassages(level?: string): Promise<PassageSummary[]> {
  let query = `
    SELECT id, title, level, audio_url, duration_seconds, difficulty_speed, topic_category, created_at
    FROM listening_passages
  `;
  const params: any[] = [];

  if (level) {
    params.push(level);
    query += ` WHERE level = $${params.length}`;
  }

  query += ' ORDER BY level, created_at';

  const result = await pool.query(query, params);
  return result.rows;
}

/**
 * Fetch a single passage by ID (includes audio_url but NOT transcript)
 */
export async function getPassageById(id: number): Promise<PassageSummary | null> {
  const result = await pool.query(
    `SELECT id, title, level, audio_url, duration_seconds, difficulty_speed, topic_category, created_at
     FROM listening_passages WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

/**
 * Fetch full passage with transcript (for admin/internal use or post-quiz reveal)
 */
export async function getPassageWithTranscript(id: number): Promise<ListeningPassage | null> {
  const result = await pool.query(
    'SELECT * FROM listening_passages WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}

/**
 * Get audio URL for a passage
 */
export async function getAudioUrl(id: number): Promise<string | null> {
  const result = await pool.query(
    'SELECT audio_url FROM listening_passages WHERE id = $1',
    [id]
  );
  return result.rows[0]?.audio_url || null;
}

/**
 * Fetch questions for a passage
 */
export async function getQuestionsByPassageId(passageId: number): Promise<ListeningQuestion[]> {
  const result = await pool.query(
    `SELECT id, passage_id, question_text, question_type, options, correct_answer, explanation
     FROM listening_questions 
     WHERE passage_id = $1 
     ORDER BY id`,
    [passageId]
  );
  return result.rows;
}

/**
 * Submit answers and calculate score
 */
export async function submitAnswers(
  passageId: number,
  answers: AnswerSubmission[],
  startTime?: Date,
  endTime?: Date
): Promise<QuizResult> {
  // Get correct answers for this passage
  const questionsResult = await pool.query(
    `SELECT id, correct_answer, explanation, question_type 
     FROM listening_questions 
     WHERE passage_id = $1 
     ORDER BY id`,
    [passageId]
  );

  const questions = questionsResult.rows;
  
  // Calculate score
  let correctCount = 0;
  const results: AnswerResult[] = answers.map((answer) => {
    const question = questions.find((q: any) => q.id === answer.questionId);
    const isCorrect = question && question.correct_answer === answer.selectedOption;
    if (isCorrect) correctCount++;

    return {
      questionId: answer.questionId,
      selectedOption: answer.selectedOption,
      isCorrect,
      correctAnswer: question?.correct_answer,
      explanation: question?.explanation,
      questionType: question?.question_type,
    };
  });

  const totalQuestions = questions.length;
  const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  // Calculate listening time
  const listeningTimeSeconds = startTime && endTime
    ? Math.round((endTime.getTime() - startTime.getTime()) / 1000)
    : null;

  return {
    score,
    correctCount,
    totalQuestions,
    results,
    listeningTimeSeconds,
  };
}

/**
 * Get stats for listening passages
 */
export async function getListeningStats(): Promise<{ byLevel: any[]; totalQuestions: number }> {
  // Count passages by level
  const levelStats = await pool.query(`
    SELECT level, COUNT(*) as count 
    FROM listening_passages 
    GROUP BY level 
    ORDER BY level
  `);

  // Total question count
  const questionStats = await pool.query(`
    SELECT COUNT(*) as total_questions 
    FROM listening_questions
  `);

  return {
    byLevel: levelStats.rows,
    totalQuestions: parseInt(questionStats.rows[0]?.total_questions || '0'),
  };
}
