import axios from "axios";
import {
  SHAPES,
  FLAVORS,
  LAYER_OPTIONS,
  FONDANTS,
  FROSTINGS,
  TOPPINGS,
  CANDLES,
  SPARKLERS,
} from "../data/cakeOptions";

// Point this at your Express server (see backend/README.md). Falls back to
// local mock data ONLY on a genuine network failure (backend not running) --
// once a real backend responds, its errors (validation, auth, etc.) are
// real errors and must propagate, not get silently swallowed by the mock.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 6000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("cd_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// axios sets `err.response` only when the server actually answered (even
// with a 4xx/5xx). No `err.response` means the request never completed --
// connection refused, DNS failure, timeout -- i.e. "no backend running".
// That's the only case we fall back to the local mock; a real validation
// or auth error from a live backend should reach the UI as-is.
function isNetworkError(err) {
  if (!err.response) return true;
  // Vite's dev proxy (or any reverse proxy) answers with 502/503/504 when
  // the upstream backend isn't running at all -- that's "no backend",
  // not a real validation/auth error from a live one.
  return [502, 503, 504].includes(err.response.status);
}

async function withMockFallback(request, mock) {
  try {
    return await request();
  } catch (err) {
    if (!isNetworkError(err)) throw normalizeApiError(err);
    return mock();
  }
}

function normalizeApiError(err) {
  const data = err.response?.data;
  const detailMessages = Array.isArray(data?.details)
    ? data.details.map((detail) => detail?.msg).filter(Boolean)
    : [];

  if (typeof data?.message === "string" && data.message) {
    return new Error(data.message);
  }

  if (typeof data?.error === "string" && data.error) {
    const suffix = detailMessages.length ? `: ${detailMessages.join(" • ")}` : "";
    return new Error(`${data.error}${suffix}`);
  }

  if (detailMessages.length) {
    return new Error(detailMessages.join(" • "));
  }

  return new Error(err.message || "Something went wrong");
}

// --- Inventory field-mapping adapter -----------------------------------
// The backend's rows follow the DB schema exactly (cake_base_id/shape/
// base_price, topping_id/name/price_per_item, etc). The frontend's
// CakeContext/CakePreview/pricing utils were built against a simpler
// {id, label, price, ...visual props} shape. Rather than rewrite every
// component that already consumes that shape, this adapter translates at
// the API boundary: real backend PKs become `id` (so anything created
// downstream -- wishlist, custom cakes, orders -- uses genuine database
// ids), and presentation-only fields the schema doesn't store (clip paths,
// crumb colors, texture images) are merged back in from the local static
// catalog by matching on name/label.
function byLabel(list, label) {
  return list.find((x) => x.label.toLowerCase() === String(label).toLowerCase());
}

function mapShapes(rows) {
  return rows
    .map((r) => {
      const local = byLabel(SHAPES, r.shape);
      if (!local) return null;
      return {
        id: local.id,
        cake_base_id: r.cake_base_id,
        label: r.shape,
        price: Number(r.base_price),
        clip: local.clip,
        ratio: local.ratio || 1,
      };
    })
    .filter(Boolean);
}
function mapFlavors(rows) {
  return rows.map((r) => {
    const local = byLabel(FLAVORS, r.name) || {};
    return { id: r.flavor_id, label: r.name, price: Number(r.price_modifier), color: local.color, crumb: local.crumb };
  });
}
function mapFondants(rows) {
  return rows.map((r) => ({
    id: r.fondant_id,
    label: r.color_name,
    price: Number(r.price_modifier),
    color: r.hex_code,
  }));
}
function findLocalMatch(list, queryStr) {
  if (!queryStr) return null;
  const q = String(queryStr).toLowerCase();
  return list.find((item) => {
    const itemId = String(item.id).toLowerCase();
    const itemLabel = String(item.label || "").toLowerCase();
    const itemFirstWord = itemLabel.split(" ")[0];
    const qFirstWord = q.split(" ")[0];
    return (
      itemId === q ||
      q.includes(itemId.replace("-", " ")) ||
      q.includes(itemId) ||
      itemLabel.includes(q) ||
      q.includes(itemLabel) ||
      q.includes(itemFirstWord) ||
      itemLabel.includes(qFirstWord)
    );
  });
}

