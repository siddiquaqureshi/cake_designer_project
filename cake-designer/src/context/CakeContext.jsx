import { createContext, useContext, useReducer } from "react";

const initialCake = {
  shape: null,
  flavor: null,
  layers: null,
  fondant: null,
  frosting: null,
  toppings: [], // [{ toppingId, x, y }]
  text: { value: "", x: 50, y: 50, rotation: 0, freehandPaths: [] }, // x:50, y:50 -> centered on top frosting surface
  candles: [], // [{ candleId, x, y, kind: "candle" | "sparkler" }]
  referenceImage: null, // data URL when the person uploads their own design instead of building one
};

// A reducer (rather than a dozen separate useState hooks) is the right tool
// here because the steps interact: choosing a new shape should clear
// topping/candle placements that no longer make sense, "reset" needs to
// touch every field at once, and every step dispatches actions instead of
// receiving a dozen individual setter props.
function cakeReducer(state, action) {
  switch (action.type) {
    case "SET_SHAPE":
      return { ...state, shape: action.payload, toppings: [], candles: [] };
    case "SET_FLAVOR":
      return { ...state, flavor: action.payload };
    case "SET_LAYERS":
      return { ...state, layers: action.payload };
    case "SET_FONDANT":
      return { ...state, fondant: action.payload };
    case "SET_FROSTING":
      return { ...state, frosting: action.payload ? { finish: "matte", ...action.payload } : null };
    case "SET_FROSTING_FINISH":
      return { ...state, frosting: state.frosting ? { ...state.frosting, finish: action.payload } : state.frosting };

    case "ADD_TOPPING":
      return { ...state, toppings: [...state.toppings, action.payload] };
    case "ADD_TOPPINGS_BULK":
      return { ...state, toppings: [...state.toppings, ...action.payload] };
    case "MOVE_TOPPING":
      return {
        ...state,
        toppings: state.toppings.map((t, i) =>
          i === action.payload.index ? { ...t, x: action.payload.x, y: action.payload.y } : t
        ),
      };
    case "REMOVE_TOPPING":
      return { ...state, toppings: state.toppings.filter((_, i) => i !== action.payload) };

    case "SET_TEXT":
      return { ...state, text: { ...state.text, value: action.payload } };
    case "SET_TEXT_POSITION":
      return { ...state, text: { ...state.text, x: action.payload.x, y: action.payload.y } };
    case "SET_TEXT_ROTATION":
      return { ...state, text: { ...state.text, rotation: action.payload } };
    case "SET_FREEHAND":
      return { ...state, text: { ...state.text, freehandPaths: action.payload } };

    case "ADD_CANDLE":
      return { ...state, candles: [...state.candles, action.payload] };
    case "ADD_CANDLES_BULK":
      return { ...state, candles: [...state.candles, ...action.payload] };
    case "MOVE_CANDLE":
      return {
        ...state,
        candles: state.candles.map((c, i) =>
          i === action.payload.index ? { ...c, x: action.payload.x, y: action.payload.y } : c
        ),
      };
    case "REMOVE_CANDLE":
      return { ...state, candles: state.candles.filter((_, i) => i !== action.payload) };

    case "SET_REFERENCE_IMAGE":
      return { ...state, referenceImage: action.payload };

    case "RESET":
      return initialCake;
    case "LOAD":
      return { ...initialCake, ...action.payload };
    default:
      return state;
  }
}

const CakeContext = createContext(null);

export function CakeProvider({ children }) {
  const [cake, dispatch] = useReducer(cakeReducer, initialCake);
  return <CakeContext.Provider value={{ cake, dispatch }}>{children}</CakeContext.Provider>;
}

export function useCake() {
  const ctx = useContext(CakeContext);
  if (!ctx) throw new Error("useCake must be used inside a CakeProvider");
  return ctx;
}

export { initialCake };
