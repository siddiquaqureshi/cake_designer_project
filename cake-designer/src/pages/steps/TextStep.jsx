import { useCake } from "../../context/CakeContext";

export default function TextStep(props) {
  const { drawMode, setDrawMode } = props;
  const { cake, dispatch } = useCake();

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
