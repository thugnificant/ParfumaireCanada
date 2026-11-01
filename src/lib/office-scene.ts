/** Coordinates in the commissioned office plate, shared by motion and static layout. */
export const officeScene = {
  width: 2752,
  height: 1536,
  footX: 0.603,
  footY: 0.762,
  canvasHeight: 0.14,
  cropX: 0.603,
  footOffset: 0.463,
} as const;

export function officePlacement(width: number, height: number) {
  const fit = Math.max(width / officeScene.width, height / officeScene.height);
  const imageWidth = officeScene.width * fit;
  const imageHeight = officeScene.height * fit;
  return {
    x: (width - imageWidth) * officeScene.cropX + imageWidth * officeScene.footX,
    y: height - imageHeight * (1 - officeScene.footY),
    height: imageHeight * officeScene.canvasHeight,
  };
}
