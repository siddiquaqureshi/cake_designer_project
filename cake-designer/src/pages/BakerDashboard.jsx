import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchAllOrders, updateOrderStatus } from "../api/client";
import { formatPKR } from "../utils/pricing";

const STATUSES = ["Received", "Baking", "Decorating", "Dispatched", "Delivered"];
const API_ORIGIN = (import.meta.env.VITE_API_URL || "").replace(/\/api\/?$/, "");

export default function BakerDashboard() {
  const { user, ready } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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

  if (ready && (!user || !["Baker", "Admin"].includes(user.role))) {
    return <Navigate to="/" replace />;
  }

  async function handleStatusChange(orderId, status) {
    const updated = await updateOrderStatus(orderId, status);
    setOrders((list) => list.map((o) => (o.order_id === orderId ? { ...o, current_status: updated.current_status } : o)));
  }

  function imgSrc(path) {
    if (!path) return null;
    return path.startsWith("http") ? path : `${API_ORIGIN}${path}`;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-28 pb-16">
      <h1 className="font-display tracked-xl text-2xl mb-1">Baker Dashboard</h1>
      <p className="text-sm text-ink-soft mb-8">All orders, with customer reference images for guidance.</p>

      {loading && <p className="text-sm text-ink-soft animate-pulse">Loading orders&hellip;</p>}
      {error && <p className="text-sm text-ink">{error}</p>}

      {!loading && !error && orders.length === 0 && (
        <p className="text-sm text-ink-soft">No orders yet.</p>
      )}

      <div className="flex flex-col gap-4">
        {orders.map((order) => (
          <div key={order.order_id} className="border border-line p-4 flex flex-col sm:flex-row gap-4 bg-white">
            <div className="w-full sm:w-28 h-28 shrink-0 bg-bone border border-line flex items-center justify-center overflow-hidden">
              {order.reference_image_url ? (
                <button onClick={() => setLightbox(imgSrc(order.reference_image_url))} className="w-full h-full">
                  <img src={imgSrc(order.reference_image_url)} alt="Reference" className="w-full h-full object-cover" />
                </button>
              ) : (
                <span className="text-[11px] text-ink-soft text-center px-2">No reference image</span>
              )}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                <p className="tracked text-sm">Order #{order.order_id}</p>
                <p className="text-sm font-bold">{formatPKR(Number(order.total_price))}</p>
              </div>
              <p className="text-xs text-ink-soft">{order.User?.email}</p>
              <p className="text-xs text-ink-soft mb-2">
                {order.UserAddress?.address_line}, {order.UserAddress?.city}
              </p>

              <div className="flex flex-wrap items-center gap-2 mt-2">
                <label className="text-xs tracked text-ink-soft">Status</label>
                <select
                  value={order.current_status}
                  onChange={(e) => handleStatusChange(order.order_id, e.target.value)}
                  className="text-xs border border-line px-2 py-1"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <span className="text-xs text-ink-soft">Payment: {order.payment_status}</span>
              </div>
            </div>

            {order.reference_image_url && (
              <div className="flex sm:flex-col gap-2 justify-center">
                <button
                  onClick={() => setLightbox(imgSrc(order.reference_image_url))}
                  className="px-3 py-2 text-[11px] tracked border border-line hover:border-ink"
                >
                  View Full Size
                </button>
                <a
                  href={imgSrc(order.reference_image_url)}
                  download
                  className="px-3 py-2 text-[11px] tracked border border-line hover:border-ink text-center"
                >
                  Download
                </a>
              </div>
            )}
          </div>
        ))}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-[70] bg-ink/80 flex items-center justify-center p-6"
          onClick={() => setLightbox(null)}
        >
          <img src={lightbox} alt="Reference full size" className="max-w-full max-h-full object-contain" />
        </div>
      )}
    </div>
  );
}
