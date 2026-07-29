// Mounted once near the app root. clipPathUnits="objectBoundingBox" means
// every coordinate below is a 0-1 fraction of whatever element references
// it via clip-path: url(#...) -- so the same heart/butterfly definition
// scales correctly whether it's a 56px menu icon or a 320px cake body,
// unlike CSS path() which uses fixed pixel coordinates (see cakeOptions.js
// for the full explanation of that bug).
export default function GlobalSvgDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <defs>
        <clipPath id="shape-heart" clipPathUnits="objectBoundingBox">
          <path d="M0.50 0.97 C0.50 0.97 0.06 0.66 0.06 0.34 C0.06 0.15 0.21 0.03 0.37 0.03 C0.45 0.03 0.50 0.08 0.50 0.17 C0.50 0.08 0.55 0.03 0.63 0.03 C0.79 0.03 0.94 0.15 0.94 0.34 C0.94 0.66 0.50 0.97 0.50 0.97 Z" />
        </clipPath>
        <clipPath id="shape-butterfly" clipPathUnits="objectBoundingBox">
          <path d="M0.5 0.40 C 0.40 0.12 0.20 0.02 0.06 0.08 C 0.00 0.11 0.02 0.28 0.10 0.36 C 0.20 0.46 0.36 0.44 0.5 0.38 C 0.64 0.44 0.80 0.46 0.90 0.36 C 0.98 0.28 1.00 0.11 0.94 0.08 C 0.80 0.02 0.60 0.12 0.5 0.40 C 0.46 0.52 0.42 0.64 0.32 0.72 C 0.24 0.78 0.18 0.68 0.26 0.60 C 0.33 0.53 0.42 0.50 0.5 0.52 C 0.58 0.50 0.67 0.53 0.74 0.60 C 0.82 0.68 0.76 0.78 0.68 0.72 C 0.58 0.64 0.54 0.52 0.5 0.40 Z" />
        </clipPath>
      </defs>
    </svg>
  );
}
