import { useNavigate, useSearchParams } from "react-router-dom";

export default function OrderCancel() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order_id");

  return (
    <div className="max-w-xl mx-auto px-4 pt-40 pb-24 text-center pop-in">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full border-2 border-ink text-ink mb-6">
        <svg className="w-6 h-6 stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z" />
        </svg>
      </div>
      <p className="tracked text-xs text-ink-soft mb-2">Payment Cancelled</p>
      <h2 className="font-display tracked-xl text-3xl text-ink mb-4">Cak&eacute;</h2>
      {orderId && <p className="text-ink-soft mb-1 text-sm">Order ID: #{orderId}</p>}
      <p className="text-ink-soft mb-8 text-sm max-w-md mx-auto">
        Your payment process was cancelled or did not complete. Don't worry, your design has been saved, and you can try checkout again.
      </p>
      <div className="flex justify-center gap-4">
        <button
          onClick={() => navigate("/order")}
          className="px-8 py-3.5 bg-ink text-white tracked text-xs hover:bg-black transition-colors"
        >
          Return to Checkout
        </button>
        <button
          onClick={() => navigate("/")}
          className="px-8 py-3.5 border border-line text-ink tracked text-xs hover:border-ink transition-colors"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
