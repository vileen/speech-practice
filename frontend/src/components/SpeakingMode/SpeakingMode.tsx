import React, { useState } from 'react';
import { Header } from '../Header/index.js';
import { ShadowingMode } from './ShadowingMode';
import { ResponseDrillsMode } from './ResponseDrillsMode';
import { ConversationMode } from './ConversationMode';
import './SpeakingMode.css';

type TabMode = 'shadowing' | 'response' | 'conversation';

export const SpeakingMode: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabMode>('shadowing');

  return (
    <div className="app">
      <Header title="Speaking Practice" icon="🎤" showBackButton={true} />
      <main className="speaking-mode-container">
        <div className="mode-tabs">
          <button
            className={`mode-tab ${activeTab === 'shadowing' ? 'active' : ''}`}
            onClick={() => setActiveTab('shadowing')}
          >
            🎧 Shadowing
          </button>
          <button
            className={`mode-tab ${activeTab === 'response' ? 'active' : ''}`}
            onClick={() => setActiveTab('response')}
          >
            ⚡ Response Drills
          </button>
          <button
            className={`mode-tab ${activeTab === 'conversation' ? 'active' : ''}`}
            onClick={() => setActiveTab('conversation')}
          >
            💬 Conversation
          </button>
        </div>

        <div className="mode-content">
          {activeTab === 'shadowing' && <ShadowingMode />}
          {activeTab === 'response' && <ResponseDrillsMode />}
          {activeTab === 'conversation' && <ConversationMode />}
        </div>
      </main>
    </div>
  );
};