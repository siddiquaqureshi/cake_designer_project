import { useCake } from "../../context/CakeContext";
import OptionCard from "../../components/OptionCard";

export default function ShapeStep(props) {
  const { options } = props;
  const { cake, dispatch } = useCake();
  const shapes = options?.shapes || [];

  return (
    <div className="flex flex-wrap gap-3 pt-2">
      {shapes.map((shape) => (
        <OptionCard
          key={shape.id || shape.label}
          label={shape.label}
          price={shape.price}
          selected={cake.shape?.id === shape.id}
          onClick={() => dispatch({ type: "SET_SHAPE", payload: shape })}
        >
          <div
            className="w-14 h-14 bg-butter"
            style={{ clipPath: shape.clip }}
          />
        </OptionCard>
      ))}
    </div>
  );
}
