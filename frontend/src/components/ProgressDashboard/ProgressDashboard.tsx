import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../Header/index.js';
import { API_URL } from '../../config/api.js';
import './ProgressDashboard.css';

interface OverviewStats {
  studyTime: {
    thisWeek: number;
    allTime: number;
    unit: string;
  };
  streak: number;
  grammar: {
    mastered: number;
    total: number;
  };
  kanji: {
    learned: number;
    total: number;
  };
  lessons: {
    completed: number;
    total: number;
  };
}

interface JLPTLevel {
  level: string;
  grammar: {
    total: number;
    mastered: number;
    percentage: number;
  };
  kanji: {
    total: number;
    mastered: number;
    percentage: number;
  };
  overall: {
    total: number;
    mastered: number;
    percentage: number;
  };
}

interface WeakCategory {
  category: string;
  accuracy: number;
  totalPatterns: number;
  totalAttempts: number;
}

interface WeakPattern {
  id: number;
  pattern: string;
  category: string;
  jlptLevel: string;
  accuracy: number;
  attempts: number;
  correct: number;
}

interface ConfusedPair {
  patternId: number;
  patternName: string;
  patternCategory: string;
  confusedWithId: number;
  confusedWithName: string;
  count: number;
}

interface ActivityDay {
  date: string;
  grammarAttempts: number;
  kanjiAttempts: number;
  totalSessions: number;
}

interface CategoryBreakdown {
  category: string;
  totalPatterns: number;
  totalAttempts: number;
  accuracy: number;
}

