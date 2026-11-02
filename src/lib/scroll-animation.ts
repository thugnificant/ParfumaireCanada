type TimelineConstructor = new (options: { source: Element }) => AnimationTimeline;
type ScrollOptions = KeyframeAnimationOptions & {
  rangeStart: string;
  rangeEnd: string;
  timeline: AnimationTimeline;
};
type RangedAnimation = Animation & { rangeStart: string; rangeEnd: string };

/** Keep phone translation/zoom on the scroll compositor, even during main-thread work.
 * Older browsers retain the same curve through the shared animation clock.
 */
export function scrollAnimations() {
  let animations: Animation[] = [];
  let targets: HTMLElement[] = [];
  let signature = '';
  let previousStart = NaN;
  let previousEnd = NaN;
  let native = false;
  const cancel = () => {
    animations.forEach((a) => a.cancel());
    animations = [];
    targets = [];
    signature = '';
    native = false;
  };
  return {
    get native() {
      return native;
    },
    cancel,
    bind(
      start: number,
      end: number,
      tracks: { element: HTMLElement; frames: Keyframe[] }[],
      enabled: boolean,
    ) {
      const Timeline = (window as Window & { ScrollTimeline?: TimelineConstructor }).ScrollTimeline;
      if (
        !enabled ||
        !matchMedia('(pointer: coarse)').matches ||
        !Timeline ||
        !CSS.supports('animation-range', '0px 1px')
      ) {
        cancel();
        return;
      }
      try {
        const nextSignature = JSON.stringify([start, end, tracks.map((track) => track.frames)]);
        const reusable =
          native &&
          targets.length === tracks.length &&
          targets.every((target, i) => target === tracks[i].element);
        if (reusable && nextSignature === signature) return;
        const rangeStart = `${start}px`,
          rangeEnd = `${Math.max(start + 1, end)}px`;
        if (reusable) {
          // Cancelling and replaying a scroll animation can expose its underlying
          // position for a frame in WebKit, particularly when a lazy photo loads.
          // Keep the timeline attached; update geometry only when it has changed.
          animations.forEach((animation, i) => {
            (animation.effect as KeyframeEffect).setKeyframes(tracks[i].frames);
            if (start !== previousStart) (animation as RangedAnimation).rangeStart = rangeStart;
            if (end !== previousEnd) (animation as RangedAnimation).rangeEnd = rangeEnd;
          });
        } else {
          cancel();
          const timeline = new Timeline({ source: document.documentElement });
          const options: ScrollOptions = {
            timeline,
            rangeStart,
            rangeEnd,
            fill: 'both',
            easing: 'linear',
          };
          for (const { element, frames } of tracks)
            animations.push(element.animate(frames, options));
          targets = tracks.map((track) => track.element);
        }
        signature = nextSignature;
        previousStart = start;
        previousEnd = end;
        native = true;
      } catch {
        cancel();
      }
    },
  };
}

export const motionKeyframes = (sample: (progress: number) => Keyframe) =>
  Array.from({ length: 121 }, (_, index) => ({ ...sample(index / 120), offset: index / 120 }));
