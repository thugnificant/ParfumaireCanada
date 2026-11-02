type TimelineConstructor = new (options: { source: Element }) => AnimationTimeline;
type ScrollOptions = KeyframeAnimationOptions & {
  rangeStart: string;
  rangeEnd: string;
  timeline: AnimationTimeline;
};

/** Keep phone translation/zoom on the scroll compositor, even during main-thread work.
 * Older browsers retain the same curve through the shared animation clock.
 */
export function scrollAnimations() {
  let animations: Animation[] = [];
  let native = false;
  const cancel = () => {
    animations.forEach((a) => a.cancel());
    animations = [];
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
      cancel();
      const Timeline = (window as Window & { ScrollTimeline?: TimelineConstructor }).ScrollTimeline;
      if (
        !enabled ||
        !matchMedia('(pointer: coarse)').matches ||
        !Timeline ||
        !CSS.supports('animation-range', '0px 1px')
      )
        return;
      try {
        const timeline = new Timeline({ source: document.documentElement });
        const options: ScrollOptions = {
          timeline,
          rangeStart: `${start}px`,
          rangeEnd: `${Math.max(start + 1, end)}px`,
          fill: 'both',
          easing: 'linear',
        };
        for (const { element, frames } of tracks) animations.push(element.animate(frames, options));
        native = true;
      } catch {
        cancel();
      }
    },
  };
}

export const motionKeyframes = (sample: (progress: number) => Keyframe) =>
  Array.from({ length: 121 }, (_, index) => ({ ...sample(index / 120), offset: index / 120 }));
