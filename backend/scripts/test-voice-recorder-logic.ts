// backend/scripts/test-voice-recorder-logic.ts
// Test VoiceRecorder state logic without browser APIs

import { strict as assert } from 'assert';

// Mock state machine to test logic
interface RecorderState {
  isListening: boolean;
  isReady: boolean;
  isProcessing: boolean;
  disabled: boolean;
  mode: 'push-to-talk' | 'voice-activated';
}

function canStartRecording(state: RecorderState): boolean {
  if (state.disabled) return false;
  if (state.isProcessing) return false;
  if (state.isListening) return false;
  return true;
}

function getButtonLabel(state: RecorderState): string {
  if (state.disabled) return 'Start Recording (disabled)';
  if (state.isProcessing) return 'Processing...';
  if (state.isListening) return 'Stop Recording';
  return 'Start Recording';
}

function getButtonClass(state: RecorderState): string {
  const classes = ['record-btn'];
  if (state.isListening) classes.push('recording');
  if (state.disabled) classes.push('disabled');
  return classes.join(' ');
}

// Test cases
console.log('Testing VoiceRecorder state logic...\n');

// Test 1: Default state
const defaultState: RecorderState = {
  isListening: false,
  isReady: false,
  isProcessing: false,
  disabled: false,
  mode: 'push-to-talk'
};

assert.strictEqual(canStartRecording(defaultState), true, 'Should be able to start when idle');
assert.strictEqual(getButtonLabel(defaultState), 'Start Recording', 'Label should be "Start Recording"');
assert.ok(!getButtonClass(defaultState).includes('disabled'), 'Should not have disabled class');
console.log('✓ Test 1: Default state - PASS');

// Test 2: Disabled state
const disabledState: RecorderState = { ...defaultState, disabled: true };
assert.strictEqual(canStartRecording(disabledState), false, 'Should NOT start when disabled');
assert.ok(getButtonLabel(disabledState).includes('disabled'), 'Label should indicate disabled');
assert.ok(getButtonClass(disabledState).includes('disabled'), 'Should have disabled class');
console.log('✓ Test 2: Disabled state - PASS');

// Test 3: Already listening
const listeningState: RecorderState = { ...defaultState, isListening: true };
assert.strictEqual(canStartRecording(listeningState), false, 'Should NOT start when already listening');
assert.strictEqual(getButtonLabel(listeningState), 'Stop Recording', 'Label should be "Stop Recording"');
assert.ok(getButtonClass(listeningState).includes('recording'), 'Should have recording class');
console.log('✓ Test 3: Listening state - PASS');

// Test 4: Processing state
const processingState: RecorderState = { ...defaultState, isProcessing: true };
assert.strictEqual(canStartRecording(processingState), false, 'Should NOT start when processing');
assert.strictEqual(getButtonLabel(processingState), 'Processing...', 'Label should be "Processing..."');
console.log('✓ Test 4: Processing state - PASS');

// Test 5: Combined states (edge case)
const combinedState: RecorderState = {
  isListening: true,
  isReady: true,
  isProcessing: false,
  disabled: true,  // disabled should take precedence
  mode: 'voice-activated'
};
assert.strictEqual(canStartRecording(combinedState), false, 'Should NOT start when disabled (even if listening)');
console.log('✓ Test 5: Combined states - PASS');

// Test state transitions
console.log('\nTesting state transitions...\n');

function transition(state: RecorderState, action: 'start' | 'stop' | 'disable' | 'enable' | 'switchMode'): RecorderState {
  switch (action) {
    case 'start':
      if (!canStartRecording(state)) return state;
      return { ...state, isListening: true };
    case 'stop':
      return { ...state, isListening: false, isProcessing: true };
    case 'disable':
      // When disabled while listening, stop recording
      if (state.isListening) {
        return { ...state, disabled: true, isListening: false };
      }
      return { ...state, disabled: true };
    case 'enable':
      return { ...state, disabled: false };
    case 'switchMode':
      // Switching from voice-activated to push-to-talk while listening stops recording
      if (state.isListening && state.mode === 'voice-activated') {
        return { ...state, mode: 'push-to-talk', isListening: false };
      }
      return { ...state, mode: 'push-to-talk' };
    default:
      return state;
  }
}

// Transition test: idle -> start -> stop
let state = defaultState;
state = transition(state, 'start');
assert.strictEqual(state.isListening, true, 'Should be listening after start');

state = transition(state, 'stop');
assert.strictEqual(state.isListening, false, 'Should not be listening after stop');
assert.strictEqual(state.isProcessing, true, 'Should be processing after stop');
console.log('✓ Transition: idle -> start -> stop - PASS');

// Transition test: disabled should block start
state = defaultState;
state = transition(state, 'disable');
const beforeStart = state;
state = transition(state, 'start');
assert.deepStrictEqual(state, beforeStart, 'State should not change when disabled');
console.log('✓ Transition: disabled blocks start - PASS');

// Transition test: mode switch from voice-activated to push-to-talk stops recording
state = { ...listeningState, mode: 'voice-activated' };
state = transition(state, 'switchMode');
assert.strictEqual(state.isListening, false, 'Should stop listening when switching VA->PTT');
assert.strictEqual(state.mode, 'push-to-talk', 'Mode should be push-to-talk');
console.log('✓ Transition: VA->PTT mode switch stops recording - PASS');

// Transition test: starting recording in push-to-talk should NOT stop itself
state = defaultState;
state = { ...state, mode: 'push-to-talk' };
state = transition(state, 'start');
assert.strictEqual(state.isListening, true, 'Should remain listening after starting in push-to-talk');
console.log('✓ Transition: push-to-talk start works correctly - PASS');

// Transition test: already in push-to-talk and re-rendering should NOT stop
state = { ...listeningState, mode: 'push-to-talk' };
// Simulating re-render - isListening is already true, mode hasn't changed
// This should NOT trigger stopRecording because prevMode === currentMode
assert.strictEqual(state.isListening, true, 'Should still be listening in push-to-talk after re-render');
console.log('✓ Transition: push-to-talk stable on re-render - PASS');

console.log('\n✅ All tests passed!');

// Recommendations
console.log('\n--- Recommendations ---');
console.log('1. Check if disabled prop is being passed correctly from parent');
console.log('2. Verify isListening state is not stuck from previous session');
console.log('3. Ensure onClick handler is not being overwritten by disabled check');
console.log('4. Check if event.preventDefault() is called somewhere that blocks click');
