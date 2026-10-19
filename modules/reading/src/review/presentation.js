function question(card, capabilities) { return capabilities.qa && card.kind === 'qa' && typeof card.question === 'string' && typeof card.answer === 'string'; }

export function createReviewPresentation(cards, capabilities = {}) {
  let index = 0;
  let revealed = false;
  function current() {
    const card = cards[index];
    if (!card) return null;
    if (question(card, capabilities)) return { kind: 'qa', question: card.question, answer: revealed ? card.answer : null, revealed };
    return { kind: 'highlight', text: String(card.text ?? ''), title: String(card.title ?? ''), author: String(card.author ?? '') };
  }
  return {
    current, reveal: () => { revealed = true; },
    next: () => { index = Math.min(cards.length, index + 1); revealed = false; },
    previous: () => { index = Math.max(0, index - 1); revealed = false; },
  };
}