export const ProgressDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [jlptLevels, setJlptLevels] = useState<JLPTLevel[]>([]);
  const [weakCategories, setWeakCategories] = useState<WeakCategory[]>([]);
  const [weakPatterns, setWeakPatterns] = useState<WeakPattern[]>([]);
  const [confusedPairs, setConfusedPairs] = useState<ConfusedPair[]>([]);
  const [activity, setActivity] = useState<ActivityDay[]>([]);
  const [categories, setCategories] = useState<CategoryBreakdown[]>([]);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [overviewRes, levelsRes, weakPointsRes, activityRes, categoriesRes] = await Promise.all([
          fetch(`${API_URL}/api/progress/overview`),
          fetch(`${API_URL}/api/progress/by-level`),
          fetch(`${API_URL}/api/progress/weak-points`),
          fetch(`${API_URL}/api/progress/activity`),
          fetch(`${API_URL}/api/progress/categories`)
        ]);

        if (!overviewRes.ok) throw new Error('Failed to fetch overview');
        if (!levelsRes.ok) throw new Error('Failed to fetch JLPT levels');
        if (!weakPointsRes.ok) throw new Error('Failed to fetch weak points');
        if (!activityRes.ok) throw new Error('Failed to fetch activity');
        if (!categoriesRes.ok) throw new Error('Failed to fetch categories');

        const overviewData = await overviewRes.json();
        const levelsData = await levelsRes.json();
        const weakPointsData = await weakPointsRes.json();
        const activityData = await activityRes.json();
        const categoriesData = await categoriesRes.json();

        setOverview(overviewData);
        setJlptLevels(levelsData.levels);
        setWeakCategories(weakPointsData.weakCategories);
        setWeakPatterns(weakPointsData.weakPatterns);
        setConfusedPairs(weakPointsData.confusedPairs);
        setActivity(activityData.activity);
        setCategories(categoriesData.categories);
      } catch (err) {
        console.error('Error fetching progress data:', err);
        setError('Failed to load progress data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  /*
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };
  */

  const getDayLabel = (dateStr: string): string => {
    const date = new Date(dateStr);
    const today = new Date();
    const diffDays = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const getStreakEmoji = (streak: number): string => {
    if (streak >= 30) return '🔥';
    if (streak >= 14) return '⚡';
    if (streak >= 7) return '💪';
    return '✨';
  };

  const getAccuracyColor = (accuracy: number): string => {
    if (accuracy >= 80) return '#27ae60';
    if (accuracy >= 60) return '#f39c12';
    return '#e74c3c';
  };

  const maxActivityValue = Math.max(...activity.map(d => d.totalSessions), 1);

  if (loading) {
    return (
      <div className="app">
        <Header title="Progress Dashboard" icon="📊" showBackButton={true} />
        <main className="progress-dashboard">
          <div className="loading-container">
            <div className="loading-spinner">📊</div>
            <p>Loading your progress...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <Header title="Progress Dashboard" icon="📊" showBackButton={true} />
        <main className="progress-dashboard">
          <div className="error-container">
            <p className="error-message">{error}</p>
            <button className="retry-btn" onClick={() => window.location.reload()}>
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <Header title="Progress Dashboard" icon="📊" showBackButton={true} />
      <main className="progress-dashboard">
        {/* Overview Cards */}
        {overview && (
          <section className="overview-section">
            <h2>Overview</h2>
            <div className="overview-cards">
              <div className="stat-card streak-card">
                <div className="stat-icon">{getStreakEmoji(overview.streak)}</div>
                <div className="stat-content">
                  <div className="stat-value">{overview.streak}</div>
                  <div className="stat-label">Day Streak</div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">⏱️</div>
                <div className="stat-content">
                  <div className="stat-value">{formatTime(overview.studyTime.thisWeek)}</div>
                  <div className="stat-label">This Week</div>
                  <div className="stat-sublabel">{formatTime(overview.studyTime.allTime)} total</div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">📖</div>
                <div className="stat-content">
                  <div className="stat-value">{overview.grammar.mastered}</div>
                  <div className="stat-label">Grammar Mastered</div>
                  <div className="stat-sublabel">of {overview.grammar.total} patterns</div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">🈁</div>
                <div className="stat-content">
                  <div className="stat-value">{overview.kanji.learned}</div>
                  <div className="stat-label">Kanji Learned</div>
                  <div className="stat-sublabel">of {overview.kanji.total} characters</div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">📚</div>
                <div className="stat-content">
                  <div className="stat-value">{overview.lessons.completed}</div>
                  <div className="stat-label">Lessons</div>
                  <div className="stat-sublabel">of {overview.lessons.total} completed</div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* JLPT Level Progress */}
        <section className="jlpt-section">
          <h2>JLPT Level Progress</h2>
          <div className="jlpt-levels">
            {jlptLevels.map(level => (
              <div key={level.level} className="jlpt-card">
                <div className="jlpt-header">
                  <span className="jlpt-badge">{level.level}</span>
                  <span className="jlpt-percentage">{level.overall.percentage}%</span>
                </div>
                <div className="jlpt-progress-bar">
                  <div 
                    className="jlpt-progress-fill"
                    style={{ width: `${level.overall.percentage}%` }}
                  />
                </div>
                <div className="jlpt-stats">
                  <div className="jlpt-stat">
                    <span className="jlpt-stat-value">{level.grammar.mastered}/{level.grammar.total}</span>
                    <span className="jlpt-stat-label">Grammar</span>
                  </div>
                  <div className="jlpt-stat">
                    <span className="jlpt-stat-value">{level.kanji.mastered}/{level.kanji.total}</span>
                    <span className="jlpt-stat-label">Kanji</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="dashboard-grid">
          {/* Activity Chart */}
          <section className="activity-section">
            <h2>Last 7 Days</h2>
            <div className="activity-chart">
              {activity.map((day, _index) => (
                <div key={day.date} className="activity-bar-container">
                  <div className="activity-bar-wrapper">
                    {day.totalSessions > 0 && (
                      <>
                        <div 
                          className="activity-bar grammar-bar"
                          style={{ 
                            height: `${(day.grammarAttempts / maxActivityValue) * 100}%`,
                            opacity: day.grammarAttempts > 0 ? 1 : 0
                          }}
                          title={`Grammar: ${day.grammarAttempts} attempts`}
                        />
                        <div 
                          className="activity-bar kanji-bar"
                          style={{ 
                            height: `${(day.kanjiAttempts / maxActivityValue) * 100}%`,
                            opacity: day.kanjiAttempts > 0 ? 1 : 0
                          }}
                          title={`Kanji: ${day.kanjiAttempts} attempts`}
                        />
                      </>
                    )}
                    {day.totalSessions === 0 && (
                      <div className="activity-bar empty-bar" />
                    )}
                  </div>
                  <div className="activity-label">{getDayLabel(day.date)}</div>
                  <div className="activity-value">{day.totalSessions}</div>
                </div>
              ))}
            </div>
            <div className="activity-legend">
              <div className="legend-item">
                <div className="legend-color grammar-color" />
                <span>Grammar</span>
              </div>
              <div className="legend-item">
                <div className="legend-color kanji-color" />
                <span>Kanji</span>
              </div>
            </div>
          </section>

          {/* Category Breakdown */}
          <section className="categories-section">
            <h2>Category Breakdown</h2>
            <div className="categories-list">
              {categories.filter(c => c.totalAttempts > 0).slice(0, 8).map(cat => (
                <div key={cat.category} className="category-item">
                  <div className="category-info">
                    <span className="category-name">{cat.category}</span>
                    <span className="category-attempts">{cat.totalAttempts} attempts</span>
                  </div>
                  <div className="category-bar-container">
                    <div 
                      className="category-bar"
                      style={{ 
                        width: `${cat.accuracy}%`,
                        backgroundColor: getAccuracyColor(cat.accuracy)
                      }}
                    />
                  </div>
                  <div className="category-accuracy" style={{ color: getAccuracyColor(cat.accuracy) }}>
                    {cat.accuracy}%
                  </div>
                </div>
              ))}
              {categories.filter(c => c.totalAttempts > 0).length === 0 && (
                <p className="empty-message">No practice data yet. Start practicing to see your progress!</p>
              )}
            </div>
          </section>
        </div>

        {/* Weak Points Section */}
        <section className="weak-points-section">
          <h2>Areas to Improve</h2>
          
          {weakCategories.length > 0 && (
            <div className="weak-categories">
              <h3>Weakest Categories</h3>
              <div className="weak-categories-grid">
                {weakCategories.map(cat => (
                  <div key={cat.category} className="weak-category-card">
                    <div className="weak-category-name">{cat.category}</div>
                    <div className="weak-category-accuracy" style={{ color: getAccuracyColor(cat.accuracy) }}>
                      {cat.accuracy}%
                    </div>
                    <div className="weak-category-meta">
                      {cat.totalAttempts} attempts across {cat.totalPatterns} patterns
                    </div>
                    <button 
                      className="practice-btn"
                      onClick={() => navigate(`/grammar?category=${encodeURIComponent(cat.category)}`)}
                    >
                      Practice
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {weakPatterns.length > 0 && (
            <div className="weak-patterns">
              <h3>Patterns to Review</h3>
              <div className="weak-patterns-list">
                {weakPatterns.slice(0, 5).map(pattern => (
                  <div key={pattern.id} className="weak-pattern-item">
                    <div className="weak-pattern-info">
                      <span className="weak-pattern-name">{pattern.pattern}</span>
                      <span className="weak-pattern-category">{pattern.category}</span>
                    </div>
                    <div className="weak-pattern-stats">
                      <span className="weak-pattern-accuracy" style={{ color: getAccuracyColor(pattern.accuracy) }}>
                        {pattern.accuracy}%
                      </span>
                      <span className="weak-pattern-attempts">{pattern.correct}/{pattern.attempts}</span>
                    </div>
                    <button 
                      className="practice-btn small"
                      onClick={() => navigate(`/grammar?pattern=${pattern.id}`)}
                    >
                      Practice
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {confusedPairs.length > 0 && (
            <div className="confused-pairs">
              <h3>Often Confused</h3>
              <div className="confused-pairs-list">
                {confusedPairs.slice(0, 3).map((pair, _index) => (
                  <div key={_index} className="confused-pair-item">
                    <div className="confused-pair-patterns">
                      <span className="pattern-name">{pair.patternName}</span>
                      <span className="confused-arrow">↔️</span>
                      <span className="pattern-name">{pair.confusedWithName}</span>
                    </div>
                    <div className="confused-pair-meta">
                      <span className="confused-count">{pair.count} confusions</span>
                      <span className="confused-category">{pair.patternCategory}</span>
                    </div>
                    <button 
                      className="practice-btn small"
                      onClick={() => navigate(`/grammar?pattern=${pair.patternId}`)}
                    >
                      Practice
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {weakCategories.length === 0 && weakPatterns.length === 0 && confusedPairs.length === 0 && (
            <div className="empty-weak-points">
              <p>🎉 Great job! No weak points detected yet.</p>
              <p>Keep practicing to build up your data and identify areas for improvement.</p>
            </div>
          )}
        </section>

        {/* Quick Actions */}
        <section className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <button className="action-btn" onClick={() => navigate('/grammar')}>
              <span className="action-icon">📖</span>
              <span>Grammar Drills</span>
            </button>
            <button className="action-btn" onClick={() => navigate('/kanji')}>
              <span className="action-icon">🈁</span>
              <span>Kanji Practice</span>
            </button>
            <button className="action-btn" onClick={() => navigate('/lessons')}>
              <span className="action-icon">📚</span>
              <span>Lessons</span>
            </button>
            <button className="action-btn" onClick={() => navigate('/counters')}>
              <span className="action-icon">🔢</span>
              <span>Counters</span>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ProgressDashboard;
