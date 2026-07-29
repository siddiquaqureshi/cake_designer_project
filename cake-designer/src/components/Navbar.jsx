import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import LoginModal from "./LoginModal";
import WishlistDrawer from "./WishlistDrawer";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [showWishlist, setShowWishlist] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // The reference site's nav sits transparent over the hero video and only
  // needs light (white) text there; every other screen (and the home page
  // once scrolled past the hero) gets a solid white bar with dark text.
  const isHomeTop = location.pathname === "/" && !scrolled;

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > window.innerHeight * 0.7);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const textColor = isHomeTop ? "text-white" : "text-ink";
  const mutedColor = isHomeTop ? "text-white/80" : "text-ink-soft";

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50">
        {/* promo strip */}
        <div className="h-8 flex items-center justify-center bg-ink text-white text-center text-[11px] tracked px-4">
          Cash on Delivery available &middot; Free delivery on orders over Rs 5,000
        </div>

        {/* main nav */}
        <div
          className={`h-16 flex items-center transition-colors duration-300 ${
            isHomeTop ? "bg-transparent" : "bg-paper border-b border-line-soft"
          }`}
        >
          <nav className="max-w-7xl mx-auto w-full flex items-center justify-between px-4 sm:px-8">
            <div className={`flex items-center gap-6 tracked text-xs ${textColor}`}>
              <button onClick={() => navigate("/#most-loved")} className="hover:opacity-60 transition-opacity hidden sm:inline">
                Most Loved
              </button>
              <button onClick={() => navigate("/decorate/shape")} className="hover:opacity-60 transition-opacity">
                Order
              </button>
              {user && ["Baker", "Admin"].includes(user.role) && (
                <button onClick={() => navigate("/admin/orders")} className="hover:opacity-60 transition-opacity">
                  Baker Dashboard
                </button>
              )}
            </div>

            <Link
              to="/"
              className={`font-display tracked-xl text-lg sm:text-xl absolute left-1/2 -translate-x-1/2 ${textColor}`}
            >
              Cak&eacute;
            </Link>

            <div className={`flex items-center gap-5 tracked text-xs ${textColor}`}>
              {user ? (
                <div className="hidden sm:flex items-center gap-4">
                  <span className={mutedColor}>Hi, {user.name?.split(" ")[0]}</span>
                  <button onClick={logout} className="hover:opacity-60 transition-opacity">
                    Log out
                  </button>
                </div>
              ) : (
                <button onClick={() => setShowAuth(true)} className="hover:opacity-60 transition-opacity">
                  Login
                </button>
              )}

              <button
                aria-label="Wishlist"
                onClick={() => setShowWishlist(true)}
                className="hover:opacity-60 transition-opacity flex items-center gap-1.5"
              >
                <StarIcon />
                <span className="hidden sm:inline">Wishlist</span>
              </button>
            </div>
          </nav>
        </div>
      </header>

      {showAuth && <LoginModal onClose={() => setShowAuth(false)} />}
      {showWishlist && <WishlistDrawer onClose={() => setShowWishlist(false)} />}
    </>
  );
}

function StarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2.5l2.9 6.6 7.1.6-5.4 4.7 1.7 6.9L12 17.8 5.7 21.3l1.7-6.9L2 9.7l7.1-.6L12 2.5z" />
    </svg>
  );
}
