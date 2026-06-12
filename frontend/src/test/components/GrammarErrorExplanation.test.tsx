import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GrammarErrorExplanation } from '../../components/GrammarMode/GrammarErrorExplanation';
import type { GrammarPattern } from '../../components/GrammarMode/GrammarMode';

describe('GrammarErrorExplanation', () => {
  const basePattern: GrammarPattern = {
    id: 1,
    pattern: '〜てもいいです',
    category: 'Permission',
    jlpt_level: 'N5',
    formation_rules: [{ rule: 'Verb te-form + もいいです' }],
    examples: [],
    common_mistakes: [],
  };

  it('should render formation rules', () => {
    const pattern: GrammarPattern = {
      ...basePattern,
      formation_rules: [
        { rule: 'Verb te-form + もいいです' },
        { rule: 'Used to ask or give permission' },
      ],
    };

    render(<GrammarErrorExplanation currentPattern={pattern} />);

    expect(screen.getByText('💡 Why this is the correct answer:')).toBeInTheDocument();
    expect(screen.getByText('Verb te-form + もいいです')).toBeInTheDocument();
    expect(screen.getByText('Used to ask or give permission')).toBeInTheDocument();
  });

  it('should render usage context when available', () => {
    const pattern: GrammarPattern = {
      ...basePattern,
      formation_rules: [
        { rule: 'Some rule', usage: 'Used when asking for permission' },
      ],
    };

    render(<GrammarErrorExplanation currentPattern={pattern} />);

    expect(screen.getByText('Usage:')).toBeInTheDocument();
    expect(screen.getByText('Used when asking for permission')).toBeInTheDocument();
  });

  it('should not render usage context when not available', () => {
    const pattern: GrammarPattern = {
      ...basePattern,
      formation_rules: [{ rule: 'Some rule' }],
    };

    render(<GrammarErrorExplanation currentPattern={pattern} />);

    expect(screen.queryByText('Usage:')).not.toBeInTheDocument();
  });

  it('should render common mistakes', () => {
    const pattern: GrammarPattern = {
      ...basePattern,
      common_mistakes: [
        { mistake: '食べるていいです', explanation: 'Should be te-form, not tai-form' },
        { mistake: '食べてもいい', explanation: 'Missing です for polite form' },
      ],
    };

    render(<GrammarErrorExplanation currentPattern={pattern} />);

    expect(screen.getByText('Common mistakes to avoid:')).toBeInTheDocument();
    expect(screen.getByText('❌ 食べるていいです')).toBeInTheDocument();
    expect(screen.getByText('→ Should be te-form, not tai-form')).toBeInTheDocument();
    expect(screen.getByText('❌ 食べてもいい')).toBeInTheDocument();
    expect(screen.getByText('→ Missing です for polite form')).toBeInTheDocument();
  });

  it('should limit common mistakes to 2 items', () => {
    const pattern: GrammarPattern = {
      ...basePattern,
      common_mistakes: [
        { mistake: 'Mistake 1', explanation: 'Explanation 1' },
        { mistake: 'Mistake 2', explanation: 'Explanation 2' },
        { mistake: 'Mistake 3', explanation: 'Explanation 3' },
      ],
    };

    render(<GrammarErrorExplanation currentPattern={pattern} />);

    const listItems = screen.getAllByRole('listitem');
    expect(listItems).toHaveLength(2);
    expect(screen.getByText('❌ Mistake 1')).toBeInTheDocument();
    expect(screen.getByText('❌ Mistake 2')).toBeInTheDocument();
    expect(screen.queryByText('❌ Mistake 3')).not.toBeInTheDocument();
  });

  it('should not render common mistakes section when empty', () => {
    render(<GrammarErrorExplanation currentPattern={basePattern} />);

    expect(screen.queryByText('Common mistakes to avoid:')).not.toBeInTheDocument();
  });

  it('should render Godan hint for Verb Conjugation category', () => {
    const pattern: GrammarPattern = {
      ...basePattern,
      category: 'Verb Conjugation',
      pattern: 'Godan verbs: te-form',
    };

    render(<GrammarErrorExplanation currentPattern={pattern} />);

    expect(screen.getByText('Hint:')).toBeInTheDocument();
    expect(screen.getByText('Godan (Group I) verbs change their final syllable before adding endings.')).toBeInTheDocument();
  });

  it('should render Ichidan hint for Verb Conjugation category', () => {
    const pattern: GrammarPattern = {
      ...basePattern,
      category: 'Verb Conjugation',
      pattern: 'Ichidan verbs: te-form',
    };

    render(<GrammarErrorExplanation currentPattern={pattern} />);

    expect(screen.getByText('Ichidan (Group II) verbs simply drop る and add the ending.')).toBeInTheDocument();
  });

  it('should render irregular verb hint for Verb Conjugation category', () => {
    const pattern: GrammarPattern = {
      ...basePattern,
      category: 'Verb Conjugation',
      pattern: 'する: te-form',
    };

    render(<GrammarErrorExplanation currentPattern={pattern} />);

    expect(screen.getByText('This is an irregular verb - memorize its forms!')).toBeInTheDocument();
  });

  it('should render counter hint for Counters category', () => {
    const pattern: GrammarPattern = {
      ...basePattern,
      category: 'Counters',
    };

    render(<GrammarErrorExplanation currentPattern={pattern} />);

    expect(screen.getByText('Hint:')).toBeInTheDocument();
    expect(screen.getByText('Counter readings change based on the number (some use Japanese readings, others Chinese, with sound changes).')).toBeInTheDocument();
  });

  it('should render particle hint for Particles category', () => {
    const pattern: GrammarPattern = {
      ...basePattern,
      category: 'Particles',
    };

    render(<GrammarErrorExplanation currentPattern={pattern} />);

    expect(screen.getByText('Hint:')).toBeInTheDocument();
    expect(screen.getByText('Particles mark the grammatical function of words in a sentence.')).toBeInTheDocument();
  });

  it('should not render hint for unknown categories', () => {
    render(<GrammarErrorExplanation currentPattern={basePattern} />);

    expect(screen.queryByText('Hint:')).not.toBeInTheDocument();
  });

  it('should handle missing formation_rules gracefully', () => {
    const pattern: GrammarPattern = {
      ...basePattern,
      formation_rules: undefined as any,
    };

    render(<GrammarErrorExplanation currentPattern={pattern} />);

    // Should still render header without crashing
    expect(screen.getByText('💡 Why this is the correct answer:')).toBeInTheDocument();
  });

  it('should handle missing common_mistakes gracefully', () => {
    const pattern: GrammarPattern = {
      ...basePattern,
      common_mistakes: undefined as any,
    };

    render(<GrammarErrorExplanation currentPattern={pattern} />);

    expect(screen.queryByText('Common mistakes to avoid:')).not.toBeInTheDocument();
  });

  it('should render mixed content correctly', () => {
    const pattern: GrammarPattern = {
      id: 2,
      pattern: 'は (topic marker)',
      category: 'Particles',
      jlpt_level: 'N5',
      formation_rules: [
        { rule: 'Noun/phrase + は', usage: 'Marks the topic of a sentence' },
      ],
      examples: [],
      common_mistakes: [
        { mistake: 'Using は for subject', explanation: 'Use が for subject, は for topic' },
      ],
    };

    render(<GrammarErrorExplanation currentPattern={pattern} />);

    // Formation rule
    expect(screen.getByText('Noun/phrase + は')).toBeInTheDocument();
    // Usage
    expect(screen.getByText('Marks the topic of a sentence')).toBeInTheDocument();
    // Mistake
    expect(screen.getByText('❌ Using は for subject')).toBeInTheDocument();
    // Particle hint
    expect(screen.getByText('Particles mark the grammatical function of words in a sentence.')).toBeInTheDocument();
  });
});
