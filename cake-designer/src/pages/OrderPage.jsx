import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useCake } from "../context/CakeContext";
import { useAuth } from "../context/AuthContext";
import { priceForCake, formatPKR } from "../utils/pricing";
import { validateCoupon, placeOrder, createCheckoutSession } from "../api/client";
import { findById, TOPPINGS, CANDLES, SPARKLERS } from "../data/cakeOptions";
import CakePreview from "../components/CakePreview";

const CITIES = ["Karachi", "Lahore", "Islamabad", "Sukkur", "Hyderabad", "Multan", "Faisalabad"];
const SHIPPING = [
  { id: "flat", label: "Flat Shipping", price: 299, sub: "Cash on Delivery (COD)" },
  { id: "free", label: "Free Shipping", price: 0, sub: "Debit / Credit Card only" },
];
const PAYMENTS = [
  { id: "cod", label: "Cash on Delivery (COD)" },
  { id: "card", label: "Debit / Credit Card" },
];

const CUSTOM_ORDER_BASE_PRICE = 3000;

const inputCls =
  "w-full px-4 py-3 bg-white border border-line focus:border-ink outline-none transition-colors text-sm";

export default function OrderPage() {
  const { cake } = useCake();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isCustomOrder = !!cake.referenceImage;

  const [form, setForm] = useState({
    email: user?.email || "",
    city: "",
    country: "Pakistan",
    firstName: "",
    lastName: "",
    address: "",
    cityLine: "",
    postal: "",
    phone: "",
  });
  const [shipping, setShipping] = useState("flat");
  const [payment, setPayment] = useState("cod");
  const [coupon, setCoupon] = useState("");
  const [couponResult, setCouponResult] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [errors, setErrors] = useState({});
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState(null);
  const [submitError, setSubmitError] = useState("");

  const subtotal = isCustomOrder ? CUSTOM_ORDER_BASE_PRICE : priceForCake(cake);
  const shipCost = SHIPPING.find((s) => s.id === shipping)?.price || 0;
  const discount = couponResult ? Math.round(subtotal * couponResult.percentOff) : 0;
  const total = subtotal + shipCost - discount;

  if (!cake.shape && !isCustomOrder) {
    return <Navigate to="/decorate/shape" replace />;
  }

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleCoupon() {
    setCouponError("");
    try {
      const result = await validateCoupon(coupon);
      setCouponResult(result);
    } catch (err) {
      setCouponResult(null);
      setCouponError(err.message);
    }
  }

  function validate() {
    const e = {};
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email";
    if (!form.city) e.city = "Please select city from dropdown";
    if (!form.firstName) e.firstName = "Required";
    if (!form.lastName) e.lastName = "Required";
    if (!form.address) e.address = "Required";
    if (!form.phone || form.phone.length < 7) e.phone = "Enter a valid phone number";
    return e;
  }

  async function handlePlaceOrder(e) {
    e.preventDefault();
    const e2 = validate();
    setErrors(e2);
    if (Object.keys(e2).length > 0) return;

    setPlacing(true);
    setSubmitError("");
    try {
      const order = await placeOrder({
        cake,
        customer: form,
        shipping,
        payment,
        coupon: couponResult?.code || null,
        subtotal,
        shippingCost: shipCost,
        discount,
        total,
      });

      if (payment === "card") {
        const orderId = order.order_id || order.id;
        if (typeof orderId === "number") {
          const session = await createCheckoutSession(orderId);
          if (session && session.url) {
            window.location.href = session.url;
            return;
          }
          throw new Error("Stripe checkout could not be initialized");
        } else {
          throw new Error("Stripe Checkout is only available when connected to the backend database.");
        }
      }

      setPlaced({ ...order, id: order.order_id || order.id });
    } catch (err) {
      console.error(err);
      setSubmitError(err.message || "Failed to place order");
    } finally {
      setPlacing(false);
    }
  }

  if (placed) {
    return (
      <div className="max-w-xl mx-auto px-4 pt-40 pb-24 text-center">
        <p className="tracked text-xs text-ink-soft mb-2">Order confirmed</p>
        <h2 className="font-display tracked-xl text-3xl text-ink mb-4">Cak&eacute;</h2>
        <p className="text-ink-soft mb-1 text-sm">Order ID: {placed.order_id || placed.id}</p>
        <p className="text-ink-soft mb-8 text-sm">We'll bake exactly what you designed and get it to you.</p>
        <button
          onClick={() => navigate("/")}
          className="px-8 py-3.5 bg-ink text-white tracked text-xs hover:bg-black transition-colors"
        >
          Back to home
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handlePlaceOrder} className="max-w-5xl mx-auto px-4 sm:px-8 pt-32 pb-8 grid lg:grid-cols-[1.3fr_1fr] gap-10">
      <div className="flex flex-col gap-9">
        {/* Contact */}
        <section>
          <h3 className="font-display tracked text-sm text-ink mb-3 pb-2 border-b border-line">Contact</h3>
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            className={inputCls}
          />
          {errors.email && <p className="text-xs text-ink mt-1">{errors.email}</p>}
        </section>

        {/* Delivery */}
        <section>
          <h3 className="font-display tracked text-sm text-ink mb-3 pb-2 border-b border-line">Delivery</h3>
          <div className="flex flex-col gap-3">
            <div>
              <select
                value={form.city}
                onChange={(e) => update("city", e.target.value)}
                className={`${inputCls} ${errors.city ? "border-ink" : ""}`}
              >
                <option value="">Select city from dropdown</option>
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {errors.city && <p className="text-xs text-ink mt-1">{errors.city}</p>}
            </div>

            <select value={form.country} onChange={(e) => update("country", e.target.value)} className={inputCls}>
              <option>Pakistan</option>
            </select>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  placeholder="First name"
                  value={form.firstName}
                  onChange={(e) => update("firstName", e.target.value)}
                  className={inputCls}
                />
                {errors.firstName && <p className="text-xs text-ink mt-1">{errors.firstName}</p>}
              </div>
              <div>
                <input
                  placeholder="Last name"
                  value={form.lastName}
                  onChange={(e) => update("lastName", e.target.value)}
                  className={inputCls}
                />
                {errors.lastName && <p className="text-xs text-ink mt-1">{errors.lastName}</p>}
              </div>
            </div>

            <input
              placeholder="Address"
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
              className={inputCls}
            />
            {errors.address && <p className="text-xs text-ink -mt-2">{errors.address}</p>}

            <div className="grid grid-cols-2 gap-3">
              <input
                placeholder="City"
                value={form.cityLine}
                onChange={(e) => update("cityLine", e.target.value)}
                className={inputCls}
              />
              <input
                placeholder="Postal code (optional)"
                value={form.postal}
                onChange={(e) => update("postal", e.target.value)}
                className={inputCls}
              />
            </div>

            <input
              placeholder="Phone"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              className={inputCls}
            />
            {errors.phone && <p className="text-xs text-ink -mt-2">{errors.phone}</p>}
          </div>
        </section>

        {/* Shipping */}
        <section>
          <h3 className="font-display tracked text-sm text-ink mb-3 pb-2 border-b border-line">Shipping method</h3>
          <div className="flex flex-col gap-2">
            {SHIPPING.map((s) => (
              <label
                key={s.id}
                className={`flex items-center justify-between px-4 py-3 bg-white border cursor-pointer transition-colors ${
                  shipping === s.id ? "border-ink" : "border-line hover:border-ink-soft"
                }`}
              >
                <span className="flex items-center gap-3">
                  <input type="radio" name="shipping" checked={shipping === s.id} onChange={() => setShipping(s.id)} />
                  <span>
                    <span className="tracked text-xs block">{s.label}</span>
                    <span className="text-xs text-ink-soft">{s.sub}</span>
                  </span>
                </span>
                <span className="text-sm">{s.price ? formatPKR(s.price) : "Free"}</span>
              </label>
            ))}
          </div>
        </section>

        {/* Payment */}
        <section>
          <h3 className="font-display tracked text-sm text-ink mb-1 pb-2 border-b border-line">Payment</h3>
          <p className="text-xs text-ink-soft mb-2 mt-2">All transactions are secure and encrypted.</p>
          <div className="flex flex-col gap-2">
            {PAYMENTS.map((p) => (
              <label
                key={p.id}
                className={`flex items-center gap-3 px-4 py-3 bg-white border cursor-pointer transition-colors ${
                  payment === p.id ? "border-ink" : "border-line hover:border-ink-soft"
                }`}
              >
                <input type="radio" name="payment" checked={payment === p.id} onChange={() => setPayment(p.id)} />
                <span className="tracked text-xs">{p.label}</span>
              </label>
            ))}
          </div>
        </section>

        {submitError && <p className="text-sm text-ink border border-line bg-white px-4 py-3">{submitError}</p>}

        <button
          type="submit"
          disabled={placing}
          className="py-4 bg-ink text-white tracked text-sm hover:bg-black transition-colors disabled:opacity-60"
        >
          {placing ? "Placing order…" : `Pay ${formatPKR(total)}`}
        </button>
      </div>

      {/* Order summary */}
      <aside className="bg-bone p-6 h-fit sticky top-28 border border-line">
        <h3 className="font-display tracked text-sm text-ink mb-4 pb-2 border-b border-line">Order summary</h3>

        <div className="flex gap-3 items-center bg-white p-3 mb-4 border border-line">
          {isCustomOrder ? (
            <>
              <div className="w-16 h-16 shrink-0 border border-line overflow-hidden">
                <img src={cake.referenceImage} alt="Your uploaded reference" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <p className="tracked text-xs text-ink">Custom Design (Uploaded Photo)</p>
                <p className="text-xs text-ink-soft mt-1">Final price confirmed after our team reviews your reference image</p>
              </div>
            </>
          ) : (
            <>
              <div className="scale-[0.4] origin-left -my-16 -mr-24">
                <CakePreview cake={cake} previewMode />
              </div>
              <div className="flex-1">
                <p className="tracked text-xs text-ink">
                  {cake.flavor?.label} {cake.shape?.label} Cake
                </p>
                <p className="text-xs text-ink-soft mt-1">
                  {cake.layers?.label} &middot; {cake.fondant?.label} &middot; {cake.frosting?.label}
                </p>
                {cake.toppings.length > 0 && (
                  <p className="text-xs text-ink-soft">
                    Toppings: {cake.toppings.map((t) => findById(TOPPINGS, t.toppingId)?.label).join(", ")}
                  </p>
                )}
                {cake.candles.length > 0 && (
                  <p className="text-xs text-ink-soft">
                    Candles: {cake.candles.map((c) => (findById(CANDLES, c.candleId) || findById(SPARKLERS, c.candleId))?.label).join(", ")}
                  </p>
                )}
              </div>
            </>
          )}
          <p className="text-sm text-ink whitespace-nowrap">{formatPKR(subtotal)}</p>
        </div>

        <div className="flex gap-2 mb-4">
          <input
            placeholder="Discount code or gift card"
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-white border border-line focus:border-ink outline-none text-sm"
          />
          <button type="button" onClick={handleCoupon} className="px-5 py-2.5 bg-ink text-white text-xs tracked hover:bg-black transition-colors">
            Apply
          </button>
        </div>
        {couponError && <p className="text-xs text-ink -mt-3 mb-3">{couponError}</p>}
        {couponResult && (
          <p className="text-xs text-ink-soft -mt-3 mb-3">
            &ldquo;{couponResult.code}&rdquo; applied &mdash; {Math.round(couponResult.percentOff * 100)}% off
          </p>
        )}

        <div className="flex flex-col gap-1.5 text-sm border-t border-line pt-3">
          <div className="flex justify-between">
            <span className="text-ink-soft">Subtotal</span>
            <span>{formatPKR(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-soft">Shipping</span>
            <span>{shipCost ? formatPKR(shipCost) : "Free"}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-ink-soft">
              <span>Discount</span>
              <span>-{formatPKR(discount)}</span>
            </div>
          )}
          <div className="flex justify-between tracked text-sm text-ink pt-2 border-t border-line mt-1">
            <span>Total</span>
            <span>{formatPKR(total)}</span>
          </div>
        </div>
      </aside>
    </form>
  );
}
