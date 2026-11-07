import React from 'react';
import type { KanjiItem } from './types';

export const KanjiListItem: React.FC<{ item: KanjiItem }> = ({ item }) => {
  const kunyomi = item.readings.filter((r) => r.type === 'kun');
  const onyomi = item.readings.filter((r) => r.type === 'on');

  return (
    <article className="kanji-list-card">
      <div className="kanji-list-card-header">
        <div className="kanji-list-character">{item.character}</div>
        <div className="kanji-list-meta">
          {item.jlpt_level && (
            <span className="kanji-list-badge jlpt">JLPT {item.jlpt_level}</span>
          )}
          {item.stroke_count && (
            <span className="kanji-list-badge strokes">{item.stroke_count} strokes</span>
          )}
          {item.lesson_id && (
            <span className="kanji-list-badge lesson">Lesson {item.lesson_id}</span>
          )}
        </div>
      </div>

      <div className="kanji-list-card-body">
        <div className="kanji-list-section">
          <h3>Meanings</h3>
          <div className="kanji-list-meanings">
            {item.meanings.map((meaning, idx) => (
              <span key={idx} className="kanji-list-meaning">
                {meaning}
              </span>
            ))}
          </div>
        </div>

        <div className="kanji-list-section">
          <h3>Readings</h3>
          <div className="kanji-list-readings">
            {kunyomi.length > 0 && (
              <div className="kanji-list-reading-group">
                <span className="kanji-list-reading-label kunyomi">Kunyomi</span>
                <div className="kanji-list-reading-tags">
                  {kunyomi.map((r, idx) => (
                    <span key={`kun-${idx}`} className="kanji-list-reading-tag kunyomi">
                      {r.reading}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {onyomi.length > 0 && (
              <div className="kanji-list-reading-group">
                <span className="kanji-list-reading-label onyomi">Onyomi</span>
                <div className="kanji-list-reading-tags">
                  {onyomi.map((r, idx) => (
                    <span key={`on-${idx}`} className="kanji-list-reading-tag onyomi">
                      {r.reading}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {item.examples && item.examples.length > 0 && (
          <div className="kanji-list-section">
            <h3>Examples</h3>
            <ul className="kanji-list-examples">
              {item.examples.map((ex, idx) => (
                <li key={idx} className="kanji-list-example">
                  <span className="kanji-list-example-word">{ex.word}</span>
                  <span className="kanji-list-example-reading">({ex.reading})</span>
                  <span className="kanji-list-example-meaning">— {ex.meaning}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </article>
  );
};
