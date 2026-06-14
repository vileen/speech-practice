import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useVerbExercises } from '../../hooks/useVerbExercises';
import { Verb } from '../../components/VerbMode/types';

describe('useVerbExercises', () => {
  const mockVerb: Verb = {
    id: 1,
    dictionary_form: '食べる',
    reading: 'たべる',
    meaning: 'to eat',
    group: 'II',
    jlpt_level: 'N5',
    conjugations: {
      te_form: '食べて',
      ta_form: '食べた',
      negative: '食べない',
      past_negative: '食べなかった',
      polite: '食べます',
      polite_negative: '食べません',
      polite_past: '食べました',
      polite_past_negative: '食べませんでした',
      potential: '食べられる',
      volitional: '食べよう',
      imperative: '食べろ',
      conditional: '食べれば',
      passive: '食べられる',
      causative: '食べさせる',
      causative_passive: '食べさせられる',
    }
  };

  const mockVerb2: Verb = {
    id: 2,
    dictionary_form: '行く',
    reading: 'いく',
    meaning: 'to go',
    group: 'I',
    jlpt_level: 'N5',
    conjugations: {
      te_form: '行って',
      ta_form: '行った',
      negative: '行かない',
      polite: '行きます',
    }
  };

  const verbs = [mockVerb, mockVerb2];

  it('generateExercise with recognition practiceType', () => {
    const { result } = renderHook(() => useVerbExercises());
    const exercise = result.current.generateExercise(mockVerb, 'recognition', 'multiple-choice', verbs);
    expect(exercise.questionType).toBe('recognition');
    expect(exercise.verb).toBe(mockVerb);
    expect(exercise.correctAnswer).toBeTruthy();
    expect(exercise.options).toBeDefined();
    expect(exercise.options!.length).toBeGreaterThan(0);
  });

  it('generateExercise with construction practiceType', () => {
    const { result } = renderHook(() => useVerbExercises());
    const exercise = result.current.generateExercise(mockVerb, 'construction', 'multiple-choice', verbs);
    expect(exercise.questionType).toBe('construction');
    expect(exercise.prompt).toContain('Conjugate');
    expect(exercise.options).toBeDefined();
  });

  it('generateExercise with construction practiceType and input mode', () => {
    const { result } = renderHook(() => useVerbExercises());
    const exercise = result.current.generateExercise(mockVerb, 'construction', 'input', verbs);
    expect(exercise.questionType).toBe('construction');
    expect(exercise.options).toBeUndefined();
  });

  it('generateExercise with transformation practiceType', () => {
    const { result } = renderHook(() => useVerbExercises());
    const exercise = result.current.generateExercise(mockVerb, 'transformation', 'multiple-choice', verbs);
    expect(exercise.questionType).toBe('transformation');
    expect(exercise.prompt).toContain('Change');
    expect(exercise.sourceForm).toBeDefined();
    expect(exercise.options).toBeDefined();
  });

  it('generateDistractors produces different options including correct answer', () => {
    const { result } = renderHook(() => useVerbExercises());
    const distractors = result.current.generateDistractors('食べて', 'II', verbs);
    expect(distractors.length).toBeGreaterThan(0);
    expect(distractors).toContain('食べて');
  });

  it('generateRecognitionExercise uses other verbs as distractors', () => {
    const { result } = renderHook(() => useVerbExercises());
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0);
    const exercise = result.current.generateExercise(mockVerb, 'recognition', 'multiple-choice', verbs);
    randomSpy.mockRestore();
    expect(exercise.options).toBeDefined();
    expect(exercise.options!.length).toBeGreaterThan(1);
    expect(exercise.options).toContain(exercise.correctAnswer);
  });

  it('generateExercise falls back to dictionary form when no conjugations available', () => {
    const { result } = renderHook(() => useVerbExercises());
    const emptyVerb: Verb = {
      ...mockVerb,
      conjugations: {}
    };
    const exercise = result.current.generateExercise(emptyVerb, 'construction', 'multiple-choice', verbs);
    expect(exercise.targetForm).toBe('dictionary_form');
    expect(exercise.correctAnswer).toBe('食べる');
  });
});
