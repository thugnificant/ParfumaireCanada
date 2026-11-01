/** Higgsfield reception plate: the tower sits beside the right side of the oak alcove. */
export const businessScene = {
  width: 2752,
  height: 1536,
  footX: 0.604,
  footY: 0.775,
  canvasHeight: 0.34,
  cropX: 0.604,
  footOffset: 0.479,
} as const;
export function businessPlacement(width: number, height: number) {
  const fit = Math.max(width / businessScene.width, height / businessScene.height);
  const w = businessScene.width * fit,
    h = businessScene.height * fit;
  return {
    x: (width - w) * businessScene.cropX + w * businessScene.footX,
    y: height - h * (1 - businessScene.footY),
    height: h * businessScene.canvasHeight,
  };
}
