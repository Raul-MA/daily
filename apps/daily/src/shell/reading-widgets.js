import { readerWidget } from '../../../../modules/reading/src/widget.js';
import { reviewWidget } from '../../../../modules/reading/src/review/widget.js';

export function refreshReadingWidgets(context) {
  if (context.route.page !== 'home' || document.hidden) return;
  const language = context.state.read().value.preferences.language;
  const reader = context.root.querySelector('[data-reading-reader]');
  const review = context.root.querySelector('[data-reading-review]');
  reader?.replaceWith(readerWidget(context.reading, language));
  review?.replaceWith(reviewWidget(context.reading, language));
}
