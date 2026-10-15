

export function isWholeNumber(value) {
  return Number.isInteger(Number(value)) && String(value).trim() !== "";
}

export function positiveInteger(value) {
  return Number.isInteger(Number(value)) && Number(value) > 0;
}

export function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function nonEmptyString(value) {
  return typeof value === "string" && value.trim() !== "";
}

export function getSessionParticipants(session) {
  return Array.isArray(session.participants) ? session.participants : [];
}

export function onlyUnique(value, index, array) {
  return array.indexOf(value) === index;
}

export function recordIdErrors(id, seen, label, duplicate) {
 const errors = [];
 if (!nonEmptyString(id)) errors.push(label + ' is missing id.');
 if (nonEmptyString(id) && seen.has(id)) errors.push(duplicate);
 seen.add(id);
 return errors;
}

export function participantIdErrors(id, seen, label, index) {
 const errors = [];
 if (!nonEmptyString(id)) errors.push(label + ' participant ' + (index + 1) + ' is missing playerId.');
 if (nonEmptyString(id) && seen.has(id)) errors.push(label + ' participant player IDs must be unique.');
 seen.add(id);
 return errors;
}

export function competitiveOutcome(session) { return !session.isCollaborative && session.scoringMode === 'win_loss_tie'; }
