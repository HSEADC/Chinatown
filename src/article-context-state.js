/** Coordinates use document pixels. Array order is the explicit overlap priority. */
export function contextAtPosition(ranges, readingY, previousId = null, tolerance = 24) {
  const previous = ranges.find(range => range.id === previousId);
  if (previous && readingY >= previous.start - tolerance && readingY < previous.end + tolerance) return previous.id;
  return ranges.find(range => readingY >= range.start && readingY < range.end)?.id || null;
}

/** A manual selection survives every automatic transition, including the article end. */
export function selectContextState({ manualId = null, interactionId = null, automaticId = null, endVisible = false, hasNext = false } = {}) {
  if (manualId) return { type: 'material', id: manualId, manual: true };
  if (interactionId) return interactionId === 'next' ? { type: 'next' } : { type: 'material', id: interactionId, manual: false };
  if (endVisible && hasNext) return { type: 'next' };
  if (automaticId) return { type: 'material', id: automaticId, manual: false };
  return { type: 'video' };
}
