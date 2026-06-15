import { useState, useEffect } from 'react';
import './LessonMode.css';
import { Header } from '../Header/index.js';
import { useLessonMode } from '../../hooks/useLessonMode.js';
import { useLessonFurigana } from '../../hooks/useLessonFurigana.js';
import { LessonList } from './LessonList.js';
import { LessonDetailView } from './LessonDetail.js';

interface LessonModeProps {
  password: string;
  onBack: () => void;
  onStartLessonChat: (lessonId: string, lessonTitle: string) => void;
  selectedLessonId?: string;
  onSelectLesson: (lessonId: string | null) => void;
}

export function LessonMode({ password, onBack, onStartLessonChat, selectedLessonId, onSelectLesson }: LessonModeProps) {
  const [showFurigana, setShowFurigana] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('showFurigana');
      return saved === 'true';
    }
    return false;
  });

  // Save to localStorage when showFurigana changes
  useEffect(() => {
    localStorage.setItem('showFurigana', showFurigana.toString());
  }, [showFurigana]);

  const {
    lessons,
    selectedLesson,
    loading,
    sortOrder,
    setSortOrder,
    selectedTags,
    setSelectedTags,
    allTags,
    sortedLessons,
    lessonsListRef,
    handleLessonClick,
    handleBackToList,
  } = useLessonMode(password, selectedLessonId, onSelectLesson);

  const {
    renderFurigana,
    prefetchLessonFurigana,
  } = useLessonFurigana(password);

  if (loading && lessons.length === 0) {
    return (
      <div className="lesson-mode">
        <Header
          title="Lesson Mode"
          icon="📚"
          onBack={onBack}
        />
        <div className="loading">Loading lessons...</div>
      </div>
    );
  }

  if (loading && selectedLessonId && !selectedLesson) {
    return (
      <div className="lesson-mode">
        <Header
          title="Loading Lesson..."
          icon="📚"
          onBack={handleBackToList}
        />
        <div className="loading">Loading lesson content...</div>
      </div>
    );
  }

  if (selectedLesson) {
    return (
      <LessonDetailView
        lesson={selectedLesson}
        onBack={handleBackToList}
        onStartLessonChat={onStartLessonChat}
        showFurigana={showFurigana}
        setShowFurigana={setShowFurigana}
        renderFurigana={(text: string, reading?: string | null) => renderFurigana(text, showFurigana, reading)}
        renderExplanationWithTables={renderExplanationWithTables}
        prefetchFurigana={prefetchLessonFurigana}
      />
    );
  }

  return (
    <LessonList
      lessons={lessons}
      sortedLessons={sortedLessons}
      allTags={allTags}
      selectedTags={selectedTags}
      setSelectedTags={setSelectedTags}
      sortOrder={sortOrder}
      setSortOrder={setSortOrder}
      onBack={onBack}
      onLessonClick={handleLessonClick}
      lessonsListRef={lessonsListRef}
    />
  );
}

// Render explanation with support for both markdown and HTML tables, and furigana
const renderExplanationWithTables = (explanation: string): React.ReactElement => {
  // Handle undefined/null explanation
  if (!explanation) {
    return <div className="grammar-explanation">No explanation available</div>;
  }

  // Check if explanation contains HTML table
  if (explanation.includes('<table')) {
    return <div className="grammar-explanation" dangerouslySetInnerHTML={{ __html: explanation }} />;
  }

  // Parse markdown tables
  const lines = explanation.split('\n');
  const elements: JSX.Element[] = [];
  let currentTable: string[] = [];
  let tableKey = 0;

  const flushTable = () => {
    if (currentTable.length === 0) return;

    const dataRows = currentTable.filter(row => !row.trim().startsWith('|-'));
    if (dataRows.length === 0) {
      currentTable = [];
      return;
    }

    elements.push(
      <table key={`table-${tableKey++}`} className="grammar-table">
        <tbody>
          {dataRows.map((row, rowIdx) => {
            const cells = row.split('|').map(c => c.trim()).filter(c => c);
            return (
              <tr key={rowIdx}>
                {cells.map((cell, cellIdx) => (
                  <td key={cellIdx}>{cell}</td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    );
    currentTable = [];
  };

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('|')) {
      currentTable.push(line);
    } else {
      flushTable();
      if (trimmed) {
        elements.push(<p key={`p-${i}`}>{line}</p>);
      } else {
        elements.push(<br key={`br-${i}`} />);
      }
    }
  });
  flushTable();

  return <>{elements}</>;
};
