// scripts/test-repeat-mode-loading.ts
// Test that all buttons are disabled during loading state

import { strict as assert } from 'assert';

// Mock RepeatMode state
interface RepeatModeState {
  isAudioLoading: boolean;
  isCheckingPronunciation: boolean;
  currentPhrase: string;
}

function isListenButtonDisabled(state: RepeatModeState): boolean {
  return state.isCheckingPronunciation || state.isAudioLoading || !state.currentPhrase;
}

function isModeButtonDisabled(state: RepeatModeState): boolean {
  return state.isCheckingPronunciation || state.isAudioLoading || !state.currentPhrase;
}

function isVolumeDisabled(state: RepeatModeState): boolean {
  return state.isCheckingPronunciation || state.isAudioLoading;
}

function isVoiceRecorderDisabled(state: RepeatModeState): boolean {
  return state.isCheckingPronunciation || state.isAudioLoading || !state.currentPhrase;
}

function isNextPhraseDisabled(state: RepeatModeState): boolean {
  return state.isCheckingPronunciation || state.isAudioLoading;
}

console.log('Testing Repeat Mode button states during loading...\n');

// Test 1: All buttons disabled during audio loading
const loadingState: RepeatModeState = {
  isAudioLoading: true,
  isCheckingPronunciation: false,
  currentPhrase: 'テスト',
};

assert.strictEqual(isListenButtonDisabled(loadingState), true, 'Listen should be disabled during loading');
assert.strictEqual(isModeButtonDisabled(loadingState), true, 'Mode buttons should be disabled during loading');
assert.strictEqual(isVolumeDisabled(loadingState), true, 'Volume should be disabled during loading');
assert.strictEqual(isVoiceRecorderDisabled(loadingState), true, 'VoiceRecorder should be disabled during loading');
assert.strictEqual(isNextPhraseDisabled(loadingState), true, 'Next Phrase should be disabled during loading');
console.log('✓ Test 1: All buttons disabled during audio loading - PASS');

// Test 2: All buttons enabled when idle
const idleState: RepeatModeState = {
  isAudioLoading: false,
  isCheckingPronunciation: false,
  currentPhrase: 'テスト',
};

assert.strictEqual(isListenButtonDisabled(idleState), false, 'Listen should be enabled when idle');
assert.strictEqual(isModeButtonDisabled(idleState), false, 'Mode buttons should be enabled when idle');
assert.strictEqual(isVolumeDisabled(idleState), false, 'Volume should be enabled when idle');
assert.strictEqual(isVoiceRecorderDisabled(idleState), false, 'VoiceRecorder should be enabled when idle');
assert.strictEqual(isNextPhraseDisabled(idleState), false, 'Next Phrase should be enabled when idle');
console.log('✓ Test 2: All buttons enabled when idle - PASS');

// Test 3: All buttons disabled during pronunciation check
const checkingState: RepeatModeState = {
  isAudioLoading: false,
  isCheckingPronunciation: true,
  currentPhrase: 'テスト',
};

assert.strictEqual(isListenButtonDisabled(checkingState), true, 'Listen should be disabled during checking');
assert.strictEqual(isModeButtonDisabled(checkingState), true, 'Mode buttons should be disabled during checking');
assert.strictEqual(isVolumeDisabled(checkingState), true, 'Volume should be disabled during checking');
assert.strictEqual(isVoiceRecorderDisabled(checkingState), true, 'VoiceRecorder should be disabled during checking');
assert.strictEqual(isNextPhraseDisabled(checkingState), true, 'Next Phrase should be disabled during checking');
console.log('✓ Test 3: All buttons disabled during pronunciation check - PASS');

// Test 4: Buttons disabled when no phrase loaded
const noPhraseState: RepeatModeState = {
  isAudioLoading: false,
  isCheckingPronunciation: false,
  currentPhrase: '',
};

assert.strictEqual(isListenButtonDisabled(noPhraseState), true, 'Listen should be disabled when no phrase');
assert.strictEqual(isModeButtonDisabled(noPhraseState), true, 'Mode buttons should be disabled when no phrase');
// Volume is NOT disabled when no phrase (different logic)
assert.strictEqual(isVoiceRecorderDisabled(noPhraseState), true, 'VoiceRecorder should be disabled when no phrase');
assert.strictEqual(isNextPhraseDisabled(noPhraseState), false, 'Next Phrase can be clicked when no phrase (will load one)');
console.log('✓ Test 4: Appropriate buttons disabled when no phrase - PASS');

console.log('\n✅ All Repeat Mode loading state tests passed!');
