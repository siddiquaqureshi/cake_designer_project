import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import { useCake } from "../../context/CakeContext";
import { useAuth } from "../../context/AuthContext";
import { saveWishlistItem } from "../../api/client";
import CakePreview from "../../components/CakePreview";
import { priceForCake, formatPKR } from "../../utils/pricing";

export default function RevealStep() {
  const { cake } = useCake();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [hearted, setHearted] = useState(false);
  const [heartBusy, setHeartBusy] = useState(false);
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;
    const duration = 1200;
    const end = Date.now() + duration;
    const colors = ["#111111", "#ffffff", "#c9a44a"];
    (function frame() {
      confetti({ particleCount: 4, angle: 60, spread: 60, origin: { x: 0, y: 1 }, colors });
      confetti({ particleCount: 4, angle: 120, spread: 60, origin: { x: 1, y: 1 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }, []);

  async function handleHeart() {
    if (!user) {
      alert("Sign in first so we can save this design to your wishlist.");
      return;
    }
    setHeartBusy(true);
    try {
      await saveWishlistItem(user.email, { ...cake, price: priceForCake(cake), savedAt: Date.now() });
      setHearted(true);
    } finally {
      setHeartBusy(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-8 text-center">
      <p className="tracked text-xs text-ink-soft mb-2">Your cake is ready</p>
      <h2 className="font-display tracked-xl text-3xl sm:text-4xl text-ink mb-6">Cak&eacute;</h2>

      <div className="bg-bone shelf-bg p-8 mb-6 border border-line">
        <CakePreview cake={cake} previewMode />
      </div>

      <p className="tracked text-lg text-ink mb-6">{formatPKR(priceForCake(cake))} total</p>

      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={handleHeart}
          disabled={hearted || heartBusy}
          className="px-6 py-3.5 bg-white text-ink tracked text-xs border border-line hover:border-ink transition-colors disabled:opacity-60"
        >
          {hearted ? "Saved to wishlist" : heartBusy ? "Saving…" : "Save to wishlist"}
        </button>
        <button
          onClick={() => navigate("/order")}
          className="px-10 py-3.5 bg-ink text-white tracked text-xs hover:bg-black transition-colors"
        >
          Order This
        </button>
      </div>
    </div>
  );
}
