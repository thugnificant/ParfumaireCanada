export function srcset(image: { path: string; small: string; width: number; height: number }) {
  const largest = Math.max(image.width, image.height);
  const small = Math.round(image.width * Math.min(1, 640 / largest));
  const large = Math.round(image.width * Math.min(1, 1440 / largest));
  return small === large
    ? `${image.path} ${large}w`
    : `${image.small} ${small}w, ${image.path} ${large}w`;
}
