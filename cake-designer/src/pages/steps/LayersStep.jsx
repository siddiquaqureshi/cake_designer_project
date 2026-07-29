import { useCake } from "../../context/CakeContext";
import OptionCard from "../../components/OptionCard";

export default function LayersStep(props) {
  const { options } = props;
  const { cake, dispatch } = useCake();

  return (
    <div className="flex flex-wrap gap-3 pt-2">
      {options.layers.map((layer) => (
        <OptionCard
          key={layer.id}
          label={layer.label}
          price={layer.price}
          selected={cake.layers?.id === layer.id}
          onClick={() => dispatch({ type: "SET_LAYERS", payload: layer })}
        >
          <div className="w-14 h-14 flex flex-col-reverse gap-0.5">
            {Array.from({ length: layer.id }).map((_, i) => (
              <div key={i} className="flex-1 bg-butter rounded-sm" />
            ))}
          </div>
        </OptionCard>
      ))}
    </div>
  );
}
