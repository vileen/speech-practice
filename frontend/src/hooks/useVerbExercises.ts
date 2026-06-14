import { useCallback } from 'react';
import { Verb, Exercise, PracticeType, AnswerMode, AVAILABLE_FORMS, FORM_DISPLAY_NAMES } from '../components/VerbMode/types.js';

export function useVerbExercises() {
  const generateDistractors = useCallback((correctAnswer: string, group: string, verbs: Verb[]): string[] => {
    const distractors: string[] = [];

    // Common conjugation errors based on group
    if (group === 'I') {
      if (correctAnswer.endsWith('て')) {
        distractors.push(correctAnswer.replace(/て$/, 'で'));
      }
      if (correctAnswer.endsWith('った')) {
        distractors.push(correctAnswer.replace(/った$/, 'た'));
      }
    } else if (group === 'II') {
      if (correctAnswer.endsWith('られる')) {
        distractors.push(correctAnswer.replace(/られる$/, 'れる'));
      }
    }

    // Add random conjugations from other verbs as distractors
    const randomDistractors = verbs
      .map(v => Object.values(v.conjugations))
      .flat()
      .filter((v): v is string => v !== undefined && v !== correctAnswer && !distractors.includes(v))
      .sort(() => Math.random() - 0.5)
      .slice(0, 4 - distractors.length);

    const allOptions = [correctAnswer, ...distractors, ...randomDistractors].slice(0, 4);
    return allOptions.sort(() => Math.random() - 0.5);
  }, []);

  const generateRecognitionExercise = useCallback((verb: Verb, targetForm: string, correctAnswer: string, verbs: Verb[]): Exercise => {
    const distractors = verbs
      .filter(v => v.id !== verb.id && v.conjugations[targetForm])
      .map(v => v.conjugations[targetForm]!)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    const options = [correctAnswer, ...distractors].sort(() => Math.random() - 0.5);

    return {
      verb,
      questionType: 'recognition',
      targetForm,
      prompt: `Which form is "${correctAnswer}"?`,
      correctAnswer,
      options,
    };
  }, []);

  const generateConstructionExercise = useCallback((verb: Verb, targetForm: string, correctAnswer: string, answerMode: AnswerMode, verbs: Verb[]): Exercise => {
    const options = answerMode === 'multiple-choice'
      ? generateDistractors(correctAnswer, verb.group, verbs)
      : undefined;

    return {
      verb,
      questionType: 'construction',
      targetForm,
      prompt: `Conjugate "${verb.dictionary_form}" to ${FORM_DISPLAY_NAMES[targetForm] || targetForm}`,
      correctAnswer,
      options,
    };
  }, [generateDistractors]);

  const generateTransformationExercise = useCallback((verb: Verb, targetForm: string, correctAnswer: string, answerMode: AnswerMode, verbs: Verb[]): Exercise => {
    const availableSourceForms = ['dictionary_form', 'te_form', 'polite', 'negative'].filter(f =>
      f !== targetForm && (f === 'dictionary_form' || verb.conjugations[f])
    );

    const sourceForm = availableSourceForms.length > 0
      ? availableSourceForms[Math.floor(Math.random() * availableSourceForms.length)]
      : 'dictionary_form';

    const sourceValue = sourceForm === 'dictionary_form'
      ? verb.dictionary_form
      : (verb.conjugations[sourceForm] || verb.dictionary_form);

    const options = answerMode === 'multiple-choice'
      ? generateDistractors(correctAnswer, verb.group, verbs)
      : undefined;

    return {
      verb,
      questionType: 'transformation',
      targetForm,
      sourceForm,
      prompt: `Change "${sourceValue}" (${FORM_DISPLAY_NAMES[sourceForm] || sourceForm}) → ${FORM_DISPLAY_NAMES[targetForm] || targetForm}`,
      correctAnswer,
      options,
    };
  }, [generateDistractors]);

  const generateExercise = useCallback((verb: Verb, selectedPracticeType: PracticeType, answerMode: AnswerMode, verbs: Verb[]): Exercise => {
    const availableConjugations = Object.entries(verb.conjugations)
      .filter(([form, value]) => value && AVAILABLE_FORMS.includes(form))
      .map(([form]) => form);

    if (availableConjugations.length === 0) {
      return {
        verb,
        questionType: 'recognition',
        targetForm: 'dictionary_form',
        prompt: `What is the dictionary form of "${verb.reading}"?`,
        correctAnswer: verb.dictionary_form,
      };
    }

    const targetForm = availableConjugations[Math.floor(Math.random() * availableConjugations.length)];
    const correctAnswer = verb.conjugations[targetForm] || '';

    switch (selectedPracticeType) {
      case 'recognition':
        return generateRecognitionExercise(verb, targetForm, correctAnswer, verbs);
      case 'construction':
        return generateConstructionExercise(verb, targetForm, correctAnswer, answerMode, verbs);
      case 'transformation':
        return generateTransformationExercise(verb, targetForm, correctAnswer, answerMode, verbs);
      default:
        return generateConstructionExercise(verb, targetForm, correctAnswer, answerMode, verbs);
    }
  }, [generateRecognitionExercise, generateConstructionExercise, generateTransformationExercise]);

  return { generateExercise, generateDistractors };
}
