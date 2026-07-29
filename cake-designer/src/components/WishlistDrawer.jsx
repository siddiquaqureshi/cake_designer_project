import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useCake } from "../context/CakeContext";
import { fetchWishlist } from "../api/client";
import { formatPKR } from "../utils/pricing";
import { useNavigate } from "react-router-dom";
import CakePreview from "./CakePreview";

export default function WishlistDrawer({ onClose }) {
  const { user } = useAuth();
  const { dispatch } = useCake();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    if (!user) {
      setLoading(false);
      return;
    }
    async function load() {
      try {
        const data = await fetchWishlist(user.email);
        if (!cancelled) setItems(data);
      } catch (err) {
        if (!cancelled) setError("Couldn't load your wishlist right now.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  function reload(design) {
    dispatch({ type: "LOAD", payload: design });
    navigate("/decorate/reveal");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white h-full border-l border-line p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display tracked text-lg text-ink">Wishlist</h3>
          <button onClick={onClose} className="text-ink-soft hover:text-ink text-xl leading-none">
            ×
          </button>
        </div>

        {!user && (
          <p className="text-sm text-ink-soft">Log in to save and see your favorite cake designs here.</p>
        )}
        {user && loading && <p className="text-sm text-ink-soft animate-pulse">Loading your saved cakes…</p>}
        {user && error && <p className="text-sm text-ink">{error}</p>}
        {user && !loading && !error && items.length === 0 && (
          <p className="text-sm text-ink-soft">
            Nothing here yet — finish decorating a cake and tap "Save to wishlist".
          </p>
        )}

        <div className="flex flex-col gap-4 mt-2">
          {items.map((design, i) => (
            <button
              key={i}
              onClick={() => reload(design)}
              className="text-left bg-white p-4 border border-line hover:border-ink transition-colors"
            >
              <div className="scale-75 origin-top -mb-10">
                <CakePreview cake={design} previewMode />
              </div>
              <p className="tracked text-xs text-ink mt-1">
                {design.flavor?.label} · {design.shape?.label}
              </p>
              <p className="text-xs text-ink-soft">{formatPKR(design.price || 0)}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