function mapFrostings(rows) {
  const result = rows.map((r) => {
    const local = findLocalMatch(FROSTINGS, r.name) || {};
    return {
      id: r.frosting_id,
      localId: local.id || r.frosting_id,
      label: r.name,
      price: Number(r.price_modifier),
      image: local.image,
      swatch: local.swatch || "#FFFDF4",
      finish: local.finish || (r.texture_type?.includes("glossy") ? "glossy" : "matte"),
      dark: local.dark,
    };
  });
  if (!result.some((f) => String(f.id) === "none" || String(f.localId) === "none")) {
    result.unshift({ id: "none", localId: "none", label: "No Frosting (Naked Cake)", finish: "matte", price: 0, swatch: "transparent" });
  }
  return result;
}

function mapToppings(rows) {
  return rows.map((r) => {
    const local = findLocalMatch(TOPPINGS, r.name) || {};
    return {
      id: r.topping_id,
      localId: local.id || r.topping_id,
      label: r.name,
      price: Number(r.price_per_item),
      image: local.image,
      geometry: local.geometry,
      color: local.color,
      colors: local.colors,
      accentColor: local.accentColor,
    };
  });
}

function mapCandles(rows, localCatalog) {
  return rows.map((r) => {
    const styleStr = r.color_style || r.name || r.type || "";
    const local = findLocalMatch(localCatalog, styleStr) || localCatalog[0] || {};
    return {
      id: r.candle_id,
      localId: local.id || r.candle_id,
      label: styleStr,
      price: Number(r.price_per_item),
      image: local.image,
      color: local.color,
      stripeColor: local.stripeColor,
    };
  });
}

// --- Options (GET /api/options) ---
export async function fetchDecorOptions() {
  return withMockFallback(
    async () => {
      const { data } = await api.get("/options");
      return {
        shapes: mapShapes(data.shapes),
        flavors: mapFlavors(data.flavors),
        layers: LAYER_OPTIONS, // layers_count is just an integer on custom_cakes, no catalog table for it
        fondants: mapFondants(data.fondants),
        frostings: mapFrostings(data.frostings),
        toppings: mapToppings(data.toppings),
        candles: mapCandles(data.candles, CANDLES),
        sparklers: mapCandles(data.sparklers, SPARKLERS),
      };
    },
    () => ({
      shapes: SHAPES,
      flavors: FLAVORS,
      layers: LAYER_OPTIONS,
      fondants: FONDANTS,
      frostings: FROSTINGS,
      toppings: TOPPINGS,
      candles: CANDLES,
      sparklers: SPARKLERS,
    })
  );
}

// --- Auth ---
// The backend schema splits first_name/last_name (in user_profiles); the
// signup form collects one "full name" field, so it's split here at the
// API boundary rather than changing the modal's UX.
export async function login(email, password) {
  return withMockFallback(
    async () => {
      const { data } = await api.post("/auth/login", { email, password });
      return { token: data.token, user: { email: data.user.email, name: `${data.user.first_name || ""} ${data.user.last_name || ""}`.trim(), role: data.user.role } };
    },
    async () => {
      await delay(300);
      const users = JSON.parse(localStorage.getItem("cd_users") || "{}");
      const record = users[email];
      if (!record || record.password !== password) throw new Error("Invalid email or password");
      return { token: `local.${email}`, user: { email, name: record.name } };
    }
  );
}

export async function signup(name, email, password) {
  const [first_name, ...rest] = name.trim().split(" ");
  const last_name = rest.join(" ") || first_name;

  return withMockFallback(
    async () => {
      const { data } = await api.post("/auth/signup", { email, password, first_name, last_name });
      return { token: data.token, user: { email: data.user.email, name, role: data.user.role } };
    },
    async () => {
      await delay(300);
      const users = JSON.parse(localStorage.getItem("cd_users") || "{}");
      if (users[email]) throw new Error("An account with this email already exists");
      users[email] = { name, password };
      localStorage.setItem("cd_users", JSON.stringify(users));
      return { token: `local.${email}`, user: { email, name } };
    }
  );
}

// --- Custom cakes (needed before wishlist/order, which both reference a
// real custom_cake_id per the schema) ---
async function createCustomCake(cake) {
  const payload = {
    cake_base_id: cake.shape?.cake_base_id || cake.shape?.id,
    flavor_id: cake.flavor?.id,
    fondant_id: cake.fondant?.id,
    frosting_id: cake.frosting?.id,
    layers_count: cake.layers?.id || 1,
    custom_text: cake.text?.value || null,
    text_x: cake.text?.x ?? 50,
    text_y: cake.text?.y ?? 18,
    text_rotation: cake.text?.rotation || 0,
    toppings: cake.toppings.map((t) => ({ topping_id: t.toppingId, coordinate_x: t.x, coordinate_y: t.y })),
    candles: cake.candles.map((c) => ({ candle_id: c.candleId, coordinate_x: c.x, coordinate_y: c.y })),
  };
  const { data } = await api.post("/custom-cakes", payload);
  return data.custom_cake_id;
}

