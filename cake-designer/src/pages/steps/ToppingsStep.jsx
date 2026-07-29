import { useState } from "react";
import { useCake } from "../../context/CakeContext";
import { findById, TOPPINGS } from "../../data/cakeOptions";

// scatter N new items around a center point so a bulk-add doesn't stack
// them exactly on top of each other
function scatterAround(cx, cy, count) {
  const points = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const radius = count === 1 ? 0 : 6 + (i % 3) * 3;
    points.push({
      x: Math.min(92, Math.max(8, cx + Math.cos(angle) * radius)),
      y: Math.min(85, Math.max(15, cy + Math.sin(angle) * radius)),
    });
  }
  return points;
}

export default function ToppingsStep(props) {
  const { options } = props;
  const { cake, dispatch } = useCake();
  const [qty, setQty] = useState({});

  function getQty(id) {
    return qty[id] ?? 1;
  }
  function setQtyFor(id, val) {
    setQty((q) => ({ ...q, [id]: Math.min(20, Math.max(1, val)) }));
  }

  function addQuantity(topping) {
    const n = getQty(topping.id);
    const points = scatterAround(50, 50, n);
    dispatch({
      type: "ADD_TOPPINGS_BULK",
      payload: points.map((p) => ({ toppingId: topping.id, x: p.x, y: p.y })),
    });
  }

  return (
    <div className="pt-2">
      <p className="text-xs text-ink-soft mb-3">
        Pick how many, tap &ldquo;Add&rdquo; to drop them on the cake, then drag each one anywhere you like.
      </p>
      <div className="flex flex-col gap-2">
        {options.toppings.map((topping) => (
          <div key={topping.id} className="flex items-center gap-3 border border-line p-2.5 bg-white">
            <img src={topping.image} alt={topping.label} className="w-12 h-12 object-contain shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs tracked leading-tight">{topping.label}</p>
              <p className="text-[11px] text-ink-soft">+ Rs {topping.price} each</p>
            </div>
            <div className="flex items-center border border-line">
              <button
                type="button"
                onClick={() => setQtyFor(topping.id, getQty(topping.id) - 1)}
                className="w-7 h-7 text-sm hover:bg-bone"
              >
                &minus;
              </button>
              <span className="w-8 text-center text-xs">{getQty(topping.id)}</span>
              <button
                type="button"
                onClick={() => setQtyFor(topping.id, getQty(topping.id) + 1)}
                className="w-7 h-7 text-sm hover:bg-bone"
              >
                +
              </button>
            </div>
            <button
              type="button"
              onClick={() => addQuantity(topping)}
              className="px-3 py-2 bg-ink text-white text-[11px] tracked hover:bg-black transition-colors"
            >
              Add
            </button>
          </div>
        ))}
      </div>

      {cake.toppings.length > 0 && (
        <div className="mt-5">
          <p className="tracked text-[11px] text-ink-soft mb-2">On the cake ({cake.toppings.length}) &mdash; drag to reposition</p>
          <ul className="space-y-1">
            {cake.toppings.map((t, i) => {
              const def = findById(options?.toppings || TOPPINGS, t.toppingId) || findById(TOPPINGS, t.toppingId);
              return (
                <li key={i} className="flex items-center justify-between text-sm bg-bone px-3 py-1.5 border border-line">
                  <span>{def?.label}</span>
                  <button
                    onClick={() => dispatch({ type: "REMOVE_TOPPING", payload: i })}
                    className="text-ink text-xs tracked hover:underline"
                  >
                    remove
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
