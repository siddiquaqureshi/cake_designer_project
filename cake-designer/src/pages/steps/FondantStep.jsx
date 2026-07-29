import { useState } from "react";
import { useCake } from "../../context/CakeContext";
import OptionCard from "../../components/OptionCard";

const CUSTOM_FONDANT_PRICE = 500;

function hsl(h, s, l) {
  return `hsl(${h}, ${s}%, ${l}%)`;
}

export default function FondantStep(props) {
  const { options } = props;
  const { cake, dispatch } = useCake();
  const isCustom = cake.fondant?.id === "custom";
  const [h, setH] = useState(330);
  const [s, setS] = useState(65);
  const [l, setL] = useState(72);

  function applyCustom(nextH, nextS, nextL) {
    dispatch({
      type: "SET_FONDANT",
      payload: { id: "custom", label: "Custom Color", price: CUSTOM_FONDANT_PRICE, color: hsl(nextH, nextS, nextL) },
    });
  }

  return (
    <div className="pt-2">
      <div className="flex flex-wrap gap-3 mb-6">
        {options.fondants.map((fondant) => (
          <OptionCard
            key={fondant.id}
            label={fondant.label}
            price={fondant.price}
            selected={!isCustom && cake.fondant?.id === fondant.id}
            onClick={() => dispatch({ type: "SET_FONDANT", payload: fondant })}
          >
            {fondant.color ? (
              <div className="w-14 h-14 rounded-2xl shadow-inner" style={{ backgroundColor: fondant.color }} />
            ) : (
              <div className="w-14 h-14 rounded-2xl border-2 border-dashed border-line flex items-center justify-center text-[10px] text-ink-soft text-center">
                buttercream
              </div>
            )}
          </OptionCard>
        ))}
      </div>

      {/* infinite / continuous color picker: three sliders spanning the full
          hue/saturation/lightness spectrum, replacing the old fixed-swatch-only
          picker so any exact custom shade is reachable */}
      <div className={`border p-4 ${isCustom ? "border-ink" : "border-line"}`}>
        <div className="flex items-center justify-between mb-3">
          <p className="tracked text-xs text-ink">Custom Color</p>
          <div
            className="w-10 h-10 rounded-full border border-line shadow-inner"
            style={{ backgroundColor: hsl(h, s, l) }}
          />
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <div className="flex justify-between text-[11px] text-ink-soft mb-1">
              <span>Hue</span>
              <span>{h}&deg;</span>
            </div>
            <input
              type="range"
              min="0"
              max="360"
              value={h}
              onChange={(e) => {
                const v = Number(e.target.value);
                setH(v);
                applyCustom(v, s, l);
              }}
              className="w-full h-3 appearance-none cursor-pointer rounded-full"
              style={{
                background:
                  "linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)",
              }}
            />
          </div>

          <div>
            <div className="flex justify-between text-[11px] text-ink-soft mb-1">
              <span>Saturation</span>
              <span>{s}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={s}
              onChange={(e) => {
                const v = Number(e.target.value);
                setS(v);
                applyCustom(h, v, l);
              }}
              className="w-full h-3 appearance-none cursor-pointer rounded-full"
              style={{ background: `linear-gradient(to right, ${hsl(h, 0, l)}, ${hsl(h, 100, l)})` }}
            />
          </div>

          <div>
            <div className="flex justify-between text-[11px] text-ink-soft mb-1">
              <span>Lightness</span>
              <span>{l}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="95"
              value={l}
              onChange={(e) => {
                const v = Number(e.target.value);
                setL(v);
                applyCustom(h, s, v);
              }}
              className="w-full h-3 appearance-none cursor-pointer rounded-full"
              style={{ background: `linear-gradient(to right, ${hsl(h, s, 10)}, ${hsl(h, s, 50)}, ${hsl(h, s, 95)})` }}
            />
          </div>
        </div>

        <p className="text-[11px] text-ink-soft mt-3">+ Rs {CUSTOM_FONDANT_PRICE} for a custom mixed shade</p>
      </div>
    </div>
  );
}
