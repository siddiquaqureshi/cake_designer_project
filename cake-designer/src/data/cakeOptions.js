// Central catalog for the cake designer. In production this is what the
// Sequelize-backed /api/options endpoint would return; kept as a plain
// module for now so the frontend runs standalone against no backend.

// IMPORTANT: circle()/inset()/polygon() clip-path functions resolve their
// percentage arguments against the clipped element's own box, so they scale
// correctly at any size. CSS path() does NOT -- its coordinates are fixed
// CSS pixels, so a "0-100" heart drawn with path() renders as a literal
// 100x100px shape no matter how big or small the element is. That was the
// root cause of the heart/butterfly icons showing cut off in the small menu
// cards and floating as a tiny fixed-size blob on the big canvas. Heart and
// butterfly now reference <clipPath> defs (see GlobalSvgDefs.jsx) that use
// clipPathUnits="objectBoundingBox", which *does* scale with element size,
// exactly like the percentage-based CSS functions do for the other shapes.
export const SHAPES = [
  { id: "round", label: "Round", price: 0, clip: "circle(48% at 50% 50%)", ratio: 1 },
  { id: "square", label: "Square", price: 150, clip: "inset(4% round 10%)", ratio: 1 },
  { id: "rectangle", label: "Rectangle", price: 250, clip: "inset(10% 0% round 8%)", ratio: 1.5 },
  { id: "heart", label: "Heart", price: 400, clip: "url(#shape-heart)", ratio: 1 },
  { id: "triangle", label: "Triangle", price: 300, clip: "polygon(50% 6%, 95% 94%, 5% 94%)", ratio: 1 }
];

export const FLAVORS = [
  { id: "vanilla", label: "Vanilla", price: 0, color: "#F7E7C1", crumb: "#F3DFA9" },
  { id: "chocolate", label: "Chocolate Truffle", price: 200, color: "#6B4226", crumb: "#5A3620" },
  { id: "red-velvet", label: "Red Velvet", price: 250, color: "#8B1E3F", crumb: "#7A1B37" },
  { id: "strawberry", label: "Strawberry", price: 200, color: "#F5A9BC", crumb: "#F191A9" },
  { id: "butterscotch", label: "Butterscotch", price: 220, color: "#C98A3B", crumb: "#B87A2E" },
  { id: "blueberry", label: "Blueberry", price: 230, color: "#7C8FCB", crumb: "#6C7EBB" },
  { id: "mango", label: "Mango", price: 220, color: "#F5B940", crumb: "#EEA928" },
  { id: "pistachio", label: "Pistachio", price: 260, color: "#A9C68A", crumb: "#98B778" },
];

export const LAYER_OPTIONS = [1, 2, 3, 4].map((n) => ({
  id: n,
  label: `${n} Layer${n > 1 ? "s" : ""}`,
  price: (n - 1) * 350,
}));

// Fixed "quick pick" fondant tones, still offered alongside the continuous
// hue/saturation/lightness picker for anyone who just wants a one-tap choice.
export const FONDANT_QUICK_PICKS = [
  { id: "none", label: "No Fondant (Buttercream finish)", price: 0, color: null },
  { id: "blush", label: "Blush Pink", price: 500, color: "#F3B6C6" },
  { id: "ivory", label: "Ivory", price: 500, color: "#FBF3E3" },
  { id: "mint", label: "Mint", price: 550, color: "#BFE3CE" },
  { id: "lilac", label: "Lilac", price: 550, color: "#D9C7EE" },
  { id: "charcoal", label: "Charcoal", price: 600, color: "#4B4750" },
];
// kept as FONDANTS too so any existing import still resolves
export const FONDANTS = FONDANT_QUICK_PICKS;

