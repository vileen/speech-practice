import { useState, useEffect } from 'react';
import { API_URL } from '../../../config/api.js';

export interface Turn {
  speaker: string;
  japanese: string;
  romaji: string;
  meaning: string;
}

export interface ConversationTemplate {
  id: number;
  title: string;
  scenario: string;
  difficulty: string;
  turns: Turn[];
}

export function useConversationMode() {
  const [templates, setTemplates] = useState<ConversationTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ConversationTemplate | null>(null);
  const [userRole, setUserRole] = useState<string>('');
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [completedTurns, setCompletedTurns] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch(`${API_URL}/api/speaking/templates`);
      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const startConversation = (template: ConversationTemplate, role: string) => {
    setSelectedTemplate(template);
    setUserRole(role);
    setCurrentTurnIndex(0);
    setCompletedTurns(new Set());
  };

  const handleTurnComplete = () => {
    setCompletedTurns(prev => new Set(prev).add(currentTurnIndex));
    setCurrentTurnIndex(prev => prev + 1);
  };

  const playTurn = (turn: Turn) => {
    const utterance = new SpeechSynthesisUtterance(turn.japanese);
    utterance.lang = 'ja-JP';
    speechSynthesis.speak(utterance);
  };

  const goBack = () => {
    setSelectedTemplate(null);
    setUserRole('');
    setCurrentTurnIndex(0);
    setCompletedTurns(new Set());
  };

  const currentTurn = selectedTemplate?.turns[currentTurnIndex];
  const isUserTurn = currentTurn?.speaker === userRole;
  const isComplete = selectedTemplate ? currentTurnIndex >= selectedTemplate.turns.length : false;

  return {
    templates,
    selectedTemplate,
    userRole,
    currentTurnIndex,
    loading,
    completedTurns,
    currentTurn,
    isUserTurn,
    isComplete,
    setSelectedTemplate,
    startConversation,
    handleTurnComplete,
    playTurn,
    goBack,
  };
}
