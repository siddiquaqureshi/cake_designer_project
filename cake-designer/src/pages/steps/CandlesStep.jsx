import { useState } from "react";
import { useCake } from "../../context/CakeContext";
import { findById, CANDLES, SPARKLERS } from "../../data/cakeOptions";

function scatterAlongTop(count) {
  const points = [];
  const positions = [50, 35, 65, 20, 80, 42, 58, 28, 72, 14, 86];
  for (let i = 0; i < count; i++) {
    points.push({ x: positions[i % positions.length], y: 26 + (i % 3) * 4 });
  }
  return points;
}

function CategoryRow({ title, items, onAdd }) {
  const [qty, setQty] = useState({});
  const getQty = (id) => qty[id] ?? 1;
  const setQtyFor = (id, val) => setQty((q) => ({ ...q, [id]: Math.min(12, Math.max(1, val)) }));

  return (
    <div className="mb-5">
      <p className="tracked text-[11px] text-ink-soft mb-2">{title}</p>
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 border border-line p-2.5 bg-white">
            <img src={item.image} alt={item.label} className="w-8 h-14 object-contain shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs tracked leading-tight">{item.label}</p>
              <p className="text-[11px] text-ink-soft">+ Rs {item.price} each</p>
            </div>
            <div className="flex items-center border border-line">
              <button type="button" onClick={() => setQtyFor(item.id, getQty(item.id) - 1)} className="w-7 h-7 text-sm hover:bg-bone">
                &minus;
              </button>
              <span className="w-8 text-center text-xs">{getQty(item.id)}</span>
              <button type="button" onClick={() => setQtyFor(item.id, getQty(item.id) + 1)} className="w-7 h-7 text-sm hover:bg-bone">
                +
              </button>
            </div>
            <button
              type="button"
              onClick={() => onAdd(item, getQty(item.id))}
              className="px-3 py-2 bg-ink text-white text-[11px] tracked hover:bg-black transition-colors"
            >
              Add
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CandlesStep(props) {
  const { options } = props;
  const { cake, dispatch } = useCake();

  function addN(item, n) {
    const points = scatterAlongTop(n);
    dispatch({
      type: "ADD_CANDLES_BULK",
      payload: points.map((p) => ({ candleId: item.id, x: p.x, y: p.y })),
    });
  }

  return (
    <div className="pt-2">
      <p className="text-xs text-ink-soft mb-3">Choose how many, add them, then drag each one anywhere on top.</p>

      <CategoryRow title="Candles" items={options.candles || CANDLES} onAdd={addN} />
      <CategoryRow title="Sparklers" items={options.sparklers || SPARKLERS} onAdd={addN} />

      {cake.candles.length > 0 && (
        <div className="mt-2">
          <p className="tracked text-[11px] text-ink-soft mb-2">On the cake ({cake.candles.length}) &mdash; drag to reposition</p>
          <ul className="space-y-1">
            {cake.candles.map((c, i) => {
              const def = findById(options?.candles, c.candleId) || findById(options?.sparklers, c.candleId) || findById(CANDLES, c.candleId) || findById(SPARKLERS, c.candleId);
              return (
                <li key={i} className="flex items-center justify-between text-sm bg-bone px-3 py-1.5 border border-line">
                  <span>{def?.label}</span>
                  <button
                    onClick={() => dispatch({ type: "REMOVE_CANDLE", payload: i })}
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
