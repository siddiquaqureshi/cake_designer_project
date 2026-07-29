import { useCake } from "../../context/CakeContext";
import OptionCard from "../../components/OptionCard";

export default function FlavorStep(props) {
  const { options } = props;
  const { cake, dispatch } = useCake();

  return (
    <div className="flex flex-wrap gap-3 pt-2">
      {options.flavors.map((flavor) => (
        <OptionCard
          key={flavor.id}
          label={flavor.label}
          price={flavor.price}
          selected={cake.flavor?.id === flavor.id}
          onClick={() => dispatch({ type: "SET_FLAVOR", payload: flavor })}
        >
          <div
            className="w-14 h-14 rounded-full border-4 border-white shadow-inner"
            style={{ backgroundColor: flavor.color }}
          />
        </OptionCard>
      ))}
    </div>
  );
}
