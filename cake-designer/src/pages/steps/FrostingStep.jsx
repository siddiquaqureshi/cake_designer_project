import { useCake } from "../../context/CakeContext";
import OptionCard from "../../components/OptionCard";

export default function FrostingStep(props) {
  const { options } = props;
  const { cake, dispatch } = useCake();
  const list = options?.frostings || [];

  return (
    <div className="pt-2">
      <p className="text-xs text-ink-soft mb-3">
        Choose your 3D frosting finish. Matte Buttercream offers a soft, rich buttercream texture, Glossy Mirror Glaze creates a continuous reflective sheen, or choose No Frosting for a naked cake.
      </p>
      <div className="flex flex-wrap gap-3">
        {list.map((frosting) => (
          <OptionCard
            key={frosting.id}
            label={frosting.label}
            price={frosting.price}
            selected={cake.frosting?.id === frosting.id}
            onClick={() => dispatch({ type: "SET_FROSTING", payload: frosting })}
          >
            {frosting.image ? (
              <img src={frosting.image} alt={frosting.label} className="w-16 h-16 object-contain" />
            ) : (
              <div className="w-16 h-16 flex items-center justify-center border border-line bg-bone rounded text-xs font-display text-ink-soft">
                Naked
              </div>
            )}
          </OptionCard>
        ))}
      </div>

      {cake.frosting && cake.frosting.id !== "none" && (
        <div className="mt-5">
          <p className="text-xs font-display text-ink-soft mb-2">Frosting Finish</p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => dispatch({ type: "SET_FROSTING_FINISH", payload: "matte" })}
              className={`flex-1 py-2.5 text-xs font-display border transition-colors ${
                (cake.frosting.finish || "matte") === "matte"
                  ? "border-ink bg-ink text-white"
                  : "border-line bg-white text-ink hover:border-ink"
              }`}
            >
              Matte Finish
            </button>
            <button
              type="button"
              onClick={() => dispatch({ type: "SET_FROSTING_FINISH", payload: "glossy" })}
              className={`flex-1 py-2.5 text-xs font-display border transition-colors ${
                cake.frosting.finish === "glossy"
                  ? "border-ink bg-ink text-white"
                  : "border-line bg-white text-ink hover:border-ink"
              }`}
            >
              Glossy Mirror Glaze
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
