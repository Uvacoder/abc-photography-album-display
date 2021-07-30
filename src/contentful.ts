const hiRes = (size: number): number =>
  Math.floor(size * (window.devicePixelRatio ?? 1));

export const thumb =
  (size: number) =>
  ({ url: string }: { url: string }): string =>
    `${{ url: string }.url}?fm=webp&fit=thumb&w=${hiRes(size)}&h=${hiRes(
      size,
    )}&q=75`;

export const sized =
  ({ width, height }: { width: number; height: number }) =>
  ({ url: string }: { url: string }) =>
    `${{ url: string }.url}?fm=webp&w=${hiRes(width)}&h=${hiRes(height)}&q=95`;
