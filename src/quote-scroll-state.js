export const quoteTiming = { enter: .45, firstHold: .14, lineHold: .08, lastHold: .14, overlap: .32, lyricsExit: .45 };
const clamp = value => Math.min(1, Math.max(0, value));
const ease = value => value * value * (3 - 2 * value);

/** Brief reading stops scale with the viewport, capped for a light scroll feel. */
export function quoteReadingLayout(height, offsets) {
  const lineHold = Math.min(80, Math.max(40, height * quoteTiming.lineHold));
  let distance = 0;
  const stops = offsets.map((offset, index) => {
    if (index) distance += offset - offsets[index - 1];
    const start = distance;
    distance += offsets.length === 1 ? height * (quoteTiming.firstHold + quoteTiming.lastHold)
      : index === 0 ? height * quoteTiming.firstHold
        : index === offsets.length - 1 ? height * quoteTiming.lastHold : lineHold;
    return { offset, start, end: distance };
  });
  return { stops, travel: offsets.at(-1) ?? 0, runway: distance };
}

function readingTravel(distance, stops) {
  for (let index = 0; index < stops.length; index++) {
    const stop = stops[index];
    if (distance <= stop.end) return stop.offset;
    const next = stops[index + 1];
    if (next && distance < next.start) {
      const progress = clamp((distance - stop.end) / (next.start - stop.end));
      // Ease to rest at both ends; reversing input follows the same curve.
      return stop.offset + (next.offset - stop.offset) * ease(progress);
    }
  }
  return stops.at(-1)?.offset ?? 0;
}

/** Scroll distances, rather than timers, control the reversible scene phases. */
export function quoteScrollState(distance, { height, stops, runway, exit }) {
  const enter = clamp((distance + height * quoteTiming.enter) / (height * quoteTiming.enter));
  const leave = clamp((distance - runway) / exit);
  return {
    travel: readingTravel(distance, stops),
    mediaOpacity: enter * (1 - leave),
    lyricsOpacity: 1 - clamp(leave / quoteTiming.lyricsExit),
  };
}
