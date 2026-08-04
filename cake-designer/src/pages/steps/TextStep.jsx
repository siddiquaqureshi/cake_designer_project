import { useState } from "react";
import { useCake } from "../../context/CakeContext";

const PRESET_ICING_COLORS = [
  { id: "maroon", label: "Classic Maroon", color: "#7A2E42" },
  { id: "chocolate", label: "Dark Chocolate", color: "#3B2219" },
  { id: "crimson", label: "Crimson Red", color: "#D92B3A" },
  { id: "pink", label: "Blush Pink", color: "#E8547B" },
  { id: "gold", label: "Royal Gold", color: "#D4AF37" },
  { id: "green", label: "Forest Green", color: "#1B4F2E" },
  { id: "blue", label: "Navy Blue", color: "#1B2A4A" },
  { id: "violet", label: "Deep Violet", color: "#5B2C6F" },
  { id: "black", label: "Midnight Black", color: "#111111" },
  { id: "white", label: "Pure White", color: "#FFFFFF" },
];

function hsl(h, s, l) {
  return `hsl(${h}, ${s}%, ${l}%)`;
}

export default function TextStep(props) {
  const { drawMode, setDrawMode } = props;
  const { cake, dispatch } = useCake();
  const currentColor = cake.text?.color || "#7A2E42";

  const [h, setH] = useState(345);
  const [s, setS] = useState(45);
  const [l, setL] = useState(33);
  const [showCustom, setShowCustom] = useState(false);

  function selectPresetColor(color) {
    setShowCustom(false);
    dispatch({ type: "SET_TEXT_COLOR", payload: color });
  }

  function applyCustomHSL(nextH, nextS, nextL) {
    setShowCustom(true);
    const customColor = hsl(nextH, nextS, nextL);
    dispatch({ type: "SET_TEXT_COLOR", payload: customColor });
  }

  return (
    <div className="pt-2 flex flex-col gap-6">
      <div>
        <label className="tracked text-xs text-ink block mb-2">Type a message</label>
        <input
          type="text"
          maxLength={40}
          value={cake.text.value}
          onChange={(e) => dispatch({ type: "SET_TEXT", payload: e.target.value })}
          placeholder="Happy Birthday!"
          className="w-full px-4 py-3 bg-white border border-line focus:border-ink outline-none transition-colors"
        />
        {cake.text.value && (
          <p className="text-xs text-ink-soft mt-2">
            Drag the text directly on the cake to move it anywhere on the surface.
          </p>
        )}
      </div>

      {/* Text & Drawing Color Picker (Styled like FondantStep) */}
      <div>
        <label className="tracked text-xs text-ink block mb-2">Icing &amp; Draw Color</label>

        {/* Preset Icing Colors */}
        <div className="grid grid-cols-5 gap-2 mb-4">
          {PRESET_ICING_COLORS.map((preset) => {
            const isSelected = !showCustom && currentColor.toLowerCase() === preset.color.toLowerCase();
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => selectPresetColor(preset.color)}
                className={`flex flex-col items-center justify-center p-2 border transition-all ${
                  isSelected ? "border-ink bg-bone shadow-sm" : "border-line bg-white hover:border-ink"
                }`}
                title={preset.label}
              >
                <div
                  className="w-7 h-7 rounded-full shadow-inner border border-line mb-1"
                  style={{
                    backgroundColor: preset.color,
                    boxShadow: preset.color.toLowerCase() === "#ffffff" ? "inset 0 0 0 1px #ccc" : undefined,
                  }}
                />
                <span className="text-[10px] text-ink-soft truncate w-full text-center">{preset.label.split(" ")[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Continuous Custom HSL Color Picker */}
        <div className={`border p-4 transition-colors ${showCustom ? "border-ink bg-bone/30" : "border-line bg-white"}`}>
          <div className="flex items-center justify-between mb-3">
            <p className="tracked text-xs text-ink">Custom Icing Shade</p>
            <div
              className="w-8 h-8 rounded-full border border-line shadow-inner"
              style={{ backgroundColor: currentColor }}
            />
          </div>

          <div className="flex flex-col gap-3">
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
                  applyCustomHSL(v, s, l);
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
                  applyCustomHSL(h, v, l);
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
                  applyCustomHSL(h, s, v);
                }}
                className="w-full h-3 appearance-none cursor-pointer rounded-full"
                style={{ background: `linear-gradient(to right, ${hsl(h, s, 10)}, ${hsl(h, s, 50)}, ${hsl(h, s, 95)})` }}
              />
            </div>
          </div>
        </div>
      </div>

      {cake.text.value && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="tracked text-xs text-ink">Rotate</label>
            <span className="text-xs text-ink-soft">{cake.text.rotation || 0}&deg;</span>
          </div>
          <input
            type="range"
            min="0"
            max="360"
            value={cake.text.rotation || 0}
            onChange={(e) => dispatch({ type: "SET_TEXT_ROTATION", payload: Number(e.target.value) })}
            className="w-full accent-ink"
          />
          <div className="flex justify-between mt-2">
            <button
              type="button"
              onClick={() => dispatch({ type: "SET_TEXT_ROTATION", payload: 0 })}
              className="text-xs tracked text-ink-soft hover:text-ink hover:underline"
            >
              reset angle
            </button>
            <button
              type="button"
              onClick={() => dispatch({ type: "SET_TEXT_POSITION", payload: { x: 50, y: 50 } })}
              className="text-xs tracked text-ink-soft hover:text-ink hover:underline"
            >
              reset position
            </button>
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="tracked text-xs text-ink">Or draw on the cake</label>
          {cake.text.freehandPaths.length > 0 && (
            <button
              onClick={() => dispatch({ type: "SET_FREEHAND", payload: [] })}
              className="text-xs text-ink tracked hover:underline"
            >
              clear
            </button>
          )}
        </div>
        <button
          onClick={() => setDrawMode(!drawMode)}
          className={`w-full py-3.5 tracked text-xs transition-colors border ${
            drawMode ? "bg-ink text-white border-ink" : "bg-white text-ink border-line hover:border-ink"
          }`}
        >
          {drawMode ? "Drawing on cake — tap to stop" : "Start freehand drawing on cake"}
        </button>
        <p className="text-xs text-ink-soft mt-2">
          While drawing mode is on, click and drag directly on the cake in the preview to sketch.
        </p>
      </div>
    </div>
  );
}
