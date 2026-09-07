import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../Header/index.js';
import { useProgressData, computeMaxActivity } from '../../hooks/useProgressData.js';
import { OverviewCards } from './OverviewCards.js';
import { JLPTProgress } from './JLPTProgress.js';
import { ActivityChartSection } from './ActivityChartSection.js';
import { CategoryBreakdownSection } from './CategoryBreakdownSection.js';
import { WeakPointsSection } from './WeakPointsSection.js';
import { QuickActions } from './QuickActions.js';
import './ProgressDashboard.css';

export const ProgressDashboard: React.FC = () => {
  const navigate = useNavigate();
  const {
    loading,
    error,
    overview,
    jlptLevels,
    weakCategories,
    weakPatterns,
    confusedPairs,
    activity,
    categories,
  } = useProgressData();

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

  const maxActivityValue = computeMaxActivity(activity);

  return (
    <div className="app">
      <Header title="Progress Dashboard" icon="📊" showBackButton={true} />
      <main className="progress-dashboard">
        {overview && <OverviewCards overview={overview} />}

        <JLPTProgress levels={jlptLevels} />

        <div className="dashboard-grid">
          <ActivityChartSection activity={activity} maxValue={maxActivityValue} />
          <CategoryBreakdownSection categories={categories} />
        </div>

        <WeakPointsSection
          weakCategories={weakCategories}
          weakPatterns={weakPatterns}
          confusedPairs={confusedPairs}
          onPractice={(path) => navigate(path)}
        />

        <QuickActions onNavigate={(path) => navigate(path)} />
      </main>
    </div>
  );
};

export default ProgressDashboard;
