import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { verifyPaymentSession, fetchOrderById } from "../api/client";
import { formatPKR } from "../utils/pricing";

export default function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState(null);
  const [order, setOrder] = useState(null);

  const sessionId = searchParams.get("session_id");
  const orderId = searchParams.get("order_id");
  const paymentMethod = searchParams.get("payment_method");

  useEffect(() => {
    if (!sessionId && !orderId) {
      setError("Missing order details in URL");
      setVerifying(false);
      return;
    }

    let isMounted = true;
    async function verify() {
      try {
        if (sessionId) {
          const response = await verifyPaymentSession(sessionId, Number(orderId));
          if (isMounted) {
            setOrder({ id: orderId, status: "Paid", amount: response.payment?.amount, isCod: false });
            setVerifying(false);
          }
        } else {
          // COD or direct order confirmation
          let amount = null;
          try {
            const fetched = await fetchOrderById(orderId);
            amount = fetched?.total_price || fetched?.totalPrice || fetched?.total;
          } catch (e) {
            // Ignore fetch failure and display order ID confirmation
          }

          if (isMounted) {
            setOrder({
              id: orderId,
              status: "Confirmed (COD)",
              amount,
              isCod: paymentMethod === "cod" || !sessionId,
            });
            setVerifying(false);
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error(err);
          setError(err.message || "Could not verify your payment session.");
          setVerifying(false);
        }
      }
    }

    verify();

    return () => {
      isMounted = false;
    };
  }, [sessionId, orderId, paymentMethod]);

  if (verifying) {
    return (
      <div className="max-w-xl mx-auto px-4 pt-40 pb-24 text-center">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 border-2 border-line border-t-ink rounded-full animate-spin"></div>
          <p className="tracked text-xs text-ink-soft">
            {sessionId ? "Verifying your payment..." : "Confirming your order..."}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto px-4 pt-40 pb-24 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-ink text-ink mb-4">
          <span className="text-xl">✕</span>
        </div>
        <p className="tracked text-xs text-ink mb-2">Order Verification Failed</p>
        <p className="text-sm text-ink-soft mb-8 max-w-sm mx-auto">{error}</p>
        <button
          onClick={() => navigate("/order")}
          className="px-8 py-3.5 bg-ink text-white tracked text-xs hover:bg-black transition-colors"
        >
          Back to Checkout
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 pt-40 pb-24 text-center pop-in">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full border-2 border-ink text-ink mb-6">
        <svg className="w-6 h-6 stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </div>
      <p className="tracked text-xs text-ink-soft mb-2">
        {order?.isCod ? "Order Confirmed (Cash on Delivery)" : "Order Confirmed & Paid"}
      </p>
      <h2 className="font-display tracked-xl text-3xl text-ink mb-4">Cak&eacute;</h2>
      <p className="text-ink-soft mb-1 text-sm">Order ID: #{order?.id}</p>
      {order?.amount && (
        <p className="text-ink mb-6 text-sm font-medium">
          {order?.isCod ? "Total Payable on Delivery: " : "Amount Paid: "}
          {formatPKR(order.amount)}
        </p>
      )}
      <p className="text-ink-soft mb-8 text-sm max-w-md mx-auto">
        {order?.isCod
          ? "Your order has been placed successfully! We'll start baking your custom design right away. Please keep cash ready upon delivery."
          : "Your payment has been successfully processed! We'll start baking your design exactly as requested and notify you when it's ready."}
      </p>
      <button
        onClick={() => navigate("/")}
        className="px-8 py-3.5 bg-ink text-white tracked text-xs hover:bg-black transition-colors"
      >
        Back to Home
      </button>
    </div>
  );
}
