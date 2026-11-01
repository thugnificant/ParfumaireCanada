document.querySelectorAll<HTMLElement>('[data-photo-hotspots]').forEach((root) => {
  const img = root.querySelector<HTMLImageElement>('img')!,
    dot = root.querySelector<HTMLElement>('.product-hotspot');
  if (!dot) return;
  function place() {
    const width = root.clientWidth,
      height = root.clientHeight,
      w = Number(root.dataset.imageWidth),
      h = Number(root.dataset.imageHeight);
    const fit = Math.max(width / w, height / h),
      [px, py] = getComputedStyle(img).objectPosition.split(' ').map(parseFloat);
    dot!.style.left = `${(width - w * fit) * (px / 100) + w * fit * Number(root.dataset.anchorX)}px`;
    dot!.style.top = `${(height - h * fit) * (py / 100) + h * fit * Number(root.dataset.anchorY)}px`;
  }
  new ResizeObserver(place).observe(root);
  img.addEventListener('load', place);
  place();
});
