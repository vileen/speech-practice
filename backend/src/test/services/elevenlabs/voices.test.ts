import { describe, it, expect } from 'vitest';
import { VOICES } from '../../../services/elevenlabs/voices.js';
import type { Language, VoiceStyle, Gender } from '../../../services/elevenlabs/types.js';

// These lists mirror the Language / VoiceStyle / Gender unions in
// services/elevenlabs/types.ts. If a union member is added there, add it
// here — the test then fails until voices.ts gains the matching entry,
// which is exactly the guard we want against incomplete config.
const LANGUAGES: Language[] = ['japanese'];
const VOICE_STYLES: VoiceStyle[] = ['normal', 'anime'];
const GENDERS: Gender[] = ['male', 'female'];

describe('elevenlabs voices config', () => {
  it('should resolve every Language × VoiceStyle × Gender combo to a non-empty voice ID', () => {
    for (const language of LANGUAGES) {
      for (const style of VOICE_STYLES) {
        for (const gender of GENDERS) {
          const voiceId = VOICES[language]?.[style]?.[gender];
          expect(
            voiceId,
            `Missing voice for ${language}/${style}/${gender}`
          ).toBeDefined();
          expect(typeof voiceId).toBe('string');
          expect(voiceId.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it('should use unique voice IDs across all combos', () => {
    const ids: string[] = [];
    for (const language of LANGUAGES) {
      for (const style of VOICE_STYLES) {
        for (const gender of GENDERS) {
          ids.push(VOICES[language][style][gender]);
        }
      }
    }
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('should use valid ElevenLabs voice ID format (alphanumeric, 20 chars)', () => {
    for (const language of LANGUAGES) {
      for (const style of VOICE_STYLES) {
        for (const gender of GENDERS) {
          const voiceId = VOICES[language][style][gender];
          expect(
            voiceId,
            `Invalid voice ID format for ${language}/${style}/${gender}: ${voiceId}`
          ).toMatch(/^[A-Za-z0-9]{20}$/);
        }
      }
    }
  });

  it('should not contain unexpected top-level languages', () => {
    expect(Object.keys(VOICES).sort()).toEqual([...LANGUAGES].sort());
  });
});
