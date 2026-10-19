import { copy, currentLanguage } from '../i18n.js';

const messages = {
  'Piano recording is not ready.': 'La grabación de piano no está lista.', 'Score file save aborted.': 'Se canceló el guardado de la partitura.',
  required: 'obligatorio', 'unknown field': 'campo desconocido', 'cannot be empty': 'no puede estar vacío', 'too long': 'demasiado largo',
  'must start at 0': 'debe comenzar en 0', 'outside variant': 'fuera de la variante', 'must be strictly increasing': 'debe ser estrictamente creciente',
  'require startTick < endTick <= lengthTicks': 'se requiere startTick < endTick <= lengthTicks', 'regions overlap or are unordered': 'las regiones se solapan o están desordenadas',
  'measures must cover timeline without gaps': 'los compases deben cubrir la línea temporal sin huecos', 'measure exceeds its meter length': 'el compás supera la duración de su métrica',
  'set true for pickup/incomplete measure': 'establece true para una anacrusa o compás incompleto', 'final endTick must equal lengthTicks': 'el endTick final debe ser igual a lengthTicks',
  'changes must start on measure boundaries': 'los cambios deben comenzar al inicio de un compás', 'note ends beyond lengthTicks': 'la nota termina después de lengthTicks',
  'unknown track': 'pista desconocida', 'duplicate track/tick': 'pista/tick duplicados', 'unknown measure': 'compás desconocido', 'unknown variant': 'variante desconocida',
  'Invalid exercise library or practice settings.': 'Biblioteca de ejercicios o ajustes de práctica no válidos.', 'Exercise no longer exists.': 'El ejercicio ya no existe.',
  'Metronome grid is too dense. Choose beats or a larger subdivision.': 'La cuadrícula del metrónomo es demasiado densa. Elige pulsos o una subdivisión mayor.'
};
const prefixes = { 'Piano recording could not load: ': 'No se pudo cargar la grabación de piano: ', 'minimum ': 'mínimo ', 'maximum ': 'máximo ', 'must be greater than ': 'debe ser mayor que ', 'supported value is ': 'el valor admitido es ', 'choose ': 'elige ', 'duplicate ': 'duplicado ', 'unknown track ': 'pista desconocida ' };
const types = { array: 'una lista', object: 'un objeto', integer: 'un entero', number: 'un número', string: 'un texto', boolean: 'un booleano' };
function explanation(message) {
  if (Object.hasOwn(messages, message)) return messages[message];
  for (const [prefix, translated] of Object.entries(prefixes)) {
    if (message.startsWith(prefix)) return translated + message.slice(prefix.length);
  }
  if (message.startsWith('expected ')) return `se esperaba ${types[message.slice(9)] ?? message.slice(9)}`;
  const entries = /^requires at least (\d+) entries$/.exec(message);
  if (entries) return `se requieren al menos ${entries[1]} elementos`;
  return copy(message);
}
function fieldLine(line) {
  for (let separator = line.indexOf(': '); separator >= 0; separator = line.indexOf(': ', separator + 2)) {
    const message = line.slice(separator + 2);
    const translated = explanation(message);
    if (translated !== message) return line.slice(0, separator + 2) + translated;
  }
  return line;
}
function errorLine(line) {
  if (line.startsWith('JSON: ')) return 'JSON no válido. Revisa la sintaxis del archivo.';
  const duplicate = /^Exercise ID (.*) already exists\. Delete it first or import with a new ID\.$/.exec(line);
  if (duplicate) return `El ID de ejercicio ${duplicate[1]} ya existe. Elimínalo primero o importa con otro ID.`;
  if (line.startsWith('$')) return fieldLine(line);
  return explanation(line);
}
export function playerError(message) { return currentLanguage() === 'es' ? message.split('\n').map(errorLine).join('\n') : message; }
