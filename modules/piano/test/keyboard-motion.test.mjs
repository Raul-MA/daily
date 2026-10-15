import { loadModule } from '../../../tests/support/load-module.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
const { CHROMATIC_FLATS, noteToMidi, transpose, semitonesBetween } = await loadModule('piano', 'js/music/notes.js');
const { computeGuideTonesMotion, getKeyboardMotion, GUIDE_TONE_PROGRESSIONS } = await loadModule('piano', 'js/music/voice-leading.js');
test('guide-tone keyboards preserve each voice’s nearest motion across every root', () => {
    for (const root of CHROMATIC_FLATS) {
        for (const progression of GUIDE_TONE_PROGRESSIONS) {
            const targetRoot = transpose(root, progression.rootInterval);
            const motions = motion(root, targetRoot, progression);
            const [source, target] = getKeyboardMotion(motions);
            assert.equal(source.startOctave, target.startOctave);
            assert.equal(source.octaves, target.octaves);
            motions.forEach((motion, index) => {
                const from = source.tones[index];
                const to = target.tones[index];
                const distance = semitonesBetween(motion.fromNote, motion.toNote);
                assert.equal(noteToMidi(to.note, to.octave) - noteToMidi(from.note, from.octave), distance > 6 ? distance - 12 : distance);
                assert.equal(from.degree, motion.fromDegree);
                assert.equal(to.degree, motion.toDegree);
                for (const tone of [from, to]) {
                    const pitch = noteToMidi(tone.note, tone.octave);
                    assert.ok(pitch >= noteToMidi('C', source.startOctave));
                    assert.ok(pitch < noteToMidi('C', source.startOctave + source.octaves));
                }
            });
        }
    }
});
test('guide-tone motion crosses B to C without dropping an octave', () => {
    const [source, target] = getKeyboardMotion([{ fromNote: 'B', fromDegree: '3', toNote: 'C', toDegree: '1' }]);
    assert.equal(target.tones[0].octave, source.tones[0].octave + 1);
    assert.equal(noteToMidi(target.tones[0].note, target.tones[0].octave) - noteToMidi(source.tones[0].note, source.tones[0].octave), 1);
});

function motion(root, targetRoot, progression) {
  if (process.env.DAILY_SOURCE_ROOT) return computeGuideTonesMotion(root, progression.fromChordType, targetRoot, progression.toChordType, progression.resolutions);
  return computeGuideTonesMotion({ root, type: progression.fromChordType }, { root: targetRoot, type: progression.toChordType }, progression.resolutions);
}
