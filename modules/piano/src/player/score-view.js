import { stored } from './library.js';
import { scoreFile, attachmentKey } from './attachments.js';
import { inputValue } from './forms.js';
import { text } from './html.js';

export async function attachScore(ctx, file) {
  if (!['image/png', 'image/jpeg', 'image/webp', 'application/pdf'].includes(file.type)) throw new Error('Choose a PNG, JPEG, WebP image or PDF.');
  const exerciseId = ctx.exercise.id; const variantId = ctx.variant.id;
  const id = inputValue(ctx.container, 'attachmentId').value.trim() || crypto.randomUUID();
  const refs = stored(ctx.library.read().attachments, exerciseId, []);
  if (refs.some(ref => ref.id === id)) throw new Error('Attachment ID already exists. Choose a new ID.');
  const key = attachmentKey(exerciseId, id);
  await scoreFile('put', key, file);
  try {
    ctx.library.update(value => recordAttachment(value, { exerciseId, variantId, ref: { id, name: file.name, type: file.type } }));
  } catch (error) { await scoreFile('delete', key); throw error; }
}
function recordAttachment(value, input) {
  const { exerciseId, variantId, ref } = input;
  const exercise = value.exercises.find(item => item.id === exerciseId);
  if (!exercise) throw new Error('Exercise no longer exists.');
  const variant = exercise.variants.find(item => item.id === variantId);
  variant.scoreReferences ??= [];
  if (!variant.scoreReferences.some(item => item.attachmentId === ref.id)) variant.scoreReferences.push({ id: crypto.randomUUID(), attachmentId: ref.id });
  return { ...value, attachments: { ...value.attachments, [exerciseId]: [...stored(value.attachments, exerciseId, []), ref] } };
}
function scorePreview(ref, url) {
  const preview = document.createElement(ref.type === 'application/pdf' ? 'object' : 'img');
  if (ref.type === 'application/pdf') { preview.data = url; preview.type = ref.type; preview.setAttribute('aria-label', ref.name); }
  else { preview.src = url; preview.alt = ref.name; }
  return preview;
}
export async function showScores(ctx) {
  const generation = ctx.generation;
  const refs = stored(ctx.library.read().attachments, ctx.exercise.id, []);
  const panel = ctx.container.querySelector('[data-player-score]');
  for (const ref of refs) {
    const file = await scoreFile('get', attachmentKey(ctx.exercise.id, ref.id));
    if (ctx.disposed || ctx.generation !== generation) return;
    const title = document.createElement('p'); title.textContent = `${ref.name} (${ref.id})`; panel.append(title);
    if (!file) { title.textContent += ` · ${text('Score file missing; playback is available.')}`; continue; }
    const url = URL.createObjectURL(file); ctx.scoreUrls.push(url);
    const link = document.createElement('a'); link.href = url; link.download = ref.name; link.textContent = text('Download score'); panel.append(link);
    panel.append(scorePreview(ref, url));
  }
  if (!refs.length) panel.textContent = text('No score attached. Playback does not require a score.');
}
