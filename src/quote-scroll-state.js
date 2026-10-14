export const quoteTiming = { enter: .45, firstHold: .14, lastHold: .14, overlap: .32, lyricsExit: .45 };
const clamp = value => Math.min(1, Math.max(0, value));

/** Scroll distances, rather than timers, control the reversible scene phases. */
export function quoteScrollState(distance, { height, travel, runway, exit }) {
  const enter = clamp((distance + height * quoteTiming.enter) / (height * quoteTiming.enter));
  const leave = clamp((distance - runway) / exit);
  return {
    travel: Math.min(travel, Math.max(0, distance - height * quoteTiming.firstHold)),
    mediaOpacity: enter * (1 - leave),
    lyricsOpacity: 1 - clamp(leave / quoteTiming.lyricsExit),
  };
}
