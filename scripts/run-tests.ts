// scripts/run-tests.ts
// Run all tests

import { execSync } from 'child_process';
import { existsSync } from 'fs';

const tests = [
  {
    name: 'VoiceRecorder Logic Tests',
    command: 'cd backend && npx tsx scripts/test-voice-recorder-logic.ts',
    critical: true,
  },
  {
    name: 'Backend TypeScript Build',
    command: 'cd backend && npm run build',
    critical: true,
  },
  {
    name: 'Frontend TypeScript Build',
    command: 'cd frontend && npm run build',
    critical: true,
  },
];

let failed = false;

console.log('🧪 Running test suite...\n');

for (const test of tests) {
  process.stdout.write(`${test.name}... `);
  try {
    execSync(test.command, { stdio: 'pipe' });
    console.log('✅ PASS');
  } catch (error) {
    console.log('❌ FAIL');
    console.error(`   Error: ${error.message}`);
    if (test.critical) {
      failed = true;
    }
  }
}

console.log('\n' + (failed ? '❌ Some tests failed' : '✅ All tests passed'));
process.exit(failed ? 1 : 0);
