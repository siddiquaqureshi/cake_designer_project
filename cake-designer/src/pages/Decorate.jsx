import { useEffect, useState } from "react";
import { useNavigate, useParams, Navigate } from "react-router-dom";
import { fetchDecorOptions } from "../api/client";
import { STEP_ORDER } from "../data/cakeOptions";
import { useCake } from "../context/CakeContext";
import CakePreview from "../components/CakePreview";
import { priceForCake, formatPKR } from "../utils/pricing";

import ShapeStep from "./steps/ShapeStep";
import FlavorStep from "./steps/FlavorStep";
import LayersStep from "./steps/LayersStep";
import FondantStep from "./steps/FondantStep";
import FrostingStep from "./steps/FrostingStep";
import ToppingsStep from "./steps/ToppingsStep";
import TextStep from "./steps/TextStep";
import CandlesStep from "./steps/CandlesStep";
import RevealStep from "./steps/RevealStep";

const STEP_COMPONENTS = {
  shape: ShapeStep,
  flavor: FlavorStep,
  layers: LayersStep,
  fondant: FondantStep,
  frosting: FrostingStep,
  toppings: ToppingsStep,
  text: TextStep,
  candles: CandlesStep,
  reveal: RevealStep,
};

const STEP_LABELS = {
  shape: "01 / Shape",
  flavor: "02 / Flavor",
  layers: "03 / Layers",
  fondant: "04 / Fondant",
  frosting: "05 / Frosting",
  toppings: "06 / Toppings",
  text: "07 / Message",
  candles: "08 / Candles",
  reveal: "09 / Reveal",
};

export default function Decorate() {
  const { step } = useParams();
  const navigate = useNavigate();
  const { cake, dispatch } = useCake();

  const [options, setOptions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [armedTopping, setArmedTopping] = useState(null);
  const [drawMode, setDrawMode] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    async function load() {
      try {
        const data = await fetchDecorOptions();
        if (!cancelled) setOptions(data);
      } catch (err) {
        if (!cancelled) setError("Couldn't load decorating options. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();

    return () => {
      cancelled = true; // cleanup: ignore a late response if this unmounts first
    };
  }, []);

  if (!STEP_ORDER.includes(step)) {
    return <Navigate to="/decorate/shape" replace />;
  }

  const stepIndex = STEP_ORDER.indexOf(step);
  const canGoNext = isStepSatisfied(step, cake);
  const StepPanel = STEP_COMPONENTS[step];

  function goTo(delta) {
    const next = STEP_ORDER[stepIndex + delta];
    if (next) navigate(`/decorate/${next}`);
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] pt-24 flex items-center justify-center">
        <p className="font-display tracked text-sm text-ink-soft animate-pulse">Preheating the oven&hellip;</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[70vh] pt-24 flex flex-col items-center justify-center gap-4">
        <p className="text-ink">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-ink text-white tracked text-xs hover:bg-black transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] pt-24 flex flex-col">
      {/* step progress */}
      <div className="px-4 sm:px-8 pt-4 flex gap-1 overflow-x-auto">
        {STEP_ORDER.map((s, i) => (
          <div
            key={s}
            className={`h-[3px] flex-1 min-w-8 transition-colors ${i <= stepIndex ? "bg-ink" : "bg-line"}`}
          />
        ))}
      </div>

      {step === "reveal" ? (
        <RevealStep />
      ) : (
      <div className="flex-1 grid lg:grid-cols-[1fr_minmax(280px,420px)] gap-px bg-line mt-6 mx-4 sm:mx-8 mb-8 border border-line">
        {/* live cake stage */}
        <div className="order-2 lg:order-1 flex flex-col items-center justify-center shelf-bg py-10 bg-bone">
          <CakePreview
            cake={cake}
            options={options}
            armedTopping={armedTopping}
            drawMode={drawMode}
            onAddPath={(path) =>
              dispatch({ type: "SET_FREEHAND", payload: [...cake.text.freehandPaths, path] })
            }
            onDropTopping={(toppingId, x, y) => dispatch({ type: "ADD_TOPPING", payload: { toppingId, x, y } })}
            onPlaceArmed={(x, y) => {
              dispatch({ type: "ADD_TOPPING", payload: { toppingId: armedTopping, x, y } });
              setArmedTopping(null);
            }}
            onMoveTopping={(index, x, y) => dispatch({ type: "MOVE_TOPPING", payload: { index, x, y } })}
            onMoveCandle={(index, x, y) => dispatch({ type: "MOVE_CANDLE", payload: { index, x, y } })}
            onMoveText={(x, y) => dispatch({ type: "SET_TEXT_POSITION", payload: { x, y } })}
          />
          <p className="mt-4 tracked text-sm text-ink">
            {formatPKR(priceForCake(cake, options))} so far
          </p>
        </div>

        {/* step panel */}
        <div className="order-1 lg:order-2 bg-white p-5 sm:p-6 flex flex-col">
          <h2 className="font-display tracked text-sm text-ink-soft mb-3 pb-3 border-b border-line">
            {STEP_LABELS[step]}
          </h2>
          <div className="flex-1 overflow-y-auto pr-1 -mr-1">
            <StepPanel
              options={options}
              armedTopping={armedTopping}
              setArmedTopping={setArmedTopping}
              drawMode={drawMode}
              setDrawMode={setDrawMode}
            />
          </div>

          <div className="flex items-center justify-between pt-4 mt-2 border-t border-line">
            <button
              onClick={() => goTo(-1)}
              disabled={stepIndex === 0}
              className="px-4 py-2 tracked text-xs text-ink disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-60 transition-opacity"
            >
              &larr; Back
            </button>
            {step !== "reveal" && (
              <button
                onClick={() => goTo(1)}
                disabled={!canGoNext}
                className="px-7 py-3 tracked text-xs text-white bg-ink hover:bg-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                {STEP_ORDER[stepIndex + 1] === "reveal" ? "Finish Cake" : "Next"}
              </button>
            )}
          </div>
        </div>
      </div>
      )}
    </div>
  );
}

function isStepSatisfied(step, cake) {
  switch (step) {
    case "shape":
      return !!cake.shape;
    case "flavor":
      return !!cake.flavor;
    case "layers":
      return !!cake.layers;
    case "fondant":
      return !!cake.fondant;
    case "frosting":
      return !!cake.frosting;
    default:
      return true; // toppings/text/candles are optional flourishes
  }
}