// --- Wishlist ---
export async function fetchWishlist(email) {
  return withMockFallback(
    async () => {
      const { data } = await api.get("/wishlist");
      return data.map((w) => ({ ...w.CustomCake, wishlist_id: w.wishlist_id }));
    },
    async () => {
      await delay(200);
      const all = JSON.parse(localStorage.getItem("cd_wishlist") || "{}");
      return all[email] || [];
    }
  );
}

export async function saveWishlistItem(email, design) {
  return withMockFallback(
    async () => {
      const custom_cake_id = await createCustomCake(design);
      const { data } = await api.post("/wishlist", { custom_cake_id });
      return data;
    },
    async () => {
      await delay(200);
      const all = JSON.parse(localStorage.getItem("cd_wishlist") || "{}");
      const list = all[email] || [];
      list.push(design);
      all[email] = list;
      localStorage.setItem("cd_wishlist", JSON.stringify(all));
      return design;
    }
  );
}

// --- Coupons ---
export async function validateCoupon(code) {
  return withMockFallback(
    async () => {
      const { data } = await api.post("/coupons/validate", { code });
      return data;
    },
    async () => {
      await delay(300);
      const table = { SWEET10: 0.1, CAKE20: 0.2, FIRSTBAKE: 0.15 };
      const pct = table[code?.toUpperCase()];
      if (!pct) throw new Error("That coupon code isn't valid");
      return { code: code.toUpperCase(), percentOff: pct };
    }
  );
}

// converts the data-URL our upload UI stores back into a real file for
// the multipart request the backend expects
function dataUrlToBlob(dataUrl) {
  const [header, base64] = dataUrl.split(",");
  const mime = header.match(/:(.*?);/)[1];
  const bytes = atob(base64);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

// --- Orders ---
// order: { cake, customer, shipping, payment, coupon, subtotal, shippingCost, discount, total }
export async function placeOrder(order) {
  return withMockFallback(
    async () => {
      const addressPayload = {
        address_line: order.customer.address,
        city: order.customer.city || order.customer.cityLine,
        postal_code: order.customer.postal,
        is_default: true,
      };
      const { data: address } = await api.post("/users/addresses", addressPayload);

      const formData = new FormData();
      formData.append("address_id", address.address_id);

      // order_items.custom_cake_id is NOT NULL in the schema, so even a
      // "just upload my reference photo, skip the decorator" order needs a
      // minimal custom_cake row -- there's no shape/flavor selection to
      // draw from in that flow, so it's created with sensible defaults and
      // the uploaded photo carries the actual design intent.
      const custom_cake_id = order.cake.referenceImage
        ? await createCustomCake({
            shape: order.cake.shape || { id: 1 },
            flavor: order.cake.flavor || { id: 1 },
            fondant: order.cake.fondant,
            frosting: order.cake.frosting,
            layers: order.cake.layers,
            text: order.cake.text,
            toppings: order.cake.toppings,
            candles: order.cake.candles,
          })
        : await createCustomCake(order.cake);

      formData.append("items", JSON.stringify([{ custom_cake_id, quantity: 1, purchase_price: order.subtotal }]));
      formData.append("payment_method", order.payment === "card" ? "card" : "cod");
      if (order.cake.referenceImage) {
        formData.append("reference_image", dataUrlToBlob(order.cake.referenceImage), "reference.jpg");
      }
      if (order.coupon) formData.append("coupon_code", order.coupon);

      const { data } = await api.post("/orders", formData);
      return data;
    },
    async () => {
      await delay(400);
      const orders = JSON.parse(localStorage.getItem("cd_orders") || "[]");
      const saved = { ...order, id: `LOCAL-${Date.now()}`, status: "pending" };
      orders.push(saved);
      localStorage.setItem("cd_orders", JSON.stringify(orders));
      return saved;
    }
  );
}

// --- Baker/Admin dashboard ---
export async function fetchAllOrders() {
  const { data } = await api.get("/orders/all");
  return data;
}

export async function updateOrderStatus(orderId, current_status) {
  const { data } = await api.patch(`/orders/${orderId}/status`, { current_status });
  return data;
}

// --- Stripe Payments ---
export async function createCheckoutSession(order_id) {
  const { data } = await api.post("/payments/checkout-session", { order_id });
  return data;
}

export async function verifyPaymentSession(session_id, order_id) {
  const { data } = await api.post("/payments/verify-session", { session_id, order_id });
  return data;
}