export const FROSTINGS = [
  { id: "none", label: "No Frosting (Naked Cake)", finish: "none", price: 0, swatch: "transparent" },
  { id: "whipped", label: "Vanilla Frosting", finish: "matte", price: 150, image: "/assets/frosting/whipped-cream-frosting.png", swatch: "#FFFDF4" },
  { id: "chocolate", label: "Chocolate Frosting", finish: "glossy", price: 250, image: "/assets/frosting/chocolate-ganache-topping.png", swatch: "#3E2312" },
  { id: "caramel", label: "Caramel Frosting", finish: "glossy", price: 250, image: "/assets/frosting/caramel-topping.png", swatch: "#C47A2B" },
  { id: "strawberry", label: "Strawberry Frosting", finish: "matte", price: 200, image: "/assets/frosting/whipped-cream-frosting.png", swatch: "#F5A9BC" },
  { id: "mint", label: "Mint Frosting", finish: "matte", price: 200, image: "/assets/frosting/whipped-cream-frosting.png", swatch: "#BFE3CE" },
  { id: "oreo", label: "Oreo Cream Frosting", finish: "matte", price: 220, image: "/assets/frosting/oreo-whipped-cream.png", swatch: "#E9E1E6" },
];

export const TOPPINGS = [
  { id: "sprinkles", label: "Sprinkles", price: 80, image: "/assets/toppings/single/sprinkles.png", geometry: "sprinkles", colors: ["#E8547B", "#4FA8E0", "#F5C93F", "#6FCB6F", "#B876D9"] },
  { id: "strawberry", label: "Strawberry", price: 60, image: "/assets/toppings/single/strawberry.png", geometry: "strawberry", color: "#D9334A", accentColor: "#4C8C4A" },
  { id: "freshfruit", label: "Fresh Berries", price: 70, image: "/assets/toppings/single/freshfruit.png", geometry: "berries", colors: ["#3B3068", "#7A2048", "#5C1F3D"] },
  { id: "mango", label: "Mango Coulis Drop", price: 50, image: "/assets/toppings/single/mango.png", geometry: "dome", color: "#F5A72B" },
  { id: "candybar", label: "Candy Bar Piece", price: 90, image: "/assets/toppings/single/candybar.png", geometry: "bar", color: "#6B4226", accentColor: "#E8DCC8" },
];

export const CANDLES = [
  { id: "simple", label: "Classic Candle", price: 50, image: "/assets/candles/simple-single.png", color: "#FDFAF3", stripeColor: "#D94A4A" },
  { id: "curly-gold", label: "Golden Curly Candle", price: 90, image: "/assets/candles/curly-gold.png", color: "#D4AF37", stripeColor: "#F4D976" },
  { id: "curly-silver", label: "Silver Curly Candle", price: 90, image: "/assets/candles/curly-silver.png", color: "#C7C9CC", stripeColor: "#EDEEF0" },
];

export const SPARKLERS = [
  { id: "sparkler", label: "Sparkler Candle", price: 120, image: "/assets/candles/sparkler-single.png", color: "#E8E2D5", stripeColor: "#B8B0A0" },
];

export const STEP_ORDER = [
  "shape",
  "flavor",
  "layers",
  "fondant",
  "frosting",
  "toppings",
  "text",
  "candles",
  "reveal",
];

export function findById(list, id) {
  if (!list || id == null) return null;
  const target = String(id).toLowerCase();
  const match = list.find((item) => {
    if (!item) return false;
    if (String(item.id).toLowerCase() === target) return true;
    if (item.localId && String(item.localId).toLowerCase() === target) return true;
    if (item.topping_id && String(item.topping_id).toLowerCase() === target) return true;
    if (item.candle_id && String(item.candle_id).toLowerCase() === target) return true;
    if (item.frosting_id && String(item.frosting_id).toLowerCase() === target) return true;
    if (item.flavor_id && String(item.flavor_id).toLowerCase() === target) return true;
    if (item.cake_base_id && String(item.cake_base_id).toLowerCase() === target) return true;
    return false;
  });
  if (match) return match;

  const num = Number(id);
  if (!isNaN(num) && num >= 1 && num <= list.length) {
    return list[num - 1];
  }
  return null;
}