import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchAllOrders, updateOrderStatus } from "../api/client";
import { formatPKR } from "../utils/pricing";
import { findById, TOPPINGS, CANDLES, SPARKLERS } from "../data/cakeOptions";
import CakePreview from "../components/CakePreview";

const STATUSES = ["Received", "Baking", "Decorating", "Dispatched", "Delivered"];
const API_ORIGIN = (import.meta.env.VITE_API_URL || "").replace(/\/api\/?$/, "");

function parseCake(order) {
  if (!order) return {};
  if (typeof order.cakeDetails === "string") {
    try {
      return JSON.parse(order.cakeDetails);
    } catch {
      return {};
    }
  }
  return order.cakeDetails || order.cake || {};
}

function getOrderCategory(order) {
  const cake = parseCake(order);
  if (order.reference_image_url || cake.referenceImage) {
    return "reference";
  }
  if (cake.presetName || cake.presetImage) {
    return "preset";
  }
  return "custom";
}

export default function BakerDashboard() {
  const { user, ready } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // "all" | "custom" | "reference" | "preset"
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await fetchAllOrders();
        if (!cancelled) setOrders(data);
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.error || "Couldn't load orders. Is the backend running?");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (ready && (!user || !["baker", "admin"].includes(String(user.role || "").toLowerCase()))) {
    return <Navigate to="/" replace />;
  }

  async function handleStatusChange(orderId, status) {
    try {
      const updated = await updateOrderStatus(orderId, status);
      setOrders((list) =>
        list.map((o) => (o.order_id === orderId ? { ...o, current_status: updated.current_status } : o))
      );
    } catch {
      // Local state fallback if backend call fails
      setOrders((list) =>
        list.map((o) => (o.order_id === orderId ? { ...o, current_status: status } : o))
      );
    }
  }

  function imgSrc(path) {
    if (!path) return null;
    return path.startsWith("http") || path.startsWith("data:") ? path : `${API_ORIGIN}${path}`;
  }

  const counts = {
    all: orders.length,
    custom: orders.filter((o) => getOrderCategory(o) === "custom").length,
    reference: orders.filter((o) => getOrderCategory(o) === "reference").length,
    preset: orders.filter((o) => getOrderCategory(o) === "preset").length,
  };

  const filteredOrders = orders.filter((o) => {
    if (activeTab === "all") return true;
    return getOrderCategory(o) === activeTab;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-28 pb-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 pb-4 border-b border-line gap-4">
        <div>
          <h1 className="font-display tracked-xl text-2xl sm:text-3xl text-ink mb-1">Baker &amp; Admin Dashboard</h1>
          <p className="text-xs sm:text-sm text-ink-soft">
            Manage customer orders categorized by Custom 3D Designs, Uploaded Reference Photos, and Most Loved Presets.
          </p>
        </div>
      </div>

      {/* Category filter tabs */}
      <div className="flex flex-wrap gap-2 mb-8 bg-bone p-1.5 border border-line">
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 text-xs font-semibold tracked rounded transition-all ${
            activeTab === "all" ? "bg-white text-ink shadow-sm border border-line" : "text-ink-soft hover:text-ink"
          }`}
        >
          All Orders ({counts.all})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("custom")}
          className={`px-4 py-2 text-xs font-semibold tracked rounded transition-all ${
            activeTab === "custom" ? "bg-indigo-600 text-white shadow-sm" : "text-ink-soft hover:text-ink"
          }`}
        >
          🎨 Customized 3D Cakes ({counts.custom})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("reference")}
          className={`px-4 py-2 text-xs font-semibold tracked rounded transition-all ${
            activeTab === "reference" ? "bg-amber-600 text-white shadow-sm" : "text-ink-soft hover:text-ink"
          }`}
        >
          📷 Reference Photo Uploads ({counts.reference})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("preset")}
          className={`px-4 py-2 text-xs font-semibold tracked rounded transition-all ${
            activeTab === "preset" ? "bg-rose-600 text-white shadow-sm" : "text-ink-soft hover:text-ink"
          }`}
        >
          💖 Most Loved Presets ({counts.preset})
        </button>
      </div>

      {loading && <p className="text-sm text-ink-soft animate-pulse py-8 text-center">Loading customer orders&hellip;</p>}
      {error && <p className="text-sm text-ink py-4">{error}</p>}

      {!loading && !error && filteredOrders.length === 0 && (
        <div className="bg-bone border border-line p-12 text-center my-6">
          <p className="text-sm text-ink-soft">No orders found in this category.</p>
        </div>
      )}

      <div className="flex flex-col gap-6">
        {filteredOrders.map((order) => {
          const cake = parseCake(order);
          const category = getOrderCategory(order);
          const refImg = imgSrc(order.reference_image_url || cake.referenceImage || cake.presetImage);

          return (
            <div key={order.order_id || order.id} className="border border-line bg-white p-5 sm:p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-4 border-b border-line">
                <div className="flex items-center gap-3">
                  <span className="font-display tracked text-sm font-bold text-ink">
                    Order #{order.order_id || order.id}
                  </span>
                  {category === "custom" && (
                    <span className="px-2.5 py-0.5 text-[11px] font-semibold bg-indigo-100 text-indigo-900 border border-indigo-200">
                      🎨 Customized 3D Cake
                    </span>
                  )}
                  {category === "reference" && (
                    <span className="px-2.5 py-0.5 text-[11px] font-semibold bg-amber-100 text-amber-900 border border-amber-200">
                      📷 Photo Reference Upload
                    </span>
                  )}
                  {category === "preset" && (
                    <span className="px-2.5 py-0.5 text-[11px] font-semibold bg-rose-100 text-rose-900 border border-rose-200">
                      💖 Most Loved Preset
                    </span>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-sm font-bold text-ink">{formatPKR(Number(order.total_price || order.total || 0))}</span>
                  <span className="ml-2 text-xs text-ink-soft">({order.payment_status || order.payment_method || "COD"})</span>
                </div>
              </div>

              <div className="grid md:grid-cols-[140px_1fr] gap-6">
                {/* Visual Thumbnail Column */}
                <div className="flex flex-col items-center gap-2">
                  <div className="w-32 h-32 bg-bone border border-line flex items-center justify-center overflow-hidden relative">
                    {refImg ? (
                      <button type="button" onClick={() => setLightbox(refImg)} className="w-full h-full group">
                        <img src={refImg} alt="Cake reference" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      </button>
                    ) : (
                      <div className="scale-[0.38] transform absolute">
                        <CakePreview cake={cake} previewMode />
                      </div>
                    )}
                  </div>
                  {refImg && (
                    <div className="flex gap-2 w-full">
                      <button
                        type="button"
                        onClick={() => setLightbox(refImg)}
                        className="flex-1 py-1 text-[10px] tracked border border-line bg-white hover:bg-bone text-center"
                      >
                        View Full
                      </button>
                      <a
                        href={refImg}
                        download={`order-${order.order_id || order.id}-reference.jpg`}
                        className="flex-1 py-1 text-[10px] tracked border border-line bg-white hover:bg-bone text-center"
                      >
                        Save
                      </a>
                    </div>
                  )}
                </div>

                {/* Details Column */}
                <div className="flex flex-col justify-between">
                  <div className="flex flex-col gap-2">
                    <p className="font-display text-sm text-ink font-semibold">
                      {cake.presetName || (category === "reference" ? "Custom Design from Reference Image" : `${cake.flavor?.label || "Vanilla"} ${cake.shape?.label || "Round"} Cake`)}
                    </p>

                    <div className="text-xs text-ink-soft space-y-1">
                      <p>
                        <strong className="text-ink font-medium">Specifications:</strong>{" "}
                        {cake.shape?.label || "Heart"} Shape &middot; {cake.layers?.label || "2 Layers"} &middot; {cake.fondant?.label || "Buttercream"} &middot; {cake.frosting?.label || "Vanilla Frosting"}
                      </p>

                      {cake.text?.value && (
                        <p>
                          <strong className="text-ink font-medium">Writing / Text:</strong> &ldquo;{cake.text.value}&rdquo; (Color: {cake.text.color || "#7A2E42"})
                        </p>
                      )}

                      {cake.toppings?.length > 0 && (
                        <p>
                          <strong className="text-ink font-medium">Toppings ({cake.toppings.length}):</strong>{" "}
                          {cake.toppings.map((t) => findById(TOPPINGS, t.toppingId)?.label).filter(Boolean).join(", ")}
                        </p>
                      )}

                      {cake.candles?.length > 0 && (
                        <p>
                          <strong className="text-ink font-medium">Candles ({cake.candles.length}):</strong>{" "}
                          {cake.candles.map((c) => (findById(CANDLES, c.candleId) || findById(SPARKLERS, c.candleId))?.label).filter(Boolean).join(", ")}
                        </p>
                      )}

                      <p className="pt-2 border-t border-line mt-2">
                        <strong className="text-ink font-medium">Customer:</strong> {order.User?.name || order.customer?.firstName || "Customer"} ({order.User?.email || order.customer?.email})
                      </p>
                      <p>
                        <strong className="text-ink font-medium">Delivery Address:</strong> {order.UserAddress?.address_line || order.customer?.address}, {order.UserAddress?.city || order.customer?.city || "Karachi"}
                      </p>
                    </div>
                  </div>

                  {/* Status Selector */}
                  <div className="flex items-center gap-3 mt-4 pt-3 border-t border-line">
                    <label className="text-xs font-semibold tracked text-ink">Baker Order Status:</label>
                    <select
                      value={order.current_status || "Received"}
                      onChange={(e) => handleStatusChange(order.order_id || order.id, e.target.value)}
                      className="text-xs font-semibold border border-ink bg-white px-3 py-1.5 outline-none cursor-pointer"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-[70] bg-ink/80 flex items-center justify-center p-6"
          onClick={() => setLightbox(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img src={lightbox} alt="Reference full size" className="max-w-full max-h-[85vh] object-contain mx-auto" />
            <button
              onClick={() => setLightbox(null)}
              className="absolute top-2 right-2 px-3 py-1 bg-white text-ink text-xs font-bold shadow"
            >
              Close ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
