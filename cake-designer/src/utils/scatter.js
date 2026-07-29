// Shared placement algorithm for anything that gets scattered across the
// cake surface in bulk (toppings, sprinkles, candles). Uses simple
// rejection sampling so pieces land at randomized positions/rotations/sizes
// without piling on top of each other -- this is what makes multiple
// pieces read as "scattered naturally" instead of "one big image pasted on".
//
// region: { cx, cy, rx, ry } in percentage units (0-100), an ellipse
// roughly matching the visible top surface of the cake body.
export function scatterInEllipse(count, region, { minDist = 8, maxAttempts = 30 } = {}) {
  const { cx, cy, rx, ry } = region;
  const points = [];

  for (let i = 0; i < count; i++) {
    let placed = false;
    for (let attempt = 0; attempt < maxAttempts && !placed; attempt++) {
      // uniform-ish sample inside the ellipse
      const angle = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random());
      const x = cx + Math.cos(angle) * rx * r;
      const y = cy + Math.sin(angle) * ry * r;

      const tooClose = points.some((p) => {
        const dx = (p.x - x) / (rx || 1);
        const dy = (p.y - y) / (ry || 1);
        return Math.sqrt(dx * dx + dy * dy) * 100 < minDist;
      });

      if (!tooClose) {
        points.push({
          x: Math.min(94, Math.max(6, x)),
          y: Math.min(90, Math.max(10, y)),
          rotation: Math.round(Math.random() * 360),
          scale: 0.75 + Math.random() * 0.5,
        });
        placed = true;
      }
    }
    // if we ran out of room, place it anyway so "add 20" never silently drops items
    if (!placed) {
      const angle = Math.random() * Math.PI * 2;
      points.push({
        x: Math.min(94, Math.max(6, cx + Math.cos(angle) * rx * 0.9)),
        y: Math.min(90, Math.max(10, cy + Math.sin(angle) * ry * 0.9)),
        rotation: Math.round(Math.random() * 360),
        scale: 0.75 + Math.random() * 0.5,
      });
    }
  }
  return points;
}

// The cake's top surface, roughly, in the CakePreview's own 0-100 box.
export const CAKE_TOP_REGION = { cx: 50, cy: 42, rx: 32, ry: 16 };
export const CAKE_TOP_EDGE_REGION = { cx: 50, cy: 30, rx: 34, ry: 8 };
